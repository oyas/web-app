package main

import (
	"context"
	"fmt"
	"net"

	db "auth/database"
	jwksserver "auth/jwksServer"
	"auth/service"
	"common/auth"
	"common/log"
	"common/client"
	"common/trace"
	"common/utils"
	pb "protos/auth"


	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

const (
	port           = ":50054"
	ServiceName    = "auth"
	Environment    = "dev"
	APP_JAEGER_URL = "APP_JAEGER_URL"
)

func main() {
	// init zap logger
	defer log.Shutdown()

	// init redis client
	db.Database.Init()

	// init openTelemetry
	jaegerUrl := fmt.Sprintf(
		"%s/api/traces",
		utils.GetEnv(APP_JAEGER_URL, "http://localhost:14268"),
	)
	log.Infof("jaegerUrl: %v\n", jaegerUrl)
	tp, err := trace.Setup(jaegerUrl, ServiceName, Environment)
	if err != nil {
		log.Fatal(err)
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	defer trace.Shutdown(ctx, tp)

	// init http client
	client.Setup()

	// init JWT parser
	auth.SetParser(auth.Parser{
		JwksUrl: "https://oyas.jp.auth0.com/.well-known/jwks.json",
		Aud:     "https://localhost:4000/graphql",
		Iss:     "https://oyas.jp.auth0.com/",
	})

	// start jwks server
	go jwksserver.StartEchoServer()

	// init grpc server
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Panicf("failed to listen: %v", err)
	}
	s := grpc.NewServer(
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(log.L()),
			trace.GrpcMiddlewareTraceFieldsIntoLogger,
			otelgrpc.UnaryServerInterceptor(),
			grpc_auth.UnaryServerInterceptor(auth.VerifyAccessToken),
		),
	)
	pb.RegisterAuthServer(s, &service.Server{})
	log.Infof("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Panicf("failed to serve: %v", err)
	}
}

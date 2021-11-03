package main

import (
	"common/auth"
	"common/client"
	"common/trace"
	"common/utils"
	"context"
	"fmt"
	"net"

	"go.uber.org/zap"

	db "articles/database"
	"articles/service"
	pb "protos/articles"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

const (
	port           = ":50052"
	ServiceName    = "articles"
	Environment    = "dev"
	APP_JAEGER_URL = "APP_JAEGER_URL"
)

func main() {
	// init zap logger
	logger, err := zap.NewProduction()
	if err != nil {
		panic(fmt.Errorf("can't initialize zap logger: %w", err))
	}
	defer logger.Sync() // flushes buffer, if any
	log := logger.Sugar()

	undo := zap.ReplaceGlobals(logger)
	defer undo()

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

	// init grpc server
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer(
		grpc_middleware.WithUnaryServerChain(
			grpc_ctxtags.UnaryServerInterceptor(
				grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor),
			),
			grpc_zap.UnaryServerInterceptor(logger),
			otelgrpc.UnaryServerInterceptor(),
			trace.GrpcMiddlewareTraceFieldsIntoLogger,
			grpc_auth.UnaryServerInterceptor(auth.VerifyAccessToken),
		),
	)
	pb.RegisterArticlesServer(s, &service.Server{})
	log.Infof("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

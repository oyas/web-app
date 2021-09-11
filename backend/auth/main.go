package main

import (
	"context"
	"fmt"
	"net"
	"os"

	"auth/auth"
	"auth/client"
	db "auth/database"
	"auth/service"
	"auth/trace"
	pb "protos/auth"

	"go.uber.org/zap"

	"google.golang.org/grpc"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/metadata"
	"google.golang.org/grpc/status"
)

const (
	port           = ":50054"
	ServiceName    = "auth"
	Environment    = "dev"
	APP_JAEGER_URL = "APP_JAEGER_URL"
)

var (
	errMissingMetadata = status.Errorf(codes.InvalidArgument, "missing metadata")
)

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

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
	jaegerUrl := fmt.Sprintf("%s/api/traces", getEnv(APP_JAEGER_URL, "http://localhost:14268"))
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
			grpc_ctxtags.UnaryServerInterceptor(grpc_ctxtags.WithFieldExtractor(grpc_ctxtags.CodeGenRequestFieldExtractor)),
			grpc_zap.UnaryServerInterceptor(logger),
			addTraceFieldsIntoLogger,
			otelgrpc.UnaryServerInterceptor(),
			grpc_auth.UnaryServerInterceptor(auth.VerifyAccessToken),
		),
	)
	pb.RegisterAuthServer(s, &service.Server{})
	log.Infof("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

func addTraceFieldsIntoLogger(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errMissingMetadata
	}
	zap.L().Sugar().Infof("metadata: %v\n", md)
	ctxzap.AddFields(
		ctx,
		zap.String("traceparent", getFirst(md, "traceparent")),
		zap.String("tracestate", getFirst(md, "tracestate")),
	)
	return handler(ctx, req)
}

func getFirst(md metadata.MD, k string) string {
	arr := md.Get(k)
	if len(arr) > 0 {
		return arr[0]
	}
	return ""
}

package main

import (
	"context"
	"fmt"
	"log"
	"net"
	"os"

	"auth/auth"
	"auth/client"
	db "auth/database"
	"auth/service"
	"auth/trace"
	pb "protos/auth"

	"google.golang.org/grpc"

	"github.com/grpc-ecosystem/go-grpc-middleware"
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
	// init redis client
	db.Database.Init()

	// init openTelemetry
	jaegerUrl := fmt.Sprintf("%s/api/traces", getEnv(APP_JAEGER_URL, "http://localhost:14268"))
	fmt.Printf("jaegerUrl: %v\n", jaegerUrl)
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
		grpc.UnaryInterceptor(grpc_middleware.ChainUnaryServer(
			otelgrpc.UnaryServerInterceptor(),
			showMD,
			grpc_auth.UnaryServerInterceptor(auth.VerifyAccessToken),
		)),
	)
	pb.RegisterAuthServer(s, &service.Server{})
	log.Printf("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

func showMD(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, errMissingMetadata
	}
	log.Printf("metadata: %v", md)
	return handler(ctx, req)
}

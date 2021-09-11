package main

import (
	"context"
	"fmt"
	"net"
	"os"
	"time"

	"go.uber.org/zap"

	db "articles/database"
	"articles/service"
	pb "protos/articles"

	grpc_middleware "github.com/grpc-ecosystem/go-grpc-middleware"
	grpc_zap "github.com/grpc-ecosystem/go-grpc-middleware/logging/zap"
	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
	grpc_ctxtags "github.com/grpc-ecosystem/go-grpc-middleware/tags"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"

	"go.opentelemetry.io/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/exporters/trace/jaeger"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	tracesdk "go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/semconv"

	"go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

const (
	port           = ":50052"
	ServiceName    = "articles"
	Environment    = "dev"
	APP_JAEGER_URL = "APP_JAEGER_URL"
)

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

func tracerProvider(url string) (*tracesdk.TracerProvider, error) {
	// Create the Jaeger exporter
	exp, err := jaeger.NewRawExporter(jaeger.WithCollectorEndpoint(jaeger.WithEndpoint(url)))
	if err != nil {
		return nil, err
	}
	tp := tracesdk.NewTracerProvider(
		// Always be sure to batch in production.
		tracesdk.WithBatcher(exp),
		// Record information about this application in an Resource.
		tracesdk.WithResource(resource.NewWithAttributes(
			semconv.ServiceNameKey.String(ServiceName),
			attribute.String("environment", Environment),
		)),
	)
	return tp, nil
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
	log.Info(jaegerUrl)
	tp, err := tracerProvider(jaegerUrl)
	if err != nil {
		log.Fatal(err)
	}
	otel.SetTracerProvider(tp)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(propagation.TraceContext{}, propagation.Baggage{}))

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Cleanly shutdown and flush telemetry when the application exits.
	defer func(ctx context.Context) {
		// Do not make the application hang when it is shutdown.
		ctx, cancel = context.WithTimeout(ctx, time.Second*5)
		defer cancel()
		if err := tp.Shutdown(ctx); err != nil {
			log.Fatal(err)
		}
	}(ctx)

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
			addTraceFieldsIntoLogger,
		),
	)
	pb.RegisterArticlesServer(s, &service.Server{})
	log.Infof("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

func addTraceFieldsIntoLogger(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, fmt.Errorf("metadata.FromIncomingContext() failed")
	}
	zap.L().Sugar().Debugf("metadata: %v\n", md)
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

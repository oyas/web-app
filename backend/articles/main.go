package main

import (
    "context"
    "log"
    "net"
    "time"
    "fmt"
    "os"

    db "articles/database"
    "articles/service"
    pb "protos/articles"

    "google.golang.org/grpc"

    "go.opentelemetry.io/otel"

    "go.opentelemetry.io/otel/attribute"
    "go.opentelemetry.io/otel/exporters/trace/jaeger"
    "go.opentelemetry.io/otel/sdk/resource"
    tracesdk "go.opentelemetry.io/otel/sdk/trace"
    "go.opentelemetry.io/otel/semconv"
    "go.opentelemetry.io/otel/propagation"

    "go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc"
)

const (
    port        = ":50052"
    ServiceName = "articles"
    Environment = "dev"
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
    // init redis client
    db.Database.Init()

    // init openTelemetry
    jaegerUrl := fmt.Sprintf("%s/api/traces", getEnv(APP_JAEGER_URL, "http://localhost:14268"))
    fmt.Printf("%v\n", jaegerUrl)
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
        grpc.UnaryInterceptor(otelgrpc.UnaryServerInterceptor()),
    )
    pb.RegisterArticlesServer(s, &service.Server{})
    log.Printf("Start server at port %v", port)
    if err := s.Serve(lis); err != nil {
        log.Fatalf("failed to serve: %v", err)
    }
}

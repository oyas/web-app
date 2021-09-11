module articles

go 1.15

require (
	github.com/go-redis/redis/v8 v8.10.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.20.0
	go.opentelemetry.io/otel v0.20.0
	go.opentelemetry.io/otel/exporters/trace/jaeger v0.20.0
	go.opentelemetry.io/otel/sdk v0.20.0
	go.uber.org/zap v1.19.1
	golang.org/x/text v0.3.4 // indirect
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
	google.golang.org/grpc v1.37.0
	google.golang.org/protobuf v1.26.0
	protos v0.0.0
)

replace protos => ../protos

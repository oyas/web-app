module common

go 1.15

require (
	github.com/golang-jwt/jwt/v4 v4.1.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/patrickmn/go-cache v2.1.0+incompatible
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.24.0
	go.opentelemetry.io/otel v1.0.1
	go.opentelemetry.io/otel/exporters/jaeger v1.0.1
	go.opentelemetry.io/otel/sdk v1.0.1
	go.uber.org/zap v1.19.1
	google.golang.org/grpc v1.41.0
)

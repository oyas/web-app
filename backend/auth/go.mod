module auth

go 1.15

require (
	common v0.0.0
	github.com/go-redis/redis/v8 v8.10.0
	github.com/golang-jwt/jwt/v4 v4.1.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/labstack/echo/v4 v4.6.1
	github.com/patrickmn/go-cache v2.1.0+incompatible // indirect
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.26.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.26.0 // indirect
	go.opentelemetry.io/otel v1.1.0 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.1.0 // indirect
	go.opentelemetry.io/otel/sdk v1.1.0 // indirect
	go.uber.org/zap v1.19.1
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
	google.golang.org/grpc v1.41.0
	protos v0.0.0
)

replace protos => ../protos

replace common => ../common

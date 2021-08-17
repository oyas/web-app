module auth

go 1.15

require (
	github.com/go-redis/redis/v8 v8.10.0
	github.com/golang-jwt/jwt/v4 v4.0.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	github.com/patrickmn/go-cache v2.1.0+incompatible
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.22.0
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.22.0
	go.opentelemetry.io/otel v1.0.0-RC2
	go.opentelemetry.io/otel/exporters/jaeger v1.0.0-RC2
	go.opentelemetry.io/otel/sdk v1.0.0-RC2
	golang.org/x/text v0.3.4 // indirect
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
	google.golang.org/grpc v1.39.0
	protos v0.0.0
)

replace protos => ../protos

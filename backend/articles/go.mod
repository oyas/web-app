module articles

go 1.17

replace protos => ../protos

replace common => ../common

require (
	common v0.0.0
	github.com/go-redis/redis/v8 v8.10.0
	github.com/grpc-ecosystem/go-grpc-middleware v1.3.0
	go.opentelemetry.io/contrib/instrumentation/google.golang.org/grpc/otelgrpc v0.26.0
	go.opentelemetry.io/otel v1.1.0
	go.uber.org/zap v1.19.1
	google.golang.org/grpc v1.41.0
	google.golang.org/protobuf v1.26.0
	protos v0.0.0
)

require (
	github.com/cespare/xxhash/v2 v2.1.1 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/felixge/httpsnoop v1.0.2 // indirect
	github.com/golang-jwt/jwt/v4 v4.1.0 // indirect
	github.com/golang/protobuf v1.5.2 // indirect
	github.com/patrickmn/go-cache v2.1.0+incompatible // indirect
	go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp v0.24.0 // indirect
	go.opentelemetry.io/otel/exporters/jaeger v1.1.0 // indirect
	go.opentelemetry.io/otel/internal/metric v0.23.0 // indirect
	go.opentelemetry.io/otel/metric v0.23.0 // indirect
	go.opentelemetry.io/otel/sdk v1.1.0 // indirect
	go.opentelemetry.io/otel/trace v1.1.0 // indirect
	go.uber.org/atomic v1.7.0 // indirect
	go.uber.org/multierr v1.6.0 // indirect
	golang.org/x/net v0.0.0-20210405180319-a5a99cb37ef4 // indirect
	golang.org/x/sys v0.1.0 // indirect
	golang.org/x/text v0.3.4 // indirect
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
)

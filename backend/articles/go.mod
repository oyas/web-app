module articles

go 1.15

require (
	github.com/go-redis/redis/v8 v8.4.4
	github.com/golang/protobuf v1.4.3 // indirect
	golang.org/x/sys v0.0.0-20201109165425-215b40eba54c // indirect
	golang.org/x/text v0.3.4 // indirect
	google.golang.org/genproto v0.0.0-20201110150050-8816d57aaa9a // indirect
	google.golang.org/grpc v1.33.2
	google.golang.org/protobuf v1.25.0
	protos v0.0.0
)

replace protos => ../protos

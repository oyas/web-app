package service

import (
	"context"
	"google.golang.org/grpc"
	"google.golang.org/grpc/test/bufconn"
	"log"
	"net"
	pb "protos/auth"
	"testing"
)

// https://stackoverflow.com/questions/42102496/testing-a-grpc-service

const bufSize = 1024 * 1024

var lis *bufconn.Listener

func init() {
	lis = bufconn.Listen(bufSize)
	s := grpc.NewServer()
	pb.RegisterAuthServer(s, &Server{})
	go func() {
		if err := s.Serve(lis); err != nil {
			log.Fatalf("Server exited with error: %v", err)
		}
	}()
}

func bufDialer(context.Context, string) (net.Conn, error) {
	return lis.Dial()
}

func TestExchangeFail(t *testing.T) {
	ctx := context.Background()
	conn, err := grpc.DialContext(ctx, "bufnet", grpc.WithContextDialer(bufDialer), grpc.WithInsecure())
	if err != nil {
		t.Fatalf("Failed to dial bufnet: %v", err)
	}
	defer conn.Close()
	client := pb.NewAuthClient(conn)
	resp, err := client.Exchange(ctx, &pb.ExchangeRequest{})
	if err != nil {
		log.Printf("Expected result. (Exchange failed: %v)", err)
	} else {
		t.Fatalf("Not expected result. Response: %+v", resp)
	}
}

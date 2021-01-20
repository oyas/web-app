package main

import (
	"log"
	"net"

	db "articles/database"
	"articles/service"
	pb "protos/articles"
	"google.golang.org/grpc"
)

const (
	port = ":50052"
)

func main() {
	// init redis client
	db.Database.Init()

	// init grpc server
	lis, err := net.Listen("tcp", port)
	if err != nil {
		log.Fatalf("failed to listen: %v", err)
	}
	s := grpc.NewServer()
	pb.RegisterArticlesServer(s, &service.Server{})
	log.Printf("Start server at port %v", port)
	if err := s.Serve(lis); err != nil {
		log.Fatalf("failed to serve: %v", err)
	}
}

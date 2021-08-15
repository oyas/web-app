package service

import (
	"context"
	"log"
	"strconv"

	"auth/auth"
	db "auth/database"
	pb "protos/auth"
)

type Server struct {
	pb.UnimplementedAuthServer
}

func (s *Server) Exchange(ctx context.Context, in *pb.ExchangeRequest) (*pb.ExchangeResponse, error) {
	log.Printf("Received: %v", in)

	user, err := auth.UserFromContext(ctx)
	if err != nil {
		return nil, err
	}
	log.Printf("User: %v", user)

	num, err := db.Database.NextNumber(ctx)
	if err != nil {
		log.Printf("error: %v", err)
		return nil, err
	}

	var newToken = "xxx" + strconv.Itoa(num)

	response := &pb.ExchangeResponse{
		Token: newToken,
	}
	return response, nil
}

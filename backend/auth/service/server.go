package service

import (
	"context"
	"strconv"

	db "auth/database"
	"auth/sign"
	"common/auth"
	pb "protos/auth"

	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
)

type Server struct {
	pb.UnimplementedAuthServer
}

func (s *Server) Exchange(ctx context.Context, in *pb.ExchangeRequest) (*pb.ExchangeResponse, error) {
	logger := ctxzap.Extract(ctx).Sugar()
	logger.Infof("Received: %v", in)

	user, err := auth.UserFromContext(ctx)
	if err != nil {
		return nil, err
	}
	logger.Infof("User: %v", user)

	num, err := db.Database.NextNumber(ctx)
	if err != nil {
		logger.Infof("error: %v", err)
		return nil, err
	}

	userKey := "xxx" + strconv.Itoa(num)
	newToken, err := sign.Sign(&sign.TokenData{Sub: userKey})
	if err != nil {
		logger.Infof("sign error: %v", err)
		return nil, err
	}

	response := &pb.ExchangeResponse{
		Token: newToken,
	}
	return response, nil
}

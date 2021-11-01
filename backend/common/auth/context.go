package auth

import (
	"context"
	"errors"

	"github.com/golang-jwt/jwt/v4"
	grpc_auth "github.com/grpc-ecosystem/go-grpc-middleware/auth"
	"go.uber.org/zap"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"
)

var (
	errUnauthorized = status.Errorf(codes.Unauthenticated, "unauthorized")
)

type User struct {
	UserId string `json:"userId"`
	Scope  string `json:"scope"`
}

type contextAuthKey string

const userKey = contextAuthKey("user")

var p Parser = DefaultParser

func SetParser(parser Parser) {
	p = parser
}

func VerifyAccessToken(ctx context.Context) (context.Context, error) {
	logger := zap.L().Sugar()
	tokenString, err := grpc_auth.AuthFromMD(ctx, "Bearer")
	if err != nil {
		return nil, err
	}
	token, err := p.Parse(ctx, tokenString)
	if err != nil {
		logger.Infof("Token validation failed: %v", err)
		return nil, errUnauthorized
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errUnauthorized
	}
	user := User{
		UserId: claims["sub"].(string),
		Scope:  claims["scope"].(string),
	}
	logger.Infof("authorization success! user: %v, token: %v", user, token.Claims)
	return context.WithValue(ctx, userKey, user), nil
}

func UserFromContext(ctx context.Context) (*User, error) {
	v := ctx.Value(userKey)
	user, ok := v.(User)
	if !ok {
		return nil, errors.New("user not found")
	}
	return &user, nil
}

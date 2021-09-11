package database

import (
	"context"
	"os"

	"github.com/go-redis/redis/v8"
	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
)

var redisOptions = &redis.Options{
	Addr:     getEnv("APP_REDIS_URL", "localhost:6379"),
	Password: "", // no password set
	DB:       0,  // use default DB
}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

type Redis struct {
	client *redis.Client
}

func (r *Redis) Init() {
	r.client = redis.NewClient(redisOptions)
}

func (r *Redis) NextNumber(ctx context.Context) (int, error) {
	logger := ctxzap.Extract(ctx).Sugar()
	val, err := r.client.Incr(ctx, "number").Result()
	logger.Info(val)
	return int(val), err
}

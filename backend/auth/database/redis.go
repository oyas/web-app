package database

import (
	"common/utils"
	"context"

	"github.com/go-redis/redis/v8"
	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
)

var redisOptions = &redis.Options{
	Addr:     utils.GetEnv("APP_REDIS_URL", "localhost:6379"),
	Password: "", // no password set
	DB:       0,  // use default DB
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

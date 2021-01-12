package database

import (
	"context"
	"github.com/go-redis/redis/v8"
	"log"
)

var redisOptions = &redis.Options{
	Addr:     "redis-articles:6379",  // defined at docker-compose.yaml
	Password: "",  // no password set
	DB:       0, // use default DB
}

type Redis struct {
	client *redis.Client
}

func (r *Redis) Init() {
	r.client = redis.NewClient(redisOptions)
}

func (r *Redis) NextNumber(ctx context.Context) (int, error) {
	val, err := r.client.Incr(ctx, "number").Result()
	log.Println(val)
	return int(val), err
}

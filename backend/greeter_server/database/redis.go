package database

import (
	"context"
	"github.com/go-redis/redis/v8"
	"log"
)

const (
	address  = "localhost:6379"
	password = "" // no password set
)

type Redis struct {
	client *redis.Client
}

func (r *Redis) Init() {
	r.client = redis.NewClient(&redis.Options{
		Addr:     address,
		Password: password,
		DB:       0, // use default DB
	})
}

func (r *Redis) NextNumber(ctx context.Context) (int, error) {
	val, err := r.client.Incr(ctx, "number").Result()
	log.Println(val)
	return int(val), err
}

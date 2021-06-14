package service

import (
	"context"
	"log"
	"strconv"

	db "articles/database"
	pb "protos/articles"

	"google.golang.org/protobuf/proto"

	"go.opentelemetry.io/otel"
)

type Server struct {
	pb.UnimplementedArticlesServer
}

var tracer = otel.Tracer("server")

var articles = []*pb.Article{
	&pb.Article{
		Id:      "0",
		Created: 0,
		UserId:  "",
		Digest:  "digest",
	},
}

func (s *Server) Get(ctx context.Context, in *pb.GetRequest) (*pb.GetResponse, error) {
	_, span := tracer.Start(ctx, "Get")
	defer span.End()

	log.Printf("Received: %v", in)
	d := []byte("")
	response := &pb.GetResponse{}
	if err := proto.Unmarshal(d, response); err != nil {
		log.Fatalln("Failed to unmarshal:", err)
	}
	return response, nil
}

func (s *Server) GetArticles(
	ctx context.Context,
	in *pb.GetArticlesRequest,
) (*pb.GetArticlesResponse, error) {
	_, span := tracer.Start(ctx, "GetArticles")
	defer span.End()

	log.Printf("Received: %v", in)
	response := &pb.GetArticlesResponse{Articles: articles}
	return response, nil
}

func (s *Server) Post(ctx context.Context, in *pb.PostRequest) (*pb.PostResponse, error) {
	_, span := tracer.Start(ctx, "Post")
	defer span.End()

	log.Printf("Received: %v", in)
	article := &pb.Article{
		Id:      nextNumber(ctx),
		Created: 0,
		UserId:  in.GetUserId(),
		Digest:  in.GetDigest(),
	}
	articles = append(articles, article)
	response := &pb.PostResponse{Article: article}
	return response, nil
}

func nextNumber(ctx context.Context) string {
	data, err := db.Database.NextNumber(ctx)
	if err != nil {
		panic(err)
	}
	return strconv.Itoa(data)
}

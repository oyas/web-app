package trace

import (
	"context"
	"fmt"

	"github.com/grpc-ecosystem/go-grpc-middleware/logging/zap/ctxzap"
	"go.uber.org/zap"
	"google.golang.org/grpc"
	"google.golang.org/grpc/metadata"
)

func GrpcMiddlewareTraceFieldsIntoLogger(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	md, ok := metadata.FromIncomingContext(ctx)
	if !ok {
		return nil, fmt.Errorf("metadata.FromIncomingContext() failed")
	}
	zap.L().Sugar().Infof("metadata: %v\n", md)
	ctxzap.AddFields(
		ctx,
		zap.String("traceparent", getFirst(md, "traceparent")),
		zap.String("tracestate", getFirst(md, "tracestate")),
	)
	return handler(ctx, req)
}

func getFirst(md metadata.MD, k string) string {
	arr := md.Get(k)
	if len(arr) > 0 {
		return arr[0]
	}
	return ""
}

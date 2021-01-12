#!/bin/bash

cd `dirname $0`

PROTOC="docker run -v $(pwd):/protos --rm oyas/protoc protoc"
PROTOC_GO="$PROTOC --go_out=. --go_opt=paths=source_relative --go-grpc_out=. --go-grpc_opt=paths=source_relative"

$PROTOC_GO helloworld/helloworld.proto
$PROTOC_GO articles/articles.proto

#!/bin/bash

OUTPUT="."

NPM_BIN=`npm bin`

GRPC_TOOL=${NPM_BIN}/grpc_tools_node_protoc

PROTOC_NODE="$GRPC_TOOL --js_out=import_style=commonjs,binary:$OUTPUT --grpc_out=grpc_js:$OUTPUT -I ../protos"

$PROTOC_NODE ../protos/articles/articles.proto

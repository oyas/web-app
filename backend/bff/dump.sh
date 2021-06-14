#!/bin/bash

#
# https://github.com/bradleyjkemp/grpc-tools
#

grpc-dump --port=55052 --destination=localhost:50052 --log_level=debug | jq

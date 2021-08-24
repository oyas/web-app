#!/bin/bash

cd `dirname $0`

export SIGNING_KEY_PATH="$(pwd)/keys/app.rsa"

if [[ ! -e $SIGNING_KEY_PATH ]]; then
	bash ./keys/generate.sh
fi

CGO_ENABLED=0 go test -v ./...

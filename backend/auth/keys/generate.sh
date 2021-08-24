#!/bin/bash

cd `dirname $0`

RSA_NAME=app.rsa
RSA_PUB_NAME=app.rsa.pub
MOUNT_DIR=/tmp/keys
USE_DOCKER=false

if (type "openssl" > /dev/null 2>&1); then
    if [[ $1 == "--use-docker" ]]; then
        USE_DOCKER=true
    else
        MOUNT_DIR=.
    fi
else
    USE_DOCKER=true
fi

RSA_PATH=$MOUNT_DIR/$RSA_NAME
RSA_PUB_PATH=$MOUNT_DIR/$RSA_PUB_NAME

touch $RSA_NAME
touch $RSA_PUB_NAME

CMD="
    openssl genrsa -out $RSA_PATH 2048 &&
    openssl rsa -in $RSA_PATH -pubout -out $RSA_PUB_PATH
"

if [[ $USE_DOCKER == "false" ]]; then
    echo "openssl found! Using local openssl command."
    bash -c "$CMD"
else
    docker run --rm -v $(pwd):$MOUNT_DIR alpine sh -c "apk add --no-cache openssl && $CMD"
fi

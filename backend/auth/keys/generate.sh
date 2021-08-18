#!/bin/bash

cd `dirname $0`

RSA_NAME=app.rsa
RSA_PUB_NAME=app.rsa.pub
MOUNT_DIR=/tmp/keys
RSA_PATH=$MOUNT_DIR/$RSA_NAME
RSA_PUB_PATH=$MOUNT_DIR/$RSA_PUB_NAME

touch $RSA_NAME
touch $RSA_PUB_NAME

CMD="
  apt-get update &&
  apt-get install -y openssl &&
  openssl genrsa -out $RSA_PATH 2048 &&
  openssl rsa -in $RSA_PATH -pubout -out $RSA_PUB_PATH
"

docker run --rm -v $(pwd):$MOUNT_DIR ubuntu bash -c "$CMD"

#!/bin/bash

cd `dirname $0`

RSA_NAME=rsa.pem
#RSA_PUB_NAME=app.rsa.pub
#CERT_NAME=certificate.pem
MOUNT_DIR=/tmp/keys
USE_DOCKER=false
#SUBJECT=${1:-"/CN=client.example.com"}

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
#RSA_PUB_PATH=$MOUNT_DIR/$RSA_PUB_NAME
#CERT_PATH=$MOUNT_DIR/$CERT_NAME

touch $RSA_NAME
#touch $RSA_PUB_NAME

CMD="
    openssl genrsa -out $RSA_PATH 2048
#    openssl rsa -in $RSA_PATH -pubout -out $RSA_PUB_PATH
#    openssl req -x509 -key $RSA_PATH -subj $SUBJECT > $CERT_PATH
"

if [[ $USE_DOCKER == "false" ]]; then
    echo "openssl found! Using local openssl command."
    bash -c "$CMD"
else
    docker run --rm -v $(pwd):$MOUNT_DIR alpine sh -c "apk add --no-cache openssl && $CMD"
fi

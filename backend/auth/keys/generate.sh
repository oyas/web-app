#!/bin/bash

cd `dirname $0`

openssl genrsa -out app.rsa 2048
openssl rsa -in app.rsa -pubout > app.rsa.pub
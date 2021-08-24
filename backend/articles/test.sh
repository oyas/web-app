#!/bin/bash

cd `dirname $0`

CGO_ENABLED=0 go test -v ./...

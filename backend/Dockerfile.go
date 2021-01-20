FROM golang:1.15.6-alpine as builder

ARG SERVICE_NAME="greeter_server"

COPY ./protos /go/src/protos
COPY ./${SERVICE_NAME} /go/src/${SERVICE_NAME}

WORKDIR /go/src/${SERVICE_NAME}

RUN CGO_ENABLED=0 go build -v -o /go/bin/main


FROM builder as test

RUN CGO_ENABLED=0 go test -v ./...


FROM scratch as app

COPY --from=builder /go/bin/main /app/main

ENTRYPOINT ["/app/main"]
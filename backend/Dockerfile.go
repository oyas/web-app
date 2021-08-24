FROM golang:1.15.6-alpine as builder

ARG SERVICE_NAME="greeter_server"

RUN apk add --no-cache openssl bash ca-certificates && update-ca-certificates

COPY ./protos /go/src/protos
COPY ./${SERVICE_NAME} /go/src/${SERVICE_NAME}

WORKDIR /go/src/${SERVICE_NAME}

RUN CGO_ENABLED=0 go build -v -o /go/bin/main


FROM scratch as app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /go/bin/main /app/main

ENTRYPOINT ["/app/main"]


FROM builder as test

RUN bash ./test.sh

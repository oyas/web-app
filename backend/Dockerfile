FROM golang:1.15.6-alpine as go-builder

ARG SERVICE_NAME="greeter_server"

# RUN apk update && apk add git

ADD . /go/src

WORKDIR /go/src/${SERVICE_NAME}

RUN CGO_ENABLED=0 go build -v -o /go/bin/main


FROM scratch as go-app

COPY --from=go-builder /go/bin/main /app/main

ENTRYPOINT ["/app/main"]
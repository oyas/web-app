package client

import (
	"net/http"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

var Http *http.Client

func Setup() {
	Http = &http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}
}

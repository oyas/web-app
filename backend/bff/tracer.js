'use strict';

const api = require('@opentelemetry/api');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { NodeTracerProvider } = require('@opentelemetry/node');
const { SimpleSpanProcessor } = require('@opentelemetry/tracing');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { Resource } = require('@opentelemetry/resources');


const APP_JAEGER_URL = process.env.APP_JAEGER_URL || "http://localhost:14268"

module.exports = (serviceName, tracerName="") => {
  const provider = new NodeTracerProvider({
    resource: new Resource({ "service.name": serviceName }),
  })

  let exporter = new JaegerExporter({
    // tags: [],
    endpoint: APP_JAEGER_URL + "/api/traces",
  })

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter))
  provider.register()

  registerInstrumentations({
    instrumentations: [
      new GrpcInstrumentation({}),
    ],
  })

  return api.trace.getTracer(tracerName);
};

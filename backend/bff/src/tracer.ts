import api, { Tracer } from "@opentelemetry/api";
import { NodeTracerProvider } from "@opentelemetry/node";
import { SimpleSpanProcessor } from "@opentelemetry/tracing";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from "@opentelemetry/resources";

export function setUpTracer(jaegerUrl: string, serviceName: string, tracerName: string = ""): Tracer {
  const provider = new NodeTracerProvider({
    resource: new Resource({ "service.name": serviceName }),
  });

  let exporter = new JaegerExporter({
    // tags: [],
    endpoint: jaegerUrl + "/api/traces",
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();

  return api.trace.getTracer(tracerName);
};

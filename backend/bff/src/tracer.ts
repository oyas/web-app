import { NodeTracerProvider } from "@opentelemetry/node";
import { SimpleSpanProcessor } from "@opentelemetry/tracing";
import { JaegerExporter } from "@opentelemetry/exporter-jaeger";
import { Resource } from "@opentelemetry/resources";

export function setUpTracer(jaegerUrl: string, serviceName: string) {
  const provider = new NodeTracerProvider({
    resource: new Resource({ "service.name": serviceName }),
  });

  let exporter = new JaegerExporter({
    // tags: [],
    endpoint: jaegerUrl + "/api/traces",
  });

  provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.register();
}

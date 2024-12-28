import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { ExpressInstrumentation } from "@opentelemetry/instrumentation-express";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { Resource } from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import {
  NodeTracerProvider,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

const init = function (serviceName, metricPort) {
  // Define metrics
  const metricExporter = new PrometheusExporter({ port: metricPort }, () => {
    console.log(
      `scrape: http://localhost:${metricPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`
    );
  });

  // Get meter
  const meter = new MeterProvider({
    exporter: metricExporter,
    interval: 1000,
  }).getMeter("serviceName");

  // Define traces
  const traceExporter = new OTLPTraceExporter({
    endpoint: "http://localhost:14268/api/traces",
  });

  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [new SimpleSpanProcessor(traceExporter)],
  });

  provider.register();

  // Register instrumentations
  registerInstrumentations({
    instrumentations: [new HttpInstrumentation(), new ExpressInstrumentation()],
  });

  // Get tracer
  const tracer = provider.getTracer(serviceName);

  // Return meter & tracer
  return { meter, tracer };
};

export default init;

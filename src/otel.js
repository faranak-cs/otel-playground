const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { Resource } = require("@opentelemetry/resources");
const { MeterProvider } = require("@opentelemetry/sdk-metrics");
const { NodeTracerProvider, SimpleSpanProcessor, BatchSpanProcessor } = require("@opentelemetry/sdk-trace-node");
const { ATTR_SERVICE_NAME } = require("@opentelemetry/semantic-conventions");

const init = function (serviceName, metricPort) {
  // Define metrics
  const metricExporter = new PrometheusExporter({ port: metricPort }, () => {
    console.log(`scrape: http://localhost:${metricPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`);
  });

  // Create meter provider
  const meterProvider = new MeterProvider({
    readers: [metricExporter],
  });

  // Get meter
  const meter = meterProvider.getMeter(serviceName);

  // Define traces
  // const traceExporter = new ConsoleSpanExporter();
  const traceExporter = new OTLPTraceExporter();

  const processor = new BatchSpanProcessor(traceExporter);

  // Create trace provider
  const provider = new NodeTracerProvider({
    resource: new Resource({
      [ATTR_SERVICE_NAME]: serviceName,
    }),
    spanProcessors: [processor],
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

module.exports = init;

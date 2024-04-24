import * as opentelemetry from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { NodeSDK, logs, metrics, tracing } from "@opentelemetry/sdk-node";

{
  const otlpSpanProcessor = new tracing.SimpleSpanProcessor(
    new OTLPTraceExporter()
  );
  const consoleSpanProcessor = new tracing.SimpleSpanProcessor(
    new tracing.ConsoleSpanExporter()
  );

  const tracerProvider = new tracing.BasicTracerProvider({});
  tracerProvider.addSpanProcessor(otlpSpanProcessor);
  // tracerProvider.addSpanProcessor(consoleSpanProcessor);

  tracerProvider.register();
}

{
  const loggerProvider = new logs.LoggerProvider({});

  const otlpLogProcessor = new logs.SimpleLogRecordProcessor(
    new OTLPLogExporter()
  );
  const consoleLogProcessor = new logs.SimpleLogRecordProcessor(
    new logs.ConsoleLogRecordExporter()
  );
  loggerProvider.addLogRecordProcessor(otlpLogProcessor);
  // loggerProvider.addLogRecordProcessor(consoleLogProcessor);
}

{
  const otlpMetricReader = new metrics.PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 5000,
  });
  // const consoleMetricReader = new metrics.PeriodicExportingMetricReader({
  //   exporter: new metrics.ConsoleMetricExporter(),
  //   exportIntervalMillis: 5000,
  // });

  const meterProvider = new metrics.MeterProvider({
    readers: [
      otlpMetricReader,
      // consoleMetricReader,
    ],
  });

  opentelemetry.metrics.setGlobalMeterProvider(meterProvider);
}

{
  const instrumentations = getNodeAutoInstrumentations();
  instrumentations.forEach((instrumentation) => instrumentation.enable());
  registerInstrumentations({ instrumentations });
}

export const sdk = new NodeSDK();

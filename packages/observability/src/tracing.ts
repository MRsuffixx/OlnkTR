import { SpanStatusCode, trace, type Attributes } from "@opentelemetry/api";
import type { Logger } from "pino";

/**
 * OpenTelemetry-compatible tracing. Services wrap important operations in
 * `withSpan`; spans are no-ops unless `startTelemetry` registered an SDK
 * (enabled by setting OTEL_EXPORTER_OTLP_ENDPOINT).
 */
const tracer = trace.getTracer("olnktr");

export async function withSpan<T>(
  name: string,
  attributes: Attributes,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, { attributes }, async (span) => {
    try {
      return await fn();
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({ code: SpanStatusCode.ERROR });
      throw error;
    } finally {
      span.end();
    }
  });
}

interface NodeSdkLike {
  start(): void;
  shutdown(): Promise<void>;
}

let sdk: NodeSdkLike | null = null;

export async function startTelemetry(options: {
  serviceName: string;
  endpoint: string | undefined;
  logger: Logger;
}): Promise<void> {
  if (!options.endpoint || sdk) return;
  try {
    const [{ NodeSDK }, { OTLPTraceExporter }, { resourceFromAttributes }] = await Promise.all([
      import("@opentelemetry/sdk-node"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/resources"),
    ]);
    const instance = new NodeSDK({
      resource: resourceFromAttributes({ "service.name": options.serviceName }),
      traceExporter: new OTLPTraceExporter({
        url: `${options.endpoint.replace(/\/$/, "")}/v1/traces`,
      }),
    });
    instance.start();
    sdk = instance;
    options.logger.info({ endpoint: options.endpoint }, "OpenTelemetry tracing enabled");
  } catch (error) {
    options.logger.warn(
      { err: error },
      "failed to start OpenTelemetry; continuing without tracing",
    );
  }
}

export async function stopTelemetry(): Promise<void> {
  await sdk?.shutdown();
  sdk = null;
}

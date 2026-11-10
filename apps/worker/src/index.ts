import { getServerEnv } from "@olnktr/config/env";
import {
  createLogger,
  flushErrorReporting,
  initErrorReporting,
  startTelemetry,
  stopTelemetry,
} from "@olnktr/observability";
import { createWorkerContainer } from "./container";
import { createProcessors } from "./processors/index";
import { startRuntime } from "./runtime";

/**
 * Background worker entry point. Runs independently of the web app; never
 * executed inside Next.js request handlers.
 */
async function main() {
  const env = getServerEnv();
  const logger = createLogger({ service: "worker", level: env.LOG_LEVEL });
  await startTelemetry({
    serviceName: `${env.OTEL_SERVICE_NAME ?? "olnktr"}-worker`,
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    logger,
  });
  await initErrorReporting({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    service: "worker",
    logger,
  });

  const container = createWorkerContainer(env, logger);
  const runtime = await startRuntime(container, createProcessors(container));

  const stop = (signal: string) => {
    void (async () => {
      await runtime.shutdown(signal);
      await container.close();
      await flushErrorReporting();
      await stopTelemetry();
      process.exit(0);
    })();
  };
  process.on("SIGTERM", () => stop("SIGTERM"));
  process.on("SIGINT", () => stop("SIGINT"));
  process.on("unhandledRejection", (reason) =>
    logger.error({ err: reason }, "unhandled rejection"),
  );
}

main().catch((error: unknown) => {
  console.error("worker failed to start", error);
  process.exit(1);
});

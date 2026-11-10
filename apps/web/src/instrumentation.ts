import type { Instrumentation } from "next";

/**
 * Next.js instrumentation: starts OpenTelemetry / error reporting (when
 * configured) and reports unhandled request errors with correlation ids.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const [{ getServerEnv }, observability] = await Promise.all([
    import("@olnktr/config/env"),
    import("@olnktr/observability"),
  ]);
  const env = getServerEnv();
  const logger = observability.createLogger({ service: "web", level: env.LOG_LEVEL });
  await observability.startTelemetry({
    serviceName: `${env.OTEL_SERVICE_NAME ?? "olnktr"}-web`,
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    logger,
  });
  await observability.initErrorReporting({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? env.NODE_ENV,
    service: "web",
    logger,
  });
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { createLogger, reportError } = await import("@olnktr/observability");
  const requestId = (request.headers as Record<string, string | string[] | undefined>)[
    "x-request-id"
  ];
  reportError(createLogger({ service: "web" }), error, {
    path: request.path,
    method: request.method,
    routeType: context.routeType,
    requestId: Array.isArray(requestId) ? requestId[0] : requestId,
  });
};

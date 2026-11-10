import { isAppError } from "@olnktr/types";
import type { Logger } from "pino";
import { getRequestContext } from "./context";

/**
 * Sentry-compatible error reporting. When `SENTRY_DSN` is configured the
 * official Sentry Node SDK is loaded (any Sentry-protocol backend works, e.g.
 * GlitchTip); otherwise errors are only logged.
 */
export interface ErrorReporter {
  capture(error: unknown, extra?: Record<string, unknown>): void;
  flush(timeoutMs?: number): Promise<void>;
}

interface SentryLike {
  init(options: Record<string, unknown>): unknown;
  captureException(error: unknown, hint?: Record<string, unknown>): string;
  flush(timeout?: number): Promise<boolean>;
}

let reporter: ErrorReporter | null = null;

export interface InitErrorReportingOptions {
  dsn: string | undefined;
  environment: string;
  service: string;
  release?: string;
  logger: Logger;
}

export async function initErrorReporting(
  options: InitErrorReportingOptions,
): Promise<ErrorReporter | null> {
  if (!options.dsn) return null;
  try {
    const sentry = (await import("@sentry/node")) as unknown as SentryLike;
    sentry.init({
      dsn: options.dsn,
      environment: options.environment,
      release: options.release,
      serverName: options.service,
      // Tracing is handled by our own OpenTelemetry setup.
      skipOpenTelemetrySetup: true,
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
    reporter = {
      capture(error, extra) {
        const context = getRequestContext();
        sentry.captureException(error, {
          tags: { service: options.service, requestId: context?.requestId },
          extra,
        });
      },
      async flush(timeoutMs = 2000) {
        await sentry.flush(timeoutMs);
      },
    };
    options.logger.info({ service: options.service }, "error reporting enabled");
    return reporter;
  } catch (error) {
    options.logger.warn(
      { err: error },
      "failed to initialise error reporting; continuing without it",
    );
    return null;
  }
}

/**
 * Logs an error and forwards unexpected (non-client) errors to the reporter.
 * Expected client errors (validation, 4xx AppErrors) are logged at debug level.
 */
export function reportError(
  logger: Logger,
  error: unknown,
  extra: Record<string, unknown> = {},
): void {
  if (isAppError(error) && error.isClientError) {
    logger.debug({ err: error, code: error.code, ...extra }, "client error");
    return;
  }
  logger.error({ err: error, ...extra }, "unexpected error");
  reporter?.capture(error, extra);
}

export async function flushErrorReporting(timeoutMs?: number): Promise<void> {
  await reporter?.flush(timeoutMs);
}

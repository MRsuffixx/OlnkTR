import { pino, type Logger, type LoggerOptions } from "pino";
import { getRequestContext } from "./context";

export type { Logger };

/**
 * Paths redacted from every log line. Logs must never contain credentials,
 * tokens, cookies or full API keys.
 */
export const REDACT_PATHS = [
  "password",
  "*.password",
  "newPassword",
  "*.newPassword",
  "token",
  "*.token",
  "secret",
  "*.secret",
  "apiKey",
  "*.apiKey",
  "authorization",
  "*.authorization",
  "headers.authorization",
  "headers.cookie",
  "cookie",
  "*.cookie",
  "accessToken",
  "*.accessToken",
  "refreshToken",
  "*.refreshToken",
  "secretHash",
  "*.secretHash",
];

export interface CreateLoggerOptions {
  service: string;
  level?: string;
  pretty?: boolean;
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const config: LoggerOptions = {
    level: options.level ?? process.env.LOG_LEVEL ?? "info",
    base: { service: options.service },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: { paths: REDACT_PATHS, censor: "[REDACTED]" },
    formatters: {
      level: (label) => ({ level: label }),
    },
    mixin() {
      const context = getRequestContext();
      if (!context) return {};
      const fields: Record<string, string> = { requestId: context.requestId };
      if (context.userId) fields.userId = context.userId;
      if (context.jobId) fields.jobId = context.jobId;
      if (context.queue) fields.queue = context.queue;
      return fields;
    },
    serializers: { err: pino.stdSerializers.err, error: pino.stdSerializers.err },
  };
  return pino(config);
}

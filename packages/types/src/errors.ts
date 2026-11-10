/**
 * Application error taxonomy. Domain services throw `AppError`s; transport
 * layers (tRPC, REST, workers) translate them into protocol-specific responses.
 * Messages are safe to show to clients; never put secrets or internals in them.
 */
export const ERROR_CODES = {
  BAD_REQUEST: 400,
  VALIDATION_FAILED: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  ENTITLEMENT_REQUIRED: 402,
  QUOTA_EXCEEDED: 402,
  RATE_LIMITED: 429,
  SERVICE_UNAVAILABLE: 503,
  INTERNAL: 500,
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export interface AppErrorOptions {
  /** Structured, client-safe details (e.g. the entitlement key that failed). */
  details?: Record<string, unknown>;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly details: Record<string, unknown> | undefined;

  constructor(code: ErrorCode, message: string, options: AppErrorOptions = {}) {
    super(message, options.cause === undefined ? undefined : { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.details = options.details;
  }

  get httpStatus(): number {
    return ERROR_CODES[this.code];
  }

  /** Whether the error is caused by the caller (4xx) rather than the system. */
  get isClientError(): boolean {
    return this.httpStatus < 500;
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export const errors = {
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError("BAD_REQUEST", message, { details }),
  unauthorized: (message = "Authentication required") => new AppError("UNAUTHORIZED", message),
  forbidden: (message = "You do not have permission to perform this action") =>
    new AppError("FORBIDDEN", message),
  /** Use for resources the actor may not see, to avoid leaking their existence. */
  notFound: (resource = "Resource") => new AppError("NOT_FOUND", `${resource} not found`),
  conflict: (message: string, details?: Record<string, unknown>) =>
    new AppError("CONFLICT", message, { details }),
  precondition: (message: string, details?: Record<string, unknown>) =>
    new AppError("PRECONDITION_FAILED", message, { details }),
  entitlementRequired: (entitlement: string) =>
    new AppError("ENTITLEMENT_REQUIRED", "Your current plan does not include this feature", {
      details: { entitlement },
    }),
  quotaExceeded: (entitlement: string, limit: number) =>
    new AppError("QUOTA_EXCEEDED", "Your current plan limit has been reached", {
      details: { entitlement, limit },
    }),
  rateLimited: (retryAfterSeconds: number) =>
    new AppError("RATE_LIMITED", "Too many requests", { details: { retryAfterSeconds } }),
  unavailable: (message = "Service temporarily unavailable") =>
    new AppError("SERVICE_UNAVAILABLE", message),
  internal: (message = "Internal server error", cause?: unknown) =>
    new AppError("INTERNAL", message, { cause }),
};

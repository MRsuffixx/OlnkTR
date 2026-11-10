import { ZodError } from "zod";
import { AppError, isAppError } from "@olnktr/types";

/** Consistent JSON error envelope for every non-tRPC endpoint. */
export interface ErrorEnvelope {
  error: { code: string; message: string; details?: Record<string, unknown>; requestId: string };
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;
  if (error instanceof ZodError) {
    return new AppError("VALIDATION_FAILED", "Request validation failed", {
      details: {
        issues: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
  }
  return new AppError("INTERNAL", "Internal server error", { cause: error });
}

export function errorResponse(
  error: unknown,
  requestId: string,
  headers: Record<string, string> = {},
): Response {
  const appError = toAppError(error);
  const body: ErrorEnvelope = {
    error: {
      code: appError.code,
      // Never leak internal error messages.
      message: appError.isClientError ? appError.message : "Internal server error",
      ...(appError.isClientError && appError.details ? { details: appError.details } : {}),
      requestId,
    },
  };
  return Response.json(body, {
    status: appError.httpStatus,
    headers: { "Cache-Control": "no-store", "X-Request-Id": requestId, ...headers },
  });
}

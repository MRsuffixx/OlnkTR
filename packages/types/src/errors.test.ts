import { describe, expect, it } from "vitest";
import { AppError, errors, isAppError } from "./errors";

describe("AppError", () => {
  it("maps codes to HTTP statuses", () => {
    expect(errors.notFound("Profile").httpStatus).toBe(404);
    expect(errors.quotaExceeded("profiles.limit", 1).httpStatus).toBe(402);
    expect(errors.internal().isClientError).toBe(false);
  });

  it("carries structured details", () => {
    const error = errors.entitlementRequired("api.access");
    expect(isAppError(error)).toBe(true);
    expect(error.details).toEqual({ entitlement: "api.access" });
    expect(error).toBeInstanceOf(AppError);
  });
});

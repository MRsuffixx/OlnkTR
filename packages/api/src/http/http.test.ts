import { describe, expect, it } from "vitest";
import type { ZodError } from "zod";
import { z } from "zod";
import { errors } from "@olnktr/types";
import { getClientIp } from "./client-ip";
import { isSameOrigin } from "./csrf";
import { errorResponse } from "./errors";
import { createMemoryRateLimiter } from "./rate-limit";

describe("client IP", () => {
  const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" });
  it("ignores proxy headers unless the proxy is trusted", () => {
    expect(getClientIp(headers, { trustProxy: false, header: "x-forwarded-for" })).toBeNull();
    expect(getClientIp(headers, { trustProxy: true, header: "x-forwarded-for" })).toBe(
      "203.0.113.7",
    );
  });
  it("rejects malformed values", () => {
    expect(
      getClientIp(new Headers({ "x-forwarded-for": "not-an-ip" }), {
        trustProxy: true,
        header: "x-forwarded-for",
      }),
    ).toBeNull();
  });
});

describe("same-origin check", () => {
  const appUrl = "https://olnk.tr";
  const request = (headers: Record<string, string>) =>
    new Request("https://olnk.tr/api/trpc/x", { method: "POST", headers });
  it("accepts same-origin requests", () => {
    expect(isSameOrigin(request({ origin: "https://olnk.tr" }), appUrl)).toBe(true);
    expect(isSameOrigin(request({ referer: "https://olnk.tr/dashboard" }), appUrl)).toBe(true);
  });
  it("rejects cross-site and origin-less requests", () => {
    expect(isSameOrigin(request({ origin: "https://evil.example" }), appUrl)).toBe(false);
    expect(isSameOrigin(request({ origin: "https://olnk.tr.evil.example" }), appUrl)).toBe(false);
    expect(isSameOrigin(request({}), appUrl)).toBe(false);
  });
});

describe("error envelopes", () => {
  it("hides internal error details", async () => {
    const response = errorResponse(new Error("database password is hunter2"), "req-1");
    expect(response.status).toBe(500);
    const body = JSON.stringify(await response.json());
    expect(body).not.toContain("hunter2");
    expect(body).toContain("req-1");
  });
  it("maps validation and domain errors", async () => {
    const zodError = z.object({ a: z.string() }).safeParse({}).error as ZodError;
    expect(errorResponse(zodError, "r").status).toBe(422);
    const quota = errorResponse(errors.quotaExceeded("profiles.limit", 1), "r");
    expect(quota.status).toBe(402);
    expect(await quota.json()).toMatchObject({
      error: { code: "QUOTA_EXCEEDED", details: { entitlement: "profiles.limit", limit: 1 } },
    });
  });
});

describe("memory rate limiter", () => {
  it("allows up to the limit per window", async () => {
    const limiter = createMemoryRateLimiter();
    const results = [];
    for (let index = 0; index < 4; index++) results.push(await limiter.consume("k", 3, 60));
    expect(results.map((result) => result.allowed)).toEqual([true, true, true, false]);
    expect(results[3]?.retryAfterSeconds).toBeGreaterThan(0);
  });
});

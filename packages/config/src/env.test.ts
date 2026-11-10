import { describe, expect, it } from "vitest";
import { EnvValidationError, parseServerEnv } from "./env";

const valid = {
  DATABASE_URL: "postgres://u:p@localhost:5432/db",
  AUTH_SECRET: "a".repeat(40),
};

describe("parseServerEnv", () => {
  it("applies secure defaults", () => {
    const env = parseServerEnv(valid);
    expect(env.AUTH_REQUIRE_EMAIL_VERIFICATION).toBe(true);
    expect(env.DEFAULT_LOCALE).toBe("en");
    expect(env.BILLING_PROVIDERS).toEqual([]);
  });

  it("rejects short auth secrets", () => {
    expect(() => parseServerEnv({ ...valid, AUTH_SECRET: "short" })).toThrow(EnvValidationError);
  });

  it("refuses the dev billing provider in production", () => {
    expect(() =>
      parseServerEnv({
        ...valid,
        NODE_ENV: "production",
        APP_URL: "https://olnk.tr",
        S3_ACCESS_KEY_ID: "x",
        S3_SECRET_ACCESS_KEY: "y",
        BILLING_PROVIDERS: "dev",
        DEV_BILLING_WEBHOOK_SECRET: "x".repeat(20),
      }),
    ).toThrow(/dev billing provider/);
  });

  it("treats NODE_ENV=production as a production deployment unless APP_ENV says otherwise", () => {
    expect(() =>
      parseServerEnv({ ...valid, NODE_ENV: "production", APP_URL: "http://localhost" }),
    ).toThrow(/https/);
    expect(() =>
      parseServerEnv({
        ...valid,
        NODE_ENV: "production",
        APP_ENV: "development",
        APP_URL: "http://localhost",
      }),
    ).not.toThrow();
  });

  it("requires provider credentials when a provider is enabled", () => {
    expect(() => parseServerEnv({ ...valid, BILLING_PROVIDERS: "stripe" })).toThrow(/Stripe/);
  });

  it("treats empty strings (as passed by Docker Compose) as unset", () => {
    const env = parseServerEnv({
      ...valid,
      BILLING_DEFAULT_PROVIDER: "",
      APP_ENV: "",
      GOOGLE_CLIENT_ID: "",
    });
    expect(env.BILLING_DEFAULT_PROVIDER).toBeUndefined();
    expect(env.APP_ENV).toBeUndefined();
    expect(env.GOOGLE_CLIENT_ID).toBeUndefined();
  });

  it("parses comma separated lists", () => {
    const env = parseServerEnv({
      ...valid,
      AUTH_TRUSTED_ORIGINS: "https://a.example, https://b.example",
    });
    expect(env.AUTH_TRUSTED_ORIGINS).toEqual(["https://a.example", "https://b.example"]);
  });
});

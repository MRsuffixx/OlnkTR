import { z } from "zod";
import { LOCALES } from "./constants";

/**
 * Server-side environment schema. Every runtime variable the platform reads is
 * declared here so configuration is validated once, at process start-up, with
 * clear error messages. Never read `process.env` directly elsewhere in server code.
 */
const booleanString = z
  .enum(["true", "false", "1", "0"])
  .transform((value) => value === "true" || value === "1");

const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

const commaList = z
  .string()
  .default("")
  .transform((value) =>
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );

export const BILLING_PROVIDER_IDS = ["dev", "stripe", "paytr"] as const;
export type BillingProviderId = (typeof BILLING_PROVIDER_IDS)[number];

export const serverEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    /**
     * Deployment environment (separate from the NODE_ENV build mode). Production
     * safety checks apply when it is "production", which is the default
     * whenever NODE_ENV=production. Set APP_ENV=development to run a
     * production build locally (e.g. end-to-end tests over plain http).
     */
    APP_ENV: optionalString.pipe(
      z.enum(["development", "test", "staging", "production"]).optional(),
    ),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    APP_URL: z.url().default("http://localhost:3100"),
    DEFAULT_LOCALE: z.enum(LOCALES).default("en"),
    /** Trust the reverse proxy's client-IP header (enable only behind a proxy that overwrites it). */
    TRUST_PROXY: booleanString.default(false),
    CLIENT_IP_HEADER: z.string().toLowerCase().default("x-forwarded-for"),

    DATABASE_URL: z.url(),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),

    REDIS_URL: z.url().default("redis://localhost:6379"),
    REDIS_KEY_PREFIX: z.string().default("olnktr"),

    AUTH_SECRET: z.string().min(32, "AUTH_SECRET must be at least 32 characters"),
    AUTH_REQUIRE_EMAIL_VERIFICATION: booleanString.default(true),
    /** Brute-force protection on auth endpoints. Cannot be disabled in production. */
    AUTH_RATE_LIMIT_ENABLED: booleanString.default(true),
    AUTH_TRUSTED_ORIGINS: commaList,
    GOOGLE_CLIENT_ID: optionalString,
    GOOGLE_CLIENT_SECRET: optionalString,
    GITHUB_CLIENT_ID: optionalString,
    GITHUB_CLIENT_SECRET: optionalString,
    ACCOUNT_DELETION_GRACE_DAYS: z.coerce.number().int().min(0).max(365).default(30),

    SMTP_HOST: z.string().default("localhost"),
    SMTP_PORT: z.coerce.number().int().positive().default(1025),
    SMTP_SECURE: booleanString.default(false),
    SMTP_USER: optionalString,
    SMTP_PASSWORD: optionalString,
    EMAIL_FROM: z.string().default("OlnkTR <no-reply@olnk.tr>"),

    S3_ENDPOINT: optionalString,
    S3_PUBLIC_ENDPOINT: optionalString,
    S3_REGION: z.string().default("us-east-1"),
    S3_BUCKET: z.string().default("olnktr-media"),
    S3_ACCESS_KEY_ID: optionalString,
    S3_SECRET_ACCESS_KEY: optionalString,
    S3_FORCE_PATH_STYLE: booleanString.default(true),
    MEDIA_MAX_UPLOAD_BYTES: z.coerce
      .number()
      .int()
      .positive()
      .default(5 * 1024 * 1024),

    BILLING_PROVIDERS: commaList.pipe(z.array(z.enum(BILLING_PROVIDER_IDS))),
    BILLING_DEFAULT_PROVIDER: optionalString.pipe(z.enum(BILLING_PROVIDER_IDS).optional()),
    BILLING_GRACE_PERIOD_DAYS: z.coerce.number().int().min(0).max(60).default(7),
    STRIPE_SECRET_KEY: optionalString,
    STRIPE_WEBHOOK_SECRET: optionalString,
    PAYTR_MERCHANT_ID: optionalString,
    PAYTR_MERCHANT_KEY: optionalString,
    PAYTR_MERCHANT_SALT: optionalString,
    PAYTR_TEST_MODE: booleanString.default(true),
    DEV_BILLING_WEBHOOK_SECRET: optionalString,

    ANALYTICS_RAW_RETENTION_DAYS: z.coerce.number().int().min(1).max(3650).default(90),
    ANALYTICS_AGGREGATE_RETENTION_DAYS: z.coerce.number().int().min(30).max(3650).default(730),
    ANALYTICS_COUNTRY_HEADER: z.string().default("cf-ipcountry"),

    SENTRY_DSN: optionalString,
    SENTRY_ENVIRONMENT: optionalString,
    OTEL_EXPORTER_OTLP_ENDPOINT: optionalString,
    OTEL_SERVICE_NAME: optionalString,

    WORKER_HEALTH_PORT: z.coerce.number().int().positive().default(3101),
  })
  .superRefine((env, ctx) => {
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    for (const provider of env.BILLING_PROVIDERS) {
      if (provider === "stripe" && (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET)) {
        issue(
          "STRIPE_SECRET_KEY",
          "Stripe is enabled but STRIPE_SECRET_KEY/STRIPE_WEBHOOK_SECRET are missing",
        );
      }
      if (
        provider === "paytr" &&
        (!env.PAYTR_MERCHANT_ID || !env.PAYTR_MERCHANT_KEY || !env.PAYTR_MERCHANT_SALT)
      ) {
        issue("PAYTR_MERCHANT_ID", "PayTR is enabled but merchant credentials are missing");
      }
      if (
        provider === "dev" &&
        (!env.DEV_BILLING_WEBHOOK_SECRET || env.DEV_BILLING_WEBHOOK_SECRET.length < 16)
      ) {
        issue(
          "DEV_BILLING_WEBHOOK_SECRET",
          "The dev billing provider needs a secret of at least 16 characters",
        );
      }
    }
    if (
      env.BILLING_DEFAULT_PROVIDER &&
      !env.BILLING_PROVIDERS.includes(env.BILLING_DEFAULT_PROVIDER)
    ) {
      issue(
        "BILLING_DEFAULT_PROVIDER",
        "BILLING_DEFAULT_PROVIDER must be one of BILLING_PROVIDERS",
      );
    }
    if (Boolean(env.GOOGLE_CLIENT_ID) !== Boolean(env.GOOGLE_CLIENT_SECRET)) {
      issue("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be set together");
    }
    if (Boolean(env.GITHUB_CLIENT_ID) !== Boolean(env.GITHUB_CLIENT_SECRET)) {
      issue("GITHUB_CLIENT_ID", "GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be set together");
    }

    if (resolveAppEnv(env) === "production") {
      if (!env.APP_URL.startsWith("https://")) {
        issue("APP_URL", "APP_URL must use https in production");
      }
      if (env.BILLING_PROVIDERS.includes("dev")) {
        issue("BILLING_PROVIDERS", "The dev billing provider must never be enabled in production");
      }
      if (!env.AUTH_RATE_LIMIT_ENABLED) {
        issue(
          "AUTH_RATE_LIMIT_ENABLED",
          "Authentication rate limiting must stay enabled in production",
        );
      }
      if (/change-me|changeme|development|example/i.test(env.AUTH_SECRET)) {
        issue("AUTH_SECRET", "AUTH_SECRET looks like a placeholder; generate a random secret");
      }
      if (!env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) {
        issue("S3_ACCESS_KEY_ID", "Object storage credentials are required in production");
      }
    }
  });

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export type AppEnv = "development" | "test" | "staging" | "production";

export function resolveAppEnv(env: { APP_ENV?: AppEnv | undefined; NODE_ENV: string }): AppEnv {
  return (
    env.APP_ENV ??
    (env.NODE_ENV === "production"
      ? "production"
      : env.NODE_ENV === "test"
        ? "test"
        : "development")
  );
}

export class EnvValidationError extends Error {
  constructor(public readonly issues: string[]) {
    super(`Invalid environment configuration:\n  - ${issues.join("\n  - ")}`);
    this.name = "EnvValidationError";
  }
}

export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = serverEnvSchema.safeParse(source);
  if (!result.success) {
    throw new EnvValidationError(
      result.error.issues.map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`),
    );
  }
  return result.data;
}

let cached: ServerEnv | undefined;

/** Lazily validated, cached server environment. */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv(process.env);
  return cached;
}

/** Test helper: forget the cached environment. */
export function resetServerEnvCache(): void {
  cached = undefined;
}

import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
// Local development: the monorepo keeps a single .env at the root. Real
// environment variables (Docker, CI) always win over the file.
const rootEnv = path.join(root, ".env");
if (existsSync(rootEnv)) process.loadEnvFile(rootEnv);

const isProduction = process.env.NODE_ENV === "production";

/** Security headers for every response (pages additionally get a nonce-based CSP from src/proxy.ts). */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  ...(isProduction
    ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  // The repository root AGENTS.md is the contract for agents; do not generate another one here.
  agentRules: false,
  outputFileTracingRoot: root,
  poweredByHeader: false,
  reactStrictMode: true,
  transpilePackages: [
    "@olnktr/analytics",
    "@olnktr/api",
    "@olnktr/auth",
    "@olnktr/billing",
    "@olnktr/config",
    "@olnktr/core",
    "@olnktr/db",
    "@olnktr/email",
    "@olnktr/jobs",
    "@olnktr/observability",
    "@olnktr/storage",
    "@olnktr/types",
    "@olnktr/ui",
    "@olnktr/validators",
  ],
  serverExternalPackages: [
    "pino",
    "postgres",
    "bullmq",
    "ioredis",
    "stripe",
    "nodemailer",
    "file-type",
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "@sentry/node",
    "@opentelemetry/sdk-node",
    "@opentelemetry/exporter-trace-otlp-http",
  ],
  headers() {
    return Promise.resolve([{ source: "/:path*", headers: securityHeaders }]);
  },
};

export default withNextIntl(nextConfig);

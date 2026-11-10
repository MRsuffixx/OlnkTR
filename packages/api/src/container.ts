import { createHash } from "node:crypto";
import { createAnalyticsIngestService, createRedisDedupeStore } from "@olnktr/analytics";
import { createAuth, type Auth } from "@olnktr/auth";
import {
  createBillingEventProcessor,
  createBillingService,
  createEntitlementService,
  createProviderRegistryFromEnv,
  createWebhookIngestor,
} from "@olnktr/billing";
import { getServerEnv, type ServerEnv } from "@olnktr/config/env";
import { createCore, type Core } from "@olnktr/core";
import { createDatabase, type DatabaseHandle } from "@olnktr/db";
import { createSmtpTransport, renderEmail } from "@olnktr/email";
import {
  createBullJobProducer,
  createRedisConnection,
  type JobProducer,
  type Redis,
} from "@olnktr/jobs";
import { createLogger, type Logger } from "@olnktr/observability";
import { createS3ObjectStorage, type ObjectStorage } from "@olnktr/storage";
import { systemClock } from "@olnktr/types";
import { createRedisRateLimiter, type RateLimiter } from "./http/rate-limit";

/**
 * Composition root for the web application process. Built once per process
 * (cached on globalThis so Next.js dev HMR does not leak connection pools).
 */
export interface Container {
  env: ServerEnv;
  logger: Logger;
  database: DatabaseHandle;
  redis: Redis;
  jobs: JobProducer;
  storage: ObjectStorage;
  core: Core;
  auth: Auth;
  billingProcessor: ReturnType<typeof createBillingEventProcessor>;
  webhooks: ReturnType<typeof createWebhookIngestor>;
  analyticsIngest: ReturnType<typeof createAnalyticsIngestService>;
  rateLimiter: RateLimiter;
  close(): Promise<void>;
}

/** Domain-separated key derived from AUTH_SECRET for analytics visitor hashing. */
export function deriveSecret(env: ServerEnv, purpose: string): string {
  return createHash("sha256").update(`${purpose}:${env.AUTH_SECRET}`).digest("hex");
}

export function createContainer(env: ServerEnv): Container {
  const logger = createLogger({ service: "web", level: env.LOG_LEVEL });
  const database = createDatabase({
    url: env.DATABASE_URL,
    maxConnections: env.DATABASE_POOL_MAX,
    applicationName: "olnktr-web",
  });
  const db = database.db;
  const redis = createRedisConnection(env.REDIS_URL, "producer");
  const jobs = createBullJobProducer({ connection: redis, keyPrefix: env.REDIS_KEY_PREFIX });
  const storage = createS3ObjectStorage({
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    publicEndpoint: env.S3_PUBLIC_ENDPOINT,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });
  const clock = systemClock;
  const providers = createProviderRegistryFromEnv(env);
  const entitlements = createEntitlementService({ db, clock });
  const billing = createBillingService({
    db,
    providers,
    entitlements,
    logger,
    appUrl: env.APP_URL,
    gracePeriodDays: env.BILLING_GRACE_PERIOD_DAYS,
    clock,
  });
  const core = createCore({
    db,
    jobs,
    storage,
    logger,
    clock,
    entitlements,
    billing,
    providers,
    config: {
      appUrl: env.APP_URL,
      accountDeletionGraceDays: env.ACCOUNT_DELETION_GRACE_DAYS,
      mediaMaxUploadBytes: env.MEDIA_MAX_UPLOAD_BYTES,
    },
  });
  const smtp = createSmtpTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM,
  });
  const auth = createAuth({
    env,
    db,
    core,
    jobs,
    logger,
    sendEmailDirect: async (message) => {
      const rendered = renderEmail(message.template, message.locale, message.props);
      await smtp.send({ to: message.to, ...rendered });
    },
  });
  const billingProcessor = createBillingEventProcessor({
    db,
    providers,
    jobs,
    logger,
    appUrl: env.APP_URL,
    gracePeriodDays: env.BILLING_GRACE_PERIOD_DAYS,
    clock,
  });
  const webhooks = createWebhookIngestor({
    db,
    providers,
    jobs,
    processor: billingProcessor,
    logger,
  });
  const analyticsIngest = createAnalyticsIngestService({
    jobs,
    dedupe: createRedisDedupeStore(redis, env.REDIS_KEY_PREFIX),
    secret: deriveSecret(env, "analytics"),
    ownHosts: [new URL(env.APP_URL).hostname.replace(/^www\./, "")],
    logger,
  });

  return {
    env,
    logger,
    database,
    redis,
    jobs,
    storage,
    core,
    auth,
    billingProcessor,
    webhooks,
    analyticsIngest,
    rateLimiter: createRedisRateLimiter(redis, env.REDIS_KEY_PREFIX),
    async close() {
      await jobs.close();
      redis.disconnect();
      smtp.close();
      await database.close();
    },
  };
}

const globalForContainer = globalThis as unknown as { __olnktrContainer?: Container };

export function getContainer(): Container {
  globalForContainer.__olnktrContainer ??= createContainer(getServerEnv());
  return globalForContainer.__olnktrContainer;
}

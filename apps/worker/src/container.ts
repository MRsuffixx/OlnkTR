import {
  createBillingEventProcessor,
  createBillingService,
  createEntitlementService,
  createProviderRegistryFromEnv,
} from "@olnktr/billing";
import type { ServerEnv } from "@olnktr/config/env";
import { createCore, type Core } from "@olnktr/core";
import { createDatabase, type DatabaseHandle } from "@olnktr/db";
import { createSmtpTransport, type EmailTransport } from "@olnktr/email";
import {
  createBullJobProducer,
  createRedisConnection,
  type JobProducer,
  type Redis,
} from "@olnktr/jobs";
import type { Logger } from "@olnktr/observability";
import { createS3ObjectStorage, type ObjectStorage } from "@olnktr/storage";
import { systemClock } from "@olnktr/types";

/** Composition root for the worker process. */
export interface WorkerContainer {
  env: ServerEnv;
  logger: Logger;
  database: DatabaseHandle;
  /** Connection shared by BullMQ workers (retries forever, required by BullMQ). */
  workerRedis: Redis;
  /** Fail-fast connection for producing follow-up jobs. */
  producerRedis: Redis;
  jobs: JobProducer;
  storage: ObjectStorage;
  email: EmailTransport;
  core: Core;
  billing: ReturnType<typeof createBillingService>;
  billingProcessor: ReturnType<typeof createBillingEventProcessor>;
  close(): Promise<void>;
}

export function createWorkerContainer(env: ServerEnv, logger: Logger): WorkerContainer {
  const database = createDatabase({
    url: env.DATABASE_URL,
    maxConnections: env.DATABASE_POOL_MAX,
    applicationName: "olnktr-worker",
  });
  const db = database.db;
  const workerRedis = createRedisConnection(env.REDIS_URL, "worker");
  const producerRedis = createRedisConnection(env.REDIS_URL, "producer");
  const jobs = createBullJobProducer({
    connection: producerRedis,
    keyPrefix: env.REDIS_KEY_PREFIX,
  });
  const storage = createS3ObjectStorage({
    bucket: env.S3_BUCKET,
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    publicEndpoint: env.S3_PUBLIC_ENDPOINT,
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
  });
  const email = createSmtpTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    user: env.SMTP_USER,
    password: env.SMTP_PASSWORD,
    from: env.EMAIL_FROM,
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
  const billingProcessor = createBillingEventProcessor({
    db,
    providers,
    jobs,
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
  return {
    env,
    logger,
    database,
    workerRedis,
    producerRedis,
    jobs,
    storage,
    email,
    core,
    billing,
    billingProcessor,
    async close() {
      await jobs.close();
      email.close();
      workerRedis.disconnect();
      producerRedis.disconnect();
      await database.close(10);
    },
  };
}

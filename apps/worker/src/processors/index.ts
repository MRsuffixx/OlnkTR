import {
  applyAnalyticsRetention,
  processAnalyticsEvent,
  rollupMonth,
  rollupMonths,
} from "@olnktr/analytics";
import type { ImageProcessor } from "@olnktr/core";
import { eq, schema } from "@olnktr/db";
import { renderEmail } from "@olnktr/email";
import { parseJobPayload, type JobName, type QueueName } from "@olnktr/jobs";
import type { WorkerContainer } from "../container";

/**
 * Job processors, one map per queue. Each processor validates its payload
 * again (never trust queue contents) and is idempotent or safe to retry:
 *  - analytics: idempotent via ingest_id
 *  - billing: idempotent via the locked billing_events inbox row
 *  - media deletes: S3 deletes are idempotent
 *  - email: at-least-once (a retry after a successful SMTP send can duplicate)
 */
export type Processor = (name: string, data: unknown) => Promise<unknown>;

export function createProcessors(
  container: WorkerContainer,
  imageProcessors: ImageProcessor[] = [],
): Record<QueueName, Processor> {
  const { env, core, database, logger } = container;
  const db = database.db;

  const unknownJob = (queue: string, name: string): never => {
    throw new Error(`Unknown job ${queue}/${name}`);
  };

  return {
    analytics: async (name, data) => {
      if (name !== "ingest") return unknownJob("analytics", name);
      return processAnalyticsEvent(db, parseJobPayload("analytics", "ingest", data));
    },

    email: async (name, data) => {
      if (name !== "send") return unknownJob("email", name);
      const payload = parseJobPayload("email", "send", data);
      const rendered = renderEmail(payload.template, payload.locale, payload.props);
      const result = await container.email.send({ to: payload.to, ...rendered });
      return { messageId: result.messageId };
    },

    billing: async (name, data) => {
      if (name !== "process-event") return unknownJob("billing", name);
      return container.billingProcessor.process(
        parseJobPayload("billing", "process-event", data).billingEventId,
      );
    },

    media: async (name, data) => {
      if (name === "delete-object") {
        await container.storage.delete(parseJobPayload("media", "delete-object", data).storageKey);
        return { deleted: true };
      }
      if (name === "process") {
        const { mediaId } = parseJobPayload("media", "process", data);
        const [media] = await db
          .select()
          .from(schema.mediaFiles)
          .where(eq(schema.mediaFiles.id, mediaId));
        if (!media || media.status !== "ready" || !media.mimeType) return { skipped: "not_ready" };
        for (const processor of imageProcessors) {
          await processor.process({
            mediaId,
            storageKey: media.storageKey,
            mimeType: media.mimeType,
          });
        }
        return { processors: imageProcessors.map((processor) => processor.name) };
      }
      return unknownJob("media", name);
    },

    maintenance: async (name, data) => {
      const job = name as JobName<"maintenance">;
      parseJobPayload("maintenance", job, data);
      switch (job) {
        case "subscription-lifecycle":
          return container.billing.runLifecycle();
        case "billing-reconcile": {
          const pending = await container.billing.findUnprocessedEvents();
          for (const { id } of pending) {
            await container.jobs.enqueue(
              "billing",
              "process-event",
              { billingEventId: id },
              { jobId: `billing-event-${id}-retry-${Date.now()}` },
            );
          }
          return { requeued: pending.length };
        }
        case "analytics-rollup": {
          const months = rollupMonths(new Date());
          for (const month of months) await rollupMonth(db, month);
          return { months };
        }
        case "analytics-retention":
          return applyAnalyticsRetention(db, {
            rawDays: env.ANALYTICS_RAW_RETENTION_DAYS,
            aggregateDays: env.ANALYTICS_AGGREGATE_RETENTION_DAYS,
          });
        case "account-deletion":
          return { purged: await core.users.purgeDueAccounts() };
        case "media-cleanup":
          return { abandoned: await core.media.cleanupAbandonedUploads() };
        case "invitation-expiry":
          return { expired: await core.organizations.expireInvitations() };
        default:
          logger.warn({ name }, "unknown maintenance job");
          return unknownJob("maintenance", name);
      }
    },
  };
}

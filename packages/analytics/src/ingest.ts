import { randomUUID } from "node:crypto";
import type { AnalyticsIngestPayload, JobProducer } from "@olnktr/jobs";
import type { Logger } from "@olnktr/observability";
import { systemClock, type Clock } from "@olnktr/types";
import type { AnalyticsEventInput, AnalyticsEventType } from "@olnktr/validators";
import type { DedupeStore } from "./dedupe";
import { normalizeCountry, referrerHost, utcDay, visitorHash } from "./privacy";
import { categorizeUserAgent } from "./user-agent";

/**
 * Public ingestion: validate → filter bots → anonymize → dedupe → enqueue.
 * Never touches PostgreSQL, so it stays cheap and never blocks page rendering;
 * aggregation happens in the worker.
 */
export const DEDUPE_WINDOWS_SECONDS: Record<AnalyticsEventType, number> = {
  "profile.view": 30 * 60,
  "block.view": 30 * 60,
  "link.click": 10,
};

export interface IngestContext {
  ip: string | null;
  userAgent: string | null;
  country: string | null;
  /** Explicit opt-out signals (Do Not Track / Global Privacy Control). */
  optOut?: boolean;
}

export type IngestResult =
  | { accepted: true; ingestId: string }
  | { accepted: false; reason: "bot" | "duplicate" | "opt_out" | "queue_unavailable" };

export interface AnalyticsIngestDeps {
  jobs: JobProducer;
  dedupe: DedupeStore;
  secret: string;
  ownHosts: readonly string[];
  logger: Logger;
  clock?: Clock;
}

export function createAnalyticsIngestService(deps: AnalyticsIngestDeps) {
  const clock = deps.clock ?? systemClock;
  let lastQueueWarning = 0;

  return {
    async ingest(event: AnalyticsEventInput, context: IngestContext): Promise<IngestResult> {
      if (context.optOut) return { accepted: false, reason: "opt_out" };
      const categories = categorizeUserAgent(context.userAgent);
      if (categories.isBot) return { accepted: false, reason: "bot" };

      const now = clock.now();
      const visitor = visitorHash({
        secret: deps.secret,
        day: utcDay(now),
        ip: context.ip,
        userAgent: context.userAgent,
        profileId: event.profileId,
      });
      const target = event.linkId ?? event.blockId ?? "profile";
      const fresh = await deps.dedupe.claim(
        `${event.type}:${event.profileId}:${target}:${visitor}`,
        DEDUPE_WINDOWS_SECONDS[event.type],
      );
      if (!fresh) return { accepted: false, reason: "duplicate" };

      const payload: AnalyticsIngestPayload = {
        ingestId: randomUUID(),
        type: event.type,
        profileId: event.profileId,
        linkId: event.linkId ?? null,
        blockId: event.blockId ?? null,
        occurredAt: now.toISOString(),
        visitorHash: visitor,
        referrerHost: referrerHost(event.referrer, deps.ownHosts),
        deviceType: categories.deviceType,
        browser: categories.browser,
        os: categories.os,
        country: normalizeCountry(context.country),
        utm: {
          source: event.utm?.source || null,
          medium: event.utm?.medium || null,
          campaign: event.utm?.campaign || null,
          term: event.utm?.term || null,
          content: event.utm?.content || null,
        },
      };
      try {
        await deps.jobs.enqueue("analytics", "ingest", payload, { jobId: payload.ingestId });
        return { accepted: true, ingestId: payload.ingestId };
      } catch (error) {
        // Analytics is best-effort: when Redis is down events are dropped, the
        // public page keeps working, and we log at most once a minute.
        if (now.getTime() - lastQueueWarning > 60_000) {
          lastQueueWarning = now.getTime();
          deps.logger.warn({ err: error }, "analytics queue unavailable; dropping events");
        }
        return { accepted: false, reason: "queue_unavailable" };
      }
    },
  };
}

export type AnalyticsIngestService = ReturnType<typeof createAnalyticsIngestService>;

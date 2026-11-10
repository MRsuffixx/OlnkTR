import { z } from "zod";
import { ANALYTICS_EVENT_TYPES } from "@olnktr/validators";

/**
 * Queue and job contracts shared by producers (web) and consumers (worker).
 * Every payload is validated on enqueue *and* again before processing.
 */
export const QUEUE_NAMES = ["analytics", "email", "billing", "media", "maintenance"] as const;
export type QueueName = (typeof QUEUE_NAMES)[number];

export const analyticsIngestPayload = z.object({
  ingestId: z.uuid(),
  type: z.enum(ANALYTICS_EVENT_TYPES),
  profileId: z.uuid(),
  linkId: z.uuid().nullable(),
  blockId: z.uuid().nullable(),
  occurredAt: z.iso.datetime(),
  visitorHash: z.string().min(16).max(64),
  referrerHost: z.string().max(255).nullable(),
  deviceType: z.string().max(32),
  browser: z.string().max(32),
  os: z.string().max(32),
  country: z.string().length(2).nullable(),
  utm: z.object({
    source: z.string().max(200).nullable(),
    medium: z.string().max(200).nullable(),
    campaign: z.string().max(200).nullable(),
    term: z.string().max(200).nullable(),
    content: z.string().max(200).nullable(),
  }),
});
export type AnalyticsIngestPayload = z.infer<typeof analyticsIngestPayload>;

export const EMAIL_TEMPLATES = [
  "verify-email",
  "reset-password",
  "organization-invitation",
  "payment-failed",
  "subscription-activated",
  "account-deletion-scheduled",
] as const;
export type EmailTemplate = (typeof EMAIL_TEMPLATES)[number];

export const emailSendPayload = z.object({
  to: z.email(),
  template: z.enum(EMAIL_TEMPLATES),
  locale: z.enum(["en", "tr"]),
  props: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});
export type EmailSendPayload = z.infer<typeof emailSendPayload>;

export const JOB_DEFINITIONS = {
  analytics: {
    ingest: analyticsIngestPayload,
  },
  email: {
    send: emailSendPayload,
  },
  billing: {
    "process-event": z.object({ billingEventId: z.uuid() }),
  },
  media: {
    "delete-object": z.object({ storageKey: z.string().min(1).max(512) }),
    process: z.object({ mediaId: z.uuid() }),
  },
  maintenance: {
    "analytics-retention": z.object({}),
    "analytics-rollup": z.object({
      month: z
        .string()
        .regex(/^\d{4}-\d{2}$/)
        .optional(),
    }),
    "subscription-lifecycle": z.object({}),
    "billing-reconcile": z.object({}),
    "account-deletion": z.object({}),
    "media-cleanup": z.object({}),
    "invitation-expiry": z.object({}),
  },
} as const satisfies Record<QueueName, Record<string, z.ZodType>>;

export type JobName<Q extends QueueName> = keyof (typeof JOB_DEFINITIONS)[Q] & string;
export type JobPayload<Q extends QueueName, N extends JobName<Q>> = z.infer<
  (typeof JOB_DEFINITIONS)[Q][N] extends z.ZodType ? (typeof JOB_DEFINITIONS)[Q][N] : never
>;

export function parseJobPayload<Q extends QueueName, N extends JobName<Q>>(
  queue: Q,
  name: N,
  payload: unknown,
): JobPayload<Q, N> {
  const schema = (JOB_DEFINITIONS[queue] as Record<string, z.ZodType>)[name];
  if (!schema) throw new Error(`Unknown job ${queue}/${name}`);
  return schema.parse(payload) as JobPayload<Q, N>;
}

export interface QueueDefaults {
  attempts: number;
  backoffMs: number;
  /** Seconds to keep completed jobs (for inspection / idempotency by jobId). */
  keepCompletedSeconds: number;
  keepFailedSeconds: number;
}

/** Retry policy: exponential backoff starting at `backoffMs`. */
export const QUEUE_DEFAULTS: Record<QueueName, QueueDefaults> = {
  analytics: {
    attempts: 5,
    backoffMs: 1_000,
    keepCompletedSeconds: 3_600,
    keepFailedSeconds: 7 * 86_400,
  },
  email: {
    attempts: 8,
    backoffMs: 5_000,
    keepCompletedSeconds: 86_400,
    keepFailedSeconds: 14 * 86_400,
  },
  billing: {
    attempts: 10,
    backoffMs: 5_000,
    keepCompletedSeconds: 7 * 86_400,
    keepFailedSeconds: 30 * 86_400,
  },
  media: {
    attempts: 5,
    backoffMs: 3_000,
    keepCompletedSeconds: 86_400,
    keepFailedSeconds: 7 * 86_400,
  },
  maintenance: {
    attempts: 3,
    backoffMs: 30_000,
    keepCompletedSeconds: 86_400,
    keepFailedSeconds: 14 * 86_400,
  },
};

/** Repeatable maintenance schedules (cron, UTC). */
export const MAINTENANCE_SCHEDULES: { name: JobName<"maintenance">; pattern: string }[] = [
  { name: "subscription-lifecycle", pattern: "*/10 * * * *" },
  { name: "billing-reconcile", pattern: "*/5 * * * *" },
  { name: "analytics-rollup", pattern: "15 * * * *" },
  { name: "analytics-retention", pattern: "30 3 * * *" },
  { name: "account-deletion", pattern: "0 4 * * *" },
  { name: "media-cleanup", pattern: "45 * * * *" },
  { name: "invitation-expiry", pattern: "0 * * * *" },
];

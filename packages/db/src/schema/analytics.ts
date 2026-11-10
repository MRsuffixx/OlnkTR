import {
  bigint,
  date,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { profiles } from "./profiles";

/**
 * Raw analytics events (short retention). Contains no IP addresses: visitors
 * are identified by a daily-rotating salted hash. `ingestId` makes worker
 * processing idempotent across retries.
 */
export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    ingestId: uuid().notNull().unique(),
    eventType: text().notNull(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    linkId: uuid(),
    blockId: uuid(),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    visitorHash: text().notNull(),
    referrerHost: text(),
    deviceType: text().notNull(),
    browser: text().notNull(),
    os: text().notNull(),
    country: text(),
    utmSource: text(),
    utmMedium: text(),
    utmCampaign: text(),
    utmTerm: text(),
    utmContent: text(),
    processedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.profileId, table.occurredAt), index().on(table.occurredAt)],
);

/** Daily totals per profile and event type. */
export const analyticsDailyStats = pgTable(
  "analytics_daily_stats",
  {
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    day: date({ mode: "string" }).notNull(),
    eventType: text().notNull(),
    count: bigint({ mode: "number" }).notNull().default(0),
    uniqueVisitors: bigint({ mode: "number" }).notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.day, table.eventType] })],
);

/** Daily breakdowns (referrer, country, device, browser, os, utm_source, link). */
export const analyticsDailyDimensions = pgTable(
  "analytics_daily_dimensions",
  {
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    day: date({ mode: "string" }).notNull(),
    eventType: text().notNull(),
    dimension: text().notNull(),
    value: text().notNull(),
    count: bigint({ mode: "number" }).notNull().default(0),
  },
  (table) => [
    primaryKey({
      columns: [table.profileId, table.day, table.eventType, table.dimension, table.value],
    }),
  ],
);

/** Per-day visitor set used to count unique visitors exactly (rotating hashes). */
export const analyticsDailyVisitors = pgTable(
  "analytics_daily_visitors",
  {
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    day: date({ mode: "string" }).notNull(),
    eventType: text().notNull(),
    visitorHash: text().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.profileId, table.day, table.eventType, table.visitorHash] }),
  ],
);

/** Monthly roll-up, recomputed idempotently from daily stats by the maintenance queue. */
export const analyticsMonthlyStats = pgTable(
  "analytics_monthly_stats",
  {
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    month: date({ mode: "string" }).notNull(),
    eventType: text().notNull(),
    count: bigint({ mode: "number" }).notNull().default(0),
    /** Sum of daily unique visitors (visitor ids rotate daily by design). */
    visitorDays: bigint({ mode: "number" }).notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.profileId, table.month, table.eventType] })],
);

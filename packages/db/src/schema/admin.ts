import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { primaryId } from "./_helpers";
import { users } from "./auth";

/**
 * Append-only audit trail. Never stores secrets, tokens or raw IP addresses.
 * Actor/organization ids are not foreign keys so records survive deletions.
 */
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: primaryId(),
    occurredAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    /** user | api_key | system */
    actorType: text().notNull(),
    actorUserId: uuid(),
    actorApiKeyId: uuid(),
    actorComponent: text(),
    action: text().notNull(),
    targetType: text(),
    targetId: text(),
    organizationId: uuid(),
    requestId: text(),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
  },
  (table) => [
    index().on(table.occurredAt),
    index().on(table.actorUserId, table.occurredAt),
    index().on(table.organizationId, table.occurredAt),
    index().on(table.targetType, table.targetId),
    index().on(table.action, table.occurredAt),
  ],
);

export const systemSettings = pgTable("system_settings", {
  key: text().primaryKey(),
  value: jsonb().notNull(),
  updatedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const featureFlags = pgTable("feature_flags", {
  key: text().primaryKey(),
  description: text(),
  enabled: boolean().notNull().default(false),
  /** Deterministic percentage rollout by subject id (0-100). */
  rolloutPercentage: integer().notNull().default(100),
  updatedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

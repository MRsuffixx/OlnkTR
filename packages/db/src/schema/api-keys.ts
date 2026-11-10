import {
  bigint,
  check,
  date,
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { exactlyOneOwner, primaryId } from "./_helpers";
import { users } from "./auth";
import { organizations } from "./organizations";

/**
 * API keys. Only a SHA-256 hash of the secret is stored; the full key is shown
 * once at creation. `prefix` is a public lookup identifier.
 */
export const apiKeys = pgTable(
  "api_keys",
  {
    id: primaryId(),
    ownerUserId: uuid().references(() => users.id, { onDelete: "cascade" }),
    ownerOrganizationId: uuid().references(() => organizations.id, { onDelete: "cascade" }),
    createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    name: text().notNull(),
    prefix: text().notNull().unique(),
    secretHash: text().notNull(),
    scopes: text().array().notNull(),
    lastUsedAt: timestamp({ withTimezone: true }),
    expiresAt: timestamp({ withTimezone: true }),
    revokedAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("api_keys_owner_check", exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId)),
    index().on(table.ownerUserId),
    index().on(table.ownerOrganizationId),
  ],
);

export const apiUsageDaily = pgTable(
  "api_usage_daily",
  {
    apiKeyId: uuid()
      .notNull()
      .references(() => apiKeys.id, { onDelete: "cascade" }),
    day: date({ mode: "string" }).notNull(),
    requestCount: bigint({ mode: "number" }).notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.apiKeyId, table.day] })],
);

import {
  bigint,
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./_helpers";

/**
 * Identity tables managed by Better Auth. Column keys must match Better Auth's
 * field names; custom fields (role, status, ...) are declared as
 * `user.additionalFields` in packages/auth.
 */
export const users = pgTable(
  "users",
  {
    id: primaryId(),
    name: text().notNull(),
    email: text().notNull().unique(),
    emailVerified: boolean().notNull().default(false),
    image: text(),
    twoFactorEnabled: boolean().default(false),
    /** Platform role: user | support | admin. Never settable by the user. */
    role: text().notNull().default("user"),
    /** Lifecycle status: active | suspended | pending_deletion */
    status: text().notNull().default("active"),
    suspendedAt: timestamp({ withTimezone: true }),
    suspensionReason: text(),
    deletionRequestedAt: timestamp({ withTimezone: true }),
    deletionScheduledFor: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [index().on(table.status), index().on(table.deletionScheduledFor)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: primaryId(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    token: text().notNull().unique(),
    ipAddress: text(),
    userAgent: text(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index().on(table.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: primaryId(),
    accountId: text().notNull(),
    providerId: text().notNull(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text(),
    refreshToken: text(),
    idToken: text(),
    accessTokenExpiresAt: timestamp({ withTimezone: true }),
    refreshTokenExpiresAt: timestamp({ withTimezone: true }),
    scope: text(),
    password: text(),
    ...timestamps,
  },
  (table) => [index().on(table.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: primaryId(),
    identifier: text().notNull(),
    value: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index().on(table.identifier)],
);

export const twoFactors = pgTable(
  "two_factors",
  {
    id: primaryId(),
    secret: text().notNull(),
    backupCodes: text().notNull(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    verified: boolean().default(false),
    failedVerificationCount: integer().default(0),
    lockedUntil: timestamp({ withTimezone: true }),
  },
  (table) => [index().on(table.userId), index().on(table.secret)],
);

/** Better Auth rate-limit counters (brute-force protection on auth endpoints). */
export const rateLimits = pgTable("rate_limits", {
  id: primaryId(),
  key: text().notNull().unique(),
  count: integer().notNull(),
  lastRequest: bigint({ mode: "number" }).notNull(),
});

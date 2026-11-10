import { sql } from "drizzle-orm";
import { index, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./_helpers";
import { users } from "./auth";

export const organizationRole = pgEnum("organization_role", ["owner", "admin", "editor", "viewer"]);
export const membershipStatus = pgEnum("membership_status", ["active", "suspended"]);
export const invitationStatus = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "revoked",
  "expired",
]);

export const organizations = pgTable("organizations", {
  id: primaryId(),
  name: text().notNull(),
  slug: text().notNull().unique(),
  /** active | suspended */
  status: text().notNull().default("active"),
  createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
  ...timestamps,
});

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: primaryId(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: organizationRole().notNull(),
    status: membershipStatus().notNull().default("active"),
    invitedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    joinedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    ...timestamps,
  },
  (table) => [uniqueIndex().on(table.organizationId, table.userId), index().on(table.userId)],
);

export const organizationInvitations = pgTable(
  "organization_invitations",
  {
    id: primaryId(),
    organizationId: uuid()
      .notNull()
      .references(() => organizations.id, { onDelete: "cascade" }),
    email: text().notNull(),
    role: organizationRole().notNull(),
    /** SHA-256 of the invitation token; the raw token is only ever emailed. */
    tokenHash: text().notNull().unique(),
    status: invitationStatus().notNull().default("pending"),
    invitedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    acceptedAt: timestamp({ withTimezone: true }),
    acceptedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("organization_invitations_pending_email_idx")
      .on(table.organizationId, table.email)
      .where(sql`${table.status} = 'pending'`),
  ],
);

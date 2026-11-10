import { integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import type { ProfileDocument } from "@olnktr/validators";
import { timestamps } from "./_helpers";
import { users } from "./auth";
import { profiles } from "./profiles";

/**
 * Studio drafts: one working document per profile. Edits never touch the
 * public page until the draft is published (materialized into profiles,
 * blocks and links). `revision` provides optimistic concurrency between tabs
 * and teammates; `publishedRevision` tells whether the draft has unpublished
 * changes; `baseFingerprint` detects live content changed outside the studio
 * (e.g. through the REST API) after the draft was started.
 */
export const profileDrafts = pgTable("profile_drafts", {
  profileId: uuid()
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  document: jsonb().$type<ProfileDocument>().notNull(),
  revision: integer().notNull().default(1),
  publishedRevision: integer(),
  baseFingerprint: text().notNull(),
  updatedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
  lastPublishedAt: timestamp({ withTimezone: true }),
  ...timestamps,
});

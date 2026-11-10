import {
  boolean,
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { exactlyOneOwner, primaryId, timestamps } from "./_helpers";
import { users } from "./auth";
import { mediaFiles } from "./media";
import { organizations } from "./organizations";
import { themes } from "./themes";

export const profileVisibility = pgEnum("profile_visibility", ["public", "unlisted", "private"]);
export const profileStatus = pgEnum("profile_status", ["draft", "published"]);

/**
 * Link-in-bio profiles. A profile is owned either by a user (personal) or by an
 * organization (team profile) — never both (CHECK constraint).
 */
export const profiles = pgTable(
  "profiles",
  {
    id: primaryId(),
    ownerUserId: uuid().references(() => users.id, { onDelete: "cascade" }),
    ownerOrganizationId: uuid().references(() => organizations.id, { onDelete: "cascade" }),
    createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    /** Normalized (lower-case) username; globally unique. */
    username: text().notNull().unique(),
    displayName: text().notNull(),
    bio: text(),
    avatarMediaId: uuid().references(() => mediaFiles.id, { onDelete: "set null" }),
    coverMediaId: uuid().references(() => mediaFiles.id, { onDelete: "set null" }),
    visibility: profileVisibility().notNull().default("public"),
    status: profileStatus().notNull().default("draft"),
    publishedAt: timestamp({ withTimezone: true }),
    seoTitle: text(),
    seoDescription: text(),
    seoNoIndex: boolean().notNull().default(false),
    themeId: uuid().references(() => themes.id, { onDelete: "set null" }),
    /** Pinned theme version; null = follow the theme's latest version. */
    themeVersion: integer(),
    ...timestamps,
  },
  (table) => [
    check("profiles_owner_check", exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId)),
    index().on(table.ownerUserId),
    index().on(table.ownerOrganizationId),
  ],
);

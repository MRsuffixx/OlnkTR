import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  primaryKey,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { ThemeConfig } from "@olnktr/validators/theme";
import { primaryId, timestamps } from "./_helpers";
import { users } from "./auth";
import { organizations } from "./organizations";

/**
 * Themes. System themes have no owner; community/custom themes are owned by a
 * user or an organization. Configuration lives in immutable, numbered versions.
 */
export const themes = pgTable(
  "themes",
  {
    id: primaryId(),
    /** Stable identifier for system themes (e.g. "default"); null for custom themes. */
    key: text().unique(),
    name: text().notNull(),
    description: text(),
    ownerUserId: uuid().references(() => users.id, { onDelete: "cascade" }),
    ownerOrganizationId: uuid().references(() => organizations.id, { onDelete: "cascade" }),
    /** private = owner only; public = listed for everyone (community themes) */
    visibility: text().notNull().default("private"),
    isPremium: boolean().notNull().default(false),
    /** active | archived */
    status: text().notNull().default("active"),
    latestVersion: integer().notNull().default(1),
    /** Catalogue category (minimal, editorial, bold, dark, business, custom). */
    category: text().notNull().default("custom"),
    author: text(),
    ...timestamps,
  },
  (table) => [
    check(
      "themes_owner_check",
      sql`num_nonnulls(${table.ownerUserId}, ${table.ownerOrganizationId}) <= 1`,
    ),
    index().on(table.ownerUserId),
    index().on(table.ownerOrganizationId),
  ],
);

export const themeVersions = pgTable(
  "theme_versions",
  {
    id: primaryId(),
    themeId: uuid()
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
    version: integer().notNull(),
    config: jsonb().$type<ThemeConfig>().notNull(),
    createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex().on(table.themeId, table.version)],
);

/** Per-user favourite themes (studio theme picker). */
export const themeFavorites = pgTable(
  "theme_favorites",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    themeId: uuid()
      .notNull()
      .references(() => themes.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.themeId] }), index().on(table.themeId)],
);

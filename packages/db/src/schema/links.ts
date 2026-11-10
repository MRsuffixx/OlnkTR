import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { primaryId, timestamps } from "./_helpers";
import { profiles } from "./profiles";

export interface LinkMetadata {
  description?: string;
  icon?: string;
  thumbnailMediaId?: string;
  openInNewTab?: boolean;
}

export const linkCategories = pgTable(
  "link_categories",
  {
    id: primaryId(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    name: text().notNull(),
    position: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [index().on(table.profileId)],
);

/**
 * Links. Display order is owned by the profile's block layout: every link has
 * exactly one `blocks` row of type "link" referencing it.
 */
export const links = pgTable(
  "links",
  {
    id: primaryId(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    categoryId: uuid().references(() => linkCategories.id, { onDelete: "set null" }),
    title: text().notNull(),
    url: text().notNull(),
    isActive: boolean().notNull().default(true),
    startsAt: timestamp({ withTimezone: true }),
    endsAt: timestamp({ withTimezone: true }),
    metadata: jsonb().$type<LinkMetadata>().notNull().default({}),
    /** Denormalized lifetime click counter maintained by the analytics worker. */
    clickCount: bigint({ mode: "number" }).notNull().default(0),
    ...timestamps,
  },
  (table) => [index().on(table.profileId)],
);

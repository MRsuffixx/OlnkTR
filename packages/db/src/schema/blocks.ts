import { boolean, index, integer, jsonb, pgTable, text, uuid } from "drizzle-orm/pg-core";
import type { BlockAppearance } from "@olnktr/validators/theme";
import { primaryId, timestamps } from "./_helpers";
import { links } from "./links";
import { profiles } from "./profiles";

/**
 * Profile content blocks. `type` + `schemaVersion` select the registry
 * definition used to validate/migrate `config` (see @olnktr/validators/blocks).
 */
export const blocks = pgTable(
  "blocks",
  {
    id: primaryId(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    type: text().notNull(),
    schemaVersion: integer().notNull(),
    config: jsonb().$type<Record<string, unknown>>().notNull(),
    position: integer().notNull(),
    isVisible: boolean().notNull().default(true),
    /** Per-block appearance overrides (layer 3 of the theme inheritance model). */
    appearance: jsonb().$type<BlockAppearance>(),
    /** Set only for blocks of type "link"; the link aggregate owns these blocks. */
    linkId: uuid()
      .unique()
      .references(() => links.id, { onDelete: "cascade" }),
    ...timestamps,
  },
  (table) => [index().on(table.profileId, table.position)],
);

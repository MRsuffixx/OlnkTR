import {
  bigint,
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
import { organizations } from "./organizations";

export const mediaStatus = pgEnum("media_status", ["pending", "ready", "rejected", "deleted"]);

export const mediaFiles = pgTable(
  "media_files",
  {
    id: primaryId(),
    ownerUserId: uuid().references(() => users.id, { onDelete: "cascade" }),
    ownerOrganizationId: uuid().references(() => organizations.id, { onDelete: "cascade" }),
    uploadedByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    purpose: text().notNull(),
    storageKey: text().notNull().unique(),
    originalFilename: text().notNull(),
    declaredMimeType: text().notNull(),
    /** MIME type detected from the file's magic bytes after upload. */
    mimeType: text(),
    declaredSizeBytes: bigint({ mode: "number" }).notNull(),
    sizeBytes: bigint({ mode: "number" }),
    width: integer(),
    height: integer(),
    status: mediaStatus().notNull().default("pending"),
    rejectionReason: text(),
    readyAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    check("media_files_owner_check", exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId)),
    index().on(table.ownerUserId, table.status),
    index().on(table.ownerOrganizationId, table.status),
    index().on(table.status, table.createdAt),
  ],
);

import { sql, type AnyColumn } from "drizzle-orm";
import { timestamp, uuid } from "drizzle-orm/pg-core";

/** `created_at` / `updated_at` columns (timestamptz). `updated_at` is maintained by the ORM. */
export const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const primaryId = () => uuid().primaryKey().defaultRandom();

/** CHECK expression for tenant-owned rows: personal XOR organization owner. */
export const exactlyOneOwner = (userColumn: AnyColumn, organizationColumn: AnyColumn) =>
  sql`num_nonnulls(${userColumn}, ${organizationColumn}) = 1`;

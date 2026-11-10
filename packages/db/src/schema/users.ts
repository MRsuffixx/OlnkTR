import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const userPreferences = pgTable("user_preferences", {
  userId: uuid()
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  locale: text().notNull().default("en"),
  timezone: text().notNull().default("UTC"),
  marketingEmails: boolean().notNull().default(false),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

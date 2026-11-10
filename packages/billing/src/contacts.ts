import { and, eq, schema, type DbExecutor } from "@olnktr/db";
import type { OwnerRef } from "@olnktr/types";

export interface BillingContact {
  email: string;
  name: string;
  locale: "en" | "tr";
}

/** Billing notifications go to the user, or to all owners of an organization. */
export async function resolveBillingContacts(
  db: DbExecutor,
  owner: OwnerRef,
): Promise<BillingContact[]> {
  const rows =
    owner.type === "user"
      ? await db
          .select({
            email: schema.users.email,
            name: schema.users.name,
            locale: schema.userPreferences.locale,
          })
          .from(schema.users)
          .leftJoin(schema.userPreferences, eq(schema.userPreferences.userId, schema.users.id))
          .where(eq(schema.users.id, owner.userId))
      : await db
          .select({
            email: schema.users.email,
            name: schema.users.name,
            locale: schema.userPreferences.locale,
          })
          .from(schema.organizationMembers)
          .innerJoin(schema.users, eq(schema.users.id, schema.organizationMembers.userId))
          .leftJoin(schema.userPreferences, eq(schema.userPreferences.userId, schema.users.id))
          .where(
            and(
              eq(schema.organizationMembers.organizationId, owner.organizationId),
              eq(schema.organizationMembers.role, "owner"),
              eq(schema.organizationMembers.status, "active"),
            ),
          );
  return rows.map((row) => ({
    email: row.email,
    name: row.name,
    locale: row.locale === "tr" ? "tr" : "en",
  }));
}

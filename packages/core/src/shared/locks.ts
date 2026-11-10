import { eq, schema, type Transaction } from "@olnktr/db";
import { errors, type OwnerRef } from "@olnktr/types";

/**
 * Serializes quota-checked writes per owner: lock the owner row before
 * counting usage and inserting, so concurrent requests cannot exceed limits.
 */
export async function lockOwner(tx: Transaction, owner: OwnerRef): Promise<void> {
  const rows =
    owner.type === "user"
      ? await tx
          .select({ id: schema.users.id })
          .from(schema.users)
          .where(eq(schema.users.id, owner.userId))
          .for("update")
      : await tx
          .select({ id: schema.organizations.id })
          .from(schema.organizations)
          .where(eq(schema.organizations.id, owner.organizationId))
          .for("update");
  if (rows.length === 0) throw errors.notFound(owner.type === "user" ? "User" : "Organization");
}

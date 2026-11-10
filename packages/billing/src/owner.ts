import { and, eq, isNull, type AnyPgColumn, type SQL } from "@olnktr/db";
import type { OwnerRef } from "@olnktr/types";

/** WHERE clause matching rows owned by `owner` on tables with owner_user_id / owner_organization_id. */
export function ownerWhere(
  table: { ownerUserId: AnyPgColumn; ownerOrganizationId: AnyPgColumn },
  owner: OwnerRef,
): SQL {
  return owner.type === "user"
    ? and(eq(table.ownerUserId, owner.userId), isNull(table.ownerOrganizationId))!
    : and(eq(table.ownerOrganizationId, owner.organizationId), isNull(table.ownerUserId))!;
}

export function ownerColumns(owner: OwnerRef): {
  ownerUserId: string | null;
  ownerOrganizationId: string | null;
} {
  return owner.type === "user"
    ? { ownerUserId: owner.userId, ownerOrganizationId: null }
    : { ownerUserId: null, ownerOrganizationId: owner.organizationId };
}

export function ownerFromRow(row: {
  ownerUserId: string | null;
  ownerOrganizationId: string | null;
}): OwnerRef {
  if (row.ownerUserId) return { type: "user", userId: row.ownerUserId };
  if (row.ownerOrganizationId)
    return { type: "organization", organizationId: row.ownerOrganizationId };
  throw new Error("Row has no owner");
}

export function ownerKey(owner: OwnerRef): string {
  return owner.type === "user" ? `user:${owner.userId}` : `organization:${owner.organizationId}`;
}

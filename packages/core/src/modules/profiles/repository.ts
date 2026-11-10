import { and, count, eq, isNull, schema, type DbExecutor } from "@olnktr/db";
import type { OwnerRef } from "@olnktr/types";

/** Data-access functions for the profiles module. */
export const profileRepository = {
  async findByUsername(db: DbExecutor, username: string) {
    const [row] = await db
      .select()
      .from(schema.profiles)
      .where(eq(schema.profiles.username, username));
    return row ?? null;
  },

  async listByOwner(db: DbExecutor, owner: OwnerRef) {
    return db
      .select()
      .from(schema.profiles)
      .where(
        owner.type === "user"
          ? and(
              eq(schema.profiles.ownerUserId, owner.userId),
              isNull(schema.profiles.ownerOrganizationId),
            )
          : eq(schema.profiles.ownerOrganizationId, owner.organizationId),
      )
      .orderBy(schema.profiles.createdAt);
  },

  async countByOwner(db: DbExecutor, owner: OwnerRef): Promise<number> {
    const [row] = await db
      .select({ n: count() })
      .from(schema.profiles)
      .where(
        owner.type === "user"
          ? and(
              eq(schema.profiles.ownerUserId, owner.userId),
              isNull(schema.profiles.ownerOrganizationId),
            )
          : eq(schema.profiles.ownerOrganizationId, owner.organizationId),
      );
    return row?.n ?? 0;
  },
};

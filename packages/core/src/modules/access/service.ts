import { and, eq, schema, type DbExecutor } from "@olnktr/db";
import { errors, type Actor, type OwnerRef, type UserActor } from "@olnktr/types";
import type { OrganizationRole } from "@olnktr/validators";
import {
  PERMISSION_SCOPES,
  platformRoleHasPermission,
  roleHasPermission,
  type AdminPermission,
  type OrganizationPermission,
} from "./permissions";

/**
 * Central authorization service — every tenant-scoped operation goes through
 * here. Client-supplied organization ids are never trusted: membership and
 * role are always re-read from the database.
 *
 * Resources the actor cannot see produce NOT_FOUND (not FORBIDDEN) so that
 * resource ids cannot be probed (IDOR / enumeration resistance). Members that
 * can see a resource but lack the specific permission get FORBIDDEN.
 */
export type ProfileRow = typeof schema.profiles.$inferSelect;

export interface Membership {
  organizationId: string;
  role: OrganizationRole;
}

export function createAccessService(deps: { db: DbExecutor }) {
  async function getMembership(
    userId: string,
    organizationId: string,
    executor: DbExecutor = deps.db,
  ): Promise<Membership | null> {
    const [row] = await executor
      .select({ role: schema.organizationMembers.role, orgStatus: schema.organizations.status })
      .from(schema.organizationMembers)
      .innerJoin(
        schema.organizations,
        eq(schema.organizations.id, schema.organizationMembers.organizationId),
      )
      .where(
        and(
          eq(schema.organizationMembers.organizationId, organizationId),
          eq(schema.organizationMembers.userId, userId),
          eq(schema.organizationMembers.status, "active"),
        ),
      );
    if (!row || row.orgStatus !== "active") return null;
    return { organizationId, role: row.role };
  }

  function assertScope(actor: Actor, permission: OrganizationPermission): void {
    if (actor.type !== "api_key") return;
    const scope = PERMISSION_SCOPES[permission];
    if (!scope || !actor.scopes.includes(scope))
      throw errors.forbidden("API key is missing the required scope");
  }

  /** Verifies the actor holds `permission` in the organization. Returns the membership. */
  async function assertOrganizationPermission(
    actor: Actor,
    organizationId: string,
    permission: OrganizationPermission,
    executor: DbExecutor = deps.db,
  ): Promise<Membership | null> {
    if (actor.type === "system") return null;
    if (actor.type === "api_key") {
      if (actor.organizationId !== organizationId) throw errors.notFound("Organization");
      assertScope(actor, permission);
      return null;
    }
    const membership = await getMembership(actor.userId, organizationId, executor);
    if (!membership) throw errors.notFound("Organization");
    if (!roleHasPermission(membership.role, permission)) throw errors.forbidden();
    return membership;
  }

  /**
   * Resolves the owner for a create/list operation: personal (no organization)
   * or a verified organization the actor may act on.
   */
  async function resolveOwner(
    actor: Actor,
    organizationId: string | null | undefined,
    permission: OrganizationPermission,
    executor: DbExecutor = deps.db,
  ): Promise<OwnerRef> {
    if (actor.type === "system")
      throw errors.forbidden("System actors must specify an explicit owner");
    if (actor.type === "api_key") {
      assertScope(actor, permission);
      if (actor.organizationId) {
        if (organizationId && organizationId !== actor.organizationId)
          throw errors.notFound("Organization");
        return { type: "organization", organizationId: actor.organizationId };
      }
      if (organizationId) throw errors.notFound("Organization");
      return { type: "user", userId: actor.userId! };
    }
    if (!organizationId) return { type: "user", userId: actor.userId };
    await assertOrganizationPermission(actor, organizationId, permission, executor);
    return { type: "organization", organizationId };
  }

  /** Authorizes `permission` on an owner (personal or organization). */
  async function assertOwnerPermission(
    actor: Actor,
    owner: OwnerRef,
    permission: OrganizationPermission,
    executor: DbExecutor = deps.db,
  ): Promise<void> {
    if (actor.type === "system") return;
    if (owner.type === "organization") {
      await assertOrganizationPermission(actor, owner.organizationId, permission, executor);
      return;
    }
    if (actor.type === "api_key") {
      if (actor.organizationId || actor.userId !== owner.userId) throw errors.notFound();
      assertScope(actor, permission);
      return;
    }
    if (actor.userId !== owner.userId) throw errors.notFound();
  }

  /** Loads a profile and authorizes the actor; optionally locks the row (FOR UPDATE). */
  async function authorizeProfile(
    actor: Actor,
    profileId: string,
    permission: OrganizationPermission,
    options: { executor?: DbExecutor; lock?: boolean } = {},
  ): Promise<ProfileRow> {
    const executor = options.executor ?? deps.db;
    const query = executor.select().from(schema.profiles).where(eq(schema.profiles.id, profileId));
    const [profile] = options.lock ? await query.for("update") : await query;
    if (!profile) throw errors.notFound("Profile");
    try {
      await assertOwnerPermission(actor, profileOwner(profile), permission, executor);
    } catch (error) {
      // Hide existence of other tenants' profiles.
      if ((error as { code?: string }).code === "NOT_FOUND") throw errors.notFound("Profile");
      throw error;
    }
    return profile;
  }

  return {
    getMembership,
    assertOrganizationPermission,
    resolveOwner,
    assertOwnerPermission,
    authorizeProfile,
    assertAdmin,
  };
}

/** Verifies the actor's platform role grants an administration permission. */
export function assertAdmin(actor: Actor, permission: AdminPermission): asserts actor is UserActor {
  if (actor.type !== "user" || !platformRoleHasPermission(actor.platformRole, permission)) {
    throw errors.forbidden("Administrator privileges required");
  }
}

export function profileOwner(
  profile: Pick<ProfileRow, "ownerUserId" | "ownerOrganizationId">,
): OwnerRef {
  return profile.ownerOrganizationId
    ? { type: "organization", organizationId: profile.ownerOrganizationId }
    : { type: "user", userId: profile.ownerUserId! };
}

export type AccessService = ReturnType<typeof createAccessService>;

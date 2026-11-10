import { createHash, randomBytes } from "node:crypto";
import {
  and,
  count,
  eq,
  gt,
  inArray,
  isUniqueViolation,
  lt,
  schema,
  type DbExecutor,
} from "@olnktr/db";
import { errors, type Actor, type UserActor } from "@olnktr/types";
import type { OrganizationRole } from "@olnktr/validators";
import { ROLE_RANK, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";
import { lockOwner } from "../../shared/locks";

const INVITATION_TTL_MS = 7 * 86_400_000;

export const hashInvitationToken = (token: string) =>
  createHash("sha256").update(token).digest("hex");

function requireUser(actor: Actor): UserActor {
  if (actor.type !== "user")
    throw errors.forbidden("Only signed-in users can manage organizations");
  return actor;
}

/** Seats = active members + pending (unexpired) invitations. */
export async function countSeats(
  executor: DbExecutor,
  organizationId: string,
  now: Date,
): Promise<number> {
  const [members] = await executor
    .select({ n: count() })
    .from(schema.organizationMembers)
    .where(
      and(
        eq(schema.organizationMembers.organizationId, organizationId),
        eq(schema.organizationMembers.status, "active"),
      ),
    );
  const [invites] = await executor
    .select({ n: count() })
    .from(schema.organizationInvitations)
    .where(
      and(
        eq(schema.organizationInvitations.organizationId, organizationId),
        eq(schema.organizationInvitations.status, "pending"),
        gt(schema.organizationInvitations.expiresAt, now),
      ),
    );
  return (members?.n ?? 0) + (invites?.n ?? 0);
}

export function createOrganizationService(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { db, access, audit } = deps;

  async function ownerCount(executor: DbExecutor, organizationId: string) {
    const [row] = await executor
      .select({ n: count() })
      .from(schema.organizationMembers)
      .where(
        and(
          eq(schema.organizationMembers.organizationId, organizationId),
          eq(schema.organizationMembers.role, "owner"),
          eq(schema.organizationMembers.status, "active"),
        ),
      );
    return row?.n ?? 0;
  }

  return {
    async create(actor: Actor, input: { name: string; slug: string }) {
      const user = requireUser(actor);
      try {
        return await db.transaction(async (tx) => {
          const [organization] = await tx
            .insert(schema.organizations)
            .values({ name: input.name, slug: input.slug, createdByUserId: user.userId })
            .returning();
          if (!organization) throw errors.internal();
          await tx
            .insert(schema.organizationMembers)
            .values({ organizationId: organization.id, userId: user.userId, role: "owner" });
          await audit.record(
            {
              actor,
              action: "organization.created",
              targetType: "organization",
              targetId: organization.id,
              organizationId: organization.id,
            },
            tx,
          );
          return organization;
        });
      } catch (error) {
        if (isUniqueViolation(error))
          throw errors.conflict("This organization slug is already taken", { field: "slug" });
        throw error;
      }
    },

    async listForActor(actor: Actor) {
      const user = requireUser(actor);
      return db
        .select({ organization: schema.organizations, role: schema.organizationMembers.role })
        .from(schema.organizationMembers)
        .innerJoin(
          schema.organizations,
          eq(schema.organizations.id, schema.organizationMembers.organizationId),
        )
        .where(
          and(
            eq(schema.organizationMembers.userId, user.userId),
            eq(schema.organizationMembers.status, "active"),
          ),
        );
    },

    async get(actor: Actor, organizationId: string) {
      const membership = await access.assertOrganizationPermission(
        actor,
        organizationId,
        "organization:read",
      );
      const [organization] = await db
        .select()
        .from(schema.organizations)
        .where(eq(schema.organizations.id, organizationId));
      if (!organization) throw errors.notFound("Organization");
      return { organization, role: membership?.role ?? null };
    },

    async update(actor: Actor, input: { organizationId: string; name?: string; slug?: string }) {
      await access.assertOrganizationPermission(actor, input.organizationId, "organization:update");
      try {
        return await db.transaction(async (tx) => {
          const [organization] = await tx
            .update(schema.organizations)
            .set({ name: input.name, slug: input.slug })
            .where(eq(schema.organizations.id, input.organizationId))
            .returning();
          await audit.record(
            {
              actor,
              action: "organization.updated",
              targetType: "organization",
              targetId: input.organizationId,
              organizationId: input.organizationId,
              metadata: { name: input.name, slug: input.slug },
            },
            tx,
          );
          return organization;
        });
      } catch (error) {
        if (isUniqueViolation(error))
          throw errors.conflict("This organization slug is already taken", { field: "slug" });
        throw error;
      }
    },

    async delete(actor: Actor, organizationId: string) {
      await access.assertOrganizationPermission(actor, organizationId, "organization:delete");
      const summary = await deps.billing.getSummary({ type: "organization", organizationId });
      if (summary.entitlements.source !== "default") {
        throw errors.precondition("Cancel the organization's subscription before deleting it");
      }
      await db.transaction(async (tx) => {
        await tx.delete(schema.organizations).where(eq(schema.organizations.id, organizationId));
        await audit.record(
          {
            actor,
            action: "organization.deleted",
            targetType: "organization",
            targetId: organizationId,
            organizationId,
          },
          tx,
        );
      });
    },

    async listMembers(actor: Actor, organizationId: string) {
      await access.assertOrganizationPermission(actor, organizationId, "members:read");
      const members = await db
        .select({
          userId: schema.organizationMembers.userId,
          role: schema.organizationMembers.role,
          status: schema.organizationMembers.status,
          joinedAt: schema.organizationMembers.joinedAt,
          name: schema.users.name,
          email: schema.users.email,
        })
        .from(schema.organizationMembers)
        .innerJoin(schema.users, eq(schema.users.id, schema.organizationMembers.userId))
        .where(eq(schema.organizationMembers.organizationId, organizationId));
      const invitations = await db
        .select({
          id: schema.organizationInvitations.id,
          email: schema.organizationInvitations.email,
          role: schema.organizationInvitations.role,
          expiresAt: schema.organizationInvitations.expiresAt,
        })
        .from(schema.organizationInvitations)
        .where(
          and(
            eq(schema.organizationInvitations.organizationId, organizationId),
            eq(schema.organizationInvitations.status, "pending"),
          ),
        );
      return { members, invitations };
    },

    async invite(
      actor: Actor,
      input: { organizationId: string; email: string; role: Exclude<OrganizationRole, "owner"> },
    ) {
      const user = requireUser(actor);
      const membership = await access.assertOrganizationPermission(
        actor,
        input.organizationId,
        "members:manage",
      );
      if (membership && ROLE_RANK[input.role] > ROLE_RANK[membership.role])
        throw errors.forbidden("You cannot grant a role higher than your own");
      const token = randomBytes(32).toString("base64url");
      const now = deps.clock.now();
      const organization = await db.transaction(async (tx) => {
        await lockOwner(tx, { type: "organization", organizationId: input.organizationId });
        const [existingMember] = await tx
          .select({ id: schema.organizationMembers.id })
          .from(schema.organizationMembers)
          .innerJoin(schema.users, eq(schema.users.id, schema.organizationMembers.userId))
          .where(
            and(
              eq(schema.organizationMembers.organizationId, input.organizationId),
              eq(schema.users.email, input.email),
            ),
          );
        if (existingMember) throw errors.conflict("This person is already a member");
        // Expire a stale pending invitation for the same email so it can be re-sent.
        await tx
          .update(schema.organizationInvitations)
          .set({ status: "expired" })
          .where(
            and(
              eq(schema.organizationInvitations.organizationId, input.organizationId),
              eq(schema.organizationInvitations.email, input.email),
              eq(schema.organizationInvitations.status, "pending"),
              lt(schema.organizationInvitations.expiresAt, now),
            ),
          );
        const seats = await countSeats(tx, input.organizationId, now);
        const resolution = await deps.entitlements.getOrganizationEntitlements(
          input.organizationId,
          tx,
        );
        const limit = resolution.entitlements["team.members.limit"];
        if (limit !== null && seats + 1 > limit)
          throw errors.quotaExceeded("team.members.limit", limit);
        try {
          const [invitation] = await tx
            .insert(schema.organizationInvitations)
            .values({
              organizationId: input.organizationId,
              email: input.email,
              role: input.role,
              tokenHash: hashInvitationToken(token),
              invitedByUserId: user.userId,
              expiresAt: new Date(now.getTime() + INVITATION_TTL_MS),
            })
            .returning({ id: schema.organizationInvitations.id });
          await audit.record(
            {
              actor,
              action: "organization.member_invited",
              targetType: "invitation",
              targetId: invitation?.id,
              organizationId: input.organizationId,
              metadata: { role: input.role },
            },
            tx,
          );
        } catch (error) {
          if (isUniqueViolation(error))
            throw errors.conflict("An invitation is already pending for this email");
          throw error;
        }
        const [org] = await tx
          .select({ name: schema.organizations.name })
          .from(schema.organizations)
          .where(eq(schema.organizations.id, input.organizationId));
        return org;
      });
      const [inviter] = await db
        .select({ name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, user.userId));
      const url = new URL("/invitations/accept", deps.config.appUrl);
      url.searchParams.set("token", token);
      try {
        await deps.jobs.enqueue("email", "send", {
          to: input.email,
          template: "organization-invitation",
          locale: "en",
          props: {
            organizationName: organization?.name ?? "",
            inviterName: inviter?.name ?? "",
            role: input.role,
            url: url.toString(),
          },
        });
      } catch (error) {
        deps.logger.error({ err: error }, "failed to enqueue invitation email");
      }
      return { invited: true as const };
    },

    async acceptInvitation(actor: Actor, token: string) {
      const user = requireUser(actor);
      const now = deps.clock.now();
      return db.transaction(async (tx) => {
        const [invitation] = await tx
          .select()
          .from(schema.organizationInvitations)
          .where(
            and(
              eq(schema.organizationInvitations.tokenHash, hashInvitationToken(token)),
              eq(schema.organizationInvitations.status, "pending"),
            ),
          )
          .for("update");
        if (!invitation) throw errors.notFound("Invitation");
        if (invitation.expiresAt < now) {
          await tx
            .update(schema.organizationInvitations)
            .set({ status: "expired" })
            .where(eq(schema.organizationInvitations.id, invitation.id));
          throw errors.precondition("This invitation has expired");
        }
        const [account] = await tx
          .select({ email: schema.users.email, emailVerified: schema.users.emailVerified })
          .from(schema.users)
          .where(eq(schema.users.id, user.userId));
        // The invitation is bound to the invited email address, which must be verified.
        if (
          !account ||
          account.email.toLowerCase() !== invitation.email ||
          !account.emailVerified
        ) {
          throw errors.forbidden("This invitation was sent to a different email address");
        }
        await tx
          .insert(schema.organizationMembers)
          .values({
            organizationId: invitation.organizationId,
            userId: user.userId,
            role: invitation.role,
            invitedByUserId: invitation.invitedByUserId,
          })
          .onConflictDoNothing();
        await tx
          .update(schema.organizationInvitations)
          .set({ status: "accepted", acceptedAt: now, acceptedByUserId: user.userId })
          .where(eq(schema.organizationInvitations.id, invitation.id));
        await audit.record(
          {
            actor,
            action: "organization.member_joined",
            targetType: "user",
            targetId: user.userId,
            organizationId: invitation.organizationId,
            metadata: { role: invitation.role },
          },
          tx,
        );
        return { organizationId: invitation.organizationId, role: invitation.role };
      });
    },

    async revokeInvitation(actor: Actor, input: { organizationId: string; invitationId: string }) {
      await access.assertOrganizationPermission(actor, input.organizationId, "members:manage");
      await db.transaction(async (tx) => {
        const [updated] = await tx
          .update(schema.organizationInvitations)
          .set({ status: "revoked" })
          .where(
            and(
              eq(schema.organizationInvitations.id, input.invitationId),
              eq(schema.organizationInvitations.organizationId, input.organizationId),
              eq(schema.organizationInvitations.status, "pending"),
            ),
          )
          .returning({ id: schema.organizationInvitations.id });
        if (!updated) throw errors.notFound("Invitation");
        await audit.record(
          {
            actor,
            action: "organization.invitation_revoked",
            targetType: "invitation",
            targetId: input.invitationId,
            organizationId: input.organizationId,
          },
          tx,
        );
      });
    },

    async updateMemberRole(
      actor: Actor,
      input: { organizationId: string; userId: string; role: OrganizationRole },
    ) {
      const membership = await access.assertOrganizationPermission(
        actor,
        input.organizationId,
        "members:manage",
      );
      await db.transaction(async (tx) => {
        await lockOwner(tx, { type: "organization", organizationId: input.organizationId });
        const [target] = await tx
          .select()
          .from(schema.organizationMembers)
          .where(
            and(
              eq(schema.organizationMembers.organizationId, input.organizationId),
              eq(schema.organizationMembers.userId, input.userId),
            ),
          );
        if (!target) throw errors.notFound("Member");
        if (membership && membership.role !== "owner") {
          // Non-owners can only manage members below them and grant roles below them.
          if (
            ROLE_RANK[target.role] >= ROLE_RANK[membership.role] ||
            ROLE_RANK[input.role] >= ROLE_RANK[membership.role]
          ) {
            throw errors.forbidden("You cannot change the role of this member");
          }
        }
        if (
          target.role === "owner" &&
          input.role !== "owner" &&
          (await ownerCount(tx, input.organizationId)) <= 1
        ) {
          throw errors.precondition("An organization must keep at least one owner");
        }
        await tx
          .update(schema.organizationMembers)
          .set({ role: input.role })
          .where(eq(schema.organizationMembers.id, target.id));
        await audit.record(
          {
            actor,
            action: "organization.member_role_changed",
            targetType: "user",
            targetId: input.userId,
            organizationId: input.organizationId,
            metadata: { from: target.role, to: input.role },
          },
          tx,
        );
      });
    },

    async removeMember(actor: Actor, input: { organizationId: string; userId: string }) {
      const isSelf = actor.type === "user" && actor.userId === input.userId;
      const membership = isSelf
        ? await access.assertOrganizationPermission(
            actor,
            input.organizationId,
            "organization:read",
          )
        : await access.assertOrganizationPermission(actor, input.organizationId, "members:manage");
      await db.transaction(async (tx) => {
        await lockOwner(tx, { type: "organization", organizationId: input.organizationId });
        const [target] = await tx
          .select()
          .from(schema.organizationMembers)
          .where(
            and(
              eq(schema.organizationMembers.organizationId, input.organizationId),
              eq(schema.organizationMembers.userId, input.userId),
            ),
          );
        if (!target) throw errors.notFound("Member");
        if (
          !isSelf &&
          membership &&
          membership.role !== "owner" &&
          ROLE_RANK[target.role] >= ROLE_RANK[membership.role]
        ) {
          throw errors.forbidden("You cannot remove this member");
        }
        if (target.role === "owner" && (await ownerCount(tx, input.organizationId)) <= 1) {
          throw errors.precondition(
            "The last owner cannot leave or be removed; transfer ownership first",
          );
        }
        await tx
          .delete(schema.organizationMembers)
          .where(eq(schema.organizationMembers.id, target.id));
        await audit.record(
          {
            actor,
            action: isSelf ? "organization.member_left" : "organization.member_removed",
            targetType: "user",
            targetId: input.userId,
            organizationId: input.organizationId,
          },
          tx,
        );
      });
    },

    async expireInvitations() {
      const expired = await db
        .update(schema.organizationInvitations)
        .set({ status: "expired" })
        .where(
          and(
            eq(schema.organizationInvitations.status, "pending"),
            lt(schema.organizationInvitations.expiresAt, deps.clock.now()),
          ),
        )
        .returning({ id: schema.organizationInvitations.id });
      return expired.length;
    },

    /** Organizations where the user is the only active owner and other members exist. */
    async soleOwnershipConflicts(userId: string, executor: DbExecutor = db) {
      const owned = await executor
        .select({ organizationId: schema.organizationMembers.organizationId })
        .from(schema.organizationMembers)
        .where(
          and(
            eq(schema.organizationMembers.userId, userId),
            eq(schema.organizationMembers.role, "owner"),
          ),
        );
      const conflicts: string[] = [];
      for (const { organizationId } of owned) {
        const [members] = await executor
          .select({ n: count() })
          .from(schema.organizationMembers)
          .where(
            and(
              eq(schema.organizationMembers.organizationId, organizationId),
              eq(schema.organizationMembers.status, "active"),
            ),
          );
        if ((await ownerCount(executor, organizationId)) <= 1 && (members?.n ?? 0) > 1)
          conflicts.push(organizationId);
      }
      return conflicts;
    },

    /** Organizations whose only member is the user (deleted together with the account). */
    async soloOrganizations(userId: string, executor: DbExecutor = db) {
      const memberships = await executor
        .select({ organizationId: schema.organizationMembers.organizationId })
        .from(schema.organizationMembers)
        .where(eq(schema.organizationMembers.userId, userId));
      if (memberships.length === 0) return [];
      const counts = await executor
        .select({ organizationId: schema.organizationMembers.organizationId, n: count() })
        .from(schema.organizationMembers)
        .where(
          inArray(
            schema.organizationMembers.organizationId,
            memberships.map((m) => m.organizationId),
          ),
        )
        .groupBy(schema.organizationMembers.organizationId);
      return counts.filter((row) => row.n === 1).map((row) => row.organizationId);
    },
  };
}

export type OrganizationService = ReturnType<typeof createOrganizationService>;

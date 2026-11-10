import { and, eq, inArray, lt, schema } from "@olnktr/db";
import { errors, systemActor, type Actor, type UserActor } from "@olnktr/types";
import type { AuditService } from "../audit/index";
import type { OrganizationService } from "../organizations/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * User lifecycle:
 *
 *   active ──(admin suspend)──► suspended ──(admin restore)──► active
 *   active ──(user requests deletion)──► pending_deletion
 *   pending_deletion ──(user cancels within grace period)──► active
 *   pending_deletion ──(grace period over, maintenance job)──► deleted (row removed)
 *
 * Suspended users cannot sign in, their sessions are revoked, and their public
 * profiles are hidden. Pending-deletion users keep access so they can cancel,
 * but their public profiles are hidden immediately.
 */
export const USER_STATUSES = ["active", "suspended", "pending_deletion"] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

function requireUser(actor: Actor): UserActor {
  if (actor.type !== "user") throw errors.forbidden("Only signed-in users can do this");
  return actor;
}

export function createUserService(
  deps: CoreDeps & { audit: AuditService; organizations: OrganizationService },
) {
  const { db, audit } = deps;

  async function revokeSessions(userId: string) {
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  }

  return {
    /** Called once after sign-up (auth hook). Idempotent. */
    async initializeUser(userId: string, locale: "en" | "tr") {
      await db.insert(schema.userPreferences).values({ userId, locale }).onConflictDoNothing();
    },

    async getMe(actor: Actor) {
      const user = requireUser(actor);
      const [row] = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          emailVerified: schema.users.emailVerified,
          image: schema.users.image,
          role: schema.users.role,
          status: schema.users.status,
          twoFactorEnabled: schema.users.twoFactorEnabled,
          deletionScheduledFor: schema.users.deletionScheduledFor,
          createdAt: schema.users.createdAt,
          locale: schema.userPreferences.locale,
          timezone: schema.userPreferences.timezone,
          marketingEmails: schema.userPreferences.marketingEmails,
        })
        .from(schema.users)
        .leftJoin(schema.userPreferences, eq(schema.userPreferences.userId, schema.users.id))
        .where(eq(schema.users.id, user.userId));
      if (!row) throw errors.notFound("User");
      return row;
    },

    async updatePreferences(
      actor: Actor,
      input: { locale?: "en" | "tr"; timezone?: string; marketingEmails?: boolean },
    ) {
      const user = requireUser(actor);
      if (input.timezone) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: input.timezone });
        } catch {
          throw errors.badRequest("Unknown time zone", { field: "timezone" });
        }
      }
      const [row] = await db
        .insert(schema.userPreferences)
        .values({ userId: user.userId, ...input })
        .onConflictDoUpdate({ target: schema.userPreferences.userId, set: input })
        .returning();
      return row;
    },

    async requestDeletion(actor: Actor) {
      const user = requireUser(actor);
      const conflicts = await deps.organizations.soleOwnershipConflicts(user.userId);
      if (conflicts.length > 0) {
        throw errors.precondition(
          "Transfer ownership of your organizations before deleting your account",
          { organizationIds: conflicts },
        );
      }
      const now = deps.clock.now();
      const scheduledFor = new Date(
        now.getTime() + deps.config.accountDeletionGraceDays * 86_400_000,
      );
      const [updated] = await db.transaction(async (tx) => {
        const rows = await tx
          .update(schema.users)
          .set({
            status: "pending_deletion",
            deletionRequestedAt: now,
            deletionScheduledFor: scheduledFor,
          })
          .where(and(eq(schema.users.id, user.userId), eq(schema.users.status, "active")))
          .returning({ email: schema.users.email });
        if (rows.length === 0) throw errors.precondition("Account is not active");
        await audit.record(
          {
            actor,
            action: "user.deletion_requested",
            targetType: "user",
            targetId: user.userId,
            metadata: { scheduledFor },
          },
          tx,
        );
        return rows;
      });
      try {
        const [prefs] = await db
          .select({ locale: schema.userPreferences.locale })
          .from(schema.userPreferences)
          .where(eq(schema.userPreferences.userId, user.userId));
        await deps.jobs.enqueue("email", "send", {
          to: updated!.email,
          template: "account-deletion-scheduled",
          locale: prefs?.locale === "tr" ? "tr" : "en",
          props: { deletionDate: scheduledFor.toISOString().slice(0, 10) },
        });
      } catch (error) {
        deps.logger.error({ err: error }, "failed to enqueue deletion email");
      }
      return { scheduledFor };
    },

    async cancelDeletion(actor: Actor) {
      const user = requireUser(actor);
      await db.transaction(async (tx) => {
        const rows = await tx
          .update(schema.users)
          .set({ status: "active", deletionRequestedAt: null, deletionScheduledFor: null })
          .where(and(eq(schema.users.id, user.userId), eq(schema.users.status, "pending_deletion")))
          .returning({ id: schema.users.id });
        if (rows.length === 0) throw errors.precondition("No pending deletion request");
        await audit.record(
          { actor, action: "user.deletion_canceled", targetType: "user", targetId: user.userId },
          tx,
        );
      });
    },

    /** Admin: suspend an account and revoke its sessions. */
    async suspend(actor: Actor, userId: string, reason: string) {
      if (actor.type === "user" && actor.userId === userId)
        throw errors.badRequest("You cannot suspend yourself");
      await db.transaction(async (tx) => {
        const [target] = await tx
          .select({ role: schema.users.role, status: schema.users.status })
          .from(schema.users)
          .where(eq(schema.users.id, userId))
          .for("update");
        if (!target) throw errors.notFound("User");
        if (target.role === "admin") throw errors.forbidden("Administrators cannot be suspended");
        if (target.status === "suspended") return;
        await tx
          .update(schema.users)
          .set({ status: "suspended", suspendedAt: deps.clock.now(), suspensionReason: reason })
          .where(eq(schema.users.id, userId));
        await audit.record(
          {
            actor,
            action: "admin.user_suspended",
            targetType: "user",
            targetId: userId,
            metadata: { reason },
          },
          tx,
        );
      });
      await revokeSessions(userId);
    },

    /** Admin: restore a suspended account. */
    async restore(actor: Actor, userId: string, reason: string) {
      await db.transaction(async (tx) => {
        const rows = await tx
          .update(schema.users)
          .set({ status: "active", suspendedAt: null, suspensionReason: null })
          .where(and(eq(schema.users.id, userId), eq(schema.users.status, "suspended")))
          .returning({ id: schema.users.id });
        if (rows.length === 0) throw errors.precondition("User is not suspended");
        await audit.record(
          {
            actor,
            action: "admin.user_restored",
            targetType: "user",
            targetId: userId,
            metadata: { reason },
          },
          tx,
        );
      });
    },

    /** Maintenance: permanently delete accounts whose deletion grace period has ended. */
    async purgeDueAccounts(limit = 100) {
      const due = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(
          and(
            eq(schema.users.status, "pending_deletion"),
            lt(schema.users.deletionScheduledFor, deps.clock.now()),
          ),
        )
        .limit(limit);
      let purged = 0;
      for (const { id } of due) {
        try {
          const live = await deps.billing.getSummary({ type: "user", userId: id });
          if (live.subscription && !["canceled", "expired"].includes(live.subscription.status)) {
            await deps.billing
              .cancel({ type: "user", userId: id }, false, null)
              .catch((error: unknown) => {
                deps.logger.warn(
                  { err: error, userId: id },
                  "could not cancel subscription before account purge",
                );
              });
          }
          await db.transaction(async (tx) => {
            const solo = await deps.organizations.soloOrganizations(id, tx);
            if (solo.length > 0)
              await tx.delete(schema.organizations).where(inArray(schema.organizations.id, solo));
            await tx
              .delete(schema.users)
              .where(and(eq(schema.users.id, id), eq(schema.users.status, "pending_deletion")));
            await audit.record(
              {
                actor: systemActor("maintenance:account-deletion"),
                action: "user.purged",
                targetType: "user",
                targetId: id,
              },
              tx,
            );
          });
          purged++;
        } catch (error) {
          deps.logger.error({ err: error, userId: id }, "account purge failed");
        }
      }
      return purged;
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;

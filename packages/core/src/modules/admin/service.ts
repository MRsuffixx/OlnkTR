import { and, count, desc, eq, ilike, lt, or, schema } from "@olnktr/db";
import { errors, type Actor } from "@olnktr/types";
import type { PartialEntitlementSet } from "@olnktr/validators/entitlements";
import { assertAdmin, type AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { PlatformService } from "../platform/index";
import type { UserService } from "../users/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Platform administration. Every method checks the actor's platform role
 * (support = read-only, admin = full) and every mutation is audited.
 */
export function createAdminService(
  deps: CoreDeps & {
    access: AccessService;
    audit: AuditService;
    users: UserService;
    platform: PlatformService;
  },
) {
  const { db, audit } = deps;

  return {
    async listUsers(
      actor: Actor,
      input: { search?: string; status?: string; limit: number; cursor?: string | null },
    ) {
      assertAdmin(actor, "users:read");
      const conditions = [
        input.search
          ? or(
              ilike(schema.users.email, `%${input.search.replace(/[%_\\]/g, "\\$&")}%`),
              ilike(schema.users.name, `%${input.search.replace(/[%_\\]/g, "\\$&")}%`),
            )
          : undefined,
        input.status ? eq(schema.users.status, input.status) : undefined,
        input.cursor ? lt(schema.users.createdAt, new Date(input.cursor)) : undefined,
      ].filter(Boolean);
      const rows = await db
        .select({
          id: schema.users.id,
          name: schema.users.name,
          email: schema.users.email,
          role: schema.users.role,
          status: schema.users.status,
          emailVerified: schema.users.emailVerified,
          createdAt: schema.users.createdAt,
        })
        .from(schema.users)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(schema.users.createdAt))
        .limit(input.limit + 1);
      const items = rows.slice(0, input.limit);
      return {
        items,
        nextCursor: rows.length > input.limit ? items.at(-1)!.createdAt.toISOString() : null,
      };
    },

    async getUser(actor: Actor, userId: string) {
      assertAdmin(actor, "users:read");
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, userId));
      if (!user) throw errors.notFound("User");
      const [profiles] = await db
        .select({ n: count() })
        .from(schema.profiles)
        .where(eq(schema.profiles.ownerUserId, userId));
      const memberships = await db
        .select({
          organizationId: schema.organizationMembers.organizationId,
          role: schema.organizationMembers.role,
        })
        .from(schema.organizationMembers)
        .where(eq(schema.organizationMembers.userId, userId));
      const billing = await deps.billing.getSummary({ type: "user", userId });
      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          role: user.role,
          status: user.status,
          suspensionReason: user.suspensionReason,
          deletionScheduledFor: user.deletionScheduledFor,
          createdAt: user.createdAt,
        },
        profileCount: profiles?.n ?? 0,
        memberships,
        billing: {
          planKey: billing.entitlements.planKey,
          source: billing.entitlements.source,
          subscription: billing.subscription,
        },
      };
    },

    async suspendUser(actor: Actor, userId: string, reason: string) {
      assertAdmin(actor, "users:manage");
      await deps.users.suspend(actor, userId, reason);
    },

    async restoreUser(actor: Actor, userId: string, reason: string) {
      assertAdmin(actor, "users:manage");
      await deps.users.restore(actor, userId, reason);
    },

    async inspectSubscriptions(
      actor: Actor,
      subject: { type: "user"; userId: string } | { type: "organization"; organizationId: string },
    ) {
      assertAdmin(actor, "billing:read");
      const summary = await deps.billing.getSummary(subject);
      const history = summary.subscription
        ? await db
            .select()
            .from(schema.subscriptionEvents)
            .where(eq(schema.subscriptionEvents.subscriptionId, summary.subscription.id))
            .orderBy(desc(schema.subscriptionEvents.createdAt))
            .limit(100)
        : [];
      return { ...summary, history, payments: await deps.billing.listPayments(subject, 100) };
    },

    async listPlans(actor: Actor) {
      assertAdmin(actor, "billing:read");
      return db.select().from(schema.plans).orderBy(schema.plans.sortOrder);
    },

    async updatePlan(
      actor: Actor,
      input: {
        planId: string;
        name?: string;
        isActive?: boolean;
        isPublic?: boolean;
        trialDays?: number;
        entitlements?: PartialEntitlementSet;
      },
    ) {
      assertAdmin(actor, "billing:manage");
      return db.transaction(async (tx) => {
        const [before] = await tx
          .select()
          .from(schema.plans)
          .where(eq(schema.plans.id, input.planId))
          .for("update");
        if (!before) throw errors.notFound("Plan");
        if (before.isDefault && input.isActive === false)
          throw errors.precondition("The default plan cannot be deactivated");
        const [plan] = await tx
          .update(schema.plans)
          .set({
            name: input.name,
            isActive: input.isActive,
            isPublic: input.isPublic,
            trialDays: input.trialDays,
            entitlements: input.entitlements,
          })
          .where(eq(schema.plans.id, input.planId))
          .returning();
        await audit.record(
          {
            actor,
            action: "admin.plan_updated",
            targetType: "plan",
            targetId: input.planId,
            metadata: {
              before: { entitlements: before.entitlements, isActive: before.isActive },
              after: input,
            },
          },
          tx,
        );
        return plan!;
      });
    },

    async grantEntitlements(
      actor: Actor,
      input: {
        subject:
          { type: "user"; userId: string } | { type: "organization"; organizationId: string };
        entitlements: PartialEntitlementSet;
        reason: string;
        expiresAt?: Date | null;
      },
    ) {
      assertAdmin(actor, "billing:manage");
      return db.transaction(async (tx) => {
        const [override] = await tx
          .insert(schema.entitlementOverrides)
          .values({
            ownerUserId: input.subject.type === "user" ? input.subject.userId : null,
            ownerOrganizationId:
              input.subject.type === "organization" ? input.subject.organizationId : null,
            entitlements: input.entitlements,
            reason: input.reason,
            expiresAt: input.expiresAt ?? null,
            createdByUserId: actor.type === "user" ? actor.userId : null,
          })
          .returning();
        await audit.record(
          {
            actor,
            action: "admin.entitlements_granted",
            targetType: input.subject.type,
            targetId:
              input.subject.type === "user" ? input.subject.userId : input.subject.organizationId,
            metadata: { entitlements: input.entitlements, reason: input.reason },
          },
          tx,
        );
        return override!;
      });
    },

    async listAuditLogs(
      actor: Actor,
      input: {
        action?: string;
        actorUserId?: string;
        organizationId?: string;
        limit: number;
        cursor?: string | null;
      },
    ) {
      assertAdmin(actor, "audit:read");
      const items = await audit.list({
        ...input,
        before: input.cursor ? new Date(input.cursor) : undefined,
        limit: input.limit + 1,
      });
      const page = items.slice(0, input.limit);
      return {
        items: page,
        nextCursor: items.length > input.limit ? page.at(-1)!.occurredAt.toISOString() : null,
      };
    },

    async listSettings(actor: Actor) {
      assertAdmin(actor, "settings:manage");
      return deps.platform.listSettings();
    },

    async setSetting(actor: Actor, key: string, value: unknown) {
      assertAdmin(actor, "settings:manage");
      await deps.platform.setSetting(actor, key, value);
    },

    async listFeatureFlags(actor: Actor) {
      assertAdmin(actor, "settings:manage");
      return deps.platform.listFlags();
    },

    async setFeatureFlag(
      actor: Actor,
      input: { key: string; description?: string; enabled: boolean; rolloutPercentage: number },
    ) {
      assertAdmin(actor, "settings:manage");
      await deps.platform.setFlag(actor, input);
    },
  };
}

export type AdminService = ReturnType<typeof createAdminService>;

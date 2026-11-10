import { eq, schema } from "@olnktr/db";
import type { BillingProviderId } from "@olnktr/config/env";
import { errors, type Actor } from "@olnktr/types";
import type { BillingInterval } from "@olnktr/validators";
import type { AccessService } from "../access/index";
import type { AuditService } from "../audit/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Authorized billing facade: resolves the billing subject (personal or a
 * verified organization) and enforces `billing:read` / `billing:manage`
 * before delegating to @olnktr/billing.
 */
export function createBillingFacade(
  deps: CoreDeps & { access: AccessService; audit: AuditService },
) {
  const { access, billing, audit } = deps;

  async function customerOf(actor: Actor) {
    if (actor.type !== "user") throw errors.forbidden("Billing is managed by users");
    const [user] = await deps.db
      .select({ email: schema.users.email, name: schema.users.name })
      .from(schema.users)
      .where(eq(schema.users.id, actor.userId));
    if (!user) throw errors.unauthorized();
    return { userId: actor.userId, ...user };
  }

  return {
    listPlans: () => billing.listPlans(),

    async summary(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "billing:read");
      const summary = await billing.getSummary(owner);
      return {
        plan: { id: summary.entitlements.planId, key: summary.entitlements.planKey },
        source: summary.entitlements.source,
        entitlements: summary.entitlements.entitlements,
        subscription: summary.subscription && {
          id: summary.subscription.id,
          planKey: summary.subscription.planKey,
          status: summary.subscription.status,
          interval: summary.subscription.interval,
          provider: summary.subscription.provider,
          currentPeriodEnd: summary.subscription.currentPeriodEnd,
          trialEndsAt: summary.subscription.trialEndsAt,
          cancelAtPeriodEnd: summary.subscription.cancelAtPeriodEnd,
          gracePeriodEndsAt: summary.subscription.gracePeriodEndsAt,
        },
      };
    },

    async checkout(
      actor: Actor,
      input: {
        organizationId?: string | null;
        planKey: string;
        interval: BillingInterval;
        provider?: BillingProviderId;
      },
      context: { clientIp: string | null; locale: "en" | "tr" },
    ) {
      const owner = await access.resolveOwner(actor, input.organizationId, "billing:manage");
      const customer = await customerOf(actor);
      const result = await billing.createCheckout({
        owner,
        planKey: input.planKey,
        interval: input.interval,
        providerId: input.provider,
        customer: { email: customer.email, name: customer.name },
        createdByUserId: customer.userId,
        clientIp: context.clientIp,
        locale: context.locale,
      });
      await audit.record({
        actor,
        action: "billing.checkout_created",
        targetType: "checkout",
        targetId: result.checkoutSessionId,
        organizationId: input.organizationId ?? null,
        metadata: { planKey: input.planKey },
      });
      return result;
    },

    async changePlan(
      actor: Actor,
      input: {
        organizationId?: string | null;
        planKey: string;
        interval: BillingInterval;
        provider?: BillingProviderId;
      },
      context: { clientIp: string | null; locale: "en" | "tr" },
    ) {
      const owner = await access.resolveOwner(actor, input.organizationId, "billing:manage");
      const customer = await customerOf(actor);
      const result = await billing.changePlan({
        owner,
        planKey: input.planKey,
        interval: input.interval,
        providerId: input.provider,
        customer: { email: customer.email, name: customer.name },
        createdByUserId: customer.userId,
        clientIp: context.clientIp,
        locale: context.locale,
      });
      await audit.record({
        actor,
        action: "billing.plan_change_requested",
        organizationId: input.organizationId ?? null,
        metadata: { planKey: input.planKey, result: result.kind },
      });
      return result;
    },

    async cancel(actor: Actor, input: { organizationId?: string | null; atPeriodEnd: boolean }) {
      const owner = await access.resolveOwner(actor, input.organizationId, "billing:manage");
      const result = await billing.cancel(
        owner,
        input.atPeriodEnd,
        actor.type === "user" ? actor.userId : null,
      );
      await audit.record({
        actor,
        action: "billing.subscription_canceled",
        targetType: "subscription",
        targetId: result.subscriptionId,
        organizationId: input.organizationId ?? null,
        metadata: { atPeriodEnd: input.atPeriodEnd },
      });
      return result;
    },

    async payments(actor: Actor, organizationId?: string | null) {
      const owner = await access.resolveOwner(actor, organizationId, "billing:read");
      return billing.listPayments(owner);
    },
  };
}

export type BillingFacade = ReturnType<typeof createBillingFacade>;

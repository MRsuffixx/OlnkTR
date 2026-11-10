import { and, asc, desc, eq, inArray, lt, schema, sql, type Database } from "@olnktr/db";
import type { BillingProviderId } from "@olnktr/config/env";
import type { Logger } from "@olnktr/observability";
import { errors, systemClock, type Clock, type OwnerRef } from "@olnktr/types";
import type { BillingInterval } from "@olnktr/validators";
import type { EntitlementResolution, EntitlementService } from "./entitlements/engine";
import { ownerColumns, ownerWhere } from "./owner";
import type { PaymentProviderRegistry } from "./providers/registry";
import { addInterval } from "./providers/types";
import { accessSource, canTransition, LIVE_STATUSES } from "./subscriptions/state-machine";

export interface BillingServiceDeps {
  db: Database;
  providers: PaymentProviderRegistry;
  entitlements: EntitlementService;
  logger: Logger;
  appUrl: string;
  gracePeriodDays: number;
  clock?: Clock;
}

export interface CheckoutRequest {
  owner: OwnerRef;
  planKey: string;
  interval: BillingInterval;
  providerId?: BillingProviderId;
  customer: { email: string; name: string };
  createdByUserId: string;
  clientIp: string | null;
  locale: "en" | "tr";
}

const CHECKOUT_TTL_MS = 24 * 3_600_000;

export function createBillingService(deps: BillingServiceDeps) {
  const clock = deps.clock ?? systemClock;

  async function listPlans() {
    const plans = await deps.db
      .select()
      .from(schema.plans)
      .where(and(eq(schema.plans.isActive, true), eq(schema.plans.isPublic, true)))
      .orderBy(asc(schema.plans.sortOrder));
    const prices = plans.length
      ? await deps.db
          .select()
          .from(schema.planPrices)
          .where(
            and(
              inArray(
                schema.planPrices.planId,
                plans.map((plan) => plan.id),
              ),
              eq(schema.planPrices.isActive, true),
            ),
          )
      : [];
    return plans.map((plan) => ({
      id: plan.id,
      key: plan.key,
      name: plan.name,
      description: plan.description,
      isDefault: plan.isDefault,
      trialDays: plan.trialDays,
      entitlements: plan.entitlements,
      prices: prices
        .filter((price) => price.planId === plan.id)
        .map(({ id, interval, currency, amount }) => ({ id, interval, currency, amount })),
    }));
  }

  async function liveSubscription(owner: OwnerRef) {
    const [row] = await deps.db
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          ownerWhere(schema.subscriptions, owner),
          inArray(schema.subscriptions.status, [...LIVE_STATUSES]),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async function getSummary(owner: OwnerRef): Promise<{
    entitlements: EntitlementResolution;
    subscription: (typeof schema.subscriptions.$inferSelect & { planKey: string }) | null;
  }> {
    const entitlements = await deps.entitlements.resolve(owner);
    const [subscription] = await deps.db
      .select({ subscription: schema.subscriptions, planKey: schema.plans.key })
      .from(schema.subscriptions)
      .innerJoin(schema.plans, eq(schema.plans.id, schema.subscriptions.planId))
      .where(ownerWhere(schema.subscriptions, owner))
      .orderBy(desc(schema.subscriptions.createdAt))
      .limit(1);
    return {
      entitlements,
      subscription: subscription
        ? { ...subscription.subscription, planKey: subscription.planKey }
        : null,
    };
  }

  async function createCheckout(
    request: CheckoutRequest,
  ): Promise<{ checkoutSessionId: string; url: string }> {
    const provider = request.providerId
      ? deps.providers.get(request.providerId)
      : deps.providers.defaultProvider();
    const [plan] = await deps.db
      .select()
      .from(schema.plans)
      .where(and(eq(schema.plans.key, request.planKey), eq(schema.plans.isActive, true)));
    if (!plan || plan.isDefault) throw errors.badRequest("This plan cannot be purchased");
    const [price] = await deps.db
      .select()
      .from(schema.planPrices)
      .where(
        and(
          eq(schema.planPrices.planId, plan.id),
          eq(schema.planPrices.interval, request.interval),
          eq(schema.planPrices.currency, provider.currency),
          eq(schema.planPrices.isActive, true),
        ),
      );
    if (!price)
      throw errors.badRequest(`No ${provider.currency} ${request.interval}ly price for this plan`);

    const live = await liveSubscription(request.owner);
    if (live && accessSource(live, clock.now())) {
      if (live.planId === plan.id) throw errors.conflict("You are already subscribed to this plan");
      if (
        deps.providers.has(live.provider) &&
        deps.providers.get(live.provider).capabilities.planChanges
      ) {
        throw errors.conflict("Use the plan change endpoint to switch plans");
      }
    }

    // Trials are granted only to owners that never had a subscription.
    const [{ previous } = { previous: 0 }] = await deps.db
      .select({ previous: sql<number>`count(*)::int` })
      .from(schema.subscriptions)
      .where(ownerWhere(schema.subscriptions, request.owner));
    const trialDays = previous === 0 ? plan.trialDays : 0;

    const [customer] = await deps.db
      .select({ providerCustomerId: schema.billingCustomers.providerCustomerId })
      .from(schema.billingCustomers)
      .where(
        and(
          ownerWhere(schema.billingCustomers, request.owner),
          eq(schema.billingCustomers.provider, provider.id),
        ),
      );

    const [checkout] = await deps.db
      .insert(schema.checkoutSessions)
      .values({
        ...ownerColumns(request.owner),
        planId: plan.id,
        priceId: price.id,
        provider: provider.id,
        createdByUserId: request.createdByUserId,
        expiresAt: new Date(clock.now().getTime() + CHECKOUT_TTL_MS),
      })
      .returning();
    if (!checkout) throw errors.internal();

    const billingPath =
      request.owner.type === "organization"
        ? `/settings/billing?organizationId=${request.owner.organizationId}`
        : "/settings/billing";
    try {
      const result = await provider.createCheckout({
        checkoutSessionId: checkout.id,
        plan: { key: plan.key, name: plan.name },
        price: {
          interval: price.interval,
          currency: price.currency,
          amount: price.amount,
          providerPriceIds: price.providerPriceIds,
        },
        customer: { ...request.customer, providerCustomerId: customer?.providerCustomerId ?? null },
        trialDays,
        successUrl: new URL(
          `${billingPath}${billingPath.includes("?") ? "&" : "?"}checkout=success`,
          deps.appUrl,
        ).toString(),
        cancelUrl: new URL(
          `${billingPath}${billingPath.includes("?") ? "&" : "?"}checkout=canceled`,
          deps.appUrl,
        ).toString(),
        clientIp: request.clientIp,
        locale: request.locale,
      });
      await deps.db
        .update(schema.checkoutSessions)
        .set({ providerSessionId: result.providerSessionId, url: result.url })
        .where(eq(schema.checkoutSessions.id, checkout.id));
      return { checkoutSessionId: checkout.id, url: result.url };
    } catch (error) {
      await deps.db
        .update(schema.checkoutSessions)
        .set({ status: "failed" })
        .where(eq(schema.checkoutSessions.id, checkout.id));
      deps.logger.error({ err: error, provider: provider.id }, "billing: checkout creation failed");
      throw errors.unavailable("The payment provider is currently unavailable");
    }
  }

  async function cancel(owner: OwnerRef, atPeriodEnd: boolean, actorUserId: string | null) {
    const subscription = await liveSubscription(owner);
    if (!subscription) throw errors.notFound("Active subscription");
    if (deps.providers.has(subscription.provider)) {
      await deps.providers.get(subscription.provider).cancelSubscription({
        providerSubscriptionId: subscription.providerSubscriptionId,
        atPeriodEnd,
      });
    }
    const now = clock.now();
    await deps.db.transaction(async (tx) => {
      const [current] = await tx
        .select()
        .from(schema.subscriptions)
        .where(eq(schema.subscriptions.id, subscription.id))
        .for("update");
      if (!current) throw errors.notFound("Subscription");
      if (
        atPeriodEnd &&
        current.status !== "trialing" &&
        current.status !== "past_due" &&
        current.status !== "incomplete"
      ) {
        await tx
          .update(schema.subscriptions)
          .set({ cancelAtPeriodEnd: true, canceledAt: now })
          .where(eq(schema.subscriptions.id, current.id));
      } else if (canTransition(current.status, "canceled")) {
        await tx
          .update(schema.subscriptions)
          .set({ status: "canceled", canceledAt: now, endedAt: now, cancelAtPeriodEnd: false })
          .where(eq(schema.subscriptions.id, current.id));
      }
      await tx.insert(schema.subscriptionEvents).values({
        subscriptionId: current.id,
        type: atPeriodEnd ? "cancel_requested" : "canceled_immediately",
        fromStatus: current.status,
        toStatus: atPeriodEnd ? current.status : "canceled",
        data: { actorUserId },
      });
    });
    return { subscriptionId: subscription.id, atPeriodEnd };
  }

  async function changePlan(
    request: CheckoutRequest,
  ): Promise<{ kind: "pending_provider_confirmation" } | { kind: "checkout"; url: string }> {
    const live = await liveSubscription(request.owner);
    if (!live || !accessSource(live, clock.now())) {
      const checkout = await createCheckout(request);
      return { kind: "checkout", url: checkout.url };
    }
    const provider = deps.providers.get(live.provider);
    if (
      !provider.capabilities.planChanges ||
      !provider.changePlan ||
      !live.providerSubscriptionId
    ) {
      const checkout = await createCheckout({ ...request, providerId: provider.id });
      return { kind: "checkout", url: checkout.url };
    }
    const [target] = await deps.db
      .select({ price: schema.planPrices, planId: schema.plans.id })
      .from(schema.planPrices)
      .innerJoin(schema.plans, eq(schema.plans.id, schema.planPrices.planId))
      .where(
        and(
          eq(schema.plans.key, request.planKey),
          eq(schema.plans.isActive, true),
          eq(schema.planPrices.interval, request.interval),
          eq(schema.planPrices.currency, provider.currency),
        ),
      );
    const providerPriceId = target?.price.providerPriceIds[provider.id];
    if (!target || !providerPriceId)
      throw errors.badRequest("This plan is not available for your payment provider");
    if (target.planId === live.planId && target.price.id === live.priceId)
      throw errors.conflict("Already on this plan");
    // The local plan changes only when the provider confirms via webhook.
    await provider.changePlan({
      providerSubscriptionId: live.providerSubscriptionId,
      providerPriceId,
    });
    return { kind: "pending_provider_confirmation" };
  }

  async function listPayments(owner: OwnerRef, limit = 50) {
    return deps.db
      .select({
        id: schema.payments.id,
        provider: schema.payments.provider,
        amount: schema.payments.amount,
        currency: schema.payments.currency,
        status: schema.payments.status,
        failureCode: schema.payments.failureCode,
        hostedInvoiceUrl: schema.payments.hostedInvoiceUrl,
        occurredAt: schema.payments.occurredAt,
      })
      .from(schema.payments)
      .where(ownerWhere(schema.payments, owner))
      .orderBy(desc(schema.payments.occurredAt))
      .limit(limit);
  }

  /**
   * Time-driven lifecycle (maintenance queue):
   *  - canceled subscriptions whose paid period ended → expired
   *  - subscriptions of providers without managed renewals (PayTR, dev):
   *      active past period end → past_due (+ grace); past grace → expired
   *  - abandoned checkout sessions → expired
   */
  async function runLifecycle() {
    const now = clock.now();
    const unmanaged = deps.providers
      .list()
      .filter((provider) => !provider.capabilities.managedRenewals)
      .map((provider) => provider.id as string);
    return deps.db.transaction(async (tx) => {
      const expiredCanceled = await tx
        .update(schema.subscriptions)
        .set({
          status: "expired",
          endedAt: sql`coalesce(${schema.subscriptions.endedAt}, ${schema.subscriptions.currentPeriodEnd})`,
        })
        .where(
          and(
            eq(schema.subscriptions.status, "canceled"),
            lt(schema.subscriptions.currentPeriodEnd, now),
          ),
        )
        .returning({ id: schema.subscriptions.id });
      let renewalsDue: { id: string }[] = [];
      let expiredUnpaid: { id: string }[] = [];
      if (unmanaged.length > 0) {
        renewalsDue = await tx
          .update(schema.subscriptions)
          .set({
            status: "past_due",
            gracePeriodEndsAt: new Date(now.getTime() + deps.gracePeriodDays * 86_400_000),
          })
          .where(
            and(
              inArray(schema.subscriptions.provider, unmanaged),
              inArray(schema.subscriptions.status, ["active", "trialing"]),
              lt(schema.subscriptions.currentPeriodEnd, now),
            ),
          )
          .returning({ id: schema.subscriptions.id });
        expiredUnpaid = await tx
          .update(schema.subscriptions)
          .set({ status: "expired", endedAt: now })
          .where(
            and(
              inArray(schema.subscriptions.provider, unmanaged),
              eq(schema.subscriptions.status, "past_due"),
              lt(schema.subscriptions.gracePeriodEndsAt, now),
            ),
          )
          .returning({ id: schema.subscriptions.id });
      }
      const transitions = [
        ...expiredCanceled.map(({ id }) => ({
          subscriptionId: id,
          type: "period_ended",
          fromStatus: "canceled" as const,
          toStatus: "expired" as const,
        })),
        ...renewalsDue.map(({ id }) => ({
          subscriptionId: id,
          type: "renewal_due",
          fromStatus: "active" as const,
          toStatus: "past_due" as const,
        })),
        ...expiredUnpaid.map(({ id }) => ({
          subscriptionId: id,
          type: "grace_ended",
          fromStatus: "past_due" as const,
          toStatus: "expired" as const,
        })),
      ];
      if (transitions.length > 0) await tx.insert(schema.subscriptionEvents).values(transitions);
      const expiredCheckouts = await tx
        .update(schema.checkoutSessions)
        .set({ status: "expired" })
        .where(
          and(
            eq(schema.checkoutSessions.status, "open"),
            lt(schema.checkoutSessions.expiresAt, now),
          ),
        )
        .returning({ id: schema.checkoutSessions.id });
      return {
        expiredCanceled: expiredCanceled.length,
        renewalsDue: renewalsDue.length,
        expiredUnpaid: expiredUnpaid.length,
        expiredCheckouts: expiredCheckouts.length,
      };
    });
  }

  /** Billing events that still need processing (for the reconcile job). */
  async function findUnprocessedEvents(maxAttempts = 10) {
    return deps.db
      .select({ id: schema.billingEvents.id })
      .from(schema.billingEvents)
      .where(
        and(
          inArray(schema.billingEvents.status, ["received", "failed"]),
          lt(schema.billingEvents.attempts, maxAttempts),
          lt(schema.billingEvents.receivedAt, new Date(clock.now().getTime() - 60_000)),
        ),
      )
      .limit(500);
  }

  return {
    listPlans,
    getSummary,
    createCheckout,
    cancel,
    changePlan,
    listPayments,
    runLifecycle,
    findUnprocessedEvents,
    addInterval,
  };
}

export type BillingService = ReturnType<typeof createBillingService>;

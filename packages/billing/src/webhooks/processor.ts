import { and, eq, inArray, not, schema, sql, type Database, type Transaction } from "@olnktr/db";
import type { JobProducer } from "@olnktr/jobs";
import { withSpan, type Logger } from "@olnktr/observability";
import { systemClock, type Clock, type OwnerRef } from "@olnktr/types";
import type { SubscriptionStatus } from "@olnktr/validators";
import { ownerColumns, ownerFromRow, ownerWhere } from "../owner";
import { addInterval, type NormalizedBillingEvent, type PaymentInfo } from "../providers/types";
import type { PaymentProviderRegistry } from "../providers/registry";
import { canTransition, LIVE_STATUSES } from "../subscriptions/state-machine";
import { resolveBillingContacts } from "../contacts";

/**
 * Applies a stored, verified billing event to subscription state.
 *
 * Guarantees:
 *  - exactly-once effect: the inbox row is locked (`FOR UPDATE`) and skipped
 *    once processed, so concurrent workers and provider retries are harmless;
 *  - atomicity: all changes for one event commit in a single transaction;
 *  - ordering tolerance: events referencing records that do not exist yet
 *    (e.g. an invoice before its checkout) throw and are retried with backoff;
 *  - stale/out-of-order transitions are rejected by the state machine and
 *    recorded instead of corrupting state.
 */
export class RetryableBillingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RetryableBillingError";
  }
}

export interface BillingProcessorDeps {
  db: Database;
  providers: PaymentProviderRegistry;
  jobs: JobProducer;
  logger: Logger;
  appUrl: string;
  gracePeriodDays: number;
  clock?: Clock;
}

type Effect =
  | {
      type: "email";
      owner: OwnerRef;
      template: "payment-failed" | "subscription-activated";
      props: Record<string, string>;
    }
  | { type: "cancel-at-provider"; provider: string; providerSubscriptionId: string };

type SubscriptionRow = typeof schema.subscriptions.$inferSelect;

export type ProcessResult = "processed" | "ignored" | "duplicate";

export function createBillingEventProcessor(deps: BillingProcessorDeps) {
  const clock = deps.clock ?? systemClock;

  async function recordTransition(
    tx: Transaction,
    subscription: SubscriptionRow,
    type: string,
    to: SubscriptionStatus | null,
    billingEventId: string,
    data: Record<string, unknown> = {},
  ) {
    await tx.insert(schema.subscriptionEvents).values({
      subscriptionId: subscription.id,
      type,
      fromStatus: subscription.status,
      toStatus: to,
      billingEventId,
      data,
    });
  }

  async function findSubscriptionByProviderId(
    tx: Transaction,
    provider: string,
    providerSubscriptionId: string,
  ) {
    const [row] = await tx
      .select()
      .from(schema.subscriptions)
      .where(
        and(
          eq(schema.subscriptions.provider, provider),
          eq(schema.subscriptions.providerSubscriptionId, providerSubscriptionId),
        ),
      )
      .for("update");
    return row ?? null;
  }

  async function insertPayment(
    tx: Transaction,
    provider: string,
    owner: OwnerRef,
    subscriptionId: string | null,
    payment: PaymentInfo,
    status: "succeeded" | "failed",
  ) {
    await tx
      .insert(schema.payments)
      .values({
        ...ownerColumns(owner),
        subscriptionId,
        provider,
        providerPaymentId: payment.providerPaymentId,
        providerInvoiceId: payment.providerInvoiceId ?? null,
        amount: payment.amount,
        currency: payment.currency,
        status,
        failureCode: payment.failureCode ?? null,
        failureMessage: payment.failureMessage ?? null,
        hostedInvoiceUrl: payment.hostedInvoiceUrl ?? null,
        occurredAt: new Date(payment.occurredAt),
      })
      .onConflictDoNothing({
        target: [schema.payments.provider, schema.payments.providerPaymentId],
      });
  }

  async function findCheckout(
    tx: Transaction,
    provider: string,
    ref: { checkoutSessionId?: string | null; providerSessionId?: string | null },
  ) {
    const condition = ref.checkoutSessionId
      ? eq(schema.checkoutSessions.id, ref.checkoutSessionId)
      : ref.providerSessionId
        ? eq(schema.checkoutSessions.providerSessionId, ref.providerSessionId)
        : null;
    if (!condition) throw new Error("Checkout event carries no checkout reference");
    const [checkout] = await tx
      .select()
      .from(schema.checkoutSessions)
      .where(and(condition, eq(schema.checkoutSessions.provider, provider)))
      .for("update");
    if (!checkout) throw new RetryableBillingError("Checkout session not found");
    return checkout;
  }

  const graceUntil = () => new Date(clock.now().getTime() + deps.gracePeriodDays * 86_400_000);

  async function apply(
    tx: Transaction,
    eventId: string,
    provider: string,
    event: NormalizedBillingEvent,
    effects: Effect[],
  ) {
    const now = clock.now();
    switch (event.kind) {
      case "ignored":
        return;

      case "checkout.completed": {
        const checkout = await findCheckout(tx, provider, event.checkout);
        if (checkout.status === "completed") return;
        const owner = ownerFromRow(checkout);
        const [price] = await tx
          .select()
          .from(schema.planPrices)
          .where(eq(schema.planPrices.id, checkout.priceId));
        const [plan] = await tx
          .select()
          .from(schema.plans)
          .where(eq(schema.plans.id, checkout.planId));
        if (!price || !plan) throw new Error("Checkout references a missing plan/price");

        // Never activate on an underpayment.
        if (
          event.payment &&
          event.payment.currency === price.currency &&
          event.payment.amount < price.amount
        ) {
          await tx
            .update(schema.checkoutSessions)
            .set({ status: "failed" })
            .where(eq(schema.checkoutSessions.id, checkout.id));
          await insertPayment(
            tx,
            provider,
            owner,
            null,
            { ...event.payment, failureCode: "amount_mismatch" },
            "failed",
          );
          deps.logger.warn(
            { checkoutId: checkout.id },
            "billing: payment amount below price; checkout rejected",
          );
          return;
        }
        if (!["active", "trialing", "incomplete"].includes(event.status)) {
          throw new Error(`Unexpected status "${event.status}" for a completed checkout`);
        }

        // Replace any existing live subscription of this owner (plan change through a new checkout).
        const existing = await tx
          .select()
          .from(schema.subscriptions)
          .where(
            and(
              ownerWhere(schema.subscriptions, owner),
              inArray(schema.subscriptions.status, [...LIVE_STATUSES]),
            ),
          )
          .for("update");
        for (const old of existing) {
          if (
            old.provider === provider &&
            old.providerSubscriptionId &&
            old.providerSubscriptionId === event.providerSubscriptionId
          )
            continue;
          await recordTransition(tx, old, "replaced", "canceled", eventId, {
            replacedByCheckout: checkout.id,
          });
          await tx
            .update(schema.subscriptions)
            .set({ status: "canceled", canceledAt: now, endedAt: now })
            .where(eq(schema.subscriptions.id, old.id));
          if (
            old.providerSubscriptionId &&
            deps.providers.has(old.provider) &&
            deps.providers.get(old.provider).capabilities.managedRenewals
          ) {
            effects.push({
              type: "cancel-at-provider",
              provider: old.provider,
              providerSubscriptionId: old.providerSubscriptionId,
            });
          }
        }

        const periodStart = event.currentPeriodStart ? new Date(event.currentPeriodStart) : now;
        const [subscription] = await tx
          .insert(schema.subscriptions)
          .values({
            ...ownerColumns(owner),
            planId: plan.id,
            priceId: price.id,
            status: event.status,
            interval: price.interval,
            provider,
            providerSubscriptionId: event.providerSubscriptionId,
            currentPeriodStart: periodStart,
            currentPeriodEnd: event.currentPeriodEnd
              ? new Date(event.currentPeriodEnd)
              : addInterval(periodStart, price.interval),
            trialEndsAt: event.trialEndsAt ? new Date(event.trialEndsAt) : null,
            metadata: { checkoutSessionId: checkout.id },
          })
          .onConflictDoNothing({
            target: [schema.subscriptions.provider, schema.subscriptions.providerSubscriptionId],
          })
          .returning();
        const created =
          subscription ??
          (event.providerSubscriptionId
            ? await findSubscriptionByProviderId(tx, provider, event.providerSubscriptionId)
            : null);
        if (!created) throw new Error("Failed to create subscription");
        if (subscription) {
          await tx.insert(schema.subscriptionEvents).values({
            subscriptionId: created.id,
            type: "created",
            fromStatus: null,
            toStatus: created.status,
            billingEventId: eventId,
            data: { checkoutSessionId: checkout.id, planKey: plan.key },
          });
        }
        if (event.providerCustomerId) {
          await tx
            .insert(schema.billingCustomers)
            .values({
              ...ownerColumns(owner),
              provider,
              providerCustomerId: event.providerCustomerId,
            })
            .onConflictDoNothing();
        }
        if (event.payment)
          await insertPayment(tx, provider, owner, created.id, event.payment, "succeeded");
        await tx
          .update(schema.checkoutSessions)
          .set({ status: "completed", completedAt: now })
          .where(eq(schema.checkoutSessions.id, checkout.id));
        effects.push({
          type: "email",
          owner,
          template: "subscription-activated",
          props: { planName: plan.name },
        });
        return;
      }

      case "checkout.failed": {
        const checkout = await findCheckout(tx, provider, event.checkout);
        if (checkout.status !== "open") return;
        await tx
          .update(schema.checkoutSessions)
          .set({ status: "failed" })
          .where(eq(schema.checkoutSessions.id, checkout.id));
        if (event.payment)
          await insertPayment(tx, provider, ownerFromRow(checkout), null, event.payment, "failed");
        return;
      }

      case "subscription.updated": {
        const current = await findSubscriptionByProviderId(
          tx,
          provider,
          event.providerSubscriptionId,
        );
        if (!current) throw new RetryableBillingError("Subscription not found yet");
        if (!canTransition(current.status, event.status)) {
          await recordTransition(tx, current, "transition_rejected", event.status, eventId);
          deps.logger.warn(
            { subscriptionId: current.id, from: current.status, to: event.status },
            "billing: rejected out-of-order subscription transition",
          );
          return;
        }
        const update: Partial<typeof schema.subscriptions.$inferInsert> = {
          status: event.status,
          currentPeriodStart: event.currentPeriodStart
            ? new Date(event.currentPeriodStart)
            : current.currentPeriodStart,
          currentPeriodEnd: event.currentPeriodEnd
            ? new Date(event.currentPeriodEnd)
            : current.currentPeriodEnd,
          trialEndsAt: event.trialEndsAt ? new Date(event.trialEndsAt) : current.trialEndsAt,
          cancelAtPeriodEnd: event.cancelAtPeriodEnd,
          canceledAt: event.canceledAt ? new Date(event.canceledAt) : current.canceledAt,
        };
        if (event.status === "past_due" && !current.gracePeriodEndsAt)
          update.gracePeriodEndsAt = graceUntil();
        if (event.status === "active") update.gracePeriodEndsAt = null;
        if (event.providerPriceId) {
          const [price] = await tx
            .select()
            .from(schema.planPrices)
            .where(
              sql`${schema.planPrices.providerPriceIds} ->> ${provider} = ${event.providerPriceId}`,
            )
            .limit(1);
          if (price && price.id !== current.priceId) {
            update.planId = price.planId;
            update.priceId = price.id;
            update.interval = price.interval;
          }
        }
        await tx
          .update(schema.subscriptions)
          .set(update)
          .where(eq(schema.subscriptions.id, current.id));
        await recordTransition(tx, current, "updated", event.status, eventId, {
          planChanged: Boolean(update.planId && update.planId !== current.planId),
        });
        return;
      }

      case "subscription.deleted": {
        const current = await findSubscriptionByProviderId(
          tx,
          provider,
          event.providerSubscriptionId,
        );
        if (!current) throw new RetryableBillingError("Subscription not found yet");
        if (current.status === "expired" || (current.status === "canceled" && current.endedAt))
          return;
        if (!canTransition(current.status, "canceled")) return;
        await tx
          .update(schema.subscriptions)
          .set({
            status: "canceled",
            canceledAt: current.canceledAt ?? now,
            endedAt: new Date(event.endedAt),
          })
          .where(eq(schema.subscriptions.id, current.id));
        await recordTransition(tx, current, "deleted", "canceled", eventId);
        return;
      }

      case "payment.succeeded": {
        const current = event.providerSubscriptionId
          ? await findSubscriptionByProviderId(tx, provider, event.providerSubscriptionId)
          : null;
        if (event.providerSubscriptionId && !current)
          throw new RetryableBillingError("Subscription not found yet");
        if (!current) return;
        await insertPayment(
          tx,
          provider,
          ownerFromRow(current),
          current.id,
          event.payment,
          "succeeded",
        );
        const update: Partial<typeof schema.subscriptions.$inferInsert> = {};
        if (
          (current.status === "past_due" || current.status === "incomplete") &&
          canTransition(current.status, "active")
        ) {
          update.status = "active";
          update.gracePeriodEndsAt = null;
        }
        if (event.periodEnd) {
          const periodEnd = new Date(event.periodEnd);
          if (!current.currentPeriodEnd || periodEnd > current.currentPeriodEnd)
            update.currentPeriodEnd = periodEnd;
        }
        if (Object.keys(update).length > 0) {
          await tx
            .update(schema.subscriptions)
            .set(update)
            .where(eq(schema.subscriptions.id, current.id));
          await recordTransition(
            tx,
            current,
            "payment_succeeded",
            update.status ?? current.status,
            eventId,
          );
        }
        return;
      }

      case "payment.failed": {
        const current = event.providerSubscriptionId
          ? await findSubscriptionByProviderId(tx, provider, event.providerSubscriptionId)
          : null;
        if (event.providerSubscriptionId && !current)
          throw new RetryableBillingError("Subscription not found yet");
        if (!current) return;
        const owner = ownerFromRow(current);
        await insertPayment(tx, provider, owner, current.id, event.payment, "failed");
        let gracePeriodEndsAt = current.gracePeriodEndsAt;
        if (
          (current.status === "active" || current.status === "trialing") &&
          canTransition(current.status, "past_due")
        ) {
          gracePeriodEndsAt = graceUntil();
          await tx
            .update(schema.subscriptions)
            .set({ status: "past_due", gracePeriodEndsAt })
            .where(eq(schema.subscriptions.id, current.id));
          await recordTransition(tx, current, "payment_failed", "past_due", eventId, {
            failureCode: event.payment.failureCode ?? null,
          });
        }
        const [plan] = await tx
          .select({ name: schema.plans.name })
          .from(schema.plans)
          .where(eq(schema.plans.id, current.planId));
        effects.push({
          type: "email",
          owner,
          template: "payment-failed",
          props: {
            planName: plan?.name ?? "",
            graceUntil: (gracePeriodEndsAt ?? now).toISOString().slice(0, 10),
            url: new URL("/settings/billing", deps.appUrl).toString(),
          },
        });
        return;
      }
    }
  }

  async function runEffects(effects: Effect[]) {
    for (const effect of effects) {
      try {
        if (effect.type === "email") {
          for (const contact of await resolveBillingContacts(deps.db, effect.owner)) {
            await deps.jobs.enqueue("email", "send", {
              to: contact.email,
              template: effect.template,
              locale: contact.locale,
              props: effect.props,
            });
          }
        } else {
          await deps.providers.get(effect.provider).cancelSubscription({
            providerSubscriptionId: effect.providerSubscriptionId,
            atPeriodEnd: false,
          });
        }
      } catch (error) {
        // Side effects are best-effort and never roll back committed billing state.
        deps.logger.error(
          { err: error, effect: effect.type },
          "billing: post-commit side effect failed",
        );
      }
    }
  }

  return {
    process: (billingEventId: string): Promise<ProcessResult> =>
      withSpan("billing.process_event", { "olnktr.billing_event.id": billingEventId }, () =>
        processEvent(billingEventId),
      ),
  };

  async function processEvent(billingEventId: string): Promise<ProcessResult> {
    const effects: Effect[] = [];
    let result: ProcessResult;
    try {
      result = await deps.db.transaction(async (tx) => {
        const [event] = await tx
          .select()
          .from(schema.billingEvents)
          .where(eq(schema.billingEvents.id, billingEventId))
          .for("update");
        if (!event) throw new Error(`Billing event ${billingEventId} not found`);
        if (event.status === "processed" || event.status === "ignored") return "duplicate" as const;

        const normalized = (event.payload.events ?? []) as NormalizedBillingEvent[];
        for (const item of normalized) await apply(tx, event.id, event.provider, item, effects);

        const status = normalized.every((item) => item.kind === "ignored")
          ? "ignored"
          : "processed";
        await tx
          .update(schema.billingEvents)
          .set({
            status,
            attempts: sql`${schema.billingEvents.attempts} + 1`,
            processedAt: clock.now(),
            lastError: null,
          })
          .where(eq(schema.billingEvents.id, event.id));
        return status;
      });
    } catch (error) {
      await deps.db
        .update(schema.billingEvents)
        .set({
          status: "failed",
          attempts: sql`${schema.billingEvents.attempts} + 1`,
          lastError: (error instanceof Error ? error.message : String(error)).slice(0, 1000),
        })
        .where(
          and(
            eq(schema.billingEvents.id, billingEventId),
            not(inArray(schema.billingEvents.status, ["processed", "ignored"])),
          ),
        );
      throw error;
    }
    if (result !== "duplicate") await runEffects(effects);
    return result;
  }
}

export type BillingEventProcessor = ReturnType<typeof createBillingEventProcessor>;

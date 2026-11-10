import type { SubscriptionStatus } from "@olnktr/validators";

/**
 * Subscription state machine. Provider events are mapped onto these states;
 * transitions not listed here are rejected (e.g. a stale, out-of-order webhook
 * trying to move an `expired` subscription back to `incomplete`).
 *
 *   incomplete ─► trialing | active | expired | canceled
 *   trialing   ─► active | past_due | canceled | paused | expired
 *   active     ─► past_due | canceled | paused | expired
 *   past_due   ─► active | canceled | paused | expired
 *   paused     ─► active | canceled | expired
 *   canceled   ─► expired
 *   expired    ─► (terminal)
 */
export const SUBSCRIPTION_TRANSITIONS: Record<SubscriptionStatus, readonly SubscriptionStatus[]> = {
  incomplete: ["trialing", "active", "expired", "canceled"],
  trialing: ["active", "past_due", "canceled", "paused", "expired"],
  active: ["past_due", "canceled", "paused", "expired"],
  past_due: ["active", "canceled", "paused", "expired"],
  paused: ["active", "canceled", "expired"],
  canceled: ["expired"],
  expired: [],
};

/** Same-state "transitions" are allowed (idempotent period/flag updates). */
export function canTransition(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
  return from === to || SUBSCRIPTION_TRANSITIONS[from].includes(to);
}

export class InvalidSubscriptionTransitionError extends Error {
  constructor(
    readonly from: SubscriptionStatus,
    readonly to: SubscriptionStatus,
  ) {
    super(`Invalid subscription transition ${from} -> ${to}`);
    this.name = "InvalidSubscriptionTransitionError";
  }
}

export function assertTransition(from: SubscriptionStatus, to: SubscriptionStatus): void {
  if (!canTransition(from, to)) throw new InvalidSubscriptionTransitionError(from, to);
}

export const LIVE_STATUSES: readonly SubscriptionStatus[] = [
  "trialing",
  "active",
  "past_due",
  "paused",
  "incomplete",
];

export interface SubscriptionAccessFields {
  status: SubscriptionStatus;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  gracePeriodEndsAt: Date | null;
  endedAt: Date | null;
}

export type AccessSource = "subscription" | "trial" | "grace" | "canceled_period";

/**
 * Whether a subscription currently grants its plan's entitlements, and why.
 *  - active                         → yes
 *  - trialing                       → until the trial ends
 *  - past_due                       → only within the grace period
 *  - canceled (not yet ended)       → until the paid period ends
 *  - incomplete / paused / expired  → no
 */
export function accessSource(
  subscription: SubscriptionAccessFields,
  now: Date,
): AccessSource | null {
  switch (subscription.status) {
    case "active":
      return "subscription";
    case "trialing":
      return !subscription.trialEndsAt || subscription.trialEndsAt > now ? "trial" : null;
    case "past_due":
      return subscription.gracePeriodEndsAt && subscription.gracePeriodEndsAt > now
        ? "grace"
        : null;
    case "canceled":
      return !subscription.endedAt &&
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd > now
        ? "canceled_period"
        : null;
    default:
      return null;
  }
}

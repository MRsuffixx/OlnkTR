import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { PartialEntitlementSet } from "@olnktr/validators/entitlements";
import { exactlyOneOwner, primaryId, timestamps } from "./_helpers";
import { users } from "./auth";
import { organizations } from "./organizations";

export const subscriptionStatus = pgEnum("subscription_status", [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "paused",
  "expired",
]);
export const billingInterval = pgEnum("billing_interval", ["month", "year"]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);
export const billingEventStatus = pgEnum("billing_event_status", [
  "received",
  "processed",
  "failed",
  "ignored",
]);
export const checkoutStatus = pgEnum("checkout_status", ["open", "completed", "expired", "failed"]);

/** Subscription plans. Limits live in `entitlements` — never hard-coded. */
export const plans = pgTable(
  "plans",
  {
    id: primaryId(),
    key: text().notNull().unique(),
    name: text().notNull(),
    description: text(),
    /** The fallback plan for subjects without a live subscription (exactly one). */
    isDefault: boolean().notNull().default(false),
    isPublic: boolean().notNull().default(true),
    isActive: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),
    trialDays: integer().notNull().default(0),
    entitlements: jsonb().$type<PartialEntitlementSet>().notNull().default({}),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("plans_single_default_idx")
      .on(table.isDefault)
      .where(sql`${table.isDefault}`),
  ],
);

export const planPrices = pgTable(
  "plan_prices",
  {
    id: primaryId(),
    planId: uuid()
      .notNull()
      .references(() => plans.id, { onDelete: "cascade" }),
    interval: billingInterval().notNull(),
    currency: text().notNull(),
    /** Amount in minor units (cents / kuruş). */
    amount: integer().notNull(),
    isActive: boolean().notNull().default(true),
    /** Provider-side price identifiers, e.g. { "stripe": "price_123" }. */
    providerPriceIds: jsonb().$type<Record<string, string>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [uniqueIndex().on(table.planId, table.interval, table.currency)],
);

const owner = () => ({
  ownerUserId: uuid().references(() => users.id, { onDelete: "cascade" }),
  ownerOrganizationId: uuid().references(() => organizations.id, { onDelete: "cascade" }),
});

export const billingCustomers = pgTable(
  "billing_customers",
  {
    id: primaryId(),
    ...owner(),
    provider: text().notNull(),
    providerCustomerId: text().notNull(),
    ...timestamps,
  },
  (table) => [
    check(
      "billing_customers_owner_check",
      exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId),
    ),
    uniqueIndex().on(table.provider, table.providerCustomerId),
    uniqueIndex().on(table.provider, table.ownerUserId),
    uniqueIndex().on(table.provider, table.ownerOrganizationId),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: primaryId(),
    ...owner(),
    planId: uuid()
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    priceId: uuid().references(() => planPrices.id, { onDelete: "set null" }),
    status: subscriptionStatus().notNull(),
    interval: billingInterval(),
    provider: text().notNull(),
    providerSubscriptionId: text(),
    currentPeriodStart: timestamp({ withTimezone: true }),
    currentPeriodEnd: timestamp({ withTimezone: true }),
    trialEndsAt: timestamp({ withTimezone: true }),
    cancelAtPeriodEnd: boolean().notNull().default(false),
    canceledAt: timestamp({ withTimezone: true }),
    endedAt: timestamp({ withTimezone: true }),
    /** past_due subscriptions keep access until this moment. */
    gracePeriodEndsAt: timestamp({ withTimezone: true }),
    metadata: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    ...timestamps,
  },
  (table) => [
    check(
      "subscriptions_owner_check",
      exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId),
    ),
    uniqueIndex().on(table.provider, table.providerSubscriptionId),
    // At most one non-terminal subscription per billing subject.
    uniqueIndex("subscriptions_live_user_idx")
      .on(table.ownerUserId)
      .where(
        sql`${table.ownerUserId} is not null and ${table.status} not in ('canceled', 'expired')`,
      ),
    uniqueIndex("subscriptions_live_org_idx")
      .on(table.ownerOrganizationId)
      .where(
        sql`${table.ownerOrganizationId} is not null and ${table.status} not in ('canceled', 'expired')`,
      ),
    index().on(table.status, table.currentPeriodEnd),
  ],
);

/** Inbox of verified provider webhook events — the idempotency ledger. */
export const billingEvents = pgTable(
  "billing_events",
  {
    id: primaryId(),
    provider: text().notNull(),
    providerEventId: text().notNull(),
    type: text().notNull(),
    /** Normalized, provider-independent event payload. */
    payload: jsonb().$type<Record<string, unknown>>().notNull(),
    status: billingEventStatus().notNull().default("received"),
    attempts: integer().notNull().default(0),
    lastError: text(),
    receivedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    processedAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    uniqueIndex().on(table.provider, table.providerEventId),
    index().on(table.status, table.receivedAt),
  ],
);

/** Append-only history of subscription state changes. */
export const subscriptionEvents = pgTable(
  "subscription_events",
  {
    id: primaryId(),
    subscriptionId: uuid()
      .notNull()
      .references(() => subscriptions.id, { onDelete: "cascade" }),
    type: text().notNull(),
    fromStatus: subscriptionStatus(),
    toStatus: subscriptionStatus(),
    billingEventId: uuid().references(() => billingEvents.id, { onDelete: "set null" }),
    data: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index().on(table.subscriptionId, table.createdAt)],
);

export const checkoutSessions = pgTable(
  "checkout_sessions",
  {
    id: primaryId(),
    ...owner(),
    planId: uuid()
      .notNull()
      .references(() => plans.id, { onDelete: "restrict" }),
    priceId: uuid()
      .notNull()
      .references(() => planPrices.id, { onDelete: "restrict" }),
    provider: text().notNull(),
    providerSessionId: text(),
    status: checkoutStatus().notNull().default("open"),
    url: text(),
    createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    completedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    check(
      "checkout_sessions_owner_check",
      exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId),
    ),
    uniqueIndex().on(table.provider, table.providerSessionId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: primaryId(),
    ...owner(),
    subscriptionId: uuid().references(() => subscriptions.id, { onDelete: "set null" }),
    provider: text().notNull(),
    providerPaymentId: text().notNull(),
    providerInvoiceId: text(),
    amount: bigint({ mode: "number" }).notNull(),
    currency: text().notNull(),
    status: paymentStatus().notNull(),
    failureCode: text(),
    failureMessage: text(),
    hostedInvoiceUrl: text(),
    occurredAt: timestamp({ withTimezone: true }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check("payments_owner_check", exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId)),
    uniqueIndex().on(table.provider, table.providerPaymentId),
    index().on(table.ownerUserId, table.occurredAt),
    index().on(table.ownerOrganizationId, table.occurredAt),
  ],
);

/** Manual, auditable entitlement grants (support, promotions). Layered over the plan. */
export const entitlementOverrides = pgTable(
  "entitlement_overrides",
  {
    id: primaryId(),
    ...owner(),
    entitlements: jsonb().$type<PartialEntitlementSet>().notNull(),
    reason: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }),
    createdByUserId: uuid().references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "entitlement_overrides_owner_check",
      exactlyOneOwner(table.ownerUserId, table.ownerOrganizationId),
    ),
    index().on(table.ownerUserId),
    index().on(table.ownerOrganizationId),
  ],
);

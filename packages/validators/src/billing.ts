import { z } from "zod";
import { uuidSchema } from "./primitives";
import { BILLING_PROVIDER_IDS } from "@olnktr/config/env";

export const SUBSCRIPTION_STATUSES = [
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
  "paused",
  "expired",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const BILLING_INTERVALS = ["month", "year"] as const;
export type BillingInterval = (typeof BILLING_INTERVALS)[number];

/** Billing subject: personal (no organizationId) or an organization. */
export const billingSubjectInputSchema = z.object({
  organizationId: uuidSchema.nullish(),
});

export const createCheckoutInputSchema = billingSubjectInputSchema.extend({
  planKey: z.string().min(1).max(64),
  interval: z.enum(BILLING_INTERVALS).default("month"),
  provider: z.enum(BILLING_PROVIDER_IDS).optional(),
});

export const changePlanInputSchema = createCheckoutInputSchema;

export const cancelSubscriptionInputSchema = billingSubjectInputSchema.extend({
  /** true = cancel at period end (default); false = cancel immediately */
  atPeriodEnd: z.boolean().default(true),
});

# Billing

`packages/billing` (engine) + `packages/core/src/modules/billing` (authorized facade).

## Plans

Database-backed (`plans`, `plan_prices`), seeded with **Free** (default), **Pro** (14-day trial)
and **Business**. Prices in minor units per interval/currency (USD for Stripe/dev, TRY for PayTR);
`plan_prices.provider_price_ids` maps to provider price ids (e.g. `{"stripe": "price_..."}`).
Admins change plans through `admin.plans.update` (audited); the seed never overwrites them.

## Subscription states

`incomplete → trialing | active | expired | canceled`, `trialing → active | past_due | canceled
| paused | expired`, `active → past_due | canceled | paused | expired`, `past_due → active |
canceled | paused | expired`, `paused → active | canceled | expired`, `canceled → expired`.
Invalid transitions (stale webhooks) are rejected and recorded as `transition_rejected`.
Access: active ✔, trialing until `trial_ends_at`, past_due until `grace_period_ends_at`
(`BILLING_GRACE_PERIOD_DAYS`), canceled until the paid period ends; others ✘.

## Payment provider port

`PaymentProvider { createCheckout, cancelSubscription, changePlan?, verifyWebhook, webhookAck,
capabilities }`. Providers translate webhooks to normalized events (`checkout.completed`,
`checkout.failed`, `subscription.updated`, `subscription.deleted`, `payment.succeeded`,
`payment.failed`, `ignored`).

| Provider | Status                                                                         | Notes                                                                                                                                                      |
| -------- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`    | ✅ tested end-to-end                                                           | Signed (HMAC-SHA256, 5-min tolerance) events from the local dev checkout page; refused in production                                                       |
| `stripe` | ✅ unit-tested with Stripe's real signature scheme; **not run against Stripe** | Checkout (subscription mode), trials, cancel, in-place plan change; requires `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, Stripe price ids on plan prices |
| `paytr`  | ✅ unit-tested (token + callback hash); **not run against PayTR**              | iFrame checkout per period; callbacks must be answered `OK`; no automatic renewals (lifecycle job moves unpaid periods to past_due → expired)              |

## Webhook processing guarantees

Verify signature → insert into `billing_events` (unique provider event id; duplicates are
acknowledged without reprocessing) → queue (inline processing if Redis is down; 5xx if that
fails so the provider retries) → worker locks the row and applies all events in one transaction:
subscription row, `subscription_events` history, `payments`, checkout status, billing customer.
Out-of-order events that reference unknown records throw and retry with exponential backoff;
`billing-reconcile` re-enqueues stragglers every 5 minutes. Underpayments never activate.
Emails (activation, payment failure) are post-commit side effects.

## API (tRPC `billing.*`)

`plans` (public), `summary`, `payments`, `checkout`, `changePlan`, `cancel` — subject is personal
or `organizationId` (owner role required to manage, owner/admin to read).

## Webhook endpoints

`POST /api/webhooks/billing/{dev|stripe|paytr}`. Configure the provider dashboard to send
`checkout.session.completed`, `customer.subscription.*`, `invoice.paid`, `invoice.payment_failed` (Stripe).

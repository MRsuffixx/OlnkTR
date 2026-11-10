# Data flow

## Authenticated UI request (tRPC)

1. `src/proxy.ts` assigns `x-request-id`, a CSP nonce and resolves the locale.
2. `/api/trpc` rejects cross-origin mutations, creates the context (`resolveSession` re-reads
   role/status from the DB) and runs the procedure inside `runWithContext({ requestId })`.
3. The procedure validates input (shared Zod schema) and calls a `core` service with the `Actor`.
4. The service authorizes via `core.access`, enforces entitlements, writes in a transaction
   (with audit entry) and enqueues follow-up jobs.
5. `AppError`s map to tRPC codes/HTTP statuses; unexpected errors are logged and reported.

## Public profile view

`/{username}` → `publicProfiles.resolve({ kind: "username" })` (published, non-private,
active owner) → server render with theme CSS variables → client `AnalyticsBeacon` sends
`profile.view` via `navigator.sendBeacon` to `/api/v1/analytics/events` (never blocks render).

## Analytics pipeline

`POST /api/v1/analytics/events` → per-IP rate limit → Zod validation → bot filter → DNT/GPC
opt-out → daily-rotating visitor hash (no IP stored) → Redis dedupe window → enqueue
`analytics/ingest` (jobId = ingestId) → worker `processAnalyticsEvent` (single transaction:
raw insert keyed on `ingest_id`, daily stats, exact daily uniques, dimension breakdowns,
link click counter) → hourly monthly rollup → nightly retention.
Link clicks use the same pipeline from `/go/{linkId}` before the 302 redirect.

## Billing

Checkout: `billing.checkout` → `checkout_sessions` row → provider session → browser goes to
the provider. **Nothing is activated here.**
Webhook: `/api/webhooks/billing/{provider}` → signature verification → `billing_events`
insert (unique per provider event id) → enqueue `billing/process-event` (inline fallback if
Redis is down) → worker locks the event row, applies normalized events through the state
machine in one transaction, records payments and subscription events, then sends emails.
Maintenance jobs re-enqueue unprocessed events and advance time-based states.

## Media upload

`media.requestUpload` (type/size/quota checks, pending row) → presigned PUT (Content-Type and
Content-Length signed) → browser uploads to storage → `media.completeUpload` (HEAD size check,
magic-byte sniffing, mark ready) → `media/process` job → public delivery via `/media/{id}`
(302 to a short-lived signed URL).

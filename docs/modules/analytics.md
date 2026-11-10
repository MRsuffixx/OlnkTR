# Analytics

`packages/analytics` (engine), `packages/core/src/modules/analytics` (authorized queries).

## Events

`profile.view`, `link.click`, `block.view` with profile id, link/block id, timestamp, referrer
host, device/browser/OS category, ISO country (from `ANALYTICS_COUNTRY_HEADER`, set by your
CDN/proxy), UTM source/medium/campaign/term/content, anonymous visitor hash.

## Privacy

- Raw IP addresses and user-agent strings are never stored.
- Visitor id = HMAC(daily key, ip | user-agent | profile); the key rotates every UTC day, so
  visitors cannot be tracked across days or profiles. Secret derived from `AUTH_SECRET`.
- Bots (UA heuristics) and DNT / Global Privacy Control requests are dropped.
- Retention: raw events `ANALYTICS_RAW_RETENTION_DAYS` (90), visitor sets 2 days,
  aggregates `ANALYTICS_AGGREGATE_RETENTION_DAYS` (730). Consent controls can be layered on the
  `optOut` flag of the ingest context.

## Pipeline

Public endpoint `POST /api/v1/analytics/events` (120/min per IP, ≤8 KB, strict schema) →
dedupe (views 30 min, clicks 10 s per visitor; Redis with in-memory fallback) → `analytics`
queue → worker transaction: raw insert keyed on `ingest_id` (idempotent), daily totals with
exact daily uniques, dimension breakdowns (referrer, country, device, browser, os, utm_source,
utm_campaign, link, block), `links.click_count`. Events for unpublished profiles or foreign
links are discarded. Monthly rollups (hourly, idempotent) and retention (nightly) run on the
maintenance queue. If Redis is down, events are dropped (logged at most once a minute) and
pages keep working.

## Queries

`analytics.summary({ profileId, from, to })` (tRPC) / `GET /api/v1/analytics` (REST): totals,
daily series; breakdowns only with `analytics.level = advanced`. The range is clamped to
`analytics.history_days`.

# Database schema overview

PostgreSQL 18, managed with Drizzle ORM (`packages/db/src/schema/*`), snake_case columns,
UUID primary keys, `timestamptz` timestamps. 36 tables in the initial migration.

| Module                 | Tables                                                                                                                                                          |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Identity (Better Auth) | `users`, `sessions`, `accounts`, `verifications`, `two_factors`, `rate_limits`                                                                                  |
| Users                  | `user_preferences`                                                                                                                                              |
| Organizations          | `organizations`, `organization_members`, `organization_invitations`                                                                                             |
| Profiles               | `profiles`                                                                                                                                                      |
| Links                  | `links`, `link_categories`                                                                                                                                      |
| Blocks                 | `blocks`                                                                                                                                                        |
| Themes                 | `themes`, `theme_versions`, `theme_favorites`                                                                                                                   |
| Studio drafts          | `profile_drafts` (one draft document per profile; revision, published revision, live fingerprint)                                                               |
| Media                  | `media_files`                                                                                                                                                   |
| Billing                | `plans`, `plan_prices`, `billing_customers`, `subscriptions`, `subscription_events`, `checkout_sessions`, `payments`, `billing_events`, `entitlement_overrides` |
| Analytics              | `analytics_events`, `analytics_daily_stats`, `analytics_daily_dimensions`, `analytics_daily_visitors`, `analytics_monthly_stats`                                |
| API                    | `api_keys`, `api_usage_daily`                                                                                                                                   |
| Administration         | `audit_logs`, `system_settings`, `feature_flags`                                                                                                                |

## Notable constraints

- `profiles.username` unique (normalized lower-case); `organizations.slug` unique.
- Tenant-owned tables (`profiles`, `media_files`, `subscriptions`, `payments`, `api_keys`,
  `checkout_sessions`, `billing_customers`, `entitlement_overrides`) have a CHECK that exactly
  one of `owner_user_id` / `owner_organization_id` is set.
- `subscriptions`: partial unique indexes allow at most one non-terminal subscription per owner;
  `(provider, provider_subscription_id)` unique.
- `billing_events (provider, provider_event_id)` unique → webhook idempotency.
- `payments (provider, provider_payment_id)` unique → payment idempotency.
- `analytics_events.ingest_id` unique → exactly-once aggregation across job retries.
- `plans`: partial unique index ensures a single default plan.
- `blocks.link_id` unique: each link owns exactly one layout block.
- `organization_invitations`: one pending invitation per (organization, email); token stored as SHA-256.

## Enums

`organization_role`, `membership_status`, `invitation_status`, `profile_visibility`,
`profile_status`, `media_status`, `subscription_status`, `billing_interval`, `payment_status`,
`billing_event_status`, `checkout_status`. Open-ended values (block types, user status, platform
role, theme status) are `text` validated in code so new values need no migration.

## JSONB

`blocks.config` (versioned by `schema_version`, validated by the block registry),
`theme_versions.config` (theme schema v1/v2, migrated on read), `profiles.theme_overrides`, `blocks.appearance`, `profile_drafts.document` (editor document v1), `plans.entitlements` / `entitlement_overrides.entitlements`
(entitlement catalogue schema), `links.metadata`, `billing_events.payload` (normalized events),
`audit_logs.metadata` (sanitized).

## Analytics retention

Raw events: `ANALYTICS_RAW_RETENTION_DAYS` (default 90). Daily visitor sets: 2 days. Daily
stats/dimensions: `ANALYTICS_AGGREGATE_RETENTION_DAYS` (default 730). Monthly rollups are kept.
`analytics_events.link_id/block_id` intentionally have no FK (high-volume table).

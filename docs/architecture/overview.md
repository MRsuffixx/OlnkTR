# Architecture overview

OlnkTR is a **modular monolith**: one repository, two deployable processes, many domain
packages with explicit boundaries. It is designed so that individual modules (analytics,
billing, media) could later be extracted into services without rewriting their logic.

## Runtime components

| Component      | Responsibility                                                                                                                                     | Code                                                   |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Web app        | Pages (locale routing, dashboard shell, public profiles), tRPC, REST v1, Better Auth endpoints, webhooks, click redirects, media redirects, health | `apps/web`                                             |
| Worker         | BullMQ consumers for `analytics`, `email`, `billing`, `media`, `maintenance`; cron schedulers; health/queue metrics on :3101                       | `apps/worker`                                          |
| PostgreSQL 18  | System of record (36 tables)                                                                                                                       | `packages/db`                                          |
| Redis 8        | BullMQ queues, rate-limit counters, analytics dedupe                                                                                               | `packages/jobs`, `packages/api/src/http/rate-limit.ts` |
| S3 / MinIO     | Media objects (presigned upload/download)                                                                                                          | `packages/storage`                                     |
| SMTP / Mailpit | Transactional email                                                                                                                                | `packages/email`                                       |
| Caddy (prod)   | TLS termination, client-IP header, media host                                                                                                      | `infrastructure/docker/caddy`                          |

## Package layers

```
config, types                         (no internal deps)
validators, observability             (shared contracts, logging/tracing)
db                                    (schema, client, migrations, seed)
jobs, storage, email                  (infrastructure ports + adapters)
billing, analytics                    (SaaS engine, analytics engine)
core                                  (domain modules + composition root)
auth                                  (Better Auth configuration)
api                                   (container, tRPC, REST, HTTP handlers)
apps/web, apps/worker                 (delivery)
ui                                    (presentation primitives; React only)
```

## What is implemented vs. deferred

Implemented and tested: identity (Better Auth), user lifecycle, organizations/tenancy,
profiles, links, versioned blocks, themes, plans/subscriptions/entitlements, payment
provider abstraction (dev, Stripe, PayTR adapters), webhook inbox, analytics pipeline,
media uploads, API keys + REST v1, administration + audit, i18n (en/tr), Docker, CI.

Deferred by design: custom domains (only the resolution boundary exists — see
`docs/modules/profiles.md`), visual block editor, theme editor/marketplace, rich
dashboards, image processing implementations (the `ImageProcessor` port exists),
PayTR recurring charges (card storage API).

# OlnkTR

Open-source, self-hostable **Link-in-Bio SaaS** — multiple profiles per user, a versioned
content-block system, themes, organizations and teams, privacy-preserving analytics, a
public REST API, and a complete subscription/entitlement engine with pluggable payment
providers (Stripe, PayTR). English and Turkish out of the box.

> Status: **foundation phase.** The backend, infrastructure, security model and a minimal
> functional UI are implemented and tested. Rich dashboards, the visual editor, the theme
> marketplace and custom domains are planned for later phases (see `docs/architecture/overview.md`).

## Architecture at a glance

- **Modular monolith** (pnpm + Turborepo): `apps/web` (Next.js 16) and `apps/worker` (BullMQ)
  on top of domain packages in `packages/*`.
- **PostgreSQL** (Drizzle ORM, least-privilege roles) · **Redis** (BullMQ queues, rate limits) ·
  **S3-compatible storage** (MinIO locally) · **SMTP** (Mailpit locally).
- **Better Auth** for identity (email/password, verification, reset, OAuth-ready, 2FA-ready).
- **tRPC** for the first-party UI and a versioned **REST API** (`/api/v1`) with scoped API keys.

Read [`AGENTS.md`](./AGENTS.md) for the engineering rules and [`docs/`](./docs) for details.

## Quick start (local development)

Requirements: Node.js 24 LTS, pnpm 10, Docker with Compose v2.

```bash
pnpm install
pnpm setup:env              # writes .env with freshly generated secrets
pnpm infra:up               # Postgres :54329, Redis :63799, MinIO :19000, Mailpit :18025 (127.0.0.1 only)
pnpm db:migrate && pnpm db:seed
pnpm dev                    # web: http://localhost:3100 · worker health: http://localhost:3101/health
```

Open http://localhost:3100, register, then open the verification email in Mailpit
(http://localhost:18025). Billing uses the local **dev payment provider**, which drives the
real webhook pipeline with signed events (it is refused in production).

Everything in containers instead (production images, development settings):

```bash
docker compose --profile app up -d --build
```

## Quality gates

```bash
pnpm format:check && pnpm lint && pnpm typecheck
pnpm test:unit
pnpm db:test:prepare && pnpm test:integration   # uses the isolated olnktr_test database
pnpm build
pnpm test:e2e                                    # against a running stack (see docs/development/testing.md)
```

## Production

`docker-compose.prod.yml` runs Caddy (automatic HTTPS) in front of the web app, worker,
PostgreSQL, Redis and MinIO, with nothing but ports 80/443 exposed. See
[`docs/deployment/production.md`](./docs/deployment/production.md) and
[`docs/deployment/backups.md`](./docs/deployment/backups.md).

## Documentation

| Area         | Documents                                                                                                                                                                                                                                                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Architecture | [overview](docs/architecture/overview.md), [modular monolith](docs/architecture/modular-monolith.md), [data flow](docs/architecture/data-flow.md), [dependency rules](docs/architecture/dependency-rules.md)                                                                                                                                                       |
| Database     | [schema](docs/database/schema-overview.md), [migrations](docs/database/migrations.md), [tenancy](docs/database/tenancy.md)                                                                                                                                                                                                                                         |
| Modules      | [authentication](docs/modules/authentication.md), [profiles](docs/modules/profiles.md), [links](docs/modules/links.md), [blocks](docs/modules/blocks.md), [billing](docs/modules/billing.md), [entitlements](docs/modules/entitlements.md), [analytics](docs/modules/analytics.md), [organizations](docs/modules/organizations.md), [media](docs/modules/media.md) |
| Security     | [security model](docs/security/security-model.md), [authorization](docs/security/authorization.md)                                                                                                                                                                                                                                                                 |
| Deployment   | [development](docs/deployment/development.md), [docker](docs/deployment/docker.md), [production](docs/deployment/production.md), [backups](docs/deployment/backups.md)                                                                                                                                                                                             |
| Development  | [coding standards](docs/development/coding-standards.md), [testing](docs/development/testing.md), [contributing](docs/development/contributing.md)                                                                                                                                                                                                                 |

## License

No license has been selected yet. Choose one (and add a `LICENSE` file) before publishing.

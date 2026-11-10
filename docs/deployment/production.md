# Production deployment

## Topology (`docker-compose.prod.yml`)

`caddy` (80/443, automatic HTTPS for `APP_DOMAIN` and `MEDIA_DOMAIN`) → `web` (3000) and
`minio` (9000, presigned media URLs). `worker`, `postgres`, `redis`, `minio` are only on the
internal network. `migrate` runs migrations + idempotent seed before web/worker start.

## Steps

```bash
cp .env.production.example .env.production && chmod 600 .env.production
# fill every value; generate secrets with: openssl rand -base64 48
docker compose -f docker-compose.prod.yml --env-file .env.production build
docker compose -f docker-compose.prod.yml --env-file .env.production up -d
```

DNS: point `APP_DOMAIN` and `MEDIA_DOMAIN` to the host. Set `S3_PUBLIC_ENDPOINT=https://<MEDIA_DOMAIN>`.

## Required configuration

`APP_URL` (https), `AUTH_SECRET`, Postgres passwords (superuser, app, migrator), `REDIS_PASSWORD`,
SMTP settings, MinIO root + application credentials, `BILLING_PROVIDERS` with provider secrets
(`STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET`, `PAYTR_MERCHANT_*`). Startup fails fast with a list
of invalid variables. `APP_ENV=production` enforces https, real secrets, no dev billing and auth
rate limiting.

## Hardening in place

Non-root containers, `no-new-privileges`, `cap_drop: ALL` for app containers, read-only worker
filesystem, Redis `requirepass`, MinIO console disabled, log rotation, least-privilege DB roles,
`TRUST_PROXY=true` with Caddy overwriting `X-Forwarded-For`.

## Operations

- Health: `GET /api/health/live` (process), `GET /api/health/ready` (DB/Redis/storage),
  `GET /api/v1/health` (public); worker `GET :3101/health`, `:3101/queues` (in-network).
- Logs: JSON (Pino) with `requestId`, `userId`, `jobId`; secrets redacted.
- Errors: set `SENTRY_DSN` (any Sentry-protocol backend). Tracing: `OTEL_EXPORTER_OTLP_ENDPOINT`.
- Payment webhooks: `https://<APP_DOMAIN>/api/webhooks/billing/stripe` and `/paytr`.
- Backups: `docs/deployment/backups.md`.
- Scaling: web is stateless (scale horizontally behind Caddy/LB); workers can run multiple
  replicas (BullMQ distributes jobs; schedulers are upserted idempotently).

## Using managed services

Point `DATABASE_URL`/`DATABASE_MIGRATION_URL`, `REDIS_URL` and `S3_*` at managed PostgreSQL,
Redis and S3/R2 and remove the corresponding services from the compose file. Create the two DB
roles as in `infrastructure/docker/postgres/init/01-roles-and-databases.sh`.

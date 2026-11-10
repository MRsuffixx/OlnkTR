# Local development

## Prerequisites

Node.js 24 LTS (`.nvmrc`), pnpm 10 (`packageManager` field), Docker + Compose v2.

## First run

```bash
pnpm install
pnpm setup:env                 # .env from .env.example with generated AUTH_SECRET / dev webhook secret
pnpm infra:up                  # postgres, redis, minio (+ bucket/user init), mailpit
pnpm db:migrate && pnpm db:seed
pnpm dev                       # turbo: next dev (:3100) + tsx watch worker (:3101 health)
```

| Service                | URL (127.0.0.1 only)                                 |
| ---------------------- | ---------------------------------------------------- |
| Web                    | http://localhost:3100 (Turkish under /tr)            |
| Worker health / queues | http://localhost:3101/health, /queues                |
| Mailpit                | http://localhost:18025 (SMTP 11025)                  |
| MinIO API / console    | http://localhost:19000 / http://localhost:19001      |
| PostgreSQL             | localhost:54329 (db `olnktr`, test db `olnktr_test`) |
| Redis                  | localhost:63799 (tests use DB 15)                    |

Ports avoid common defaults (3000, 5432, 6379, 25, ...); override them in `.env`.

## Everyday commands

`pnpm lint`, `pnpm typecheck`, `pnpm test:unit`, `pnpm test:integration`, `pnpm db:generate`,
`pnpm db:studio`, `pnpm format`.

## Making yourself an admin

```sql
update users set role = 'admin' where email = 'you@example.com';
```

(run as the migrator or superuser, e.g. `docker compose exec postgres psql -U postgres -d olnktr`).

## Billing locally

`BILLING_PROVIDERS=dev`: choosing a plan opens `/api/billing/dev/checkout`, where you pick
success or decline; a signed webhook is generated and processed by the normal pipeline.

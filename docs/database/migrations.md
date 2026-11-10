# Migrations

Drizzle Kit generates SQL migrations from the TypeScript schema; a small runner applies them.

```bash
# 1. edit packages/db/src/schema/*.ts
pnpm db:generate            # writes packages/db/migrations/NNNN_<name>.sql (+ meta snapshot)
# 2. review the SQL, commit schema + migration together
pnpm db:migrate             # applies pending migrations (DATABASE_MIGRATION_URL)
pnpm db:seed                # idempotent: plans, prices, system themes, settings
pnpm db:test:prepare        # migrate + seed the isolated *_test database
```

Rules:

- Never edit or delete an applied migration; add a new one.
- Destructive changes ship in two steps (expand → migrate data → contract).
- Migrations run as `olnktr_migrator` (schema owner). The application connects as
  `olnktr_app`, which only has SELECT/INSERT/UPDATE/DELETE (default privileges are granted by
  `infrastructure/docker/postgres/init/01-roles-and-databases.sh`).
- In containers, the `migrate` service runs `node dist/migrate.js --seed` (bundled into the
  worker image together with `dist/migrations`) before web and worker start.
- The seed only inserts missing rows; it never overwrites plans or settings changed by admins.

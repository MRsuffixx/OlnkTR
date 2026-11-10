# Contributing

1. Read `AGENTS.md` and the docs of the module you are changing.
2. Create a branch; keep changes focused on one module/concern.
3. Write or update tests first for bug fixes; cover authorization and entitlements for new
   service methods.
4. Run locally: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test:unit`, plus
   `pnpm test:integration` for backend changes and `pnpm test:e2e` for UI flows.
5. Schema changes: `pnpm db:generate`, review SQL, commit the migration.
6. New env vars: schema in `packages/config/src/env.ts`, `.env.example`, production checks,
   docs.
7. New user-facing strings: both `en.json` and `tr.json`.
8. Update documentation in the same pull request. CI (`.github/workflows/ci.yml`) runs
   formatting, lint, typecheck, unit, integration, build, E2E, dependency audit and Docker builds.

Commit messages: imperative mood, explain _why_. Security issues: report privately to the
maintainers instead of opening a public issue.

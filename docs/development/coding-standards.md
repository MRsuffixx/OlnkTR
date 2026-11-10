# Coding standards

The authoritative rules are in `AGENTS.md`; this page explains conventions.

- **TypeScript**: strict, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, bundler resolution,
  no `any`, `import type` for types. TypeScript 6.0 (TS 7 awaits typescript-eslint support).
- **Formatting**: Prettier (100 cols, double quotes, trailing commas). `pnpm format`.
- **Linting**: ESLint 10 flat config, type-aware typescript-eslint, Next.js + React hooks rules,
  workspace boundary rules. Fix the code, don't disable rules.
- **Errors**: `errors.*` helpers create `AppError`s with client-safe messages and structured
  `details`; transports map them. Unexpected errors bubble up and are reported.
- **Validation**: one Zod schema per contract in `@olnktr/validators`, reused by UI forms (React
  Hook Form + zodResolver), tRPC inputs, REST handlers and job payloads.
- **Services**: factory functions receiving explicit dependencies (`CoreDeps`), returning plain
  objects. Every tenant method's first argument is the `Actor`.
- **Data access**: Drizzle query builder; module repositories (`profileRepository`,
  `blockLayout`) for shared queries; transactions for multi-row writes; audit in the same tx.
- **i18n**: no hard-coded user-facing strings in the web app — add keys to both
  `messages/en.json` and `messages/tr.json` (a unit test checks they match). Format numbers and
  dates with next-intl formatters.
- **Logging**: inject `Logger`; structured fields, no secrets; `requestId` is added automatically.
- **Naming**: English identifiers; files kebab-case; React components PascalCase.

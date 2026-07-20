# Contributing to olnk.tr

Thank you for investing your time in olnk.tr. Contributions that improve reliability, accessibility, security, localization, documentation, or the user experience are welcome.

[Read the Turkish contribution guide](CONTRIBUTING.tr.md)

## Code of Conduct

By participating, you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md). Report security vulnerabilities through the private process in [SECURITY.md](SECURITY.md).

## Before you begin

1. Search existing issues and pull requests to avoid duplicate work.
2. Open an issue before starting a large feature, architectural change, database redesign, or breaking change.
3. Keep each contribution focused on one problem.
4. Do not include credentials, personal data, generated secrets, or unrelated formatting changes.

Small bug fixes and documentation improvements may be submitted directly as pull requests.

## Development setup

1. Fork the repository and clone your fork.
2. Create a branch from the latest `main` branch.
3. Install dependencies and configure the environment:

   ```bash
   corepack enable
   pnpm install
   cp .env.example .env
   pnpm exec auth secret
   ```

4. Add the generated secret and a PostgreSQL `DATABASE_URL` to `.env`.
5. Prepare the database and start the application:

   ```bash
   pnpm db:generate
   pnpm db:migrate:dev
   pnpm dev
   ```

Use short, descriptive branch names such as:

- `feat/profile-scheduling`
- `fix/username-race`
- `docs/security-reporting`
- `refactor/payment-registry`

## Engineering guidelines

- Preserve end-to-end type safety. Validate untrusted input with Zod and expose server operations through established tRPC or route-handler patterns.
- Follow the existing Next.js App Router, Prisma, Tailwind CSS, and component conventions.
- Keep the interface mobile-first, keyboard accessible, and usable with assistive technology.
- Include explicit loading, empty, success, and error states where they apply.
- Treat authorization, ownership checks, redirect targets, uploaded content, and payment callbacks as security boundaries.
- Avoid collecting or logging credentials, tokens, raw payment data, or unnecessary personal information.
- Keep database queries selective and preserve indexes for public profiles and analytics paths.
- Add or update automated tests when the affected area has test coverage.
- Do not add dependencies unless the benefit outweighs the maintenance, performance, and security cost.
- Update both English and Turkish documentation when a change affects users or contributors.

### Database changes

When changing `prisma/schema.prisma`:

1. Create a descriptive migration with `pnpm db:migrate:dev`.
2. Review the generated SQL for data loss, locks, and unsafe defaults.
3. Commit the schema and migration together.
4. Document deployment or backfill steps in the pull request.
5. Never edit a migration that may already have been applied outside your machine; add a new migration instead.

## Commit convention

Use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) with an imperative, concise summary:

```text
<type>(optional-scope): <summary>
```

Accepted types:

| Type | Use |
| --- | --- |
| `feat` | User-visible feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `refactor` | Internal change without a feature or fix |
| `perf` | Performance improvement |
| `test` | Test additions or corrections |
| `build` | Build system or dependency change |
| `ci` | Continuous integration change |
| `chore` | Maintenance not covered above |
| `revert` | Revert of an earlier change |

Examples:

```text
feat(editor): add scheduled link controls
fix(auth): prevent duplicate username claims
docs(readme): clarify PostgreSQL setup
```

Use a `!` after the type or add a `BREAKING CHANGE:` footer when compatibility is intentionally broken.

## Quality checks

Before opening a pull request, run:

```bash
pnpm check
pnpm format:check
pnpm build
```

Also exercise the affected flow manually, including narrow mobile layouts and relevant failure states. If a command cannot run in your environment, explain why in the pull request.

## Pull requests

- Use a Conventional Commit-style pull request title.
- Explain the problem, the chosen solution, and notable trade-offs.
- Link related issues with `Closes #123` when appropriate.
- Include screenshots or a short recording for visible interface changes.
- Identify schema changes, new environment variables, deployment steps, and backward-compatibility concerns.
- Keep generated files and lockfile changes limited to those required by the contribution.
- Confirm that no secret or sensitive user data appears in the diff, logs, screenshots, or test fixtures.
- Mark unfinished work as a draft pull request.
- Address review comments with follow-up commits; maintainers may squash commits when merging.

A pull request may be closed when it is inactive, out of scope, unsafe, or superseded. Maintainers will aim to explain the decision.

## Contribution licensing

By submitting a contribution, you confirm that you have the right to provide it and agree to license it under the project's current [olnk.tr Monetized Attribution License 1.0](LICENSE), including its monetized-use attribution condition. You retain copyright in your contribution. Do not submit work governed by incompatible terms or add separate conditions without written maintainer approval.

## Reporting bugs

A useful bug report includes:

- A clear title and expected behavior
- Exact reproduction steps
- Actual behavior and complete error messages
- Browser, operating system, Node.js, and pnpm versions when relevant
- A minimal reproduction or screenshots with sensitive data removed

Do not use public issues for suspected vulnerabilities. Follow [SECURITY.md](SECURITY.md) instead.

# olnk.tr

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)
[![License](https://img.shields.io/badge/license-OMAL--1.0-5C4EE5)](LICENSE)
![Pull requests welcome](https://img.shields.io/badge/pull%20requests-welcome-brightgreen.svg)

A mobile-first link-in-bio platform for creators, professionals, and small businesses, built primarily for Turkish-speaking users. Each user receives a public page at `olnk.tr/[username]` where they can publish links, personalize their profile, share a QR code, and understand audience engagement.

[Read the Turkish documentation](README.tr.md)

> [!NOTE]
> olnk.tr is under active development. Features and data models may change before a stable release.

## Core features

- **Authentication and onboarding:** Google OAuth and passwordless email sign-in with Auth.js, plus normalized and database-enforced unique usernames.
- **Username safety:** Reserved-route checks, Turkish-aware normalization, obfuscation-resistant moderation, and a database-managed blocklist.
- **Public profiles:** Fast server-rendered pages with canonical URLs, Open Graph metadata, structured data, responsive layouts, and downloadable QR codes.
- **Profile editor:** A split-screen dashboard with a live phone preview, click-to-edit controls, drag-and-drop ordering, and revision-aware autosave.
- **Appearance controls:** Custom backgrounds, typography, button styles, layouts, visual effects, per-link styling, and optional custom CSS.
- **Link controls:** Scheduled links, password protection, YouTube and Spotify embeds, visibility toggles, and safe redirect handling.
- **Analytics:** Non-blocking click and profile-view collection with referrer, country, device, and time-based insights.
- **Billing and storage:** Optional payment integrations for Pro features and optional S3-compatible media storage.
- **Account management:** Profile settings, username changes, subscription management, and permanent account deletion.

## Technology stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript 5.9 |
| API and validation | tRPC 11, TanStack Query, Zod 4, SuperJSON |
| Authentication | Auth.js / NextAuth 5, Prisma adapter, Google OAuth, Nodemailer |
| Database | PostgreSQL, Prisma 7 |
| Styling | Tailwind CSS 4 |
| Interaction | dnd kit, Lucide React |
| Payments | Stripe, iyzico, PayTR, Adyen |
| Storage | S3-compatible object storage |
| Package manager | pnpm 11 |

## Getting started

### Prerequisites

- Node.js 20.9 or newer
- pnpm 11 through Corepack or a direct installation
- A running PostgreSQL database
- At least one authentication provider: Google OAuth or an SMTP server

### 1. Clone the repository

```bash
git clone https://github.com/MRsuffixx/OlnkTR.git
cd OlnkTR
corepack enable
pnpm install
```

The `postinstall` script generates the Prisma client automatically.

### 2. Configure the environment

Copy the example file and replace the placeholder values:

```bash
cp .env.example .env
pnpm exec auth secret
```

Add the generated value to `AUTH_SECRET` in `.env`.

| Variable group | Purpose | Required |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection URL | Yes |
| `AUTH_SECRET` | Session and token security | Required in production; recommended locally |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth | Required when Google sign-in is enabled |
| `EMAIL_SERVER`, `EMAIL_FROM` | Passwordless email sign-in | Required when email sign-in is enabled |
| `NEXT_PUBLIC_APP_URL` | Canonical application URL | Recommended |
| Payment-provider variables | Pro plan checkout and webhooks | Optional |
| `STORAGE_*` | S3-compatible avatar and background uploads | Optional |

For Google OAuth, register these callback URLs:

- Local: `http://localhost:3000/api/auth/callback/google`
- Production: `https://your-domain.example/api/auth/callback/google`

Never commit `.env` or production credentials.

### 3. Prepare the database

```bash
pnpm db:generate
pnpm db:migrate:dev
```

Use `pnpm db:migrate` instead when applying committed migrations in a deployment environment.

### 4. Start development

```bash
pnpm dev
```

Open `http://localhost:3000` in a browser.

## Available commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the Turbopack development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Run the production server |
| `pnpm check` | Run ESLint and TypeScript checks |
| `pnpm lint` | Run ESLint with zero warnings allowed |
| `pnpm typecheck` | Run TypeScript without emitting files |
| `pnpm format:check` | Check formatting |
| `pnpm format:write` | Format supported source files |
| `pnpm db:generate` | Generate the Prisma client |
| `pnpm db:migrate:dev` | Create or apply development migrations |
| `pnpm db:migrate` | Apply committed migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Project structure

```text
prisma/                 Database schema and migrations
src/app/                Next.js routes, pages, and route handlers
src/components/         Reusable interface and profile components
src/config/             Product policies and static configuration
src/lib/                Shared schemas, normalization, and utilities
src/server/api/         Type-safe tRPC procedures
src/server/auth/        Authentication configuration
src/server/payments/    Payment provider adapters and billing services
src/server/security/    Link access and content-safety utilities
```

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request. Participation in this project is governed by the [Code of Conduct](CODE_OF_CONDUCT.md).

Security vulnerabilities must be reported privately according to [SECURITY.md](SECURITY.md), not through a public issue.

## License

olnk.tr is available under the custom [olnk.tr Monetized Attribution License 1.0](LICENSE). You may use, modify, fork, redistribute, sell, or host the project. Monetized use must clearly identify olnk.tr as the basis of the work and link to the [original repository](https://github.com/MRsuffixx/OlnkTR).

The license requires neither profit sharing nor disclosure of modified source code. It is a source-available license, not an OSI-approved open-source license. A [Turkish translation](LICENSE.tr) is provided for convenience; the English license controls if the texts differ.

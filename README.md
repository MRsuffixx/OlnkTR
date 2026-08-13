# olnk.tr

<div align="center">
  <a href="https://olnk.tr" target="_blank" rel="noopener noreferrer" style="display:inline-block; padding:12px 24px; background-color:#0969da; color:#ffffff !important; text-decoration:none; border-radius:6px; font-weight:bold; font-size:16px;">🔴LIVE APP</a>
</div>
<br>

![olnk.tr](./public/og.png)

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-database-4169E1?logo=postgresql&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11-F69220?logo=pnpm&logoColor=white)
[![License](https://img.shields.io/badge/license-OMAL--1.0-5C4EE5)](LICENSE)
![Pull requests welcome](https://img.shields.io/badge/pull%20requests-welcome-brightgreen.svg)

A mobile-first, full-scale profile and website builder for creators, professionals, communities, and businesses, built primarily for Turkish-speaking users. Each user receives a public site at `olnk.tr/[username]`; links are one content type in a platform built for structured sections, widgets, reusable themes, integrations, media, and rich identity without turning appearance settings into database columns.

[Read the Turkish documentation](README.tr.md)

> [!NOTE]
> olnk.tr is under active development. Features and data models may change before a stable release.

## Core features

- **Authentication and onboarding:** Google OAuth and passwordless email sign-in with Auth.js, plus normalized and database-enforced unique usernames.
- **Username safety:** Reserved-route checks, Turkish-aware normalization, obfuscation-resistant moderation, and a database-managed blocklist.
- **Public profiles:** Fast server-rendered pages with canonical URLs, Open Graph metadata, structured data, responsive layouts, and downloadable QR codes.
- **Full website builder:** Profile, link, social, design, and music workspaces with live phone, tablet, and desktop previews, click-to-edit controls, drag-and-drop ordering, and revision-aware autosave.
- **Versioned design engine:** Semantic colour tokens, profile cards, layout templates, full-theme presets, custom backgrounds, typography, button styles, lazy canvas/retro effects, audio, SEO, privacy controls, and optional custom CSS.
- **Link controls:** Scheduled links, password protection, YouTube and Spotify embeds, visibility toggles, and safe redirect handling.
- **Profile gates and audio:** Server-enforced whole-profile passwords plus gesture-first Spotify, SoundCloud, and uploaded audio with visible stop/mute controls.
- **Analytics:** Non-blocking click and profile-view collection with referrer, country, device, and time-based insights.
- **Billing and storage:** Optional payment integrations for Pro features and optional S3-compatible media storage.
- **Account management:** Profile settings, username changes, subscription management, and permanent account deletion.

Architecture contributors should begin with [the existing-product audit](PROJECT_AUDIT.md) and
[the profile-builder extension contract](docs/PROFILE_BUILDER.md).

## Technology stack

| Layer              | Technology                                                     |
| ------------------ | -------------------------------------------------------------- |
| Application        | Next.js 16, React 19, TypeScript 6                             |
| API and validation | tRPC 11, TanStack Query, Zod 4, SuperJSON                      |
| Authentication     | Auth.js / NextAuth 5, Prisma adapter, Google OAuth, Nodemailer |
| Database           | PostgreSQL, Prisma 7                                           |
| Styling            | Tailwind CSS 4                                                 |
| Interaction        | dnd kit, Lucide React                                          |
| Payments           | Stripe, iyzico, PayTR, Adyen                                   |
| Storage            | S3-compatible object storage                                   |
| Package manager    | pnpm 11                                                        |

## Getting started

### Prerequisites

- Node.js 20.19+, 22.13+, or 24+
- pnpm 11 through Corepack or a direct installation
- A running PostgreSQL database
- At least one authentication provider: Google OAuth or an SMTP server

### Quick start with Docker

Run the application, database, and local email catcher without installing Node.js
or PostgreSQL on the host:

```bash
docker compose up --build --wait
```

- Application: `http://localhost:3000`
- Local inbox (Mailpit): `http://localhost:8025`
- The one-shot `migrate` service applies all committed migrations before the app starts.
- Local SMTP is wired to `smtp://mailpit:1025`.

To inspect logs or stop the stack:

```bash
docker compose logs --follow app
docker compose down
```

The Compose defaults are local-development values and all published ports bind to
`127.0.0.1`. Set strong `AUTH_SECRET`/`CRON_SECRET` values and a real
`DOCKER_APP_URL` before any internet-facing deployment. To intentionally remove
the local database and captured messages, use `docker compose down --volumes`.

### 1. Clone the repository

```bash
git clone https://github.com/MRsuffixx/OlnkTR.git
cd OlnkTR
corepack enable
pnpm install
```

Prisma Client is generated by `pnpm dev`, `pnpm build`, or the explicit
`pnpm db:generate` command. `pnpm start` never mutates dependencies and expects
an existing production build.

### 2. Configure the environment

Copy the example file and replace the placeholder values:

```bash
cp .env.example .env
pnpm exec auth secret
```

Add the generated value to `AUTH_SECRET` in `.env`.

| Variable group                         | Purpose                                            | Required                                |
| -------------------------------------- | -------------------------------------------------- | --------------------------------------- |
| `DATABASE_URL`                         | PostgreSQL connection URL                          | Yes                                     |
| `AUTH_SECRET`                          | Session and token security                         | Required in every environment           |
| `AUTH_URL`                             | Auth.js callback and magic-link origin             | Recommended for Docker/production       |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth                                       | Required when Google sign-in is enabled |
| `EMAIL_SERVER`, `EMAIL_FROM`           | Passwordless email sign-in                         | Required when email sign-in is enabled  |
| `NEXT_PUBLIC_APP_URL`                  | Canonical application URL (required in production) | Required in production                  |
| Payment-provider variables             | Pro plan checkout and webhooks                     | Optional                                |
| `STORAGE_*`                            | S3-compatible avatar and background uploads        | Optional                                |

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

| Command                                      | Description                                           |
| -------------------------------------------- | ----------------------------------------------------- |
| `pnpm dev`                                   | Start the Turbopack development server                |
| `pnpm build`                                 | Create a production build                             |
| `pnpm start`                                 | Run the production server                             |
| `pnpm check`                                 | Run ESLint and TypeScript checks                      |
| `pnpm lint`                                  | Run ESLint with zero warnings allowed                 |
| `pnpm typecheck`                             | Run TypeScript without emitting files                 |
| `pnpm format:check`                          | Check formatting                                      |
| `pnpm format:write`                          | Format supported source files                         |
| `pnpm db:generate`                           | Generate the Prisma client                            |
| `pnpm db:migrate:dev`                        | Create or apply development migrations                |
| `pnpm db:migrate`                            | Apply committed migrations                            |
| `pnpm db:studio`                             | Open Prisma Studio                                    |
| `pnpm admin:role <email> --role ADMIN\|USER` | Promote or demote an existing account from the server |

### Creating the first administrator

Admin access is never granted through a public API or dashboard toggle. Run the
database-backed command from a trusted server or deployment shell:

```bash
pnpm admin:role owner@example.com --role ADMIN
```

The account must already exist. Demotion uses `--role USER`; demoting the last admin is
refused unless `--force-last-admin` is supplied deliberately. Every change is written to
the immutable admin audit log.

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

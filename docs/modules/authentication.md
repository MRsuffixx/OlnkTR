# Authentication

Implemented with **Better Auth 1.7** (`packages/auth`). OlnkTR never implements its own
password hashing, session tokens or cookie crypto.

## Features

| Feature                                       | Status                  | Notes                                                                                     |
| --------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------- |
| Email + password sign-up / sign-in / sign-out | ✅ tested               | passwords 10–128 chars, hashed by Better Auth (scrypt)                                    |
| Email verification                            | ✅ tested               | required by default (`AUTH_REQUIRE_EMAIL_VERIFICATION`), link via email queue             |
| Password reset                                | ✅ tested               | 1 h tokens, sessions revoked on reset, no account enumeration                             |
| Sessions                                      | ✅ tested               | DB sessions, 30 d expiry, daily refresh, cookie cache disabled so revocation is immediate |
| OAuth (Google, GitHub)                        | ⚙️ configured, untested | enabled only when `GOOGLE_*` / `GITHUB_*` are set                                         |
| Two-factor (TOTP)                             | ⚙️ plugin enabled       | schema + `/two-factor` verification page; enrolment UI is a later phase                   |
| Rate limiting                                 | ✅ tested               | DB-backed, per client IP: sign-in 10/min, sign-up 20/h, reset 5/h, 2FA 5/min              |
| CSRF / origin checks                          | ✅ tested               | explicitly enabled (Better Auth would skip them when NODE_ENV=test)                       |

## Cookies

Prefix `olnktr.`, `httpOnly`, `SameSite=Lax`; `Secure` + `__Secure-` prefix when `APP_URL` is
https in production.

## Custom fields and hooks

`users.role` (`user|support|admin`) and `users.status` (`active|suspended|pending_deletion`)
are Better Auth additional fields with `input: false` (never client-settable). Hooks:

- `user.create.before` — refuses sign-up when the `registration.enabled` setting is false
  (the `/api/auth/sign-up` route also returns 403 early).
- `user.create.after` — creates preferences (locale from `x-olnktr-locale`) and audits.
- `session.create.before` — refuses sessions for suspended accounts.
- `hooks.after` — audits sign-out, password reset/change, email verification.

## Session resolution

`resolveSession(auth, db, headers)` returns the session plus a `UserActor`, re-reading role
and status from the database on every request; suspended users resolve to anonymous.

## Client IP

Rate limits use `CLIENT_IP_HEADER` only when `TRUST_PROXY=true`. Without a trusted proxy all
requests share one bucket (Better Auth logs a warning) — run production behind Caddy (bundled)
or another proxy that overwrites the header.

## Environment

`AUTH_SECRET` (≥32 chars), `AUTH_REQUIRE_EMAIL_VERIFICATION`, `AUTH_RATE_LIMIT_ENABLED`
(cannot be disabled in production), `AUTH_TRUSTED_ORIGINS`, `GOOGLE_CLIENT_ID/SECRET`,
`GITHUB_CLIENT_ID/SECRET`.

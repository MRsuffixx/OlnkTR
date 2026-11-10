# Security model

| Threat                            | Controls (where)                                                                                                                         | Verified by                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| Broken access control / IDOR      | Actor-based authorization in every service (`core/access`), NOT_FOUND for foreign resources                                              | `core/test/security.int.test.ts`, `api.int.test.ts` |
| Cross-tenant access               | Membership re-verified on every call; owner-filtered queries; API keys bound to one owner                                                | security + organizations suites                     |
| SQL injection                     | Drizzle query builder / parameterized `sql` templates only                                                                               | code review rule                                    |
| XSS                               | React escaping, no HTML rendering of user content, strict URL schema, nonce-based CSP with `strict-dynamic`, no SVG uploads              | validators tests, E2E CSP test                      |
| CSRF                              | SameSite=Lax cookies, Better Auth origin checks (forced on), same-origin check for tRPC mutations and dev checkout forms, JSON-only APIs | auth + api suites                                   |
| SSRF                              | Server never fetches user URLs; private/loopback hosts rejected in user URLs                                                             | validators tests                                    |
| Brute force / credential stuffing | Better Auth DB rate limits per IP; email verification; generic error messages                                                            | auth suite (429 test)                               |
| Session fixation                  | New session token per sign-in, revocation on password reset/suspension, no cookie cache                                                  | auth suite                                          |
| Webhook forgery / replay          | Signature verification (Stripe SDK, PayTR HMAC, dev HMAC with 5-min tolerance), unique provider event ids, row-locked processing         | billing suites                                      |
| Malicious uploads                 | Allow-listed raster types, signed size/type, magic-byte verification, server-generated keys                                              | media suite                                         |
| Rate-limit bypass                 | Client IP only from a trusted proxy header (`TRUST_PROXY`), Redis + in-memory fallback, per-key API limits                               | api suite, E2E per-IP fixture                       |
| Open redirects                    | `safeRedirectPath` for internal redirects; `/go` only to stored, validated URLs                                                          | validators tests, E2E                               |
| Secret leakage                    | Env validation, `.env` git-ignored, Pino redaction, sanitized audit metadata, hashed API keys/invitation tokens, generic 5xx messages    | observability + api tests                           |

## Configuration safety

`packages/config/src/env.ts` validates all variables at start-up and refuses, in production
(`APP_ENV=production`, default when `NODE_ENV=production`): non-https `APP_URL`, the dev payment
provider, placeholder secrets, missing storage credentials, disabled auth rate limiting.

## Headers

All responses: `X-Content-Type-Options`, `Referrer-Policy`, `X-Frame-Options: DENY`,
`Cross-Origin-Opener-Policy`, `Permissions-Policy`, HSTS (production). Pages: per-request CSP
nonce (`src/proxy.ts`, `src/lib/csp.ts`).

## Infrastructure

Least-privilege DB roles (app = DML only), private MinIO bucket + scoped user, Redis password in
production, non-root containers, read-only worker filesystem, `no-new-privileges`, only Caddy
publishes ports, dev ports bound to 127.0.0.1.

## Data protection

No raw IPs or user agents in analytics; daily-rotating visitor hashes; configurable retention;
account deletion workflow with grace period; audit logs keep no secrets.

## Known gaps (tracked)

OAuth flows and 2FA enrolment are configured but not end-to-end tested; one moderate dev-only
advisory (`esbuild` via drizzle-kit, optional peer of better-auth) is present in the audit.

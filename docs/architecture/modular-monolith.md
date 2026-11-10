# Modular monolith

## Why

A single deployable keeps local development and operations simple (one database, one
transaction boundary, no distributed failure modes) while module boundaries keep the code
base changeable. Boundaries are enforced by tooling, not convention alone.

## Modules

Domain modules live in `packages/core/src/modules/<module>` and expose a factory through
`index.ts`:

| Module             | Owns                                                                 | Public API (factory)                                 |
| ------------------ | -------------------------------------------------------------------- | ---------------------------------------------------- |
| access             | org role/permission matrix, admin permissions, profile authorization | `createAccessService`, `assertAdmin`, `profileOwner` |
| audit              | `audit_logs`                                                         | `createAuditService`, `sanitizeAuditMetadata`        |
| users              | `user_preferences`, user lifecycle                                   | `createUserService`                                  |
| organizations      | `organizations`, `organization_members`, `organization_invitations`  | `createOrganizationService`                          |
| profiles           | `profiles`                                                           | `createProfileService`, `profileRepository`          |
| links              | `links`, `link_categories`                                           | `createLinkService`                                  |
| blocks             | `blocks` (profile layout)                                            | `createBlockService`, `blockLayout`, `toBlockView`   |
| themes             | `themes`, `theme_versions`                                           | `createThemeService`                                 |
| media              | `media_files`                                                        | `createMediaService`, `ImageProcessor`               |
| api-keys           | `api_keys`, `api_usage_daily`                                        | `createApiKeyService`                                |
| platform           | `system_settings`, `feature_flags`                                   | `createPlatformService`                              |
| admin              | (orchestrates others)                                                | `createAdminService`                                 |
| public-profiles    | read model for public rendering                                      | `createPublicProfileService`                         |
| billing (facade)   | authorization in front of `@olnktr/billing`                          | `createBillingFacade`                                |
| analytics (facade) | authorization + entitlement gating of analytics queries              | `createProfileAnalyticsService`                      |

`packages/billing` and `packages/analytics` are separate packages because they are the most
likely extraction candidates and are also used by the worker.

## Composition roots

- `packages/core/src/index.ts#createCore` wires modules and registers entitlement usage resolvers.
- `packages/api/src/container.ts` builds the web process (DB pool, Redis, storage, auth, core, ...).
- `apps/worker/src/container.ts` builds the worker process.

## Dependency inversion

Lower layers define ports and higher layers provide adapters: `ObjectStorage` (S3/in-memory),
`PaymentProvider` (dev/Stripe/PayTR), `UsageResolver` (core → billing entitlement engine),
`JobProducer` (BullMQ/in-memory), `EmailTransport` (SMTP/in-memory), `DedupeStore`,
`RateLimiter`, `ImageProcessor`. Tests use the in-memory adapters for speed and real
adapters in integration suites.

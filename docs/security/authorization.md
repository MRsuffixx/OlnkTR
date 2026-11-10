# Authorization

## Actors (`@olnktr/types`)

- `UserActor { userId, platformRole: user | support | admin }` — from the session.
- `ApiKeyActor { apiKeyId, userId | organizationId, scopes }` — from `Authorization: Bearer`.
- `SystemActor { component }` — workers/maintenance.

## Layers

1. **Transport** — tRPC procedure types (`protectedProcedure`, `organizationProcedure`,
   `adminProcedure`), REST route `auth`/`scope`, same-origin checks. Convenience, not the
   security boundary.
2. **Service boundary (authoritative)** — `core.access`:
   - `assertOrganizationPermission(actor, orgId, permission)` — active membership in an active org.
   - `resolveOwner(actor, organizationId?, permission)` — personal or verified organization owner.
   - `assertOwnerPermission(actor, owner, permission)`.
   - `authorizeProfile(actor, profileId, permission, { lock })`.
   - `assertAdmin(actor, adminPermission)` — platform roles.
3. **Entitlements** — what the owner's plan allows (separate from _who_ may act).

## API key scopes

`profiles:read`, `profiles:write`, `links:read`, `links:write`, `analytics:read`. Mapped from
permissions in `PERMISSION_SCOPES`; permissions without a scope (members, billing, API keys,
audit) are never available to keys. Keys require the owner's `api.access` entitlement at use time
and stop working when the owner is suspended or the organization inactive.

## Platform administration

| Permission                                                                                        | support | admin |
| ------------------------------------------------------------------------------------------------- | :-----: | :---: |
| users:read, billing:read, audit:read                                                              |    ✔    |   ✔   |
| users:manage (suspend/restore), billing:manage (plans, grants), settings:manage (settings, flags) |         |   ✔   |

Admins cannot suspend other admins or themselves. Every admin mutation writes an audit entry in
the same transaction. Platform admins do **not** bypass tenant checks on regular endpoints.

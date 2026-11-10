# Tenancy

## Owners

Every tenant-scoped row belongs to exactly one **owner**: a user (personal resources) or an
organization (team resources) — enforced by CHECK constraints. Personal profiles work without
any organization.

## Isolation rules

1. Services resolve the owner with `access.resolveOwner(actor, organizationId, permission)`.
   A client-supplied `organizationId` is honoured only after verifying an _active_ membership
   with the required role in an _active_ organization.
2. Single-resource access goes through `access.authorizeProfile` (or owner checks for media,
   API keys, themes). Non-members get `NOT_FOUND`, members without the permission `FORBIDDEN`.
3. All list queries filter by owner columns (`ownerWhere`), never by client input alone.
4. API keys are bound to one owner; user keys cannot reach organization data and vice versa.
5. Cross-references are validated against the same owner (e.g. a profile avatar must be a
   ready media file of the profile's owner; link categories must belong to the profile).

## Entitlements follow the resource owner

Personal resources use the user's plan; organization resources use the organization's plan.
There is no stacking (see `docs/modules/entitlements.md`).

## Tests

`packages/core/test/security.int.test.ts` and `organizations.int.test.ts` cover IDOR,
cross-tenant listing, forged organization ids, API key boundaries and role permissions.

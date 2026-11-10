# Entitlements

`packages/billing/src/entitlements/engine.ts`; catalogue in `packages/validators/src/entitlements.ts`.

## Catalogue

| Key                       | Kind       | Default     | Meaning                                           |
| ------------------------- | ---------- | ----------- | ------------------------------------------------- |
| `profiles.limit`          | limit      | 1           | profiles per owner                                |
| `links.limit`             | limit      | 50          | links per profile                                 |
| `blocks.available_types`  | list       | basic types | allowed block types (`["*"]` = all)               |
| `analytics.level`         | enum       | basic       | `basic` totals/series; `advanced` adds breakdowns |
| `analytics.history_days`  | limit      | 30          | queryable history                                 |
| `themes.premium`          | boolean    | false       | premium themes                                    |
| `customization.advanced`  | boolean    | false       | custom themes                                     |
| `branding.removal`        | boolean    | false       | hide "Made with OlnkTR"                           |
| `api.access`              | boolean    | false       | create/use API keys                               |
| `api.requests_per_minute` | limit      | 0           | REST rate limit per key                           |
| `storage.limit`           | limit (MB) | 100         | media storage                                     |
| `team.members.limit`      | limit      | 1           | seats = active members + pending invitations      |

`null` means unlimited. Unknown keys are rejected by the schema.

## Resolution

`defaults ⊕ plan(granting subscription or default plan) ⊕ active overrides (oldest first)`.
The granting subscription is the newest one with access (see billing access rules); otherwise
the default plan applies. Overrides (`entitlement_overrides`) are audited admin grants with
optional expiry.

## Precedence between personal and organization entitlements

Deterministic and **resource-scoped**: an operation on a resource uses only the entitlements of
that resource's owner. A Pro user editing a Free organization's profile gets Free-organization
limits; the organization's Business plan never applies to members' personal profiles. Tested in
`security.int.test.ts` and `organizations.int.test.ts`.

## API

```ts
entitlements.resolve(owner); // full resolution (plan, source, values)
entitlements.getUserEntitlements(userId);
entitlements.getOrganizationEntitlements(orgId);
entitlements.checkEntitlement(owner, "api.access");
entitlements.assertEntitlement(owner, "themes.premium"); // ENTITLEMENT_REQUIRED (402)
entitlements.getRemainingQuota(owner, "links.limit", { profileId });
entitlements.assertQuota(owner, "profiles.limit", { executor: tx }); // QUOTA_EXCEEDED (402)
entitlements.isBlockTypeAllowed(owner, "spotify");
```

Usage counters are provided by `UsageResolver`s registered in `createCore` (profiles, links,
storage, seats). Call `assertQuota` inside the write transaction after locking the parent row.
Works identically from tRPC, REST, services and jobs.

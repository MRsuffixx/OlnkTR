# Organizations and teams

`packages/core/src/modules/organizations`, permissions in `modules/access/permissions.ts`.

## Roles (owner > admin > editor > viewer)

| Permission                                                                                 | owner | admin | editor | viewer |
| ------------------------------------------------------------------------------------------ | :---: | :---: | :----: | :----: |
| read organization, members, profiles, content, analytics                                   |   ✔   |   ✔   |   ✔    |   ✔    |
| write content (links, blocks), upload media, update profiles                               |   ✔   |   ✔   |   ✔    |        |
| create / publish / delete profiles, manage members, API keys, themes, read billing & audit |   ✔   |   ✔   |        |        |
| manage billing, delete organization                                                        |   ✔   |       |        |        |

Non-owners can only manage members ranked below them and grant roles below their own. The last
owner cannot be removed, demoted or leave.

## Invitations

`invite` (seat check against the organization's `team.members.limit`, under an org row lock) →
random 32-byte token emailed; only its SHA-256 is stored; 7-day expiry. `acceptInvitation`
requires a signed-in user whose **verified** email equals the invited address. Pending
invitations count as seats. Expiry is enforced on accept and by an hourly maintenance job.

## Tenant isolation

See `docs/database/tenancy.md`. Organization-owned profiles use organization entitlements.
Users may belong to many organizations; personal profiles never require one.

## Deletion

Only owners; refused while the organization has a granting subscription. Cascades to its
profiles, media rows, API keys and memberships. Account deletion removes organizations where the
user is the only member and is blocked while the user is the sole owner of a team with members.

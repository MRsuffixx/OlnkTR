# Profiles

`packages/core/src/modules/profiles`, public read model in `modules/public-profiles`.

## Model

`id, owner_user_id | owner_organization_id, created_by_user_id, username, display_name, bio,
avatar_media_id, cover_media_id, visibility (public|unlisted|private), status (draft|published),
published_at, seo_title, seo_description, seo_no_index, theme_id, theme_version, timestamps`.

## Usernames

Normalized with NFKC + lower-case; 3–30 chars of `a-z0-9._-`, alphanumeric at both ends, no
repeated separators; non-ASCII (e.g. Turkish `İ`, `ş`) rejected to avoid look-alikes. A
reserved list (`RESERVED_USERNAMES` in `@olnktr/validators`) blocks application routes and
sensitive names. Uniqueness is global (unique index) and race-safe (constraint violation →
`CONFLICT`). `profiles.checkUsername` reports `available | taken | too_short | ... | reserved`.

## Operations (all authorized, all audited)

`create` (quota `profiles.limit` under an owner-row lock), `update`, `setPublished`,
`delete`, `get`, `list(organizationId?)`, theme assignment via `themes.assignToProfile`.

## Public visibility

A profile is publicly resolvable only when `status = published`, `visibility ≠ private`, and the
owner is active (user `active`; organization `active`). `unlisted` profiles render with
`noindex`. Blocks are filtered (visible, valid config) and link blocks only show active links
inside their schedule window. `showBranding` follows the owner's `branding.removal` entitlement.

## Custom-domain readiness

Rendering never parses the URL itself; it asks `publicProfiles.resolve(lookup)` with a
`PublicProfileLookup` (`{ kind: "username", username }` today). A future
`{ kind: "hostname", hostname }` variant plus a verified-domain table can be added without
touching rendering or the profile module. Nothing domain-related is implemented yet.

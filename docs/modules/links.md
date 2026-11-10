# Links

`packages/core/src/modules/links`.

## Model

`links`: `profile_id, category_id?, title, url, is_active, starts_at?, ends_at?, metadata (jsonb:
description, icon, thumbnailMediaId, openInNewTab), click_count`. `link_categories` provide
categorization foundations.

## Ordering

Each link owns exactly one `blocks` row of type `link` (`blocks.link_id` unique, cascade).
Display order is therefore the profile layout. `links.reorder(profileId, orderedIds)` requires
every link exactly once and reassigns the _slots currently occupied by link blocks_, leaving
other blocks in place. Deleting a link deletes its block (and vice versa via the blocks API).

## Rules

- URLs must pass `publicHttpUrlSchema` (http/https, no credentials, no private hosts).
- Scheduling: `starts_at < ends_at`; public pages and `/go/{id}` hide links outside the window.
- Limits: `links.limit` entitlement **per profile**, checked under a profile row lock — the
  module itself has no plan logic. The database supports unlimited links.
- Click tracking: `/go/{linkId}` validates the link (published, non-private profile, active,
  in schedule), enqueues a `link.click` analytics event without blocking, and 302-redirects to
  the stored URL with `Referrer-Policy: strict-origin-when-cross-origin`.

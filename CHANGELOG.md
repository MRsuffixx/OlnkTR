# Changelog

Meaningful product, architecture, migration, and security changes are recorded here.

## Unreleased

### Added

- Existing-product audit and profile-builder extension guide.
- Reusable two-to-five-stop gradient editor with deterministic stop normalization.
- Approved font registry shared by Zod schemas, editor options, entitlement policy, and
  render-time CSS families.
- Lazy profile effect registry with performance metadata and per-plugin failure isolation.
- Shared public/preview background and identity render primitives.
- Tablet live-preview frame alongside mobile and desktop.
- Central Free/Pro media, storage, section, and future widget limits.
- Binary container-signature verification for finalized uploaded assets.
- Relational `SocialAccount` content with deterministic ordering, soft deletion, platform
  registry, labels, tooltips, icon-only mode, and per-account colors.
- Dedicated top-level Social and Music workspaces in the full website builder.
- Privacy-controlled Discord presence, activity, and Spotify status cards with a cached,
  timeout-bounded provider adapter and graceful fallback.
- Twelve additional profile themes, bringing the built-in theme catalog to 17 working presets.

### Changed

- Repositioned OLNK.TR architecture from link-in-bio toward a structured identity page,
  full website builder and future widget platform while preserving `/{username}`.
- Expanded the Free creative baseline to semantic colors, multi-stop linear/radial gradients,
  image backgrounds, core card/avatar controls, basic Bento, and a simple terminal preset.
- Kept conic gradients, video/motion backgrounds, advanced effects, direct audio, and larger
  media limits in Pro.
- Disabled preload for non-default profile fonts so the root layout does not eagerly preload the
  approved library.
- Corrected stale documentation that described the dynamic Prisma profile route as a persistent
  stale-while-revalidate cache.
- Exposed the previously hidden button-press, biography placement, social placement, and
  animation-stagger controls in the visual editor.

### Security

- Upload finalization now rejects content whose binary signature does not match its declared
  supported media type, in addition to existing owner, state, size, quota, and MIME checks.

### Migration

- Added `20260813141921_add_social_accounts`; existing profiles require no backfill and continue
  rendering with an empty social-account collection.

### Compatibility

- The social-account migration is additive and non-destructive.
- Appearance versions 1 and 2 continue to migrate to version 3 in memory; the next workspace save
  persists version 3.
- Existing users, links, uploaded asset URLs, authentication, billing, domains, analytics, and
  public profile URLs remain compatible.

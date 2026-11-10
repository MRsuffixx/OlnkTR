# Theme engine

Themes are versioned **design-token documents** (`@olnktr/validators/theme`). They contain no
CSS, HTML or script: every value is an enum, a bounded number, a `#RRGGBB` color or an owned
media id, and the renderer turns them into CSS custom properties (`--op-*`) and data attributes
consumed by `apps/web/src/modules/profile-renderer/profile.css`.

## Schema (v2)

| Section      | Tokens                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `colors`     | primary, secondary, accent, background, surface, text, mutedText, border, link, button, buttonText                                                                      |
| `typography` | headingFont, bodyFont (curated keys), baseSize, headingWeight, bodyWeight, lineHeight, letterSpacing, headingLetterSpacing, headingCase                                 |
| `background` | `solid` · `gradient` (linear/radial, from, to, angle) · `image` (mediaId, overlay, opacity, blur) · `pattern` (dots/grid/diagonal/waves/checker, color, opacity, scale) |
| `buttons`    | variant (filled/outline/soft/ghost), radius (999 = pill), size, borderWidth, shadow, hover, iconPlacement, textAlign                                                    |
| `cards`      | style (flat/outlined/elevated/tinted/glass), radius, borderWidth, shadow, padding, hover, layout                                                                        |
| `layout`     | contentWidth, alignment, header (classic/cover/minimal), avatarShape, avatarSize, blockGap, sectionGap, density                                                         |
| `effects`    | entrance (none/fade/rise), hoverTransitions, backgroundEffect (grain/vignette/glow), decoration (frame/rule)                                                            |

All motion is disabled under `prefers-reduced-motion`.

**Versioning.** Stored configs keep the version they were written with. `storedThemeConfigSchema`
accepts v1 and v2 and migrates v1 → v2 (`migrateThemeV1ToV2`). Add a v3 by adding a schema, a
migration and widening the union — never edit a shipped migration.

## Inheritance

```
base theme (system preset or saved custom theme)
  └─ profile overrides   profiles.theme_overrides / draft.theme.overrides   (per key)
       └─ block appearance  blocks.appearance                                (variant, colors, radius, emphasis)
```

Later layers win key by key; `background` is replaced as a whole. Resetting an override deletes
the key, which restores the inherited value (`resetThemeOverride`). A _custom theme_ is a full
config (base + overrides flattened when saved), so "user theme overrides" are captured by
saving a custom theme.

## Catalogue and presets

`THEME_PRESETS` defines ten system themes (Minimal, Editorial, Creator, Professional, Glass,
Gradient, Neon, Gaming, Portfolio, Elegant) with metadata (key, name, description, category,
author, premium flag). A unit test asserts that no two presets share the same typography/shape/
background/layout signature. `pnpm db:seed` syncs presets: new keys are inserted, a changed
config becomes a new immutable `theme_versions` row, and the foundation themes (`default`,
`midnight`, `aurora`) are archived but keep resolving for profiles that use them.

Thumbnails are live miniature renders with the real profile CSS, so they cannot drift from the
actual result. Favourites are stored per user (`theme_favorites`).

## Entitlements

| Action                                                                                 | Entitlement              |
| -------------------------------------------------------------------------------------- | ------------------------ |
| Publish with a premium theme                                                           | `themes.premium`         |
| Publish typography/buttons/cards/layout/effects overrides or image/pattern backgrounds | `customization.advanced` |
| Save, duplicate or import custom themes                                                | `customization.advanced` |

Locked options stay usable in the draft (marked "Pro") so people can try them; publishing
reports the blockers and links to billing.

## Import / export

Export writes `{ "format": "olnktr.theme", "name", "config" }`. Import parses the file with the
strict export schema (older config versions are migrated; unknown keys are rejected) and creates
a private custom theme. Imported files are data only and are never evaluated.

## Fonts

Theme fonts are referenced by key (`THEME_FONTS`) and self-hosted through `next/font`
(Latin + Latin Extended, so Turkish renders correctly). Each family only defines a CSS
variable; browsers download a font file only when a theme uses it.

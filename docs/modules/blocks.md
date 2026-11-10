# Content blocks

The block system has three registries that share one type key:

| Part       | Location                                         | Responsibility                                               |
| ---------- | ------------------------------------------------ | ------------------------------------------------------------ |
| Definition | `packages/validators/src/blocks/definitions.ts`  | type, version, group, tier, Zod schema, defaults, migrations |
| Renderer   | `apps/web/src/modules/profile-renderer/blocks/*` | how the block looks (public page, preview, studio canvas)    |
| Editor     | `apps/web/src/modules/studio/blocks/catalog.ts`  | icon, inspector fields, advanced fields, outline summary     |

Service: `packages/core/src/modules/blocks` (direct API) and `packages/core/src/modules/editor`
(draft/publish, see [studio](studio.md)).

## Built-in types

| Group     | Types (current version)                                                                                                           |
| --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Essential | `link` 1 (managed by links), `button` 1, `heading` 1, `text` 2, `image` 2, `gallery` 1, `social_links` 2, `divider` 1, `spacer` 1 |
| Media     | `youtube` 1, `video` 1, `spotify` 1, `soundcloud` 1, `twitch` 1                                                                   |
| Community | `discord` 1, `github` 1, `social_profile` 1, `contact` 1                                                                          |
| Business  | `product` 1, `newsletter` 1, `faq` 1, `countdown` 1, `location` 1                                                                 |

`tier: "basic"` types form the default `blocks.available_types` entitlement (Free plan);
`premium` types (gallery, video, twitch, product, newsletter, countdown, location) must be
granted by the plan. Plans remain the source of truth.

Notes on deliberate scope:

- **Newsletter** links to an external signup page; OlnkTR does not collect subscriber emails.
- **GitHub / Discord** render cards from what the owner enters; the server never fetches
  user-supplied URLs (no SSRF surface).
- **Location** shows an address and directions; the Google Maps embed loads only when the
  visitor clicks "Show map".

## Definition

```ts
defineBlock({
  type: "text",
  version: 2,                       // current config version
  group: "essential",               // catalogue group
  tier: "basic",                    // default plan availability
  schema: z.object({ ... }),        // Zod schema for the current version
  defaultConfig: { ... },           // starting config; may be incomplete (validated on publish)
  migrations: { 1: (v1) => v2 },    // required for every version below `version`
});
```

Rows store `(type, schema_version, config jsonb, appearance jsonb, position, is_visible)`.
Reads run `registry.parseStored` (migrate → validate); invalid rows are flagged and skipped by
public rendering instead of crashing. Version bumps in this phase: `text` 1→2 (size, weight,
tone), `image` 1→2 (fit, radius, caption, portrait), `social_links` 1→2 (icon style, display,
size) — old rows are upgraded on read.

## Block appearance

Link and button blocks accept per-block overrides (`appearance`: variant, background, text,
radius, emphasis). They are the highest layer of [theme inheritance](themes.md).

## Adding a block type

1. Add a definition in `definitions.ts` and append it to `BUILTIN_BLOCK_DEFINITIONS`.
2. Add a renderer and register it in `profile-renderer/blocks/index.ts`.
3. Add an editor descriptor (icon + fields) in `studio/blocks/catalog.ts`.
4. Add `studio.blocks.<type>` (and any field labels) to `messages/en.json` and `tr.json`.
5. Add tests (registry parsing, and a service test if it touches the database).

## Security

Text renders as text nodes; the text block's inline syntax (`**bold**`, `*italic*`,
`[label](https://…)`) is tokenized into React elements, never parsed as HTML, and only http(s)
links are produced. URLs use `publicHttpUrlSchema`; embeds accept parsed ids or validated
provider URLs and render fixed hosts (`youtube-nocookie.com`, `open.spotify.com`,
`w.soundcloud.com`, `player.twitch.tv`, `www.google.com/maps`) allowed by CSP `frame-src`. Image,
gallery, product and background images must reference ready media of the profile owner
(verified on publish).

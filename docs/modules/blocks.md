# Content blocks

Registry: `packages/validators/src/blocks` (isomorphic). Service: `packages/core/src/modules/blocks`.
Public rendering: `apps/web/src/modules/public-profile/block-renderer.tsx`.

## Built-in types (all `version: 1`)

`link` (managed by the links module), `heading`, `text`, `image`, `video` (external HTTPS file),
`social_links`, `divider`, `spacer`, `youtube`, `spotify`.

## Definition

```ts
defineBlock({
  type: "heading",           // stable identifier
  version: 1,                // current config version
  category: "content",
  schema: z.object({ ... }), // Zod schema for the current version
  defaultConfig: { ... },
  migrations: { 1: (v1) => v2 }, // required for every version below `version`
  managedBy: "links",        // optional: cannot be created through the generic API
});
```

Rows store `(type, schema_version, config jsonb, position, is_visible, profile_id)`. Reads run
`registry.parseStored` (migrate → validate); invalid rows are flagged (`valid: false`) and
skipped by public rendering instead of crashing.

## Adding a block type

1. Add a definition in `definitions.ts` and register it in `createDefaultBlockRegistry`.
2. Add a renderer branch in `block-renderer.tsx` (unknown types render nothing).
3. Decide plan availability via the `blocks.available_types` entitlement (plans/overrides).
4. Add tests (registry parsing + a service test). Existing block types are untouched.

## Changing a block's config shape

Bump `version`, keep a migration from the previous version, update the schema. Old rows are
upgraded on read; re-saving persists the new version.

## Security

Text renders as text nodes; URLs use `publicHttpUrlSchema`; embeds only accept parsed ids and
render fixed provider URLs (`youtube-nocookie.com`, `open.spotify.com`) in sandboxed iframes,
allowed by CSP `frame-src`. Image blocks must reference a ready media file of the same owner.

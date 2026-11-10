import { z } from "zod";

/**
 * Entitlement catalogue. Plans (stored in the database) assign values to these
 * keys; anything a plan omits falls back to the restrictive default below.
 *
 *  - `limit`   : non-negative integer quota, or `null` for unlimited
 *  - `boolean` : feature flag
 *  - `enum`    : ordered levels (later = more capable)
 *  - `list`    : allow-list of string values, `["*"]` allows everything
 */
const BASIC_BLOCK_TYPES = [
  "link",
  "heading",
  "text",
  "image",
  "social_links",
  "divider",
  "spacer",
  "youtube",
];

export const ENTITLEMENT_DEFINITIONS = {
  "profiles.limit": { kind: "limit", default: 1, description: "Maximum number of profiles owned" },
  "links.limit": { kind: "limit", default: 50, description: "Maximum links per profile" },
  "blocks.available_types": {
    kind: "list",
    default: BASIC_BLOCK_TYPES,
    description: "Block types that may be added to profiles",
  },
  "analytics.level": {
    kind: "enum",
    values: ["basic", "advanced"],
    default: "basic",
    description: "basic = totals and daily series; advanced = breakdowns by dimension",
  },
  "analytics.history_days": {
    kind: "limit",
    default: 30,
    description: "How far back analytics can be queried",
  },
  "themes.premium": { kind: "boolean", default: false, description: "Use premium themes" },
  "customization.advanced": {
    kind: "boolean",
    default: false,
    description: "Advanced customization",
  },
  "branding.removal": { kind: "boolean", default: false, description: "Hide OlnkTR branding" },
  "api.access": { kind: "boolean", default: false, description: "Create and use API keys" },
  "api.requests_per_minute": {
    kind: "limit",
    default: 0,
    description: "REST API rate limit per key",
  },
  "storage.limit": { kind: "limit", default: 100, description: "Media storage quota in megabytes" },
  "team.members.limit": {
    kind: "limit",
    default: 1,
    description: "Organization seats (active members + pending invitations)",
  },
} as const satisfies Record<string, EntitlementDefinition>;

type EntitlementDefinition =
  | { kind: "limit"; default: number | null; description: string }
  | { kind: "boolean"; default: boolean; description: string }
  | { kind: "enum"; values: readonly string[]; default: string; description: string }
  | { kind: "list"; default: readonly string[]; description: string };

export type EntitlementKey = keyof typeof ENTITLEMENT_DEFINITIONS;
export const ENTITLEMENT_KEYS = Object.keys(ENTITLEMENT_DEFINITIONS) as EntitlementKey[];

type Defs = typeof ENTITLEMENT_DEFINITIONS;
export type EntitlementValue<K extends EntitlementKey> = Defs[K]["kind"] extends "limit"
  ? number | null
  : Defs[K]["kind"] extends "boolean"
    ? boolean
    : Defs[K]["kind"] extends "list"
      ? string[]
      : Defs[K] extends { values: readonly (infer V)[] }
        ? V
        : never;

export type LimitEntitlementKey = {
  [K in EntitlementKey]: Defs[K]["kind"] extends "limit" ? K : never;
}[EntitlementKey];
export type BooleanEntitlementKey = {
  [K in EntitlementKey]: Defs[K]["kind"] extends "boolean" ? K : never;
}[EntitlementKey];

export type EntitlementSet = { [K in EntitlementKey]: EntitlementValue<K> };

const limitValue = z.number().int().min(0).nullable();

/** Partial entitlement map as stored on plans and overrides. Unknown keys are rejected. */
export const entitlementSetSchema = z
  .object({
    "profiles.limit": limitValue,
    "links.limit": limitValue,
    "blocks.available_types": z.array(z.string().min(1).max(64)).max(100),
    "analytics.level": z.enum(["basic", "advanced"]),
    "analytics.history_days": limitValue,
    "themes.premium": z.boolean(),
    "customization.advanced": z.boolean(),
    "branding.removal": z.boolean(),
    "api.access": z.boolean(),
    "api.requests_per_minute": limitValue,
    "storage.limit": limitValue,
    "team.members.limit": limitValue,
  })
  .partial()
  .strict();

export type PartialEntitlementSet = z.infer<typeof entitlementSetSchema>;

export function defaultEntitlements(): EntitlementSet {
  return Object.fromEntries(
    ENTITLEMENT_KEYS.map((key) => {
      const value = ENTITLEMENT_DEFINITIONS[key].default;
      return [key, Array.isArray(value) ? [...(value as readonly string[])] : value];
    }),
  ) as EntitlementSet;
}

/** Applies partial layers left-to-right on top of the defaults (later wins). */
export function mergeEntitlements(...layers: PartialEntitlementSet[]): EntitlementSet {
  const result = defaultEntitlements() as Record<string, unknown>;
  for (const layer of layers) {
    for (const [key, value] of Object.entries(layer)) {
      if (value !== undefined) result[key] = value;
    }
  }
  return result as EntitlementSet;
}

export function isEntitlementKey(value: string): value is EntitlementKey {
  return value in ENTITLEMENT_DEFINITIONS;
}

import { z } from "zod";
import { plainText, publicHttpUrlSchema, uuidSchema } from "../primitives";
import { defineBlock } from "./registry";

/**
 * Built-in block types. All text is plain text (rendered as text nodes);
 * URLs are validated public http(s) URLs; embeds store parsed ids for fixed
 * provider domains, never raw embed HTML.
 */
const align = z.enum(["left", "center", "right"]).default("center");
const httpsUrl = publicHttpUrlSchema.refine(
  (value) => value.startsWith("https://"),
  "HTTPS is required",
);

// ─── Essential ──────────────────────────────────────────────────────────────

export const linkBlock = defineBlock({
  type: "link",
  version: 1,
  group: "essential",
  tier: "basic",
  managedBy: "links",
  schema: z.object({
    style: z.enum(["default", "featured"]).default("default"),
  }),
  defaultConfig: { style: "default" },
});

export const headingBlock = defineBlock({
  type: "heading",
  version: 1,
  group: "essential",
  tier: "basic",
  schema: z.object({
    text: plainText(120, 1),
    level: z.union([z.literal(2), z.literal(3)]).default(2),
    align,
  }),
  defaultConfig: { text: "", level: 2, align: "center" },
});

/**
 * Text v2 adds size, weight, tone and inline formatting. `text` supports a
 * minimal inline syntax (**bold**, *italic*, [label](https://url)) parsed into
 * React elements by the renderer — it is never interpreted as HTML.
 */
export const textBlock = defineBlock({
  type: "text",
  version: 2,
  group: "essential",
  tier: "basic",
  schema: z.object({
    text: z.string().trim().min(1).max(2000),
    align,
    size: z.enum(["sm", "md", "lg"]).default("md"),
    weight: z.enum(["regular", "medium", "bold"]).default("regular"),
    tone: z.enum(["default", "muted", "accent"]).default("default"),
  }),
  defaultConfig: { text: "", align: "center", size: "md", weight: "regular", tone: "default" },
  migrations: {
    1: (config) => ({ size: "md", weight: "regular", tone: "default", ...(config as object) }),
  },
});

/** Image v2 adds portrait aspect, fit mode, radius override and caption. */
export const imageBlock = defineBlock({
  type: "image",
  version: 2,
  group: "essential",
  tier: "basic",
  schema: z.object({
    mediaId: uuidSchema,
    alt: plainText(300).default(""),
    href: publicHttpUrlSchema.optional(),
    aspect: z.enum(["auto", "square", "portrait", "wide"]).default("auto"),
    fit: z.enum(["cover", "contain"]).default("cover"),
    /** Corner radius in px; absent = follow the theme's card radius. */
    radius: z.number().int().min(0).max(48).optional(),
    caption: plainText(200).optional(),
  }),
  defaultConfig: { alt: "", aspect: "auto", fit: "cover" },
  migrations: { 1: (config) => ({ fit: "cover", ...(config as object) }) },
});

export const galleryBlock = defineBlock({
  type: "gallery",
  version: 1,
  group: "essential",
  tier: "premium",
  schema: z.object({
    items: z
      .array(z.object({ mediaId: uuidSchema, alt: plainText(300).default("") }))
      .min(1)
      .max(12),
    layout: z.enum(["grid", "carousel"]).default("grid"),
    columns: z.union([z.literal(2), z.literal(3)]).default(2),
    aspect: z.enum(["square", "portrait", "wide"]).default("square"),
  }),
  defaultConfig: { items: [], layout: "grid", columns: 2, aspect: "square" },
});

export const SOCIAL_PLATFORMS = [
  "instagram",
  "x",
  "tiktok",
  "youtube",
  "facebook",
  "linkedin",
  "github",
  "twitch",
  "spotify",
  "threads",
  "bluesky",
  "discord",
  "telegram",
  "whatsapp",
  "website",
] as const;
export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number];

/** Social links v2 adds icon style, display mode and size. */
export const socialLinksBlock = defineBlock({
  type: "social_links",
  version: 2,
  group: "essential",
  tier: "basic",
  schema: z.object({
    items: z
      .array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), url: publicHttpUrlSchema }))
      .max(20),
    iconStyle: z.enum(["plain", "filled", "outline"]).default("plain"),
    display: z.enum(["icons", "buttons", "list"]).default("icons"),
    size: z.enum(["sm", "md", "lg"]).default("md"),
  }),
  defaultConfig: { items: [], iconStyle: "plain", display: "icons", size: "md" },
  migrations: {
    1: (config) => ({ iconStyle: "plain", display: "icons", size: "md", ...(config as object) }),
  },
});

export const dividerBlock = defineBlock({
  type: "divider",
  version: 1,
  group: "essential",
  tier: "basic",
  schema: z.object({ style: z.enum(["solid", "dashed", "dotted"]).default("solid") }),
  defaultConfig: { style: "solid" },
});

export const spacerBlock = defineBlock({
  type: "spacer",
  version: 1,
  group: "essential",
  tier: "basic",
  schema: z.object({ size: z.enum(["sm", "md", "lg", "xl"]).default("md") }),
  defaultConfig: { size: "md" },
});

export const buttonBlock = defineBlock({
  type: "button",
  version: 1,
  group: "essential",
  tier: "basic",
  schema: z.object({
    label: plainText(80, 1),
    url: publicHttpUrlSchema,
    openInNewTab: z.boolean().default(true),
    width: z.enum(["full", "auto"]).default("full"),
  }),
  defaultConfig: { label: "", url: "", openInNewTab: true, width: "full" },
});

// ─── Media ──────────────────────────────────────────────────────────────────

export const youtubeBlock = defineBlock({
  type: "youtube",
  version: 1,
  group: "media",
  tier: "basic",
  schema: z.object({
    videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Invalid YouTube video id"),
    startSeconds: z.number().int().min(0).max(86_400).optional(),
  }),
  defaultConfig: {},
});

export const videoBlock = defineBlock({
  type: "video",
  version: 1,
  group: "media",
  tier: "premium",
  schema: z.object({
    /** Externally hosted MP4/WebM file over HTTPS. */
    src: httpsUrl,
    caption: plainText(200).optional(),
    autoplay: z.boolean().default(false),
  }),
  defaultConfig: { autoplay: false },
});

export const SPOTIFY_RESOURCE_TYPES = [
  "track",
  "album",
  "playlist",
  "artist",
  "episode",
  "show",
] as const;

export const spotifyBlock = defineBlock({
  type: "spotify",
  version: 1,
  group: "media",
  tier: "basic",
  schema: z.object({
    resourceType: z.enum(SPOTIFY_RESOURCE_TYPES),
    resourceId: z.string().regex(/^[A-Za-z0-9]{22}$/, "Invalid Spotify id"),
    compact: z.boolean().default(false),
  }),
  defaultConfig: { compact: false },
});

/** SoundCloud track/playlist page URL on soundcloud.com (embedded via the official player). */
export const soundcloudUrlSchema = httpsUrl.refine((value) => {
  const url = new URL(value);
  return url.hostname === "soundcloud.com" && url.pathname.split("/").filter(Boolean).length >= 2;
}, "Use a soundcloud.com track or playlist link");

export const soundcloudBlock = defineBlock({
  type: "soundcloud",
  version: 1,
  group: "media",
  tier: "basic",
  schema: z.object({
    url: soundcloudUrlSchema,
    visual: z.boolean().default(false),
  }),
  defaultConfig: { url: "", visual: false },
});

export const twitchBlock = defineBlock({
  type: "twitch",
  version: 1,
  group: "media",
  tier: "premium",
  schema: z.object({
    channel: z.string().regex(/^[A-Za-z0-9_]{3,25}$/, "Invalid Twitch channel name"),
    muted: z.boolean().default(true),
  }),
  defaultConfig: { channel: "", muted: true },
});

// ─── Community ──────────────────────────────────────────────────────────────

export const discordBlock = defineBlock({
  type: "discord",
  version: 1,
  group: "community",
  tier: "basic",
  schema: z.object({
    inviteCode: z.string().regex(/^[A-Za-z0-9-]{2,32}$/, "Invalid invite code"),
    serverName: plainText(80, 1),
    description: plainText(200).optional(),
  }),
  defaultConfig: { inviteCode: "", serverName: "" },
});

export const githubBlock = defineBlock({
  type: "github",
  version: 1,
  group: "community",
  tier: "basic",
  schema: z.object({
    username: z.string().regex(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/, "Invalid GitHub username"),
    headline: plainText(120).optional(),
    repository: z
      .string()
      .regex(/^[A-Za-z0-9._-]{1,100}$/, "Invalid repository name")
      .optional(),
  }),
  defaultConfig: { username: "" },
});

export const socialProfileBlock = defineBlock({
  type: "social_profile",
  version: 1,
  group: "community",
  tier: "basic",
  schema: z.object({
    platform: z.enum(SOCIAL_PLATFORMS),
    url: publicHttpUrlSchema,
    handle: plainText(60, 1),
    callToAction: plainText(40).optional(),
  }),
  defaultConfig: { platform: "instagram", url: "", handle: "" },
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{5,24}$/, "Invalid phone number");

export const contactBlock = defineBlock({
  type: "contact",
  version: 1,
  group: "community",
  tier: "basic",
  schema: z
    .object({
      email: z.email().max(254).optional(),
      phone: phoneSchema.optional(),
      whatsapp: phoneSchema.optional(),
      address: plainText(200).optional(),
    })
    .refine(
      (value) => Boolean(value.email || value.phone || value.whatsapp || value.address),
      "Add at least one contact method",
    ),
  defaultConfig: {},
});

// ─── Creator / business ─────────────────────────────────────────────────────

export const CURRENCIES = ["TRY", "USD", "EUR", "GBP"] as const;

export const productBlock = defineBlock({
  type: "product",
  version: 1,
  group: "business",
  tier: "premium",
  schema: z.object({
    title: plainText(120, 1),
    description: plainText(400).optional(),
    /** Price in minor units (kuruş, cents). */
    priceMinor: z.number().int().min(0).max(100_000_000).optional(),
    currency: z.enum(CURRENCIES).default("TRY"),
    mediaId: uuidSchema.optional(),
    url: publicHttpUrlSchema,
    callToAction: plainText(40).optional(),
    badge: plainText(24).optional(),
  }),
  defaultConfig: { title: "", url: "", currency: "TRY" },
});

/** Links out to an external signup page; OlnkTR does not store subscriber emails. */
export const newsletterBlock = defineBlock({
  type: "newsletter",
  version: 1,
  group: "business",
  tier: "premium",
  schema: z.object({
    title: plainText(100, 1),
    description: plainText(300).optional(),
    url: publicHttpUrlSchema,
    callToAction: plainText(40).optional(),
  }),
  defaultConfig: { title: "", url: "" },
});

export const faqBlock = defineBlock({
  type: "faq",
  version: 1,
  group: "business",
  tier: "basic",
  schema: z.object({
    title: plainText(100).optional(),
    items: z
      .array(z.object({ question: plainText(200, 1), answer: plainText(1000, 1) }))
      .min(1)
      .max(20),
  }),
  defaultConfig: { items: [] },
});

export const countdownBlock = defineBlock({
  type: "countdown",
  version: 1,
  group: "business",
  tier: "premium",
  schema: z.object({
    title: plainText(100, 1),
    targetAt: z.iso.datetime({ offset: true }),
    endedText: plainText(100).optional(),
    url: publicHttpUrlSchema.optional(),
  }),
  defaultConfig: { title: "" },
});

/** Location card; the map loads only after the visitor asks for it (privacy). */
export const locationBlock = defineBlock({
  type: "location",
  version: 1,
  group: "business",
  tier: "premium",
  schema: z.object({
    label: plainText(80, 1),
    address: plainText(200, 1),
    showMap: z.boolean().default(true),
    zoom: z.number().int().min(3).max(19).default(15),
  }),
  defaultConfig: { label: "", address: "", showMap: true, zoom: 15 },
});

export const BUILTIN_BLOCK_DEFINITIONS = [
  linkBlock,
  headingBlock,
  textBlock,
  imageBlock,
  galleryBlock,
  socialLinksBlock,
  dividerBlock,
  spacerBlock,
  buttonBlock,
  youtubeBlock,
  videoBlock,
  spotifyBlock,
  soundcloudBlock,
  twitchBlock,
  discordBlock,
  githubBlock,
  socialProfileBlock,
  contactBlock,
  productBlock,
  newsletterBlock,
  faqBlock,
  countdownBlock,
  locationBlock,
] as const;

/** Block types available on the default (Free) entitlement. */
export const BASIC_BLOCK_TYPES = BUILTIN_BLOCK_DEFINITIONS.filter(
  (definition) => definition.tier === "basic",
).map((definition) => definition.type);

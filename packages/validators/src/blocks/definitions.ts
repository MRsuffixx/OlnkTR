import { z } from "zod";
import { plainText, publicHttpUrlSchema, uuidSchema } from "../primitives";
import { defineBlock } from "./registry";

const align = z.enum(["left", "center", "right"]).default("center");

export const linkBlock = defineBlock({
  type: "link",
  version: 1,
  category: "content",
  managedBy: "links",
  schema: z.object({
    style: z.enum(["default", "featured"]).default("default"),
  }),
  defaultConfig: { style: "default" },
});

export const headingBlock = defineBlock({
  type: "heading",
  version: 1,
  category: "content",
  schema: z.object({
    text: plainText(120, 1),
    level: z.union([z.literal(2), z.literal(3)]).default(2),
    align,
  }),
  defaultConfig: { text: "Heading", level: 2, align: "center" },
});

export const textBlock = defineBlock({
  type: "text",
  version: 1,
  category: "content",
  schema: z.object({
    // Multi-line plain text. Rendered as text nodes — never as HTML.
    text: z.string().trim().min(1).max(2000),
    align,
  }),
  defaultConfig: { text: "Text", align: "center" },
});

export const imageBlock = defineBlock({
  type: "image",
  version: 1,
  category: "media",
  schema: z.object({
    mediaId: uuidSchema,
    alt: plainText(300).default(""),
    href: publicHttpUrlSchema.optional(),
    aspect: z.enum(["auto", "square", "wide"]).default("auto"),
  }),
  defaultConfig: { mediaId: "00000000-0000-4000-8000-000000000000", alt: "", aspect: "auto" },
});

export const videoBlock = defineBlock({
  type: "video",
  version: 1,
  category: "media",
  schema: z.object({
    /** Externally hosted MP4/WebM file over HTTPS. */
    src: publicHttpUrlSchema.refine((value) => value.startsWith("https://"), "HTTPS is required"),
    caption: plainText(200).optional(),
    autoplay: z.boolean().default(false),
  }),
  defaultConfig: { src: "https://example.com/video.mp4", autoplay: false },
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

export const socialLinksBlock = defineBlock({
  type: "social_links",
  version: 1,
  category: "content",
  schema: z.object({
    items: z
      .array(z.object({ platform: z.enum(SOCIAL_PLATFORMS), url: publicHttpUrlSchema }))
      .max(20),
  }),
  defaultConfig: { items: [] },
});

export const dividerBlock = defineBlock({
  type: "divider",
  version: 1,
  category: "layout",
  schema: z.object({ style: z.enum(["solid", "dashed", "dotted"]).default("solid") }),
  defaultConfig: { style: "solid" },
});

export const spacerBlock = defineBlock({
  type: "spacer",
  version: 1,
  category: "layout",
  schema: z.object({ size: z.enum(["sm", "md", "lg", "xl"]).default("md") }),
  defaultConfig: { size: "md" },
});

export const youtubeBlock = defineBlock({
  type: "youtube",
  version: 1,
  category: "embed",
  schema: z.object({
    videoId: z.string().regex(/^[A-Za-z0-9_-]{11}$/, "Invalid YouTube video id"),
    startSeconds: z.number().int().min(0).max(86_400).optional(),
  }),
  defaultConfig: { videoId: "dQw4w9WgXcQ" },
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
  category: "embed",
  schema: z.object({
    resourceType: z.enum(SPOTIFY_RESOURCE_TYPES),
    resourceId: z.string().regex(/^[A-Za-z0-9]{22}$/, "Invalid Spotify id"),
    compact: z.boolean().default(false),
  }),
  defaultConfig: { resourceType: "track", resourceId: "4uLU6hMCjMI75M1A2tKUQC", compact: false },
});

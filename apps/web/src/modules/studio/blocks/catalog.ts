import {
  AlignLeft,
  AtSign,
  CalendarClock,
  CircleHelp,
  Contact,
  Disc3,
  Gamepad2,
  GitBranch,
  Heading,
  Image as ImageIcon,
  Images,
  Link2,
  Mail,
  MapPin,
  MessagesSquare,
  Minus,
  MousePointerClick,
  Music,
  MoveVertical,
  PlaySquare,
  Share2,
  ShoppingBag,
  Video,
  type LucideIcon,
} from "lucide-react";
import {
  CURRENCIES,
  parseDiscordInvite,
  parseSpotifyUrl,
  parseTwitchChannel,
  parseYouTubeUrl,
  SOCIAL_PLATFORMS,
} from "@olnktr/validators/blocks";

/**
 * Editor descriptors for block types (the studio half of the block registry).
 * The inspector renders `fields` generically, so adding a block type here does
 * not touch any component. Field labels are i18n keys under `studio.fields`.
 */
type Option = { value: string | number; label: string };

export type FieldDescriptor =
  | { kind: "text"; name: string; target?: "config" | "link"; max: number; placeholder?: string }
  | {
      kind: "textarea";
      name: string;
      target?: "config" | "link";
      max: number;
      rows?: number;
      formatting?: boolean;
    }
  | { kind: "url"; name: string; target?: "config" | "link"; placeholder?: string }
  | { kind: "segmented"; name: string; options: Option[] }
  | { kind: "select"; name: string; options: Option[] }
  | { kind: "switch"; name: string; target?: "config" | "link"; hint?: boolean }
  | {
      kind: "number";
      name: string;
      min: number;
      max: number;
      step?: number;
      unit?: string;
      optional?: boolean;
    }
  | {
      kind: "media";
      name: string;
      target?: "config" | "link";
      purpose: "block_image" | "link_thumbnail";
    }
  | { kind: "gallery"; name: "items" }
  | { kind: "socials"; name: "items" }
  | { kind: "faq"; name: "items" }
  | { kind: "datetime"; name: string; target?: "config" | "link" }
  | { kind: "price"; name: "priceMinor"; currency: "currency" }
  | {
      kind: "embed";
      name: string;
      /** Turns a pasted URL into config values; null = not recognised. */
      parse: (input: string) => Record<string, unknown> | null;
      display: (config: Record<string, unknown>) => string;
    };

export interface BlockEditorDefinition {
  icon: LucideIcon;
  fields: FieldDescriptor[];
  /** Advanced fields, collapsed by default. */
  advanced?: FieldDescriptor[];
  /** Whether link/button appearance overrides apply. */
  appearance?: boolean;
  /** One-line summary for the outline. */
  summary: (config: Record<string, unknown>, link?: { title?: string; url?: string }) => string;
}

const s = (value: unknown) => (typeof value === "string" ? value : "");
const align: Option[] = [
  { value: "left", label: "alignLeft" },
  { value: "center", label: "alignCenter" },
  { value: "right", label: "alignRight" },
];
const aspect = (values: string[]): Option[] =>
  values.map((value) => ({ value, label: `aspect_${value}` }));

export const BLOCK_EDITORS: Record<string, BlockEditorDefinition> = {
  link: {
    icon: Link2,
    appearance: true,
    fields: [
      { kind: "text", name: "title", target: "link", max: 120 },
      { kind: "url", name: "url", target: "link", placeholder: "https://" },
      { kind: "text", name: "description", target: "link", max: 300 },
      { kind: "media", name: "thumbnailMediaId", target: "link", purpose: "link_thumbnail" },
    ],
    advanced: [
      { kind: "switch", name: "openInNewTab", target: "link" },
      { kind: "switch", name: "trackClicks", target: "link", hint: true },
      { kind: "switch", name: "isActive", target: "link", hint: true },
      { kind: "datetime", name: "startsAt", target: "link" },
      { kind: "datetime", name: "endsAt", target: "link" },
    ],
    summary: (_config, link) => link?.url || link?.title || "",
  },
  button: {
    icon: MousePointerClick,
    appearance: true,
    fields: [
      { kind: "text", name: "label", max: 80 },
      { kind: "url", name: "url", placeholder: "https://" },
      {
        kind: "segmented",
        name: "width",
        options: [
          { value: "full", label: "widthFull" },
          { value: "auto", label: "widthAuto" },
        ],
      },
    ],
    advanced: [{ kind: "switch", name: "openInNewTab" }],
    summary: (config) => s(config.label),
  },
  heading: {
    icon: Heading,
    fields: [
      { kind: "text", name: "text", max: 120 },
      {
        kind: "segmented",
        name: "level",
        options: [
          { value: 2, label: "levelLarge" },
          { value: 3, label: "levelSmall" },
        ],
      },
      { kind: "segmented", name: "align", options: align },
    ],
    summary: (config) => s(config.text),
  },
  text: {
    icon: AlignLeft,
    fields: [
      { kind: "textarea", name: "text", max: 2000, rows: 5, formatting: true },
      { kind: "segmented", name: "align", options: align },
      {
        kind: "segmented",
        name: "size",
        options: [
          { value: "sm", label: "sizeSm" },
          { value: "md", label: "sizeMd" },
          { value: "lg", label: "sizeLg" },
        ],
      },
      {
        kind: "segmented",
        name: "weight",
        options: [
          { value: "regular", label: "weightRegular" },
          { value: "medium", label: "weightMedium" },
          { value: "bold", label: "weightBold" },
        ],
      },
      {
        kind: "segmented",
        name: "tone",
        options: [
          { value: "default", label: "toneDefault" },
          { value: "muted", label: "toneMuted" },
          { value: "accent", label: "toneAccent" },
        ],
      },
    ],
    summary: (config) => s(config.text).slice(0, 80),
  },
  image: {
    icon: ImageIcon,
    fields: [
      { kind: "media", name: "mediaId", purpose: "block_image" },
      { kind: "text", name: "alt", max: 300 },
      { kind: "text", name: "caption", max: 200 },
      {
        kind: "segmented",
        name: "aspect",
        options: aspect(["auto", "square", "portrait", "wide"]),
      },
      {
        kind: "segmented",
        name: "fit",
        options: [
          { value: "cover", label: "fitCover" },
          { value: "contain", label: "fitContain" },
        ],
      },
    ],
    advanced: [
      { kind: "url", name: "href", placeholder: "https://" },
      { kind: "number", name: "radius", min: 0, max: 48, unit: "px", optional: true },
    ],
    summary: (config) => s(config.alt) || s(config.caption),
  },
  gallery: {
    icon: Images,
    fields: [
      { kind: "gallery", name: "items" },
      {
        kind: "segmented",
        name: "layout",
        options: [
          { value: "grid", label: "layoutGrid" },
          { value: "carousel", label: "layoutCarousel" },
        ],
      },
      {
        kind: "segmented",
        name: "columns",
        options: [
          { value: 2, label: "columns2" },
          { value: 3, label: "columns3" },
        ],
      },
      { kind: "segmented", name: "aspect", options: aspect(["square", "portrait", "wide"]) },
    ],
    summary: (config) => (Array.isArray(config.items) ? String(config.items.length) : "0"),
  },
  social_links: {
    icon: Share2,
    fields: [
      { kind: "socials", name: "items" },
      {
        kind: "segmented",
        name: "display",
        options: [
          { value: "icons", label: "displayIcons" },
          { value: "buttons", label: "displayButtons" },
          { value: "list", label: "displayList" },
        ],
      },
      {
        kind: "segmented",
        name: "iconStyle",
        options: [
          { value: "plain", label: "iconPlain" },
          { value: "filled", label: "iconFilled" },
          { value: "outline", label: "iconOutline" },
        ],
      },
      {
        kind: "segmented",
        name: "size",
        options: [
          { value: "sm", label: "sizeSm" },
          { value: "md", label: "sizeMd" },
          { value: "lg", label: "sizeLg" },
        ],
      },
    ],
    summary: (config) =>
      Array.isArray(config.items)
        ? (config.items as { platform: string }[]).map((item) => item.platform).join(", ")
        : "",
  },
  divider: {
    icon: Minus,
    fields: [
      {
        kind: "segmented",
        name: "style",
        options: [
          { value: "solid", label: "lineSolid" },
          { value: "dashed", label: "lineDashed" },
          { value: "dotted", label: "lineDotted" },
        ],
      },
    ],
    summary: (config) => s(config.style),
  },
  spacer: {
    icon: MoveVertical,
    fields: [
      {
        kind: "segmented",
        name: "size",
        options: ["sm", "md", "lg", "xl"].map((value) => ({
          value,
          label: `size${value[0]!.toUpperCase()}${value.slice(1)}`,
        })),
      },
    ],
    summary: (config) => s(config.size),
  },
  youtube: {
    icon: PlaySquare,
    fields: [
      {
        kind: "embed",
        name: "videoId",
        parse: (input) => {
          const id = parseYouTubeUrl(input);
          return id ? { videoId: id } : null;
        },
        display: (config) => (s(config.videoId) ? `https://youtu.be/${s(config.videoId)}` : ""),
      },
      { kind: "number", name: "startSeconds", min: 0, max: 86400, unit: "s", optional: true },
    ],
    summary: (config) => s(config.videoId),
  },
  video: {
    icon: Video,
    fields: [
      { kind: "url", name: "src", placeholder: "https://…/video.mp4" },
      { kind: "text", name: "caption", max: 200 },
      { kind: "switch", name: "autoplay", hint: true },
    ],
    summary: (config) => s(config.src),
  },
  spotify: {
    icon: Music,
    fields: [
      {
        kind: "embed",
        name: "resourceId",
        parse: (input) => parseSpotifyUrl(input),
        display: (config) =>
          s(config.resourceId)
            ? `https://open.spotify.com/${s(config.resourceType)}/${s(config.resourceId)}`
            : "",
      },
      { kind: "switch", name: "compact" },
    ],
    summary: (config) => s(config.resourceType),
  },
  soundcloud: {
    icon: Disc3,
    fields: [
      { kind: "url", name: "url", placeholder: "https://soundcloud.com/…" },
      { kind: "switch", name: "visual" },
    ],
    summary: (config) => s(config.url).replace("https://soundcloud.com/", ""),
  },
  twitch: {
    icon: Gamepad2,
    fields: [
      {
        kind: "embed",
        name: "channel",
        parse: (input) => {
          const channel = parseTwitchChannel(input);
          return channel ? { channel } : null;
        },
        display: (config) => s(config.channel),
      },
      { kind: "switch", name: "muted" },
    ],
    summary: (config) => s(config.channel),
  },
  discord: {
    icon: MessagesSquare,
    fields: [
      {
        kind: "embed",
        name: "inviteCode",
        parse: (input) => {
          const inviteCode = parseDiscordInvite(input);
          return inviteCode ? { inviteCode } : null;
        },
        display: (config) =>
          s(config.inviteCode) ? `https://discord.gg/${s(config.inviteCode)}` : "",
      },
      { kind: "text", name: "serverName", max: 80 },
      { kind: "text", name: "description", max: 200 },
    ],
    summary: (config) => s(config.serverName),
  },
  github: {
    icon: GitBranch,
    fields: [
      { kind: "text", name: "username", max: 39 },
      { kind: "text", name: "repository", max: 100 },
      { kind: "text", name: "headline", max: 120 },
    ],
    summary: (config) => s(config.username),
  },
  social_profile: {
    icon: AtSign,
    fields: [
      {
        kind: "select",
        name: "platform",
        options: SOCIAL_PLATFORMS.map((value) => ({ value, label: value })),
      },
      { kind: "text", name: "handle", max: 60 },
      { kind: "url", name: "url", placeholder: "https://" },
      { kind: "text", name: "callToAction", max: 40 },
    ],
    summary: (config) => s(config.handle),
  },
  contact: {
    icon: Contact,
    fields: [
      { kind: "text", name: "email", max: 254 },
      { kind: "text", name: "phone", max: 24 },
      { kind: "text", name: "whatsapp", max: 24 },
      { kind: "text", name: "address", max: 200 },
    ],
    summary: (config) => s(config.email) || s(config.phone),
  },
  product: {
    icon: ShoppingBag,
    fields: [
      { kind: "text", name: "title", max: 120 },
      { kind: "textarea", name: "description", max: 400, rows: 3 },
      { kind: "price", name: "priceMinor", currency: "currency" },
      { kind: "url", name: "url", placeholder: "https://" },
      { kind: "media", name: "mediaId", purpose: "block_image" },
    ],
    advanced: [
      { kind: "text", name: "callToAction", max: 40 },
      { kind: "text", name: "badge", max: 24 },
    ],
    summary: (config) => s(config.title),
  },
  newsletter: {
    icon: Mail,
    fields: [
      { kind: "text", name: "title", max: 100 },
      { kind: "textarea", name: "description", max: 300, rows: 3 },
      { kind: "url", name: "url", placeholder: "https://" },
      { kind: "text", name: "callToAction", max: 40 },
    ],
    summary: (config) => s(config.title),
  },
  faq: {
    icon: CircleHelp,
    fields: [
      { kind: "text", name: "title", max: 100 },
      { kind: "faq", name: "items" },
    ],
    summary: (config) => (Array.isArray(config.items) ? String(config.items.length) : "0"),
  },
  countdown: {
    icon: CalendarClock,
    fields: [
      { kind: "text", name: "title", max: 100 },
      { kind: "datetime", name: "targetAt" },
      { kind: "text", name: "endedText", max: 100 },
      { kind: "url", name: "url", placeholder: "https://" },
    ],
    summary: (config) => s(config.title),
  },
  location: {
    icon: MapPin,
    fields: [
      { kind: "text", name: "label", max: 80 },
      { kind: "text", name: "address", max: 200 },
      { kind: "switch", name: "showMap", hint: true },
      { kind: "number", name: "zoom", min: 3, max: 19 },
    ],
    summary: (config) => s(config.address),
  },
};

export const CURRENCY_OPTIONS = CURRENCIES;

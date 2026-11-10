import type { ComponentType, ReactNode } from "react";
import type { BlockAppearance, ThemeConfig } from "@olnktr/validators/theme";

/** Link data attached to a `link` block (live link row or draft link fields). */
export interface RenderLink {
  /** Live link id (null for links that exist only in a draft). */
  id: string | null;
  title: string;
  url: string;
  description?: string;
  thumbnailMediaId?: string | null;
  openInNewTab?: boolean;
  trackClicks?: boolean;
}

export interface RenderBlock {
  id: string;
  type: string;
  config: Record<string, unknown>;
  appearance?: BlockAppearance | null;
  link?: RenderLink;
}

export interface RenderProfile {
  id: string;
  displayName: string;
  bio: string | null;
  avatarMediaId: string | null;
  coverMediaId: string | null;
}

export interface RenderContext {
  /** "public" renders the live page; "preview" is the studio canvas / draft preview. */
  mode: "public" | "preview";
  /** Hostname used as the Twitch embed `parent`. */
  embedHost: string;
  theme: ThemeConfig;
}

export interface BlockRendererProps {
  block: RenderBlock;
  ctx: RenderContext;
}

export type BlockRenderer = ComponentType<BlockRendererProps>;

/** Optional wrapper around each block (the studio uses it for selection). */
export type BlockFrame = ComponentType<{ block: RenderBlock; children: ReactNode }>;

/** Reads a string config value, tolerating incomplete drafts. */
export function str(config: Record<string, unknown>, key: string): string {
  const value = config[key];
  return typeof value === "string" ? value : "";
}

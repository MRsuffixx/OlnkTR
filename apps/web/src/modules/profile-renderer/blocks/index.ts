import type { BlockRenderer } from "../types";
import { ContactBlock, DiscordBlock, GitHubBlock, SocialProfileBlock } from "./community";
import { CountdownBlock, FaqBlock, LocationBlock, NewsletterBlock, ProductBlock } from "./business";
import {
  ButtonBlock,
  DividerBlock,
  GalleryBlock,
  HeadingBlock,
  ImageBlock,
  LinkBlock,
  SocialLinksBlock,
  SpacerBlock,
  TextBlock,
} from "./essential";
import { SoundCloudBlock, SpotifyBlock, TwitchBlock, VideoBlock, YouTubeBlock } from "./media";

/**
 * Renderer registry: block type → component. Adding a block type means adding
 * its definition in @olnktr/validators, a renderer here and an editor
 * descriptor in modules/studio/blocks. Unknown types render nothing.
 */
export const BLOCK_RENDERERS: Record<string, BlockRenderer> = {
  link: LinkBlock,
  button: ButtonBlock,
  heading: HeadingBlock,
  text: TextBlock,
  image: ImageBlock,
  gallery: GalleryBlock,
  social_links: SocialLinksBlock,
  divider: DividerBlock,
  spacer: SpacerBlock,
  youtube: YouTubeBlock,
  video: VideoBlock,
  spotify: SpotifyBlock,
  soundcloud: SoundCloudBlock,
  twitch: TwitchBlock,
  discord: DiscordBlock,
  github: GitHubBlock,
  social_profile: SocialProfileBlock,
  contact: ContactBlock,
  product: ProductBlock,
  newsletter: NewsletterBlock,
  faq: FaqBlock,
  countdown: CountdownBlock,
  location: LocationBlock,
};

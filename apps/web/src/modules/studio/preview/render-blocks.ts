import type { ProfileDocument } from "@olnktr/validators";
import type { RenderBlock } from "~/modules/profile-renderer/types";

/** Maps draft blocks to renderer input (links point at their URL; drafts are never click-tracked). */
export function toRenderBlocks(doc: ProfileDocument): RenderBlock[] {
  return doc.blocks.map((block) => ({
    id: block.id,
    type: block.type,
    config: block.config,
    appearance: block.appearance ?? null,
    link: block.link
      ? {
          id: null,
          title: block.link.title,
          url: block.link.url,
          description: block.link.description,
          thumbnailMediaId: block.link.thumbnailMediaId,
          openInNewTab: block.link.openInNewTab,
          trackClicks: block.link.trackClicks,
        }
      : undefined,
  }));
}

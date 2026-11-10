import { z } from "zod";
import { uuidSchema } from "../primitives";
import {
  dividerBlock,
  headingBlock,
  imageBlock,
  linkBlock,
  socialLinksBlock,
  spacerBlock,
  spotifyBlock,
  textBlock,
  videoBlock,
  youtubeBlock,
} from "./definitions";
import { BlockRegistry } from "./registry";

export * from "./definitions";
export * from "./embeds";
export * from "./registry";

/** Creates a registry pre-loaded with every built-in block type. */
export function createDefaultBlockRegistry(): BlockRegistry {
  return new BlockRegistry()
    .register(linkBlock)
    .register(headingBlock)
    .register(textBlock)
    .register(imageBlock)
    .register(videoBlock)
    .register(socialLinksBlock)
    .register(dividerBlock)
    .register(spacerBlock)
    .register(youtubeBlock)
    .register(spotifyBlock);
}

export const blockRegistry = createDefaultBlockRegistry();
export const BUILTIN_BLOCK_TYPES = blockRegistry.types();

export const createBlockInputSchema = z.object({
  profileId: uuidSchema,
  type: z.string().min(1).max(64),
  config: z.unknown(),
  isVisible: z.boolean().default(true),
  /** Insert position; appended to the end when omitted. */
  position: z.number().int().min(0).optional(),
});

export const updateBlockInputSchema = z.object({
  blockId: uuidSchema,
  config: z.unknown().optional(),
  isVisible: z.boolean().optional(),
});

export const reorderInputSchema = z.object({
  profileId: uuidSchema,
  orderedIds: z.array(uuidSchema).min(1).max(1000),
});

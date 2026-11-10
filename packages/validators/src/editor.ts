import { z } from "zod";
import { blockRegistry, type BlockRegistry } from "./blocks/index";
import { linkMetadataSchema } from "./links";
import { plainText, publicHttpUrlSchema, uuidSchema } from "./primitives";
import { PROFILE_VISIBILITIES } from "./profiles";
import { blockAppearanceSchema, themeOverridesSchema } from "./theme/index";

/**
 * Profile document — the editor's draft.
 *
 * The studio edits one JSON document per profile (profile fields, theme
 * selection + overrides, ordered blocks). It is saved as a draft and only
 * becomes public when published; publishing materializes it into the live
 * `profiles`, `blocks` and `links` rows that the public page and the REST API
 * read.
 *
 * Saving is lenient (a draft may be mid-edit: an empty URL, no image chosen
 * yet) but bounded in size and shape. Publishing is strict:
 * `validateProfileDocument` must return no issues.
 */
export const PROFILE_DOCUMENT_VERSION = 1;
export const MAX_DOCUMENT_BLOCKS = 200;
export const MAX_DOCUMENT_BYTES = 512 * 1024;
const MAX_BLOCK_CONFIG_BYTES = 16 * 1024;

const loose = (max: number) => z.string().max(max);

/** Link fields carried by a `link` block inside a draft. */
export const draftLinkSchema = z
  .object({
    title: loose(120),
    url: loose(2048),
    description: loose(300).optional(),
    thumbnailMediaId: uuidSchema.nullish(),
    openInNewTab: z.boolean().default(false),
    isActive: z.boolean().default(true),
    trackClicks: z.boolean().default(true),
    startsAt: z.iso.datetime({ offset: true }).nullish(),
    endsAt: z.iso.datetime({ offset: true }).nullish(),
  })
  .strict();
export type DraftLink = z.infer<typeof draftLinkSchema>;

const publishLinkSchema = z
  .object({
    title: plainText(120, 1),
    url: publicHttpUrlSchema,
    description: plainText(300).optional(),
    startsAt: z.string().nullish(),
    endsAt: z.string().nullish(),
  })
  .loose()
  .refine(
    (link) => !link.startsAt || !link.endsAt || new Date(link.startsAt) < new Date(link.endsAt),
    { message: "The end must be after the start", path: ["endsAt"] },
  );

export const documentBlockSchema = z
  .object({
    id: uuidSchema,
    type: z.string().min(1).max(64),
    isVisible: z.boolean(),
    config: z
      .record(z.string(), z.unknown())
      .refine((value) => JSON.stringify(value).length <= MAX_BLOCK_CONFIG_BYTES, {
        message: "Block configuration is too large",
      }),
    appearance: blockAppearanceSchema.optional(),
    link: draftLinkSchema.optional(),
  })
  .strict();
export type DocumentBlock = z.infer<typeof documentBlockSchema>;

export const documentProfileSchema = z
  .object({
    displayName: loose(80),
    bio: loose(500),
    avatarMediaId: uuidSchema.nullable(),
    coverMediaId: uuidSchema.nullable(),
    seoTitle: loose(70),
    seoDescription: loose(160),
    seoNoIndex: z.boolean(),
    visibility: z.enum(PROFILE_VISIBILITIES),
  })
  .strict();

export const profileDocumentSchema = z
  .object({
    version: z.literal(PROFILE_DOCUMENT_VERSION),
    profile: documentProfileSchema,
    theme: z.object({ themeId: uuidSchema.nullable(), overrides: themeOverridesSchema }).strict(),
    blocks: z.array(documentBlockSchema).max(MAX_DOCUMENT_BLOCKS),
  })
  .strict()
  .refine((doc) => new Set(doc.blocks.map((block) => block.id)).size === doc.blocks.length, {
    message: "Block ids must be unique",
    path: ["blocks"],
  });
export type ProfileDocument = z.infer<typeof profileDocumentSchema>;

export interface DocumentIssue {
  /** "profile" or the id of the block the issue belongs to. */
  target: string;
  /** Dotted field path inside the target (e.g. "config.url", "link.title"). */
  path: string;
  code: string;
  message: string;
}

const publishProfileSchema = z.object({
  displayName: plainText(80, 1),
  bio: plainText(500),
  seoTitle: plainText(70),
  seoDescription: plainText(160),
});

function toIssues(target: string, prefix: string, issues: z.core.$ZodIssue[]): DocumentIssue[] {
  return issues.map((issue) => ({
    target,
    path: [prefix, ...issue.path.map(String)].filter(Boolean).join("."),
    code: issue.code,
    message: issue.message,
  }));
}

/** Strict publish-time validation. Returns an empty list when the draft can be published. */
export function validateProfileDocument(
  document: ProfileDocument,
  registry: BlockRegistry = blockRegistry,
): DocumentIssue[] {
  const issues: DocumentIssue[] = [];
  const profile = publishProfileSchema.safeParse(document.profile);
  if (!profile.success) issues.push(...toIssues("profile", "", profile.error.issues));

  for (const block of document.blocks) {
    const definition = registry.get(block.type);
    if (!definition) {
      issues.push({
        target: block.id,
        path: "type",
        code: "unknown_type",
        message: "Unknown block type",
      });
      continue;
    }
    const config = registry.safeParseInput(block.type, block.config);
    if (!config.success) issues.push(...toIssues(block.id, "config", config.issues));
    if (definition.managedBy === "links") {
      if (!block.link) {
        issues.push({
          target: block.id,
          path: "link",
          code: "missing",
          message: "Link details are missing",
        });
      } else {
        const link = publishLinkSchema.safeParse(block.link);
        if (!link.success) issues.push(...toIssues(block.id, "link", link.error.issues));
        const metadata = linkMetadataSchema.safeParse({
          description: block.link.description || undefined,
        });
        if (!metadata.success) issues.push(...toIssues(block.id, "link", metadata.error.issues));
      }
    }
  }
  return issues;
}

/** Every media id referenced by a document (ownership is verified on publish). */
export function documentMediaIds(document: ProfileDocument): string[] {
  const ids = new Set<string>();
  const add = (value: unknown) => {
    if (typeof value === "string" && uuidSchema.safeParse(value).success) ids.add(value);
  };
  add(document.profile.avatarMediaId);
  add(document.profile.coverMediaId);
  const background = document.theme.overrides.background;
  if (background?.type === "image") add(background.mediaId);
  for (const block of document.blocks) {
    add(block.config.mediaId);
    add(block.link?.thumbnailMediaId);
    if (Array.isArray(block.config.items)) {
      for (const item of block.config.items as unknown[])
        add((item as { mediaId?: unknown })?.mediaId);
    }
  }
  return [...ids];
}

export const saveDraftInputSchema = z.object({
  profileId: uuidSchema,
  document: profileDocumentSchema,
  /** Revision the client edited; null overwrites whatever is stored (explicit user choice). */
  expectedRevision: z.number().int().min(0).nullable(),
});

export const publishDraftInputSchema = z.object({
  profileId: uuidSchema,
  expectedRevision: z.number().int().min(0),
});

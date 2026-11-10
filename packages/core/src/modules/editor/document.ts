import { createHash } from "node:crypto";
import { asc, eq, inArray, schema, type DbExecutor } from "@olnktr/db";
import {
  PROFILE_DOCUMENT_VERSION,
  type DocumentBlock,
  type ProfileDocument,
} from "@olnktr/validators";
import { parseThemeOverrides } from "@olnktr/validators/theme";
import { toBlockView } from "../blocks/index";

type ProfileRow = typeof schema.profiles.$inferSelect;

/** Builds the editor document that represents the live (published) content of a profile. */
export async function documentFromLive(
  executor: DbExecutor,
  profile: ProfileRow,
): Promise<ProfileDocument> {
  const rows = await executor
    .select()
    .from(schema.blocks)
    .where(eq(schema.blocks.profileId, profile.id))
    .orderBy(asc(schema.blocks.position), asc(schema.blocks.createdAt));
  const linkIds = rows.map((row) => row.linkId).filter((id): id is string => Boolean(id));
  const links = linkIds.length
    ? await executor.select().from(schema.links).where(inArray(schema.links.id, linkIds))
    : [];
  const linksById = new Map(links.map((link) => [link.id, link]));

  const blocks: DocumentBlock[] = [];
  for (const row of rows) {
    const view = toBlockView(row);
    const block: DocumentBlock = {
      id: row.id,
      type: row.type,
      isVisible: row.isVisible,
      config: view.config,
    };
    if (row.appearance && Object.keys(row.appearance).length > 0) block.appearance = row.appearance;
    if (row.linkId) {
      const link = linksById.get(row.linkId);
      if (!link) continue;
      const metadata = link.metadata;
      block.link = {
        title: link.title,
        url: link.url,
        description: metadata.description,
        thumbnailMediaId: metadata.thumbnailMediaId ?? null,
        openInNewTab: metadata.openInNewTab ?? false,
        isActive: link.isActive,
        trackClicks: metadata.trackClicks ?? true,
        startsAt: link.startsAt?.toISOString() ?? null,
        endsAt: link.endsAt?.toISOString() ?? null,
      };
      if (block.link.description === undefined) delete block.link.description;
    }
    blocks.push(block);
  }

  return {
    version: PROFILE_DOCUMENT_VERSION,
    profile: {
      displayName: profile.displayName,
      bio: profile.bio ?? "",
      avatarMediaId: profile.avatarMediaId,
      coverMediaId: profile.coverMediaId,
      seoTitle: profile.seoTitle ?? "",
      seoDescription: profile.seoDescription ?? "",
      seoNoIndex: profile.seoNoIndex,
      visibility: profile.visibility,
    },
    theme: { themeId: profile.themeId, overrides: parseThemeOverrides(profile.themeOverrides) },
    blocks,
  };
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .filter((key) => (value as Record<string, unknown>)[key] !== undefined)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

/** Content fingerprint used to detect live changes made outside the studio. */
export function documentFingerprint(document: ProfileDocument): string {
  return createHash("sha256").update(stableStringify(document)).digest("hex");
}

import { and, asc, eq, inArray, schema } from "@olnktr/db";
import { normalizeUsername } from "@olnktr/validators";
import type { ThemeConfig } from "@olnktr/validators/theme";
import { profileOwner } from "../access/index";
import { toBlockView, type BlockView } from "../blocks/index";
import type { ThemeService } from "../themes/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Public profile resolution boundary.
 *
 * Callers describe *how* a profile is addressed with a `PublicProfileLookup`.
 * Today the only kind is a username from the URL path. Custom domains will add
 * `{ kind: "hostname", hostname }` plus a resolver that maps a verified
 * hostname to a profile id — without changing rendering or the profile module.
 */
export type PublicProfileLookup = { kind: "username"; username: string };

export interface PublicLink {
  id: string;
  title: string;
  url: string;
  metadata: Record<string, unknown>;
}

export interface PublicProfileView {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarMediaId: string | null;
  coverMediaId: string | null;
  seo: { title: string | null; description: string | null; noIndex: boolean };
  theme: ThemeConfig;
  showBranding: boolean;
  blocks: (BlockView & { link?: PublicLink })[];
}

export function createPublicProfileService(deps: CoreDeps & { themes: ThemeService }) {
  const { db } = deps;

  async function findProfileId(lookup: PublicProfileLookup): Promise<string | null> {
    switch (lookup.kind) {
      case "username": {
        const [row] = await db
          .select({ id: schema.profiles.id })
          .from(schema.profiles)
          .where(eq(schema.profiles.username, normalizeUsername(lookup.username)));
        return row?.id ?? null;
      }
    }
  }

  return {
    async resolve(lookup: PublicProfileLookup): Promise<PublicProfileView | null> {
      const profileId = await findProfileId(lookup);
      if (!profileId) return null;
      const now = deps.clock.now();
      const [profile] = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.id, profileId));
      if (!profile || profile.status !== "published" || profile.visibility === "private")
        return null;

      // Profiles of suspended / deleting accounts and suspended organizations are hidden.
      if (profile.ownerUserId) {
        const [owner] = await db
          .select({ status: schema.users.status })
          .from(schema.users)
          .where(eq(schema.users.id, profile.ownerUserId));
        if (owner?.status !== "active") return null;
      } else if (profile.ownerOrganizationId) {
        const [owner] = await db
          .select({ status: schema.organizations.status })
          .from(schema.organizations)
          .where(eq(schema.organizations.id, profile.ownerOrganizationId));
        if (owner?.status !== "active") return null;
      }

      const blockRows = await db
        .select()
        .from(schema.blocks)
        .where(and(eq(schema.blocks.profileId, profile.id), eq(schema.blocks.isVisible, true)))
        .orderBy(asc(schema.blocks.position));
      const linkIds = blockRows
        .map((block) => block.linkId)
        .filter((id): id is string => Boolean(id));
      const links = linkIds.length
        ? await db.select().from(schema.links).where(inArray(schema.links.id, linkIds))
        : [];
      const visibleLinks = new Map(
        links
          .filter(
            (link) =>
              link.isActive &&
              (!link.startsAt || link.startsAt <= now) &&
              (!link.endsAt || link.endsAt > now),
          )
          .map((link) => [
            link.id,
            {
              id: link.id,
              title: link.title,
              url: link.url,
              metadata: link.metadata as Record<string, unknown>,
            },
          ]),
      );

      const blocks: PublicProfileView["blocks"] = [];
      for (const row of blockRows) {
        const view = toBlockView(row);
        if (!view.valid) continue;
        if (row.linkId) {
          const link = visibleLinks.get(row.linkId);
          if (link) blocks.push({ ...view, link });
        } else {
          blocks.push(view);
        }
      }

      const [theme, resolution] = await Promise.all([
        deps.themes.resolveConfig(profile),
        deps.entitlements.resolve(profileOwner(profile)),
      ]);

      return {
        id: profile.id,
        username: profile.username,
        displayName: profile.displayName,
        bio: profile.bio,
        avatarMediaId: profile.avatarMediaId,
        coverMediaId: profile.coverMediaId,
        seo: {
          title: profile.seoTitle,
          description: profile.seoDescription,
          noIndex: profile.seoNoIndex || profile.visibility === "unlisted",
        },
        theme,
        showBranding: !resolution.entitlements["branding.removal"],
        blocks,
      };
    },
  };
}

export type PublicProfileService = ReturnType<typeof createPublicProfileService>;

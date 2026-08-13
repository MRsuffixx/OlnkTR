import { TRPCError } from "@trpc/server";

import type { Prisma } from "../../../../generated/prisma/client";
import { APPEARANCE_SETTINGS_VERSION } from "~/lib/appearance";
import {
  linkCustomizationSchema,
  socialAccountSettingsSchema,
  socialPlatformSchema,
  setLinkPasswordInput,
  setProfilePasswordInput,
  workspaceInput,
} from "~/lib/schemas";
import { DEFAULT_THEME, faviconForUrl } from "~/lib/theme";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import {
  canUseFeature,
  hasProAccess,
  mergePermittedAppearance,
  resolveAppearanceForPlan,
} from "~/server/entitlements";
import { sanitizeCustomCss } from "~/server/security/custom-css";
import { hashLinkPassword } from "~/server/security/link-password";

const DEFAULT_LINK_CUSTOMIZATION = linkCustomizationSchema.parse({});

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null;
}

function validEmbedUrl(type: "LINK" | "YOUTUBE" | "SPOTIFY", value: string) {
  if (type === "LINK" || !value) return true;
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (url.protocol !== "https:") return false;
    if (type === "YOUTUBE")
      return ["youtube.com", "youtu.be", "music.youtube.com"].includes(host);
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      host === "open.spotify.com" &&
      parts.length === 2 &&
      ["track", "album", "playlist", "episode", "show"].includes(parts[0]!) &&
      /^[A-Za-z0-9]+$/.test(parts[1]!)
    );
  } catch {
    return false;
  }
}

export const workspaceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        theme: true,
        subscription: true,
        manualEntitlement: true,
        links: {
          where: { deletedAt: null },
          orderBy: { position: "asc" },
        },
        socialAccounts: {
          where: { deletedAt: null },
          orderBy: { position: "asc" },
        },
      },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const pro = hasProAccess(user.subscription, user.manualEntitlement);
    const appearance = resolveAppearanceForPlan(user.theme?.settings, pro);
    return {
      revision: user.editorRevision,
      name: user.name ?? user.username ?? "olnk kullanıcısı",
      bio: user.bio,
      image: user.image,
      username: user.username,
      hasPro: pro,
      plan: pro ? ("pro" as const) : ("free" as const),
      lockedAppearancePaths: appearance.lockedPaths,
      appearance: appearance.raw,
      effectiveAppearance: appearance.effective,
      customCss: user.theme?.customCss ?? "",
      profilePasswordProtected: Boolean(user.profilePasswordHash),
      theme: user.theme
        ? {
            backgroundType: user.theme.backgroundType,
            backgroundValue: user.theme.backgroundValue,
            buttonStyle: user.theme.buttonStyle,
            buttonShape: user.theme.buttonShape,
            buttonColor: user.theme.buttonColor,
            textColor: user.theme.textColor,
            accentColor: user.theme.accentColor,
            fontFamily: user.theme.fontFamily,
            showBranding: user.theme.showBranding,
          }
        : DEFAULT_THEME,
      links: user.links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        iconUrl: link.iconUrl,
        enabled: link.enabled,
        customization: linkCustomizationSchema
          .catch(DEFAULT_LINK_CUSTOMIZATION)
          .parse(link.customization),
        scheduledStart: link.scheduledStart?.toISOString() ?? null,
        scheduledEnd: link.scheduledEnd?.toISOString() ?? null,
        passwordProtected: Boolean(link.passwordHash),
        embedType: link.embedType,
      })),
      socials: user.socialAccounts.flatMap((account) => {
        const platform = socialPlatformSchema.safeParse(account.platform);
        if (!platform.success) return [];
        return [
          {
            id: account.id,
            platform: platform.data,
            label: account.label,
            username: account.username ?? "",
            url: account.url,
            enabled: account.enabled,
            iconOnly: account.iconOnly,
            usePlatformColor: account.usePlatformColor,
            customColor: account.customColor,
            tooltip: account.tooltip ?? "",
            settings: socialAccountSettingsSchema.parse(account.settings),
          },
        ];
      }),
    };
  }),

  save: protectedProcedure
    .input(workspaceInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;
      const current = await ctx.db.user.findUnique({
        where: { id: userId },
        include: {
          theme: true,
          subscription: true,
          manualEntitlement: true,
          links: { where: { deletedAt: null } },
          socialAccounts: { where: { deletedAt: null } },
        },
      });
      if (!current) throw new TRPCError({ code: "NOT_FOUND" });
      const pro = hasProAccess(current.subscription, current.manualEntitlement);
      const appearance = mergePermittedAppearance(
        input.appearance,
        current.theme?.settings,
        pro,
      );
      const advancedLinksAllowed = canUseFeature(pro, "links.scheduledStart");
      let customCss = current.theme?.customCss ?? "";
      if (pro) {
        try {
          customCss = sanitizeCustomCss(input.customCss);
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              error instanceof Error ? error.message : "Özel CSS geçersiz.",
          });
        }
      }
      const storedLinks = new Map(current.links.map((link) => [link.id, link]));

      for (const link of input.links) {
        if (
          canUseFeature(pro, "links.embedType") &&
          !validEmbedUrl(link.embedType, link.url)
        ) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Gömme türü ile bağlantı adresi eşleşmiyor.",
          });
        }
      }

      try {
        const revision = await ctx.db.$transaction(async (tx) => {
          const updated = await tx.user.updateMany({
            where: { id: userId, editorRevision: input.revision },
            data: {
              name: input.name,
              bio: input.bio,
              image: input.image?.length ? input.image : null,
              editorRevision: { increment: 1 },
            },
          });
          if (updated.count !== 1)
            throw new TRPCError({
              code: "CONFLICT",
              message:
                "Bu profil başka bir sekmede değiştirildi. Sayfayı yenileyin.",
            });

          await tx.theme.upsert({
            where: { userId },
            create: {
              userId,
              ...input.theme,
              showBranding: pro ? input.theme.showBranding : true,
              settings: appearance,
              settingsVersion: APPEARANCE_SETTINGS_VERSION,
              customCss,
            },
            update: {
              ...input.theme,
              showBranding: pro ? input.theme.showBranding : true,
              settings: appearance,
              settingsVersion: APPEARANCE_SETTINGS_VERSION,
              customCss,
            },
          });

          await Promise.all(
            input.links.map((link, position) => {
              const stored = storedLinks.get(link.id);
              const advanced = advancedLinksAllowed
                ? {
                    customization: link.customization as Prisma.InputJsonValue,
                    scheduledStart: dateOrNull(link.scheduledStart),
                    scheduledEnd: dateOrNull(link.scheduledEnd),
                    embedType: link.embedType,
                  }
                : {
                    customization: (stored?.customization ??
                      DEFAULT_LINK_CUSTOMIZATION) as Prisma.InputJsonValue,
                    scheduledStart: stored?.scheduledStart ?? null,
                    scheduledEnd: stored?.scheduledEnd ?? null,
                    embedType: stored?.embedType ?? ("LINK" as const),
                  };
              const data = {
                title: link.title,
                url: link.url,
                iconUrl: link.iconUrl ?? faviconForUrl(link.url),
                enabled: Boolean(link.enabled && link.url),
                position,
                deletedAt: null,
                ...advanced,
              };
              return tx.profileLink.upsert({
                where: { id_userId: { id: link.id, userId } },
                create: { id: link.id, userId, ...data },
                update: data,
              });
            }),
          );

          await tx.profileLink.updateMany({
            where: {
              userId,
              deletedAt: null,
              ...(input.links.length
                ? { id: { notIn: input.links.map((link) => link.id) } }
                : {}),
            },
            data: { enabled: false, deletedAt: new Date() },
          });
          await Promise.all(
            input.socials.map((account, position) => {
              const settings = socialAccountSettingsSchema.parse(
                account.settings,
              );
              const hasDestination = Boolean(
                account.url ||
                  (account.platform === "DISCORD" &&
                    settings.discord.userId),
              );
              const data = {
                platform: account.platform,
                label: account.label,
                username: account.username || null,
                url: account.url,
                enabled: account.enabled && hasDestination,
                iconOnly: account.iconOnly,
                usePlatformColor: account.usePlatformColor,
                customColor: account.customColor,
                tooltip: account.tooltip || null,
                settings: settings as Prisma.InputJsonValue,
                position,
                deletedAt: null,
              };
              return tx.socialAccount.upsert({
                where: { id_userId: { id: account.id, userId } },
                create: { id: account.id, userId, ...data },
                update: data,
              });
            }),
          );

          await tx.socialAccount.updateMany({
            where: {
              userId,
              deletedAt: null,
              ...(input.socials.length
                ? { id: { notIn: input.socials.map((account) => account.id) } }
                : {}),
            },
            data: { enabled: false, deletedAt: new Date() },
          });
          const referencedAssets = [
            input.image,
            appearance.background.mediaUrl,
            appearance.audio.sourceUrl,
            appearance.audio.entryUrl,
          ].filter((value): value is string => Boolean(value));
          await tx.uploadedAsset.updateMany({
            where: {
              userId,
              status: "READY",
              ...(referencedAssets.length
                ? { publicUrl: { notIn: referencedAssets } }
                : {}),
            },
            data: { status: "DELETE_PENDING", nextDeletionAt: new Date() },
          });
          return input.revision + 1;
        });
        return {
          revision,
          effectiveAppearance: resolveAppearanceForPlan(appearance, pro)
            .effective,
          sanitizedCustomCss: customCss,
        };
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.",
        });
      }
    }),

  setLinkPassword: protectedProcedure
    .input(setLinkPasswordInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: { subscription: true, manualEntitlement: true },
      });
      if (
        !canUseFeature(
          hasProAccess(user?.subscription, user?.manualEntitlement),
          "links.password",
        )
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu özellik Pro planında kullanılabilir.",
        });
      const passwordHash = input.password
        ? await hashLinkPassword(input.password)
        : null;
      const updated = await ctx.db.profileLink.updateMany({
        where: {
          id: input.linkId,
          userId: ctx.session.user.id,
          deletedAt: null,
        },
        data: { passwordHash, accessVersion: { increment: 1 } },
      });
      if (!updated.count) throw new TRPCError({ code: "NOT_FOUND" });
      return { passwordProtected: Boolean(passwordHash) };
    }),

  setProfilePassword: protectedProcedure
    .input(setProfilePasswordInput)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { id: ctx.session.user.id },
        select: {
          subscription: true,
          manualEntitlement: true,
          profilePasswordHash: true,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      if (
        input.password &&
        !canUseFeature(
          hasProAccess(user.subscription, user.manualEntitlement),
          "profiles.password",
        )
      )
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Bu özellik Pro planında kullanılabilir.",
        });
      const passwordHash = input.password
        ? await hashLinkPassword(input.password)
        : null;
      await ctx.db.user.update({
        where: { id: ctx.session.user.id },
        data: {
          profilePasswordHash: passwordHash,
          profileAccessVersion: { increment: 1 },
        },
      });
      return { profilePasswordProtected: Boolean(passwordHash) };
    }),
});

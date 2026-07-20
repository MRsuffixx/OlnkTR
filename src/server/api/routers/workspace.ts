import { TRPCError } from "@trpc/server";

import type { Prisma } from "../../../../generated/prisma/client";
import { linkCustomizationSchema, setLinkPasswordInput, workspaceInput } from "~/lib/schemas";
import { DEFAULT_THEME, faviconForUrl } from "~/lib/theme";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { canUseFeature, hasProAccess, mergePermittedAppearance, resolveAppearanceForPlan } from "~/server/entitlements";
import { sanitizeCustomCss } from "~/server/security/custom-css";
import { hashLinkPassword } from "~/server/security/link-password";

const DEFAULT_LINK_CUSTOMIZATION = linkCustomizationSchema.parse({});

function dateOrNull(value: string | null) {
  return value ? new Date(value) : null;
}

function validEmbedUrl(type: "LINK" | "YOUTUBE" | "SPOTIFY", value: string) {
  if (type === "LINK" || !value) return true;
  try {
    const host = new URL(value).hostname.toLowerCase().replace(/^www\./, "");
    return type === "YOUTUBE"
      ? ["youtube.com", "youtu.be", "music.youtube.com"].includes(host)
      : ["open.spotify.com", "spotify.link"].includes(host);
  } catch {
    return false;
  }
}

export const workspaceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: { theme: true, subscription: true, links: { orderBy: { position: "asc" } } },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const pro = hasProAccess(user.subscription);
    const appearance = resolveAppearanceForPlan(user.theme?.settings, pro);
    return {
      revision: user.editorRevision,
      name: user.name ?? user.username ?? "olnk kullanıcısı",
      bio: user.bio,
      image: user.image,
      username: user.username,
      hasPro: pro,
      plan: pro ? "pro" as const : "free" as const,
      lockedAppearancePaths: appearance.lockedPaths,
      appearance: appearance.raw,
      effectiveAppearance: appearance.effective,
      customCss: user.theme?.customCss ?? "",
      theme: user.theme ? {
        backgroundType: user.theme.backgroundType,
        backgroundValue: user.theme.backgroundValue,
        buttonStyle: user.theme.buttonStyle,
        buttonShape: user.theme.buttonShape,
        buttonColor: user.theme.buttonColor,
        textColor: user.theme.textColor,
        accentColor: user.theme.accentColor,
        fontFamily: user.theme.fontFamily,
        showBranding: user.theme.showBranding,
      } : DEFAULT_THEME,
      links: user.links.map((link) => ({
        id: link.id,
        title: link.title,
        url: link.url,
        iconUrl: link.iconUrl,
        enabled: link.enabled,
        customization: linkCustomizationSchema.catch(DEFAULT_LINK_CUSTOMIZATION).parse(link.customization),
        scheduledStart: link.scheduledStart?.toISOString() ?? null,
        scheduledEnd: link.scheduledEnd?.toISOString() ?? null,
        passwordProtected: Boolean(link.passwordHash),
        embedType: link.embedType,
      })),
    };
  }),

  save: protectedProcedure.input(workspaceInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    const current = await ctx.db.user.findUnique({
      where: { id: userId },
      include: { theme: true, subscription: true, links: true },
    });
    if (!current) throw new TRPCError({ code: "NOT_FOUND" });
    const pro = hasProAccess(current.subscription);
    const appearance = mergePermittedAppearance(input.appearance, current.theme?.settings, pro);
    const advancedLinksAllowed = canUseFeature(pro, "links.scheduledStart");
    let customCss = current.theme?.customCss ?? "";
    if (pro) {
      try {
        customCss = sanitizeCustomCss(input.customCss);
      } catch (error) {
        throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : "Özel CSS geçersiz." });
      }
    }
    const storedLinks = new Map(current.links.map((link) => [link.id, link]));

    for (const link of input.links) {
      if (canUseFeature(pro, "links.embedType") && !validEmbedUrl(link.embedType, link.url)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Gömme türü ile bağlantı adresi eşleşmiyor." });
      }
    }

    try {
      const revision = await ctx.db.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
          where: { id: userId, editorRevision: input.revision },
          data: { name: input.name, bio: input.bio, image: input.image?.length ? input.image : null, editorRevision: { increment: 1 } },
        });
        if (updated.count !== 1) throw new TRPCError({ code: "CONFLICT", message: "Bu profil başka bir sekmede değiştirildi. Sayfayı yenileyin." });

        await tx.theme.upsert({
          where: { userId },
          create: { userId, ...input.theme, showBranding: pro ? input.theme.showBranding : true, settings: appearance, customCss },
          update: { ...input.theme, showBranding: pro ? input.theme.showBranding : true, settings: appearance, customCss },
        });

        await Promise.all(input.links.map((link, position) => {
          const stored = storedLinks.get(link.id);
          const advanced = advancedLinksAllowed ? {
            customization: link.customization as Prisma.InputJsonValue,
            scheduledStart: dateOrNull(link.scheduledStart),
            scheduledEnd: dateOrNull(link.scheduledEnd),
            embedType: link.embedType,
          } : {
            customization: (stored?.customization ?? DEFAULT_LINK_CUSTOMIZATION) as Prisma.InputJsonValue,
            scheduledStart: stored?.scheduledStart ?? null,
            scheduledEnd: stored?.scheduledEnd ?? null,
            embedType: stored?.embedType ?? "LINK" as const,
          };
          const data = { title: link.title, url: link.url, iconUrl: link.iconUrl ?? faviconForUrl(link.url), enabled: Boolean(link.enabled && link.url), position, ...advanced };
          return tx.profileLink.upsert({ where: { id_userId: { id: link.id, userId } }, create: { id: link.id, userId, ...data }, update: data });
        }));

        await tx.profileLink.deleteMany({ where: { userId, ...(input.links.length ? { id: { notIn: input.links.map((link) => link.id) } } : {}) } });
        return input.revision + 1;
      });
      return { revision, effectiveAppearance: resolveAppearanceForPlan(appearance, pro).effective };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin." });
    }
  }),

  setLinkPassword: protectedProcedure.input(setLinkPasswordInput).mutation(async ({ ctx, input }) => {
    const subscription = await ctx.db.subscription.findUnique({ where: { userId: ctx.session.user.id } });
    if (!canUseFeature(hasProAccess(subscription), "links.password")) throw new TRPCError({ code: "FORBIDDEN", message: "Bu özellik Pro planında kullanılabilir." });
    const passwordHash = input.password ? await hashLinkPassword(input.password) : null;
    const updated = await ctx.db.profileLink.updateMany({ where: { id: input.linkId, userId: ctx.session.user.id }, data: { passwordHash } });
    if (!updated.count) throw new TRPCError({ code: "NOT_FOUND" });
    return { passwordProtected: Boolean(passwordHash) };
  }),
});

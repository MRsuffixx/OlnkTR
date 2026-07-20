import { TRPCError } from "@trpc/server";

import { workspaceInput } from "~/lib/schemas";
import { DEFAULT_THEME, faviconForUrl } from "~/lib/theme";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const workspaceRouter = createTRPCRouter({
  get: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      include: {
        theme: true,
        links: { orderBy: { position: "asc" } },
      },
    });
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    return {
      revision: user.editorRevision,
      name: user.name ?? user.username ?? "olnk kullanıcısı",
      bio: user.bio,
      image: user.image,
      username: user.username,
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
      })),
    };
  }),

  save: protectedProcedure.input(workspaceInput).mutation(async ({ ctx, input }) => {
    const userId = ctx.session.user.id;
    try {
      const revision = await ctx.db.$transaction(async (tx) => {
        const updated = await tx.user.updateMany({
          where: { id: userId, editorRevision: input.revision },
          data: {
            name: input.name,
            bio: input.bio,
            image: input.image && input.image.length > 0 ? input.image : null,
            editorRevision: { increment: 1 },
          },
        });
        if (updated.count !== 1) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Bu profil başka bir sekmede değiştirildi. Sayfayı yenileyin.",
          });
        }

        await tx.theme.upsert({
          where: { userId },
          create: { userId, ...input.theme },
          update: input.theme,
        });

        await Promise.all(
          input.links.map((link, position) => {
            const data = {
              title: link.title,
              url: link.url,
              iconUrl: link.iconUrl ?? faviconForUrl(link.url),
              enabled: Boolean(link.enabled && link.url),
              position,
            };
            return tx.profileLink.upsert({
              where: { id_userId: { id: link.id, userId } },
              create: { id: link.id, userId, ...data },
              update: data,
            });
          }),
        );

        await tx.profileLink.deleteMany({
          where: {
            userId,
            ...(input.links.length ? { id: { notIn: input.links.map((link) => link.id) } } : {}),
          },
        });

        return input.revision + 1;
      });
      return { revision };
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Değişiklikler kaydedilemedi. Lütfen tekrar deneyin.",
      });
    }
  }),
});

import "server-only";

import { z } from "zod";

const discordPresenceResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    discord_status: z.enum(["online", "idle", "dnd", "offline"]),
    discord_user: z.object({
      id: z.string().regex(/^\d{17,20}$/),
      username: z.string().max(80),
      global_name: z.string().max(80).nullable().optional(),
      avatar: z.string().max(128).nullable(),
    }),
    activities: z
      .array(
        z.object({
          name: z.string().max(128),
          details: z.string().max(256).optional(),
          state: z.string().max(256).optional(),
          type: z.number().int().min(0).max(6),
        }),
      )
      .max(24),
    spotify: z
      .object({
        song: z.string().max(256),
        artist: z.string().max(256),
        album: z.string().max(256),
        album_art_url: z.url().max(2048),
        track_id: z.string().regex(/^[A-Za-z0-9]+$/),
      })
      .nullable(),
  }),
});

export type DiscordPresence = z.infer<
  typeof discordPresenceResponseSchema
>["data"];

export async function getDiscordPresence(userId: string) {
  if (!/^\d{17,20}$/.test(userId)) return null;
  try {
    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${encodeURIComponent(userId)}`,
      {
        headers: { accept: "application/json" },
        next: { revalidate: 30 },
        signal: AbortSignal.timeout(2_500),
      },
    );
    if (!response.ok) return null;
    const result = discordPresenceResponseSchema.safeParse(
      await response.json(),
    );
    return result.success ? result.data.data : null;
  } catch {
    return null;
  }
}

import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Geçerli bir renk seçin.");
const optionalWebUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }, "Bağlantı http:// veya https:// ile başlamalı.");

export const usernameInput = z.object({
  username: z.string().min(1).max(64),
});

export const themeInput = z.object({
  backgroundType: z.enum(["SOLID", "GRADIENT", "IMAGE"]),
  backgroundValue: z.string().trim().min(1).max(2048),
  buttonStyle: z.enum(["SOLID", "OUTLINE", "GLASS", "SHADOW"]),
  buttonShape: z.enum(["ROUNDED", "PILL", "SQUARE"]),
  buttonColor: hexColor,
  textColor: hexColor,
  accentColor: hexColor,
  fontFamily: z.enum(["MODERN", "FRIENDLY", "EDITORIAL", "MONO"]),
  showBranding: z.boolean(),
});

export const workspaceLinkInput = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1, "Başlık gerekli.").max(80),
  url: optionalWebUrl,
  iconUrl: optionalWebUrl.nullable(),
  enabled: z.boolean(),
});

export const workspaceInput = z.object({
  revision: z.number().int().nonnegative(),
  name: z.string().trim().min(1, "Görünen ad gerekli.").max(60),
  bio: z.string().trim().max(160),
  image: optionalWebUrl.nullable(),
  theme: themeInput,
  links: z.array(workspaceLinkInput).max(50),
});

export type WorkspaceInput = z.infer<typeof workspaceInput>;

export const registerIntentInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  username: z.string().min(1).max(64),
});

export const accountProfileInput = z.object({
  name: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(160),
  image: optionalWebUrl.nullable(),
});

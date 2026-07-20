import { z } from "zod";

import { appearanceSchema, hexColor } from "~/lib/appearance";

const optionalWebUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    if (!value) return true;
    try {
      return ["http:", "https:"].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, "Bağlantı http:// veya https:// ile başlamalı.");

const optionalDateTime = z
  .union([z.literal(""), z.iso.datetime({ offset: true })])
  .nullable();

export const usernameInput = z.object({ username: z.string().min(1).max(64) });

export const themeInput = z.object({
  backgroundType: z.enum(["SOLID", "GRADIENT", "IMAGE", "VIDEO", "ANIMATED"]),
  backgroundValue: z.string().trim().max(2048),
  buttonStyle: z.enum(["SOLID", "OUTLINE", "GLASS", "SHADOW", "THREE_D"]),
  buttonShape: z.enum(["ROUNDED", "PILL", "SQUARE"]),
  buttonColor: hexColor,
  textColor: hexColor,
  accentColor: hexColor,
  fontFamily: z.enum(["MODERN", "FRIENDLY", "EDITORIAL", "MONO"]),
  showBranding: z.boolean(),
});

export const linkCustomizationSchema = z.object({
  buttonColor: hexColor.nullable().default(null),
  textColor: hexColor.nullable().default(null),
  fontFamily: z
    .enum([
      "inherit",
      "Manrope",
      "Fraunces",
      "Inter",
      "Montserrat",
      "Lora",
      "Roboto Mono",
    ])
    .default("inherit"),
  iconStyle: z.enum(["favicon", "mono", "hidden"]).default("favicon"),
});

export const workspaceLinkInput = z
  .object({
    id: z.uuid(),
    title: z.string().trim().min(1, "Başlık gerekli.").max(80),
    url: optionalWebUrl,
    iconUrl: optionalWebUrl.nullable(),
    enabled: z.boolean(),
    customization: linkCustomizationSchema,
    scheduledStart: optionalDateTime,
    scheduledEnd: optionalDateTime,
    passwordProtected: z.boolean(),
    embedType: z.enum(["LINK", "YOUTUBE", "SPOTIFY"]),
  })
  .superRefine((link, context) => {
    if (
      link.scheduledStart &&
      link.scheduledEnd &&
      new Date(link.scheduledStart) >= new Date(link.scheduledEnd)
    ) {
      context.addIssue({
        code: "custom",
        path: ["scheduledEnd"],
        message: "Bitiş zamanı başlangıçtan sonra olmalı.",
      });
    }
  });

export const workspaceInput = z.object({
  revision: z.number().int().nonnegative(),
  name: z.string().trim().min(1, "Görünen ad gerekli.").max(60),
  bio: z.string().trim().max(160),
  image: optionalWebUrl.nullable(),
  theme: themeInput,
  appearance: appearanceSchema,
  customCss: z.string().max(12_000),
  links: z.array(workspaceLinkInput).max(50),
});

export type WorkspaceInput = z.infer<typeof workspaceInput>;

export const registerIntentInput = z.object({
  email: z.email().trim().toLowerCase().max(254),
  username: z.string().min(1).max(64),
});

export const accountProfileInput = z.object({
  name: z.string().trim().min(1).max(60),
  bio: z.string().trim().max(160),
  image: optionalWebUrl.nullable(),
});

export const setLinkPasswordInput = z.object({
  linkId: z.uuid(),
  password: z
    .string()
    .min(6, "Parola en az 6 karakter olmalı.")
    .max(72)
    .nullable(),
});

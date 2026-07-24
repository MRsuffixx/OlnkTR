import { z } from "zod";

import { normalizeEmail } from "~/lib/email";

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

export type LinkCustomization = z.infer<typeof linkCustomizationSchema>;

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

export const workspaceInput = z
  .object({
    revision: z.number().int().nonnegative(),
    name: z.string().trim().min(1, "Görünen ad gerekli.").max(60),
    bio: z.string().trim().max(160),
    image: optionalWebUrl.nullable(),
    theme: themeInput,
    appearance: appearanceSchema,
    customCss: z.string().max(12_000),
    links: z.array(workspaceLinkInput).max(50),
  })
  .superRefine((workspace, context) => {
    const ids = new Set<string>();
    workspace.links.forEach((link, index) => {
      if (ids.has(link.id))
        context.addIssue({
          code: "custom",
          path: ["links", index, "id"],
          message: "Bağlantı kimlikleri benzersiz olmalıdır.",
        });
      ids.add(link.id);
    });
    if (JSON.stringify(workspace.appearance).length > 32_000)
      context.addIssue({
        code: "custom",
        path: ["appearance"],
        message: "Görünüm ayarları çok büyük.",
      });
  });

export type WorkspaceInput = z.infer<typeof workspaceInput>;

export const registerIntentInput = z.object({
  email: z.email().trim().max(254).transform(normalizeEmail),
  username: z.string().min(1).max(64),
});

export const accountProfileInput = z.object({
  revision: z.number().int().nonnegative(),
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

const adminReason = z.string().trim().min(3).max(500);
const adminPage = z.number().int().min(1).default(1);
const adminPageSize = z.number().int().min(10).max(100).default(25);

export const adminUserListInput = z.object({
  search: z.string().trim().max(100).default(""),
  role: z.enum(["ALL", "USER", "ADMIN"]).default("ALL"),
  accountStatus: z
    .enum(["ALL", "ACTIVE", "SUSPENDED", "BANNED"])
    .default("ALL"),
  plan: z.enum(["ALL", "FREE", "PRO", "MANUAL"]).default("ALL"),
  subscriptionStatus: z
    .enum([
      "ALL",
      "INCOMPLETE",
      "TRIALING",
      "ACTIVE",
      "PAST_DUE",
      "UNPAID",
      "CANCELED",
      "EXPIRED",
      "REFUNDED",
    ])
    .default("ALL"),
  signupFrom: z.iso.datetime({ offset: true }).nullable().default(null),
  signupTo: z.iso.datetime({ offset: true }).nullable().default(null),
  page: adminPage,
  pageSize: adminPageSize,
});

export const adminUserIdInput = z.object({ userId: z.cuid2() });

export const adminUpdateUserProfileInput = z.object({
  userId: z.cuid2(),
  name: z.string().trim().max(60).nullable(),
  bio: z.string().trim().max(160),
  image: optionalWebUrl.nullable(),
  reason: adminReason,
});

export const adminUpdateUsernameInput = z.object({
  userId: z.cuid2(),
  username: z.string().min(1).max(64),
  reason: adminReason,
});

export const adminWorkspaceInput = z.object({
  userId: z.cuid2(),
  workspace: workspaceInput,
  reason: adminReason,
});

export const adminAccountStatusInput = z
  .object({
    userId: z.cuid2(),
    status: z.enum(["ACTIVE", "SUSPENDED", "BANNED"]),
    reason: adminReason,
    expiresAt: z.iso.datetime({ offset: true }).nullable(),
    confirmation: z.string().trim().max(254),
  })
  .superRefine((input, context) => {
    if (input.status === "SUSPENDED" && !input.expiresAt)
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Geçici uzaklaştırma için bitiş zamanı gerekli.",
      });
    if (input.status !== "SUSPENDED" && input.expiresAt)
      context.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "Bu hesap durumu bir bitiş zamanı kullanamaz.",
      });
  });

export const adminGrantProInput = z.object({
  userId: z.cuid2(),
  expiresAt: z.iso.datetime({ offset: true }),
  reason: adminReason,
  confirmation: z.string().trim().max(254),
});

export const adminRevokeProInput = z.object({
  userId: z.cuid2(),
  reason: adminReason,
  confirmation: z.string().trim().max(254),
});

export const adminDeleteUserInput = z.object({
  userId: z.cuid2(),
  reason: adminReason,
  confirmation: z.string().trim().max(254),
});

export const adminSubscriptionListInput = z.object({
  search: z.string().trim().max(100).default(""),
  provider: z
    .enum(["ALL", "STRIPE", "IYZICO", "PAYTR", "ADYEN"])
    .default("ALL"),
  status: z
    .enum([
      "ALL",
      "INCOMPLETE",
      "TRIALING",
      "ACTIVE",
      "PAST_DUE",
      "UNPAID",
      "CANCELED",
      "EXPIRED",
      "REFUNDED",
    ])
    .default("ALL"),
  interval: z.enum(["ALL", "MONTHLY", "YEARLY"]).default("ALL"),
  page: adminPage,
  pageSize: adminPageSize,
});

export const adminSubscriptionActionInput = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("EXTEND"),
    subscriptionId: z.cuid2(),
    days: z.number().int().min(1).max(365),
    reason: adminReason,
    confirmation: z.literal("aboneliği uzat"),
  }),
  z.object({
    action: z.literal("CANCEL"),
    subscriptionId: z.cuid2(),
    reason: adminReason,
    confirmation: z.literal("aboneliği iptal et"),
  }),
]);

export const adminRefundFlagInput = z.object({
  invoiceId: z.cuid2(),
  flagged: z.boolean(),
  reason: adminReason,
  confirmation: z.literal("iade işaretini değiştir"),
});

export const adminAuditListInput = z.object({
  search: z.string().trim().max(100).default(""),
  category: z
    .enum(["ALL", "AUTHORIZATION", "USER", "CONTENT", "BILLING", "SECURITY"])
    .default("ALL"),
  outcome: z.enum(["ALL", "SUCCESS", "DENIED", "FAILURE"]).default("ALL"),
  page: adminPage,
  pageSize: adminPageSize,
});

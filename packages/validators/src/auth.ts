import { z } from "zod";

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 128;

export const emailSchema = z.email().max(254);
export const passwordSchema = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);

export const signInFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(PASSWORD_MAX),
});

export const signUpFormSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: emailSchema,
  password: passwordSchema,
});

export const forgotPasswordFormSchema = z.object({ email: emailSchema });

export const resetPasswordFormSchema = z.object({ password: passwordSchema });

export const twoFactorFormSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export const updatePreferencesInputSchema = z.object({
  locale: z.enum(["en", "tr"]).optional(),
  timezone: z.string().max(64).optional(),
  marketingEmails: z.boolean().optional(),
});

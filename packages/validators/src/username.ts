import { z } from "zod";

/**
 * Usernames share the URL namespace with application routes
 * (`olnk.tr/<username>`), so route names and sensitive words are reserved.
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set([
  "about",
  "account",
  "accounts",
  "admin",
  "administrator",
  "analytics",
  "api",
  "app",
  "apps",
  "assets",
  "auth",
  "billing",
  "blog",
  "callback",
  "cdn",
  "checkout",
  "contact",
  "dashboard",
  "dev",
  "docs",
  "edit",
  "email",
  "explore",
  "faq",
  "favicon.ico",
  "features",
  "forgot-password",
  "health",
  "help",
  "home",
  "invitations",
  "invite",
  "legal",
  "login",
  "logout",
  "mail",
  "media",
  "metrics",
  "new",
  "null",
  "oauth",
  "olnk",
  "olnktr",
  "onboarding",
  "org",
  "organization",
  "organizations",
  "orgs",
  "pricing",
  "privacy",
  "profile",
  "profiles",
  "public",
  "register",
  "reset-password",
  "robots.txt",
  "root",
  "search",
  "security",
  "settings",
  "signin",
  "sign-in",
  "signup",
  "sign-up",
  "sitemap.xml",
  "static",
  "status",
  "support",
  "system",
  "team",
  "teams",
  "terms",
  "test",
  "trpc",
  "two-factor",
  "undefined",
  "user",
  "users",
  "verify",
  "verify-email",
  "webhook",
  "webhooks",
  "www",
]);

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 30;
const USERNAME_PATTERN = /^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/;

/** Canonical form used for storage and lookups. */
export function normalizeUsername(raw: string): string {
  return raw.normalize("NFKC").trim().toLowerCase();
}

export type UsernameProblem = "too_short" | "too_long" | "invalid_characters" | "reserved";

export function getUsernameProblem(normalized: string): UsernameProblem | null {
  if (normalized.length < USERNAME_MIN) return "too_short";
  if (normalized.length > USERNAME_MAX) return "too_long";
  if (!USERNAME_PATTERN.test(normalized) || /[._-]{2}/.test(normalized)) {
    return "invalid_characters";
  }
  if (RESERVED_USERNAMES.has(normalized)) return "reserved";
  return null;
}

export const usernameSchema = z
  .string()
  .max(64)
  .transform(normalizeUsername)
  .superRefine((value, ctx) => {
    const problem = getUsernameProblem(value);
    if (problem) ctx.addIssue({ code: "custom", message: `username.${problem}` });
  });

/** Organization slugs follow the same character rules in their own namespace. */
export const organizationSlugSchema = usernameSchema;

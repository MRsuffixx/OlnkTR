import { USERNAME_POLICY } from "~/config/username-policy";
import { db } from "~/server/db";

const LEET_MAP: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "8": "b",
  "9": "g",
  "@": "a",
  $: "s",
};

export type UsernameValidation =
  | { ok: true; username: string; normalized: string }
  | { ok: false; reason: "format" | "policy" };

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

export function normalizeForModeration(value: string) {
  return normalizeUsername(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ç]/g, "c")
    .replace(/[ğ]/g, "g")
    .replace(/[ı]/g, "i")
    .replace(/[ö]/g, "o")
    .replace(/[ş]/g, "s")
    .replace(/[ü]/g, "u")
    .split("")
    .map((character) => LEET_MAP[character] ?? character)
    .join("")
    .replace(/[^a-z0-9]/g, "")
    .replace(/(.)\1{2,}/g, "$1");
}

export function validateUsernameFormat(value: string): UsernameValidation {
  const username = normalizeUsername(value);
  const { minLength, maxLength } = USERNAME_POLICY;

  if (
    username.length < minLength ||
    username.length > maxLength ||
    !/^[a-z][a-z0-9._-]*$/.test(username) ||
    /[._-]{2}/.test(username) ||
    /[._-]$/.test(username)
  ) {
    return { ok: false, reason: "format" };
  }

  return { ok: true, username, normalized: username };
}

export async function validateUsernamePolicy(
  value: string,
): Promise<UsernameValidation> {
  const formatted = validateUsernameFormat(value);
  if (!formatted.ok) return formatted;

  const moderationValue = normalizeForModeration(formatted.normalized);
  const reserved = new Set(
    USERNAME_POLICY.reserved.map((term) => normalizeForModeration(term)),
  );

  if (reserved.has(moderationValue)) {
    return { ok: false, reason: "policy" };
  }

  const databaseTerms = await db.usernameBlocklist.findMany({
    where: { enabled: true },
    select: { termNormalized: true },
  });
  const terms = [
    ...USERNAME_POLICY.defaultBlockedTerms,
    ...databaseTerms.map((entry) => entry.termNormalized),
  ].map(normalizeForModeration);

  if (terms.some((term) => term.length > 0 && moderationValue.includes(term))) {
    return { ok: false, reason: "policy" };
  }

  return formatted;
}

export async function isUsernameAvailable(
  value: string,
  excludeUserId?: string,
) {
  const validation = await validateUsernamePolicy(value);
  if (!validation.ok) return { available: false as const, validation };

  const user = await db.user.findFirst({
    where: {
      usernameNormalized: validation.normalized,
      ...(excludeUserId ? { NOT: { id: excludeUserId } } : {}),
    },
    select: { id: true },
  });

  return {
    available: !user,
    validation,
  } as const;
}

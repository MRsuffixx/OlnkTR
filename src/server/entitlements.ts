import "server-only";

import type { Subscription } from "../../generated/prisma/client";
import {
  CAPABILITY_CATALOG,
  FEATURE_CATALOG,
  type AppearanceFeature,
  type AppearanceFeaturePath,
  type CapabilityKey,
} from "~/config/feature-catalog";
import {
  DEFAULT_APPEARANCE,
  parseAppearance,
  type AppearanceSettings,
} from "~/lib/appearance";
import { db } from "~/server/db";

const ENTITLED_STATUSES = new Set([
  "ACTIVE",
  "TRIALING",
  "PAST_DUE",
  "CANCELED",
]);

export function hasProAccess(
  subscription:
    | Pick<Subscription, "plan" | "status" | "currentPeriodEnd">
    | null
    | undefined,
  now = new Date(),
) {
  if (
    subscription?.plan !== "PRO" ||
    !ENTITLED_STATUSES.has(subscription.status)
  )
    return false;
  return Boolean(
    subscription.currentPeriodEnd && subscription.currentPeriodEnd > now,
  );
}

export async function getUserEntitlements(userId: string) {
  const subscription = await db.subscription.findUnique({ where: { userId } });
  const pro = hasProAccess(subscription);
  return {
    plan: pro ? ("pro" as const) : ("free" as const),
    pro,
    subscription,
  };
}

export function canUseFeature(pro: boolean, feature: CapabilityKey) {
  return CAPABILITY_CATALOG[feature].tier === "free" || pro;
}

function getAtPath(
  value: AppearanceSettings,
  path: AppearanceFeaturePath,
): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (current, key) =>
        current && typeof current === "object"
          ? (current as Record<string, unknown>)[key]
          : undefined,
      value,
    );
}

function setAtPath(
  value: AppearanceSettings,
  path: AppearanceFeaturePath,
  next: unknown,
) {
  const keys = path.split(".");
  let current = value as unknown as Record<string, unknown>;
  keys.slice(0, -1).forEach((key) => {
    current = current[key] as Record<string, unknown>;
  });
  current[keys.at(-1)!] = structuredClone(next);
}

export function isAppearanceValueAllowed(
  path: AppearanceFeaturePath,
  value: unknown,
  pro: boolean,
) {
  if (pro) return true;
  const feature = FEATURE_CATALOG[path];
  if (feature.tier === "pro") return false;
  return !(feature as AppearanceFeature).proValues?.some(
    (candidate: unknown) => candidate === value,
  );
}

export function resolveAppearanceForPlan(raw: unknown, pro: boolean) {
  const effective = parseAppearance(raw);
  const lockedPaths: AppearanceFeaturePath[] = [];
  if (pro) return { raw: effective, effective, lockedPaths };

  for (const path of Object.keys(FEATURE_CATALOG) as AppearanceFeaturePath[]) {
    const value = getAtPath(effective, path);
    if (!isAppearanceValueAllowed(path, value, false)) {
      setAtPath(effective, path, FEATURE_CATALOG[path].fallback);
      lockedPaths.push(path);
    }
  }
  return { raw: parseAppearance(raw), effective, lockedPaths };
}

export function mergePermittedAppearance(
  incoming: unknown,
  stored: unknown,
  pro: boolean,
) {
  const next = parseAppearance(incoming);
  if (pro) return next;
  const previous = parseAppearance(stored ?? DEFAULT_APPEARANCE);
  for (const path of Object.keys(FEATURE_CATALOG) as AppearanceFeaturePath[]) {
    const value = getAtPath(next, path);
    const previousValue = getAtPath(previous, path);
    if (
      !isAppearanceValueAllowed(path, value, false) ||
      !isAppearanceValueAllowed(path, previousValue, false)
    )
      setAtPath(next, path, previousValue);
  }
  return next;
}

import { and, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "../client";
import { systemSettings } from "../schema/admin";
import { planPrices, plans } from "../schema/billing";
import { themes, themeVersions } from "../schema/themes";
import { LEGACY_THEME_KEYS, SEED_PLANS, SEED_SETTINGS, SEED_THEMES } from "./data";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object")
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  return JSON.stringify(value);
}

/** Idempotent: inserts missing plans/settings (never overwrites them) and syncs system themes. */
export async function seed(db: Database) {
  return db.transaction(async (tx) => {
    let plansCreated = 0;
    let themesCreated = 0;

    for (const plan of SEED_PLANS) {
      const [inserted] = await tx
        .insert(plans)
        .values({
          key: plan.key,
          name: plan.name,
          description: plan.description,
          isDefault: plan.isDefault,
          sortOrder: plan.sortOrder,
          trialDays: plan.trialDays,
          entitlements: plan.entitlements,
        })
        .onConflictDoNothing({ target: plans.key })
        .returning({ id: plans.id });
      if (!inserted) continue;
      plansCreated++;
      if (plan.prices.length > 0) {
        await tx
          .insert(planPrices)
          .values(plan.prices.map((price) => ({ ...price, planId: inserted.id })))
          .onConflictDoNothing();
      }
    }

    // System themes are owned by code: new presets are inserted, changed
    // presets get a new immutable version (pinned profiles keep theirs) and
    // catalogue metadata follows the code.
    let themesUpdated = 0;
    for (const theme of SEED_THEMES) {
      const metadata = {
        name: theme.name,
        description: theme.description,
        isPremium: theme.isPremium,
        category: theme.category,
        author: theme.author,
        visibility: "public",
        status: "active",
      };
      const [existing] = await tx
        .select()
        .from(themes)
        .where(eq(themes.key, theme.key))
        .for("update");
      if (!existing) {
        const [inserted] = await tx
          .insert(themes)
          .values({ key: theme.key, ...metadata, latestVersion: 1 })
          .returning({ id: themes.id });
        await tx
          .insert(themeVersions)
          .values({ themeId: inserted!.id, version: 1, config: theme.config });
        themesCreated++;
        continue;
      }
      const [latest] = await tx
        .select({ config: themeVersions.config })
        .from(themeVersions)
        .where(
          and(
            eq(themeVersions.themeId, existing.id),
            eq(themeVersions.version, existing.latestVersion),
          ),
        );
      const changed = stableStringify(latest?.config) !== stableStringify(theme.config);
      const version = changed ? existing.latestVersion + 1 : existing.latestVersion;
      if (changed) {
        await tx
          .insert(themeVersions)
          .values({ themeId: existing.id, version, config: theme.config });
        themesUpdated++;
      }
      await tx
        .update(themes)
        .set({ ...metadata, latestVersion: version })
        .where(eq(themes.id, existing.id));
    }
    await tx
      .update(themes)
      .set({ status: "archived" })
      .where(inArray(themes.key, [...LEGACY_THEME_KEYS]));

    for (const [key, value] of Object.entries(SEED_SETTINGS)) {
      await tx
        .insert(systemSettings)
        .values({ key, value: sql`${JSON.stringify(value)}::jsonb` })
        .onConflictDoNothing();
    }

    return { plansCreated, themesCreated, themesUpdated };
  });
}

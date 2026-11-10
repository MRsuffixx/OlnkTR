import { sql } from "drizzle-orm";
import type { Database } from "../client";
import { systemSettings } from "../schema/admin";
import { planPrices, plans } from "../schema/billing";
import { themes, themeVersions } from "../schema/themes";
import { SEED_PLANS, SEED_SETTINGS, SEED_THEMES } from "./data";

/** Idempotent: inserts missing catalogue rows, never overwrites existing ones. */
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

    for (const theme of SEED_THEMES) {
      const [inserted] = await tx
        .insert(themes)
        .values({
          key: theme.key,
          name: theme.name,
          description: theme.description,
          isPremium: theme.isPremium,
          visibility: "public",
          latestVersion: 1,
        })
        .onConflictDoNothing({ target: themes.key })
        .returning({ id: themes.id });
      if (!inserted) continue;
      themesCreated++;
      await tx
        .insert(themeVersions)
        .values({ themeId: inserted.id, version: 1, config: theme.config });
    }

    for (const [key, value] of Object.entries(SEED_SETTINGS)) {
      await tx
        .insert(systemSettings)
        .values({ key, value: sql`${JSON.stringify(value)}::jsonb` })
        .onConflictDoNothing();
    }

    return { plansCreated, themesCreated };
  });
}

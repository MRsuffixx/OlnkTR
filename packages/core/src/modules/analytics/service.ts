import { getAnalyticsSummary } from "@olnktr/analytics";
import { errors, type Actor } from "@olnktr/types";
import { profileOwner, type AccessService } from "../access/index";
import type { CoreDeps } from "../../shared/deps";

/**
 * Authorized analytics read model. The owner's plan decides the detail level
 * (`analytics.level`) and how far back data can be queried
 * (`analytics.history_days`).
 */
export function createProfileAnalyticsService(deps: CoreDeps & { access: AccessService }) {
  return {
    async summary(actor: Actor, input: { profileId: string; from: string; to: string }) {
      const profile = await deps.access.authorizeProfile(actor, input.profileId, "analytics:read");
      if (input.from > input.to) throw errors.badRequest("`from` must not be after `to`");
      const entitlements = (await deps.entitlements.resolve(profileOwner(profile))).entitlements;
      const historyDays = entitlements["analytics.history_days"];
      const earliest =
        historyDays === null
          ? input.from
          : new Date(deps.clock.now().getTime() - historyDays * 86_400_000)
              .toISOString()
              .slice(0, 10);
      const from = input.from < earliest ? earliest : input.from;
      const summary = await getAnalyticsSummary(deps.db, {
        profileId: profile.id,
        from,
        to: input.to,
        level: entitlements["analytics.level"],
      });
      return {
        ...summary,
        level: entitlements["analytics.level"],
        clampedFrom: from !== input.from,
      };
    },
  };
}

export type ProfileAnalyticsService = ReturnType<typeof createProfileAnalyticsService>;

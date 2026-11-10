"use client";

import { useEffect } from "react";

/**
 * Fire-and-forget profile view event. Uses sendBeacon so it never blocks
 * rendering or navigation; respects Do Not Track / Global Privacy Control.
 */
export function AnalyticsBeacon({ profileId }: { profileId: string }) {
  useEffect(() => {
    const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
    if (nav.doNotTrack === "1" || nav.globalPrivacyControl) return;
    const params = new URLSearchParams(window.location.search);
    const utm = Object.fromEntries(
      (["source", "medium", "campaign", "term", "content"] as const)
        .map((key) => [key, params.get(`utm_${key}`)?.slice(0, 200)] as const)
        .filter((entry): entry is readonly [(typeof entry)[0], string] => Boolean(entry[1])),
    );
    const payload = JSON.stringify({
      type: "profile.view",
      profileId,
      referrer: document.referrer || undefined,
      utm: Object.keys(utm).length ? utm : undefined,
    });
    const url = "/api/v1/analytics/events";
    if (!navigator.sendBeacon?.(url, payload)) {
      void fetch(url, { method: "POST", body: payload, keepalive: true }).catch(() => undefined);
    }
  }, [profileId]);
  return null;
}

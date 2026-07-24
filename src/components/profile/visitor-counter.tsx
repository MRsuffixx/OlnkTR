"use client";

import { useEffect, useState } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

type SocialProof = AppearanceSettings["socialProof"];

function defaultLabel(metric: SocialProof["metric"]) {
  if (metric === "today") return "bugün ziyaret";
  if (metric === "live") return "son 5 dakikada";
  return "toplam ziyaret";
}

export function VisitorCounter({
  username,
  initialCount,
  settings,
}: {
  username: string;
  initialCount: number;
  settings: SocialProof;
}) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    if (settings.metric !== "live") return;
    let active = true;
    const refresh = async () => {
      if (document.visibilityState !== "visible") return;
      try {
        const response = await fetch(
          `/api/profiles/${encodeURIComponent(username)}/visits`,
          { cache: "no-store" },
        );
        if (!response.ok) return;
        const payload = (await response.json()) as { count?: unknown };
        if (active && typeof payload.count === "number")
          setCount(payload.count);
      } catch {
        // The last honest server count remains visible when polling fails.
      }
    };
    const interval = window.setInterval(() => void refresh(), 30_000);
    const onVisibility = () => void refresh();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      active = false;
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [settings.metric, username]);

  const label = settings.label || defaultLabel(settings.metric);
  return (
    <p
      className={
        settings.style === "pill"
          ? "mt-4 rounded-full border border-current/15 bg-white/35 px-3 py-1.5 text-xs font-bold backdrop-blur"
          : settings.style === "retro"
            ? "mt-4 rounded-md border-2 border-current bg-black/80 px-3 py-2 font-mono text-xs font-black tracking-[0.16em] text-green-300 shadow-[inset_0_0_14px_rgba(74,222,128,.25)]"
            : "mt-4 text-xs font-bold opacity-65"
      }
      aria-live={settings.metric === "live" ? "polite" : "off"}
    >
      <span className="tabular-nums">{count.toLocaleString("tr-TR")}</span>{" "}
      {label}
    </p>
  );
}

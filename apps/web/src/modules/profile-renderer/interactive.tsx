"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

/** Live countdown; renders a stable server snapshot and ticks after hydration. */
export function CountdownClock({ targetAt, endedText }: { targetAt: string; endedText: string }) {
  const t = useTranslations("renderer");
  const target = Date.parse(targetAt);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  if (Number.isNaN(target)) return null;
  const remaining = Math.max(0, target - (now ?? target));
  if (now !== null && remaining === 0)
    return <p className="op-card-text">{endedText || t("countdownEnded")}</p>;
  const parts = [
    [Math.floor(remaining / 86_400_000), t("days")],
    [Math.floor(remaining / 3_600_000) % 24, t("hours")],
    [Math.floor(remaining / 60_000) % 60, t("minutes")],
    [Math.floor(remaining / 1000) % 60, t("seconds")],
  ] as const;
  return (
    <div className="op-countdown" role="timer" aria-live="off">
      {parts.map(([value, label]) => (
        <div key={label} className="op-countdown-cell">
          <span className="op-countdown-value">
            {now === null ? "–" : String(value).padStart(2, "0")}
          </span>
          <span className="op-countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Loads the Google Maps embed only after the visitor asks for it (no third-party request before). */
export function MapEmbed({
  address,
  zoom,
  interactive,
}: {
  address: string;
  zoom: number;
  interactive: boolean;
}) {
  const t = useTranslations("renderer");
  const [visible, setVisible] = useState(false);
  if (!visible || !interactive) {
    return (
      <button
        type="button"
        className="op-cta"
        onClick={() => setVisible(true)}
        disabled={!interactive}
      >
        {t("showMap")}
      </button>
    );
  }
  const params = new URLSearchParams({ q: address, z: String(zoom), output: "embed" });
  return (
    <iframe
      className="op-map"
      title={t("mapOf", { address })}
      src={`https://www.google.com/maps?${params.toString()}`}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}

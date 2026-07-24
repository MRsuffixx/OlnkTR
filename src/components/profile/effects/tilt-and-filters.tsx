"use client";

import { useEffect, useRef } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

type Effects = AppearanceSettings["effects"];

export default function TiltAndFilters({ effects }: { effects: Effects }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      effects.cardTilt === "off" ||
      !window.matchMedia(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const profile = root.current?.closest("[data-olnk-profile]");
    if (!profile) return;
    const selector =
      effects.cardTilt === "links"
        ? '[data-olnk-tilt="link"]'
        : '[data-olnk-tilt="profile"]';
    const elements = Array.from(
      profile.querySelectorAll<HTMLElement>(selector),
    );
    let frame = 0;
    const cleanups = elements.map((element) => {
      const move = (event: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const box = element.getBoundingClientRect();
          const x = (event.clientX - box.left) / box.width - 0.5;
          const y = (event.clientY - box.top) / box.height - 0.5;
          element.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateZ(0)`;
        });
      };
      const leave = () => {
        element.style.transform = "";
      };
      element.addEventListener("pointermove", move, { passive: true });
      element.addEventListener("pointerleave", leave);
      return () => {
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerleave", leave);
        element.style.transform = "";
      };
    });
    return () => {
      cancelAnimationFrame(frame);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, [effects.cardTilt]);

  return (
    <div ref={root} aria-hidden>
      {effects.crtFilter && <div className="olnk-crt-overlay" />}
      {effects.scanlines && <div className="olnk-scanlines-overlay" />}
      {effects.glitch && <div className="olnk-glitch-overlay" />}
    </div>
  );
}

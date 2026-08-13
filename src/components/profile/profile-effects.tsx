"use client";

import { useEffect, useRef } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

function restartAnimation(element: HTMLElement) {
  element.style.animation = "none";
  void element.offsetWidth;
  element.style.animation = "";
}

export function ProfileEffects({
  effects,
  color,
}: {
  effects: AppearanceSettings["effects"];
  color: string;
}) {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const enabled = window.matchMedia(
      "(pointer: fine) and (prefers-reduced-motion: no-preference)",
    ).matches;
    if (!enabled) return;
    const profile = cursor.current?.closest("[data-olnk-profile]");
    if (effects.cursor !== "default")
      profile?.classList.add("olnk-hide-cursor");

    const trail =
      effects.trail === "none"
        ? []
        : Array.from({ length: 16 }, () => {
            const particle = document.createElement("span");
            particle.className = `olnk-cursor-trail olnk-cursor-trail--${effects.trail}`;
            particle.style.background = color;
            particle.style.opacity = "0";
            document.body.append(particle);
            return particle;
          });
    const ripples = effects.clickRipple
      ? Array.from({ length: 4 }, () => {
          const ripple = document.createElement("span");
          ripple.className = "olnk-click-ripple";
          ripple.style.borderColor = color;
          ripple.style.opacity = "0";
          document.body.append(ripple);
          return ripple;
        })
      : [];
    let trailIndex = 0;
    let rippleIndex = 0;
    let lastTrailAt = 0;
    function pointer(event: PointerEvent) {
      if (cursor.current)
        cursor.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (!trail.length || event.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - lastTrailAt < 40) return;
      lastTrailAt = now;
      const particle = trail[trailIndex++ % trail.length]!;
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.opacity = "1";
      restartAnimation(particle);
    }
    function click(event: MouseEvent) {
      if (!ripples.length) return;
      const ripple = ripples[rippleIndex++ % ripples.length]!;
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      ripple.style.opacity = "1";
      restartAnimation(ripple);
    }
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("click", click, { passive: true });
    return () => {
      profile?.classList.remove("olnk-hide-cursor");
      window.removeEventListener("pointermove", pointer);
      window.removeEventListener("click", click);
      [...trail, ...ripples].forEach((element) => element.remove());
    };
  }, [color, effects.clickRipple, effects.cursor, effects.trail]);
  if (effects.cursor === "default") return null;
  return (
    <div
      ref={cursor}
      className={`olnk-custom-cursor olnk-custom-cursor--${effects.cursor}`}
      style={{
        color,
        borderColor: color,
        backgroundColor: effects.cursor === "dot" ? color : undefined,
      }}
      aria-hidden
    />
  );
}

"use client";

import { useEffect, useRef } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

export function ProfileEffects({ effects }: { effects: AppearanceSettings["effects"] }) {
  const cursor = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    function pointer(event: PointerEvent) {
      if (cursor.current) cursor.current.style.transform = `translate3d(${event.clientX}px,${event.clientY}px,0)`;
      if (effects.trail === "none" || event.pointerType !== "mouse") return;
      const particle = document.createElement("span");
      particle.className = `olnk-cursor-trail olnk-cursor-trail--${effects.trail}`;
      particle.style.left = `${event.clientX}px`;
      particle.style.top = `${event.clientY}px`;
      particle.style.background = effects.cursorColor;
      document.body.append(particle);
      window.setTimeout(() => particle.remove(), 650);
    }
    function click(event: MouseEvent) {
      if (!effects.clickRipple) return;
      const ripple = document.createElement("span");
      ripple.className = "olnk-click-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      ripple.style.borderColor = effects.cursorColor;
      document.body.append(ripple);
      window.setTimeout(() => ripple.remove(), 700);
    }
    window.addEventListener("pointermove", pointer, { passive: true });
    window.addEventListener("click", click, { passive: true });
    return () => { window.removeEventListener("pointermove", pointer); window.removeEventListener("click", click); };
  }, [effects.clickRipple, effects.cursorColor, effects.trail]);
  if (effects.cursor === "default") return null;
  return <div ref={cursor} className={`olnk-custom-cursor olnk-custom-cursor--${effects.cursor}`} style={{ color: effects.cursorColor, borderColor: effects.cursorColor, backgroundColor: effects.cursor === "dot" ? effects.cursorColor : undefined }} aria-hidden />;
}

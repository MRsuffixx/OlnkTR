"use client";

import { useEffect, useRef } from "react";

export default function MatrixRain({
  intensity,
}: {
  intensity: "subtle" | "intense";
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;
    const characters = "01OLNKTRアイウエオカキクケコ";
    const fontSize = intensity === "intense" ? 15 : 19;
    const frameInterval = intensity === "intense" ? 55 : 95;
    let drops: number[] = [];
    let frame = 0;
    let previous = 0;
    let visible = document.visibilityState === "visible";

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(window.innerWidth * ratio);
      element.height = Math.round(window.innerHeight * ratio);
      element.style.width = `${window.innerWidth}px`;
      element.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      drops = Array.from(
        { length: Math.ceil(window.innerWidth / fontSize) },
        () => Math.floor(Math.random() * -30),
      );
    };
    const draw = (timestamp: number) => {
      if (timestamp - previous >= frameInterval) {
        previous = timestamp;
        context.fillStyle =
          intensity === "intense"
            ? "rgba(3, 10, 6, .13)"
            : "rgba(3, 10, 6, .2)";
        context.fillRect(0, 0, window.innerWidth, window.innerHeight);
        context.font = `${fontSize}px monospace`;
        context.fillStyle =
          intensity === "intense"
            ? "rgba(74, 222, 128, .72)"
            : "rgba(74, 222, 128, .4)";
        drops.forEach((drop, index) => {
          const character =
            characters[Math.floor(Math.random() * characters.length)] ?? "0";
          context.fillText(character, index * fontSize, drop * fontSize);
          if (
            drop * fontSize > window.innerHeight &&
            Math.random() > (intensity === "intense" ? 0.94 : 0.975)
          )
            drops[index] = 0;
          else drops[index] = drop + 1;
        });
      }
      if (visible) frame = requestAnimationFrame(draw);
    };
    const visibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvas}
      className="pointer-events-none absolute inset-0 z-0 opacity-80"
      aria-hidden
    />
  );
}

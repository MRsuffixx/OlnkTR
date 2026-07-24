"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
};

export default function MouseParticles({
  intensity,
  color,
}: {
  intensity: "subtle" | "intense";
  color: string;
}) {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (
      !window.matchMedia(
        "(pointer: fine) and (prefers-reduced-motion: no-preference)",
      ).matches
    )
      return;
    const element = canvas.current;
    const context = element?.getContext("2d");
    if (!element || !context) return;

    const particles: Particle[] = [];
    const cap = intensity === "intense" ? 48 : 22;
    const spawnEvery = intensity === "intense" ? 18 : 42;
    let lastSpawn = 0;
    let frame = 0;
    let visible = document.visibilityState === "visible";
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      element.width = Math.round(window.innerWidth * ratio);
      element.height = Math.round(window.innerHeight * ratio);
      element.style.width = `${window.innerWidth}px`;
      element.style.height = `${window.innerHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const pointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const now = performance.now();
      if (now - lastSpawn < spawnEvery || particles.length >= cap) return;
      lastSpawn = now;
      particles.push({
        x: event.clientX,
        y: event.clientY,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.4 - Math.random() * 0.7,
        life: 1,
        size: 2 + Math.random() * 3,
      });
    };
    const visibility = () => {
      visible = document.visibilityState === "visible";
      if (visible) frame = requestAnimationFrame(draw);
      else cancelAnimationFrame(frame);
    };
    const draw = () => {
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const particle = particles[index];
        if (!particle) continue;
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life -= 0.018;
        if (particle.life <= 0) {
          particles.splice(index, 1);
          continue;
        }
        context.globalAlpha = Math.max(0, particle.life);
        context.fillStyle = color;
        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * particle.life,
          0,
          Math.PI * 2,
        );
        context.fill();
      }
      context.globalAlpha = 1;
      if (visible) frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("pointermove", pointer, { passive: true });
    document.addEventListener("visibilitychange", visibility);
    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", pointer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [color, intensity]);

  return (
    <canvas
      ref={canvas}
      className="pointer-events-none fixed inset-0 z-20"
      aria-hidden
    />
  );
}

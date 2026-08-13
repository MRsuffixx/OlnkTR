"use client";

import { useEffect, useRef, type CSSProperties } from "react";

export function ProfileBackgroundVideo({
  src,
  fit = "cover",
  position = "center",
  style,
}: {
  src: string;
  fit?: "cover" | "contain";
  position?: "center" | "top" | "bottom" | "left" | "right";
  style?: CSSProperties;
}) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (preference.matches) video.current?.pause();
      else void video.current?.play().catch(() => undefined);
    };
    sync();
    preference.addEventListener("change", sync);
    return () => preference.removeEventListener("change", sync);
  }, []);
  return (
    <video
      ref={video}
      src={src}
      muted
      loop
      playsInline
      preload="metadata"
      className="pointer-events-none absolute inset-0 size-full"
      style={{ ...style, objectFit: fit, objectPosition: position }}
      aria-hidden="true"
      tabIndex={-1}
    />
  );
}

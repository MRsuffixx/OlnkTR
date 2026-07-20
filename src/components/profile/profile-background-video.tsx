"use client";

import { useEffect, useRef } from "react";

export function ProfileBackgroundVideo({ src }: { src: string }) {
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
      controls
      controlsList="nodownload noremoteplayback"
      className="absolute inset-0 size-full object-cover"
      aria-label="Profil arka plan videosu"
    />
  );
}

"use client";

import { lazy, Suspense } from "react";

import type { AppearanceSettings } from "~/lib/appearance";

const MouseParticles = lazy(() => import("./effects/mouse-particles"));
const MatrixRain = lazy(() => import("./effects/matrix-rain"));
const TiltAndFilters = lazy(() => import("./effects/tilt-and-filters"));

export function ProfileAmbientEffects({
  effects,
}: {
  effects: AppearanceSettings["effects"];
}) {
  const filtersEnabled =
    effects.cardTilt !== "off" ||
    effects.crtFilter ||
    effects.glitch ||
    effects.scanlines;
  if (
    effects.mouseParticles === "off" &&
    effects.matrixRain === "off" &&
    !filtersEnabled
  )
    return null;

  return (
    <Suspense fallback={null}>
      {effects.mouseParticles !== "off" && (
        <MouseParticles
          intensity={effects.mouseParticles}
          color={effects.cursorColor}
        />
      )}
      {effects.matrixRain !== "off" && (
        <MatrixRain intensity={effects.matrixRain} />
      )}
      {filtersEnabled && <TiltAndFilters effects={effects} />}
    </Suspense>
  );
}

"use client";

import { lazy, type ComponentType } from "react";

import type { AppearanceFeaturePath } from "~/config/feature-catalog";
import type { AppearanceSettings } from "~/lib/appearance";

const MouseParticles = lazy(() => import("./mouse-particles"));
const MatrixRain = lazy(() => import("./matrix-rain"));
const TiltAndFilters = lazy(() => import("./tilt-and-filters"));

export type ProfileEffectContext = {
  effects: AppearanceSettings["effects"];
  particleColor: string;
};

type EffectPlugin = {
  id: "mouse-particles" | "matrix-rain" | "tilt-and-filters";
  label: string;
  featurePaths: readonly AppearanceFeaturePath[];
  performanceCost: "low" | "medium" | "high";
  enabled: (context: ProfileEffectContext) => boolean;
  Renderer: ComponentType<ProfileEffectContext>;
};

function MouseParticlesRenderer({
  effects,
  particleColor,
}: ProfileEffectContext) {
  if (effects.mouseParticles === "off") return null;
  return (
    <MouseParticles intensity={effects.mouseParticles} color={particleColor} />
  );
}

function MatrixRainRenderer({ effects }: ProfileEffectContext) {
  if (effects.matrixRain === "off") return null;
  return <MatrixRain intensity={effects.matrixRain} />;
}

function FiltersRenderer({ effects }: ProfileEffectContext) {
  return <TiltAndFilters effects={effects} />;
}

export const PROFILE_EFFECT_REGISTRY = [
  {
    id: "mouse-particles",
    label: "Fare parçacıkları",
    featurePaths: ["effects.mouseParticles"],
    performanceCost: "high",
    enabled: ({ effects }) => effects.mouseParticles !== "off",
    Renderer: MouseParticlesRenderer,
  },
  {
    id: "matrix-rain",
    label: "Matrix yağmuru",
    featurePaths: ["effects.matrixRain"],
    performanceCost: "high",
    enabled: ({ effects }) => effects.matrixRain !== "off",
    Renderer: MatrixRainRenderer,
  },
  {
    id: "tilt-and-filters",
    label: "Eğim ve ekran filtreleri",
    featurePaths: [
      "effects.cardTilt",
      "effects.crtFilter",
      "effects.glitch",
      "effects.scanlines",
    ],
    performanceCost: "medium",
    enabled: ({ effects }) =>
      effects.cardTilt !== "off" ||
      effects.crtFilter ||
      effects.glitch ||
      effects.scanlines,
    Renderer: FiltersRenderer,
  },
] as const satisfies readonly EffectPlugin[];

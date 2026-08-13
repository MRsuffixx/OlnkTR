"use client";

import { Component, Suspense, type ReactNode } from "react";

import {
  PROFILE_EFFECT_REGISTRY,
  type ProfileEffectContext,
} from "~/components/profile/effects/effect-registry";
import type { AppearanceSettings } from "~/lib/appearance";

class AmbientEffectBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function ProfileAmbientEffects({
  effects,
  particleColor,
}: {
  effects: AppearanceSettings["effects"];
  particleColor: string;
}) {
  const context: ProfileEffectContext = { effects, particleColor };
  const active = PROFILE_EFFECT_REGISTRY.filter((plugin) =>
    plugin.enabled(context),
  );
  if (!active.length) return null;

  return (
    <Suspense fallback={null}>
      {active.map(({ id, Renderer }) => (
        <AmbientEffectBoundary key={id}>
          <Renderer {...context} />
        </AmbientEffectBoundary>
      ))}
    </Suspense>
  );
}

import {
  THEME_SECTIONS,
  type BlockAppearance,
  type ThemeConfig,
  type ThemeOverrides,
  type ThemeSection,
} from "./schema";

/**
 * Theme inheritance.
 *
 *   1. base theme           (system preset or the owner's saved custom theme)
 *   2. profile overrides    (stored with the profile; edited in the studio)
 *   3. block appearance     (per block; see `resolveBlockAppearance`)
 *
 * A custom theme is itself a complete config (base + the owner's overrides
 * flattened when saved), so layer 1 already covers "user theme overrides".
 * Later layers win key by key; `background` is replaced as a whole because
 * its fields depend on its type. Removing an override key restores the value
 * inherited from the layer below.
 */
export function applyThemeOverrides(base: ThemeConfig, ...layers: ThemeOverrides[]): ThemeConfig {
  const result = structuredClone(base);
  for (const layer of layers) {
    for (const section of THEME_SECTIONS) {
      const value = layer[section];
      if (value === undefined) continue;
      if (section === "background") {
        result.background = structuredClone(value as ThemeConfig["background"]);
      } else {
        Object.assign(result[section], value);
      }
    }
  }
  return result;
}

/** True when the overrides contain no keys at all. */
export function isEmptyOverrides(overrides: ThemeOverrides): boolean {
  return THEME_SECTIONS.every((section) => {
    const value = overrides[section];
    return value === undefined || (section !== "background" && Object.keys(value).length === 0);
  });
}

/** Removes one override (`section` or `section.key`), returning a new object. */
export function resetThemeOverride(
  overrides: ThemeOverrides,
  section: ThemeSection,
  key?: string,
): ThemeOverrides {
  const next = structuredClone(overrides) as Record<string, Record<string, unknown> | undefined>;
  if (!key || section === "background") {
    delete next[section];
  } else if (next[section]) {
    delete next[section][key];
    if (Object.keys(next[section]).length === 0) delete next[section];
  }
  return next as ThemeOverrides;
}

/** Sets one override value, returning a new object. */
export function setThemeOverride<S extends Exclude<ThemeSection, "background">>(
  overrides: ThemeOverrides,
  section: S,
  key: keyof ThemeConfig[S],
  value: ThemeConfig[S][keyof ThemeConfig[S]],
): ThemeOverrides {
  const next = structuredClone(overrides) as Record<string, Record<string, unknown> | undefined>;
  next[section] = { ...(next[section] ?? {}), [key as string]: value };
  return next as ThemeOverrides;
}

/** Effective button/card treatment of one block after its appearance overrides. */
export function resolveBlockAppearance(theme: ThemeConfig, appearance: BlockAppearance | undefined) {
  return {
    variant: appearance?.variant ?? theme.buttons.variant,
    background: appearance?.background ?? theme.colors.button,
    text: appearance?.text ?? theme.colors.buttonText,
    radius: appearance?.radius ?? theme.buttons.radius,
    featured: appearance?.emphasis === "featured",
  };
}

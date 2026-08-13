import { describe, expect, it } from "vitest";

import {
  SOCIAL_PLATFORM_IDS,
  SOCIAL_PLATFORM_REGISTRY,
} from "~/config/social-platform-registry";

describe("social platform registry", () => {
  it("keeps every supported platform registered exactly once", () => {
    expect(SOCIAL_PLATFORM_IDS).toHaveLength(27);
    expect(new Set(SOCIAL_PLATFORM_IDS).size).toBe(SOCIAL_PLATFORM_IDS.length);
    expect(Object.keys(SOCIAL_PLATFORM_REGISTRY)).toEqual([
      ...SOCIAL_PLATFORM_IDS,
    ]);
  });

  it("provides safe display metadata for every platform", () => {
    for (const platform of SOCIAL_PLATFORM_IDS) {
      const definition = SOCIAL_PLATFORM_REGISTRY[platform];
      expect(definition.label.length).toBeGreaterThan(0);
      expect(definition.color).toMatch(/^#[\dA-F]{6}$/i);
      expect(definition.placeholder).toMatch(/^https:\/\//);
    }
  });
});

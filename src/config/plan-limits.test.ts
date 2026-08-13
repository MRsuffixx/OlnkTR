import { describe, expect, it } from "vitest";

import { assetUploadLimitBytes, limitsForPlan } from "~/config/plan-limits";

describe("plan limits", () => {
  it("keeps useful image uploads available on Free", () => {
    expect(
      assetUploadLimitBytes({
        pro: false,
        purpose: "background",
        mimeType: "image/webp",
      }),
    ).toBe(10 * 1024 * 1024);
    expect(
      assetUploadLimitBytes({
        pro: false,
        purpose: "avatar",
        mimeType: "image/png",
      }),
    ).toBe(5 * 1024 * 1024);
  });

  it("keeps video and audio uploads unavailable on Free", () => {
    expect(
      assetUploadLimitBytes({
        pro: false,
        purpose: "background",
        mimeType: "video/webm",
      }),
    ).toBe(0);
    expect(
      assetUploadLimitBytes({
        pro: false,
        purpose: "audio",
        mimeType: "audio/mpeg",
      }),
    ).toBe(0);
  });

  it("centralizes storage quotas by plan", () => {
    expect(limitsForPlan(false).storageBytes).toBe(100 * 1024 * 1024);
    expect(limitsForPlan(true).storageBytes).toBe(1024 * 1024 * 1024);
  });
});

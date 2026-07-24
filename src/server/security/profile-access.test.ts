import { describe, expect, it, vi } from "vitest";

import {
  createProfileAccessToken,
  profileAccessCookieName,
  verifyProfileAccessToken,
} from "~/server/security/profile-access";

describe("profile access tokens", () => {
  it("binds a signed token to its user and access version", () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1_750_000_000_000);
    const token = createProfileAccessToken("user_123", 4);

    expect(verifyProfileAccessToken("user_123", 4, token)).toBe(true);
    expect(verifyProfileAccessToken("user_456", 4, token)).toBe(false);
    expect(verifyProfileAccessToken("user_123", 5, token)).toBe(false);
    expect(verifyProfileAccessToken("user_123", 4, `${token}x`)).toBe(false);
    now.mockReturnValue(1_750_043_200_001);
    expect(verifyProfileAccessToken("user_123", 4, token)).toBe(false);
    vi.restoreAllMocks();
  });

  it("uses a sanitized, product-scoped cookie name", () => {
    expect(profileAccessCookieName("user.$/123")).toBe("olnk_profile_user123");
  });
});

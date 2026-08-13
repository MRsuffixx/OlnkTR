import { describe, expect, it } from "vitest";

import { PROFILE_FONT_IDS } from "~/config/font-registry";
import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import {
  profileAvatarStyle,
  profileButtonStyle,
  profileEmbedUrl,
  profileFontFamily,
} from "~/lib/profile-rendering";

describe("shared profile rendering", () => {
  it("renders avatar geometry from the dedicated avatar group", () => {
    const appearance = structuredClone(DEFAULT_APPEARANCE);
    appearance.avatar.shape = "hexagon";
    appearance.avatar.size = 128;
    appearance.avatar.borderStyle = "double";
    appearance.avatar.shadow = "glow";

    const style = profileAvatarStyle(appearance);
    expect(style.width).toBe(128);
    expect(style.border).toBe("3px double #FFFFFF");
    expect(style.clipPath).toContain("polygon");
    expect(style.boxShadow).toContain(appearance.colors.glow);
  });

  it("preserves configured outline text and border colors", () => {
    const appearance = structuredClone(DEFAULT_APPEARANCE);
    appearance.buttons.fill = "outline";
    appearance.colors.button = "#AA0000";
    appearance.colors.buttonText = "#123456";
    appearance.colors.cardBorder = "#654321";
    const style = profileButtonStyle(appearance, {
      buttonColor: null,
      textColor: null,
      fontFamily: "inherit",
      iconStyle: "favicon",
    });
    expect(style.color).toBe("#123456");
    expect(style.border).toBe("2px solid #654321");
    expect(style.background).toBe("transparent");
  });

  it("maps every offered font to a loaded CSS variable", () => {
    for (const font of PROFILE_FONT_IDS) {
      expect(profileFontFamily(font)).toContain("var(--font-");
    }
  });

  it("renders only canonical supported embed URLs", () => {
    expect(
      profileEmbedUrl(
        "SPOTIFY",
        "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
      ),
    ).toBe("https://open.spotify.com/embed/track/4uLU6hMCjMI75M1A2tKUQC");
    expect(
      profileEmbedUrl("SPOTIFY", "https://spotify.link/abc123"),
    ).toBeNull();
    expect(profileEmbedUrl("YOUTUBE", "https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ",
    );
  });
});

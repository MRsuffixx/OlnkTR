import { describe, expect, it } from "vitest";

import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import {
  profileButtonStyle,
  profileEmbedUrl,
  profileFontFamily,
} from "~/lib/profile-rendering";

describe("shared profile rendering", () => {
  it("preserves configured outline text and border colors", () => {
    const appearance = structuredClone(DEFAULT_APPEARANCE);
    appearance.buttons.fill = "outline";
    appearance.buttons.color = "#AA0000";
    appearance.buttons.textColor = "#123456";
    appearance.buttons.borderColor = "#654321";
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
    for (const font of [
      "Fraunces",
      "Manrope",
      "Space Grotesk",
      "Playfair Display",
      "DM Serif Display",
      "Bebas Neue",
      "Inter",
      "Montserrat",
      "Lora",
      "Roboto Mono",
    ] as const) {
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

import { describe, expect, it } from "vitest";

import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import { workspaceInput } from "~/lib/schemas";

function link(id: string) {
  return {
    id,
    title: "Bağlantı",
    url: "https://example.test",
    iconUrl: null,
    enabled: true,
    customization: {},
    scheduledStart: null,
    scheduledEnd: null,
    passwordProtected: false,
    embedType: "LINK" as const,
  };
}

function workspace(links: ReturnType<typeof link>[]) {
  return {
    revision: 0,
    name: "Profil",
    bio: "",
    image: null,
    theme: {
      backgroundType: "GRADIENT" as const,
      backgroundValue: "#ffffff",
      buttonStyle: "SOLID" as const,
      buttonShape: "ROUNDED" as const,
      buttonColor: "#17211B",
      textColor: "#17211B",
      accentColor: "#F06432",
      fontFamily: "MODERN" as const,
      showBranding: true,
    },
    appearance: DEFAULT_APPEARANCE,
    customCss: "",
    links,
  };
}

describe("workspace payload validation", () => {
  it("rejects duplicate link identities", () => {
    const id = "8fe5a180-becd-4b41-8b20-ff56d1b890d3";
    expect(
      workspaceInput.safeParse(workspace([link(id), link(id)])).success,
    ).toBe(false);
  });

  it("accepts 50 links and rejects the 51st", () => {
    const links = Array.from({ length: 51 }, (_, index) =>
      link(`00000000-0000-4000-8000-${String(index).padStart(12, "0")}`),
    );
    expect(
      workspaceInput.safeParse(workspace(links.slice(0, 50))).success,
    ).toBe(true);
    expect(workspaceInput.safeParse(workspace(links)).success).toBe(false);
  });
});

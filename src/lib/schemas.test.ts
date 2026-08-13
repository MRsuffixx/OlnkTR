import { describe, expect, it } from "vitest";

import { DEFAULT_APPEARANCE } from "~/lib/appearance";
import { adminAccountStatusInput, workspaceInput } from "~/lib/schemas";

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
    socials: [],
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

  it("requires a Discord identity when live data is enabled", () => {
    const value = workspace([]);
    expect(
      workspaceInput.safeParse({
        ...value,
        socials: [
          {
            id: "f6695850-c634-441b-a7dd-3e2534f51ec0",
            platform: "DISCORD",
            label: "Discord",
            username: "",
            url: "",
            enabled: true,
            iconOnly: true,
            usePlatformColor: true,
            customColor: null,
            tooltip: "",
            settings: {
              discord: {
                userId: "",
                showPresence: true,
                showActivity: false,
                showSpotify: false,
              },
            },
          },
        ],
      }).success,
    ).toBe(false);
  });
});

describe("admin action validation", () => {
  const base = {
    userId: "tz4a98xxat96iws9zmbrgj3a",
    reason: "Destek talebi doğrulandı.",
    confirmation: "kullanici",
  };

  it("requires an expiry only for temporary suspension", () => {
    expect(
      adminAccountStatusInput.safeParse({
        ...base,
        status: "SUSPENDED",
        expiresAt: null,
      }).success,
    ).toBe(false);
    expect(
      adminAccountStatusInput.safeParse({
        ...base,
        status: "SUSPENDED",
        expiresAt: "2026-08-01T12:00:00.000Z",
      }).success,
    ).toBe(true);
    expect(
      adminAccountStatusInput.safeParse({
        ...base,
        status: "BANNED",
        expiresAt: "2026-08-01T12:00:00.000Z",
      }).success,
    ).toBe(false);
  });
});

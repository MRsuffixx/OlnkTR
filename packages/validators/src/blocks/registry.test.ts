import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  BlockRegistry,
  blockRegistry,
  defineBlock,
  parseSpotifyUrl,
  parseYouTubeUrl,
  UnknownBlockTypeError,
} from "./index";

describe("block registry", () => {
  it("contains every built-in block type, grouped", () => {
    expect(blockRegistry.types().sort()).toEqual(
      [
        "button",
        "contact",
        "countdown",
        "discord",
        "divider",
        "faq",
        "gallery",
        "github",
        "heading",
        "image",
        "link",
        "location",
        "newsletter",
        "product",
        "social_links",
        "social_profile",
        "soundcloud",
        "spacer",
        "spotify",
        "text",
        "twitch",
        "video",
        "youtube",
      ].sort(),
    );
    const groups = new Set(blockRegistry.list().map((definition) => definition.group));
    expect([...groups].sort()).toEqual(["business", "community", "essential", "media"]);
  });

  it("migrates stored v1 text, image and social_links configs to their current versions", () => {
    expect(blockRegistry.parseStored("text", 1, { text: "Hi", align: "left" })).toEqual({
      version: 2,
      config: { text: "Hi", align: "left", size: "md", weight: "regular", tone: "default" },
    });
    const image = blockRegistry.parseStored("image", 1, {
      mediaId: "8d7f3c52-1a0e-4c55-9a51-111111111111",
      alt: "",
      aspect: "wide",
    });
    expect(image).toMatchObject({ version: 2, config: { aspect: "wide", fit: "cover" } });
    expect(blockRegistry.parseStored("social_links", 1, { items: [] })).toMatchObject({
      version: 2,
      config: { display: "icons", iconStyle: "plain" },
    });
  });

  it("rejects unsafe or malformed embed and contact configs", () => {
    expect(
      blockRegistry.safeParseInput("soundcloud", { url: "https://evil.example/x/y" }).success,
    ).toBe(false);
    expect(
      blockRegistry.safeParseInput("soundcloud", { url: "https://soundcloud.com/artist/track" })
        .success,
    ).toBe(true);
    expect(blockRegistry.safeParseInput("twitch", { channel: "bad channel!" }).success).toBe(false);
    expect(blockRegistry.safeParseInput("contact", {}).success).toBe(false);
    expect(blockRegistry.safeParseInput("contact", { email: "a@b.co" }).success).toBe(true);
    expect(
      blockRegistry.safeParseInput("button", { label: "Go", url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      blockRegistry.safeParseInput("countdown", {
        title: "Launch",
        targetAt: "2027-01-01T00:00:00Z",
      }).success,
    ).toBe(true);
  });

  it("validates input against the current schema and applies defaults", () => {
    const parsed = blockRegistry.parseInput("heading", { text: "  Hello  " });
    expect(parsed).toEqual({ version: 1, config: { text: "Hello", level: 2, align: "center" } });
  });

  it("rejects invalid configs", () => {
    expect(() => blockRegistry.parseInput("youtube", { videoId: "not valid!" })).toThrow();
    expect(() =>
      blockRegistry.parseInput("social_links", {
        items: [{ platform: "x", url: "javascript:alert(1)" }],
      }),
    ).toThrow();
  });

  it("rejects unknown types", () => {
    expect(() => blockRegistry.parseInput("iframe", {})).toThrow(UnknownBlockTypeError);
  });

  it("migrates stored configs to the current version", () => {
    const v2 = defineBlock({
      type: "callout",
      version: 2,
      group: "essential",
      tier: "basic",
      schema: z.object({ body: z.string(), tone: z.enum(["info", "warn"]) }),
      defaultConfig: { body: "", tone: "info" as const },
      migrations: { 1: (config) => ({ body: (config as { text: string }).text, tone: "info" }) },
    });
    const registry = new BlockRegistry().register(v2);
    expect(registry.parseStored("callout", 1, { text: "hi" })).toEqual({
      version: 2,
      config: { body: "hi", tone: "info" },
    });
    expect(() => registry.parseStored("callout", 3, {})).toThrow(/newer/);
  });

  it("refuses definitions with missing migrations", () => {
    expect(() =>
      defineBlock({
        type: "broken",
        version: 2,
        group: "essential",
        tier: "basic",
        schema: z.object({}),
        defaultConfig: {},
      }),
    ).toThrow(/missing a migration/);
  });
});

describe("embed URL parsing", () => {
  it.each([
    ["https://www.youtube.com/watch?v=dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://youtu.be/dQw4w9WgXcQ?t=10", "dQw4w9WgXcQ"],
    ["https://www.youtube.com/shorts/dQw4w9WgXcQ", "dQw4w9WgXcQ"],
    ["https://evil.example/watch?v=dQw4w9WgXcQ", null],
  ])("parses %s", (input, expected) => {
    expect(parseYouTubeUrl(input)).toBe(expected);
  });

  it("parses Spotify URLs", () => {
    expect(
      parseSpotifyUrl("https://open.spotify.com/intl-tr/track/4uLU6hMCjMI75M1A2tKUQC?si=x"),
    ).toEqual({
      resourceType: "track",
      resourceId: "4uLU6hMCjMI75M1A2tKUQC",
    });
    expect(parseSpotifyUrl("https://spotify.evil/track/4uLU6hMCjMI75M1A2tKUQC")).toBeNull();
  });
});

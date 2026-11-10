import { describe, expect, it } from "vitest";
import {
  documentMediaIds,
  profileDocumentSchema,
  validateProfileDocument,
  type ProfileDocument,
} from "./editor";

const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

function doc(blocks: ProfileDocument["blocks"]): ProfileDocument {
  return {
    version: 1,
    profile: {
      displayName: "Ada",
      bio: "",
      avatarMediaId: id(90),
      coverMediaId: null,
      seoTitle: "",
      seoDescription: "",
      seoNoIndex: false,
      visibility: "public",
    },
    theme: { themeId: null, overrides: {} },
    blocks,
  };
}

const link = (n: number, url: string, title = "Site") => ({
  id: id(n),
  type: "link",
  isVisible: true,
  config: { style: "default" },
  link: { title, url, openInNewTab: false, isActive: true, trackClicks: true },
});

describe("profile document", () => {
  it("accepts incomplete drafts but reports publish issues per block and field", () => {
    const draft = profileDocumentSchema.parse(
      doc([link(1, ""), { id: id(2), type: "heading", isVisible: true, config: { text: "" } }]),
    );
    const issues = validateProfileDocument(draft);
    expect(issues.map((issue) => `${issue.target}:${issue.path}`)).toEqual(
      expect.arrayContaining([`${id(1)}:link.url`, `${id(2)}:config.text`]),
    );
  });

  it("passes a complete document", () => {
    const draft = profileDocumentSchema.parse(
      doc([
        link(1, "https://example.com"),
        { id: id(2), type: "divider", isVisible: true, config: {} },
      ]),
    );
    expect(validateProfileDocument(draft)).toEqual([]);
  });

  it("rejects unsafe link URLs, unknown block types and empty display names on publish", () => {
    const draft = doc([
      link(1, "javascript:alert(1)"),
      { id: id(2), type: "iframe_html", isVisible: true, config: {} },
    ]);
    draft.profile.displayName = " ";
    const targets = validateProfileDocument(draft).map((issue) => issue.target);
    expect(targets).toEqual(expect.arrayContaining(["profile", id(1), id(2)]));
  });

  it("rejects duplicate block ids and oversized configs while saving", () => {
    expect(profileDocumentSchema.safeParse(doc([link(1, ""), link(1, "")])).success).toBe(false);
    const huge = { id: id(3), type: "text", isVisible: true, config: { text: "x".repeat(20_000) } };
    expect(profileDocumentSchema.safeParse(doc([huge])).success).toBe(false);
  });

  it("collects every referenced media id", () => {
    const draft = doc([
      { id: id(4), type: "image", isVisible: true, config: { mediaId: id(91) } },
      { id: id(5), type: "gallery", isVisible: true, config: { items: [{ mediaId: id(92) }] } },
    ]);
    expect(documentMediaIds(draft).sort()).toEqual([id(90), id(91), id(92)].sort());
  });
});

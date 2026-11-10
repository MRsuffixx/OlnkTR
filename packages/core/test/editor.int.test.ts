import { randomUUID } from "node:crypto";
import { afterAll, describe, expect, it } from "vitest";
import { eq, schema } from "@olnktr/db";
import type { ProfileDocument } from "@olnktr/validators";
import { createHarness, PNG_BYTES } from "./harness";

const h = createHarness();
afterAll(() => h.handle.close());

type Actor = Awaited<ReturnType<typeof h.user>>;

async function themeId(key: string) {
  const [theme] = await h.db.select().from(schema.themes).where(eq(schema.themes.key, key));
  return theme!.id;
}

function linkBlock(title: string, url: string): ProfileDocument["blocks"][number] {
  return {
    id: randomUUID(),
    type: "link",
    isVisible: true,
    config: { style: "default" },
    link: { title, url, openInNewTab: false, isActive: true, trackClicks: true },
  };
}

async function uploadImage(actor: Actor) {
  const request = await h.core.media.requestUpload(actor, {
    purpose: "block_image",
    contentType: "image/png",
    sizeBytes: PNG_BYTES.byteLength,
    fileName: "photo.png",
  });
  const key = decodeURIComponent(request.upload.url.replace("memory://upload/", ""));
  h.storage.put(key, PNG_BYTES, "image/png");
  return (await h.core.media.completeUpload(actor, request.mediaId)).id;
}

async function setup() {
  const owner = await h.user();
  const profile = await h.profileFor(owner);
  const state = await h.core.editor.getState(owner, profile.id);
  return { owner, profile, state };
}

describe("studio drafts", () => {
  it("starts a draft from live content and keeps edits private until publish", async () => {
    const { owner, profile, state } = await setup();
    expect(state.document.profile.displayName).toBe("Test Profile");
    expect(state.revision).toBe(1);
    expect(state.canEdit && state.canPublish).toBe(true);

    const document = structuredClone(state.document);
    document.profile.displayName = "Draft Name";
    document.blocks.push(linkBlock("Portfolio", "https://example.com/work"));
    const saved = await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document,
      expectedRevision: 1,
    });
    expect(saved).toMatchObject({ revision: 2, hasUnpublishedChanges: true, issues: [] });

    // Nothing is public yet: the profile was never published.
    expect(
      await h.core.publicProfiles.resolve({ kind: "username", username: profile.username }),
    ).toBeNull();

    const published = await h.core.editor.publish(owner, {
      profileId: profile.id,
      expectedRevision: 2,
    });
    expect(published.hasUnpublishedChanges).toBe(false);
    const view = await h.core.publicProfiles.resolve({
      kind: "username",
      username: profile.username,
    });
    expect(view?.displayName).toBe("Draft Name");
    expect(view?.blocks.map((block) => block.link?.title)).toEqual(["Portfolio"]);

    // Later draft edits do not leak to the public page.
    const next = structuredClone(published.document);
    next.profile.displayName = "Unpublished rename";
    await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document: next,
      expectedRevision: published.revision,
    });
    const stillLive = await h.core.publicProfiles.resolve({
      kind: "username",
      username: profile.username,
    });
    expect(stillLive?.displayName).toBe("Draft Name");
    await h.core.editor.discard(owner, profile.id);
    expect((await h.core.editor.getState(owner, profile.id)).document.profile.displayName).toBe(
      "Draft Name",
    );
  });

  it("rejects stale revisions and allows an explicit overwrite", async () => {
    const { owner, profile, state } = await setup();
    await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document: state.document,
      expectedRevision: 1,
    });
    await expect(
      h.core.editor.saveDraft(owner, {
        profileId: profile.id,
        document: state.document,
        expectedRevision: 1,
      }),
    ).rejects.toMatchObject({ code: "CONFLICT", details: { revision: 2 } });
    const forced = await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document: state.document,
      expectedRevision: null,
    });
    expect(forced.revision).toBe(3);
    await expect(
      h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: 2 }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("materializes ordering, updates links in place and deletes removed blocks", async () => {
    const { owner, profile, state } = await setup();
    const document = structuredClone(state.document);
    document.blocks = [
      linkBlock("One", "https://one.example"),
      { id: randomUUID(), type: "heading", isVisible: true, config: { text: "Hello" } },
      linkBlock("Two", "https://two.example"),
    ];
    await h.core.editor.saveDraft(owner, { profileId: profile.id, document, expectedRevision: 1 });
    const first = await h.core.editor.publish(owner, {
      profileId: profile.id,
      expectedRevision: 2,
    });
    const links = await h.core.links.list(owner, profile.id);
    expect(links.map((link) => link.title)).toEqual(["One", "Two"]);
    const linkTwoId = links[1]!.id;

    // Reorder, edit "Two", drop "One" and the heading.
    const edited = structuredClone(first.document);
    const two = edited.blocks.find((block) => block.link?.title === "Two")!;
    two.link!.title = "Two (edited)";
    edited.blocks = [two, { id: randomUUID(), type: "divider", isVisible: false, config: {} }];
    await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document: edited,
      expectedRevision: first.revision,
    });
    const second = await h.core.editor.publish(owner, {
      profileId: profile.id,
      expectedRevision: first.revision + 1,
    });
    const after = await h.core.links.list(owner, profile.id);
    expect(after).toHaveLength(1);
    // The link keeps its id, so click analytics and /go URLs stay stable.
    expect(after[0]).toMatchObject({ id: linkTwoId, title: "Two (edited)" });
    const blocks = await h.core.blocks.list(owner, profile.id);
    expect(blocks.map((block) => [block.type, block.isVisible])).toEqual([
      ["link", true],
      ["divider", false],
    ]);
    // The draft now carries the permanent ids of the live rows.
    expect(second.document.blocks.map((block) => block.id)).toEqual(
      blocks.map((block) => block.id),
    );
  });

  it("refuses to publish drafts with validation issues and reports them per field", async () => {
    const { owner, profile, state } = await setup();
    const document = structuredClone(state.document);
    const broken = linkBlock("", "not a url");
    document.blocks.push(broken);
    const saved = await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document,
      expectedRevision: 1,
    });
    expect(saved.issues.map((issue) => `${issue.target}:${issue.path}`)).toEqual(
      expect.arrayContaining([`${broken.id}:link.title`, `${broken.id}:link.url`]),
    );
    await expect(
      h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: 2 }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("enforces plan entitlements on publish and applies overrides once granted", async () => {
    const { owner, profile, state } = await setup();
    const document = structuredClone(state.document);
    document.theme = {
      themeId: await themeId("neon"),
      overrides: { colors: { button: "#ff0000" }, typography: { headingFont: "fraunces" } },
    };
    document.blocks.push({
      id: randomUUID(),
      type: "product",
      isVisible: true,
      config: { title: "Print", url: "https://shop.example/print", currency: "TRY" },
    });
    const saved = await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document,
      expectedRevision: 1,
    });
    expect(saved.blockers.map((blocker) => blocker.code).sort()).toEqual(
      ["advanced_customization", "block_type", "premium_theme"].sort(),
    );
    await expect(
      h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: 2 }),
    ).rejects.toMatchObject({ code: "ENTITLEMENT_REQUIRED" });

    await h.grant(
      { userId: owner.userId },
      {
        "themes.premium": true,
        "customization.advanced": true,
        "blocks.available_types": ["*"],
      },
    );
    await h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: 2 });
    const view = await h.core.publicProfiles.resolve({
      kind: "username",
      username: profile.username,
    });
    expect(view?.theme.colors.button).toBe("#ff0000");
    expect(view?.theme.typography.headingFont).toBe("fraunces");
    // Inherited from the Neon base theme.
    expect(view?.theme.typography.bodyFont).toBe("space-grotesk");
    expect(view?.blocks.map((block) => block.type)).toEqual(["product"]);
  });

  it("enforces the links limit and media ownership on publish", async () => {
    const { owner, profile, state } = await setup();
    const stranger = await h.user();
    const foreignMedia = await uploadImage(stranger);
    await h.grant({ userId: owner.userId }, { "links.limit": 1 });
    const document = structuredClone(state.document);
    document.profile.avatarMediaId = foreignMedia;
    document.blocks.push(linkBlock("A", "https://a.example"), linkBlock("B", "https://b.example"));
    const saved = await h.core.editor.saveDraft(owner, {
      profileId: profile.id,
      document,
      expectedRevision: 1,
    });
    expect(saved.blockers.map((blocker) => blocker.code).sort()).toEqual(
      ["links_limit", "media_missing"].sort(),
    );

    document.blocks.pop();
    document.profile.avatarMediaId = await uploadImage(owner);
    await h.core.editor.saveDraft(owner, { profileId: profile.id, document, expectedRevision: 2 });
    await expect(
      h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: 3 }),
    ).resolves.toMatchObject({ blockers: [] });
  });

  it("detects live changes made outside the studio after the draft started", async () => {
    const { owner, profile, state } = await setup();
    const document = structuredClone(state.document);
    document.profile.bio = "draft bio";
    await h.core.editor.saveDraft(owner, { profileId: profile.id, document, expectedRevision: 1 });
    expect((await h.core.editor.getState(owner, profile.id)).liveChangedSinceDraft).toBe(false);
    await h.core.links.create(owner, {
      profileId: profile.id,
      title: "API",
      url: "https://api.example",
    });
    expect((await h.core.editor.getState(owner, profile.id)).liveChangedSinceDraft).toBe(true);
  });
});

describe("studio access control", () => {
  it("hides other tenants' drafts as NOT_FOUND", async () => {
    const { profile, state } = await setup();
    const stranger = await h.user();
    await expect(h.core.editor.getState(stranger, profile.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      h.core.editor.saveDraft(stranger, {
        profileId: profile.id,
        document: state.document,
        expectedRevision: null,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      h.core.editor.publish(stranger, { profileId: profile.id, expectedRevision: 1 }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("lets viewers read, editors save, and only owners/admins publish", async () => {
    const owner = await h.user();
    const editor = await h.user();
    const viewer = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Studio",
      slug: `studio-${h.uniqueSuffix()}`,
    });
    await h.db.insert(schema.organizationMembers).values([
      { organizationId: org.id, userId: editor.userId, role: "editor" },
      { organizationId: org.id, userId: viewer.userId, role: "viewer" },
    ]);
    const profile = await h.profileFor(owner, org.id);

    const viewed = await h.core.editor.getState(viewer, profile.id);
    expect(viewed).toMatchObject({ canEdit: false, canPublish: false });
    await expect(
      h.core.editor.saveDraft(viewer, {
        profileId: profile.id,
        document: viewed.document,
        expectedRevision: null,
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    const editorState = await h.core.editor.getState(editor, profile.id);
    expect(editorState).toMatchObject({ canEdit: true, canPublish: false });
    const saved = await h.core.editor.saveDraft(editor, {
      profileId: profile.id,
      document: editorState.document,
      expectedRevision: editorState.revision,
    });
    await expect(
      h.core.editor.publish(editor, { profileId: profile.id, expectedRevision: saved.revision }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      h.core.editor.publish(owner, { profileId: profile.id, expectedRevision: saved.revision }),
    ).resolves.toBeTruthy();
  });
});

describe("studio themes", () => {
  it("lists presets with configs and tracks favourites", async () => {
    const user = await h.user();
    const list = await h.core.themes.listAvailable(user);
    const keys = list.map((theme) => theme.key);
    expect(keys).toEqual(expect.arrayContaining(["minimal", "editorial", "neon", "elegant"]));
    expect(keys).not.toContain("aurora");
    expect(list.find((theme) => theme.key === "neon")).toMatchObject({
      isPremium: true,
      locked: true,
    });
    const minimal = list.find((theme) => theme.key === "minimal")!;
    await h.core.themes.setFavorite(user, { themeId: minimal.id, favorite: true });
    const again = await h.core.themes.listAvailable(user);
    expect(again.find((theme) => theme.id === minimal.id)?.isFavorite).toBe(true);
  });

  it("saves, duplicates and archives custom themes only with advanced customization", async () => {
    const { owner, profile } = await setup();
    const minimalId = await themeId("minimal");
    const input = {
      profileId: profile.id,
      name: "Mine",
      baseThemeId: minimalId,
      overrides: { colors: { background: "#123456" } },
    };
    await expect(h.core.themes.saveFromProfile(owner, input)).rejects.toMatchObject({
      code: "ENTITLEMENT_REQUIRED",
    });
    await h.grant({ userId: owner.userId }, { "customization.advanced": true });
    const custom = await h.core.themes.saveFromProfile(owner, input);
    const listed = (await h.core.themes.listAvailable(owner)).find(
      (theme) => theme.id === custom.id,
    );
    expect(listed).toMatchObject({ isCustom: true, name: "Mine" });
    expect(listed?.config.colors.background).toBe("#123456");

    const copy = await h.core.themes.duplicate(owner, { themeId: custom.id });
    expect(copy.name).toBe("Mine copy");

    const stranger = await h.user();
    await expect(h.core.themes.archive(stranger, custom.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await h.core.themes.archive(owner, custom.id);
    const remaining = (await h.core.themes.listAvailable(owner)).map((theme) => theme.id);
    expect(remaining).not.toContain(custom.id);
    expect(remaining).toContain(copy.id);
  });
});

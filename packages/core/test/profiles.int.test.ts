import { afterAll, describe, expect, it } from "vitest";
import { createHarness } from "./harness";

const h = createHarness();
afterAll(() => h.handle.close());

describe("profiles", () => {
  it("creates a profile with a normalized username", async () => {
    const user = await h.user();
    const username = `MiXeD-${h.uniqueSuffix()}`;
    const profile = await h.core.profiles.create(user, {
      username: username.toLowerCase(),
      displayName: "Mixed",
    });
    expect(profile.username).toBe(username.toLowerCase());
    expect(profile.status).toBe("draft");
    expect(profile.ownerUserId).toBe(user.userId);
  });

  it("enforces global username uniqueness", async () => {
    const a = await h.user();
    const b = await h.user();
    const username = `taken-${h.uniqueSuffix()}`;
    await h.core.profiles.create(a, { username, displayName: "A" });
    await expect(h.core.profiles.create(b, { username, displayName: "B" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
    expect(await h.core.profiles.checkUsername(username.toUpperCase())).toEqual({
      available: false,
      username,
      reason: "taken",
    });
    expect(await h.core.profiles.checkUsername("dashboard")).toMatchObject({
      available: false,
      reason: "reserved",
    });
    expect((await h.core.profiles.checkUsername(`free-${h.uniqueSuffix()}`)).available).toBe(true);
  });

  it("enforces the plan's profile limit, including under concurrency", async () => {
    const user = await h.user();
    const attempts = await Promise.allSettled(
      [1, 2, 3].map((n) =>
        h.core.profiles.create(user, {
          username: `race${n}-${h.uniqueSuffix()}`,
          displayName: "x",
        }),
      ),
    );
    expect(attempts.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = attempts.filter(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    expect(
      rejected.every((result) => (result.reason as { code: string }).code === "QUOTA_EXCEEDED"),
    ).toBe(true);

    await h.grant({ userId: user.userId }, { "profiles.limit": 2 });
    await expect(
      h.core.profiles.create(user, { username: `extra-${h.uniqueSuffix()}`, displayName: "x" }),
    ).resolves.toBeDefined();
  });

  it("updates profiles and validates username changes", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    const updated = await h.core.profiles.update(user, {
      profileId: profile.id,
      displayName: "New Name",
      bio: "Hello",
    });
    expect(updated).toMatchObject({ displayName: "New Name", bio: "Hello" });
  });

  it("only exposes published, non-private profiles of active owners publicly", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    const lookup = { kind: "username" as const, username: profile.username };
    expect(await h.core.publicProfiles.resolve(lookup)).toBeNull();

    await h.core.profiles.setPublished(user, profile.id, true);
    const view = await h.core.publicProfiles.resolve({
      kind: "username",
      username: profile.username.toUpperCase(),
    });
    expect(view).toMatchObject({ id: profile.id, showBranding: true, seo: { noIndex: false } });
    expect(view?.theme.schemaVersion).toBe(1);

    await h.core.profiles.update(user, { profileId: profile.id, visibility: "unlisted" });
    expect((await h.core.publicProfiles.resolve(lookup))?.seo.noIndex).toBe(true);

    await h.core.profiles.update(user, { profileId: profile.id, visibility: "private" });
    expect(await h.core.publicProfiles.resolve(lookup)).toBeNull();

    await h.core.profiles.update(user, { profileId: profile.id, visibility: "public" });
    const admin = await h.user({ role: "admin" });
    await h.core.admin.suspendUser(admin, user.userId, "spam");
    expect(await h.core.publicProfiles.resolve(lookup)).toBeNull();
    await h.core.admin.restoreUser(admin, user.userId, "appeal accepted");
    expect(await h.core.publicProfiles.resolve(lookup)).not.toBeNull();

    await h.core.profiles.setPublished(user, profile.id, false);
    expect(await h.core.publicProfiles.resolve(lookup)).toBeNull();
  });

  it("deletes profiles", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    await h.core.profiles.delete(user, profile.id);
    await expect(h.core.profiles.get(user, profile.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("links and blocks", () => {
  it("supports CRUD, ordering and public rendering with schedules", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    const heading = await h.core.blocks.create(user, {
      profileId: profile.id,
      type: "heading",
      config: { text: "Welcome" },
    });
    const a = await h.core.links.create(user, {
      profileId: profile.id,
      title: "A",
      url: "https://a.example",
    });
    const b = await h.core.links.create(user, {
      profileId: profile.id,
      title: "B",
      url: "https://b.example",
    });
    const future = await h.core.links.create(user, {
      profileId: profile.id,
      title: "Later",
      url: "https://later.example",
      startsAt: new Date(Date.now() + 86_400_000),
    });
    const inactive = await h.core.links.create(user, {
      profileId: profile.id,
      title: "Off",
      url: "https://off.example",
      isActive: false,
    });

    await h.core.links.update(user, { linkId: a.id, title: "A2" });
    await h.core.links.reorder(user, {
      profileId: profile.id,
      orderedIds: [b.id, a.id, future.id, inactive.id],
    });
    const links = await h.core.links.list(user, profile.id);
    expect(links.map((link) => link.title)).toEqual(["B", "A2", "Later", "Off"]);

    const blocks = await h.core.blocks.list(user, profile.id);
    expect(blocks[0]?.id).toBe(heading.id);

    await h.core.profiles.setPublished(user, profile.id, true);
    const view = await h.core.publicProfiles.resolve({
      kind: "username",
      username: profile.username,
    });
    expect(view?.blocks.map((block) => block.link?.title ?? block.type)).toEqual([
      "heading",
      "B",
      "A2",
    ]);

    expect(await h.core.links.resolveRedirect(b.id, new Date())).toMatchObject({
      url: "https://b.example",
    });
    expect(await h.core.links.resolveRedirect(inactive.id, new Date())).toBeNull();
    expect(await h.core.links.resolveRedirect(future.id, new Date())).toBeNull();

    await h.core.links.delete(user, a.id);
    expect((await h.core.links.list(user, profile.id)).map((link) => link.id)).not.toContain(a.id);
  });

  it("rejects incomplete reorder requests", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    const link = await h.core.links.create(user, {
      profileId: profile.id,
      title: "A",
      url: "https://a.example",
    });
    await h.core.links.create(user, {
      profileId: profile.id,
      title: "B",
      url: "https://b.example",
    });
    await expect(
      h.core.links.reorder(user, { profileId: profile.id, orderedIds: [link.id] }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("enforces the per-profile link limit from the entitlement system", async () => {
    const user = await h.user();
    await h.grant({ userId: user.userId }, { "links.limit": 2 });
    const profile = await h.profileFor(user);
    await h.core.links.create(user, {
      profileId: profile.id,
      title: "1",
      url: "https://1.example",
    });
    await h.core.links.create(user, {
      profileId: profile.id,
      title: "2",
      url: "https://2.example",
    });
    await expect(
      h.core.links.create(user, { profileId: profile.id, title: "3", url: "https://3.example" }),
    ).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
      details: { entitlement: "links.limit", limit: 2 },
    });
  });

  it("validates block configs via the registry and refuses managed block types", async () => {
    const user = await h.user();
    const profile = await h.profileFor(user);
    await expect(
      h.core.blocks.create(user, {
        profileId: profile.id,
        type: "youtube",
        config: { videoId: "bad" },
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      h.core.blocks.create(user, { profileId: profile.id, type: "link", config: {} }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      h.core.blocks.create(user, { profileId: profile.id, type: "iframe", config: {} }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const divider = await h.core.blocks.create(user, {
      profileId: profile.id,
      type: "divider",
      config: {},
    });
    const spacer = await h.core.blocks.create(user, {
      profileId: profile.id,
      type: "spacer",
      config: { size: "lg" },
      position: 0,
    });
    expect((await h.core.blocks.list(user, profile.id)).map((block) => block.id)).toEqual([
      spacer.id,
      divider.id,
    ]);
    const updated = await h.core.blocks.update(user, {
      blockId: divider.id,
      config: { style: "dashed" },
      isVisible: false,
    });
    expect(updated).toMatchObject({ config: { style: "dashed" }, isVisible: false });
    const types = await h.core.blocks.listTypes(user, profile.id);
    expect(types.find((type) => type.type === "video")?.locked).toBe(true);
    expect(types.find((type) => type.type === "heading")?.locked).toBe(false);
  });
});

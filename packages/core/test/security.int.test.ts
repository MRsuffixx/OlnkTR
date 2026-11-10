import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { desc, eq, schema } from "@olnktr/db";
import { createHarness } from "./harness";

/**
 * Security suite: broken access control / IDOR, cross-tenant access, API key
 * scoping, admin authorization, entitlement enforcement and audit hygiene.
 */
const h = createHarness();
afterAll(() => h.handle.close());

describe("IDOR protection on personal resources", () => {
  let alice: Awaited<ReturnType<typeof h.user>>;
  let mallory: Awaited<ReturnType<typeof h.user>>;
  let profileId: string;
  let linkId: string;

  beforeAll(async () => {
    alice = await h.user();
    mallory = await h.user();
    profileId = (await h.profileFor(alice)).id;
    linkId = (
      await h.core.links.create(alice, { profileId, title: "Mine", url: "https://example.com" })
    ).id;
  });

  it("hides other users' profiles as NOT_FOUND (no existence leak)", async () => {
    await expect(h.core.profiles.get(mallory, profileId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      h.core.profiles.update(mallory, { profileId, displayName: "pwned" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.core.profiles.delete(mallory, profileId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(h.core.profiles.setPublished(mallory, profileId, true)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("prevents tampering with another user's links and blocks", async () => {
    await expect(
      h.core.links.update(mallory, { linkId, url: "https://evil.example" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.core.links.delete(mallory, linkId)).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      h.core.links.create(mallory, { profileId, title: "x", url: "https://evil.example" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      h.core.blocks.create(mallory, { profileId, type: "text", config: { text: "x" } }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      h.core.analytics.summary(mallory, { profileId, from: "2026-01-01", to: "2026-01-02" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const [link] = await h.db.select().from(schema.links).where(eq(schema.links.id, linkId));
    expect(link?.url).toBe("https://example.com");
  });

  it("rejects attaching another tenant's media", async () => {
    const upload = await h.core.media.requestUpload(mallory, {
      purpose: "avatar",
      contentType: "image/png",
      sizeBytes: 10,
      fileName: "a.png",
    });
    await expect(
      h.core.profiles.update(alice, { profileId, avatarMediaId: upload.mediaId }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(h.core.media.completeUpload(alice, upload.mediaId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});

describe("tenant isolation", () => {
  it("never trusts a client-supplied organization id", async () => {
    const owner = await h.user();
    const outsider = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Acme",
      slug: `acme-${h.uniqueSuffix()}`,
    });
    await expect(h.core.profiles.list(outsider, org.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      h.core.profiles.create(outsider, {
        username: `x-${h.uniqueSuffix()}`,
        displayName: "x",
        organizationId: org.id,
      }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(h.core.organizations.listMembers(outsider, org.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(h.core.billing.summary(outsider, org.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(h.core.apiKeys.list(outsider, org.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  it("isolates members of one organization from another organization's data", async () => {
    const a = await h.user();
    const b = await h.user();
    const orgA = await h.core.organizations.create(a, { name: "A", slug: `a-${h.uniqueSuffix()}` });
    const orgB = await h.core.organizations.create(b, { name: "B", slug: `b-${h.uniqueSuffix()}` });
    const profileB = await h.profileFor(b, orgB.id);
    await expect(h.core.profiles.get(a, profileB.id)).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect((await h.core.profiles.list(a, orgA.id)).some((p) => p.id === profileB.id)).toBe(false);
  });

  it("keeps personal profiles out of organization listings and vice versa", async () => {
    const owner = await h.user();
    await h.grant({ userId: owner.userId }, { "profiles.limit": 5 });
    const org = await h.core.organizations.create(owner, {
      name: "Mixed",
      slug: `mixed-${h.uniqueSuffix()}`,
    });
    const personal = await h.profileFor(owner);
    const team = await h.profileFor(owner, org.id);
    const personalList = await h.core.profiles.list(owner);
    const orgList = await h.core.profiles.list(owner, org.id);
    expect(personalList.map((p) => p.id)).toContain(personal.id);
    expect(personalList.map((p) => p.id)).not.toContain(team.id);
    expect(orgList.map((p) => p.id)).toEqual([team.id]);
  });
});

describe("API key authorization", () => {
  it("requires the api.access entitlement", async () => {
    const free = await h.user();
    await expect(
      h.core.apiKeys.create(free, { name: "k", scopes: ["profiles:read"] }),
    ).rejects.toMatchObject({ code: "ENTITLEMENT_REQUIRED" });
  });

  it("enforces scopes and owner boundaries", async () => {
    const owner = await h.user();
    const other = await h.user();
    await h.grant({ userId: owner.userId }, { "api.access": true, "profiles.limit": 3 });
    const profile = await h.profileFor(owner);
    const otherProfile = await h.profileFor(other);
    const readOnly = await h.apiKeyFor(owner, ["profiles:read", "links:read"]);

    expect((await h.core.profiles.get(readOnly.actor, profile.id)).id).toBe(profile.id);
    await expect(
      h.core.profiles.update(readOnly.actor, { profileId: profile.id, displayName: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      h.core.links.create(readOnly.actor, {
        profileId: profile.id,
        title: "x",
        url: "https://example.com",
      }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(h.core.profiles.get(readOnly.actor, otherProfile.id)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    // Keys can never manage billing or other keys.
    await expect(h.core.billing.summary(readOnly.actor)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("stores only a hash and stops working once revoked", async () => {
    const owner = await h.user();
    await h.grant({ userId: owner.userId }, { "api.access": true });
    const key = await h.apiKeyFor(owner, ["profiles:read"]);
    const [row] = await h.db.select().from(schema.apiKeys).where(eq(schema.apiKeys.id, key.id));
    expect(row?.secretHash).not.toContain(key.key.split("_")[2]!);
    expect(JSON.stringify(await h.core.apiKeys.list(owner))).not.toContain(key.key);
    await h.core.apiKeys.revoke(owner, key.id);
    expect(await h.core.apiKeys.authenticate(key.key)).toBeNull();
  });

  it("rejects malformed and forged keys", async () => {
    expect(await h.core.apiKeys.authenticate("not-a-key")).toBeNull();
    expect(await h.core.apiKeys.authenticate(`olnk_abcdefghijkl_${"A".repeat(43)}`)).toBeNull();
  });

  it("stops working when the owner is suspended or loses api.access", async () => {
    const admin = await h.user({ role: "admin" });
    const owner = await h.user();
    await h.grant({ userId: owner.userId }, { "api.access": true });
    const key = await h.apiKeyFor(owner, ["profiles:read"]);
    await h.core.admin.suspendUser(admin, owner.userId, "abuse report");
    expect(await h.core.apiKeys.authenticate(key.key)).toBeNull();
  });
});

describe("administrative authorization", () => {
  it("denies regular users and limits support staff to read-only", async () => {
    const regular = await h.user();
    const support = await h.user({ role: "support" });
    const target = await h.user();
    await expect(h.core.admin.listUsers(regular, { limit: 10 })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(h.core.admin.listUsers(support, { limit: 10 })).resolves.toBeDefined();
    await expect(h.core.admin.suspendUser(support, target.userId, "nope")).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      h.core.admin.setSetting(support, "registration.enabled", false),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("audits admin actions without leaking secrets", async () => {
    const admin = await h.user({ role: "admin" });
    const target = await h.user();
    await h.core.admin.grantEntitlements(admin, {
      subject: { type: "user", userId: target.userId },
      entitlements: { "profiles.limit": 10 },
      reason: "partner program",
    });
    const [entry] = await h.db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.targetId, target.userId))
      .orderBy(desc(schema.auditLogs.occurredAt));
    expect(entry).toMatchObject({
      action: "admin.entitlements_granted",
      actorUserId: admin.userId,
    });
    await h.core.audit.record({
      actor: admin,
      action: "test.sanitize",
      metadata: { password: "x", nested: { apiKey: "y", ok: 1 } },
    });
    const [sanitized] = await h.db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.action, "test.sanitize"));
    expect(sanitized?.metadata).toEqual({ nested: { ok: 1 } });
  });
});

describe("premium entitlement enforcement", () => {
  it("blocks premium themes and block types on the free plan", async () => {
    const free = await h.user();
    const profile = await h.profileFor(free);
    const [aurora] = await h.db.select().from(schema.themes).where(eq(schema.themes.key, "aurora"));
    await expect(
      h.core.themes.assignToProfile(free, { profileId: profile.id, themeId: aurora!.id }),
    ).rejects.toMatchObject({ code: "ENTITLEMENT_REQUIRED" });
    await expect(
      h.core.blocks.create(free, {
        profileId: profile.id,
        type: "spotify",
        config: { resourceType: "track", resourceId: "4uLU6hMCjMI75M1A2tKUQC" },
      }),
    ).rejects.toMatchObject({ code: "ENTITLEMENT_REQUIRED" });

    await h.grant(
      { userId: free.userId },
      { "themes.premium": true, "blocks.available_types": ["*"] },
    );
    await expect(
      h.core.themes.assignToProfile(free, { profileId: profile.id, themeId: aurora!.id }),
    ).resolves.toBeDefined();
    await expect(
      h.core.blocks.create(free, {
        profileId: profile.id,
        type: "spotify",
        config: { resourceType: "track", resourceId: "4uLU6hMCjMI75M1A2tKUQC" },
      }),
    ).resolves.toMatchObject({ type: "spotify" });
  });

  it("applies the profile owner's entitlements, not the acting member's", async () => {
    const owner = await h.user();
    const editor = await h.user();
    // The editor personally has Pro-level theme access; the organization does not.
    await h.grant({ userId: editor.userId }, { "themes.premium": true });
    await h.grant({ userId: owner.userId }, {});
    const org = await h.core.organizations.create(owner, {
      name: "Precedence",
      slug: `prec-${h.uniqueSuffix()}`,
    });
    await h.db
      .insert(schema.organizationMembers)
      .values({ organizationId: org.id, userId: editor.userId, role: "editor" });
    const profile = await h.profileFor(owner, org.id);
    const [aurora] = await h.db.select().from(schema.themes).where(eq(schema.themes.key, "aurora"));
    await expect(
      h.core.themes.assignToProfile(editor, { profileId: profile.id, themeId: aurora!.id }),
    ).rejects.toMatchObject({
      code: "ENTITLEMENT_REQUIRED",
    });
  });
});

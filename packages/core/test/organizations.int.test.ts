import { afterAll, describe, expect, it } from "vitest";
import { and, eq, schema } from "@olnktr/db";
import { createHarness } from "./harness";

const h = createHarness();
afterAll(() => h.handle.close());

async function inviteToken(organizationId: string, email: string): Promise<string> {
  const job = h.jobs.take("email").find((entry) => (entry.payload as { to: string }).to === email);
  const url = (job?.payload as { props: { url: string } } | undefined)?.props.url;
  if (!url) throw new Error("invitation email not enqueued");
  const token = new URL(url).searchParams.get("token")!;
  const [invitation] = await h.db
    .select()
    .from(schema.organizationInvitations)
    .where(
      and(
        eq(schema.organizationInvitations.organizationId, organizationId),
        eq(schema.organizationInvitations.email, email),
      ),
    );
  expect(invitation?.tokenHash).not.toBe(token);
  return token;
}

describe("organizations", () => {
  it("makes the creator an owner and enforces unique slugs", async () => {
    const owner = await h.user();
    const slug = `org-${h.uniqueSuffix()}`;
    const org = await h.core.organizations.create(owner, { name: "Org", slug });
    expect((await h.core.organizations.get(owner, org.id)).role).toBe("owner");
    await expect(h.core.organizations.create(owner, { name: "Dup", slug })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("enforces seat limits through organization entitlements", async () => {
    const owner = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Seats",
      slug: `seats-${h.uniqueSuffix()}`,
    });
    await expect(
      h.core.organizations.invite(owner, {
        organizationId: org.id,
        email: "x@test.olnk.tr",
        role: "editor",
      }),
    ).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
    });
    // The owner's *personal* entitlements do not apply to the organization.
    await h.grant({ userId: owner.userId }, { "team.members.limit": 50 });
    await expect(
      h.core.organizations.invite(owner, {
        organizationId: org.id,
        email: "x@test.olnk.tr",
        role: "editor",
      }),
    ).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
    });
    await h.grant({ organizationId: org.id }, { "team.members.limit": 2 });
    await expect(
      h.core.organizations.invite(owner, {
        organizationId: org.id,
        email: "x@test.olnk.tr",
        role: "editor",
      }),
    ).resolves.toBeDefined();
    await expect(
      h.core.organizations.invite(owner, {
        organizationId: org.id,
        email: "y@test.olnk.tr",
        role: "editor",
      }),
    ).rejects.toMatchObject({
      code: "QUOTA_EXCEEDED",
    });
  });

  it("binds invitations to the invited, verified email address", async () => {
    const owner = await h.user();
    const invitee = await h.user();
    const stranger = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Invites",
      slug: `inv-${h.uniqueSuffix()}`,
    });
    await h.grant({ organizationId: org.id }, { "team.members.limit": 10 });
    await h.core.organizations.invite(owner, {
      organizationId: org.id,
      email: invitee.email,
      role: "editor",
    });
    const token = await inviteToken(org.id, invitee.email);

    await expect(h.core.organizations.acceptInvitation(stranger, token)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(h.core.organizations.acceptInvitation(invitee, token)).resolves.toMatchObject({
      role: "editor",
    });
    await expect(h.core.organizations.acceptInvitation(invitee, token)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    expect((await h.core.organizations.get(invitee, org.id)).role).toBe("editor");
  });

  it("applies role permissions", async () => {
    const owner = await h.user();
    const admin = await h.user();
    const editor = await h.user();
    const viewer = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Roles",
      slug: `roles-${h.uniqueSuffix()}`,
    });
    await h.db.insert(schema.organizationMembers).values([
      { organizationId: org.id, userId: admin.userId, role: "admin" },
      { organizationId: org.id, userId: editor.userId, role: "editor" },
      { organizationId: org.id, userId: viewer.userId, role: "viewer" },
    ]);
    const profile = await h.profileFor(owner, org.id);

    // viewer: read only
    await expect(h.core.profiles.get(viewer, profile.id)).resolves.toBeDefined();
    await expect(
      h.core.links.create(viewer, { profileId: profile.id, title: "x", url: "https://x.example" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    // editor: content yes, publishing / profile creation no
    await expect(
      h.core.links.create(editor, { profileId: profile.id, title: "x", url: "https://x.example" }),
    ).resolves.toBeDefined();
    await expect(h.core.profiles.setPublished(editor, profile.id, true)).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      h.core.profiles.create(editor, {
        username: `e-${h.uniqueSuffix()}`,
        displayName: "x",
        organizationId: org.id,
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    // admin: can publish, cannot touch owners or grant ownership
    await expect(h.core.profiles.setPublished(admin, profile.id, true)).resolves.toBeDefined();
    await expect(
      h.core.organizations.updateMemberRole(admin, {
        organizationId: org.id,
        userId: owner.userId,
        role: "viewer",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      h.core.organizations.updateMemberRole(admin, {
        organizationId: org.id,
        userId: editor.userId,
        role: "owner",
      }),
    ).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
    await expect(
      h.core.organizations.updateMemberRole(admin, {
        organizationId: org.id,
        userId: viewer.userId,
        role: "editor",
      }),
    ).resolves.toBeUndefined();
    // billing is owner-only
    await expect(
      h.core.billing.cancel(admin, { organizationId: org.id, atPeriodEnd: true }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("protects the last owner", async () => {
    const owner = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Last",
      slug: `last-${h.uniqueSuffix()}`,
    });
    await expect(
      h.core.organizations.removeMember(owner, { organizationId: org.id, userId: owner.userId }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
    await expect(
      h.core.organizations.updateMemberRole(owner, {
        organizationId: org.id,
        userId: owner.userId,
        role: "admin",
      }),
    ).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  it("supports organization-owned profiles with organization quotas", async () => {
    const owner = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Quota",
      slug: `quota-${h.uniqueSuffix()}`,
    });
    await h.profileFor(owner); // personal profile uses the personal quota
    await expect(h.profileFor(owner, org.id)).resolves.toMatchObject({
      ownerOrganizationId: org.id,
    });
    await expect(h.profileFor(owner, org.id)).rejects.toMatchObject({ code: "QUOTA_EXCEEDED" });
  });
});

describe("user lifecycle", () => {
  it("schedules and cancels account deletion", async () => {
    const user = await h.user();
    const { scheduledFor } = await h.core.users.requestDeletion(user);
    expect(scheduledFor.getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);
    await h.core.users.cancelDeletion(user);
    expect((await h.core.users.getMe(user)).status).toBe("active");
  });

  it("refuses deletion while being the sole owner of a team", async () => {
    const owner = await h.user();
    const member = await h.user();
    const org = await h.core.organizations.create(owner, {
      name: "Team",
      slug: `team-${h.uniqueSuffix()}`,
    });
    await h.db
      .insert(schema.organizationMembers)
      .values({ organizationId: org.id, userId: member.userId, role: "editor" });
    await expect(h.core.users.requestDeletion(owner)).rejects.toMatchObject({
      code: "PRECONDITION_FAILED",
    });
  });

  it("purges accounts after the grace period", async () => {
    const user = await h.user();
    await h.core.organizations.create(user, { name: "Solo", slug: `solo-${h.uniqueSuffix()}` });
    await h.core.users.requestDeletion(user);
    await h.db
      .update(schema.users)
      .set({ deletionScheduledFor: new Date(Date.now() - 1000) })
      .where(eq(schema.users.id, user.userId));
    expect(await h.core.users.purgeDueAccounts()).toBeGreaterThanOrEqual(1);
    expect(
      await h.db.select().from(schema.users).where(eq(schema.users.id, user.userId)),
    ).toHaveLength(0);
  });

  it("revokes sessions on suspension", async () => {
    const admin = await h.user({ role: "admin" });
    const user = await h.user();
    await h.db.insert(schema.sessions).values({
      token: `t-${h.uniqueSuffix()}`,
      userId: user.userId,
      expiresAt: new Date(Date.now() + 3_600_000),
    });
    await h.core.admin.suspendUser(admin, user.userId, "abuse");
    expect(
      await h.db.select().from(schema.sessions).where(eq(schema.sessions.userId, user.userId)),
    ).toHaveLength(0);
  });
});

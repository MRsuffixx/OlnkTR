import { afterAll, describe, expect, it } from "vitest";
import { eq, isUniqueViolation, schema } from "./index";
import { createTestDatabase, insertTestUser, uniqueSuffix } from "./testing";

const handle = createTestDatabase();
const db = handle.db;
afterAll(() => handle.close());

describe("database constraints (integration)", () => {
  it("applies all migrations and seeds the catalogue", async () => {
    const plans = await db.select().from(schema.plans);
    expect(plans.map((plan) => plan.key).sort()).toEqual(["business", "free", "pro"]);
    expect(plans.filter((plan) => plan.isDefault)).toHaveLength(1);
  });

  it("enforces exactly one owner per tenant-owned row", async () => {
    const user = await insertTestUser(db);
    const [organization] = await db
      .insert(schema.organizations)
      .values({ name: "Org", slug: `org-${uniqueSuffix()}` })
      .returning();
    await expect(
      db.insert(schema.profiles).values({
        username: `both-${uniqueSuffix()}`,
        displayName: "x",
        ownerUserId: user.id,
        ownerOrganizationId: organization!.id,
      }),
    ).rejects.toThrow();
    await expect(
      db.insert(schema.profiles).values({ username: `none-${uniqueSuffix()}`, displayName: "x" }),
    ).rejects.toThrow();
  });

  it("keeps usernames unique and reports unique violations", async () => {
    const user = await insertTestUser(db);
    const username = `uniq-${uniqueSuffix()}`;
    await db.insert(schema.profiles).values({ username, displayName: "a", ownerUserId: user.id });
    const error = await db
      .insert(schema.profiles)
      .values({ username, displayName: "b", ownerUserId: user.id })
      .then(() => null)
      .catch((caught: unknown) => caught);
    expect(isUniqueViolation(error)).toBe(true);
  });

  it("allows only one live subscription per owner", async () => {
    const user = await insertTestUser(db);
    const [plan] = await db.select().from(schema.plans).where(eq(schema.plans.key, "pro"));
    await db
      .insert(schema.subscriptions)
      .values({ ownerUserId: user.id, planId: plan!.id, status: "active", provider: "dev" });
    await expect(
      db
        .insert(schema.subscriptions)
        .values({ ownerUserId: user.id, planId: plan!.id, status: "trialing", provider: "dev" }),
    ).rejects.toThrow();
    // Ended subscriptions do not count.
    await db
      .insert(schema.subscriptions)
      .values({ ownerUserId: user.id, planId: plan!.id, status: "expired", provider: "dev" });
  });

  it("deduplicates billing webhook events per provider", async () => {
    const providerEventId = `evt-${uniqueSuffix()}`;
    await db
      .insert(schema.billingEvents)
      .values({ provider: "dev", providerEventId, type: "x", payload: {} });
    await expect(
      db
        .insert(schema.billingEvents)
        .values({ provider: "dev", providerEventId, type: "x", payload: {} }),
    ).rejects.toThrow();
  });

  it("cascades user deletion to owned data", async () => {
    const user = await insertTestUser(db);
    const [profile] = await db
      .insert(schema.profiles)
      .values({ username: `casc-${uniqueSuffix()}`, displayName: "c", ownerUserId: user.id })
      .returning();
    await db.delete(schema.users).where(eq(schema.users.id, user.id));
    expect(
      await db.select().from(schema.profiles).where(eq(schema.profiles.id, profile!.id)),
    ).toHaveLength(0);
  });
});

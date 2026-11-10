import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { and, eq, schema } from "@olnktr/db";
import { createTestDatabase, insertTestUser, uniqueSuffix } from "@olnktr/db/testing";
import type { AnalyticsIngestPayload } from "@olnktr/jobs";
import {
  applyAnalyticsRetention,
  getAnalyticsSummary,
  processAnalyticsEvent,
  rollupMonth,
} from "../src/index";

const handle = createTestDatabase();
const db = handle.db;

let profileId: string;
let otherProfileId: string;
let linkId: string;
let otherLinkId: string;

function event(overrides: Partial<AnalyticsIngestPayload> = {}): AnalyticsIngestPayload {
  return {
    ingestId: randomUUID(),
    type: "profile.view",
    profileId,
    linkId: null,
    blockId: null,
    occurredAt: new Date().toISOString(),
    visitorHash: "a".repeat(32),
    referrerHost: "instagram.com",
    deviceType: "mobile",
    browser: "safari",
    os: "ios",
    country: "TR",
    utm: { source: "ig", medium: null, campaign: null, term: null, content: null },
    ...overrides,
  };
}

beforeAll(async () => {
  const user = await insertTestUser(db);
  const [profile, other] = await db
    .insert(schema.profiles)
    .values([
      {
        ownerUserId: user.id,
        username: `an-${uniqueSuffix()}`,
        displayName: "A",
        status: "published",
      },
      {
        ownerUserId: user.id,
        username: `an-${uniqueSuffix()}`,
        displayName: "B",
        status: "published",
      },
    ])
    .returning();
  profileId = profile!.id;
  otherProfileId = other!.id;
  const [link, otherLink] = await db
    .insert(schema.links)
    .values([
      { profileId, title: "Site", url: "https://example.com" },
      { profileId: otherProfileId, title: "Other", url: "https://example.org" },
    ])
    .returning();
  linkId = link!.id;
  otherLinkId = otherLink!.id;
});

afterAll(async () => {
  await handle.close();
});

describe("analytics processing (integration)", () => {
  it("aggregates views with exact daily unique visitors", async () => {
    await processAnalyticsEvent(db, event({ visitorHash: "1".repeat(32) }));
    await processAnalyticsEvent(db, event({ visitorHash: "1".repeat(32) }));
    await processAnalyticsEvent(
      db,
      event({ visitorHash: "2".repeat(32), referrerHost: null, country: null }),
    );
    const [stats] = await db
      .select()
      .from(schema.analyticsDailyStats)
      .where(
        and(
          eq(schema.analyticsDailyStats.profileId, profileId),
          eq(schema.analyticsDailyStats.eventType, "profile.view"),
        ),
      );
    expect(stats).toMatchObject({ count: 3, uniqueVisitors: 2 });
  });

  it("is idempotent when the same job is retried", async () => {
    const payload = event({ type: "link.click", linkId, visitorHash: "3".repeat(32) });
    expect(await processAnalyticsEvent(db, payload)).toBe("processed");
    expect(await processAnalyticsEvent(db, payload)).toBe("duplicate");
    const [link] = await db.select().from(schema.links).where(eq(schema.links.id, linkId));
    expect(link?.clickCount).toBe(1);
  });

  it("discards events whose link belongs to another profile", async () => {
    expect(
      await processAnalyticsEvent(db, event({ type: "link.click", linkId: otherLinkId })),
    ).toBe("discarded");
  });

  it("discards events for unpublished or unknown profiles", async () => {
    expect(await processAnalyticsEvent(db, event({ profileId: randomUUID() }))).toBe("discarded");
    await db
      .update(schema.profiles)
      .set({ status: "draft" })
      .where(eq(schema.profiles.id, otherProfileId));
    expect(await processAnalyticsEvent(db, event({ profileId: otherProfileId }))).toBe("discarded");
  });

  it("serves basic and advanced summaries", async () => {
    const today = new Date().toISOString().slice(0, 10);
    const basic = await getAnalyticsSummary(db, {
      profileId,
      from: today,
      to: today,
      level: "basic",
    });
    expect(basic.totals["profile.view"]).toEqual({ count: 3, uniqueVisitors: 2 });
    expect(basic.totals["link.click"].count).toBe(1);
    expect(basic.breakdowns).toBeUndefined();

    const advanced = await getAnalyticsSummary(db, {
      profileId,
      from: today,
      to: today,
      level: "advanced",
    });
    expect(advanced.breakdowns?.referrer).toEqual(
      expect.arrayContaining([
        { value: "instagram.com", count: 3 },
        { value: "(direct)", count: 1 },
      ]),
    );
    expect(advanced.breakdowns?.link).toEqual([{ value: linkId, count: 1 }]);
  });

  it("rolls up monthly statistics idempotently", async () => {
    const month = new Date().toISOString().slice(0, 7);
    await rollupMonth(db, month);
    await rollupMonth(db, month);
    const [monthly] = await db
      .select()
      .from(schema.analyticsMonthlyStats)
      .where(
        and(
          eq(schema.analyticsMonthlyStats.profileId, profileId),
          eq(schema.analyticsMonthlyStats.eventType, "profile.view"),
        ),
      );
    expect(monthly).toMatchObject({ count: 3, visitorDays: 2 });
  });

  it("applies retention to raw events", async () => {
    const old = new Date(Date.now() - 200 * 86_400_000).toISOString();
    await processAnalyticsEvent(db, event({ occurredAt: old, visitorHash: "9".repeat(32) }));
    const result = await applyAnalyticsRetention(db, { rawDays: 90, aggregateDays: 730 });
    expect(result.rawEvents).toBeGreaterThanOrEqual(1);
    const remaining = await db
      .select()
      .from(schema.analyticsEvents)
      .where(eq(schema.analyticsEvents.profileId, profileId));
    expect(remaining.every((row) => row.occurredAt.getTime() > Date.now() - 90 * 86_400_000)).toBe(
      true,
    );
  });
});

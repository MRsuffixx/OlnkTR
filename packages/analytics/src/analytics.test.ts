import { pino } from "pino";
import { describe, expect, it } from "vitest";
import { createInMemoryJobProducer } from "@olnktr/jobs";
import {
  categorizeUserAgent,
  createAnalyticsIngestService,
  createMemoryDedupeStore,
  isBotUserAgent,
  normalizeCountry,
  referrerHost,
  rollupMonths,
  visitorHash,
} from "./index";

const CHROME_DESKTOP =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const SAFARI_IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1";
const profileId = "8d8ac610-566d-4ef0-9c22-186b2a5ed793";

describe("user agent categorization", () => {
  it("categorizes common browsers", () => {
    expect(categorizeUserAgent(CHROME_DESKTOP)).toEqual({
      deviceType: "desktop",
      browser: "chrome",
      os: "windows",
      isBot: false,
    });
    expect(categorizeUserAgent(SAFARI_IPHONE)).toMatchObject({
      deviceType: "mobile",
      browser: "safari",
      os: "ios",
    });
  });

  it.each([
    "Googlebot/2.1 (+http://www.google.com/bot.html)",
    "curl/8.0.1",
    "facebookexternalhit/1.1",
    "",
    null,
  ])("flags %s as a bot", (ua) => {
    expect(isBotUserAgent(ua)).toBe(true);
  });
});

describe("privacy helpers", () => {
  it("rotates visitor hashes daily and never exposes the IP", () => {
    const base = { secret: "s", ip: "203.0.113.9", userAgent: CHROME_DESKTOP, profileId };
    const day1 = visitorHash({ ...base, day: "2026-01-01" });
    expect(day1).toHaveLength(32);
    expect(day1).not.toContain("203");
    expect(visitorHash({ ...base, day: "2026-01-01" })).toBe(day1);
    expect(visitorHash({ ...base, day: "2026-01-02" })).not.toBe(day1);
  });

  it("reduces referrers to hosts and drops internal ones", () => {
    expect(referrerHost("https://www.instagram.com/p/123?x=1", ["olnk.tr"])).toBe("instagram.com");
    expect(referrerHost("https://olnk.tr/other", ["olnk.tr"])).toBeNull();
    expect(referrerHost("javascript:alert(1)", [])).toBeNull();
  });

  it("validates country codes", () => {
    expect(normalizeCountry("tr")).toBe("TR");
    expect(normalizeCountry("XX")).toBeNull();
    expect(normalizeCountry("T1")).toBeNull();
  });

  it("rolls up the previous and current month", () => {
    expect(rollupMonths(new Date("2026-01-15T00:00:00Z"))).toEqual(["2025-12", "2026-01"]);
  });
});

describe("ingestion", () => {
  const make = () => {
    const jobs = createInMemoryJobProducer();
    const service = createAnalyticsIngestService({
      jobs,
      dedupe: createMemoryDedupeStore(),
      secret: "secret",
      ownHosts: ["olnk.tr"],
      logger: pino({ level: "silent" }),
    });
    return { jobs, service };
  };
  const context = { ip: "203.0.113.9", userAgent: CHROME_DESKTOP, country: "tr" };

  it("enqueues anonymized events without the raw IP", async () => {
    const { jobs, service } = make();
    const result = await service.ingest(
      { type: "profile.view", profileId, referrer: "https://t.co/x" },
      context,
    );
    expect(result.accepted).toBe(true);
    const [job] = jobs.take("analytics");
    expect(JSON.stringify(job?.payload)).not.toContain("203.0.113.9");
    expect(job?.payload).toMatchObject({
      referrerHost: "t.co",
      country: "TR",
      deviceType: "desktop",
    });
  });

  it("filters bots and respects opt-out", async () => {
    const { service } = make();
    expect(
      await service.ingest(
        { type: "profile.view", profileId },
        { ...context, userAgent: "Googlebot/2.1" },
      ),
    ).toEqual({
      accepted: false,
      reason: "bot",
    });
    expect(
      await service.ingest({ type: "profile.view", profileId }, { ...context, optOut: true }),
    ).toEqual({
      accepted: false,
      reason: "opt_out",
    });
  });

  it("suppresses obvious duplicates within the window", async () => {
    const { service } = make();
    expect((await service.ingest({ type: "profile.view", profileId }, context)).accepted).toBe(
      true,
    );
    expect(await service.ingest({ type: "profile.view", profileId }, context)).toEqual({
      accepted: false,
      reason: "duplicate",
    });
    // A different visitor is counted.
    expect(
      (
        await service.ingest(
          { type: "profile.view", profileId },
          { ...context, ip: "198.51.100.1" },
        )
      ).accepted,
    ).toBe(true);
  });

  it("degrades gracefully when the queue is unavailable", async () => {
    const { jobs, service } = make();
    jobs.failNext = true;
    expect(await service.ingest({ type: "profile.view", profileId }, context)).toEqual({
      accepted: false,
      reason: "queue_unavailable",
    });
  });
});

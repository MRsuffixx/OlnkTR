import { and, eq, schema, sql, type Database } from "@olnktr/db";
import type { AnalyticsIngestPayload } from "@olnktr/jobs";
import { utcDay } from "./privacy";

/**
 * Worker-side processing of one analytics event. The raw insert keyed on
 * `ingest_id` makes the whole transaction idempotent: a retried job finds the
 * event already stored and changes nothing, so aggregates are never double
 * counted.
 */
export type AnalyticsProcessResult = "processed" | "duplicate" | "discarded";

export async function processAnalyticsEvent(
  db: Database,
  event: AnalyticsIngestPayload,
): Promise<AnalyticsProcessResult> {
  return db.transaction(async (tx) => {
    // Only count events for profiles that are publicly reachable, and links/blocks that belong to them.
    const [profile] = await tx
      .select({ id: schema.profiles.id })
      .from(schema.profiles)
      .where(and(eq(schema.profiles.id, event.profileId), eq(schema.profiles.status, "published")));
    if (!profile) return "discarded";
    if (event.linkId) {
      const [link] = await tx
        .select({ id: schema.links.id })
        .from(schema.links)
        .where(and(eq(schema.links.id, event.linkId), eq(schema.links.profileId, event.profileId)));
      if (!link) return "discarded";
    }
    if (event.blockId) {
      const [block] = await tx
        .select({ id: schema.blocks.id })
        .from(schema.blocks)
        .where(
          and(eq(schema.blocks.id, event.blockId), eq(schema.blocks.profileId, event.profileId)),
        );
      if (!block) return "discarded";
    }

    const occurredAt = new Date(event.occurredAt);
    const day = utcDay(occurredAt);
    const [inserted] = await tx
      .insert(schema.analyticsEvents)
      .values({
        ingestId: event.ingestId,
        eventType: event.type,
        profileId: event.profileId,
        linkId: event.linkId,
        blockId: event.blockId,
        occurredAt,
        visitorHash: event.visitorHash,
        referrerHost: event.referrerHost,
        deviceType: event.deviceType,
        browser: event.browser,
        os: event.os,
        country: event.country,
        utmSource: event.utm.source,
        utmMedium: event.utm.medium,
        utmCampaign: event.utm.campaign,
        utmTerm: event.utm.term,
        utmContent: event.utm.content,
      })
      .onConflictDoNothing({ target: schema.analyticsEvents.ingestId })
      .returning({ id: schema.analyticsEvents.id });
    if (!inserted) return "duplicate";

    const [newVisitor] = await tx
      .insert(schema.analyticsDailyVisitors)
      .values({
        profileId: event.profileId,
        day,
        eventType: event.type,
        visitorHash: event.visitorHash,
      })
      .onConflictDoNothing()
      .returning({ visitorHash: schema.analyticsDailyVisitors.visitorHash });

    await tx
      .insert(schema.analyticsDailyStats)
      .values({
        profileId: event.profileId,
        day,
        eventType: event.type,
        count: 1,
        uniqueVisitors: newVisitor ? 1 : 0,
      })
      .onConflictDoUpdate({
        target: [
          schema.analyticsDailyStats.profileId,
          schema.analyticsDailyStats.day,
          schema.analyticsDailyStats.eventType,
        ],
        set: {
          count: sql`${schema.analyticsDailyStats.count} + 1`,
          uniqueVisitors: sql`${schema.analyticsDailyStats.uniqueVisitors} + ${newVisitor ? 1 : 0}`,
        },
      });

    const dimensions: [string, string][] = [
      ["referrer", event.referrerHost ?? "(direct)"],
      ["country", event.country ?? "(unknown)"],
      ["device", event.deviceType],
      ["browser", event.browser],
      ["os", event.os],
    ];
    if (event.utm.source) dimensions.push(["utm_source", event.utm.source.slice(0, 100)]);
    if (event.utm.campaign) dimensions.push(["utm_campaign", event.utm.campaign.slice(0, 100)]);
    if (event.linkId) dimensions.push(["link", event.linkId]);
    if (event.blockId) dimensions.push(["block", event.blockId]);

    await tx
      .insert(schema.analyticsDailyDimensions)
      .values(
        dimensions.map(([dimension, value]) => ({
          profileId: event.profileId,
          day,
          eventType: event.type,
          dimension,
          value,
          count: 1,
        })),
      )
      .onConflictDoUpdate({
        target: [
          schema.analyticsDailyDimensions.profileId,
          schema.analyticsDailyDimensions.day,
          schema.analyticsDailyDimensions.eventType,
          schema.analyticsDailyDimensions.dimension,
          schema.analyticsDailyDimensions.value,
        ],
        set: { count: sql`${schema.analyticsDailyDimensions.count} + 1` },
      });

    if (event.type === "link.click" && event.linkId) {
      await tx
        .update(schema.links)
        .set({ clickCount: sql`${schema.links.clickCount} + 1` })
        .where(eq(schema.links.id, event.linkId));
    }
    return "processed";
  });
}

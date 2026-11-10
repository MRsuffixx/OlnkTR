import { and, desc, eq, gte, lte, schema, sql, type DbExecutor } from "@olnktr/db";
import type { AnalyticsEventType } from "@olnktr/validators";

/**
 * Read models for dashboards and the REST API. Authorization and entitlement
 * gating (level, history window) are applied by the calling service.
 */
export interface AnalyticsSummary {
  profileId: string;
  from: string;
  to: string;
  totals: Record<AnalyticsEventType, { count: number; uniqueVisitors: number }>;
  daily: { day: string; eventType: string; count: number; uniqueVisitors: number }[];
  breakdowns?: Record<string, { value: string; count: number }[]>;
}

const BREAKDOWN_DIMENSIONS = [
  "referrer",
  "country",
  "device",
  "browser",
  "os",
  "utm_source",
  "utm_campaign",
  "link",
] as const;

export async function getAnalyticsSummary(
  db: DbExecutor,
  input: { profileId: string; from: string; to: string; level: "basic" | "advanced" },
): Promise<AnalyticsSummary> {
  const daily = await db
    .select({
      day: schema.analyticsDailyStats.day,
      eventType: schema.analyticsDailyStats.eventType,
      count: schema.analyticsDailyStats.count,
      uniqueVisitors: schema.analyticsDailyStats.uniqueVisitors,
    })
    .from(schema.analyticsDailyStats)
    .where(
      and(
        eq(schema.analyticsDailyStats.profileId, input.profileId),
        gte(schema.analyticsDailyStats.day, input.from),
        lte(schema.analyticsDailyStats.day, input.to),
      ),
    )
    .orderBy(schema.analyticsDailyStats.day);

  const totals: AnalyticsSummary["totals"] = {
    "profile.view": { count: 0, uniqueVisitors: 0 },
    "link.click": { count: 0, uniqueVisitors: 0 },
    "block.view": { count: 0, uniqueVisitors: 0 },
  };
  for (const row of daily) {
    const bucket = totals[row.eventType as AnalyticsEventType];
    if (bucket) {
      bucket.count += Number(row.count);
      bucket.uniqueVisitors += Number(row.uniqueVisitors);
    }
  }

  const summary: AnalyticsSummary = {
    profileId: input.profileId,
    from: input.from,
    to: input.to,
    totals,
    daily: daily.map((row) => ({
      ...row,
      count: Number(row.count),
      uniqueVisitors: Number(row.uniqueVisitors),
    })),
  };

  if (input.level === "advanced") {
    const rows = await db
      .select({
        dimension: schema.analyticsDailyDimensions.dimension,
        value: schema.analyticsDailyDimensions.value,
        count: sql<number>`sum(${schema.analyticsDailyDimensions.count})::bigint`.mapWith(Number),
      })
      .from(schema.analyticsDailyDimensions)
      .where(
        and(
          eq(schema.analyticsDailyDimensions.profileId, input.profileId),
          gte(schema.analyticsDailyDimensions.day, input.from),
          lte(schema.analyticsDailyDimensions.day, input.to),
        ),
      )
      .groupBy(schema.analyticsDailyDimensions.dimension, schema.analyticsDailyDimensions.value)
      .orderBy(desc(sql`sum(${schema.analyticsDailyDimensions.count})`));
    summary.breakdowns = Object.fromEntries(
      BREAKDOWN_DIMENSIONS.map((dimension) => [
        dimension,
        rows
          .filter((row) => row.dimension === dimension)
          .slice(0, 20)
          .map(({ value, count }) => ({ value, count })),
      ]),
    );
  }
  return summary;
}

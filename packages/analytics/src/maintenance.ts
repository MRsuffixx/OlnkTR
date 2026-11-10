import { schema, sql, type Database } from "@olnktr/db";

/** Recomputes monthly roll-ups from daily stats (idempotent: overwrites the month). */
export async function rollupMonth(db: Database, month: string): Promise<number> {
  const start = `${month}-01`;
  const result = await db.execute(sql`
    insert into ${schema.analyticsMonthlyStats} (profile_id, month, event_type, count, visitor_days)
    select profile_id, ${start}::date, event_type, sum(count), sum(unique_visitors)
    from ${schema.analyticsDailyStats}
    where day >= ${start}::date and day < (${start}::date + interval '1 month')
    group by profile_id, event_type
    on conflict (profile_id, month, event_type)
    do update set count = excluded.count, visitor_days = excluded.visitor_days
  `);
  return result.count;
}

/** Months to roll up on each run: the current and the previous month (late events). */
export function rollupMonths(now: Date): string[] {
  const current = now.toISOString().slice(0, 7);
  const previousDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  return [previousDate.toISOString().slice(0, 7), current];
}

async function deleteInBatches(
  db: Database,
  statement: () => ReturnType<typeof sql>,
): Promise<number> {
  let total = 0;
  for (let round = 0; round < 1000; round++) {
    const result = await db.execute(statement());
    total += result.count;
    if (result.count < 5000) break;
  }
  return total;
}

/**
 * Applies retention policies in small batches (no long table locks):
 *  - raw events: `rawDays`
 *  - daily visitor sets: 2 days (only needed for same-day unique counting)
 *  - daily stats/dimensions: `aggregateDays`
 */
export async function applyAnalyticsRetention(
  db: Database,
  options: { rawDays: number; aggregateDays: number; now?: Date },
) {
  const now = options.now ?? new Date();
  const rawCutoff = new Date(now.getTime() - options.rawDays * 86_400_000);
  const visitorCutoff = new Date(now.getTime() - 2 * 86_400_000).toISOString().slice(0, 10);
  const aggregateCutoff = new Date(now.getTime() - options.aggregateDays * 86_400_000)
    .toISOString()
    .slice(0, 10);

  const rawEvents = await deleteInBatches(
    db,
    () =>
      sql`delete from ${schema.analyticsEvents} where id in (select id from ${schema.analyticsEvents} where occurred_at < ${rawCutoff.toISOString()}::timestamptz limit 5000)`,
  );
  const visitors = await deleteInBatches(
    db,
    () =>
      sql`delete from ${schema.analyticsDailyVisitors} where ctid in (select ctid from ${schema.analyticsDailyVisitors} where day < ${visitorCutoff}::date limit 5000)`,
  );
  const dailyStats = await deleteInBatches(
    db,
    () =>
      sql`delete from ${schema.analyticsDailyStats} where ctid in (select ctid from ${schema.analyticsDailyStats} where day < ${aggregateCutoff}::date limit 5000)`,
  );
  const dimensions = await deleteInBatches(
    db,
    () =>
      sql`delete from ${schema.analyticsDailyDimensions} where ctid in (select ctid from ${schema.analyticsDailyDimensions} where day < ${aggregateCutoff}::date limit 5000)`,
  );
  return { rawEvents, visitors, dailyStats, dimensions };
}

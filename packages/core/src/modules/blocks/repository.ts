import { and, asc, eq, gte, schema, sql, type DbExecutor } from "@olnktr/db";

/** Layout data-access functions (block ordering) shared with the links module via index.ts. */
export const blockLayout = {
  async listByProfile(db: DbExecutor, profileId: string) {
    return db
      .select()
      .from(schema.blocks)
      .where(eq(schema.blocks.profileId, profileId))
      .orderBy(asc(schema.blocks.position), asc(schema.blocks.createdAt));
  },

  async nextPosition(db: DbExecutor, profileId: string): Promise<number> {
    const [row] = await db
      .select({ next: sql<number>`coalesce(max(${schema.blocks.position}) + 1, 0)::int` })
      .from(schema.blocks)
      .where(eq(schema.blocks.profileId, profileId));
    return row?.next ?? 0;
  },

  /** Opens a gap at `position` (call inside a transaction holding the profile lock). */
  async shiftFrom(db: DbExecutor, profileId: string, position: number): Promise<void> {
    await db
      .update(schema.blocks)
      .set({ position: sql`${schema.blocks.position} + 1` })
      .where(and(eq(schema.blocks.profileId, profileId), gte(schema.blocks.position, position)));
  },

  async insert(db: DbExecutor, values: typeof schema.blocks.$inferInsert) {
    const [row] = await db.insert(schema.blocks).values(values).returning();
    return row!;
  },

  async setPositions(db: DbExecutor, positions: { id: string; position: number }[]): Promise<void> {
    for (const { id, position } of positions) {
      await db.update(schema.blocks).set({ position }).where(eq(schema.blocks.id, id));
    }
  },
};

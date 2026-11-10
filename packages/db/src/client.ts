import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

export type Schema = typeof schema;
export type Database = PostgresJsDatabase<Schema>;
/** A transaction handle; accepted anywhere a `Database` is (see `DbExecutor`). */
export type Transaction = Parameters<Parameters<Database["transaction"]>[0]>[0];
/** Repositories accept either the root database or an open transaction. */
export type DbExecutor = Database | Transaction;

export interface DatabaseHandle {
  db: Database;
  /** Closes the pool, waiting up to `timeoutSeconds` for active queries. */
  close(timeoutSeconds?: number): Promise<void>;
  /** Lightweight connectivity probe used by health checks. */
  ping(): Promise<void>;
}

export interface CreateDatabaseOptions {
  url: string;
  maxConnections?: number;
  applicationName?: string;
}

export function createDatabase(options: CreateDatabaseOptions): DatabaseHandle {
  const client = postgres(options.url, {
    max: options.maxConnections ?? 10,
    idle_timeout: 30,
    connect_timeout: 10,
    prepare: true,
    onnotice: () => undefined,
    connection: { application_name: options.applicationName ?? "olnktr" },
  });
  const db = drizzle({ client, schema, casing: "snake_case" });
  return {
    db,
    close: (timeoutSeconds = 5) => client.end({ timeout: timeoutSeconds }),
    ping: async () => {
      await client`select 1`;
    },
  };
}

/** Postgres error helpers (SQLSTATE codes). */
export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  const pgError = findPostgresError(error);
  return pgError?.code === "23505" && (!constraint || pgError.constraint_name === constraint);
}

export function isForeignKeyViolation(error: unknown): boolean {
  return findPostgresError(error)?.code === "23503";
}

function findPostgresError(error: unknown): { code?: string; constraint_name?: string } | null {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth++) {
    if (current instanceof postgres.PostgresError) return current;
    current = (current as { cause?: unknown }).cause;
  }
  return null;
}

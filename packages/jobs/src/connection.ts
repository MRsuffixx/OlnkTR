import { Redis, type RedisOptions } from "ioredis";

export type { Redis };

/**
 * Redis connections.
 *  - `producer`: fails fast (no offline queue, 1 retry) so web requests never
 *    hang when Redis is down; callers fall back or return 503.
 *  - `worker`: retries forever (BullMQ requirement `maxRetriesPerRequest: null`)
 *    so workers recover automatically once Redis is back.
 */
export function createRedisConnection(url: string, role: "producer" | "worker" | "client"): Redis {
  const base: RedisOptions = {
    connectTimeout: 5_000,
    retryStrategy: (times) => Math.min(times * 200, 5_000),
  };
  const options: RedisOptions =
    role === "worker"
      ? { ...base, maxRetriesPerRequest: null, enableReadyCheck: true }
      : { ...base, maxRetriesPerRequest: 1, enableOfflineQueue: false, commandTimeout: 2_000 };
  const connection = new Redis(url, options);
  // Errors surface through rejected commands; avoid unhandled 'error' events.
  connection.on("error", () => undefined);
  return connection;
}

export function bullPrefix(keyPrefix: string): string {
  return `${keyPrefix}:bull`;
}

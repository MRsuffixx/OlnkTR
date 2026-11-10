import type { Redis } from "ioredis";

/**
 * Short-window duplicate suppression ("claim" a key once per TTL). Redis is
 * used when available; if Redis is unreachable the store degrades to a bounded
 * in-process map instead of failing the request.
 */
export interface DedupeStore {
  /** Returns true the first time `key` is seen within `ttlSeconds`. */
  claim(key: string, ttlSeconds: number): Promise<boolean>;
}

export function createMemoryDedupeStore(maxEntries = 50_000): DedupeStore {
  const entries = new Map<string, number>();
  return {
    claim(key, ttlSeconds) {
      const now = Date.now();
      const expiresAt = entries.get(key);
      if (expiresAt && expiresAt > now) return Promise.resolve(false);
      if (entries.size >= maxEntries) {
        for (const [entryKey, entryExpiry] of entries) {
          if (entryExpiry <= now || entries.size >= maxEntries) entries.delete(entryKey);
          if (entries.size < maxEntries * 0.9) break;
        }
      }
      entries.set(key, now + ttlSeconds * 1000);
      return Promise.resolve(true);
    },
  };
}

export function createRedisDedupeStore(
  redis: Redis,
  prefix: string,
  fallback = createMemoryDedupeStore(),
): DedupeStore {
  return {
    async claim(key, ttlSeconds) {
      try {
        const result = await redis.set(`${prefix}:dedupe:${key}`, "1", "EX", ttlSeconds, "NX");
        return result === "OK";
      } catch {
        return fallback.claim(key, ttlSeconds);
      }
    },
  };
}

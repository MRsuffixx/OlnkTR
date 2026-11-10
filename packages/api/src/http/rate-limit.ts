import type { Redis } from "ioredis";

/**
 * Fixed-window rate limiter. Redis-backed (shared across instances) with an
 * in-process fallback so limits still apply while Redis is unavailable.
 */
export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export interface RateLimiter {
  consume(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult>;
}

export function createMemoryRateLimiter(maxKeys = 100_000): RateLimiter {
  const windows = new Map<string, { count: number; resetAt: number }>();
  return {
    consume(key, limit, windowSeconds) {
      const now = Date.now();
      let entry = windows.get(key);
      if (!entry || entry.resetAt <= now) {
        if (windows.size >= maxKeys) {
          for (const [entryKey, value] of windows)
            if (value.resetAt <= now) windows.delete(entryKey);
          if (windows.size >= maxKeys) windows.clear();
        }
        entry = { count: 0, resetAt: now + windowSeconds * 1000 };
        windows.set(key, entry);
      }
      entry.count++;
      const retryAfterSeconds = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
      return Promise.resolve({
        allowed: entry.count <= limit,
        limit,
        remaining: Math.max(0, limit - entry.count),
        retryAfterSeconds,
      });
    },
  };
}

const SCRIPT = `
local current = redis.call('INCR', KEYS[1])
if current == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end
local ttl = redis.call('TTL', KEYS[1])
return {current, ttl}
`;

export function createRedisRateLimiter(
  redis: Redis,
  prefix: string,
  fallback: RateLimiter = createMemoryRateLimiter(),
): RateLimiter {
  return {
    async consume(key, limit, windowSeconds) {
      try {
        const [count, ttl] = (await redis.eval(
          SCRIPT,
          1,
          `${prefix}:ratelimit:${key}`,
          String(windowSeconds),
        )) as [number, number];
        return {
          allowed: count <= limit,
          limit,
          remaining: Math.max(0, limit - count),
          retryAfterSeconds: Math.max(1, ttl),
        };
      } catch {
        return fallback.consume(key, limit, windowSeconds);
      }
    },
  };
}

export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  const headers: Record<string, string> = {
    "RateLimit-Limit": String(result.limit),
    "RateLimit-Remaining": String(result.remaining),
    "RateLimit-Reset": String(result.retryAfterSeconds),
  };
  if (!result.allowed) headers["Retry-After"] = String(result.retryAfterSeconds);
  return headers;
}

/**
 * In-memory rate limiter for development / local use only.
 *
 * PRODUCTION NOTE: This store is per-process and resets on every deploy/restart.
 * Replace with Upstash Redis (@upstash/ratelimit), Next.js middleware edge rate
 * limiting, or a persistent backend before going live.
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimiterOptions {
  limit: number;
  windowMs: number;
}

const store = new Map<string, RateLimitEntry>();

export function createRateLimiter(options: RateLimiterOptions) {
  const { limit, windowMs } = options;

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart >= windowMs) {
      store.set(key, { count: 1, windowStart: now });
      return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
    }

    entry.count += 1;
    const remaining = Math.max(0, limit - entry.count);
    const resetAt = entry.windowStart + windowMs;

    return { allowed: entry.count <= limit, remaining, resetAt };
  };
}

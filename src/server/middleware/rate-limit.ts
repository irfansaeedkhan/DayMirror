import type { Context, Next } from "hono";
import { HTTPException } from "hono/http-exception";

type Bucket = {
  count: number;
  resetAt: number;
};

/**
 * In-memory fixed-window rate limiter, keyed by client IP.
 * Good enough for launch on a single instance; swap the store for
 * Upstash Redis when running on serverless with real traffic.
 */
const buckets = new Map<string, Bucket>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function getClientKey(c: Context): string {
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return c.req.header("x-real-ip") ?? "unknown";
}

type RateLimitOptions = {
  windowMs?: number;
  limit?: number;
};

export function rateLimiter({ windowMs = 60_000, limit = 300 }: RateLimitOptions = {}) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    cleanup(now);

    const key = getClientKey(c);
    let bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      bucket = { count: 0, resetAt: now + windowMs };
      buckets.set(key, bucket);
    }

    bucket.count += 1;

    const remaining = Math.max(0, limit - bucket.count);
    c.header("X-RateLimit-Limit", String(limit));
    c.header("X-RateLimit-Remaining", String(remaining));
    c.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count > limit) {
      c.header("Retry-After", String(Math.ceil((bucket.resetAt - now) / 1000)));
      throw new HTTPException(429, { message: "Too many requests. Please slow down." });
    }

    await next();
  };
}

/**
 * Simple in-memory rate limiter, keyed by IP + action.
 *
 * IMPORTANT LIMITATION: this only works correctly on a single long-running
 * server process. It resets on every deploy/restart and does NOT work
 * correctly across multiple serverless instances (e.g. Vercel functions),
 * since each instance has its own memory. For production on serverless
 * infrastructure, replace this with a shared store — Upstash Redis
 * (@upstash/ratelimit) is the standard choice and a near drop-in swap for
 * the `check()` function below.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export function checkRateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return { allowed: false, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true };
}

// Periodically clear expired buckets so this doesn't grow unbounded
// in a long-running process.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 5 * 60 * 1000).unref?.();

import { NextResponse } from "next/server";

interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  for (const [key, bucket] of buckets) {
    if (now - bucket.lastRefill > windowMs * 2) {
      buckets.delete(key);
    }
  }
}

/**
 * Server-side sliding-window rate limiter keyed by IP.
 * Returns null if the request is allowed, or a 429 NextResponse if rate-limited.
 */
export function checkServerRateLimit(
  ip: string | null,
  { windowMs, maxRequests }: RateLimitOptions,
): NextResponse | null {
  const key = ip ?? "unknown";
  const now = Date.now();

  cleanup(windowMs);

  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: maxRequests - 1, lastRefill: now };
    buckets.set(key, bucket);
    return null;
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = (elapsed / windowMs) * maxRequests;
  bucket.tokens = Math.min(maxRequests, bucket.tokens + refill);
  bucket.lastRefill = now;

  if (bucket.tokens < 1) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) },
      },
    );
  }

  bucket.tokens -= 1;
  return null;
}

// lib/rate-limit.ts
// Rate limits keyed by client IP.
//
// With UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN set (Vercel → Settings →
// Environment Variables; connecting Upstash through Vercel's Storage tab may name them
// KV_REST_API_URL and KV_REST_API_TOKEN instead, which also work), counts are kept in Upstash Redis, so a limit holds across every
// Vercel server instance. Without them, or if Redis can't be reached, each instance keeps
// its own counts in memory — looser, but the site keeps working.

import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const REDIS_URL = (process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL)?.trim();
const REDIS_TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN)?.trim();
const redis = REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ── Shared limiter (Upstash) ──────────────────────────────────
const limiters = new Map<string, Ratelimit>();
function sharedLimiter(name: string, limit: number, windowMs: number): Ratelimit | null {
  if (!redis) return null;
  const key = `${name}:${limit}:${windowMs}`;
  let rl = limiters.get(key);
  if (!rl) {
    rl = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`), prefix: `pello:${name}` });
    limiters.set(key, rl);
  }
  return rl;
}

// ── In-memory fallback (per instance, fixed window) ───────────
type Window = { count: number; resetAt: number };
const buckets = new Map<string, Window>();

function memoryHit(key: string, limit: number, windowMs: number, consume: boolean): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  let w = buckets.get(key);
  if (!w || w.resetAt <= now) {
    w = { count: 0, resetAt: now + windowMs };
    buckets.set(key, w);
    pruneExpired(now);
  }
  if (consume) w.count++;
  return { success: w.count <= limit, remaining: Math.max(0, limit - w.count), reset: w.resetAt };
}

function pruneExpired(now: number) {
  if (buckets.size < 5000) return;
  buckets.forEach((w, key) => {
    if (w.resetAt <= now) buckets.delete(key);
  });
}

// Counts one request and says whether it's within the limit.
async function hit(name: string, id: string, limit: number, windowMs: number) {
  const rl = sharedLimiter(name, limit, windowMs);
  if (rl) {
    try {
      const r = await rl.limit(id);
      return { success: r.success, remaining: r.remaining, reset: r.reset };
    } catch (e) {
      console.error("Upstash rate limit unavailable, using in-memory limit:", e);
    }
  }
  return memoryHit(`${name}:${id}`, limit, windowMs, true);
}

function tooMany(message: string, limit: number, remaining: number, reset: number): NextResponse {
  const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000));
  return NextResponse.json({ error: message }, {
    status: 429,
    headers: {
      "Retry-After": String(retryAfter),
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(reset),
    },
  });
}

// Returns a 429 response if this client is over the limit, otherwise null.
// `name` separates limits per endpoint, e.g. await rateLimit(req, "plan", 10, HOUR).
export async function rateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number,
  message = "Too many requests. Please try again later."
): Promise<NextResponse | null> {
  const r = await hit(name, clientIp(req), limit, windowMs);
  return r.success ? null : tooMany(message, limit, r.remaining, r.reset);
}

// For password checks: only failed attempts count. `locked` is checked before the password
// so a locked-out client can't keep guessing; `fail` records a wrong password.
export function failureLimit(name: string, limit: number, windowMs: number) {
  const rl = sharedLimiter(name, limit, windowMs);
  return {
    async locked(id: string): Promise<{ locked: boolean; reset: number }> {
      if (rl) {
        try {
          const r = await rl.getRemaining(id);
          return { locked: r.remaining <= 0, reset: r.reset };
        } catch (e) {
          console.error("Upstash rate limit unavailable, using in-memory limit:", e);
        }
      }
      const m = memoryHit(`${name}:${id}`, limit, windowMs, false);
      return { locked: m.remaining <= 0, reset: m.reset };
    },
    async fail(id: string): Promise<void> {
      await hit(name, id, limit, windowMs);
    },
    tooMany: (message: string, reset: number) => tooMany(message, limit, 0, reset),
  };
}

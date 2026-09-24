// lib/rate-limit.ts
// Simple fixed-window rate limiter, keyed by client IP.
//
// State lives in memory, so each Vercel server instance keeps its own counts
// and they reset when an instance restarts. That's enough to stop casual abuse
// of the AI endpoints; for hard limits across all instances, move this to a
// shared store such as Upstash Redis or a Supabase table.

import { NextRequest, NextResponse } from "next/server";

type Window = { count: number; resetAt: number };

const buckets = new Map<string, Window>();

export function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Returns a 429 response if this client is over the limit, otherwise null.
// `name` separates limits per endpoint, e.g. rateLimit(req, "plan", 5, 60_000).
export function rateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): NextResponse | null {
  const now = Date.now();
  const key = `${name}:${clientIp(req)}`;
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    pruneExpired(now);
    return null;
  }

  current.count++;
  if (current.count <= limit) return null;

  const retryAfter = Math.ceil((current.resetAt - now) / 1000);
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}

function pruneExpired(now: number) {
  if (buckets.size < 5000) return;
  buckets.forEach((w, key) => {
    if (w.resetAt <= now) buckets.delete(key);
  });
}

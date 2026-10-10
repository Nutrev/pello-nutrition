import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createHash } from "node:crypto";
import { getServerSupabase } from "@/lib/supabase/server";
import { isProUser } from "@/lib/subscription-server";
import { PRO_ENABLED } from "@/lib/pro";
import { rateLimit, HOUR, sharedRedis } from "@/lib/rate-limit";
import { getProductSummaries } from "@/lib/catalog";
import { ASK_QUERY_SCHEMA, parseAskQuery, type AskQuery } from "@/lib/ask/query";
import { ASK_SYSTEM_PROMPT } from "@/lib/ask/prompt";
import { runAskQuery, describeAskQuery, exploreHref, UNSUPPORTED_MESSAGE, ASK_EXAMPLES } from "@/lib/ask/run";
import { limitForAccess } from "@/lib/ask/access";

// Ask Pello: a plain-English question about the product library → a structured query (from Claude,
// constrained to lib/ask/query.ts's schema) → run on Pello's own data. The model never writes the
// answer or any figure. Free visitors see the top results; Pello Pro members see them all.
// Questions are sent to Anthropic to build the query and aren't stored by Pello (a hash of the
// question caches its query for a day).

export const dynamic = "force-dynamic";

const client = new Anthropic();
const MODEL = "claude-haiku-5-5";
const CACHE_SECONDS = 60 * 60 * 24;
const memoryCache = new Map<string, { query: AskQuery; at: number }>();

const normalize = (q: string) => q.toLowerCase().replace(/\s+/g, " ").replace(/[?!.]+$/, "").trim();

async function cachedQuery(key: string): Promise<AskQuery | null> {
  try {
    if (sharedRedis) return parseAskQuery(await sharedRedis.get(key));
  } catch {}
  const m = memoryCache.get(key);
  return m && Date.now() - m.at < CACHE_SECONDS * 1000 ? m.query : null;
}
async function storeQuery(key: string, query: AskQuery) {
  try {
    if (sharedRedis) { await sharedRedis.set(key, query, { ex: CACHE_SECONDS }); return; }
  } catch {}
  memoryCache.set(key, { query, at: Date.now() });
  if (memoryCache.size > 500) memoryCache.delete(memoryCache.keys().next().value!);
}

async function queryFor(question: string): Promise<AskQuery | "refused" | null> {
  // The installed SDK predates structured outputs and adaptive-thinking models in its types; the
  // request body is passed through as written.
  const params = {
    model: MODEL,
    max_tokens: 2048,
    system: [{ type: "text", text: ASK_SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    output_config: { effort: "low", format: { type: "json_schema", schema: ASK_QUERY_SCHEMA } },
    messages: [{ role: "user", content: `Question: ${question}` }],
  } as unknown as Anthropic.MessageCreateParamsNonStreaming;
  const res = await client.messages.create(params);
  if ((res.stop_reason as string) === "refusal") return "refused";
  const text = (res.content as { type: string; text?: string }[]).find((b) => b.type === "text")?.text;
  if (!text) return null;
  try { return parseAskQuery(JSON.parse(text)); } catch { return null; }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const question = typeof body?.question === "string" ? body.question.trim() : "";
  if (question.length < 3) return NextResponse.json({ error: "Ask a question about Pello's products." }, { status: 400 });
  if (question.length > 200) return NextResponse.json({ error: "Keep your question under 200 characters." }, { status: 400 });

  const { data: { user } } = await getServerSupabase().auth.getUser();
  const allowed = !PRO_ENABLED || (user ? await isProUser(user.id) : false);
  const limited = await rateLimit(req, allowed ? "ask-pro" : "ask", allowed ? 60 : 10, HOUR, "You've asked a lot of questions. Try again in a little while.");
  if (limited) return limited;

  const key = `pello:ask:v1:${createHash("sha256").update(normalize(question)).digest("hex").slice(0, 32)}`;
  let query = await cachedQuery(key);
  if (!query) {
    let made: Awaited<ReturnType<typeof queryFor>>;
    try {
      made = await queryFor(question);
    } catch (e) {
      console.error("Ask Pello model error:", e);
      return NextResponse.json({ error: "Couldn't answer that right now. Try again in a moment." }, { status: 502 });
    }
    if (made === "refused" || made === null) {
      return NextResponse.json({ unsupported: UNSUPPORTED_MESSAGE.other, examples: ASK_EXAMPLES });
    }
    query = made;
    await storeQuery(key, query);
  }

  if (!query.supported) {
    return NextResponse.json({ unsupported: UNSUPPORTED_MESSAGE[query.unsupportedReason ?? "other"] ?? UNSUPPORTED_MESSAGE.other, examples: ASK_EXAMPLES });
  }

  const result = runAskQuery(query, getProductSummaries());
  const shown = limitForAccess(query.limit, allowed);
  return NextResponse.json({
    chips: describeAskQuery(query),
    exploreHref: exploreHref(query),
    items: result.items.slice(0, shown),
    total: result.total,
    available: Math.min(result.total, query.limit),
    locked: !allowed && Math.min(result.total, query.limit) > shown,
    missing: result.missing,
  });
}

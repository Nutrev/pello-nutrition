import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { AI_HOUSE_STYLE } from "@/lib/ai-style";
import { buildPlanPrompt, parsePlannerInputs } from "@/lib/planner";
import { rateLimit } from "@/lib/rate-limit";
import { getServerSupabase } from "@/lib/supabase/server";
import { supabase as admin } from "@/lib/supabase";
import { isProUser } from "@/lib/subscription-server";
import { PRO_ENABLED, FREE_PLANS_PER_MONTH, monthStart, nextMonthStart } from "@/lib/pro";
import { getProductSummaries } from "@/lib/catalog";
import { parseStackInputs, parseRaceWeekInputs, parseBudgetInputs, stackCandidates, raceWeekCandidates } from "@/lib/planner-modes";
import { buildStackPrompt, buildRaceWeekPrompt, buildBudgetPrompt } from "@/lib/planner-mode-prompts";

const client = new Anthropic();

// Once Pello Pro is on: plans need a (free) account; free accounts get race day and
// today's workout plans only, FREE_PLANS_PER_MONTH per calendar month between them. Pro is unlimited. Checked here, not just in the
// page, so the limits can't be skipped.
interface Usage { pro: boolean; used: number; limit: number; resetsOn: string }

async function usageFor(userId: string): Promise<Usage> {
  const pro = await isProUser(userId);
  if (pro) return { pro, used: 0, limit: Infinity, resetsOn: nextMonthStart().toISOString() };
  const { count } = await admin.from("planner_uses").select("id", { count: "exact", head: true })
    .eq("user_id", userId).gte("created_at", monthStart().toISOString());
  return { pro, used: count ?? 0, limit: FREE_PLANS_PER_MONTH, resetsOn: nextMonthStart().toISOString() };
}

const json = (u: Usage) => ({ ...u, limit: Number.isFinite(u.limit) ? u.limit : null });

// The signed-in user's allowance this month.
export async function GET() {
  if (!PRO_ENABLED) return NextResponse.json({ gated: false });
  const { data: { user } } = await getServerSupabase().auth.getUser();
  if (!user) return NextResponse.json({ gated: true, signedIn: false });
  return NextResponse.json({ gated: true, signedIn: true, usage: json(await usageFor(user.id)) });
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "plan", 5, 60_000);
  if (limited) return limited;

  // Only accept the quiz answers, never a raw prompt, so this endpoint
  // can't be used as a general-purpose Claude proxy on our API key.
  const body = await req.json().catch(() => null);
  if (body?.planner === "supplement-stack" || body?.planner === "race-week" || body?.planner === "budget-optimiser") {
    return planMode(body.planner, body.inputs);
  }
  const inputs = parsePlannerInputs(body?.inputs);
  if (!inputs) {
    return NextResponse.json({ error: "Invalid planner inputs" }, { status: 400 });
  }

  let userId: string | null = null;
  let usage: Usage | null = null;
  if (PRO_ENABLED) {
    const { data: { user } } = await getServerSupabase().auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in to build a plan.", code: "signin" }, { status: 401 });
    userId = user.id;
    usage = await usageFor(user.id);
    if (!usage.pro && inputs.workout) {
      return NextResponse.json({ error: "Workout file uploads are a Pello Pro feature.", code: "pro", usage: json(usage) }, { status: 403 });
    }
    if (!usage.pro && inputs.mode === "outcome") {
      return NextResponse.json({ error: "Goal-based plans are a Pello Pro feature.", code: "pro", usage: json(usage) }, { status: 403 });
    }
    if (!usage.pro && usage.used >= usage.limit) {
      return NextResponse.json({ error: "You've used your free plan for this month.", code: "limit", usage: json(usage) }, { status: 403 });
    }
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: AI_HOUSE_STYLE,
      messages: [{ role: "user", content: buildPlanPrompt(inputs) }],
    });
    const plan = message.content[0].type === "text" ? message.content[0].text : "";

    // Count the plan only once it has been generated, so failures don't use the allowance.
    if (userId && usage && !usage.pro) {
      await admin.from("planner_uses").insert({ user_id: userId });
      usage = { ...usage, used: usage.used + 1 };
    }
    return NextResponse.json({ plan, ...(usage ? { usage: json(usage) } : {}) });
  } catch (e) {
    console.error("Plan error:", e);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}

// Supplement stack and race week (Pello Pro), and the budget optimizer's strategy text (free
// account). Products are chosen here from the catalog; the browser only sends answers.
async function planMode(planner: "supplement-stack" | "race-week" | "budget-optimiser", raw: unknown) {
  const all = getProductSummaries();
  let prompt: string;
  let products: { id: string; name: string; brand: string }[] = [];
  if (planner === "supplement-stack") {
    const inputs = parseStackInputs(raw);
    if (!inputs) return NextResponse.json({ error: "Invalid planner inputs" }, { status: 400 });
    const list = stackCandidates(all, inputs);
    if (!list.length) return NextResponse.json({ error: "No products in Pello's database match these choices. Try fewer restrictions.", code: "no-products" }, { status: 422 });
    prompt = buildStackPrompt(inputs, list);
    products = list.map(({ id, name, brand }) => ({ id, name, brand }));
  } else if (planner === "race-week") {
    const inputs = parseRaceWeekInputs(raw);
    if (!inputs) return NextResponse.json({ error: "Invalid planner inputs" }, { status: 400 });
    const list = raceWeekCandidates(all, inputs);
    prompt = buildRaceWeekPrompt(inputs, list);
    products = list.map(({ id, name, brand }) => ({ id, name, brand }));
  } else {
    const inputs = parseBudgetInputs(raw);
    if (!inputs) return NextResponse.json({ error: "Invalid planner inputs" }, { status: 400 });
    prompt = buildBudgetPrompt(inputs);
  }

  if (PRO_ENABLED) {
    const { data: { user } } = await getServerSupabase().auth.getUser();
    if (!user) return NextResponse.json({ error: "Please log in to use this planner.", code: "signin" }, { status: 401 });
    if (planner !== "budget-optimiser" && !(await isProUser(user.id))) {
      return NextResponse.json({ error: "This planner is a Pello Pro feature.", code: "pro" }, { status: 403 });
    }
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: planner === "race-week" ? 3500 : 2000,
      system: AI_HOUSE_STYLE,
      messages: [{ role: "user", content: prompt }],
    });
    const plan = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ plan, products });
  } catch (e) {
    console.error("Plan error:", e);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}

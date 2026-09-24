import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPlanPrompt, parsePlannerInputs } from "@/lib/planner";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "plan", 5, 60_000);
  if (limited) return limited;

  // Only accept the quiz answers, never a raw prompt, so this endpoint
  // can't be used as a general-purpose Claude proxy on our API key.
  const body = await req.json().catch(() => null);
  const inputs = parsePlannerInputs(body?.inputs);
  if (!inputs) {
    return NextResponse.json({ error: "Invalid planner inputs" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: buildPlanPrompt(inputs) }],
    });
    const plan = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Plan error:", e);
    return NextResponse.json({ error: "Failed to generate plan" }, { status: 500 });
  }
}

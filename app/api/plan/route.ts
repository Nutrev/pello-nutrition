import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });
    const plan = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ plan });
  } catch (e) {
    console.error("Plan error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS } from "@/lib/products";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  console.log("API KEY:", process.env.ANTHROPIC_API_KEY?.slice(0, 20));
  const { productId } = await req.json();
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  const prompt = `You are a sports nutrition analyst. Based on aggregated consumer reviews and published research, write a concise report for: "${product.name}" by ${product.brand} (category: ${product.category}).

Sentiment data: ${JSON.stringify(product.sentiment)}.
Key ingredients: ${product.ingredients.map((i) => `${i.name}${i.dose ? " " + i.dose : ""} (${i.verdict})`).join(", ")}.
Reviews: ${product.reviewCount.toLocaleString()} across ${product.sources.length} sources.

Write 4 sentences in plain, friendly language. Cover: overall verdict, standout strengths, main weaknesses, and who it is best suited for. No bullet points. Under 100 words.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 300,
      messages: [{ role: "user", content: prompt }],
    });
    const summary = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ summary });
  } catch (e) {
    console.error("Anthropic error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

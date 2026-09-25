import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS, Product } from "@/lib/products";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic();

async function generateSummary(product: Product): Promise<string> {
  const facts = [
    product.reviewCount > 0
      ? `Customer rating: ${product.rating}/5 from ${product.reviewCount.toLocaleString()} reviews on The Feed (you have not read the reviews themselves).`
      : "No customer reviews are available.",
    product.certifications?.length ? `Certifications: ${product.certifications.join(", ")}.` : "No third-party certifications listed.",
    product.carbsPerServing != null ? `Carbs per serving: ${product.carbsPerServing}g.` : "",
    product.sodiumPerServing != null ? `Sodium per serving: ${product.sodiumPerServing}mg.` : "",
    product.caffeinePerServing != null ? `Caffeine per serving: ${product.caffeinePerServing}mg.` : "",
    product.proteinPerServing != null ? `Protein per serving: ${product.proteinPerServing}g.` : "",
  ].filter(Boolean).join("\n");

  const prompt = `You are a sports nutrition analyst. Write a concise summary of "${product.name}" by ${product.brand} (category: ${product.category}) using ONLY the product data below.

Key ingredients: ${product.ingredients.map((i) => `${i.name}${i.dose ? " " + i.dose : ""} (evidence: ${i.verdict})`).join(", ")}.
${facts}

Write 4 sentences in plain, friendly language. Cover: overall verdict, standout strengths, main weaknesses, and who it is best suited for. No bullet points. Under 100 words.
Don't claim to have read customer reviews, and don't describe taste, texture or stomach comfort — there's no data on those. Don't state any facts that aren't in the data above.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });
  const summary = message.content[0].type === "text" ? message.content[0].text : "";
  // Throwing keeps an empty result out of the cache.
  if (!summary) throw new Error("Empty summary from model");
  return summary;
}

// Product data is static, so each summary is generated once and reused for a week
// instead of calling Claude on every click. Failures aren't cached.
const getCachedSummary = (product: Product) =>
  unstable_cache(() => generateSummary(product), ["product-summary-v2", product.id], {
    revalidate: 60 * 60 * 24 * 7,
  })();

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "summarize", 20, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  const product = PRODUCTS.find((p) => p.id === body?.productId);
  if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

  try {
    const summary = await getCachedSummary(product);
    return NextResponse.json({ summary });
  } catch (e) {
    console.error("Anthropic error:", e);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}

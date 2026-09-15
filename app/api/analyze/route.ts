import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { product } = await req.json();
  if (!product) return NextResponse.json({ error: "Product data required" }, { status: 400 });

  const prompt = `You are Pello's sports nutrition analyst. Analyze this product for endurance athletes.

PRODUCT:
Name: ${product.product_name || "Unknown"}
Brand: ${product.brands || "Unknown"}
Ingredients: ${product.ingredients_text || "Not available"}
Nutrition per serving:
- Calories: ${product.nutriments?.["energy-kcal_serving"] || product.nutriments?.["energy-kcal_100g"] || "N/A"}
- Carbs: ${product.nutriments?.carbohydrates_serving || product.nutriments?.carbohydrates_100g || "N/A"}g
- Protein: ${product.nutriments?.proteins_serving || product.nutriments?.proteins_100g || "N/A"}g
- Sodium: ${product.nutriments?.sodium_serving || product.nutriments?.sodium_100g || "N/A"}g

Return ONLY this JSON (no other text):
{
  "verdict": "one sentence verdict for endurance athletes",
  "pros": ["up to 4 strengths"],
  "cons": ["up to 4 concerns"],
  "flags": ["concerning ingredients: artificial sweeteners, seed oils, gums, preservatives"],
  "pelloCategoryGuess": "best match: Energy Gel, Energy Chew, Energy Bar, Carbohydrate Mix, Hydration, Protein, Creatine, Supplement",
  "scienceRating": "proven | likely | disputed | insufficient-data",
  "athleteRating": 1-5,
  "keyIngredients": ["top 3-5 active ingredients"],
  "whenToUse": "brief timing recommendation",
  "suitableFor": ["endurance", "recovery", "strength", etc]
}`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = message.content[0].type === "text" ? message.content[0].text : "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const analysis = JSON.parse(clean);
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { PRODUCTS, Goal } from "@/lib/products";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { goals, budget, formats } = await req.json();
  console.log("Rank called with goals:", goals, "budget:", budget, "formats:", formats);

  const eligible = PRODUCTS.filter((p) => {
    const matchesBudget = p.price <= budget;
    const matchesGoal = (goals as string[]).some((g: string) => p.goals.includes(g as Goal));
    const ALWAYS_INCLUDE = ["Supplement", "Recovery", "Supplement", "Creatine", "Protein", "Probiotic", "Sleep"];
    const matchesFormat = !formats || formats.length === 0 || formats.includes(p.category) || ALWAYS_INCLUDE.includes(p.category);    return matchesBudget && matchesGoal && matchesFormat;
  });

  const NUTRITION_CATS = ["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration"];
const SUPPLEMENT_CATS = ["Supplement", "Supplement", "Creatine", "Protein", "Probiotic", "Sleep", "Recovery"];

const base = eligible.length > 0 ? eligible : PRODUCTS.filter((p) => p.price <= budget);

// Always include top nutrition + top supplements regardless of format filter
const topNutrition = PRODUCTS
  .filter((p) => NUTRITION_CATS.includes(p.category) && p.price <= budget && goals.some((g: string) => p.goals.includes(g as Goal)))
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

const topSupplements = PRODUCTS
  .filter((p) => SUPPLEMENT_CATS.includes(p.category) && p.price <= budget && goals.some((g: string) => p.goals.includes(g as Goal)))
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 3);

// Merge — dedupe by id, prioritise format-selected products
const merged = [...base, ...topNutrition, ...topSupplements]
  .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 10);

const pool = merged;

    
const prompt = `You are a sports nutrition advisor. A user's goals are "${goals.join(", ")}" and their budget is $${budget}/month.${formats && formats.length > 0 ? ` They prefer these product formats: ${formats.join(", ")}.` : ""}

Available products: ${pool.map((p) => `${p.name} by ${p.brand} ($${p.price}/mo, rating ${p.rating}, goals: ${p.goals.join(",")})`).join("; ")}.

Rank these products best to worst for this user's goals. For each give one sentence explaining the ranking.
Respond ONLY with a valid JSON array like: [{"id":"...","name":"...","reason":"..."}]
Use the exact id values: ${pool.map((p) => p.id).join(", ")}. No other text.`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });
    const raw = message.content[0].type === "text" ? message.content[0].text : "[]";
    const clean = raw.replace(/```json|```/g, "").trim();
    const ranked = JSON.parse(clean);
    return NextResponse.json({ ranked });
  } catch (e) {
    console.error("Rank error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

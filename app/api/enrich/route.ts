import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

function generateSlug(name: string, brand: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url, labelText, manualData, mode } = body;

  let productContext = "";

  if (mode === "url" && url) {
    // Fetch the product page
    try {
      const pageRes = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; PelloBot/1.0)" }
      });
      const html = await pageRes.text();
      // Strip HTML tags and get text content
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, 8000);
      productContext = `Product page URL: ${url}\n\nPage content:\n${text}`;
    } catch (e) {
      return NextResponse.json({ error: "Could not fetch the product page. Try label or manual mode instead." }, { status: 400 });
    }
  } else if (mode === "label" && labelText) {
    productContext = `Product label / nutrition data:\n${labelText}`;
  } else if (mode === "manual" && manualData) {
    productContext = `Product information:
Name: ${manualData.name}
Brand: ${manualData.brand}
Category: ${manualData.category}
Price: ${manualData.price}
Carbs per serving: ${manualData.carbs}g
Sodium per serving: ${manualData.sodium}mg
Caffeine per serving: ${manualData.caffeine}mg
Protein per serving: ${manualData.protein}g
Certifications: ${manualData.certifications}
Ingredients: ${manualData.ingredients}`;
  } else {
    return NextResponse.json({ error: "No product data provided" }, { status: 400 });
  }

  const prompt = `You are an expert sports nutrition analyst building a product Explore for Pello Nutrition, a science-backed sports nutrition research platform for endurance athletes.

Based on the following product information, generate a complete TypeScript product entry for the Pello Explore.

${productContext}

Generate a complete TypeScript object that matches this exact structure. Be thorough and accurate — this will be shown to athletes making purchasing decisions.

Rules:
- id: lowercase-hyphenated slug from brand + product name
- category: must be exactly one of: "Energy Gel" | "Energy Chew" | "Energy Bar" | "Carbohydrate Mix" | "Hydration" | "Protein" | "Creatine" | "Supplement" | "Probiotic" | "Omega-3" | "Vitamin" | "Mineral"
- rating: realistic 1-5 based on brand reputation and product quality (most good products are 4.2-4.8)
- reviewCount: realistic estimate based on brand size and product popularity
- price: price in USD for a standard box/bottle (not per serving)
- transparencyScore: 0-100 based on label clarity, dose disclosure, certifications, no proprietary blends
- goals: array from ["endurance", "recovery", "muscle", "health", "immunity", "gut health", "sleep"]
- sentiment: object with 3-5 relevant attributes rated 0-100 (e.g. Taste, GI Comfort, Energy, Value, Effectiveness)
- ingredients: array of key active ingredients with science-backed notes. verdict must be "proven" | "likely" | "disputed"
- sources: realistic review sources with counts
- logoDomain: the brand's main website domain (e.g. "maurten.com")
- imageEmoji: most relevant emoji

Output ONLY the TypeScript object — no imports, no variable declaration, no explanation. Start with { and end with },

Example structure:
{
  id: "maurten-gel-100",
  name: "Gel 100",
  brand: "Maurten",
  category: "Energy Gel",
  logoDomain: "maurten.com",
  logo: "",
  imageEmoji: "⚡",
  rating: 4.6,
  reviewCount: 8400,
  price: 38,
  goals: ["endurance"],
  transparencyScore: 96,
  sentiment: {
    "GI Comfort": 92,
    "Energy": 94,
    "Taste": 80,
    "Value": 58,
  },
  ingredients: [
    {
      name: "Maltodextrin + Fructose (Hydrogel)",
      dose: "25g carbs",
      verdict: "proven",
      note: "Science-backed note about the ingredient...",
      pubmedUrl: "https://pubmed.ncbi.nlm.nih.gov/?term=relevant+search",
    },
  ],
  sources: [
    { name: "Amazon", icon: "🛒", count: 4200, unit: "reviews", credibility: "high" },
    { name: "The Feed", icon: "📝", count: 2100, unit: "reviews", credibility: "high" },
    { name: "PubMed", icon: "🔬", count: 4, unit: "studies", credibility: "high" },
  ],
},`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const code = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ code });
  } catch (e) {
    console.error("Enrichment error:", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
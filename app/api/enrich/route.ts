import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";
import { rateLimit } from "@/lib/rate-limit";

const client = new Anthropic();

// This route is behind the admin password (see middleware.ts), but it still
// fetches whatever URL it's given, so only allow public http(s) addresses.
function isPrivateAddress(ip: string): boolean {
  if (ip.startsWith("::ffff:")) ip = ip.slice(7);
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

async function isPublicUrl(raw: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return false;
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal")) return false;
  try {
    const addresses = isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
    return addresses.length > 0 && addresses.every((a) => !isPrivateAddress(a.address));
  } catch {
    return false;
  }
}

function generateSlug(name: string, brand: string): string {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Most shop pages (Shopify, WooCommerce, …) embed the real product facts as JSON-LD in
// <script type="application/ld+json"> tags: nutrition, ingredients, certifications,
// diet, prices per size and the store's rating. Pull those out in compact form, since
// the visible page text is mostly navigation.
function extractStructuredProduct(html: string): string {
  const products: any[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of Array.from(html.matchAll(re))) {
    let data: any;
    try { data = JSON.parse(match[1]); } catch { continue; }
    const items = Array.isArray(data) ? data : data["@graph"] ?? [data];
    for (const item of items) {
      if (item?.["@type"] === "Product") products.push(item);
      if (item?.["@type"] === "ProductGroup") products.push(item, ...(item.hasVariant ?? []));
    }
  }
  if (products.length === 0) return "";

  const first = products.find((p) => p.nutrition || p.additionalProperty) ?? products[0];
  const offerOf = (p: any) => (Array.isArray(p.offers) ? p.offers[0] : p.offers) ?? {};
  const props: Record<string, unknown> = {};
  for (const p of products) {
    for (const a of p.additionalProperty ?? []) {
      if (a?.name && !(a.name in props) && !/HS Code|Categories/i.test(a.name)) props[a.name] = a.value;
    }
  }
  const sizes = new Map<string, unknown>();
  for (const p of products) {
    const o = offerOf(p);
    const key = `${p.name ?? ""}`;
    if (!sizes.has(key)) sizes.set(key, { name: p.name, size: p.size, price: o.price, currency: o.priceCurrency, availability: String(o.availability ?? "").split("/").pop() });
  }
  const compact = {
    name: first.name,
    brand: first.brand?.name ?? first.brand,
    category: first.category,
    image: Array.isArray(first.image) ? first.image[0] : first.image?.url ?? first.image,
    aggregateRating: first.aggregateRating
      ? { ratingValue: first.aggregateRating.ratingValue, reviewCount: first.aggregateRating.reviewCount }
      : undefined,
    nutrition: first.nutrition,
    properties: props,
    certifications: Array.from(new Set(products.flatMap((p) => (p.hasCertification ?? []).map((c: any) => c?.name).filter(Boolean)))),
    suitableForDiet: first.suitableForDiet,
    sizesAndPrices: Array.from(sizes.values()).slice(0, 25),
  };
  return JSON.stringify(compact, null, 1).slice(0, 9000);
}

async function fetchPublicPage(startUrl: string): Promise<Response> {
  let current = startUrl;
  for (let hop = 0; hop <= 3; hop++) {
    const res = await fetch(current, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; PelloBot/1.0)" },
      redirect: "manual",
      signal: AbortSignal.timeout(10_000),
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, current).toString();
      if (!(await isPublicUrl(current))) throw new Error("Redirect to a non-public address");
      continue;
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res;
  }
  throw new Error("Too many redirects");
}

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, "enrich", 10, 60_000);
  if (limited) return limited;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "No product data provided" }, { status: 400 });
  const { url, labelText, manualData, mode } = body;

  let productContext = "";

  if (mode === "url" && url) {
    if (typeof url !== "string" || !(await isPublicUrl(url))) {
      return NextResponse.json({ error: "Enter a public http(s) product page URL." }, { status: 400 });
    }
    // Fetch the product page, re-checking each redirect so a public URL
    // can't bounce the request to an internal address.
    try {
      const pageRes = await fetchPublicPage(url);
      const html = await pageRes.text();
      // Strip HTML tags and get text content
      const structured = extractStructuredProduct(html);
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .slice(0, structured ? 5000 : 8000);
      productContext = `Product page URL: ${url}\n\n` +
        (structured ? `Structured product data from the page (most reliable — prefer this over the page text):\n${structured}\n\n` : "") +
        `Page text:\n${text}`;
    } catch (e) {
      return NextResponse.json({ error: "Could not fetch the product page. Try label or manual mode instead." }, { status: 400 });
    }
  } else if (mode === "label" && typeof labelText === "string" && labelText) {
    productContext = `Product label / nutrition data:\n${labelText.slice(0, 8000)}`;
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
- rating / reviewCount: the store's customer rating and number of reviews from the product information. If none is given, use 0 for both — never estimate.
- price: price in USD for one pack as listed in the product information (not per serving). If several sizes are listed, use a standard multi-serving pack (e.g. a box of 12 gels, or a 30–40 serving tub) and set servingsPerContainer to match that size
- transparencyScore: 0-100 based on label clarity, dose disclosure, certifications, no proprietary blends
- goals: array from ["endurance", "recovery", "muscle", "health", "immunity", "gut health", "sleep"]
- sentiment: {} (empty). Only fill it if the product information includes per-attribute ratings (e.g. a taste score); never invent them
- ingredients: array of key active ingredients with science-backed notes. verdict must be "proven" | "likely" | "disputed". Put the labelled amount in dose (e.g. "1000mg", "25g carbs"); omit dose if no amount is given
- sources: only sources that appear in the product information, with their real counts — e.g. { name: "The Feed", icon: "🛒", count: <its review count>, unit: "reviews", credibility: "medium" }, and one entry per third-party certification with count 1 and unit "certification". Do not add PubMed, study counts or other sources you can't see
- logoDomain: the brand's main website domain (e.g. "maurten.com")
- imageEmoji: most relevant emoji
- servingsPerContainer: number of servings in the pack that \`price\` is for

Structured label data — these must come from the product information above, NOT from estimates.
If the information doesn't state a value, leave the field out entirely (don't write null) — except osmolality, glucoseFructoseRatio, affiliateUrl and imageUrl, which may be null. Never guess.
- carbsPerServing: grams of carbohydrate per serving (number)
- sodiumPerServing: mg of sodium per serving (number)
- caffeinePerServing: mg of caffeine per serving (number; 0 only if the product is stated caffeine-free)
- proteinPerServing: grams of protein per serving (number)
- caloriesPerServing: kcal per serving (number)
- servingSize: serving size as written on the label, e.g. "1 gel (40g)" or "1 scoop (30g)"
- osmolality: "isotonic" | "hypotonic" | "hypertonic" — only if the product states it; otherwise null
- glucoseFructoseRatio: e.g. "1:0.8" or "2:1" — only if stated; otherwise null
- isHydrogel: true only if the product uses a hydrogel (e.g. sodium alginate + pectin system); otherwise false
- isBatchTested: true only if every batch is third-party tested (Informed Sport, NSF Certified for Sport, Cologne List); otherwise false
- isVegan / isGlutenFree: true only if stated or certified; false if the ingredients rule it out; omit if unclear
- certifications: third-party certifications named on the product (e.g. "Informed Sport", "NSF Certified for Sport", "USDA Organic")
- allergens: allergens declared on the label, lowercase (e.g. "milk", "soy", "tree nuts", "peanuts")
- flavours: available flavours
- affiliateUrl: always null — affiliate links are added separately
- imageUrl: a direct product image URL only if one appears in the product information; otherwise null

Output ONLY the TypeScript object — no imports, no variable declaration, no explanation. Start with { and end with },

Example structure:
{
  id: "maurten-gel-100",
  name: "Gel 100",
  brand: "Maurten",
  category: "Energy Gel",
  logoDomain: "maurten.com",
  imageEmoji: "⚡",
  rating: 4.8,
  reviewCount: 1426,
  price: 38,
  goals: ["endurance"],
  transparencyScore: 96,
  servingsPerContainer: 12,
  carbsPerServing: 25,
  sodiumPerServing: 20,
  caffeinePerServing: 0,
  proteinPerServing: 0,
  caloriesPerServing: 100,
  servingSize: "1 gel (40g)",
  osmolality: null,
  glucoseFructoseRatio: "1:0.8",
  isHydrogel: true,
  isBatchTested: true,
  isVegan: true,
  isGlutenFree: true,
  certifications: ["Informed Sport"],
  allergens: [],
  flavours: ["Original"],
  affiliateUrl: null,
  imageUrl: null,
  sentiment: {},
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
    { name: "The Feed", icon: "🛒", count: 1426, unit: "reviews", credibility: "medium" },
    { name: "Informed Sport", icon: "✅", count: 1, unit: "certification", credibility: "high" },
  ],
},`;

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      messages: [{ role: "user", content: prompt }],
    });

    const code = message.content[0].type === "text" ? message.content[0].text : "";
    return NextResponse.json({ code });
  } catch (e) {
    console.error("Enrichment error:", e);
    return NextResponse.json({ error: "Failed to generate product entry" }, { status: 500 });
  }
}
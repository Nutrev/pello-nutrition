// lib/brands.ts
// Every brand on Pello, built from the product catalogue plus the facts in
// lib/brand-profiles.ts (taken from each brand's own site). Nothing here is estimated:
// certifications, price position, badges and scores all come from Pello's product data.
import "server-only";

import { PRODUCTS, type Product } from "./products";
import { BRAND_PROFILES } from "./brand-profiles";
import { brandSlug, type Brand, type BrandBadge, type PricePosition } from "./brand-types";
import { productNutrition } from "./nutrition";
import { pricePerServing } from "./servings";
import { productPelloScore } from "./product-score";

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

function listJoin(items: string[]): string {
  return items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

// Typical cost per serving in each category, to place a brand's prices against its peers.
let categoryMedians: Map<string, number> | null = null;
function categoryMedian(category: string): number {
  if (!categoryMedians) {
    const byCat = new Map<string, number[]>();
    for (const p of PRODUCTS) byCat.set(p.category, [...(byCat.get(p.category) ?? []), pricePerServing(p)]);
    categoryMedians = new Map(Array.from(byCat, ([c, xs]) => [c, median(xs)]));
  }
  return categoryMedians.get(category) ?? 1;
}

// A brand's typical price against category norms: under 85% is budget, over 120% premium.
function pricePosition(products: Product[]): PricePosition {
  const ratio = median(products.map((p) => pricePerServing(p) / categoryMedian(p.category)));
  return ratio < 0.85 ? "budget" : ratio > 1.2 ? "premium" : "mid";
}

function badges(products: Product[], avgTransparency: number | null, scoredCount: number): BrandBadge[] {
  const out: BrandBadge[] = [];
  const n = products.length;
  const tested = products.filter((p) => productNutrition(p).isBatchTested).length;
  if (tested === n) {
    out.push({ label: "Third-party tested", detail: n === 1 ? "Its product is independently tested for banned substances" : `All ${n} of its products are independently tested for banned substances` });
  } else if (tested >= n / 2) {
    out.push({ label: "Mostly third-party tested", detail: `${tested} of ${n} products are independently tested for banned substances` });
  }
  if (avgTransparency != null && avgTransparency >= 90 && scoredCount >= n / 2) {
    out.push({ label: "Transparent labels", detail: `Average transparency score of ${avgTransparency}%` });
  }
  const ingredients = products.flatMap((p) => p.ingredients);
  const proven = ingredients.filter((i) => i.verdict === "proven").length;
  if (ingredients.length >= 2 && proven / ingredients.length >= 0.6) {
    out.push({ label: "Evidence-backed", detail: `${Math.round((proven / ingredients.length) * 100)}% of listed ingredients have strong research behind them` });
  }
  if (n >= 2 && products.every((p) => productNutrition(p).isVegan === true)) {
    out.push({ label: "Vegan range", detail: "Every product on Pello is labelled vegan" });
  }
  return out;
}

function buildBrand(name: string, products: Product[]): Brand {
  const profile = BRAND_PROFILES[name];
  const withDomain = products.find((p) => p.logoDomain);
  const withLogo = products.find((p) => p.logo);

  const catCounts = new Map<string, number>();
  for (const p of products) catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1);
  const categories = Array.from(catCounts).sort((a, b) => b[1] - a[1]).map(([c]) => c);

  const goalCounts = new Map<string, number>();
  for (const p of products) for (const g of p.goals) goalCounts.set(g, (goalCounts.get(g) ?? 0) + 1);
  const athleteType = Array.from(goalCounts).filter(([, c]) => c >= products.length / 4).sort((a, b) => b[1] - a[1]).map(([g]) => g);

  const certifications = Array.from(new Set(products.flatMap((p) => productNutrition(p).certifications))).sort();
  const scores = products.map((p) => productPelloScore(p).overall);
  const scored = products.filter((p) => p.transparencyScore != null);
  const avgTransparency = scored.length ? Math.round(scored.reduce((s, p) => s + p.transparencyScore!, 0) / scored.length) : null;
  const pps = products.map(pricePerServing);

  const origin = profile?.origin
    ?? [profile?.founded ? `Founded in ${profile.founded}.` : "", profile?.hq ? `Based in ${profile.hq}.` : ""].filter(Boolean).join(" ");
  const onPello = `${products.length} product${products.length === 1 ? "" : "s"} on Pello, ${
    categories.length === 1 ? `all ${categories[0].toLowerCase()}` : `mainly ${listJoin(categories.slice(0, 3).map((c) => c.toLowerCase()))}`
  }.`;
  const certLine = certifications.length ? ` Certifications on its products include ${listJoin(certifications.slice(0, 3))}.` : "";

  return {
    slug: brandSlug(name),
    name,
    logoDomain: withDomain?.logoDomain ?? null,
    logo: withLogo?.logo ?? null,
    founded: profile?.founded ?? null,
    hq: profile?.hq ?? null,
    description: `${origin ? origin + " " : ""}${onPello}${certLine}`,
    philosophy: profile?.philosophy ?? null,
    certifications,
    athleteType,
    pricePosition: pricePosition(products),
    badges: badges(products, avgTransparency, scored.length),
    websiteUrl: withDomain?.logoDomain ? `https://${withDomain.logoDomain}` : null,
    sources: profile?.sources ?? [],
    productCount: products.length,
    categories,
    avgPelloScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    avgTransparency,
    pricePerServingRange: [Math.min(...pps), Math.max(...pps)],
  };
}

let brands: Brand[] | null = null;

// All brands, most products first.
export function getBrands(): Brand[] {
  if (!brands) {
    const byBrand = new Map<string, Product[]>();
    for (const p of PRODUCTS) byBrand.set(p.brand, [...(byBrand.get(p.brand) ?? []), p]);
    brands = Array.from(byBrand, ([name, products]) => buildBrand(name, products))
      .sort((a, b) => b.productCount - a.productCount || a.name.localeCompare(b.name));
  }
  return brands;
}

export function getBrand(slug: string): Brand | undefined {
  return getBrands().find((b) => b.slug === slug);
}

export function getBrandByName(name: string): Brand | undefined {
  return getBrands().find((b) => b.name === name);
}

export function getBrandProducts(name: string): Product[] {
  return PRODUCTS.filter((p) => p.brand === name);
}

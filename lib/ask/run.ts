// lib/ask/run.ts
// Runs an Ask Pello query (lib/ask/query.ts) on Pello's own product data, and describes in plain
// words how the question was read. Pure: no model, no I/O. Every figure shown comes from the data;
// a product missing the figure a question sorts or filters by is left out (and counted), never
// treated as zero. Tested in lib/ask/run.test.ts.
import type { ProductSummary } from "../catalog-types";
import { reviewsAt } from "../catalog-types";
import { meetsAll, meetsDiet, STANDARD_CHOICES } from "../quality-standards";
import { costPerGramCarb } from "../cost";
import type { AskQuery, NumericField } from "./query";

export const FIELD: Record<NumericField, {
  label: string;               // "carbs per serving"
  get: (p: ProductSummary) => number | null;
  show: (v: number) => string; // "40g"
}> = {
  carbsPerServing: { label: "carbs per serving", get: (p) => p.nutrition.carbsPerServing, show: (v) => `${v}g carbs` },
  sodiumPerServing: { label: "sodium per serving", get: (p) => p.nutrition.sodiumPerServing, show: (v) => `${v}mg sodium` },
  caffeinePerServing: { label: "caffeine per serving", get: (p) => p.nutrition.caffeinePerServing, show: (v) => `${v}mg caffeine` },
  proteinPerServing: { label: "protein per serving", get: (p) => p.nutrition.proteinPerServing, show: (v) => `${v}g protein` },
  pricePerServing: { label: "price per serving", get: (p) => (p.pricePerServing > 0 ? p.pricePerServing : null), show: (v) => `$${v.toFixed(2)} per serving` },
  costPerGramCarb: { label: "cost per gram of carbs", get: (p) => costPerGramCarb(p), show: (v) => `$${v.toFixed(3)} per gram of carbs` },
  rating: { label: "rating", get: (p) => (p.reviewCount > 0 ? p.rating : null), show: (v) => `${v}/5` },
  reviewCount: { label: "number of reviews", get: (p) => (p.reviewCount > 0 ? p.reviewCount : null), show: (v) => `${v.toLocaleString("en-US")} reviews` },
  pelloScore: { label: "Pello Score", get: (p) => p.pelloScore, show: (v) => `Pello Score ${v}` },
};

export interface AskItem {
  id: string;
  brand: string;
  name: string;
  category: string;
  highlight: string | null;    // the figure the question is about
  details: string[];           // price, rating, Pello Score, testing certification
}

export interface AskResult {
  items: AskItem[];            // ranked, up to the query's limit
  total: number;               // how many products matched before the limit
  missing: { count: number; label: string } | null;  // products left out for lacking the figure
}

const TESTING: Record<string, string> = { "nsf-sport": "NSF Certified for Sport", "informed-sport": "Informed Sport", "cologne-list": "Cologne List" };

export function runAskQuery(q: AskQuery, catalog: ProductSummary[]): AskResult {
  // The figures the question depends on: its sort field and filter fields.
  const needed = Array.from(new Set([...(q.sort ? [q.sort.field] : []), ...q.filters.map((f) => f.field)]));
  let pool = catalog.filter((p) =>
    (!q.categories.length || q.categories.includes(p.category)) &&
    (!q.brand || p.brand.toLowerCase().includes(q.brand.toLowerCase())) &&
    (q.vegan !== true || p.nutrition.isVegan === true) &&
    (q.glutenFree !== true || meetsDiet({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens }, "gluten-free")) &&
    (q.hydrogel !== true || p.nutrition.isHydrogel) &&
    (q.caffeine !== "with" || p.nutrition.hasCaffeine) &&
    (q.caffeine !== "without" || !p.nutrition.hasCaffeine) &&
    (!q.certifications.length || meetsAll(p.standards, q.certifications)));

  const before = pool.length;
  pool = pool.filter((p) => needed.every((f) => FIELD[f].get(p) != null));
  const missingCount = before - pool.length;
  pool = pool.filter((p) => q.filters.every((f) => {
    const v = FIELD[f.field].get(p)!;
    return f.op === "gte" ? v >= f.value : v <= f.value;
  }));

  // Ranking: the sort field (ratings use the review-weighted rating, so one 5-star review doesn't
  // outrank hundreds at 4.9); ties, and questions with no sort, fall back to Pello's usual order.
  const s = q.sort;
  const ranked = [...pool].sort((a, b) => {
    if (s) {
      const av = s.field === "rating" ? a.weightedRating : FIELD[s.field].get(a)!;
      const bv = s.field === "rating" ? b.weightedRating : FIELD[s.field].get(b)!;
      if (av !== bv) return s.direction === "desc" ? bv - av : av - bv;
    }
    return b.weightedRating - a.weightedRating;
  });

  const focus: NumericField | null = s?.field ?? q.filters[0]?.field ?? null;
  const items = ranked.slice(0, q.limit).map((p): AskItem => {
    const testing = p.standards.map((id) => TESTING[id]).find(Boolean);
    const details = [
      focus !== "pricePerServing" && p.pricePerServing > 0 ? `$${p.pricePerServing.toFixed(2)} per serving` : null,
      p.reviewCount > 0 && focus !== "rating" && focus !== "reviewCount" ? `${p.rating}/5 from ${reviewsAt(p.reviewCount, p.reviewSource)}` : null,
      focus === "rating" ? `from ${reviewsAt(p.reviewCount, p.reviewSource)}` : null,
      focus !== "pelloScore" && p.pelloScore != null ? `Pello Score ${p.pelloScore}` : null,
      testing ?? null,
    ].filter((x): x is string => !!x);
    return { id: p.id, brand: p.brand, name: p.name, category: p.category, highlight: focus ? FIELD[focus].show(FIELD[focus].get(p)!) : null, details };
  });

  return { items, total: ranked.length, missing: missingCount > 0 && needed.length ? { count: missingCount, label: needed.map((f) => FIELD[f].label).join(" or ") } : null };
}

// ── How the question was read ─────────────────────────────────

const PLURAL: Record<string, string> = {
  "Energy Gel": "Energy gels", "Energy Chew": "Energy chews", "Energy Bar": "Energy bars", "Carbohydrate Mix": "Carbohydrate drink mixes",
  "Hydration": "Hydration products", "Protein": "Protein supplements", "Creatine": "Creatine", "Recovery": "Recovery products",
  "Performance": "Performance supplements", "Supplement": "Supplements", "Vitamin": "Vitamins", "Mineral": "Minerals", "Omega-3": "Omega-3s",
  "Probiotic": "Probiotics", "Sleep": "Sleep supplements", "Gut Health": "Gut health supplements", "Immune": "Immune support", "Greens": "Greens",
};
const threshold = (f: NumericField, v: number) =>
  f === "pricePerServing" ? `$${v.toFixed(2)}` : f === "costPerGramCarb" ? `$${v.toFixed(3)}` : f === "rating" ? `${v}/5` : f === "pelloScore" ? `${v}`
    : f === "reviewCount" ? v.toLocaleString("en-US") : `${v}${f === "sodiumPerServing" || f === "caffeinePerServing" ? "mg" : "g"}`;

export function describeAskQuery(q: AskQuery): string[] {
  const chips: string[] = [];
  chips.push(q.categories.length ? q.categories.map((c) => PLURAL[c] ?? c).join(", ") : "All products");
  if (q.brand) chips.push(q.brand);
  for (const f of q.filters) chips.push(`${f.op === "gte" ? "At least" : "At most"} ${threshold(f.field, f.value)} ${FIELD[f.field].label}`);
  if (q.vegan) chips.push("Vegan (as labeled)");
  if (q.glutenFree) chips.push("Gluten-free (as labeled)");
  if (q.hydrogel) chips.push("Hydrogel");
  if (q.caffeine === "with") chips.push("With caffeine");
  if (q.caffeine === "without") chips.push("Caffeine-free");
  for (const c of q.certifications) chips.push(STANDARD_CHOICES.find((x) => x.id === c)?.label ?? c);
  if (q.sort) {
    const label = q.sort.field === "rating" ? "Rating, weighted by review count" : FIELD[q.sort.field].label.replace(/^./, (x) => x.toUpperCase());
    chips.push(`${label} · ${q.sort.direction === "desc" ? "highest first" : "lowest first"}`);
  }
  return chips;
}

// The same view in Explore (/query), as far as Explore's filters can express it.
export function exploreHref(q: AskQuery): string {
  const p = new URLSearchParams();
  if (q.categories.length) p.set("category", q.categories.join(","));
  if (q.brand) p.set("search", q.brand);
  for (const f of q.filters) {
    if (f.field === "pricePerServing" && f.op === "lte") p.set("maxPricePerServing", String(f.value));
    if (f.field === "carbsPerServing" && f.op === "gte") p.set("minCarbsPerServing", String(f.value));
    if (f.field === "sodiumPerServing" && f.op === "gte") p.set("minSodiumPerServing", String(f.value));
    if (f.field === "proteinPerServing" && f.op === "gte") p.set("minProteinPerServing", String(f.value));
  }
  if (q.vegan) p.set("isVegan", "1");
  if (q.glutenFree) p.set("isGlutenFree", "1");
  if (q.hydrogel) p.set("isHydrogel", "1");
  if (q.caffeine) p.set("hasCaffeine", q.caffeine === "with" ? "yes" : "no");
  if (q.certifications.length) p.set("standards", q.certifications.join(","));
  const exploreSorts: Partial<Record<NumericField, string>> = {
    rating: "rating", pricePerServing: "pricePerServing", carbsPerServing: "carbsPerServing", sodiumPerServing: "sodiumPerServing",
    caffeinePerServing: "caffeinePerServing", reviewCount: "reviewCount",
  };
  if (q.sort && exploreSorts[q.sort.field]) { p.set("sort", exploreSorts[q.sort.field]!); p.set("dir", q.sort.direction); }
  const s = p.toString();
  return s ? `/query?${s}` : "/query";
}

// Plain answers for questions Pello's data can't answer.
export const UNSUPPORTED_MESSAGE: Record<string, string> = {
  taste: "Pello doesn't have data on taste, so it can't rank products by it.",
  texture: "Pello doesn't have data on texture, so it can't rank products by it.",
  gi_comfort: "Pello doesn't have data on how products sit in the stomach, so it can't rank them by that.",
  effectiveness: "Pello doesn't rank products by how well they work for you. The Pello Score covers research support, label transparency, value, reviews and quality.",
  other: "Pello can answer questions about its product data.",
};
export const ASK_EXAMPLES = [
  "Which gels have the most carbs per serving?",
  "Caffeine-free drink mixes under $2 per serving",
  "Highest rated electrolytes",
  "Vegan protein with the most protein per serving",
  "Best energy bars by Pello Score",
];

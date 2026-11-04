// lib/supplement-finder.ts
// The free supplement finder (/supplement-finder): a few questions, then the best-scoring
// supplements in Pello's catalog for one goal. Rule-based, no AI: products are matched to the goal
// with the same rules as the Pro supplement stack planner (lib/planner-modes.ts), filtered by the
// athlete's answers, and ranked by Pello Score. Client-safe: works on product summaries passed in.

import type { ProductSummary } from "./catalog-types";
import { byWeightedRating } from "./catalog-types";
import { GOAL_CATEGORIES, STACK_GOALS, fitsGoal, type StackGoal } from "./planner-modes";
import { meetsDiet, type DietId } from "./quality-standards";
import type { Verdict } from "./products";

// Body composition is left out: in the stack planner it mostly means protein and creatine,
// which the muscle goal already covers.
export const FINDER_GOALS = STACK_GOALS.filter((g) => g.id !== "body-comp");
export type FinderGoal = Exclude<StackGoal, "body-comp">;
// How each goal reads in a heading: "Supplements for sleep".
export const GOAL_TOPIC: Record<FinderGoal, string> = {
  muscle: "muscle and strength",
  endurance: "endurance performance",
  recovery: "recovery between sessions",
  sleep: "sleep",
  cognitive: "focus",
  gut: "gut health",
  health: "general health and immunity",
};

export const FINDER_DIETS: { id: DietId; label: string }[] = [
  { id: "vegan", label: "Vegan" },
  { id: "gluten-free", label: "Gluten-free" },
  { id: "dairy-free", label: "Dairy-free" },
];

// Certifications that test every batch for substances banned in sport.
export const DRUG_TESTED_CERTS = ["NSF Certified for Sport", "Informed Sport"];

export interface FinderInputs {
  goal: FinderGoal;
  tested: boolean;      // only products tested for banned substances
  diets: DietId[];
  noCaffeine: boolean;  // leave out anything with caffeine or another stimulant
}

type Params = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const all = (v: string | string[] | undefined) => (v == null ? [] : Array.isArray(v) ? v : [v]);

// The answers from the page's URL (?goal=sleep&tested=1&diet=vegan&nocaffeine=1). null until a
// valid goal is chosen; unknown values are ignored.
export function parseFinderParams(sp: Params): FinderInputs | null {
  const goal = FINDER_GOALS.find((g) => g.id === first(sp.goal))?.id;
  if (!goal) return null;
  const diets = FINDER_DIETS.map((d) => d.id).filter((d) => all(sp.diet).includes(d));
  return { goal, tested: first(sp.tested) === "1", diets, noCaffeine: first(sp.nocaffeine) === "1" };
}

export function finderHref(i: Partial<FinderInputs>): string {
  const q = new URLSearchParams();
  if (i.goal) q.set("goal", i.goal);
  if (i.tested) q.set("tested", "1");
  for (const d of i.diets ?? []) q.append("diet", d);
  if (i.noCaffeine) q.set("nocaffeine", "1");
  const s = q.toString();
  return `/supplement-finder${s ? `?${s}` : ""}`;
}

const STIMULANTS = /caffeine|guarana|coffee|green tea|yerba|cola nut|kola|theacrine|teacrine|synephrine|yohimb|energy blend|energy complex/i;
// Sleep products that the focus goal would otherwise pick up for their L-theanine.
const SLEEP_AIDS = /sleep|dream|night|melatonin/i;

// Safety notes worth seeing before buying, from what's on the label.
const CAUTIONS: [RegExp, string][] = [
  [/5-htp|5-hydroxytryptophan|griffonia/i, "Contains 5-HTP: don't combine with antidepressants."],
  [/mucuna|l-dopa/i, "Contains mucuna (L-dopa): check with a doctor if you take medication."],
  [/melatonin/i, "Contains melatonin, a hormone that's prescription-only in some countries."],
  [/licorice|glycyrrhiz/i, "Contains licorice root: regular use can raise blood pressure."],
  [/adrenal/i, "Contains bovine adrenal extract."],
  [/yohimb|synephrine/i, "Contains a strong stimulant."],
];

export interface FinderResult {
  product: ProductSummary;
  // The main active on the label (see keyIngredient).
  keyIngredient: { name: string; dose: string; verdict: Verdict } | null;
  // How many ingredients have each verdict.
  evidence: Record<Verdict, number>;
  tested: string[];      // drug-testing certifications it holds
  cautions: string[];
}

const hasStimulant = (p: ProductSummary) => p.nutrition.hasCaffeine || STIMULANTS.test(p.name) || p.ingredients.some((i) => STIMULANTS.test(i.name));

// Words in product names that say nothing about the active ingredient.
const GENERIC = new Set(["the", "and", "with", "for", "plus", "sport", "shot", "powder", "capsules", "caps", "gummies", "complex", "formula", "advanced", "daily", "performance", "recovery", "pro", "max", "ultra", "essential", "essentials", "original", "liquid", "drink", "mix", "blend", "support", "athlete", "nutrition", "concentrate", "super", "pure", "elite", "vegan", "organic", "natural"]);

// The product's main active: the ingredient its name refers to (Super EPA → EPA, BiCarb ARC →
// sodium bicarbonate, Magnesium Bisglycinate → magnesium). null when the name doesn't point to one
// (a multivitamin, say), rather than guessing from label order.
function keyIngredient(p: ProductSummary): FinderResult["keyIngredient"] {
  const brand = new Set(p.brand.toLowerCase().split(/[^a-z0-9-]+/));
  const words = p.name.toLowerCase().replace(/bicarb\b/g, "bicarbonate").replace(/-\d+\b/g, "").split(/[^a-z0-9-]+/).filter((w) => w.length >= 3 && !GENERIC.has(w) && !brand.has(w) && !/^\d/.test(w));
  const main = p.ingredients.find((i) => words.some((w) => i.name.toLowerCase().includes(w)));
  return main ? { name: main.name, dose: main.dose ?? "", verdict: main.verdict } : null;
}

export function finderResults(products: ProductSummary[], inputs: FinderInputs, limit = 9): FinderResult[] {
  const fits = products.filter((p) =>
    fitsGoal(p, inputs.goal) && p.pelloScore != null && p.price > 0 && p.pricePerServing > 0 &&
    (!inputs.tested || (p.certifications ?? []).some((c) => DRUG_TESTED_CERTS.includes(c))) &&
    inputs.diets.every((d) => meetsDiet({ isVegan: p.nutrition.isVegan, isGlutenFree: p.nutrition.isGlutenFree, allergens: p.allergens }, d)) &&
    (!inputs.noCaffeine || !hasStimulant(p)) &&
    (inputs.goal !== "cognitive" || ![p.name, ...p.ingredients.map((i) => i.name)].some((t) => SLEEP_AIDS.test(t)))
  );
  fits.sort((a, b) => (b.pelloScore ?? 0) - (a.pelloScore ?? 0) || byWeightedRating(a, b));
  // Take turns between the goal's categories, in the order they matter for it (best Pello Score
  // first within each), so one category doesn't fill the list: a recovery list mixes protein,
  // recovery aids, omega-3 and sleep rather than nine protein powders. At most two per brand.
  const order = GOAL_CATEGORIES[inputs.goal];
  const queues = order.map((c) => fits.filter((p) => p.category === c));
  const perBrand = new Map<string, number>();
  const out: FinderResult[] = [];
  while (out.length < limit && queues.some((q) => q.length)) {
    for (const q of queues) {
      if (out.length >= limit) break;
      let p: ProductSummary | undefined;
      while ((p = q.shift())) if ((perBrand.get(p.brand) ?? 0) < 2) break;
      if (!p) continue;
      perBrand.set(p.brand, (perBrand.get(p.brand) ?? 0) + 1);
      const text = [p.name, ...p.ingredients.map((i) => i.name)].join(" ");
      const evidence = { proven: 0, likely: 0, disputed: 0 };
      for (const i of p.ingredients) evidence[i.verdict]++;
      out.push({
        product: p,
        keyIngredient: keyIngredient(p),
        evidence,
        tested: (p.certifications ?? []).filter((c) => DRUG_TESTED_CERTS.includes(c)),
        cautions: CAUTIONS.filter(([re]) => re.test(text)).map(([, msg]) => msg),
      });
    }
  }
  return out;
}

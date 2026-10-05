// lib/planner-mode-prompts.ts
// Prompts for the supplement stack, race week and budget optimiser planners. Built on the server
// from validated inputs and products chosen from Pello's catalogue here, never from a product
// list sent by the browser, so the AI only ever sees real Pello products and their real data.
import "server-only";
import type { ProductSummary } from "./catalog-types";
import {
  STACK_GOALS, CURRENT_SUPPLEMENTS, RACE_TYPES, RACE_DURATIONS, RACE_PRIORITIES, BUDGET_HAVE,
  monthlyAtOneServing, raceWeekTargets,
  type StackInputs, type RaceWeekInputs, type BudgetInputs,
} from "./planner-modes";
import { EVENT_TYPES } from "./planner";

const RULES = `IMPORTANT: Only reference products I explicitly list below from the Pello database. Do not invent product data, and do not reference any product that isn't in the list. If a product's field isn't given, don't guess its value.

Write plain text only: no markdown, no asterisks, no hashtags, no bullet symbols, no table pipes. Use ONLY the section headers given, each on its own line, exactly as written.`;

const $ = (n: number) => `$${n.toFixed(2)}`;
const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) => list.find((x) => x.id === id)?.label ?? id;

// One line per product, with only the fields it actually has.
function productLine(p: ProductSummary, opts: { monthly?: boolean }): string {
  const parts = [
    `${p.brand} ${p.name}`,
    p.category,
    p.servingsPerContainer ? `${$(p.price)} for ${p.servingsPerContainer} servings (${$(p.pricePerServing)} a serving${opts.monthly ? `, ${$(monthlyAtOneServing(p))} a month at one serving a day` : ""})` : `${$(p.pricePerServing)} a serving`,
    `rated ${p.rating.toFixed(1)} from ${p.reviewCount} reviews`,
  ];
  const doses = p.ingredients.filter((i) => i.dose).slice(0, 4).map((i) => `${i.name} ${i.dose}`);
  if (doses.length) parts.push(`per serving: ${doses.join(", ")}`);
  const n = p.nutrition;
  if (n.carbsPerServing != null) parts.push(`${n.carbsPerServing}g carbs`);
  if (n.sodiumPerServing != null) parts.push(`${n.sodiumPerServing}mg sodium`);
  if (n.caffeinePerServing != null && n.caffeinePerServing > 0) parts.push(`${n.caffeinePerServing}mg caffeine`);
  return parts.join(" | ");
}

export function buildStackPrompt(i: StackInputs, products: ProductSummary[]): string {
  const taking = i.current.filter((c) => c !== "none").map((c) => label(CURRENT_SUPPLEMENTS, c));
  return `You are Pello's expert sports nutrition AI. Build a science-backed daily supplement protocol.

${RULES}

ATHLETE PROFILE:
- Goals: ${i.goals.map((g) => label(STACK_GOALS, g)).join(", ")}
${taking.length ? `- Already taking: ${taking.join(", ")}\n` : ""}- Age: ${i.age}
- Sex: ${i.sex}
- Training days per week: ${i.trainingDaysPerWeek}
- Monthly budget: $${i.budget}
- Dietary restrictions: ${i.dietary.length ? i.dietary.join(", ") : "none"}

AVAILABLE PRODUCTS FROM PELLO DATABASE:
${products.map((p) => productLine(p, { monthly: true })).join("\n")}

Recommend only products from this list, by their exact brand and name. Use the doses on the label; if you suggest more than one serving a day, say so and work out the monthly cost from the price per serving. Stay within the budget.

SAFETY: Add up each nutrient across every product you recommend. The combined daily amount must stay within the adult Tolerable Upper Intake Level for supplements (for example magnesium from supplements 350mg, vitamin D 4,000 IU, iron 45mg, zinc 40mg). Don't recommend two products that supply the same nutrient unless the combined dose stays within these limits. Avoid marketing language and claims the evidence doesn't support.

Generate a protocol with EXACTLY these sections:

MORNING
What to take in the morning, timing relative to breakfast, specific products from the list above with dose and reason.

AROUND TRAINING
What to take before and after training. Specific products, timing and rationale based on the athlete's goals.

EVENING
What to take in the evening or before bed. Specific products with timing and reason.

PRIORITY ORDER
If the athlete can't afford everything, list the 3 most important products for their goals in priority order, with a one-sentence justification for each.

TOTALS
Estimated monthly cost: $X (only the products recommended, using the prices above)
Budget remaining: $X

KEY NOTES
3 specific, science-backed notes relevant to this athlete's goals and profile. No generic advice.

PRODUCTS USED
Every product you recommended above, one per line, written exactly as "Brand Name" from the list. Nothing else in this section.`;
}

export function buildRaceWeekPrompt(i: RaceWeekInputs, products: ProductSummary[]): string {
  const t = raceWeekTargets(i);
  const days = Array.from({ length: i.daysUntil }, (_, k) => i.daysUntil - k);
  return `You are Pello's expert sports nutrition AI. Build a day-by-day race week nutrition protocol.

${RULES}

RACE PROFILE:
- Race type: ${label(RACE_TYPES, i.raceType)}
- Duration: ${label(RACE_DURATIONS, i.duration)}
- Days until race: ${i.daysUntil}
- Race priority: ${label(RACE_PRIORITIES, i.priority)}
- Body weight: ${Math.round(i.weightKg)}kg
- Caffeine: ${i.caffeinePreference}
- Dietary: ${i.dietary.length ? i.dietary.join(", ") : "none"}
- Budget for race products: $${i.budget}

TARGETS (from the 2016 Academy of Nutrition and Dietetics, Dietitians of Canada and ACSM position stand; use them exactly):
${t.loading
    ? `- Carbohydrate loading: ${t.dailyCarbs.gPerKg[0]}-${t.dailyCarbs.gPerKg[1]} g/kg a day (${t.dailyCarbs.grams[0]}-${t.dailyCarbs.grams[1]}g) for the final 36-48 hours, i.e. the last 2 days before race day, with training tapered.`
    : `- No carbohydrate loading: the race is under 90 minutes. Eat ${t.dailyCarbs.gPerKg[0]}-${t.dailyCarbs.gPerKg[1]} g/kg (${t.dailyCarbs.grams[0]}-${t.dailyCarbs.grams[1]}g) of carbohydrate in the 24 hours before, as normal daily fuel.`}
- Earlier in the week: normal training-day eating; don't start loading early.
- Pre-race meal: ${t.preRaceMeal.gPerKg[0]}-${t.preRaceMeal.gPerKg[1]} g/kg (${t.preRaceMeal.grams[0]}-${t.preRaceMeal.grams[1]}g) carbohydrate, 1-4 hours before the start, low in fat, protein and fibre.
- Pre-race fluid: ${t.preRaceFluidMl[0]}-${t.preRaceFluidMl[1]}ml (5-10 ml/kg) in the 2-4 hours before; sodium in pre-race food and drink may help retain it. Don't recommend multi-day sodium loading.
- During the race: ${t.duringCarbs}.

AVAILABLE PRODUCTS:
${products.map((p) => productLine(p, {})).join("\n")}

Reference only products from this list, by their exact brand and name.

Generate a day-by-day plan with EXACTLY these sections, counting down to race day:

${days.map((d) => `DAY ${d}: ${d} DAY${d === 1 ? "" : "S"} OUT`).join("\n")}
For each day: the nutrition focus, what to eat and avoid, any products to use, with specific quantities.

RACE DAY
Pre-race meal timing and contents. Warm-up nutrition. During-race fuelling schedule with exact timing. Post-race recovery.

WHAT TO AVOID THIS WEEK
Specific foods and behaviours to avoid in race week.

KEY NOTES
3 race-week tips specific to this athlete's profile and race type.

PRODUCTS USED
Every product you recommended above, one per line, written exactly as "Brand Name" from the list. Nothing else in this section.`;
}

export function buildBudgetPrompt(i: BudgetInputs): string {
  const event = i.eventFocus ? `yes${i.eventType ? `, ${EVENT_TYPES.find((e) => e.id === i.eventType)?.label}` : ""}` : "no";
  const have = i.have.map((h) => label(BUDGET_HAVE, h));
  return `You are Pello's expert sports nutrition AI. Explain the budget allocation strategy for this athlete.

IMPORTANT: Do not recommend specific products or brands. Product selection is handled separately from Pello's database. Only give strategic guidance on how to allocate the budget. Write plain text only: no markdown, no asterisks, no hashtags, no bullet symbols, no table pipes. Use ONLY the section headers given, each on its own line, exactly as written.

ATHLETE PROFILE:
- Primary goal: ${label(STACK_GOALS, i.goal)}
- Event focus: ${event}
- Monthly budget: $${i.budget}
${i.currentSpend != null ? `- Currently spends: $${i.currentSpend} a month\n` : ""}- Already has: ${have.length ? have.join(", ") : "nothing yet"}
- Dietary: ${i.dietary.length ? i.dietary.join(", ") : "none"}

BUDGET STRATEGY
How should this athlete think about allocating $${i.budget} a month across nutrition categories? Which categories give the most return for this specific goal?

PRIORITY ORDER
For this athlete's goal, rank these categories in order of importance, with one sentence each: Protein, Creatine, Carbohydrates, Electrolytes, Omega-3, Vitamins, Probiotics, Adaptogens.

WHAT TO AVOID
Which common purchases are low value for this specific goal and budget? Be specific.`;
}

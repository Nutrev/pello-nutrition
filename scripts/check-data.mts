// scripts/check-data.mts
// Consistency check for Pello's product data. Reports products whose data contradicts itself or looks
// out of place, so a person can check them against the label. It changes nothing.
//
// Run: npm run check:data            (prints the report)
//      npm run check:data -- out.md  (also saves it as Markdown)
import { readFileSync, writeFileSync } from "node:fs";
import { PRODUCTS, type Product } from "../lib/products";
import { productNutrition } from "../lib/nutrition";
import { pricePerServing } from "../lib/servings";

const FILES = ["lib/products.ts", "lib/products-thefeed.ts", "lib/products-supplements.ts"];
const source = new Map<string, { file: string; block: string }>();
for (const file of FILES) {
  const src = readFileSync(file, "utf8");
  const ids = Array.from(src.matchAll(/^[ \t]*id: "([^"]+)"/gm));
  ids.forEach((m, i) => { if (!source.has(m[1])) source.set(m[1], { file, block: src.slice(m.index!, ids[i + 1]?.index ?? src.length) }); });
}

const CARB_CATEGORIES = new Set(["Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix"]);
const CARB_SOURCE = /maltodextrin|glucose|fructose|sucrose|dextrose|cyclic dextrin|isomaltulose|carbohydrate/i;
// Words in a product name that point to a different kind of product than its category.
const NAME_CLUES: { re: RegExp; categories: string[] | null; note: string }[] = [
  { re: /\b(spread|jam|nut butter|peanut butter)\b/i, categories: null, note: "name suggests a food spread" },
  { re: /\bgel\b/i, categories: ["Energy Gel", "Carbohydrate Mix", "Recovery", "Performance", "Hydration", "Supplement"], note: "name says gel" },
  { re: /\bbar\b/i, categories: ["Energy Bar", "Protein", "Recovery"], note: "name says bar" },
  { re: /\bchews?\b/i, categories: ["Energy Chew", "Hydration", "Performance", "Supplement", "Creatine", "Vitamin", "Mineral", "Sleep", "Immune", "Gut Health"], note: "name says chew" },
  { re: /\b(capsules?|softgels?)\b/i, categories: null, note: "name says capsules" },
];

type Row = { id: string; text: string };
const groups = new Map<string, Row[]>();
const flag = (group: string, p: Product, text: string) => { (groups.get(group) ?? groups.set(group, []).get(group)!).push({ id: p.id, text: `**${p.brand} ${p.name}** (\`${p.id}\`, ${p.category}): ${text}` }); };

// Price per serving by category, for spotting outliers.
const byCat = new Map<string, number[]>();
for (const p of PRODUCTS) { const v = pricePerServing(p); if (v > 0) (byCat.get(p.category) ?? byCat.set(p.category, []).get(p.category)!).push(v); }
const median = (a: number[]) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };

for (const p of PRODUCTS) {
  const n = productNutrition(p);
  const src = source.get(p.id);
  const carbIngredients = p.ingredients.filter((i) => CARB_SOURCE.test(i.name));

  // 1. Category vs content
  if (CARB_CATEGORIES.has(p.category) && n.carbsPerServing != null && n.carbsPerServing < 10)
    flag("Fuel product with under 10g of carbs per serving (check the category)", p, `${n.carbsPerServing}g carbs per serving`);
  for (const c of NAME_CLUES) {
    if (c.re.test(p.name) && (c.categories === null ? !(c.note === "name says capsules" && !CARB_CATEGORIES.has(p.category)) : !c.categories.includes(p.category)))
      flag("Name suggests a different kind of product", p, `${c.note}, filed as ${p.category}`);
  }

  // 2. Figures that contradict the ingredient list
  if (n.carbsPerServing === 0 && carbIngredients.some((i) => i.verdict === "proven" && /carbs|transporter|g\/hr/i.test(`${i.dose ?? ""} ${i.note ?? ""}`)))
    flag("0g carbs but an ingredient row describes it as a carb source", p, carbIngredients.map((i) => i.name).join(", "));
  for (const i of p.ingredients) {
    const m = i.dose?.match(/^([\d.]+)\s*g carbs$/i);
    if (m && n.carbsPerServing != null && Number(m[1]) !== n.carbsPerServing && p.ingredients.filter((x) => /g carbs$/i.test(x.dose ?? "")).length === 1)
      flag("Ingredient carb dose differs from carbs per serving", p, `${i.name} ${i.dose} vs ${n.carbsPerServing}g per serving`);
  }

  // 3. Implausible values (worth checking against the label)
  if ((n.sodiumPerServing ?? 0) > 3000) flag("Unusual per-serving amount", p, `${n.sodiumPerServing}mg sodium`);
  if ((n.caffeinePerServing ?? 0) > 400) flag("Unusual per-serving amount", p, `${n.caffeinePerServing}mg caffeine`);
  if ((n.carbsPerServing ?? 0) > 150) flag("Unusual per-serving amount", p, `${n.carbsPerServing}g carbs`);
  if ((n.proteinPerServing ?? 0) > 60) flag("Unusual per-serving amount", p, `${n.proteinPerServing}g protein`);

  // 4. Serving size vs the pack the price comes from
  const note = src?.block.match(/\n\s*price: [\d.]+,\s*\/\/\s*(.+)/)?.[1] ?? "";
  if (/\bservings?\b/i.test(note) && !/single/i.test(note) && /stick pack|packet|sachet|single/i.test(p.servingSize ?? ""))
    flag("Serving size names a single pack, but the price is for a multi-serving bag", p, `serving "${p.servingSize}", price note "${note.trim()}"`);

  // 5. Price outliers within the category
  const pps = pricePerServing(p), med = median(byCat.get(p.category) ?? []);
  if (pps > 0 && med && (pps < med / 4 || pps > med * 4))
    flag("Price per serving far from the category's typical price (check the pack size)", p, `$${pps.toFixed(2)} vs $${med.toFixed(2)} typical`);

  // 6. Ratings
  if (p.reviewCount > 0 && !(p.rating > 0)) flag("Ratings", p, `${p.reviewCount} reviews but no rating`);
  if (p.reviewCount > 0 && !p.sources.some((s) => s.unit === "reviews")) flag("Ratings", p, "review count with no review source");

  // 7. Source
  if (src && src.file !== "lib/products.ts" && !p.retailerLinks?.theFeed)
    flag("Imported from The Feed but no link to its page (can't be re-checked)", p, "no retailerLinks.theFeed");
  if (src?.file === "lib/products.ts" && !p.retailerLinks?.theFeed && !/confirmed|\.com\)/i.test(src.block))
    flag("No source link and not marked confirmed", p, "no The Feed link or 'confirmed' note");
}

const lines: string[] = [];
const say = (l = "") => { lines.push(l); console.log(l); };
const total = Array.from(groups.values()).reduce((s, g) => s + g.length, 0);
say(`# Pello data consistency check, ${new Date().toISOString().slice(0, 10)}`);
say(`${PRODUCTS.length} products checked · ${total} item${total === 1 ? "" : "s"} to look at`);
for (const [title, rows] of groups) {
  say(`\n## ${title} (${rows.length})`);
  rows.sort((a, b) => a.id.localeCompare(b.id)).forEach((r) => say(`- ${r.text}`));
}
if (!total) say("\nNothing to look at.");
const out = process.argv.slice(2).find((a) => !a.startsWith("--"));
if (out) writeFileSync(out, lines.join("\n") + "\n");

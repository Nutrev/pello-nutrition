// scripts/check-prices.ts
// Re-checks every product's price, rating and review count against its page at The Feed and prints
// a report.
//
// Run:  npm run check:prices                 (report only; changes nothing)
//       npm run check:prices -- report.md    (also saves the report as Markdown)
//       npm run check:prices -- --apply      (also updates the clear-cut price changes in lib/products*.ts)
//       npm run check:prices -- --apply --include-single-size   (… and the single-size ones, once checked)
//       npm run check:prices -- --only=id1,id2   (check just these products)
//
// Each stored price notes the exact size it came from, e.g. `price: 47.49, // Box of 12 on The Feed`.
// The check reads that size's current price from the product page's structured data (one offer per
// flavour and size). A price only counts as a clear-cut change when every in-stock flavour of that
// size has the same new price. Anything else (size gone, prices differing by flavour, page missing,
// everything out of stock) is reported for a person to look at and never changed automatically.
//
// Ratings and review counts are read from the same page's structured data (aggregateRating). With
// --apply, changed ones are updated too (rating, reviewCount and The Feed's review count in sources).
//
// Products sold in several sizes list them as variants labelled with The Feed's size name ("Box of 6",
// "60 Servings"), or with feedSize when the label differs ("3 mg / 60 Servings"). Each size's price
// is checked the same way, and with --apply clear-cut changes are updated in the variant rows.
import { readFileSync, writeFileSync } from "fs";
import { PRODUCTS } from "../lib/products";

const FILES = ["lib/products.ts", "lib/products-thefeed.ts", "lib/products-supplements.ts"];
const UA = "Mozilla/5.0 (Pello Nutrition price check; pellonutrition@gmail.com)";
const CONCURRENCY = 4;

interface Stored { id: string; file: string; price: number; size: string | null }
interface Offer { variant: string; price: number; inStock: boolean } // variant: e.g. "Citrus / Box of 12"
type Result =
  | { kind: "same"; s: Stored }
  | { kind: "changed"; s: Stored; price: number }
  | { kind: "changed-single"; s: Stored; price: number }
  | { kind: "varies"; s: Stored; prices: number[] }
  | { kind: "no-size"; s: Stored; sizes: string[] }
  | { kind: "out-of-stock"; s: Stored; price: number | null }
  | { kind: "no-label"; s: Stored }
  | { kind: "error"; s: Stored; message: string };

// A product's own id line. Size rows (`{ id: "box-of-12", … }`) share a line with their brace, so
// they don't match, and a product's block runs to the next product's id.
const PRODUCT_ID = /^[ \t]*id: "([^"]+)"/gm;
function productBlock(src: string, id: string): { start: number; end: number } {
  const m = new RegExp(`^[ \\t]*id: "${id}",`, "m").exec(src);
  if (!m) throw new Error(`Couldn't find ${id}`);
  const after = m.index + m[0].length;
  const rest = src.slice(after).search(/^[ \t]*id: "/m);
  return { start: m.index, end: rest === -1 ? src.length : after + rest };
}

// The stored price and size note of each product, read from the data files' source.
function storedPrices(): Map<string, Stored> {
  const out = new Map<string, Stored>();
  for (const file of FILES) {
    const src = readFileSync(file, "utf8");
    const ids = Array.from(src.matchAll(PRODUCT_ID));
    ids.forEach((m, i) => {
      const block = src.slice(m.index!, ids[i + 1]?.index ?? src.length);
      const pm = block.match(/\n\s*price: ([\d.]+),\s*(?:\/\/\s*(.+?) on The Feed)?\s*\n/);
      if (pm && !out.has(m[1])) out.set(m[1], { id: m[1], file, price: Number(pm[1]), size: pm[2]?.trim() ?? null });
    });
  }
  return out;
}

// Rating and review count from each page's structured data, by URL, filled in as pages are read.
const liveRatings = new Map<string, { rating: number; count: number }>();

// Each page is read once; size options are checked from the same offers.
const offerCache = new Map<string, Promise<Offer[] | "gone">>();
const offersFor = (url: string) => offerCache.get(url) ?? offerCache.set(url, readOffers(url)).get(url)!;

async function readOffers(url: string): Promise<Offer[] | "gone"> {
  const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(20000) });
  if (res.status === 404) return "gone";
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const found: { name: string; price: number; inStock: boolean }[] = [];
  for (const m of Array.from(html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g))) {
    let data: unknown;
    try { data = JSON.parse(m[1]); } catch { continue; }
    for (const item of (Array.isArray(data) ? data : [data]) as Record<string, unknown>[]) {
      if (item?.["@type"] !== "Product") continue;
      const name = String(item.name ?? "");
      const agg = item.aggregateRating as Record<string, unknown> | undefined;
      const rv = Number(agg?.ratingValue), rc = Number(agg?.reviewCount ?? agg?.ratingCount);
      if (!liveRatings.has(url) && Number.isFinite(rv) && Number.isFinite(rc) && rc > 0) liveRatings.set(url, { rating: Math.round(rv * 10) / 10, count: rc });
      const raw = item.offers;
      for (const o of ((Array.isArray(raw) ? raw : raw ? [raw] : []) as Record<string, unknown>[])) {
        const price = Number(o.price);
        if (Number.isFinite(price)) found.push({ name, price, inStock: /InStock/i.test(String(o.availability ?? "")) });
      }
    }
  }
  if (!found.length) throw new Error("no prices found on the page");
  // Each name is "<product> - <variant>". The variant is what follows the product name, which every
  // offer shares; with a single offer there's no variant name.
  const names = Array.from(new Set(found.map((f) => f.name)));
  let prefix = names[0];
  for (const n of names) while (!n.startsWith(prefix)) prefix = prefix.slice(0, -1);
  // A single offer has no shared prefix to strip; its title may still end " - <size>".
  const cut = names.length > 1 ? prefix.lastIndexOf(" - ") : names[0].indexOf(" - ");
  return found.map((f) => ({ variant: cut === -1 ? "" : f.name.slice(cut + 3).trim(), price: f.price, inStock: f.inStock }));
}

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function check(s: Stored, url: string): Promise<Result> {
  if (!s.size) return { kind: "no-label", s };
  try {
    const offers = await offersFor(url);
    if (offers === "gone") return { kind: "error", s, message: "product page not found (404)" };
    // Match the stored size against the variant's options ("Citrus / Box of 12" has "Box of 12").
    const want = s.size.split(" / ").map(norm);
    // Clearance stock ("Best By 12/2026") is a short-term price, not the product's price.
    const regular = offers.filter((o) => !/best by/i.test(o.variant));
    if (!regular.length) return { kind: "no-size", s, sizes: ["only clearance (Best By) stock listed"] };
    let sized = regular.filter((o) => { const opts = o.variant.split(" / ").map(norm); return want.every((w) => opts.includes(w)); });
    // Sold in one size: the variants then name only the flavour (or nothing), so no option has a
    // number in it. That one size is taken to be the stored size, and flagged for a person to check.
    const onlySize = !sized.length && /\d/.test(s.size) && (regular.every((o) => !/\d/.test(o.variant)) || new Set(regular.map((o) => o.variant)).size === 1);
    if (onlySize) sized = regular;
    if (!sized.length) return { kind: "no-size", s, sizes: Array.from(new Set(regular.map((o) => o.variant))).filter(Boolean) };
    const live = sized.filter((o) => o.inStock);
    if (!live.length) {
      const prices = Array.from(new Set(sized.map((o) => o.price)));
      return { kind: "out-of-stock", s, price: prices.length === 1 ? prices[0] : null };
    }
    const prices = Array.from(new Set(live.map((o) => o.price))).sort((a, b) => a - b);
    // Stored price is still one flavour's current price: nothing to change.
    if (prices.includes(s.price)) return { kind: "same", s };
    if (prices.length > 1) return { kind: "varies", s, prices };
    return { kind: onlySize ? "changed-single" : "changed", s, price: prices[0] };
  } catch (e) {
    return { kind: "error", s, message: (e as Error).message };
  }
}

interface VariantChange { id: string; file: string; variantId: string; label: string; from: number; to: number }

// Size options (variants labelled with a size The Feed lists) whose price changed: only when every
// in-stock flavour of that size has the same new price.
async function variantChanges(id: string, file: string, url: string): Promise<VariantChange[]> {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p?.variants?.length) return [];
  const offers = await offersFor(url).catch(() => "gone" as const);
  if (offers === "gone") return [];
  return p.variants.flatMap((v) => {
    const want = (v.feedSize ?? v.label).split(" / ").map(norm);
    const live = offers.filter((o) => { const opts = o.variant.split(" / ").map(norm); return o.inStock && !/best by/i.test(o.variant) && want.every((w) => opts.includes(w)); });
    const prices = Array.from(new Set(live.map((o) => o.price)));
    return prices.length === 1 && prices[0] !== v.price ? [{ id, file, variantId: v.id, label: v.label, from: v.price, to: prices[0] }] : [];
  });
}

function applyVariants(changes: VariantChange[]) {
  const byFile = new Map<string, string>();
  for (const c of changes) {
    const src = byFile.get(c.file) ?? readFileSync(c.file, "utf8");
    const { start, end } = productBlock(src, c.id);
    const block = src.slice(start, end);
    const updated = block.replace(new RegExp(`(\\{ id: "${c.variantId}", label: "[^"]*", price: )${c.from.toString().replace(".", "\\.")}(,)`), `$1${c.to}$2`);
    if (updated === block) throw new Error(`Couldn't find the ${c.label} row for ${c.id}`);
    byFile.set(c.file, src.slice(0, start) + updated + src.slice(end));
  }
  byFile.forEach((src, file) => writeFileSync(file, src));
}

interface RatingChange { id: string; file: string; from: { rating: number; count: number }; to: { rating: number; count: number } }

// Updates rating, reviewCount and The Feed's review count in each product's block.
function applyRatings(changes: RatingChange[]) {
  const byFile = new Map<string, string>();
  for (const c of changes) {
    const src = byFile.get(c.file) ?? readFileSync(c.file, "utf8");
    const { start, end } = productBlock(src, c.id);
    const block = src.slice(start, end);
    const updated = block
      .replace(/(\n\s*rating: )[\d.]+(,)/, `$1${c.to.rating}$2`)
      .replace(/(\n\s*reviewCount: )\d+(,)/, `$1${c.to.count}$2`)
      .replace(/(name: "The Feed",[^}]*?count: )\d+(, unit: "reviews")/, `$1${c.to.count}$2`);
    if (updated === block) throw new Error(`Couldn't find the rating lines for ${c.id}`);
    byFile.set(c.file, src.slice(0, start) + updated + src.slice(end));
  }
  byFile.forEach((src, file) => writeFileSync(file, src));
}

function apply(changes: { s: Stored; price: number }[]) {
  const byFile = new Map<string, string>();
  for (const { s, price } of changes) {
    const src = byFile.get(s.file) ?? readFileSync(s.file, "utf8");
    const { start, end } = productBlock(src, s.id);
    const block = src.slice(start, end);
    const updated = block.replace(new RegExp(`(\\n\\s*price: )${s.price.toString().replace(".", "\\.")}(,)`), `$1${price}$2`);
    if (updated === block) throw new Error(`Couldn't find the price line for ${s.id}`);
    byFile.set(s.file, src.slice(0, start) + updated + src.slice(end));
  }
  byFile.forEach((src, file) => writeFileSync(file, src));
}

async function main() {
  const args = process.argv.slice(2);
  const doApply = args.includes("--apply");
  const includeSingle = args.includes("--include-single-size");
  const out = args.find((a) => !a.startsWith("--"));
  const only = args.find((a) => a.startsWith("--only="))?.slice(7).split(",").filter(Boolean);
  const stored = storedPrices();
  const jobs = PRODUCTS.flatMap((p) => {
    const s = stored.get(p.id);
    if (only && !only.includes(p.id)) return [];
    return s && p.retailerLinks?.theFeed ? [{ s, url: p.retailerLinks.theFeed }] : [];
  });

  const results: Result[] = [];
  let i = 0;
  await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
    while (i < jobs.length) {
      const job = jobs[i++];
      results.push(await check(job.s, job.url));
      await new Promise((r) => setTimeout(r, 250));
    }
  }));

  const by = <K extends Result["kind"]>(k: K) => results.filter((r): r is Extract<Result, { kind: K }> => r.kind === k).sort((a, b) => a.s.id.localeCompare(b.s.id));
  const name = (id: string) => { const p = PRODUCTS.find((x) => x.id === id); return p ? `${p.brand} ${p.name}` : id; };
  const $ = (n: number) => `$${n.toFixed(2)}`;
  const lines: string[] = [];
  const say = (l = "") => { lines.push(l); console.log(l); };

  const changed = by("changed");
  say(`# The Feed price check, ${new Date().toISOString().slice(0, 10)}`);
  const singleCount = results.filter((r) => r.kind === "changed-single").length;
  say(`${jobs.length} products checked · ${by("same").length} unchanged · ${changed.length + singleCount} changed · ${results.length - by("same").length - changed.length - singleCount} need a look`);
  say(`\n## Price changed (${changed.length})${doApply ? ": updated" : ""}`);
  if (!changed.length) say("None.");
  const line = (r: { s: Stored; price: number }) => {
    const pct = Math.round(((r.price - r.s.price) / r.s.price) * 100);
    return `- **${name(r.s.id)}** (\`${r.s.id}\`, ${r.s.size}): ${$(r.s.price)} → ${$(r.price)} (${pct > 0 ? "+" : ""}${pct}%)`;
  };
  changed.forEach((r) => say(line(r)));
  const single = by("changed-single");
  say(`\n## Price changed, single-size product: check the size (${single.length})${doApply && includeSingle ? ": updated" : ""}`);
  say("The page sells one size and doesn't name it, so a big change may mean a new size rather than a new price.");
  if (!single.length) say("None.");
  single.forEach((r) => say(line(r)));
  const section = (title: string, rows: string[]) => { say(`\n## ${title} (${rows.length})`); if (!rows.length) say("None."); rows.forEach((l) => say(l)); };
  section("Price differs by flavour, and none matches the stored price (not changed)", by("varies").map((r) => `- **${name(r.s.id)}** (\`${r.s.id}\`, ${r.s.size}): stored ${$(r.s.price)}, now ${r.prices.map($).join(" / ")} depending on flavour`));
  section("Size no longer listed (not changed)", by("no-size").map((r) => `- **${name(r.s.id)}** (\`${r.s.id}\`): "${r.s.size}" not found; sizes now: ${r.sizes.join(", ") || "none named"}`));
  section("Out of stock in every flavour (not changed)", by("out-of-stock").map((r) => `- **${name(r.s.id)}** (\`${r.s.id}\`, ${r.s.size}): stored ${$(r.s.price)}${r.price != null && r.price !== r.s.price ? `, listed at ${$(r.price)}` : ""}`));
  section("Couldn't check", [
    ...by("error").map((r) => `- **${name(r.s.id)}** (\`${r.s.id}\`): ${r.message}`),
    ...by("no-label").map((r) => `- **${name(r.s.id)}** (\`${r.s.id}\`): stored price has no "… on The Feed" size note`),
  ]);

  // Ratings and review counts. A product with no reviews stored that now has some is included; one
  // whose page shows no rating keeps what's stored.
  const ratingChanges: RatingChange[] = jobs.flatMap(({ s, url }) => {
    const live = liveRatings.get(url);
    const p = PRODUCTS.find((x) => x.id === s.id);
    // Variants with their own ratings (e.g. different strengths) are checked by hand.
    if (!live || !p || p.variants?.some((v) => v.reviewCount != null)) return [];
    const from = { rating: p.reviewCount > 0 ? p.rating : 0, count: p.reviewCount };
    return from.rating === live.rating && from.count === live.count ? [] : [{ id: s.id, file: s.file, from, to: live }];
  }).sort((a, b) => a.id.localeCompare(b.id));
  say(`\n## Rating or review count changed (${ratingChanges.length})${doApply ? ": updated" : ""}`);
  if (!ratingChanges.length) say("None.");
  ratingChanges.forEach((c) => say(`- **${name(c.id)}** (\`${c.id}\`): ${c.from.rating}/5 from ${c.from.count} → ${c.to.rating}/5 from ${c.to.count}`));
  if (doApply && ratingChanges.length) applyRatings(ratingChanges);

  const sizeChanges = (await Promise.all(jobs.map(({ s, url }) => variantChanges(s.id, s.file, url)))).flat().sort((a, b) => a.id.localeCompare(b.id));
  say(`\n## Size option price changed (${sizeChanges.length})${doApply ? ": updated" : ""}`);
  if (!sizeChanges.length) say("None.");
  sizeChanges.forEach((c) => say(`- **${name(c.id)}** (\`${c.id}\`, ${c.label}): ${$(c.from)} → ${$(c.to)}`));
  if (doApply && sizeChanges.length) applyVariants(sizeChanges);

  const toApply = [...changed, ...(includeSingle ? single : [])];
  if (doApply && toApply.length) {
    apply(toApply);
    say(`\nUpdated ${toApply.length} price${toApply.length === 1 ? "" : "s"} in lib/products*.ts. Review with git diff, then build.`);
  } else if (changed.length || single.length) {
    say(`\nNothing was changed. --apply updates the ${changed.length} clear-cut change${changed.length === 1 ? "" : "s"}; add --include-single-size to also update the ${single.length} single-size one${single.length === 1 ? "" : "s"}.`);
  }
  if (out) writeFileSync(out, lines.join("\n") + "\n");
}

main().catch((e) => { console.error(`Price check failed: ${e.message}`); process.exit(1); });

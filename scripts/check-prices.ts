// scripts/check-prices.ts
// Re-checks every product's price against its page at The Feed and prints a report.
//
// Run:  npm run check:prices                 (report only; changes nothing)
//       npm run check:prices -- report.md    (also saves the report as Markdown)
//       npm run check:prices -- --apply      (also updates the clear-cut price changes in lib/products*.ts)
//       npm run check:prices -- --apply --include-single-size   (… and the single-size ones, once checked)
//
// Each stored price notes the exact size it came from, e.g. `price: 47.49, // Box of 12 on The Feed`.
// The check reads that size's current price from the product page's structured data (one offer per
// flavour and size). A price only counts as a clear-cut change when every in-stock flavour of that
// size has the same new price. Anything else (size gone, prices differing by flavour, page missing,
// everything out of stock) is reported for a person to look at and never changed automatically.
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

// The stored price and size note of each product, read from the data files' source.
function storedPrices(): Map<string, Stored> {
  const out = new Map<string, Stored>();
  for (const file of FILES) {
    const src = readFileSync(file, "utf8");
    const ids = Array.from(src.matchAll(/\bid: "([^"]+)"/g));
    ids.forEach((m, i) => {
      const block = src.slice(m.index!, ids[i + 1]?.index ?? src.length);
      const pm = block.match(/\n\s*price: ([\d.]+),\s*(?:\/\/\s*(.+?) on The Feed)?\s*\n/);
      if (pm && !out.has(m[1])) out.set(m[1], { id: m[1], file, price: Number(pm[1]), size: pm[2]?.trim() ?? null });
    });
  }
  return out;
}

async function offersFor(url: string): Promise<Offer[] | "gone"> {
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
  const cut = names.length > 1 ? prefix.lastIndexOf(" - ") : -1;
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
    let sized = offers.filter((o) => { const opts = o.variant.split(" / ").map(norm); return want.every((w) => opts.includes(w)); });
    // Sold in one size: the variants then name only the flavour (or nothing), so no option has a
    // number in it. That one size is taken to be the stored size, and flagged for a person to check.
    const onlySize = !sized.length && /\d/.test(s.size) && offers.every((o) => !/\d/.test(o.variant));
    if (onlySize) sized = offers;
    if (!sized.length) return { kind: "no-size", s, sizes: Array.from(new Set(offers.map((o) => o.variant))).filter(Boolean) };
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

function apply(changes: { s: Stored; price: number }[]) {
  const byFile = new Map<string, string>();
  for (const { s, price } of changes) {
    const src = byFile.get(s.file) ?? readFileSync(s.file, "utf8");
    const start = src.indexOf(`id: "${s.id}"`);
    const next = src.indexOf('id: "', start + 5);
    const end = next === -1 ? src.length : next;
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
  const stored = storedPrices();
  const jobs = PRODUCTS.flatMap((p) => {
    const s = stored.get(p.id);
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

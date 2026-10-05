// scripts/check-nsf.ts
// Re-checks Pello's NSF Certified for Sport data against NSF's public database and prints a
// report. It changes nothing: review the report, then update lib/certification-checks.ts and the
// product data by hand.
//
// Run:  npm run check:nsf            (report printed to the terminal)
//       npm run check:nsf -- out.md  (also saved as Markdown)
//
// It reports:
//  1. Lapsed: products Pello shows as NSF certified whose NSF listing is no longer in the database
//     (with any same-name listing from the brand, in case NSF re-listed it under a new id).
//  2. Now listed: products in NSF_NOT_FOUND that NSF now lists.
//  3. Possible additions: Pello products without NSF that closely match an NSF listing from the
//     same brand. Matching is by name only, so check each one (flavour, size, formula) before adding.
//     Pairs already reviewed as different products (NSF_REVIEWED_NOT_SAME) are skipped.
import { writeFileSync } from "fs";
import { PRODUCTS } from "../lib/products";
import { NSF_SPORT_LISTINGS, NSF_NOT_FOUND, NSF_CHECKED_ON, NSF_REVIEWED_NOT_SAME } from "../lib/certification-checks";

const NSF_URL = "https://www.nsfsport.com/certified-products/search-results.php";
const DETAIL = (id: string) => `https://www.nsfsport.com/certified-products/listing-detail.php?id=${id}`;

interface Listing { id: string; name: string; company: string }

const decode = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&reg;|®/g, "").replace(/&trade;|™/g, "")
  .replace(/&#0?39;|&rsquo;/g, "'").replace(/&ndash;|&mdash;/g, "-").replace(/&[a-z]+;/g, " ").replace(/\s+/g, " ").trim();
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const STOP = new Set(["the", "and", "with", "for", "of", "a", "by", "mix", "powder", "capsules", "softgels", "flavor", "flavored", "unflavored", "sport", "plus"]);
const toks = (s: string) => new Set((s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => !STOP.has(t) && t.length > 1));

// NSF names some brands differently from the retailer.
const BRAND_KEYS: Record<string, string[]> = {
  "Precision Fuel & Hydration": ["precisionhydration"], "Podium Nutrition": ["podium"], "Ketone-IQ": ["ketone"],
  "Create": ["createwellness"], "Klean Athlete": ["klean"], "Dream Shot": ["formulas", "dreamshot"],
};

async function fetchListings(): Promise<Listing[]> {
  const res = await fetch(NSF_URL, { headers: { "User-Agent": "Mozilla/5.0 (Pello Nutrition certification check; pellonutrition@gmail.com)" } });
  if (!res.ok) throw new Error(`NSF returned HTTP ${res.status}`);
  const html = await res.text();
  const out = new Map<string, Listing>();
  for (const m of Array.from(html.matchAll(/listing-detail\.php\?id=(\d+)">([\s\S]*?)<\/a>/g))) {
    const name = m[2].match(/results__product-name">([\s\S]*?)<\/p>/);
    const company = m[2].match(/results__company-name">([\s\S]*?)<\/p>/);
    if (name) out.set(m[1], { id: m[1], name: decode(name[1]), company: company ? decode(company[1]) : "" });
  }
  if (out.size < 500) throw new Error(`Only ${out.size} NSF listings parsed; NSF's page has probably changed. Stopping rather than reporting false lapses.`);
  return Array.from(out.values());
}

function brandPool(brand: string, listings: Listing[]): Listing[] {
  const keys = BRAND_KEYS[brand] ?? [norm(brand)];
  return listings.filter((l) => keys.some((k) => norm(l.company).includes(k) || norm(l.name).includes(k)));
}

function bestMatch(brand: string, name: string, pool: Listing[]): { score: number; listing: Listing } | null {
  const bt = toks(brand);
  const pt = new Set(Array.from(toks(name)).filter((t) => !bt.has(t)));
  if (pt.size === 0) return null;
  let best: { score: number; listing: Listing } | null = null;
  for (const l of pool) {
    const lt = new Set(Array.from(toks(l.name)).filter((t) => !bt.has(t)));
    const inter = Array.from(pt).filter((t) => lt.has(t)).length;
    const extra = Array.from(lt).filter((t) => !pt.has(t)).length;
    const score = inter / pt.size - 0.05 * extra;
    if (!best || score > best.score) best = { score, listing: l };
  }
  return best;
}

async function main() {
  const listings = await fetchListings();
  const byId = new Map(listings.map((l) => [l.id, l]));
  const products = new Map(PRODUCTS.map((p) => [p.id, p]));
  const lines: string[] = [];
  const say = (s = "") => { lines.push(s); console.log(s); };

  say(`# NSF Certified for Sport re-check, ${new Date().toISOString().slice(0, 10)}`);
  say(`Previous check: ${NSF_CHECKED_ON.slice(0, 10)} · ${Object.keys(NSF_SPORT_LISTINGS).length} verified products · ${listings.length} listings in NSF's database today`);

  // 1. Lapsed
  const lapsed = Object.entries(NSF_SPORT_LISTINGS).filter(([, v]) => !byId.has(v.listingId));
  say(`\n## 1. No longer in NSF's database (${lapsed.length})`);
  if (!lapsed.length) say("None. Every verified listing is still there.");
  for (const [pid, v] of lapsed) {
    const p = products.get(pid);
    const alt = p ? bestMatch(p.brand, p.name, brandPool(p.brand, listings)) : null;
    say(`- **${p ? `${p.brand} ${p.name}` : pid}** (\`${pid}\`): listing ${v.listingId} "${v.listingName}" is gone.` +
      (alt && alt.score >= 0.75 ? ` Possible re-listing: "${alt.listing.name}" ${DETAIL(alt.listing.id)}` : " No same-name listing found from this brand."));
  }

  // 2. Previously not found, now listed
  const relisted = NSF_NOT_FOUND.flatMap((pid) => {
    const p = products.get(pid);
    const m = p ? bestMatch(p.brand, p.name, brandPool(p.brand, listings)) : null;
    return p && m && m.score >= 0.75 ? [{ p, m }] : [];
  });
  say(`\n## 2. Previously not found, now possibly listed (${relisted.length})`);
  if (!relisted.length) say("None.");
  for (const { p, m } of relisted) say(`- **${p.brand} ${p.name}** (\`${p.id}\`) → "${m.listing.name}" ${DETAIL(m.listing.id)}`);

  // 3. Possible additions
  const known = new Set([...Object.keys(NSF_SPORT_LISTINGS), ...NSF_NOT_FOUND]);
  const additions = PRODUCTS.flatMap((p) => {
    if (known.has(p.id) || p.certifications?.includes("NSF Certified for Sport")) return [];
    const pool = brandPool(p.brand, listings);
    if (!pool.length) return [];
    const m = bestMatch(p.brand, p.name, pool);
    if (!m || m.score < 0.9 || NSF_REVIEWED_NOT_SAME[p.id]?.includes(m.listing.id)) return [];
    return [{ p, m }];
  });
  say(`\n## 3. Possible additions: close name matches to check (${additions.length})`);
  if (!additions.length) say("None.");
  for (const { p, m } of additions) say(`- **${p.brand} ${p.name}** (\`${p.id}\`) ≈ "${m.listing.name}" ${DETAIL(m.listing.id)}`);

  say(`\nNothing was changed. To apply: update lib/certification-checks.ts (NSF_SPORT_LISTINGS, NSF_NOT_FOUND, NSF_CHECKED_ON) and each product's certifications, isBatchTested and transparencyScore (±15 for third-party testing).`);

  const out = process.argv[2];
  if (out) writeFileSync(out, lines.join("\n") + "\n");
}

main().catch((e) => { console.error(`NSF check failed: ${e.message}`); process.exit(1); });

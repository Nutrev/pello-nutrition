import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import TrackedLink from "@/components/TrackedLink";
import { getProductSummaries } from "@/lib/catalog";
import { categorySlug, type ProductSummary } from "@/lib/catalog-types";
import { sportTestedCerts } from "@/lib/product-flags";
import { STANDARD_BY_ID } from "@/lib/quality-standards";
import { NSF_CHECKED_ON } from "@/lib/certification-checks";

const URL = "https://www.pellonutrition.com/drug-tested-sports-nutrition";
const TITLE = "Drug-tested sports nutrition: NSF, Informed Sport and Cologne List products";
const DESCRIPTION = "Gels, drink mixes, protein, creatine and supplements certified by NSF Certified for Sport, Informed Sport or the Cologne List, with how each certification is checked and where to confirm it.";

export const metadata: Metadata = {
  title: { absolute: `${TITLE} | Pello` },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL },
};

// Fuel first, then the categories drug-tested athletes most often ask about.
const ORDER = ["Energy Gel", "Carbohydrate Mix", "Energy Chew", "Energy Bar", "Hydration", "Protein", "Recovery", "Creatine", "Bicarb", "Performance"];
const PER_CATEGORY = 6;

const CERT_SHORT: Record<string, string> = { "NSF Certified for Sport": "NSF", "Informed Sport": "Informed Sport", "Cologne List": "Cologne List" };

// How Pello knows each certification, said plainly.
const HOW_CHECKED: { id: "nsf-sport" | "informed-sport" | "cologne-list"; how: string }[] = [
  { id: "nsf-sport", how: `Checked by Pello against NSF's own Certified for Sport database (last checked ${new Date(NSF_CHECKED_ON).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}). NSF tests for banned substances, reviews the label and inspects facilities.` },
  { id: "informed-sport", how: "Taken from the product's retailer or brand listing, mostly The Feed. Informed Sport's database blocks automated checks, so Pello hasn't confirmed these listings itself. Informed Sport tests every batch before it's released." },
  { id: "cologne-list", how: "Taken from the product's retailer or brand listing, mostly The Feed, and not yet confirmed by Pello. Cologne List products are analysed at least once a year, not batch by batch, so it's a lighter check than the other two." },
];

export default function DrugTestedPage() {
  const tested = getProductSummaries().filter((p) => sportTestedCerts(p.certifications).length > 0);
  const counts = HOW_CHECKED.map((h) => ({ ...h, n: tested.filter((p) => p.certifications?.includes(STANDARD_BY_ID[h.id].name)).length }));
  const categories = Array.from(new Set(tested.map((p) => p.category)))
    .sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99) || a.localeCompare(b));
  const top = (cat: string) => tested.filter((p) => p.category === cat)
    .sort((a, b) => (b.pelloScore ?? 0) - (a.pelloScore ?? 0) || b.weightedRating - a.weightedRating);

  return (
    <div className="max-w-5xl mx-auto px-6 py-14">
      <nav className="text-xs text-muted mb-4">
        <Link href="/products" className="hover:text-ink">Products</Link> <span aria-hidden="true">/</span> Drug-tested
      </nav>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Drug-tested sports nutrition</h1>
      <p className="text-muted text-lg leading-relaxed mb-8 max-w-3xl">
        If you&apos;re tested for banned substances, these are the {tested.length} products in Pello&apos;s catalog certified by NSF
        Certified for Sport, Informed Sport or the Cologne List. No certification can promise a product is free of every banned
        substance, so always confirm the product, and ideally the batch, on the certifier&apos;s own site before you use it.
      </p>

      <section className="card mb-10" aria-labelledby="how-checked">
        <h2 id="how-checked" className="font-display font-semibold text-base mb-3">How Pello knows a product is tested</h2>
        <ul className="space-y-3">
          {counts.map((c) => {
            const s = STANDARD_BY_ID[c.id];
            return (
              <li key={c.id} className="text-sm">
                <span className="font-medium">{s.name}</span> <span className="text-muted">· {c.n} products</span>
                <p className="text-muted leading-relaxed mt-0.5">{c.how}</p>
                <TrackedLink href={s.lookupUrl} external event="drug_tested_link" params={{ certifier: c.id }} className="text-xs text-moss hover:underline">
                  Search the {s.lookupLabel} ↗
                </TrackedLink>
              </li>
            );
          })}
        </ul>
        <p className="text-xs text-muted mt-4">
          What each program tests for, and what none of them can promise:{" "}
          <TrackedLink href="/guides/certifications/sport-testing" event="drug_tested_link" params={{ to: "guide" }} className="text-moss hover:underline">Sport testing certifications</TrackedLink>
          {" · "}
          <TrackedLink href="/guides/certifications/how-to-verify" event="drug_tested_link" params={{ to: "verify" }} className="text-moss hover:underline">How to verify a certification</TrackedLink>
        </p>
      </section>

      <div className="space-y-10">
        {categories.map((cat) => {
          const all = top(cat);
          return (
            <section key={cat} aria-labelledby={`cat-${categorySlug(cat)}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
                <h2 id={`cat-${categorySlug(cat)}`} className="font-display font-semibold text-lg">{cat}</h2>
                <TrackedLink href={`/products/${categorySlug(cat)}?tested=1`} event="drug_tested_link" params={{ to: "category", category: cat }} className="text-xs text-moss hover:underline">
                  {all.length > PER_CATEGORY ? `All ${all.length} tested ${cat.toLowerCase()} products →` : `Filter ${cat.toLowerCase()} →`}
                </TrackedLink>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {all.slice(0, PER_CATEGORY).map((p) => <Row key={p.id} p={p} />)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function Row({ p }: { p: ProductSummary }) {
  return (
    <TrackedLink href={`/report/${p.id}`} event="drug_tested_link" params={{ to: "product", id: p.id }} className="card flex items-start gap-3 hover:shadow-md transition-all group">
      <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="text-xs text-muted">{p.brand}</div>
        <div className="font-display font-semibold text-sm leading-tight group-hover:text-moss transition-colors">{p.name}</div>
        <div className="flex flex-wrap gap-1 mt-1.5">
          {sportTestedCerts(p.certifications).map((c) => (
            <span key={c} className="text-[11px] bg-moss/10 text-moss px-2 py-0.5 rounded-full">{CERT_SHORT[c] ?? c}</span>
          ))}
        </div>
      </div>
      {p.pelloScore != null && <span className="text-xs text-muted whitespace-nowrap">Score {p.pelloScore}</span>}
    </TrackedLink>
  );
}

"use client";

// Building blocks shared by the supplement stack, race week and budget optimizer planners.
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { reviewsAt, reviewSourceNote, type ProductSummary } from "@/lib/catalog-types";
import { formatPrice } from "@/lib/servings";
import { PelloScoreTag } from "@/components/ProductCard";

export const toggleClass = (on: boolean) =>
  `text-sm px-3 py-2 rounded-xl border text-left transition-all ${on ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand hover:border-muted bg-white/40"}`;
export const chipClass = (on: boolean) =>
  `text-xs px-3 py-1.5 rounded-lg border transition-all ${on ? "bg-moss text-cream border-moss" : "border-sand hover:border-muted"}`;

export function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8" aria-label={`Step ${current} of ${total}`}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center transition-all ${i + 1 === current ? "bg-moss text-cream" : i + 1 < current ? "bg-moss/30 text-moss" : "bg-sand text-muted"}`}>
            {i + 1}
          </div>
          {i < total - 1 && <div className={`h-0.5 w-8 ${i + 1 < current ? "bg-moss/30" : "bg-sand"}`} />}
        </div>
      ))}
    </div>
  );
}

export function Loading({ text }: { text: string }) {
  return (
    <div className="text-center py-20">
      <div className="animate-spin inline-block w-8 h-8 border-2 border-sand border-t-moss rounded-full mb-6" />
      <h2 className="font-display font-semibold text-lg mb-2">Building your plan...</h2>
      <p className="text-muted text-sm">{text}</p>
    </div>
  );
}

// Splits the AI's plain-text answer into sections by their header lines. Stray markdown is
// stripped in case the model adds any.
export interface Section { title: string; lines: string[] }
export function parseSections(text: string, isHeader: (line: string) => boolean): Section[] {
  const out: Section[] = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^[#*\-•\s]+/, "").replace(/\*\*/g, "").replace(/\|/g, " ").trim();
    if (!line) continue;
    if (isHeader(line)) out.push({ title: line, lines: [] });
    else if (out.length) out[out.length - 1].lines.push(line);
  }
  return out;
}

export function PlanLines({ lines }: { lines: string[] }) {
  return (
    <div className="space-y-2">
      {lines.map((l, i) => <p key={i} className="text-sm leading-relaxed">{l}</p>)}
    </div>
  );
}

export function PlanCard({ label, title, subtitle, lines, tone }: {
  label: string; title: string; subtitle?: string; lines: string[]; tone: "moss" | "amber" | "blue" | "sand";
}) {
  const border = { moss: "border-l-moss", amber: "border-l-amber", blue: "border-l-blue-400", sand: "border-l-sand" }[tone];
  const badge = { moss: "bg-moss/10 text-moss", amber: "bg-amber/10 text-amber", blue: "bg-blue-50 text-blue-600", sand: "bg-sand text-muted" }[tone];
  return (
    <div className={`card border-l-4 ${border} mb-4`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`min-w-8 h-8 px-1.5 rounded-full flex items-center justify-center flex-shrink-0 ${badge}`}>
          <span className="text-[11px] font-bold">{label}</span>
        </div>
        <div>
          <h3 className="font-display font-bold text-base">{title}</h3>
          {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
        </div>
      </div>
      <PlanLines lines={lines} />
    </div>
  );
}

// The products the plan says it used: its PRODUCTS USED section lists them as "Brand Name", one
// per line, and each is matched exactly against the products the server sent.
const norm = (s: string) => s.toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").trim();
export function mentionedIds(text: string, products: { id: string; name: string; brand: string }[]): string[] {
  const lines = text.split(/\r?\n/).map((l) => l.replace(/^[#*\-•\d.)\s]+/, "").trim()).filter(Boolean);
  const start = lines.findIndex((l) => /^PRODUCTS USED$/i.test(l));
  if (start === -1) return [];
  const used = new Set(lines.slice(start + 1).map(norm));
  return products.filter((p) => used.has(norm(`${p.brand} ${p.name}`)) || used.has(norm(p.name.startsWith(p.brand) ? p.name : ""))).map((p) => p.id);
}

// A product from the catalog, showing only the fields it has.
export function ModeProductCard({ p, note }: { p: ProductSummary; note?: string }) {
  return (
    <Link href={`/report/${p.id}`} className="block bg-white/60 border border-sand rounded-xl p-3 hover:shadow-md transition-all group">
      <div className="flex items-start gap-3">
        <BrandLogo logoDomain={p.logoDomain} logo={p.logo} brand={p.brand} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted mb-0.5">{p.category}</div>
          <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors leading-tight">{p.name}</div>
          <div className="text-xs text-muted">{p.brand}</div>
          {p.pelloScore != null && <div className="mt-1"><PelloScoreTag score={p.pelloScore} /></div>}
        </div>
        <div className="text-right flex-shrink-0 text-xs">
          {p.price > 0 && <div className="font-medium text-ink">{formatPrice(p.price)}</div>}
          {p.pricePerServing > 0 && <div className="text-muted">{formatPrice(p.pricePerServing)}/serving</div>}
          {p.reviewCount > 0 && <div className="text-muted" title={reviewSourceNote(p.reviewSource)}>{p.rating.toFixed(1)} from {reviewsAt(p.reviewCount, p.reviewSource)}</div>}
        </div>
      </div>
      {note && <p className="text-xs text-muted mt-2 leading-relaxed">{note}</p>}
    </Link>
  );
}

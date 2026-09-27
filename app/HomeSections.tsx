"use client";

// The home page below the hero: top picks, blog, quick fuel calculator, a head-to-head
// comparison and the planner call to action. Data is chosen on the server in app/page.tsx.

import Link from "next/link";
import { useState } from "react";
import type { ProductSummary } from "@/lib/catalog-types";
import { servingsPerContainer, formatPrice } from "@/lib/servings";
import { INTENSITY_MULTIPLIERS, type Intensity } from "@/lib/fuelling";
import BrandLogo from "@/components/BrandLogo";

export type PickGroup = { label: string; short: string; products: ProductSummary[] };
export type PostTeaser = { slug: string; title: string; description: string; category: string; readingTime: number };
export type HeadToHeadData = { post: string; products: ProductSummary[] };

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
};

function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { href: string; label: string } }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 flex-wrap">
      <div>
        <div className="text-xs text-muted uppercase tracking-widest mb-1">{eyebrow}</div>
        <h2 className="font-display font-bold text-2xl">{title}</h2>
      </div>
      {link && <Link href={link.href} className="text-sm text-moss hover:text-ink transition-colors">{link.label}</Link>}
    </div>
  );
}

function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Link href={`/report/${product.id}`} className="relative block h-full">
      <span className="absolute -top-2 left-3 z-10 bg-moss text-cream text-xs font-medium px-2 py-0.5 rounded-md">
        ★ Best {product.category}
      </span>
      <div className="card border-moss/30 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
        <div className="flex items-start justify-between mb-3">
          <BrandLogo logoDomain={product.logoDomain} logo={product.logo} brand={product.brand} />
          {product.transparencyScore != null ? (
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ background: product.transparencyScore >= 85 ? "#2D4A2D" : product.transparencyScore >= 70 ? "#C8860A" : "#B84C2E" }} />
              <span className="text-xs text-muted">{product.transparencyScore}%</span>
            </div>
          ) : (
            <span className="text-xs text-muted">Not yet scored</span>
          )}
        </div>
        <div className="text-xs text-muted mb-0.5">{product.brand}</div>
        <h3 className="font-display font-semibold text-base leading-tight mb-2 group-hover:text-moss transition-colors">{product.name}</h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-amber text-sm">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-muted">{product.rating} · {product.reviewCount.toLocaleString()} reviews</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {product.goals.slice(0, 2).map((g) => (
              <span key={g} className={`text-xs px-2 py-0.5 rounded-md ${GOAL_COLORS[g] ?? "bg-sand text-muted"}`}>{g}</span>
            ))}
          </div>
          <span className="text-xs text-muted">{formatPrice(product.price)} · {servingsPerContainer(product)} servings</span>
        </div>
      </div>
    </Link>
  );
}

// Nine picks by default (the top three in each main group); a group chip shows the
// best product in every category of that group. Phones show the first few, with a
// button for the rest, so the list doesn't become a long column.
const PHONE_PICKS = 3;

export function TopPicks({ groups, productCount }: { groups: PickGroup[]; productCount: number }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const shown = selected
    ? groups.find((g) => g.label === selected)?.products ?? []
    : groups.slice(0, 3).flatMap((g) => g.products.slice(0, 3));

  const chip = (label: string, key: string | null) => (
    <button
      key={label}
      type="button"
      onClick={() => {
        setSelected(key);
        setExpanded(false);
      }}
      aria-pressed={selected === key}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${selected === key ? "bg-moss text-cream border-moss" : "border-sand bg-white/50 text-muted hover:text-ink"}`}
    >
      {label}
    </button>
  );

  return (
    <section>
      <SectionHeading eyebrow="Top picks" title="Where we'd start" link={{ href: "/products", label: `Browse all ${productCount} products →` }} />
      <div className="flex gap-2 flex-wrap mb-6">
        {chip("All", null)}
        {groups.map((g) => chip(g.short, g.label))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-6">
        {shown.map((p, i) => (
          <div key={p.id} className={!expanded && i >= PHONE_PICKS ? "hidden sm:block" : undefined}>
            <ProductCard product={p} />
          </div>
        ))}
      </div>
      {!expanded && shown.length > PHONE_PICKS && (
        <button type="button" onClick={() => setExpanded(true)} className="sm:hidden btn-secondary w-full mt-5">
          Show all {shown.length} picks
        </button>
      )}
    </section>
  );
}

export function FromTheBlog({ posts }: { posts: PostTeaser[] }) {
  const [featured, ...rest] = posts;
  if (!featured) return null;
  return (
    <section>
      <SectionHeading eyebrow="From the blog" title="Read before you buy" link={{ href: "/blog", label: "All articles →" }} />
      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4">
        <Link href={`/blog/${featured.slug}`} className="group rounded-2xl bg-moss text-cream p-7 flex flex-col justify-end min-h-[240px] hover:bg-ink transition-colors">
          <span className="text-xs text-cream/70">{featured.category} · {featured.readingTime} min read</span>
          <h3 className="font-display font-bold text-2xl leading-tight mt-2 mb-2">{featured.title}</h3>
          <p className="text-sm text-cream/80 leading-relaxed">{featured.description}</p>
          <span className="text-sm mt-4 text-cream/90 group-hover:text-cream">Read the article →</span>
        </Link>
        {rest.slice(0, 1).map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="card p-7 hover:shadow-md transition-all group flex flex-col justify-end">
            <span className="text-xs text-muted">{post.category} · {post.readingTime} min read</span>
            <h3 className="font-display font-bold text-xl leading-tight mt-2 mb-2 group-hover:text-moss transition-colors">{post.title}</h3>
            <p className="text-sm text-muted leading-relaxed">{post.description}</p>
            <span className="text-sm mt-4 text-moss">Read the article →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const DURATIONS = [1, 2, 3, 4];

// A quick version of the carb calculator (app/guides/carb-calculator), using the same targets.
export function FuelCalculator() {
  const [hours, setHours] = useState(2);
  const [intensity, setIntensity] = useState<Intensity>("moderate");
  const perHour = INTENSITY_MULTIPLIERS[intensity].carbs;

  const option = (active: boolean) =>
    `text-sm px-3 py-2 rounded-xl border transition-colors ${active ? "border-moss bg-moss/5 text-moss font-medium" : "border-sand bg-white/40 text-muted hover:text-ink"}`;

  return (
    <div className="card p-6 flex flex-col">
      <div className="text-xs text-muted uppercase tracking-widest mb-1">Try it</div>
      <h2 className="font-display font-bold text-xl mb-5">How much fuel do you need?</h2>

      <div className="text-xs text-muted mb-2">Duration</div>
      <div className="flex gap-2 flex-wrap mb-4">
        {DURATIONS.map((h) => (
          <button key={h} type="button" aria-pressed={hours === h} onClick={() => setHours(h)} className={option(hours === h)}>
            {h} hr{h > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      <div className="text-xs text-muted mb-2">Intensity</div>
      <div className="flex gap-2 flex-wrap mb-6">
        {(Object.keys(INTENSITY_MULTIPLIERS) as Intensity[]).map((key) => (
          <button key={key} type="button" aria-pressed={intensity === key} onClick={() => setIntensity(key)} className={option(intensity === key)}>
            {INTENSITY_MULTIPLIERS[key].label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5" aria-live="polite">
        <div className="bg-white/60 rounded-xl p-4 text-center">
          <div className="font-display font-bold text-3xl text-moss">{perHour}g</div>
          <div className="text-xs text-muted mt-1">carbs per hour</div>
        </div>
        <div className="bg-white/60 rounded-xl p-4 text-center">
          <div className="font-display font-bold text-3xl text-moss">{perHour * hours}g</div>
          <div className="text-xs text-muted mt-1">carbs in total</div>
        </div>
      </div>
      <Link href="/guides/carb-calculator" className="text-sm text-moss hover:text-ink transition-colors mt-auto">
        Add body weight, fluid and sodium in the full calculator →
      </Link>
    </div>
  );
}

function valueOrDash(v: string | number | null | undefined) {
  return v == null ? "—" : v;
}

export function HeadToHead({ data }: { data: HeadToHeadData }) {
  const [a, b] = data.products;
  // Rows where neither product has a value are left out.
  const rows: [string, (p: ProductSummary) => string | number | null][] = [
    ["Rating", (p) => (p.reviewCount > 0 ? `${p.rating} (${p.reviewCount.toLocaleString()})` : "No reviews yet")],
    ["Carbs per serving", (p) => (p.nutrition.carbsPerServing != null ? `${p.nutrition.carbsPerServing}g` : null)],
    ["Glucose : fructose", (p) => p.nutrition.glucoseFructoseRatio],
    ["Hydrogel", (p) => (p.nutrition.isHydrogel ? "Yes" : "No")],
    ["Price per serving", (p) => formatPrice(Math.round(p.pricePerServing * 100) / 100)],
  ];

  return (
    <div className="card p-6 flex flex-col">
      <div className="text-xs text-muted uppercase tracking-widest mb-1">Head to head</div>
      <h2 className="font-display font-bold text-xl mb-5">{a.brand} vs {b.brand}</h2>
      <table className="w-full text-sm mb-5">
        <thead>
          <tr>
            <th className="w-[38%]" />
            {[a, b].map((p) => (
              <th key={p.id} className="text-left font-normal pb-3 align-bottom">
                <Link href={`/report/${p.id}`} className="font-display font-semibold hover:text-moss transition-colors">{p.name}</Link>
                <div className="text-xs text-muted">{p.brand}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.filter(([, get]) => get(a) != null || get(b) != null).map(([label, get]) => (
            <tr key={label} className="border-t border-sand">
              <td className="py-2 pr-2 text-xs text-muted">{label}</td>
              <td className="py-2 pr-2">{valueOrDash(get(a))}</td>
              <td className="py-2">{valueOrDash(get(b))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-4 flex-wrap mt-auto text-sm">
        <Link href={`/blog/${data.post}`} className="text-moss hover:text-ink transition-colors">Read the full comparison →</Link>
        <Link href={`/compare?ids=${a.id},${b.id}`} className="text-muted hover:text-ink transition-colors">Compare side by side</Link>
      </div>
    </div>
  );
}

export function PlanCallToAction() {
  return (
    <section className="card bg-moss/5 border-moss/20 text-center py-10">
      <h2 className="font-display font-bold text-xl mb-2">Not sure where to start?</h2>
      <p className="text-muted text-sm mb-5 max-w-md mx-auto">
        Answer a few questions about your training and we&apos;ll build a fuelling plan from the products we track.
      </p>
      <div className="flex gap-3 justify-center flex-wrap">
        <Link href="/quiz" className="btn-primary">Build my plan →</Link>
        <Link href="/products" className="btn-secondary">Browse all products</Link>
      </div>
    </section>
  );
}

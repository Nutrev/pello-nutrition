"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { getFulensScoreLabel } from "@/lib/fulens-score";
import { PRICE_POSITION_LABEL, PRICE_POSITION_STYLE, type Brand, type PricePosition } from "@/lib/brand-types";

export type BrandListItem = Pick<Brand, "slug" | "name" | "logo" | "logoDomain" | "hq" | "pricePosition" | "productCount" | "avgPelloScore" | "categories">;

type Sort = "products" | "score" | "name";

export default function BrandsClient({ brands }: { brands: BrandListItem[] }) {
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState<PricePosition | "all">("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState<Sort>("products");

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of brands) for (const c of b.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    return Array.from(counts).sort((a, b) => b[1] - a[1]).map(([c]) => c);
  }, [brands]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return brands
      .filter((b) => !q || b.name.toLowerCase().includes(q) || b.categories.some((c) => c.toLowerCase().includes(q)))
      .filter((b) => price === "all" || b.pricePosition === price)
      .filter((b) => category === "all" || b.categories.includes(category))
      .sort((a, b) =>
        sort === "score" ? b.avgPelloScore - a.avgPelloScore
        : sort === "name" ? a.name.localeCompare(b.name)
        : b.productCount - a.productCount || a.name.localeCompare(b.name));
  }, [brands, query, price, category, sort]);

  const select = "text-sm bg-white/60 border border-sand rounded-lg px-3 py-2 focus:outline-none focus:border-moss";

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">Brands</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">Sports nutrition brands</h1>
          <p className="text-muted text-sm max-w-2xl">
            {brands.length} brands on Pello. Scores and price positions come from our analysis of each brand&apos;s products, not from the brands.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search brands or categories"
            aria-label="Search brands"
            className={`${select} flex-1`}
          />
          <select aria-label="Price position" value={price} onChange={(e) => setPrice(e.target.value as PricePosition | "all")} className={select}>
            <option value="all">Any price</option>
            {(Object.keys(PRICE_POSITION_LABEL) as PricePosition[]).map((p) => <option key={p} value={p}>{PRICE_POSITION_LABEL[p]}</option>)}
          </select>
          <select aria-label="Category" value={category} onChange={(e) => setCategory(e.target.value)} className={select}>
            <option value="all">All categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={select}>
            <option value="products">Most products</option>
            <option value="score">Highest Pello Score</option>
            <option value="name">A–Z</option>
          </select>
        </div>

        <p className="text-xs text-muted mb-4">{shown.length} brand{shown.length !== 1 ? "s" : ""}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((b) => {
            const grade = getFulensScoreLabel(b.avgPelloScore);
            return (
              <Link key={b.slug} href={`/brands/${b.slug}`}>
                <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <BrandLogo logoDomain={b.logoDomain ?? undefined} logo={b.logo ?? undefined} brand={b.name} size="md" />
                    <span className={`text-xs px-2 py-0.5 rounded-md ${PRICE_POSITION_STYLE[b.pricePosition]}`}>{PRICE_POSITION_LABEL[b.pricePosition]}</span>
                  </div>
                  <h2 className="font-display font-semibold text-base leading-tight group-hover:text-moss transition-colors">{b.name}</h2>
                  <div className="text-xs text-muted mb-3">{b.hq ?? b.categories.slice(0, 2).join(" · ")}</div>
                  <div className="mt-auto flex items-center justify-between text-xs">
                    <span className="text-muted">{b.productCount} product{b.productCount !== 1 ? "s" : ""}</span>
                    <span className="flex items-center gap-1.5" title={`Average Pello Score: ${grade.label}`}>
                      <span className="h-2 w-2 rounded-full" style={{ background: grade.color }} />
                      <span className="text-muted">Avg Pello Score</span>
                      <span className="font-medium text-ink">{b.avgPelloScore}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {shown.length === 0 && (
          <div className="card text-center text-sm text-muted">No brands match. Try a different search or filter.</div>
        )}
      </div>
    </div>
  );
}

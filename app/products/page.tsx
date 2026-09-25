"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { PRODUCTS, Category, Product } from "@/lib/products";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
};

const BRAND_ALIASES: Record<string, string> = {
  "sis": "science in sport",
  "tl": "transparent labs",
  "pf": "precision fuel",
  "ph": "precision fuel",
  "gu": "gu energy",
  "dr hydrate": "dr. hydrate",
  "drhydrate": "dr. hydrate",
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/report/${product.id}`}>
      <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
        <div className="flex items-start justify-between mb-3">
          <BrandLogo
            logoDomain={product.logoDomain}
            logo={product.logo}
            brand={product.brand} />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: product.transparencyScore >= 85 ? "#2D4A2D" : product.transparencyScore >= 70 ? "#C8860A" : "#B84C2E" }} />
            <span className="text-xs font-mono text-muted">{product.transparencyScore}% transparent</span>
          </div>
        </div>
        <div className="text-xs text-muted font-body mb-0.5">{product.brand}</div>
        <h3 className="font-display font-semibold text-base leading-tight mb-2 group-hover:text-moss transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex text-amber text-sm">
            {"★".repeat(Math.round(product.rating))}
            {"☆".repeat(5 - Math.round(product.rating))}
          </div>
          <span className="text-xs text-muted font-mono">{product.rating}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{product.reviewCount.toLocaleString()} reviews</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex gap-1 flex-wrap">
            {product.goals.slice(0, 2).map((g) => (
              <span key={g} className={`text-xs px-2 py-0.5 rounded-md font-mono ${GOAL_COLORS[g] ?? "bg-sand text-muted"}`}>{g}</span>
            ))}
          </div>
          <span className="text-xs font-mono text-muted">${product.price}/mo</span>
        </div>
      </div>
    </Link>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  if (typeof window !== "undefined") {
    document.title = "All Products | Pello";
  }

  const allCategories = Array.from(new Set(PRODUCTS.map((p) => p.category))) as Category[];

  const resolvedSearch = BRAND_ALIASES[search.toLowerCase()] ?? search.toLowerCase();

  const filteredProducts = PRODUCTS.filter(
    (p) =>
      search === "" ||
      p.name.toLowerCase().includes(resolvedSearch) ||
      p.brand.toLowerCase().includes(resolvedSearch) ||
      p.category.toLowerCase().includes(resolvedSearch)
  );

  const grouped = allCategories.reduce<Record<string, Product[]>>((acc, cat) => {
    const inCat = filteredProducts.filter((p) => p.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Full Explore</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">All products</h1>
          <p className="text-muted text-sm">
            {PRODUCTS.length} products across {allCategories.length} categories — sorted by rating within each group
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <input
            type="text"
            placeholder="Search products, brands or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/60 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted"
          />
          {search && (
            <p className="text-xs text-muted mt-2 font-mono">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? "s" : ""} for "{search}"
            </p>
          )}
        </div>

        {/* Jump links */}
        {!search && (
          <div className="flex flex-wrap gap-2 mb-10">
            {allCategories.map((cat) => (
              <Link
                key={cat}
                href={`/products/${cat.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and")}`}
                className="text-xs bg-white/60 border border-sand px-3 py-1.5 rounded-lg font-mono hover:border-muted transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        )}

        {/* Grouped by category */}
        {Object.entries(grouped).map(([category, products]) => (
          <div key={category} id={category.toLowerCase().replace(/\s+/g, "-")} className="mb-14 scroll-mt-20">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="font-display font-bold text-xl">{category}</h2>
                  <p className="text-xs text-muted font-mono">
                    {products.length} product{products.length !== 1 ? "s" : ""} · sorted by rating
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-moss/5 border border-moss/20 px-3 py-1.5 rounded-lg">
                <span className="text-xs font-mono text-moss">
                  ★ Top rated: {[...products].sort((a, b) => b.rating - a.rating)[0].brand}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...products].sort((a, b) => b.rating - a.rating).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="font-display font-medium">No products match your search</p>
            <p className="text-sm mt-1">Try a different keyword or brand name</p>
            <button onClick={() => setSearch("")} className="btn-secondary mt-4 text-xs">
              Clear search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ProductsContent />
    </Suspense>
  );
}
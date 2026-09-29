"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import type { Category } from "@/lib/products";
import { byWeightedRating, categorySlug, type ProductSummary } from "@/lib/catalog-types";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";


const BRAND_ALIASES: Record<string, string> = {
  "sis": "science in sport",
  "tl": "transparent labs",
  "pf": "precision fuel",
  "ph": "precision fuel",
  "gu": "gu energy",
  "dr hydrate": "dr. hydrate",
  "drhydrate": "dr. hydrate",
};


export default function ProductsClient({ catalog }: { catalog: ProductSummary[] }) {
  const PRODUCTS = catalog;
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

  const grouped = allCategories.reduce<Record<string, ProductSummary[]>>((acc, cat) => {
    const inCat = filteredProducts.filter((p) => p.category === cat);
    if (inCat.length > 0) acc[cat] = inCat;
    return acc;
  }, {});

  return (
    <div className="min-h-screen">

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs text-muted uppercase tracking-widest mb-1">Full Explore</div>
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
            <p className="text-xs text-muted mt-2">
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
                href={`/products/${categorySlug(cat)}`}
                className="text-xs bg-white/60 border border-sand px-3 py-1.5 rounded-lg hover:border-muted transition-all"
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
                  <p className="text-xs text-muted">
                    {products.length} product{products.length !== 1 ? "s" : ""} · sorted by rating
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 bg-moss/5 border border-moss/20 px-3 py-1.5 rounded-lg">
                <span className="text-xs text-moss">
                  ★ Top rated: {[...products].sort(byWeightedRating)[0].brand}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...products].sort(byWeightedRating).map((product) => (
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

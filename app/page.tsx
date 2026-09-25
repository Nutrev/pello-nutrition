"use client";

import { PRODUCTS, Product } from "@/lib/products";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { useState, useEffect, useMemo } from "react";

const HEADLINES = [
  { static: "Find nutrition", rotating: "that actually works" },
  { static: "Build your", rotating: "fueling plan" },
  { static: "Discover what's in", rotating: "your gels" },
  { static: "Compare products", rotating: "side by side" },
];

function RotatingHeadline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % HEADLINES.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {HEADLINES[index].static}<br />
      <span
        className="text-moss italic transition-opacity duration-400"
        style={{ opacity: visible ? 1 : 0 }}
      >
        {HEADLINES[index].rotating}
      </span>
    </>
  );
}

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
};

function getBestPerCategory(): Product[] {
  const seen = new Map<string, Product>();
  for (const p of PRODUCTS) {
    const existing = seen.get(p.category);
    if (!existing || p.rating > existing.rating) {
      seen.set(p.category, p);
    }
  }
  return Array.from(seen.values());
}

function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  return (
    <Link href={`/report/${product.id}`}>
      <div className={`card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full ${featured ? "border-moss/30" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <BrandLogo logoDomain={product.logoDomain} logo={product.logo} brand={product.brand} />
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full" style={{ background: product.transparencyScore >= 85 ? "#2D4A2D" : product.transparencyScore >= 70 ? "#C8860A" : "#B84C2E" }} />
            <span className="text-xs font-mono text-muted">{product.transparencyScore}%</span>
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

export default function HomePage() {
  const [heroSearch, setHeroSearch] = useState("");
  const highlights = getBestPerCategory();
  const featuredProducts = useMemo(() => {
  const shuffled = [...PRODUCTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}, []);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-moss/10 text-moss text-xs font-mono font-medium px-3 py-1 rounded-full mb-4">
            Science-backed · AI-powered · {PRODUCTS.reduce((a, p) => a + p.reviewCount, 0).toLocaleString()} reviews analyzed
          </div>
          <h1 className="font-display font-bold text-5xl leading-[1.05] tracking-tight mb-4">
            <RotatingHeadline />
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-8">
            We aggregate thousands of real reviews, cross-reference ingredients with peer-reviewed science, and use AI to generate clear, unbiased reports.
          </p>
          <div className="flex gap-3 flex-wrap mb-6">
            <Link href="/quiz" className="btn-primary">Build my plan →</Link>
            <Link href="/products" className="btn-secondary">Browse all products</Link>
          </div>

          {/* Search */}
          <div className="relative max-w-lg">
            <input
              type="text"
              placeholder="Search products, brands or categories..."
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && heroSearch.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(heroSearch.trim())}`;
                }
              }}
              className="w-full bg-white/80 border border-sand rounded-xl px-4 py-3 text-sm outline-none focus:border-muted font-body placeholder:text-muted pr-24"
            />
            <button
              onClick={() => {
                if (heroSearch.trim()) {
                  window.location.href = `/products?q=${encodeURIComponent(heroSearch.trim())}`;
                }
              }}
              className="absolute right-2 top-2 btn-primary text-xs py-1.5 px-3"
            >
              Search
            </button>
          </div>
        </div>

        {/* Right — floating product cards */}
        <div className="hidden lg:flex flex-col gap-4 flex-shrink-0 w-64">
          {featuredProducts.map((p, i) => (
            <Link key={p.id} href={`/report/${p.id}`}>
              <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group"
                style={{ transform: `rotate(${i % 2 === 0 ? "-1.5" : "1.5"}deg)` }}>
                <div className="text-xs font-mono text-muted mb-1">{p.brand}</div>
                <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors mb-2">{p.name}</div>
                <div className="flex items-center justify-between">
                  <span className="text-amber text-xs">★★★★★</span>
                  <span className="text-xs font-mono bg-moss/10 text-moss px-2 py-0.5 rounded-md">{p.category}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>

      {/* Stats strip */}
      <div className="border-y border-sand bg-white/30 py-5 mb-12">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-display font-semibold text-2xl">{PRODUCTS.reduce((a, p) => a + p.reviewCount, 0).toLocaleString()}</div>
            <div className="text-muted text-xs mt-0.5">Reviews analyzed</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">{PRODUCTS.length}</div>
            <div className="text-muted text-xs mt-0.5">Products tracked</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">100%</div>
            <div className="text-muted text-xs mt-0.5">Editorially independent</div>
          </div>
        </div>
      </div>

      {/* Best in category */}
      <div className="max-w-5xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Top rated per category</div>
            <h2 className="font-display font-bold text-2xl">Best in category</h2>
          </div>
          <Link href="/products" className="btn-secondary text-xs py-1.5 px-3">
            View all {PRODUCTS.length} products →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {highlights.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute -top-2 left-3 z-10">
                <span className="bg-moss text-cream text-xs font-mono font-medium px-2 py-0.5 rounded-md">
                  ★ Best {product.category}
                </span>
              </div>
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card bg-moss/5 border-moss/20 text-center py-10">
          <h3 className="font-display font-bold text-xl mb-2">Explore all {PRODUCTS.length} products</h3>
          <p className="text-muted text-sm mb-5 max-w-md mx-auto">
            Browse every product we track, organised by category — from energy gels and drink mixes to protein and recovery supplements.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/products" className="btn-primary">Browse all products →</Link>
            <Link href="/quiz" className="btn-secondary">Build my plan</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

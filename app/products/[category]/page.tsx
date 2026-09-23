"use client";

import { PRODUCTS, Product } from "@/lib/products";
import Link from "next/link";
import Logo from "@/components/Logo";
import { notFound } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

const GOAL_COLORS: Record<string, string> = {
  muscle: "bg-moss/10 text-moss",
  fat: "bg-amber/10 text-amber",
  endurance: "bg-rust/10 text-rust",
  recovery: "bg-muted/10 text-muted",
  health: "bg-sage/10 text-sage",
  sleep: "bg-muted/10 text-muted",
  immunity: "bg-moss/10 text-moss",
};

function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/report/${product.id}`}>
      <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group h-full">
        <div className="flex items-start justify-between mb-3">
          <BrandLogo
             logoDomain={product.logoDomain}
              logo={product.logo}
              brand={product.brand}
              imageEmoji={product.imageEmoji}
              logoSize={product.logoSize}
              />
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

export default function CategoryPage({ params }: { params: { category: string } }) {
  // Convert URL slug back to category name e.g. "energy-gel" → "Energy Gel"
  const slug = params.category;
  const allCategories = Array.from(new Set(PRODUCTS.map((p) => p.category)));
  const matched = allCategories.find(
    (cat) => cat.toLowerCase().replace(/\s+/g, "-").replace(/&/g, "and") === slug
  );

  if (!matched) notFound();

  const products = PRODUCTS
    .filter((p) => p.category === matched)
    .sort((a, b) => b.rating - a.rating);

  const topProduct = products[0];

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="text-sm text-muted hover:text-ink transition-colors">← All products</Link>
            <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
            <Link href="/Explore" className="text-sm text-muted hover:text-ink transition-colors">Explore</Link><Link href="/ingredients" className="text-sm text-muted hover:text-ink transition-colors">Ingredients</Link><Link href="/graph" className="text-sm text-muted hover:text-ink transition-colors">Graph</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-1">Category</div>
          <h1 className="font-display font-bold text-3xl tracking-tight mb-2">{matched}</h1>
          <p className="text-muted text-sm">
            {products.length} product{products.length !== 1 ? "s" : ""} · sorted by rating
          </p>
        </div>

        {/* Top rated callout */}
        {topProduct && (
          <div className="card bg-moss/5 border-moss/20 flex items-center gap-4 mb-8">
            {topProduct.logo && (
              <img src={topProduct.logo} alt={topProduct.brand} className="h-10 w-auto object-contain flex-shrink-0" />
            )}
            <div className="flex-1">
              <div className="text-xs font-mono text-moss mb-0.5">★ Top rated in {matched}</div>
              <div className="font-display font-semibold">{topProduct.name}</div>
              <div className="text-xs text-muted">{topProduct.brand} · {topProduct.rating}/5 · {topProduct.reviewCount.toLocaleString()} reviews</div>
            </div>
            <Link href={`/report/${topProduct.id}`} className="btn-primary text-xs py-1.5 px-3 whitespace-nowrap">
              View report →
            </Link>
          </div>
        )}

        {/* Other categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from(new Set(PRODUCTS.map((p) => p.category)))
            .filter((cat) => cat !== matched)
            .map((cat) => (
              <Link
                key={cat}
                href={`/products/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                className="text-xs bg-white/60 border border-sand px-3 py-1.5 rounded-lg font-mono hover:border-muted transition-all"
              >
                {cat}
              </Link>
            ))}
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
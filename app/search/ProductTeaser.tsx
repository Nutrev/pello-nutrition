"use client";

// A slowly drifting row of well-reviewed products, shown below the search box before
// anyone types. It pauses on hover or keyboard focus, and stays still (and scrolls by
// hand) for people who prefer reduced motion. See .marquee-* in app/globals.css.
import Link from "next/link";
import type { ProductSummary } from "@/lib/catalog-types";

function Card({ product, hidden = false }: { product: ProductSummary; hidden?: boolean }) {
  return (
    <Link
      href={`/report/${product.id}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      className={`flex-shrink-0 w-48 mr-3 bg-white/60 border border-sand rounded-2xl px-4 py-3 hover:-translate-y-0.5 hover:shadow-md focus-visible:-translate-y-0.5 focus-visible:shadow-md transition-all group${hidden ? " marquee-copy" : ""}`}
    >
      <span className="inline-block text-xs bg-moss/10 text-moss px-1.5 py-0.5 rounded-md mb-1.5 whitespace-nowrap">{product.category}</span>
      <div className="text-xs text-muted truncate">{product.brand}</div>
      <div className="font-display font-semibold text-sm leading-snug mt-0.5 mb-2 line-clamp-2 min-h-[2.5rem] group-hover:text-moss transition-colors">
        {product.name}
      </div>
      <div className="text-xs text-muted whitespace-nowrap">
        <span className="text-amber">{"★".repeat(Math.round(product.rating))}{"☆".repeat(5 - Math.round(product.rating))}</span> {product.rating} ({product.reviewCount.toLocaleString()})
      </div>
    </Link>
  );
}

export default function ProductTeaser({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null;
  return (
    <section aria-label="Well-reviewed products" className="marquee relative -mx-6 overflow-hidden">
      {/* Fades at the edges, so cards slide in and out softly. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 w-10 z-10 bg-gradient-to-r from-cream to-transparent" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-10 z-10 bg-gradient-to-l from-cream to-transparent" />
      {/* The list is repeated once so the loop is seamless; the copy is hidden from screen
          readers and the keyboard. Each card carries its own right margin (not a gap), so
          the two halves are exactly the same width. About 5s per card keeps the pace slow. */}
      <div className="marquee-track flex w-max py-1" style={{ animationDuration: `${products.length * 5}s` }}>
        {products.map((p) => <Card key={p.id} product={p} />)}
        {products.map((p) => <Card key={`${p.id}-copy`} product={p} hidden />)}
      </div>
    </section>
  );
}

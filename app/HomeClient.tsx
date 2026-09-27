"use client";

import type { ProductSummary } from "@/lib/catalog-types";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  TopPicks, FromTheBlog, FuelCalculator, HeadToHead, PlanCallToAction,
  type PickGroup, type PostTeaser, type HeadToHeadData,
} from "./HomeSections";

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

interface HomeProps {
  pickGroups: PickGroup[];
  featuredPool: ProductSummary[];
  posts: PostTeaser[];
  headToHead: HeadToHeadData | null;
  productCount: number;
  reviewTotal: number;
}

export default function HomeClient({ pickGroups, featuredPool, posts, headToHead, productCount, reviewTotal }: HomeProps) {
  const [heroSearch, setHeroSearch] = useState("");
  // Picked after mount: a random choice during render differs between server and browser
  // and causes a hydration mismatch.
  const [featuredProducts, setFeaturedProducts] = useState<ProductSummary[]>([]);
  useEffect(() => {
    setFeaturedProducts([...featuredPool].sort(() => Math.random() - 0.5).slice(0, 3));
  }, []);

  return (
    <div className="min-h-screen">

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-6 pt-16 pb-10">
        <div className="flex flex-col lg:flex-row gap-12 items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 bg-moss/10 text-moss text-xs font-medium px-3 py-1 rounded-full mb-4">
            Science-backed · {reviewTotal.toLocaleString()} customer reviews
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
                <div className="text-xs text-muted mb-1">{p.brand}</div>
                <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors mb-2">{p.name}</div>
                <div className="flex items-center justify-between">
                  {p.reviewCount > 0 ? (
                    <span className="text-xs text-muted">
                      <span className="text-amber">{"★".repeat(Math.round(p.rating))}{"☆".repeat(5 - Math.round(p.rating))}</span> {p.rating}
                    </span>
                  ) : (
                    <span className="text-xs text-muted">No reviews yet</span>
                  )}
                  <span className="text-xs bg-moss/10 text-moss px-2 py-0.5 rounded-md">{p.category}</span>
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
            <div className="font-display font-semibold text-2xl">{reviewTotal.toLocaleString()}</div>
            <div className="text-muted text-xs mt-0.5">Customer reviews</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">{productCount}</div>
            <div className="text-muted text-xs mt-0.5">Products tracked</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">100%</div>
            <div className="text-muted text-xs mt-0.5">Editorially independent</div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        <TopPicks groups={pickGroups} productCount={productCount} />
        <FromTheBlog posts={posts} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FuelCalculator />
          {headToHead && <HeadToHead data={headToHead} />}
        </div>
        <PlanCallToAction />
      </div>
    </div>
  );
}

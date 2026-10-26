"use client";

// The blog list: category filters and a quick search, one large featured post, then the rest
// in a grid.
import { useState } from "react";
import Link from "next/link";
import BlogCover from "./BlogCover";

export type BlogCard = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  searchText: string;  // the article body, lowercased, for search
  readingTime: number;
  productCount: number;
  image?: { src: string; alt: string };
  packshots?: { src: string; alt: string }[];
  startHere?: boolean;
};

// Categories are plural ("Guides"); a single post reads better singular ("Guide · 9 min read").
const SINGULAR: Record<string, string> = { Guides: "Guide", Reviews: "Review", Comparisons: "Comparison" };

function meta(post: BlogCard) {
  return `${SINGULAR[post.category] ?? post.category} · ${post.readingTime} min read`;
}

function mentioned(count: number) {
  return count > 0 ? `${count} product${count === 1 ? "" : "s"} mentioned` : null;
}

// A post matches when every word of the search appears in its title, description, category, tags
// or text.
function matches(post: BlogCard, query: string) {
  const text = [post.title, post.description, post.category, ...post.tags, post.searchText].join(" ").toLowerCase();
  return query.toLowerCase().split(/\s+/).filter(Boolean).every((word) => text.includes(word));
}

export default function BlogIndex({ posts }: { posts: BlogCard[] }) {
  const [filter, setFilter] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const searching = query.trim() !== "";
  const categories = Array.from(new Set(posts.map((p) => p.category)));
  const shown = posts.filter((p) => (!filter || p.category === filter) && (!searching || matches(p, query)));
  // The "Start here" post leads the full list; a filtered or searched list leads with its newest post.
  const narrowed = !!filter || searching;
  const featured = (!narrowed && shown.find((p) => p.startHere)) || shown[0];
  const rest = shown.filter((p) => p !== featured);
  // Pack shots sit on sand rather than moss, so the products keep their own colors.
  const featuredOnSand = !featured?.image && !!featured?.packshots?.length;

  const pill = (label: string, count: number, value: string | null) => {
    const on = filter === value;
    return (
      <button key={label} type="button" aria-pressed={on} onClick={() => setFilter(value)}
        className={`whitespace-nowrap text-sm px-3.5 py-1.5 rounded-full transition-colors ${on ? "bg-moss text-cream" : "border border-sand text-ink hover:bg-sand/60"}`}>
        {label} <span className={on ? "opacity-70" : "text-muted"}>{count}</span>
      </button>
    );
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-7 mb-8">
        <div className="flex-1 min-w-0 flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 sm:mx-0 sm:px-0">
          {pill("All", posts.length, null)}
          {categories.map((c) => pill(c, posts.filter((p) => p.category === c).length, c))}
        </div>
        <div role="search" className="relative sm:w-56 flex-shrink-0">
          <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="9" cy="9" r="5.5" /><path d="M13.5 13.5L17 17" strokeLinecap="round" />
          </svg>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Escape") setQuery(""); }}
            placeholder="Search articles" aria-label="Search articles"
            className="w-full text-sm bg-white/60 border border-sand rounded-full pl-9 pr-3 py-1.5 placeholder:text-muted focus:outline-none focus:border-moss/50" />
        </div>
      </div>

      {shown.length === 0 && (
        <div className="card text-center py-10">
          <p className="text-sm text-muted">No articles match &ldquo;{query.trim()}&rdquo;{filter ? ` in ${filter}` : ""}.</p>
          <button type="button" onClick={() => { setQuery(""); setFilter(null); }} className="text-sm text-moss hover:underline mt-2">
            Show all articles
          </button>
        </div>
      )}

      {featured && (
        <Link href={`/blog/${featured.slug}`}
          className="group grid md:grid-cols-[1.1fr_1fr] rounded-2xl overflow-hidden border border-sand bg-white/60 hover:shadow-md transition-all">
          <div className={`relative ${featuredOnSand ? "bg-sand/50" : "bg-moss"} min-h-[200px] md:min-h-[300px] overflow-hidden`}>
            <BlogCover slug={featured.slug} category={featured.category} image={featured.image} packshots={featured.packshots} featured />
            <div className="relative p-6 flex flex-col h-full justify-between min-h-[200px] md:min-h-[300px]">
              {featured.startHere && !narrowed ? (
                <span className={`self-start text-xs ${featuredOnSand ? "text-ink/80 border-ink/20" : "text-cream/90 border-cream/40"} border rounded-full px-2.5 py-0.5 backdrop-blur-sm`}>Start here</span>
              ) : <span />}
              {!featured.image && !featuredOnSand && <div className="text-cream/90 font-display font-semibold text-sm">{featured.category}</div>}
            </div>
          </div>
          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="text-xs text-muted">{meta(featured)}</div>
            <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight tracking-tight mt-2 mb-3 group-hover:text-moss transition-colors">
              {featured.title}
            </h2>
            <p className="text-muted leading-relaxed">{featured.description}</p>
            <div className="mt-5 flex items-center justify-between gap-4 text-sm">
              <span className="text-muted">{mentioned(featured.productCount)}</span>
              <span className="text-moss font-medium whitespace-nowrap">Read the article →</span>
            </div>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          {rest.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group card !p-0 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col">
              <div className="relative h-28 bg-sand/50 overflow-hidden">
                <BlogCover slug={post.slug} category={post.category} image={post.image} packshots={post.packshots} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <div className="text-xs text-muted">{meta(post)}</div>
                <h3 className="font-display font-bold text-lg leading-snug mt-1.5 mb-2 group-hover:text-moss transition-colors">{post.title}</h3>
                <p className="text-sm text-muted leading-relaxed line-clamp-2">{post.description}</p>
                {mentioned(post.productCount) && <div className="mt-auto pt-4 text-xs text-muted">{mentioned(post.productCount)}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

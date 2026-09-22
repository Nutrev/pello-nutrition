import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports Nutrition Blog",
  description: "Science-backed guides, product comparisons and nutrition advice for endurance athletes. Evidence-based articles on energy gels, supplements, race nutrition and more.",
  openGraph: {
    title: "Sports Nutrition Blog | Pello",
    description: "Science-backed nutrition guides and product comparisons for endurance athletes.",
    url: "https://www.pellonutrition.com/blog",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  "Reviews": "bg-moss/10 text-moss",
  "Science": "bg-amber/10 text-amber",
  "Guides": "bg-blue-50 text-blue-700",
  "Comparisons": "bg-purple-50 text-purple-700",
  "Race Nutrition": "bg-rust/10 text-rust",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Pel<span className="text-moss">lo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/guides" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Guides</Link><Link href="/blog" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/compare" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Pello Blog</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Sports Nutrition</h1>
          <p className="text-muted text-lg leading-relaxed">
            Science-backed guides, product comparisons and race nutrition advice for endurance athletes.
          </p>
        </div>

        <div className="space-y-6">
          {posts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}>
              <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${CATEGORY_COLORS[post.category] ?? "bg-sand text-muted"}`}>
                    {post.category}
                  </span>
                  <span className="text-xs font-mono text-muted flex-shrink-0">{post.readingTime} min read</span>
                </div>
                <h2 className="font-display font-bold text-xl mb-2 group-hover:text-moss transition-colors leading-tight">
                  {post.title}
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-4">{post.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted font-mono">{post.date}</span>
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">{tag}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-16 text-muted">
            <p className="font-display font-medium mb-2">No posts yet</p>
            <p className="text-sm">Check back soon — new articles coming weekly.</p>
          </div>
        )}
      </div>
    </div>
  );
}

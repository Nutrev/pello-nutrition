import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { PRODUCTS } from "@/lib/products";
import BlogIndex, { type BlogCard } from "./BlogIndex";
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

export default function BlogPage() {
  // Only what the cards need, so post bodies aren't sent to the browser. Product counts
  // include only linked products that are still on the site.
  const posts: BlogCard[] = getAllPosts().map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    category: post.category,
    readingTime: post.readingTime,
    productCount: post.relatedProducts.filter((id) => PRODUCTS.some((p) => p.id === id)).length,
    image: post.image,
    startHere: post.startHere,
  }));

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-6 py-14">
        <div className="text-xs text-muted uppercase tracking-widest mb-2">Pello Blog</div>
        <h1 className="font-display font-bold text-4xl sm:text-5xl tracking-tight mb-3">Sports nutrition, explained</h1>
        <p className="text-muted text-lg leading-relaxed max-w-xl">
          Guides, product comparisons and the science behind fueling — written for runners, cyclists and triathletes.
        </p>

        {posts.length > 0 ? (
          <BlogIndex posts={posts} />
        ) : (
          <div className="text-center py-16 text-muted">
            <p className="font-display font-medium mb-2">No posts yet</p>
            <p className="text-sm">Check back soon — new articles coming weekly.</p>
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-sand p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-semibold text-lg">Ready to put it into practice?</h2>
            <p className="text-sm text-muted">Build a fueling plan for your next session or race in about a minute.</p>
          </div>
          <Link href="/quiz" className="btn-primary inline-flex justify-center whitespace-nowrap">Build my plan →</Link>
        </div>
      </div>
    </div>
  );
}

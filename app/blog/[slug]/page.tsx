import Link from "next/link";
import { getPostBySlug, getAllPosts } from "@/lib/blog-data";
import { PRODUCTS } from "@/lib/products";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(post => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post not found" };
  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://www.pellonutrition.com/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  "Reviews": "bg-moss/10 text-moss",
  "Science": "bg-amber/10 text-amber",
  "Guides": "bg-blue-50 text-blue-700",
  "Comparisons": "bg-purple-50 text-purple-700",
  "Race Nutrition": "bg-rust/10 text-rust",
};

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="font-display font-bold text-2xl mt-10 mb-4 text-ink">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3 key={i} className="font-display font-bold text-lg mt-6 mb-2 text-ink">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith("**") && line.endsWith("**")) {
      elements.push(
        <p key={i} className="font-semibold text-ink mt-4 mb-1">
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="flex items-start gap-2 text-muted mb-1.5">
          <span className="text-moss flex-shrink-0 mt-1">→</span>
          <span className="text-sm leading-relaxed">{renderInline(line.slice(2))}</span>
        </div>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="text-muted leading-relaxed mb-3 text-sm">
          {renderInline(line)}
        </p>
      );
    }
    i++;
  }

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle bold, links
  const parts = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-ink">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch) {
      return <Link key={i} href={linkMatch[2]} className="text-moss underline underline-offset-2">{linkMatch[1]}</Link>;
    }
    return part;
  });
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const relatedProducts = post.relatedProducts
    ?.map(id => PRODUCTS.find(p => p.id === id))
    .filter(Boolean) as typeof PRODUCTS;

  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Pel<span className="text-moss">lo</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Products</Link>
            <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
<Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
          </div>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/blog" className="text-xs text-muted hover:text-ink transition-colors font-mono">← Blog</Link>
            <span className={`text-xs font-mono px-2 py-0.5 rounded-md ${CATEGORY_COLORS[post.category] ?? "bg-sand text-muted"}`}>
              {post.category}
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl leading-tight tracking-tight mb-4">{post.title}</h1>
          <p className="text-muted text-lg leading-relaxed mb-4">{post.description}</p>
          <div className="flex items-center gap-3 text-xs font-mono text-muted">
            <span>{post.author}</span>
            <span>·</span>
            <span>{post.date}</span>
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="mb-16">
          {renderMarkdown(post.content)}
        </div>

        {/* Related products */}
      {relatedProducts.map(p => p && (
          <Link key={p.id} href={`/report/${p.id}`}>
            <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center text-xs font-mono flex-shrink-0">
                {p.brand.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-xs font-mono text-muted mb-0.5">{p.category}</div>
                <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                <div className="text-xs text-muted">{p.brand} · {p.rating}★</div>
              </div>
              <div className="text-xs text-moss flex-shrink-0">Full report →</div>
            </div>
          </Link>
        ))}

        {/* CTA */}
        <div className="card bg-moss/5 border-moss/20 text-center py-8 mt-10">
          <h3 className="font-display font-semibold mb-2">Get your personalised nutrition plan</h3>
          <p className="text-xs text-muted mb-4">Tell us about your event and we'll build a complete pre, during and post protocol</p>
          <Link href="/quiz" className="btn-primary">Build my plan →</Link>
        </div>
      </article>
    </div>
  );
}

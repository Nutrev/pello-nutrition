import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getAllPosts, isPlaceholder, blogPlaceholders, referenceHref, type BlogPost } from "@/lib/blog";
import { PRODUCTS } from "@/lib/products";
import { getProductSummaries } from "@/lib/catalog";
import { reviewsAt, type ProductSummary } from "@/lib/catalog-types";
import { getFulensScoreLabel } from "@/lib/pello-grade";
import { AFFILIATES_ACTIVE, AMAZON_ACTIVE, AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate";
import ProductCard from "@/components/ProductCard";
import { costPerGramCarb } from "@/lib/cost";
import { formatPrice, servingsPerContainer } from "@/lib/servings";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const SITE = "https://www.pellonutrition.com";
const shareImage = (post: BlogPost) => post.ogImage ? new URL(post.ogImage, SITE).toString() : `${SITE}/og/blog/${post.slug}`;
const authorOf = (post: BlogPost) => (isPlaceholder(post.authorName) ? null : post.authorName!);
const reviewerOf = (post: BlogPost) =>
  post.reviewer && !isPlaceholder(post.reviewer.name) && !isPlaceholder(post.reviewer.credential) ? post.reviewer : null;
const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });

export async function generateStaticParams() {
  const posts = getAllPosts();
  const todo = blogPlaceholders();
  if (todo.length) console.warn(`Blog placeholders to fill in (hidden on the site until then): ${todo.join(", ")}`);
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
      url: `${SITE}/blog/${post.slug}`,
      type: "article",
      publishedTime: post.date,
      ...(post.updated ? { modifiedTime: post.updated } : {}),
      images: [{ url: shareImage(post), width: 1200, height: 630, alt: post.title }],
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.description, images: [shareImage(post)] },
  };
}

// Live product figures in article text, so they never go stale: {{score:id}}, {{grade:id}},
// {{pps:id}} (price per serving), {{price:id}} (pack price), {{servings:id}} (per pack),
// {{pergram:id}} (bicarb price per gram), {{rating:id}}, {{reviews:id}} ("92 reviews at The Feed"),
// {{carbs:id}} / {{protein:id}} (grams per serving), {{sodium:id}} / {{caffeine:id}} (mg per
// serving), {{cpgcarb:id}} (price per gram of carbs), {{creatine5g:id}} (price per 5g of
// creatine) and {{protein20g:id}} (price per 20g of protein), {{creatineg:id}} / {{bicarbg:id}}
// (grams per serving), {{bicarbsizes:id}} ("15g, 20g and 25g") and {{dose:id:Ingredient}} (the
// dose of the ingredient whose name contains "Ingredient", as on the label). An unknown id or
// missing figure fails the build.
function liveProduct(id: string): ProductSummary {
  const p = getProductSummaries().find((x) => x.id === id);
  if (!p) throw new Error(`Blog: no product with id "${id}"`);
  return p;
}
function liveFigure(kind: string, id: string, arg?: string): string {
  const p = liveProduct(id);
  const need = <T,>(v: T | null | undefined): T => { if (v == null) throw new Error(`Blog: ${id} has no ${kind}`); return v; };
  switch (kind) {
    case "score": return String(need(p.pelloScore));
    case "grade": return getFulensScoreLabel(need(p.pelloScore)).label;
    case "pps": return `$${need(p.pricePerServing > 0 ? p.pricePerServing : null).toFixed(2)}`;
    case "pergram": return `$${(p.pricePerServing / need(PRODUCTS.find((x) => x.id === id)?.bicarbPerServingG)).toFixed(2)}`;
    case "rating": return String(need(p.reviewCount > 0 ? p.rating : null));
    case "reviews": return reviewsAt(need(p.reviewCount > 0 ? p.reviewCount : null), p.reviewSource);
    case "price": return formatPrice(need(p.price > 0 ? p.price : null));
    case "servings": return String(servingsPerContainer(p));
    case "carbs": return `${need(p.nutrition.carbsPerServing)}g`;
    case "protein": return `${need(p.nutrition.proteinPerServing)}g`;
    case "sodium": return `${need(p.nutrition.sodiumPerServing).toLocaleString("en-US")}mg`;
    case "caffeine": return `${need(p.nutrition.caffeinePerServing)}mg`;
    case "cpgcarb": return `$${need(costPerGramCarb(p)).toFixed(3)}`;
    case "creatine5g": return `$${((p.pricePerServing / need(creatineGrams(id))) * 5).toFixed(2)}`;
    case "creatineg": return `${need(creatineGrams(id))}g`;
    case "bicarbg": return `${need(PRODUCTS.find((x) => x.id === id)?.bicarbPerServingG)}g`;
    case "bicarbsizes": {
      const g = (PRODUCTS.find((x) => x.id === id)?.variants ?? []).map((v) => v.bicarbPerServingG).filter((x): x is number => x != null);
      const list = need(g.length > 1 ? Array.from(new Set(g)).sort((a, b) => a - b).map((x) => `${x}g`) : null);
      return `${list.slice(0, -1).join(", ")} and ${list.at(-1)}`;
    }
    case "dose": {
      const ing = PRODUCTS.find((x) => x.id === id)?.ingredients.find((i) => arg && i.name.toLowerCase().includes(arg.toLowerCase()));
      return need(ing?.dose);
    }
    case "protein20g": return `$${((p.pricePerServing / need(p.nutrition.proteinPerServing || null)) * 20).toFixed(2)}`;
  }
  throw new Error(`Blog: unknown figure "${kind}"`);
}
// Grams of creatine per serving, from a product's single creatine ingredient ("5g", "5000mg").
function creatineGrams(id: string): number | null {
  const rows = PRODUCTS.find((x) => x.id === id)?.ingredients.filter((i) => /creatine/i.test(i.name)) ?? [];
  const m = rows.length === 1 ? rows[0].dose?.match(/^\s*([\d.]+)\s*(mg|g)\b/i) : null;
  return m ? (m[2].toLowerCase() === "mg" ? Number(m[1]) / 1000 : Number(m[1])) : null;
}

// [[hydration-by-sodium]]: Pello's hydration products grouped by sodium per serving, from live data.
const SODIUM_GROUPS: { label: string; min: number; max: number }[] = [
  { label: "1,000mg or more per serving", min: 1000, max: Infinity },
  { label: "400–999mg per serving", min: 400, max: 999.99 },
  { label: "200–399mg per serving", min: 200, max: 399.99 },
  { label: "Under 200mg per serving", min: 0, max: 199.99 },
];
function HydrationBySodium() {
  const all = getProductSummaries().filter((p) => p.category === "Hydration" && p.nutrition.sodiumPerServing != null && p.nutrition.sodiumPerServing > 0);
  return (
    <div className="my-5 space-y-5">
      {SODIUM_GROUPS.map((g) => {
        const rows = all.filter((p) => p.nutrition.sodiumPerServing! >= g.min && p.nutrition.sodiumPerServing! <= g.max)
          .sort((a, b) => (b.pelloScore ?? 0) - (a.pelloScore ?? 0));
        if (!rows.length) return null;
        return (
          <div key={g.label}>
            <p className="font-semibold text-ink text-sm mb-1.5">{g.label}</p>
            {rows.map((p) => {
              const serving = PRODUCTS.find((x) => x.id === p.id)?.servingSize;
              return (
                <div key={p.id} className="flex items-start gap-2 text-muted mb-1.5">
                  <span className="text-moss flex-shrink-0 mt-1">→</span>
                  <span className="text-sm leading-relaxed">
                    <Link href={`/report/${p.id}`} className="text-moss underline underline-offset-2">{p.brand} {p.name}</Link>
                    {": "}{p.nutrition.sodiumPerServing!.toLocaleString("en-US")}mg sodium{serving ? ` per ${serving.toLowerCase().replace(/^1\s+/, "")}` : ""}
                    {p.pelloScore != null && ` · Pello Score ${p.pelloScore}`}
                    {p.pricePerServing > 0 && ` · $${p.pricePerServing.toFixed(2)} per serving`}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

const withLiveFigures = (text: string) => text.replace(/\{\{(\w+):([a-z0-9-]+)(?::([^}]+))?\}\}/g, (_, kind, id, arg) => liveFigure(kind, id, arg));

// The affiliate disclosure shown with buy links across the site, for articles that show products.
function ArticleDisclosure() {
  return (
    <p className="my-5 text-xs text-muted leading-relaxed">
      {AFFILIATES_ACTIVE ? (
        <>
          {AMAZON_ACTIVE && `${AMAZON_ASSOCIATE_STATEMENT} `}
          Pello may earn a commission on purchases made through some of these links at no extra cost to you.
          This never influences our scores or recommendations.
        </>
      ) : (
        <>Pello doesn&apos;t earn anything from these links. Prices, stock and shipping are set by each retailer.</>
      )}
      <a href="/legal/affiliate-disclosure" className="text-moss underline ml-1">Learn more</a>
    </p>
  );
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = withLiveFigures(lines[i]);

    // [[product:id]]: the product's card (Pello Score, rating, price) from live data.
    const card = line.match(/^\[\[product:([a-z0-9-]+)\]\]$/);
    if (card) {
      elements.push(<div key={i} className="my-5 max-w-sm"><ProductCard product={liveProduct(card[1])} /></div>);
      i++;
      continue;
    }
    // [[products:id|Label;id|Label]]: several product cards in a grid, each with its label as a badge.
    const grid = line.match(/^\[\[products:([^\]]+)\]\]$/);
    if (grid) {
      const items = grid[1].split(";").map((item) => { const [id, badge] = item.split("|"); return { id: id.trim(), badge: badge?.trim() }; });
      elements.push(
        <div key={i} className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 pt-2">
          {items.map(({ id, badge }) => <ProductCard key={id} product={liveProduct(id)} badge={badge} />)}
        </div>
      );
      i++;
      continue;
    }

    // A Markdown table: a header row, a "| --- |" row, then body rows. Scrolls sideways on phones.
    if (line.startsWith("|") && lines[i + 1]?.match(/^\|\s*:?-{3,}/)) {
      const cells = (row: string) => row.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      const head = cells(line);
      const rows: string[][] = [];
      let j = i + 2;
      while (j < lines.length && lines[j].startsWith("|")) rows.push(cells(withLiveFigures(lines[j++])));
      elements.push(
        <div key={i} className="my-5 -mx-6 px-6 sm:mx-0 sm:px-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-sand">
                {head.map((h, k) => <th key={k} scope="col" className="py-2 pr-4 text-xs font-medium text-muted uppercase tracking-wider align-bottom">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, k) => (
                <tr key={k} className="border-b border-sand last:border-0 align-top">
                  {r.map((c, m) => <td key={m} className={`py-2.5 pr-4 leading-relaxed ${m === 0 ? "font-medium text-ink whitespace-nowrap" : "text-muted"}`}>{renderInline(c)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      i = j;
      continue;
    }

    if (line === "[[hydration-by-sodium]]") {
      elements.push(<HydrationBySodium key={i} />);
      i++;
      continue;
    }
    if (line === "[[disclosure]]") {
      elements.push(<ArticleDisclosure key={i} />);
      i++;
      continue;
    }

    // [[pro:/path|Text]]: one understated prompt to a Pello Pro tool (at most one per article).
    const pro = line.match(/^\[\[pro:(\/[^|\]]*)\|([^\]]+)\]\]$/);
    if (pro) {
      elements.push(
        <p key={i} className="my-5 border-l-2 border-moss/40 pl-3 text-sm">
          <Link href={pro[1]} className="text-moss hover:underline">{pro[2]}</Link>
          <span className="text-muted"> · Pello Pro</span>
        </p>
      );
      i++;
      continue;
    }

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

  const author = authorOf(post);
  const reviewer = reviewerOf(post);
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: [shareImage(post)],
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: author ? { "@type": "Person", name: author } : { "@type": "Organization", name: post.author, url: SITE },
    publisher: { "@type": "Organization", name: "Pello Nutrition", url: SITE },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema).replace(/</g, "\\u003c") }} />

      <article className="max-w-2xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <Link href="/blog" className="text-xs text-muted hover:text-ink transition-colors">← Journal</Link>
            <span className="text-xs text-muted border border-sand rounded-full px-2.5 py-0.5">
              {post.category}
            </span>
          </div>
          <h1 className="font-display font-bold text-4xl leading-tight tracking-tight mb-4">{post.title}</h1>
          <p className="text-muted text-lg leading-relaxed mb-4">{post.description}</p>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span>{author ?? post.author}</span>
            <span>·</span>
            {/* Dates are calendar dates (YYYY-MM-DD), so they're formatted in UTC to keep the same day. */}
            <time dateTime={post.date}>{formatDate(post.date)}</time>
            {post.updated && post.updated !== post.date && (
              <>
                <span>·</span>
                <span>Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time></span>
              </>
            )}
            <span>·</span>
            <span>{post.readingTime} min read</span>
          </div>
          {reviewer && <p className="text-xs text-muted mt-1">Reviewed by {reviewer.name}, {reviewer.credential}</p>}
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-sand px-2 py-0.5 rounded-md">{tag}</span>
            ))}
          </div>
        </div>

        {post.draft && (
          <div className="mb-8 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-sm">
            <span className="font-medium">Draft, not published.</span>{" "}
            <span className="text-muted">Only visible in local development. The references still need verifying.</span>
          </div>
        )}

        {post.image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-10 bg-sand/50">
            <Image src={post.image.src} alt={post.image.alt} fill priority sizes="(min-width: 672px) 624px, 100vw" className="object-cover" />
          </div>
        )}

        {/* Content */}
        <div className="mb-16">
          {renderMarkdown(post.content)}
          {post.references && post.references.length > 0 && (
            <section aria-labelledby="references">
              <h2 id="references" className="font-display font-bold text-2xl mt-10 mb-4 text-ink">References</h2>
              {post.draft && <p className="text-xs font-medium text-amber mb-3">DRAFT: verify before publishing.</p>}
              <ol className="list-decimal pl-5 space-y-2 text-xs text-muted leading-relaxed">
                {post.references.map((ref, i) => {
                  const href = referenceHref(ref);
                  return (
                    <li key={i}>
                      {ref.text}
                      {href && <> <a href={href} className="text-moss underline underline-offset-2 break-all">{ref.doi ? `doi:${ref.doi}` : ref.pmid ? `PubMed ${ref.pmid}` : "Source"}</a></>}
                    </li>
                  );
                })}
              </ol>
            </section>
          )}
        </div>

        {/* Related products */}
      {relatedProducts.map(p => p && (
          <Link key={p.id} href={`/report/${p.id}`}>
            <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-sand flex items-center justify-center text-xs flex-shrink-0">
                {p.brand.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="text-xs text-muted mb-0.5">{p.category}</div>
                <div className="font-display font-semibold text-sm group-hover:text-moss transition-colors">{p.name}</div>
                <div className="text-xs text-muted">{p.brand}{p.reviewCount > 0 && ` · ${p.rating}★`}</div>
              </div>
              <div className="text-xs text-moss flex-shrink-0">Full report →</div>
            </div>
          </Link>
        ))}

        {/* CTA */}
        <div className="card bg-moss/5 border-moss/20 text-center py-8 mt-10">
          <h3 className="font-display font-semibold mb-2">Get your personalized nutrition plan</h3>
          <p className="text-xs text-muted mb-4">Tell us about your event and we&apos;ll build a complete pre, during and post protocol</p>
          <Link href="/quiz" className="btn-primary">Build my plan →</Link>
        </div>
      </article>
    </div>
  );
}

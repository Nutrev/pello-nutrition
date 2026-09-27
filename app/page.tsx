import HomeClient from "./HomeClient";
import { getCatalogStats, getProductSummaries } from "@/lib/catalog";
import { byWeightedRating, type ProductSummary } from "@/lib/catalog-types";
import { CATEGORY_GROUPS, OTHER_GROUP, categoryGroup } from "@/lib/category-groups";
import { getAllPosts } from "@/lib/blog";
import type { PickGroup, PostTeaser } from "./HomeSections";

// The two products featured in the head-to-head card, from the Maurten vs SiS post.
const HEAD_TO_HEAD = { post: "maurten-vs-sis-beta-fuel", ids: ["maurten-gel-100", "sis-beta-fuel-gel"] };

export default function HomePage() {
  const products = getProductSummaries();

  // Best product per category, by review-weighted rating. Products without reviews
  // can't be ranked, so they're left out.
  const best = new Map<string, ProductSummary>();
  for (const p of products) {
    if (p.reviewCount === 0) continue;
    const current = best.get(p.category);
    if (!current || p.weightedRating > current.weightedRating) best.set(p.category, p);
  }

  // Top picks, grouped as in the nav: each group lists the best product in each of its
  // categories, best-rated first.
  const groupLabels = [...CATEGORY_GROUPS.map((g) => g.label), OTHER_GROUP];
  const pickGroups: PickGroup[] = groupLabels
    .map((label) => ({
      label,
      short: CATEGORY_GROUPS.find((g) => g.label === label)?.short ?? label,
      products: Array.from(best.values()).filter((p) => categoryGroup(p.category) === label).sort(byWeightedRating),
    }))
    .filter((g) => g.products.length > 0);

  // Hero cards are picked at random in the browser from the best-rated products.
  const featuredPool = [...products].filter((p) => p.reviewCount > 0).sort(byWeightedRating).slice(0, 40);

  const headToHead = HEAD_TO_HEAD.ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is ProductSummary => p != null);
  const showHeadToHead = headToHead.length === 2;

  // The head-to-head card already links to its article, so the blog list skips it.
  const posts: PostTeaser[] = getAllPosts()
    .filter((post) => !(showHeadToHead && post.slug === HEAD_TO_HEAD.post))
    .map(({ slug, title, description, category, readingTime }) => ({ slug, title, description, category, readingTime }));

  const { productCount, reviewTotal } = getCatalogStats();
  return (
    <HomeClient
      pickGroups={pickGroups}
      featuredPool={featuredPool}
      posts={posts}
      headToHead={showHeadToHead ? { post: HEAD_TO_HEAD.post, products: headToHead } : null}
      productCount={productCount}
      reviewTotal={reviewTotal}
    />
  );
}

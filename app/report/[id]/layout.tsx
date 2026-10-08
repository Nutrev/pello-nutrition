import type { Metadata } from "next";
import { getProduct } from "@/lib/catalog";
import { reviewsAt, reviewSourceOf } from "@/lib/catalog-types";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = getProduct(params.id);
  if (!product) return { title: "Product not found" };

  const title = `${product.name} by ${product.brand} Review`;
  const ratingText = product.reviewCount > 0 ? `${product.rating}/5 stars from ${reviewsAt(product.reviewCount, reviewSourceOf(product))}. ` : "";
  const description = `${product.brand} ${product.name} review — ${ratingText}Ingredient analysis, Pello Score™, pros and cons for endurance athletes.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.pellonutrition.com/report/${product.id}`,
      type: "article",
    },
    twitter: { card: "summary", title, description },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
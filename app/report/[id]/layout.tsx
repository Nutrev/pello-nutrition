import type { Metadata } from "next";
import { PRODUCTS } from "@/lib/products";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const product = PRODUCTS.find(p => p.id === params.id);
  if (!product) return { title: "Product not found" };

  const title = `${product.name} by ${product.brand} Review`;
  const description = `${product.brand} ${product.name} review — ${product.rating}/5 stars from ${product.reviewCount.toLocaleString()} reviews. Ingredient analysis, Pello Score™, pros and cons for endurance athletes.`;

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
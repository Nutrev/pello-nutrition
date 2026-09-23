import { MetadataRoute } from "next";
import { PRODUCTS } from "@/lib/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://www.pellonutrition.com";

  // Static pages
  const staticPages = [
    { url: base, priority: 1.0, changeFrequency: "weekly" as const },
    { url: `${base}/products`, priority: 0.9, changeFrequency: "weekly" as const },
    { url: `${base}/quiz`, priority: 0.9, changeFrequency: "monthly" as const },
    { url: `${base}/compare`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/search`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/Explore`, priority: 0.8, changeFrequency: "weekly" as const },
    { url: `${base}/ingredients`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/guides`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/guides/carb-calculator`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/guides/recovery`, priority: 0.7, changeFrequency: "monthly" as const },
    { url: `${base}/methodology`, priority: 0.6, changeFrequency: "monthly" as const },
    { url: `${base}/about`, priority: 0.5, changeFrequency: "monthly" as const },
  ];

  // Category pages
  const categories = Array.from(new Set(PRODUCTS.map(p => p.category)));
  const categoryPages = categories.map(cat => ({
    url: `${base}/products/${encodeURIComponent(cat.toLowerCase().replace(/ /g, "-"))}`,
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  // Product report pages
  const productPages = PRODUCTS.map(p => ({
    url: `${base}/report/${p.id}`,
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
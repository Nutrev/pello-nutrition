// lib/brand-types.ts
// Brand shapes sent to the browser, and the slug helper. Client-safe: holds no data.

export type PricePosition = "budget" | "mid" | "premium";

export interface BrandBadge {
  label: string;
  detail: string;  // what earned it, from Pello's product data
}

export interface Brand {
  slug: string;
  name: string;
  logoDomain: string | null;
  logo: string | null;             // local PNG, when one of its products has one
  founded: number | null;          // from the brand's own site, else null
  hq: string | null;               // from the brand's own site, else null
  description: string;             // built from verified facts and Pello's product data
  philosophy: string | null;       // quoted from the brand's own site
  certifications: string[];        // held by any of its products
  athleteType: string[];           // goals its products are made for, most common first
  pricePosition: PricePosition;    // cost per serving against each product's category
  badges: BrandBadge[];            // earned from product data
  websiteUrl: string | null;
  sources: string[];               // pages the founded / HQ / philosophy facts come from

  // From Pello's product data
  productCount: number;
  categories: string[];            // most products first
  avgPelloScore: number;
  avgTransparency: number | null;  // scored products only
  pricePerServingRange: [number, number];
}

export function brandSlug(name: string): string {
  return name
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export const PRICE_POSITION_LABEL: Record<PricePosition, string> = {
  budget: "Budget", mid: "Mid-range", premium: "Premium",
};

export const PRICE_POSITION_STYLE: Record<PricePosition, string> = {
  budget: "bg-moss/10 text-moss", mid: "bg-sand text-muted", premium: "bg-amber/10 text-amber",
};

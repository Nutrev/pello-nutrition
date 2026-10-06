// lib/retailers.ts
// Where to buy a product, in priority order. Client-safe.
// - The Feed: the exact product page, stored on the product (checked against The Feed's
//   catalog when it was added).
// - Amazon: a search for the brand and product name (not a guessed product page).
// - REI / Running Warehouse: only when a product has a verified link to them.
// - Brand website: only when set on the product (e.g. a brand with its own affiliate
//   program); brand homepages are linked from brand pages instead.
// Affiliate tracking is added only for programs that are switched on (lib/affiliate.ts).
import type { Product } from "./products";
import { withAffiliate } from "./affiliate";

export interface RetailerLink {
  id: "theFeed" | "amazon" | "rei" | "runningWarehouse" | "brandWebsite";
  name: string;
  subtitle: string;
  url: string;
  domain: string;
  tracked: boolean;   // carries affiliate tracking (use rel="sponsored")
}

type LinkSource = Pick<Product, "name" | "brand" | "logoDomain" | "retailerLinks">;

const domainOf = (url: string) => new URL(url).hostname.replace(/^www\./, "");

export function getRetailerLinks(p: LinkSource): RetailerLink[] {
  const links: RetailerLink[] = [];
  const r = p.retailerLinks ?? {};
  const push = (id: RetailerLink["id"], name: string, subtitle: string, raw: string | undefined, programme?: "theFeed" | "amazon" | "rei" | "runningWarehouse") => {
    if (!raw) return;
    const { url, tracked } = programme ? withAffiliate(raw, programme) : { url: raw, tracked: false };
    links.push({ id, name, subtitle, url, domain: domainOf(raw), tracked });
  };

  push("theFeed", "The Feed", "Endurance specialist", r.theFeed, "theFeed");
  push("amazon", "Amazon", "Search results", r.amazon ?? `https://www.amazon.com/s?k=${encodeURIComponent(`${p.brand} ${p.name}`)}`, "amazon");
  push("rei", "REI", "Outdoor retailer", r.rei, "rei");
  push("runningWarehouse", "Running Warehouse", "Running specialist", r.runningWarehouse, "runningWarehouse");
  push("brandWebsite", `${p.brand} official site`, "Brand's own website", r.brandWebsite);
  return links;
}

// The first place to buy, for compact "Buy →" links.
export function primaryRetailerLink(p: LinkSource): RetailerLink | undefined {
  return getRetailerLinks(p)[0];
}

export function linkRel(link: RetailerLink): string {
  return link.tracked ? "noopener noreferrer sponsored" : "noopener noreferrer";
}

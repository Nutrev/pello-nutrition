// lib/affiliate.ts
// Affiliate programmes: each one is off until its real tracking value is set, either
// below or in an environment variable (.env.local and Vercel → Settings → Environment
// Variables, then redeploy). Amazon is on. While a programme is off, its links carry no tracking and the site doesn't
// claim to be part of it. Never put a placeholder here: an unapproved tag may belong to
// someone else, and the disclosures would be untrue.

export interface AffiliateProgramme {
  id: "amazon" | "theFeed" | "rei" | "runningWarehouse";
  name: string;
  active: boolean;
  cookieDuration: string;   // as published by the programme; confirm when you join
}

// Amazon Associates tracking ID (public: it appears in every Amazon link). The
// environment variable can override it.
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_ASSOCIATE_TAG?.trim() || "pellonutritio-20";
// Query string each other programme adds to product links, e.g. "ref=pello".
const THEFEED_PARAM = process.env.NEXT_PUBLIC_THEFEED_AFFILIATE_PARAM?.trim() || null;
const REI_PARAM = process.env.NEXT_PUBLIC_REI_AFFILIATE_PARAM?.trim() || null;
const RW_PARAM = process.env.NEXT_PUBLIC_RUNNINGWAREHOUSE_AFFILIATE_PARAM?.trim() || null;

export const AFFILIATE_PROGRAMMES: AffiliateProgramme[] = [
  { id: "amazon", name: "Amazon Associates", active: !!AMAZON_TAG, cookieDuration: "24 hours" },
  { id: "theFeed", name: "The Feed", active: !!THEFEED_PARAM, cookieDuration: "30 days" },
  { id: "rei", name: "REI", active: !!REI_PARAM, cookieDuration: "7 days" },
  { id: "runningWarehouse", name: "Running Warehouse", active: !!RW_PARAM, cookieDuration: "30 days" },
];

export const ACTIVE_PROGRAMMES = AFFILIATE_PROGRAMMES.filter((p) => p.active);
export const AFFILIATES_ACTIVE = ACTIVE_PROGRAMMES.length > 0;
export const AMAZON_ACTIVE = !!AMAZON_TAG;

// Amazon's required wording, shown only once the Amazon tag is set.
export const AMAZON_ASSOCIATE_STATEMENT = "As an Amazon Associate we earn from qualifying purchases.";

// Adds a programme's tracking to a URL. Returns the URL unchanged when the programme is off.
export function withAffiliate(url: string, programme: AffiliateProgramme["id"]): { url: string; tracked: boolean } {
  const add = (u: string, param: string) => `${u}${u.includes("?") ? "&" : "?"}${param}`;
  switch (programme) {
    case "amazon": return AMAZON_TAG ? { url: add(url, `tag=${encodeURIComponent(AMAZON_TAG)}`), tracked: true } : { url, tracked: false };
    case "theFeed": return THEFEED_PARAM ? { url: add(url, THEFEED_PARAM), tracked: true } : { url, tracked: false };
    case "rei": return REI_PARAM ? { url: add(url, REI_PARAM), tracked: true } : { url, tracked: false };
    case "runningWarehouse": return RW_PARAM ? { url: add(url, RW_PARAM), tracked: true } : { url, tracked: false };
  }
}

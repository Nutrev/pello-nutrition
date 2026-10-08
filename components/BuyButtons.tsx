// "Where to buy" buttons for a product. Links open in a new tab and go straight to the
// retailer (never through Pello's domain); tracked links get rel="sponsored".
import type { Product } from "@/lib/products";
import { getRetailerLinks, linkRel, type RetailerLink } from "@/lib/retailers";
import { AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate";

// Button text for a retailer: "Buy at The Feed", "Buy on Amazon".
export function buyLabel(l: RetailerLink, brand: string): string {
  return l.id === "amazon" ? "Buy on Amazon" : l.id === "brandWebsite" ? `${brand} site` : `Buy at ${l.name}`;
}


export default function BuyButtons({ retailerLinks, productName, brand, logoDomain, layout = "stack" }: {
  retailerLinks: Product["retailerLinks"];
  productName: string;
  brand: string;
  logoDomain?: string;
  // "stack": full-width buttons; "row": side by side from sm up; "inline": a compact
  // wrapping row for the product header (first retailer as the main call to action)
  layout?: "stack" | "row" | "inline";
}) {
  const links = getRetailerLinks({ retailerLinks, name: productName, brand, logoDomain });
  if (links.length === 0) return null;
  const tracked = links.some((l) => l.tracked);
  const amazonTracked = links.some((l) => l.id === "amazon" && l.tracked);

  const disclosure = (
    <p className={`text-xs text-muted leading-relaxed ${layout === "inline" ? "mt-2" : "mt-3"}`}>
      {tracked ? (
        <>
          {amazonTracked && `${AMAZON_ASSOCIATE_STATEMENT} `}
          Pello may earn a commission on purchases made through some of these links at no extra cost to you.
          This never influences our scores or recommendations.
        </>
      ) : (
        <>Pello doesn&apos;t earn anything from these links. Prices, stock and shipping are set by each retailer.</>
      )}
      <a href="/legal/affiliate-disclosure" className="text-moss underline ml-1">Learn more</a>
    </p>
  );

  if (layout === "inline") {
    return (
      <div>
        <div className="text-xs text-muted uppercase tracking-widest mb-2">Where to buy</div>
        <div className="flex flex-wrap gap-2">
          {links.map((l, i) => (
            <a key={l.id} href={l.url} target="_blank" rel={linkRel(l)} title={l.subtitle}
              className={`${i === 0 ? "btn-primary" : "btn-secondary"} inline-flex items-center gap-2 whitespace-nowrap ${i === 0 ? "" : "py-2 px-3.5"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://www.google.com/s2/favicons?domain=${l.domain}&sz=32`} alt="" width={16} height={16}
                className="h-4 w-4 rounded-sm bg-white flex-shrink-0" loading="lazy" />
              {buyLabel(l, brand)}
              <span aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        {disclosure}
      </div>
    );
  }

  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-widest mb-3">Where to buy</div>
      <div className={layout === "row" ? "grid grid-cols-1 sm:grid-cols-3 gap-2" : "space-y-2"}>
        {links.map((l, i) => (
          <a key={l.id} href={l.url} target="_blank" rel={linkRel(l)}
            className={`${i === 0 ? "btn-primary" : "btn-secondary"} w-full flex items-center gap-3 text-left`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://www.google.com/s2/favicons?domain=${l.domain}&sz=32`} alt="" width={16} height={16}
              className="h-4 w-4 rounded-sm bg-white flex-shrink-0" loading="lazy" />
            <span className="flex-1 min-w-0">
              <span className="block text-sm font-medium leading-tight">{l.name}</span>
              <span className={`block text-[11px] leading-tight ${i === 0 ? "text-cream/80" : "text-muted"}`}>{l.subtitle}</span>
            </span>
            <span aria-hidden="true" className="text-sm">↗</span>
          </a>
        ))}
      </div>
      {disclosure}
    </div>
  );
}

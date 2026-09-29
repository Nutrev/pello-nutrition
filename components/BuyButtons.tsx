// "Where to buy" buttons for a product. Links open in a new tab and go straight to the
// retailer (never through Pello's domain); tracked links get rel="sponsored".
import type { Product } from "@/lib/products";
import { getRetailerLinks, linkRel } from "@/lib/retailers";
import { AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate";

export default function BuyButtons({ retailerLinks, productName, brand, logoDomain, layout = "stack" }: {
  retailerLinks: Product["retailerLinks"];
  productName: string;
  brand: string;
  logoDomain?: string;
  layout?: "stack" | "row";   // "row": side by side from sm up
}) {
  const links = getRetailerLinks({ retailerLinks, name: productName, brand, logoDomain });
  if (links.length === 0) return null;
  const tracked = links.some((l) => l.tracked);
  const amazonTracked = links.some((l) => l.id === "amazon" && l.tracked);

  return (
    <div>
      <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Where to buy</div>
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
      <p className="text-xs text-muted mt-3 leading-relaxed">
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
    </div>
  );
}

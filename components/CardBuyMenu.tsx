"use client";

// One "Buy" button on a product card that opens a small menu of retailers. With a single
// retailer it links straight there. Closes on Escape, an outside click or choosing one.
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/products";
import { getRetailerLinks, linkRel } from "@/lib/retailers";
import { AMAZON_ACTIVE } from "@/lib/affiliate";

export default function CardBuyMenu({ product }: { product: Pick<Product, "name" | "brand" | "logoDomain" | "retailerLinks"> }) {
  const links = getRetailerLinks(product);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("click", onClick); document.removeEventListener("keydown", onKey); };
  }, [open]);

  if (links.length === 0) return null;

  if (links.length === 1) {
    const l = links[0];
    return (
      <a href={l.url} target="_blank" rel={linkRel(l)} className="btn-primary text-xs py-2 w-full flex items-center justify-center gap-1.5">
        Buy on {l.name} <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-haspopup="menu"
        className="btn-primary text-xs py-2 w-full flex items-center justify-center gap-1.5">
        Buy
        <svg aria-hidden="true" viewBox="0 0 12 12" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7.5 6 4.5 9 7.5" />
        </svg>
      </button>
      {open && (
        <div role="menu" className="absolute bottom-full left-0 right-0 mb-2 z-20 bg-cream border border-sand rounded-xl shadow-lg p-1.5">
          {links.map((l) => (
            <a key={l.id} role="menuitem" href={l.url} target="_blank" rel={linkRel(l)} onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-sand/60 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://www.google.com/s2/favicons?domain=${l.domain}&sz=32`} alt="" width={16} height={16}
                className="h-4 w-4 rounded-sm bg-white flex-shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-ink leading-tight">{l.name}</span>
                <span className="block text-[11px] text-muted leading-tight">{l.subtitle}</span>
              </span>
              <span aria-hidden="true" className="text-xs text-muted">↗</span>
            </a>
          ))}
          <p className="text-[10px] text-muted leading-snug px-2.5 pt-1.5 pb-1 border-t border-sand mt-1">
            {AMAZON_ACTIVE ? "As an Amazon Associate we earn from qualifying purchases." : "Pello doesn't earn from these links."}
          </p>
        </div>
      )}
    </div>
  );
}

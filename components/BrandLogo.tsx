"use client";

import { useEffect, useState } from "react";

// Brand logos, shown in a fixed-size square tile so every logo lines up regardless of
// its shape. Logos are looked up online by the brand's website domain (`logoDomain`),
// so products don't need a PNG in /public/logo. Sources are tried in order:
//   1. logo.dev — high-quality logos; needs NEXT_PUBLIC_LOGO_DEV_TOKEN (free publishable key)
//   2. the product's local PNG, if it has one
//   3. Google's favicon service — rejected if it only has a tiny icon
//   4. a monogram: the brand's initials on a colour picked from the brand name
// (Clearbit's logo API, used previously, has been shut down.)

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
const MIN_FAVICON_WIDTH = 32;

export type LogoTileSize = "xs" | "sm" | "md" | "lg";

const TILE: Record<LogoTileSize, { box: string; pad: string; text: string; radius: string }> = {
  xs: { box: "h-5 w-5", pad: "p-0.5", text: "text-[8px]", radius: "rounded" },
  sm: { box: "h-7 w-7", pad: "p-1", text: "text-[10px]", radius: "rounded-md" },
  md: { box: "h-10 w-10", pad: "p-1.5", text: "text-xs", radius: "rounded-lg" },
  lg: { box: "h-14 w-14", pad: "p-2", text: "text-base", radius: "rounded-xl" },
};

// Muted tones from the site palette, so monograms sit comfortably next to real logos.
const MONOGRAM_COLOURS = ["#2D4A2D", "#7A9E7A", "#C8860A", "#B84C2E", "#5B6B7A", "#8A6A4F", "#4F6D6A", "#6B5B7A"];

function monogram(brand: string) {
  const words = brand.replace(/[^A-Za-z\u00C0-\u024F0-9\s]/g, "").split(/\s+/).filter(Boolean);
  const initials = (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 1)).toUpperCase();
  let hash = 0;
  for (let i = 0; i < brand.length; i++) hash = (hash * 31 + brand.charCodeAt(i)) >>> 0;
  return { initials, colour: MONOGRAM_COLOURS[hash % MONOGRAM_COLOURS.length] };
}

type Source = { src: string; minWidth?: number };

function logoSources(logoDomain?: string, logo?: string): Source[] {
  const sources: Source[] = [];
  if (logoDomain && LOGO_DEV_TOKEN) {
    sources.push({ src: `https://img.logo.dev/${logoDomain}?token=${LOGO_DEV_TOKEN}&size=128&format=png&fallback=404` });
  }
  if (logo) sources.push({ src: logo });
  if (logoDomain) {
    sources.push({ src: `https://www.google.com/s2/favicons?domain=${logoDomain}&sz=128`, minWidth: MIN_FAVICON_WIDTH });
  }
  return sources;
}

interface BrandLogoProps {
  logoDomain?: string;
  logo?: string;
  brand: string;
  size?: LogoTileSize;
  className?: string;
}

export default function BrandLogo({ logoDomain, logo, brand, size = "md", className }: BrandLogoProps) {
  const sources = logoSources(logoDomain, logo);
  const [index, setIndex] = useState(0);

  // Start over when the component is reused for a different brand.
  useEffect(() => setIndex(0), [logoDomain, logo]);

  const tile = TILE[size];
  const source = sources[index];

  if (!source) {
    const { initials, colour } = monogram(brand);
    return (
      <div
        role="img"
        aria-label={brand}
        className={`${tile.box} ${tile.radius} flex-shrink-0 flex items-center justify-center font-display font-bold text-white ${tile.text} ${className ?? ""}`}
        style={{ backgroundColor: colour }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className={`${tile.box} ${tile.radius} ${tile.pad} flex-shrink-0 flex items-center justify-center bg-white border border-sand overflow-hidden ${className ?? ""}`}>
      <img
        key={source.src}
        src={source.src}
        alt={brand}
        className="max-h-full max-w-full object-contain"
        onLoad={(e) => {
          if (source.minWidth && e.currentTarget.naturalWidth < source.minWidth) setIndex((i) => i + 1);
        }}
        onError={() => setIndex((i) => i + 1)}
      />
    </div>
  );
}

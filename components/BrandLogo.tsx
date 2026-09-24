"use client";

import { useEffect, useState } from "react";

// Brand logos are looked up online by the brand's website domain (`logoDomain`),
// so products don't need a PNG in /public/logo. Sources are tried in order:
//   1. logo.dev — high-quality logos; needs NEXT_PUBLIC_LOGO_DEV_TOKEN (free publishable key)
//   2. the product's local PNG, if it has one
//   3. Google's favicon service — rejected if it only has a tiny icon
//   4. a fallback: the brand's initial (default), the product emoji, or nothing
// (Clearbit's logo API, used previously, has been shut down.)

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
const MIN_FAVICON_WIDTH = 48;

interface BrandLogoProps {
  logoDomain?: string;
  logo?: string;
  brand: string;
  imageEmoji?: string;
  logoSize?: "sm" | "md" | "lg";
  // Height/width classes; overrides logoSize, e.g. "h-5 w-5".
  sizeClass?: string;
  className?: string;
  fallback?: "initial" | "emoji" | "none";
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

export default function BrandLogo({
  logoDomain, logo, brand, imageEmoji, logoSize, sizeClass, className, fallback = "initial",
}: BrandLogoProps) {
  const sources = logoSources(logoDomain, logo);
  const [index, setIndex] = useState(0);

  // Start over when the component is reused for a different brand.
  useEffect(() => setIndex(0), [logoDomain, logo]);

  const size = sizeClass ?? (logoSize === "sm" ? "h-6" : logoSize === "lg" ? "h-12" : "h-8");
  const source = sources[index];

  if (source) {
    return (
      <img
        key={source.src}
        src={source.src}
        alt={brand}
        className={`${size} w-auto object-contain flex-shrink-0 ${className ?? ""}`}
        onLoad={(e) => {
          if (source.minWidth && e.currentTarget.naturalWidth < source.minWidth) setIndex((i) => i + 1);
        }}
        onError={() => setIndex((i) => i + 1)}
      />
    );
  }

  if (fallback === "none") return null;
  if (fallback === "emoji" && imageEmoji) {
    return <div className={`text-2xl leading-none flex-shrink-0 ${className ?? ""}`}>{imageEmoji}</div>;
  }
  return (
    <div className={`${size} aspect-square rounded-full bg-sand flex items-center justify-center flex-shrink-0 ${className ?? ""}`}>
      <span className="text-xs font-mono font-medium text-muted">{brand.charAt(0).toUpperCase()}</span>
    </div>
  );
}

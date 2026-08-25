"use client";

import { useState } from "react";

interface BrandLogoProps {
  logoDomain?: string;
  logo?: string;
  brand: string;
  imageEmoji: string;
  logoSize?: "sm" | "md" | "lg";
  className?: string;
}

export default function BrandLogo({ logoDomain, logo, brand, imageEmoji, logoSize, className }: BrandLogoProps) {
  const [clearbitFailed, setClearbitFailed] = useState(false);
  const [googleFailed, setGoogleFailed] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const sizeClass = logoSize === "sm" ? "h-6" : logoSize === "lg" ? "h-12" : "h-8";
  const finalClass = `${sizeClass} w-auto object-contain ${className ?? ""}`;

  // 1. Try Clearbit first — best quality
  if (logoDomain && !clearbitFailed) {
    return (
      <img
        src={`https://logo.clearbit.com/${logoDomain}`}
        alt={brand}
        className={finalClass}
        onError={() => setClearbitFailed(true)}
      />
    );
  }

  // 2. Fall back to Google Favicons — covers almost everything
  if (logoDomain && !googleFailed) {
    return (
      <img
        src={`https://www.google.com/s2/favicons?domain=${logoDomain}&sz=128`}
        alt={brand}
        className={finalClass}
        onError={() => setGoogleFailed(true)}
      />
    );
  }

  // 3. Try local PNG
  if (logo && !logoFailed) {
    return (
      <img
        src={logo}
        alt={brand}
        className={finalClass}
        onError={() => setLogoFailed(true)}
      />
    );
  }

  // 4. Last resort — brand initial in a circle
  return (
    <div className={`${sizeClass} aspect-square rounded-full bg-sand flex items-center justify-center flex-shrink-0`}>
      <span className="text-xs font-mono font-medium text-muted">
        {brand.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}
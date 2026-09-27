import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getCatalogStats, getProductSummaries } from "@/lib/catalog";
import { byWeightedRating, type ProductSummary } from "@/lib/catalog-types";

// Social preview image (link previews on social media and messaging apps), generated at
// build time. Next adds the og:image tags automatically; X falls back to it too.
// It mirrors the home page hero: cream background, headline, stats and product cards.

export const alt = "Pello Nutrition — find sports nutrition that actually works";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#2D4A2D";
const CREAM = "#F5F0E8";
const INK = "#1A1A1A";
const MUTED = "#8A8478";
const SAND = "#E8E0D0";
const AMBER = "#C8860A";

// DM Sans for the text (the site font) and Montserrat for the logo lettering, matching
// components/Logo.tsx.
async function loadFonts() {
  const font = async (family: "DM Sans" | "Montserrat", weight: 400 | 500 | 600 | 700 | 800, style: "normal" | "italic" = "normal") => {
    const pkg = family === "DM Sans" ? "dm-sans" : "montserrat";
    const dir = join(process.cwd(), `node_modules/@fontsource/${pkg}/files`);
    return { name: family, data: await readFile(join(dir, `${pkg}-latin-${weight}-${style}.woff`)), weight, style };
  };
  return Promise.all([
    font("DM Sans", 400), font("DM Sans", 500), font("DM Sans", 700), font("DM Sans", 800), font("DM Sans", 800, "italic"),
    font("Montserrat", 600), font("Montserrat", 700),
  ]);
}

// Two cards: the best-rated products from different categories, by review-weighted
// rating. Only well-reviewed products qualify, since strangers see this preview.
const MIN_REVIEWS = 100;

function featuredProducts(): ProductSummary[] {
  const picks: ProductSummary[] = [];
  for (const p of [...getProductSummaries()].filter((p) => p.reviewCount >= MIN_REVIEWS).sort(byWeightedRating)) {
    if (!picks.some((q) => q.category === p.category)) picks.push(p);
    if (picks.length === 2) break;
  }
  return picks;
}

// The nav logo from components/Logo.tsx, rebuilt with boxes and text because the image
// renderer can't draw SVG <text>. Same 366×100 proportions, scaled by `s`.
function LogoBadge({ s = 1 }: { s?: number }) {
  return (
    <div style={{ position: "relative", display: "flex", width: 366 * s, height: 100 * s, background: GREEN, borderRadius: 12 * s, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          top: 13 * s,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "baseline",
          color: CREAM,
          fontFamily: "Montserrat",
        }}
      >
        <span style={{ fontSize: 50 * s, fontWeight: 600 }}>PELLO</span>
        <span style={{ fontSize: 21 * s, fontWeight: 700, letterSpacing: 3 * s, marginLeft: 12 * s }}>NUTRITION</span>
      </div>
      <svg width={366 * s} height={100 * s} viewBox="0 0 366 100" style={{ position: "absolute", left: 0, top: 0 }}>
        <path
          d="M3.7 76 C54.9 66 137.3 72 210.5 84 C274.5 94 329.4 88 366 76 L366 88 A12 12 0 0 1 354 100 L292.8 100 C201.3 98 91.5 86 3.7 76 Z"
          fill={CREAM}
        />
      </svg>
    </div>
  );
}

// Five stars, filled to the rounded rating. Drawn as shapes: the fonts have no star glyph.
function Stars({ rating }: { rating: number }) {
  const filled = Math.round(rating);
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={22} height={22} viewBox="0 0 24 24">
          <path
            d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
            fill={i < filled ? AMBER : "none"}
            stroke={AMBER}
            strokeWidth={1.5}
          />
        </svg>
      ))}
    </div>
  );
}

function ProductCard({ product, tilt }: { product: ProductSummary; tilt: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: 360,
        padding: "24px 28px",
        background: "#FBF8F2",
        border: `2px solid ${SAND}`,
        borderRadius: 24,
        boxShadow: "0 6px 18px rgba(26,26,26,0.07)",
        transform: `rotate(${tilt}deg)`,
      }}
    >
      <div style={{ fontSize: 22, color: MUTED }}>{product.brand}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: INK, lineHeight: 1.15, marginTop: 4, marginBottom: 18 }}>{product.name}</div>
      {/* The category tag drops below the stars when a long name doesn't fit beside them. */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Stars rating={product.rating} />
          <span style={{ fontSize: 22, color: MUTED }}>{product.rating}</span>
        </div>
        <div style={{ display: "flex", fontSize: 20, color: GREEN, background: "rgba(45,74,45,0.1)", padding: "5px 14px", borderRadius: 10, whiteSpace: "nowrap" }}>
          {product.category}
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <span style={{ fontSize: 44, fontWeight: 700, color: INK, lineHeight: 1.1 }}>{value}</span>
      <span style={{ fontSize: 22, color: MUTED }}>{label}</span>
    </div>
  );
}

export default async function OpengraphImage() {
  const { productCount, reviewTotal } = getCatalogStats();
  const [first, second] = featuredProducts();

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: CREAM, padding: 64, fontFamily: "DM Sans" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", flex: 1 }}>
          <LogoBadge s={0.8} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 68, fontWeight: 800, color: INK, lineHeight: 1.02, letterSpacing: -2 }}>
              <span>Find nutrition</span>
              <span style={{ color: GREEN, fontStyle: "italic" }}>that actually works</span>
            </div>
            <div style={{ fontSize: 26, color: MUTED, marginTop: 18, maxWidth: 600, lineHeight: 1.4 }}>
              Real reviews, verified labels and the science behind every ingredient.
            </div>
          </div>
          <div style={{ display: "flex", gap: 56 }}>
            <Stat value={reviewTotal.toLocaleString("en-US")} label="customer reviews" />
            <Stat value={String(productCount)} label="products tracked" />
            <Stat value="100%" label="independent" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 30, paddingLeft: 16 }}>
          {first && <ProductCard product={first} tilt={-1.5} />}
          {second && <ProductCard product={second} tilt={1.5} />}
        </div>
      </div>
    ),
    { ...size, fonts: await loadFonts() }
  );
}

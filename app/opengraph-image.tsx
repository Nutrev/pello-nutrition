import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Social preview image (link previews on social media and messaging apps), generated at
// build time. Next adds the og:image tags automatically; X falls back to it too.

export const alt = "Pello Nutrition — sports nutrition, verified";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GREEN = "#2D4A2D";
const CREAM = "#F5F0E8";

// DM Sans for the text (the site font) and Montserrat for the logo lettering, matching
// components/Logo.tsx.
async function loadFonts() {
  const font = async (family: "DM Sans" | "Montserrat", weight: 400 | 500 | 600 | 700 | 800) => {
    const pkg = family === "DM Sans" ? "dm-sans" : "montserrat";
    const dir = join(process.cwd(), `node_modules/@fontsource/${pkg}/files`);
    return { name: family, data: await readFile(join(dir, `${pkg}-latin-${weight}-normal.woff`)), weight, style: "normal" as const };
  };
  return Promise.all([
    font("DM Sans", 400), font("DM Sans", 500), font("DM Sans", 800),
    font("Montserrat", 600), font("Montserrat", 700),
  ]);
}

// The nav logo from components/Logo.tsx, rebuilt with boxes and text because the image
// renderer can't draw SVG <text>. Same 366×100 proportions, scaled by `s`. It's outlined
// so the green badge stays visible on the green background.
function LogoBadge({ s = 1 }: { s?: number }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: 366 * s,
        height: 100 * s,
        background: GREEN,
        borderRadius: 12 * s,
        overflow: "hidden",
        boxShadow: `0 0 0 ${2 * s}px rgba(245,240,232,0.35)`,
      }}
    >
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

function Chip({ children }: { children: string }) {
  return (
    <div
      style={{
        display: "flex",
        fontSize: 24,
        fontWeight: 500,
        padding: "10px 20px",
        borderRadius: 999,
        color: CREAM,
        background: "rgba(245,240,232,0.12)",
        border: "1px solid rgba(245,240,232,0.25)",
      }}
    >
      {children}
    </div>
  );
}

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: GREEN,
          padding: 72,
          fontFamily: "DM Sans",
        }}
      >
        <LogoBadge s={0.9} />
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 84, fontWeight: 800, color: CREAM, lineHeight: 1.02, letterSpacing: -2 }}>
            <span>Sports nutrition,</span>
            <span>verified.</span>
          </div>
          <div style={{ fontSize: 30, color: "rgba(245,240,232,0.75)", maxWidth: 900, lineHeight: 1.35 }}>
            Real labels, real ratings and the evidence behind every ingredient.
          </div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          <Chip>240+ products</Chip>
          <Chip>Label-verified data</Chip>
          <Chip>Pello Score™</Chip>
        </div>
      </div>
    ),
    { ...size, fonts: await loadFonts() }
  );
}

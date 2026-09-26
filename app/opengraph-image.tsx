import { ImageResponse } from "next/og";

// Placeholder social preview image (link previews on social media and messaging apps),
// generated at build time. Next adds the og:image tags automatically; X falls back to it too.
// Replace with a designed 1200×630 image when one exists.

export const alt = "Pello Nutrition — sports nutrition research for endurance athletes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const CREAM = "#F5F0E8";
const MOSS = "#2D4A2D";
const SAGE = "#7A9E7A";
const MUTED = "#8A8478";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: CREAM,
          padding: "72px 80px 0",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 18, color: MOSS }}>
          <span style={{ fontSize: 56, fontWeight: 300, letterSpacing: 2 }}>PELLO</span>
          <span style={{ fontSize: 30, letterSpacing: 4 }}>NUTRITION</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 150 }}>
          <div style={{ fontSize: 68, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.1, maxWidth: 900 }}>
            Sports nutrition research for endurance athletes
          </div>
          <div style={{ fontSize: 30, color: MUTED }}>
            240+ products · real label data · evidence-rated ingredients
          </div>
        </div>

        {/* The wave from the Pello logo, across the bottom */}
        <svg
          width="1200"
          height="130"
          viewBox="0 0 1200 130"
          style={{ position: "absolute", left: 0, bottom: 0 }}
        >
          <path d="M0 40 C250 0 520 90 800 40 C990 8 1110 60 1200 34 L1200 130 L0 130 Z" fill={SAGE} />
        </svg>
        <div style={{ position: "absolute", right: 80, bottom: 40, fontSize: 26, color: CREAM, display: "flex" }}>
          pellonutrition.com
        </div>
      </div>
    ),
    size
  );
}

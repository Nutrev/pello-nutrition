// The Pello icon mark for browser tabs, bookmarks and home screens: a cream "P" in Montserrat on
// the logo's green rounded square, with the logo's cream band sweeping off the bottom-right corner
// (see components/Logo.tsx). Drawn at build time by app/icon.tsx and app/apple-icon.tsx.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const GREEN = "#2D4A2D";
const CREAM = "#F5F0E8";

export async function iconMark(size: number, rounded: boolean) {
  const font = await readFile(join(process.cwd(), "node_modules/@fontsource/montserrat/files/montserrat-latin-700-normal.woff"));
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
        background: GREEN, borderRadius: rounded ? size * 0.22 : 0, overflow: "hidden" }}>
        <div style={{ display: "flex", color: CREAM, fontFamily: "Montserrat", fontWeight: 700, fontSize: size * 0.68, lineHeight: 1, marginTop: -size * 0.1 }}>P</div>
        <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M0 78 C22 70 50 74 72 82 C84 86 94 85 100 80 L100 100 L60 100 C40 96 18 88 0 84 Z" fill={CREAM} />
        </svg>
      </div>
    ),
    { width: size, height: size, fonts: [{ name: "Montserrat", data: font, weight: 700, style: "normal" }] },
  );
}

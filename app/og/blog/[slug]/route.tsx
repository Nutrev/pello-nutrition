// Share image for a blog article (Open Graph and X): the title in cream on moss, with the Pello
// wordmark. Generated at build time for every article. An article's `ogImage` overrides it.
import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getAllPosts, getPostBySlug } from "@/lib/blog";

export const dynamic = "force-static";
export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

const MOSS = "#2D4A2D";
const CREAM = "#F5F0E8";

async function loadFonts() {
  const font = async (family: "DM Sans" | "Montserrat", pkg: string, weight: 500 | 700) =>
    ({ name: family, data: await readFile(join(process.cwd(), `node_modules/@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff`)), weight, style: "normal" as const });
  return Promise.all([font("DM Sans", "dm-sans", 500), font("DM Sans", "dm-sans", 700), font("Montserrat", "montserrat", 700)]);
}

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return new Response("Not found", { status: 404 });
  const size = post.title.length > 70 ? 56 : post.title.length > 45 ? 64 : 72;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: MOSS, padding: "72px 80px", fontFamily: "DM Sans" }}>
        <div style={{ display: "flex", color: CREAM, opacity: 0.75, fontSize: 26, fontWeight: 500, letterSpacing: 2, textTransform: "uppercase" }}>{post.category}</div>
        <div style={{ display: "flex", color: CREAM, fontSize: size, fontWeight: 700, lineHeight: 1.12, letterSpacing: -1 }}>{post.title}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, color: CREAM }}>
          <span style={{ fontFamily: "Montserrat", fontWeight: 700, fontSize: 30, letterSpacing: 3 }}>PELLO</span>
          <span style={{ fontSize: 24, opacity: 0.75 }}>pellonutrition.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: await loadFonts() },
  );
}

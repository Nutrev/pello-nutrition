import Image from "next/image";

// A post's cover: its photo when it has one, otherwise a quiet drawing for its category
// (two boxes for comparisons, ranked bars for reviews, a data line for science, the logo
// wave for everything else). Fills its parent, which sets the size.
export default function BlogCover({ slug, category, image, packshots, featured = false }: {
  slug: string;
  category: string;
  image?: { src: string; alt: string };
  packshots?: { src: string; alt: string }[];
  featured?: boolean;
}) {
  if (image) {
    return <Image src={image.src} alt={image.alt} fill sizes={featured ? "(min-width: 768px) 560px, 100vw" : "(min-width: 640px) 480px, 100vw"} className="object-cover" />;
  }

  // Pack shots stand side by side (with "vs" between two of them). Multiply blends any
  // white photo background into the sand.
  if (packshots?.length) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center ${featured ? "gap-8 py-8" : "gap-5 py-3"}`}>
        {packshots.map((shot, i) => (
          <div key={shot.src} className="contents">
            {i > 0 && packshots.length === 2 && <span aria-hidden="true" className="text-xs font-semibold text-moss/60 tracking-widest">VS</span>}
            <div className={`relative h-full ${featured ? "w-28 md:w-32" : "w-14"}`}>
              <Image src={shot.src} alt={shot.alt} fill sizes={featured ? "128px" : "56px"} className="object-contain mix-blend-multiply" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (featured) {
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
        <path d="M0 210 C70 190 160 200 240 222 C300 238 360 230 400 214 L400 300 L0 300 Z" fill="#F5F0E8" opacity=".10" />
        <path d="M0 240 C80 222 170 232 250 252 C310 266 365 258 400 246 L400 300 L0 300 Z" fill="#F5F0E8" opacity=".14" />
      </svg>
    );
  }

  if (category === "Comparisons") {
    return (
      <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center gap-4">
        <span className="w-14 h-16 rounded-lg border border-moss/25 bg-white/50" />
        <span className="text-xs font-semibold text-moss/60 tracking-widest">VS</span>
        <span className="w-14 h-16 rounded-lg border border-moss/25 bg-white/50" />
      </div>
    );
  }

  if (category === "Reviews") {
    return (
      <div aria-hidden="true" className="absolute inset-0 flex items-end justify-center gap-2 pb-6">
        <span className="w-6 h-14 rounded-md bg-moss/70" />
        <span className="w-6 h-10 rounded-md bg-moss/40" />
        <span className="w-6 h-8 rounded-md bg-moss/25" />
        <span className="w-6 h-6 rounded-md bg-moss/15" />
      </div>
    );
  }

  if (category === "Science") {
    // Each post gets its own line, picked from its slug, so two Science cards never match.
    const seed = Array.from(slug).reduce((n, c) => (n * 31 + c.charCodeAt(0)) >>> 0, 7);
    const points = [60, 90, 120, 150, 180, 210, 240].map((x, i) => [x, 30 + ((seed >>> (i * 3)) % 8) * 5]);
    return (
      <svg aria-hidden="true" className="absolute inset-0 w-full h-full" viewBox="0 0 300 112" preserveAspectRatio="xMidYMid slice">
        <path d={"M" + points.map(([x, y]) => `${x} ${y}`).join(" L")} stroke="#2D4A2D" strokeOpacity=".3" strokeWidth="1.5" fill="none" />
        <g fill="#2D4A2D" opacity=".22">
          {points.map(([x, y]) => <circle key={x} cx={x} cy={y} r="5" />)}
        </g>
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" className="absolute inset-0 w-full h-full" viewBox="0 0 300 112" preserveAspectRatio="none">
      <path d="M0 70 C50 60 110 64 170 76 C220 86 265 82 300 72 L300 112 L0 112 Z" fill="#2D4A2D" opacity=".10" />
      <path d="M0 86 C55 76 120 80 180 92 C230 101 270 97 300 88 L300 112 L0 112 Z" fill="#2D4A2D" opacity=".14" />
    </svg>
  );
}

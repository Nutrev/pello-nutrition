import type { Metadata } from "next";
import Link from "next/link";
import { CERT_GUIDES, standardCounts, dietCounts } from "@/lib/certification-guides";
import { QUALITY_STANDARDS } from "@/lib/quality-standards";

export const metadata: Metadata = {
  title: "Certification guides: what supplement certifications mean",
  description: "Plain-English guides to NSF Certified for Sport, Informed Sport, the Cologne List, USDA Organic, Non-GMO Project, Certified Vegan and gluten-free, and how to check them.",
  alternates: { canonical: "https://www.pellonutrition.com/guides/certifications" },
};

export default function CertificationsHub() {
  const c = standardCounts();
  const d = dietCounts();
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <nav className="text-xs text-muted mb-4"><Link href="/guides" className="hover:text-ink">Guides</Link></nav>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-4">Certification guides</h1>
      <p className="text-muted text-lg leading-relaxed mb-10">
        What the seals on sports nutrition products actually mean, what they don&apos;t, and how to check them yourself.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {CERT_GUIDES.map((g) => (
          <Link key={g.slug} href={`/guides/certifications/${g.slug}`} className="card hover:shadow-md hover:-translate-y-0.5 transition-all">
            <div className="font-display font-semibold mb-1">{g.title} →</div>
            <p className="text-sm text-muted leading-relaxed">{g.desc}</p>
          </Link>
        ))}
      </div>

      <section className="mb-12">
        <h2 className="font-display font-semibold text-xl mb-1">The standards Pello tracks</h2>
        <p className="text-sm text-muted mb-4">
          Every product page has a Quality standards section, and you can filter by them in{" "}
          <Link href="/query" className="text-moss underline">Explore</Link> and the{" "}
          <Link href="/quiz" className="text-moss underline">planner</Link>.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-sand rounded-xl overflow-hidden">
            <thead className="bg-sand/40 text-xs text-ink">
              <tr><th className="text-left p-3">Standard</th><th className="text-left p-3">What it means</th><th className="text-right p-3">On Pello</th></tr>
            </thead>
            <tbody className="divide-y divide-sand">
              {QUALITY_STANDARDS.map((s) => (
                <tr key={s.id} className="align-top">
                  <td className="p-3">
                    <Link href={`/guides/certifications/${s.guide}#${s.id}`} className="font-medium text-ink hover:text-moss">{s.name}</Link>
                    <div className="text-[11px] text-muted">{s.group === "sport" ? "Sport testing" : "Food & sourcing"}</div>
                  </td>
                  <td className="p-3 text-xs text-muted leading-relaxed">{s.what}</td>
                  <td className="p-3 text-right whitespace-nowrap">{c[s.id]} products</td>
                </tr>
              ))}
              <tr className="align-top">
                <td className="p-3"><Link href="/guides/certifications/diet" className="font-medium text-ink hover:text-moss">Vegan · gluten-free</Link><div className="text-[11px] text-muted">Label claims</div></td>
                <td className="p-3 text-xs text-muted leading-relaxed">The brand&apos;s or retailer&apos;s own claim, shown as a claim and never guessed from the ingredients.</td>
                <td className="p-3 text-right whitespace-nowrap text-xs">{d.vegan} vegan<br />{d.glutenFree} gluten-free</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          {c["sport-tested"]} of {c.total} products are third-party tested for banned substances.
        </p>
      </section>
    </div>
  );
}

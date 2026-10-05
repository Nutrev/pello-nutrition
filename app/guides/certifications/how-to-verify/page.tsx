import type { Metadata } from "next";
import GuideShell, { Section, Facts, OnPello } from "@/components/guides/GuideShell";
import { SOURCES } from "@/lib/certification-guides";
import { NSF_SPORT_LISTINGS } from "@/lib/certification-checks";

export const metadata: Metadata = {
  title: "How to verify a supplement certification",
  description: "A step-by-step way to check a supplement's certification in the certifier's own database, and the red flags that a 'tested' claim may not mean much.",
  alternates: { canonical: "https://www.pellonutrition.com/guides/certifications/how-to-verify" },
};

const DATABASES = [
  { name: "NSF Certified for Sport", url: "https://www.nsfsport.com/certified-products/", how: "Search by name, keyword or lot number, or scan the barcode in the Certified for Sport® app." },
  { name: "Informed Sport", url: SOURCES.informedSearch.url, how: "Search the certified product list." },
  { name: "BSCG", url: "https://www.bscg.org/", how: "Search certified products by lot number, product, brand or category." },
  { name: "Cologne List", url: "https://www.koelnerliste.com/en/", how: "Browse the listed products, or use the Cologne List app." },
  { name: "USDA Organic", url: SOURCES.usdaIntegrity.url, how: "Search for the company; the database lists certified operations rather than products." },
  { name: "Non-GMO Project Verified", url: SOURCES.nonGmoFinder.url, how: "Search the Product Finder by keyword." },
  { name: "GFCO (gluten-free)", url: "https://gfco.org/", how: "Use “Find a certified product”." },
];

export default function HowToVerifyGuide() {
  return (
    <GuideShell
      slug="how-to-verify"
      title="How to verify a certification"
      intro={<>A logo on a website isn&apos;t proof. Each certifier keeps its own public list of certified products, and that list is the only place a certification can really be checked.</>}
      sources={[SOURCES.nsfProgram, SOURCES.nsfSport, SOURCES.bscg, SOURCES.cologneFaq, SOURCES.nonGmoFinder, SOURCES.usdaIntegrity]}
    >
      <Section title="Step by step">
        <ol className="space-y-3 list-decimal pl-5">
          <li><strong className="text-ink">Find the mark on the package itself</strong>, not just on a product page or ad. The Non-GMO Project, for example, notes that products from unverified lots can stay on shelves.</li>
          <li><strong className="text-ink">Search the certifier&apos;s own database</strong> (links below), not the brand&apos;s site.</li>
          <li><strong className="text-ink">Match the exact product.</strong> Listings are often per flavour, size or country. NSF, for example, lists some products separately for the US and Canada.</li>
          <li><strong className="text-ink">Check the lot or batch</strong> where the programme lists them. NSF and BSCG both let you search by lot number.</li>
          <li><strong className="text-ink">If you&apos;re drug tested, check your sport&apos;s rules too.</strong> NSF notes that some organisations prohibit hemp or CBD products, whatever their certification.</li>
        </ol>
      </Section>

      <Section title="Where to check">
        <div className="space-y-2">
          {DATABASES.map((d) => (
            <div key={d.name} className="card py-3">
              <a href={d.url} target="_blank" rel="noopener noreferrer" className="font-medium text-sm text-moss hover:underline">{d.name} ↗</a>
              <p className="text-xs text-muted mt-0.5">{d.how}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Red flags">
        <Facts items={[
          <><strong className="text-ink">&ldquo;Third-party tested&rdquo; or &ldquo;lab tested&rdquo; with no named programme.</strong> Tested by whom, for what, and how often? Without a named certifier there&apos;s nothing to look up.</>,
          <><strong className="text-ink">&ldquo;Doping-free&rdquo; or &ldquo;banned-substance free&rdquo; promises.</strong> The Cologne List makes listed companies agree not to advertise &ldquo;doping-free&rdquo;, because no laboratory can test for every banned substance.</>,
          <><strong className="text-ink">A seal you can&apos;t find in the certifier&apos;s database.</strong> Certifications lapse, and products change.</>,
          <><strong className="text-ink">Sourcing seals presented as safety testing.</strong> Organic and Non-GMO marks are about ingredients, not banned substances.</>,
        ]} />
      </Section>

      <Section title="How Pello checks">
        <OnPello>
          Certifications on Pello come from each product&apos;s listing at The Feed. We also looked up every NSF Certified for Sport product
          in NSF&apos;s own database: {Object.keys(NSF_SPORT_LISTINGS).length} are confirmed, and their pages link straight to the NSF listing. Products we
          couldn&apos;t find there aren&apos;t shown as NSF certified. Other certifications show as &ldquo;Listed by The Feed&rdquo;, with a link to
          check them in the certifier&apos;s database.
        </OnPello>
      </Section>
    </GuideShell>
  );
}

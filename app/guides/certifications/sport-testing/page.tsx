import type { Metadata } from "next";
import Link from "next/link";
import GuideShell, { Section, Facts, OnPello } from "@/components/guides/GuideShell";
import { SOURCES, standardCounts } from "@/lib/certification-guides";
import { NSF_SPORT_LISTINGS, NSF_NOT_FOUND } from "@/lib/certification-checks";

export const metadata: Metadata = {
  title: "Sport testing certifications: NSF, Informed Sport, BSCG, Cologne List",
  description: "What NSF Certified for Sport, Informed Sport, Informed Choice, BSCG and the Cologne List test for, how often, and what none of them can promise.",
  alternates: { canonical: "https://www.pellonutrition.com/guides/certifications/sport-testing" },
};

export default function SportTestingGuide() {
  const c = standardCounts();
  const verified = Object.keys(NSF_SPORT_LISTINGS).length;
  return (
    <GuideShell
      slug="sport-testing"
      title="Sport testing certifications"
      intro={<>If you&apos;re drug tested, a contaminated supplement can cost you a positive test. These programmes test products for substances banned in sport. They differ in how often they test and what they check.</>}
      sources={[SOURCES.fdaSupplements, SOURCES.nsfProgram, SOURCES.nsfSport, SOURCES.informed, SOURCES.bscg, SOURCES.cologneBackground, SOURCES.cologneFaq]}
    >
      <Section title="Why it matters">
        <p>
          In the US, the FDA states that it &ldquo;does not have the authority to approve dietary supplements before they are marketed&rdquo;.
          Nobody checks a supplement for banned substances before it goes on sale unless the brand pays an independent programme to.
          Contamination can come from raw materials or shared manufacturing lines, not only from deliberate adulteration.
        </p>
      </Section>

      <Section id="nsf-sport" title="NSF Certified for Sport">
        <p>Run by NSF. NSF describes the programme as covering:</p>
        <Facts items={[
          "Product testing for banned substances. NSF tests for 290 stimulants, narcotics, steroids, diuretics, beta-2-agonists, masking agents and other substances.",
          "A review of the formula and the label.",
          "Inspections of production facilities and suppliers, including unannounced plant inspections.",
          "Ongoing monitoring of certified products.",
        ]} />
        <p>
          It&apos;s recognised by the United States Anti-Doping Agency (USADA), Major League Baseball, the National Hockey League and the
          Canadian Football League, and recommended by the NFL, PGA, LPGA and other sports bodies.
        </p>
        <p>
          <strong className="text-ink">How to check:</strong> search NSF&apos;s{" "}
          <a href="https://www.nsfsport.com/certified-products/" target="_blank" rel="noopener noreferrer" className="text-moss underline">certified products database</a>{" "}
          by name, keyword or lot number, or use the Certified for Sport® app, which can scan a barcode.
        </p>
        <OnPello>
          {c["nsf-sport"]} products on Pello are NSF Certified for Sport. We checked every one against NSF&apos;s database ({verified} matched), and each
          product page links to its NSF listing. {NSF_NOT_FOUND.length} products listed elsewhere as NSF certified weren&apos;t in NSF&apos;s
          database, so we don&apos;t show them as certified.
        </OnPello>
      </Section>

      <Section id="informed-sport" title="Informed Sport and Informed Choice">
        <p>Both are run by LGC under the INFORMED name.</p>
        <Facts items={[
          <><strong className="text-ink">Informed Sport</strong> tests every finished batch of a product before it&apos;s released to market, screening for over 300 compounds. LGC describes it as the only global certification programme that tests every batch before release.</>,
          <><strong className="text-ink">Informed Choice</strong> is a monthly retail-monitoring programme: products are sampled and tested for banned substances, alongside third-party oversight of manufacturing facilities. It doesn&apos;t test every batch.</>,
        ]} />
        <p>
          <strong className="text-ink">How to check:</strong> search the{" "}
          <a href={SOURCES.informedSearch.url} target="_blank" rel="noopener noreferrer" className="text-moss underline">Informed Sport product search</a>.
        </p>
        <OnPello>
          {c["informed-sport"]} products on Pello list Informed Sport. Informed Sport&apos;s search blocks automated checks, so these are shown as
          &ldquo;Listed by The Feed&rdquo; with a link to check them yourself.
        </OnPello>
      </Section>

      <Section id="bscg" title="BSCG (Banned Substances Control Group)">
        <Facts items={[
          <><strong className="text-ink">BSCG Certified Drug Free</strong> tests every finished product lot for 450+ banned substances, plus annual label-claim and contaminant testing and an initial quality-control and GMP audit.</>,
          <><strong className="text-ink">BSCG Certified Quality</strong> is an annual testing programme for label claims, heavy metals, pesticides, microbes and banned substances. BSCG says it&apos;s &ldquo;not designed for anti-doping protection&rdquo;.</>,
        ]} />
        <p><strong className="text-ink">How to check:</strong> BSCG&apos;s site lets you search certified products by lot number, product, brand or category.</p>
        <OnPello>No products on Pello currently list a BSCG certification.</OnPello>
      </Section>

      <Section id="cologne-list" title="Cologne List">
        <p>A German doping-prevention initiative, part of the national prevention network started by Germany&apos;s anti-doping agency (NADA). To be listed:</p>
        <Facts items={[
          "The original packaging passes a label check.",
          "The product passes a laboratory analysis for anabolic steroids and stimulants at the German Sport University Cologne's Center for Preventive Doping Research, at least once a year.",
          "The company discloses its contamination risks and agrees not to use misleading advertising such as “doping-free”.",
        ]} />
        <p>
          The Cologne List itself says a listing doesn&apos;t mean a product is free of doping substances, only that it has been
          independently controlled and the risk is &ldquo;significantly minimized&rdquo;. Testing is at least yearly, not every batch.
        </p>
        <OnPello>{c["cologne-list"]} products on Pello list the Cologne List.</OnPello>
      </Section>

      <Section title="At a glance">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border border-sand rounded-xl overflow-hidden">
            <thead className="bg-sand/40 text-ink">
              <tr><th className="text-left p-2.5">Programme</th><th className="text-left p-2.5">How often products are tested</th><th className="text-left p-2.5">Banned substances screened</th></tr>
            </thead>
            <tbody className="divide-y divide-sand">
              <tr><td className="p-2.5 text-ink">NSF Certified for Sport</td><td className="p-2.5">Ongoing monitoring; facilities inspected</td><td className="p-2.5">290</td></tr>
              <tr><td className="p-2.5 text-ink">Informed Sport</td><td className="p-2.5">Every batch, before release</td><td className="p-2.5">Over 300 compounds</td></tr>
              <tr><td className="p-2.5 text-ink">Informed Choice</td><td className="p-2.5">Monthly retail sampling</td><td className="p-2.5">Banned substances</td></tr>
              <tr><td className="p-2.5 text-ink">BSCG Certified Drug Free</td><td className="p-2.5">Every finished lot</td><td className="p-2.5">450+</td></tr>
              <tr><td className="p-2.5 text-ink">Cologne List</td><td className="p-2.5">At least once a year</td><td className="p-2.5">Focus on steroids and stimulants</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="What none of them can promise">
        <p>
          No programme can guarantee a product is free of every banned substance. NSF describes its programme as helping to
          &ldquo;minimize the risk&rdquo;, and the Cologne List says no laboratory can test for every substance on the World Anti-Doping
          Agency list. Certification lowers the risk a lot, but it doesn&apos;t remove it.
        </p>
        <p>
          If you&apos;re drug tested, check the exact product (and lot, where the programme lists lots) in the certifier&apos;s database,
          and follow your sport&apos;s own rules. Some organisations, for example, prohibit hemp or CBD products.{" "}
          <Link href="/guides/certifications/how-to-verify" className="text-moss underline">How to verify a certification →</Link>
        </p>
      </Section>
    </GuideShell>
  );
}

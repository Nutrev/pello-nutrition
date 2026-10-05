import type { Metadata } from "next";
import GuideShell, { Section, Facts, OnPello } from "@/components/guides/GuideShell";
import { SOURCES, standardCounts } from "@/lib/certification-guides";

export const metadata: Metadata = {
  title: "USDA Organic and Non-GMO Project Verified, explained",
  description: "What the USDA Organic seal and the Non-GMO Project butterfly mean on sports nutrition products, what they don't cover, and how to check them.",
  alternates: { canonical: "https://www.pellonutrition.com/guides/certifications/food-and-sourcing" },
};

export default function FoodAndSourcingGuide() {
  const c = standardCounts();
  return (
    <GuideShell
      slug="food-and-sourcing"
      title="Food & sourcing certifications"
      intro={<>USDA Organic and Non-GMO Project Verified are about how ingredients are grown and sourced. Neither one tests for substances banned in sport, so if you&apos;re drug tested, look for a <a href="/guides/certifications/sport-testing" className="text-moss underline">sport-testing certification</a> as well.</>}
      sources={[SOURCES.usdaLabeling, SOURCES.usdaIntegrity, SOURCES.nonGmoLabel, SOURCES.nonGmoVerify, SOURCES.nonGmoFinder]}
    >
      <Section id="usda-organic" title="USDA Organic">
        <p>
          Run by the USDA&apos;s National Organic Program. Organic products must be overseen by a USDA-authorised certifying agent
          and produced without excluded methods, such as genetic engineering, ionising radiation or sewage sludge. Organic labels
          must be reviewed and approved by an accredited certifying agent before they&apos;re used.
        </p>
        <p>What the wording on the label means:</p>
        <Facts items={[
          <><strong className="text-ink">&ldquo;100 percent organic&rdquo;</strong>: all ingredients are organic (excluding salt and water). May use the USDA Organic seal.</>,
          <><strong className="text-ink">&ldquo;Organic&rdquo;</strong>: at least 95% organic ingredients (excluding salt and water). May use the seal.</>,
          <><strong className="text-ink">&ldquo;Made with organic&nbsp;…&rdquo;</strong>: at least 70% organic ingredients. Can&apos;t use the seal.</>,
          <><strong className="text-ink">Organic ingredients in the list only</strong>: under 70% organic. Can name organic ingredients in the ingredient list, but can&apos;t use the seal or say &ldquo;organic&rdquo; on the front.</>,
        ]} />
        <p>
          <strong className="text-ink">How to check:</strong> the{" "}
          <a href={SOURCES.usdaIntegrity.url} target="_blank" rel="noopener noreferrer" className="text-moss underline">Organic Integrity Database</a>{" "}
          lists certified farms and businesses, not individual products. Search for the company and check its certified products.
        </p>
        <OnPello>{c["usda-organic"]} products on Pello list USDA Organic, as shown on their listing at The Feed.</OnPello>
      </Section>

      <Section id="non-gmo-project" title="Non-GMO Project Verified">
        <p>
          The Non-GMO Project is a nonprofit. Products carrying its butterfly mark have been evaluated by an independent
          technical administrator against the Non-GMO Project Standard for GMO avoidance. Verification is reviewed and
          renewed every year.
        </p>
        <Facts items={[
          <>It&apos;s <strong className="text-ink">not a &ldquo;GMO-free&rdquo; claim</strong>. The Project says GMO-free claims aren&apos;t legally or scientifically defensible because of the limits of testing and the risk of contamination in seeds and supply chains.</>,
          "Its product finder notes that products from unverified lots may stay on shelves after verification, so look for the mark on the package itself.",
        ]} />
        <p>
          <strong className="text-ink">How to check:</strong> search the{" "}
          <a href={SOURCES.nonGmoFinder.url} target="_blank" rel="noopener noreferrer" className="text-moss underline">Non-GMO Project Product Finder</a>.
        </p>
        <OnPello>{c["non-gmo-project"]} products on Pello list Non-GMO Project Verified, as shown on their listing at The Feed.</OnPello>
      </Section>

      <Section title="Organic or Non-GMO: what's the difference?">
        <p>
          USDA organic production already excludes genetic engineering, and it also covers how ingredients are grown and which
          substances are allowed. Non-GMO Project verification focuses only on avoiding GMOs, and it applies to non-organic
          products too. A product can carry both.
        </p>
      </Section>
    </GuideShell>
  );
}

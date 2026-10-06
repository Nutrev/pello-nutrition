import type { Metadata } from "next";
import GuideShell, { Section, Facts, OnPello } from "@/components/guides/GuideShell";
import { SOURCES, dietCounts } from "@/lib/certification-guides";

export const metadata: Metadata = {
  title: "Vegan and gluten-free: certifications vs label claims",
  description: "What Certified Vegan and GFCO gluten-free certification require, what an uncertified 'vegan' or 'gluten-free' label means, and how Pello shows them.",
  alternates: { canonical: "https://www.pellonutrition.com/guides/certifications/diet" },
};

export default function DietGuide() {
  const d = dietCounts();
  return (
    <GuideShell
      slug="diet"
      title="Diet certifications"
      intro={<>&ldquo;Vegan&rdquo; or &ldquo;gluten-free&rdquo; on a label can be a certification checked by an independent organization, or a claim made by the brand. It&apos;s worth knowing which one you&apos;re looking at.</>}
      sources={[SOURCES.vegan, SOURCES.gfco, SOURCES.fdaGluten, SOURCES.fdaGlutenQa]}
    >
      <Section title="Certification or claim?">
        <Facts items={[
          <><strong className="text-ink">A certification</strong> means an independent organization has reviewed the product against a published standard, and the brand is licensed to use its mark.</>,
          <><strong className="text-ink">A label claim</strong> is the brand&apos;s own statement. Some claims have a legal definition (in the US, &ldquo;gluten-free&rdquo; does; see below), but nobody checks them before the product is sold.</>,
        ]} />
      </Section>

      <Section id="certified-vegan" title="Certified Vegan">
        <p>The Certified Vegan logo is run by Vegan Action (the Vegan Awareness Foundation), a nonprofit. To be certified, a product must:</p>
        <Facts items={[
          "Contain no meat, fish, fowl, animal by-products, eggs, milk, honey or other bee products, or insect products, and not be processed with animal products.",
          "Use no sugar filtered with bone char. Prebiotics and probiotics must be cultured on animal-free media.",
          "Not have been tested on animals, for ingredients or the finished product, since 2009.",
          "Contain no animal-derived GMOs or genes.",
          "If machinery is shared with non-vegan products, the company must show it cleans it between production runs to minimize cross-contamination.",
        ]} />
        <p>The logo is available to companies in the US, Canada, Australia, New Zealand and US territories.</p>
      </Section>

      <Section id="gluten-free" title="Gluten-free: the legal claim and GFCO certification">
        <Facts items={[
          <><strong className="text-ink">The US &ldquo;gluten-free&rdquo; claim</strong> is voluntary but defined by the FDA, and the rule covers dietary supplements. The food must contain less than 20 parts per million (ppm) gluten.</>,
          <><strong className="text-ink">GFCO certification</strong> (the Gluten-Free Certification Organization, a program of the Gluten Intolerance Group) requires that starting ingredients and finished products test below the gluten-free threshold of the country of sale, or 10 ppm, whichever is lower. It reviews the manufacturer&apos;s products and ingredients and sets testing requirements based on risk.</>,
        ]} />
      </Section>

      <Section title="How Pello shows diet information">
        <p>
          Product pages show vegan, gluten-free and dairy-free as <strong className="text-ink">label claims</strong>, from the brand or
          retailer. We never guess. If a product doesn&apos;t say it&apos;s vegan, we show &ldquo;not stated&rdquo; and leave it out of vegan filters
          and plans, even if none of its listed ingredients look animal-derived.
        </p>
        <p>
          For dairy-free, we count a product that&apos;s labeled vegan, or one whose allergen statement is available and doesn&apos;t list milk.
        </p>
        <OnPello>{d.vegan} products on Pello are labeled vegan and {d.glutenFree} are labeled gluten-free.</OnPello>
      </Section>
    </GuideShell>
  );
}

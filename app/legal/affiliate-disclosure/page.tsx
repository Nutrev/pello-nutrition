// ── AFFILIATE DISCLOSURE ──────────────────────────────────────
// app/legal/affiliate-disclosure/page.tsx

import type { Metadata } from "next";
import { ACTIVE_PROGRAMMES, AFFILIATES_ACTIVE, AMAZON_ACTIVE, AMAZON_ASSOCIATE_STATEMENT } from "@/lib/affiliate";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "How Pello Nutrition links to retailers, which affiliate programmes it takes part in, and how that affects its content.",
};

export default function AffiliateDisclosurePage() {
  return (
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Legal</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Affiliate Disclosure</h1>
          <p className="text-muted text-sm">Last updated: September 2026</p>
        </div>

        <div className="bg-moss/5 border border-moss/20 rounded-xl p-5 mb-8">
          <p className="text-sm font-medium text-ink">
            {AFFILIATES_ACTIVE
              ? "Pello Nutrition LLC may earn a commission on purchases made through some links on this site. This never influences our editorial scores, ratings or recommendations — our analysis is always independent."
              : "Pello Nutrition LLC doesn't currently earn anything from the retailer links on this site. If that changes, this page will list each programme we join. Either way, our scores and recommendations are independent."}
          </p>
          {AMAZON_ACTIVE && <p className="text-sm text-ink mt-2">{AMAZON_ASSOCIATE_STATEMENT}</p>}
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">How retailer links work</h2>
            <p>Product pages link to retailers that sell each product: The Feed&apos;s product page where we have it, and an Amazon search for the product. Links open the retailer&apos;s site directly; we never route them through our own domain.</p>
            {AFFILIATES_ACTIVE && (
              <p>Some of these links are affiliate links. When you click one and make a purchase, the retailer may pay us a commission — typically 4–10% of the sale value, depending on the retailer — at no additional cost to you. The price you pay is the same whether you use our link or go to the retailer directly. Affiliate links are marked for search engines with rel=&quot;sponsored&quot;.</p>
            )}
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">Programmes we participate in</h2>
            {ACTIVE_PROGRAMMES.length === 0 ? (
              <p>None at the moment. We&apos;ll list each programme here, with its cookie duration, when we join it.</p>
            ) : (
              <ul className="list-disc pl-5 space-y-1">
                {ACTIVE_PROGRAMMES.map((prog) => (
                  <li key={prog.id}>
                    <strong className="text-ink">{prog.name}</strong> — cookie duration {prog.cookieDuration}
                    {prog.id === "amazon" && (
                      <span className="block">Pello Nutrition LLC is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {ACTIVE_PROGRAMMES.length > 0 && (
              <p>A cookie duration is how long after your click a purchase can still be credited to us.</p>
            )}
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">Our commitment to independence</h2>
            <p>The Pello Score™ is calculated using a transparent, published methodology. Affiliate relationships play no role in scoring. Products are not ranked higher because we earn more commission on them. We will always recommend the best product for the athlete, not the most profitable one for us.</p>
            <p className="mt-2">No brand can pay to improve their Pello Score. No advertiser can influence our editorial content. Our independence is the foundation of Pello's credibility — without it, the scores mean nothing.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">FTC compliance</h2>
            <p>This disclosure is made in compliance with the Federal Trade Commission's guidelines on endorsements and testimonials (16 CFR Part 255). We are committed to full transparency about our commercial relationships.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">Questions</h2>
            <p>Pello Nutrition LLC<br />pellonutrition@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── AFFILIATE DISCLOSURE ──────────────────────────────────────
// app/legal/affiliate-disclosure/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Affiliate Disclosure",
  description: "Pello Nutrition affiliate disclosure — how we earn commissions and how this affects our content.",
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
          <p className="text-sm font-medium text-ink">Pello Nutrition earns a small commission on purchases made through links on this site. This never influences our editorial scores, ratings or recommendations — our analysis is always independent.</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">How affiliate links work</h2>
            <p>Some links on Pello Nutrition are affiliate links. When you click one and make a purchase, we receive a small commission from the retailer — typically 4-10% of the sale value — at no additional cost to you. The price you pay is identical whether you use our link or go directly to the retailer.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">Which programmes we participate in</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-ink">Amazon Associates</strong> — Amazon.com affiliate programme</li>
              <li><strong className="text-ink">The Feed</strong> — affiliate programme for endurance nutrition</li>
              <li><strong className="text-ink">Running Warehouse</strong> — affiliate programme</li>
              <li><strong className="text-ink">REI</strong> — affiliate programme</li>
            </ul>
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
            <p>If you have questions about our affiliate relationships or editorial policies, contact us at editorial@pellonutrition.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

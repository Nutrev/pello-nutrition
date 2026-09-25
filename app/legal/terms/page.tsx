// app/legal/terms/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Pello Nutrition terms of service.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Legal</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Terms of Service</h1>
          <p className="text-muted text-sm">Last updated: September 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">1. Acceptance of terms</h2>
            <p>By accessing or using pellonutrition.com ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">2. Not medical advice</h2>
            <p>The content on Pello Nutrition is for informational and educational purposes only. Nothing on this site constitutes medical advice, diagnosis or treatment. Always consult a qualified healthcare professional before making changes to your diet, supplementation or training programme. Pello Nutrition accepts no liability for decisions made based on content published on this site.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">3. Editorial independence</h2>
            <p>Pello Scores, ingredient verdicts and editorial recommendations are independent and not influenced by brands, advertisers or affiliate relationships. We may earn commissions on purchases made through links on the site — this never affects our scores or editorial content.</p>
            <p>Some product pages also show customer ratings and review counts from third-party retailers, such as The Feed. These are shown as published by that source and credited to it; they are not Pello Nutrition ratings.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">4. AI-generated content</h2>
            <p>Some features, including product summaries and personalised nutrition plans, are generated automatically using artificial intelligence. AI-generated content can contain errors or omissions and is not reviewed by a qualified professional before it is shown to you. Treat it as a starting point for your own research, not as advice, and check quantities such as carbohydrate, sodium and caffeine intake against your own needs and a professional's guidance.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">5. Accuracy of information</h2>
            <p>We make reasonable efforts to ensure accuracy of product information, ingredient data and pricing. However, product formulations, prices and availability change frequently. Always verify information directly with the manufacturer or retailer before purchase. Pello Nutrition accepts no liability for inaccuracies.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">6. User-generated content</h2>
            <p>By submitting a review or other content to the Site, you grant Pello Nutrition a non-exclusive, royalty-free licence to publish, display and distribute that content. You are responsible for ensuring your reviews are honest and do not infringe third-party rights. We reserve the right to remove content at our discretion.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">7. Intellectual property</h2>
            <p>The Pello Score™ methodology, site design, written content and software are the intellectual property of Pello Nutrition. You may not reproduce, distribute or create derivative works without written permission.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">8. Third-party links</h2>
            <p>The Site contains links to third-party websites including retailers. We are not responsible for the content, privacy practices or accuracy of third-party sites. Links do not constitute endorsement beyond the specific product referenced.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">9. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Pello Nutrition shall not be liable for any indirect, incidental, special or consequential damages arising from use of the Site or reliance on its content.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">10. Governing law</h2>
            <p>These terms are governed by the laws of the State of New York, without regard to its conflict-of-law rules. Any disputes arising from these terms or your use of the Site will be resolved in the state or federal courts located in New York.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">11. Changes to these terms</h2>
            <p>We may update these terms from time to time. The "Last updated" date at the top of this page shows when they last changed. Continuing to use the Site after an update means you accept the revised terms.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">12. Contact</h2>
            <p>For questions about these terms, email legal@pellonutrition.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

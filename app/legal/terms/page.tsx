// app/legal/terms/page.tsx

import type { Metadata } from "next";
import Link from "next/link";
import { PRO_ENABLED, PRO_PRICE_LABEL, PRO_ANNUAL_PRICE_LABEL, TRIAL_DAYS } from "@/lib/pro";
import { ANNUAL_ENABLED } from "@/lib/stripe";

// Sections after 8 move down one while the Pello Pro section is shown.
const n = (k: number) => (PRO_ENABLED ? k + 1 : k);

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
          <p className="text-muted text-sm">Last updated: October 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">1. Acceptance of terms</h2>
            <p>By accessing or using pellonutrition.com (&quot;the Site&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">2. Not medical advice</h2>
            <p>The content on Pello Nutrition LLC is for informational and educational purposes only. Nothing on this site constitutes medical advice, diagnosis or treatment. Always consult a qualified healthcare professional before making changes to your diet, supplementation or training program. Pello Nutrition LLC accepts no liability for decisions made based on content published on this site.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">3. Editorial independence</h2>
            <p>Pello Scores, ingredient verdicts and editorial recommendations are independent and not influenced by brands, advertisers or affiliate relationships. We may earn commissions on purchases made through links on the site — this never affects our scores or editorial content.</p>
            <p>Some product pages also show customer ratings and review counts from third-party retailers, such as The Feed. These are shown as published by that source and credited to it; they are not Pello Nutrition LLC ratings.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">4. AI-generated content</h2>
            <p>Some features, including product summaries and personalized nutrition plans, are generated automatically using artificial intelligence. AI-generated content can contain errors or omissions and is not reviewed by a qualified professional before it is shown to you. Treat it as a starting point for your own research, not as advice, and check quantities such as carbohydrate, sodium and caffeine intake against your own needs and a professional&apos;s guidance.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">5. Accuracy of information</h2>
            <p>We make reasonable efforts to ensure accuracy of product information, ingredient data and pricing. However, product formulations, prices and availability change frequently. Always verify information directly with the manufacturer or retailer before purchase. Pello Nutrition LLC accepts no liability for inaccuracies.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">6. User-generated content</h2>
            <p>By submitting a review or other content to the Site, you grant Pello Nutrition LLC a non-exclusive, royalty-free license to publish, display and distribute that content. You are responsible for ensuring your reviews are honest and do not infringe third-party rights. We reserve the right to remove content at our discretion.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">7. Intellectual property</h2>
            <p>The Pello Score™ methodology, site design, written content and software are the intellectual property of Pello Nutrition LLC. You may not reproduce, distribute or create derivative works without written permission from Pello Nutrition LLC.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">8. Third-party links</h2>
            <p>The Site contains links to third-party websites including retailers. We are not responsible for the content, privacy practices or accuracy of third-party sites. Links do not constitute endorsement beyond the specific product referenced.</p>
          </section>

          {PRO_ENABLED && (
            <section>
              <h2 className="font-display font-semibold text-lg text-ink mb-2">9. Pello Pro subscriptions</h2>
              <p>Pello Pro is a paid subscription, billed monthly{ANNUAL_ENABLED ? " or annually" : ""}, sold through Link, Stripe&apos;s checkout service. Stripe acts as the merchant of record for your purchase: it processes the payment, collects any sales tax or VAT, and sends your receipts and invoices. Your card statement will show &ldquo;LINK.COM*&rdquo;. Stripe&apos;s and Link&apos;s terms also apply to the purchase. We never see or store your full card details.</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong className="text-ink">Price.</strong> Pello Pro costs {PRO_PRICE_LABEL} per month{ANNUAL_ENABLED ? <>, or {PRO_ANNUAL_PRICE_LABEL} per year on annual billing</> : null} (USD), plus any applicable tax, as shown on the <Link href="/pricing" className="text-moss underline">pricing page</Link> and at checkout. Checkout may show the equivalent price in your local currency.</li>
                <li><strong className="text-ink">Free trial.</strong> New accounts may receive one {TRIAL_DAYS}-day free trial. You don&apos;t need a payment method to start it. If you add one, you will be charged the price of the plan you chose{ANNUAL_ENABLED ? " (monthly or annual)" : ""} when the trial ends unless you cancel before then. If you don&apos;t add one, your subscription ends with the trial and your account returns to the free plan without charge.</li>
                <li><strong className="text-ink">Automatic renewal.</strong> Your subscription renews automatically {ANNUAL_ENABLED ? "every month or every year, depending on the plan you chose," : "every month"} and is charged to your payment method at the start of each billing period until you cancel.{ANNUAL_ENABLED ? " For annual plans, we email you a reminder before each renewal." : ""}</li>
                <li><strong className="text-ink">Canceling.</strong> You can cancel at any time from your account (&ldquo;Manage subscription&rdquo;), from your Link account at link.com, or by emailing pellonutrition@gmail.com. Cancellation takes effect at the end of the current billing period; you keep Pro access until then and won&apos;t be charged again.</li>
                <li><strong className="text-ink">Refunds.</strong> You can ask for a refund through Link support or by emailing us. Stripe may issue refunds within 60 days of a payment in some cases, and statutory cooling-off rights apply where the law gives them. Otherwise we don&apos;t give refunds or credits for partial billing periods.</li>
                <li><strong className="text-ink">Failed payments.</strong> If a renewal payment fails, Stripe will retry it. If it still can&apos;t be collected, your subscription ends and your account returns to the free plan.</li>
                <li><strong className="text-ink">Price changes.</strong> We&apos;ll email you at least 30 days before any price change takes effect. The new price applies from your next billing period after that, and you can cancel before it does.</li>
                <li><strong className="text-ink">Free plan.</strong> If your subscription ends, you keep read-only access to plans and stack items you saved, and can delete them at any time.</li>
              </ul>
            </section>
          )}

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">{n(9)}. Limitation of liability</h2>
            <p>To the maximum extent permitted by law, Pello Nutrition LLC shall not be liable for any indirect, incidental, special or consequential damages arising from use of the Site or reliance on its content.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">{n(10)}. Governing law</h2>
            <p>These terms are governed by the laws of the United States and the State of New York, where Pello Nutrition LLC is registered. Any disputes shall be resolved in the courts of New York.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">{n(11)}. Changes to these terms</h2>
            <p>We may update these terms from time to time. The &quot;Last updated&quot; date at the top of this page shows when they last changed. Continuing to use the Site after an update means you accept the revised terms.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">{n(12)}. Contact</h2>
            <p>For questions about these terms, email pellonutrition@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

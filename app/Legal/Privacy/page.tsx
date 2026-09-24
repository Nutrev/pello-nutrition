// ── PRIVACY POLICY ────────────────────────────────────────────
// app/legal/privacy/page.tsx

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Pello Nutrition privacy policy — how we collect, use and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display font-bold text-lg tracking-tight">
            Pel<span className="text-moss">lo</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ink transition-colors">← Back to site</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-2">Legal</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted text-sm">Last updated: September 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">1. Who we are</h2>
            <p>Pello Nutrition ("Pello", "we", "us", "our") operates pellonutrition.com, a sports nutrition research platform. Our registered business address is available on request.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">2. What data we collect</h2>
            <p>We collect the following types of data:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-ink">Email addresses</strong> — when you sign up for price alerts or contact us</li>
              <li><strong className="text-ink">Usage data</strong> — pages visited, time on site, browser type (via analytics tools)</li>
              <li><strong className="text-ink">Community reviews</strong> — name and review content you voluntarily submit</li>
              <li><strong className="text-ink">Device data</strong> — IP address, browser type, operating system</li>
            </ul>
            <p className="mt-2">We do not collect payment information, government IDs or sensitive personal data.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To send price drop alerts you have explicitly requested</li>
              <li>To display community reviews on product pages</li>
              <li>To analyse site usage and improve the product</li>
              <li>To comply with legal obligations</li>
            </ul>
            <p className="mt-2">We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">4. Affiliate links</h2>
            <p>Pello Nutrition participates in affiliate programmes including Amazon Associates and others. When you click a product link and make a purchase, we may earn a commission at no additional cost to you. This never influences our editorial scores, reviews or recommendations. See our <Link href="/legal/affiliate-disclosure" className="text-moss underline">affiliate disclosure</Link> for full details.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">5. Cookies</h2>
            <p>We use cookies for basic site functionality and analytics. By using this site you consent to our use of cookies. You can disable cookies in your browser settings, though some features may not function correctly.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">6. Third-party services</h2>
            <p>We use the following third-party services which have their own privacy policies:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Supabase — database hosting</li>
              <li>Vercel — website hosting</li>
              <li>Anthropic Claude — AI-powered features</li>
              <li>Google Analytics — usage analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">7. Data retention</h2>
            <p>We retain email addresses for price alerts until you unsubscribe. Community reviews are retained indefinitely unless you request removal. Analytics data is retained for 26 months.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">8. Your rights</h2>
            <p>You have the right to access, correct or delete your personal data. To exercise these rights, contact us at privacy@pellonutrition.com. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">9. Changes to this policy</h2>
            <p>We may update this policy from time to time. Material changes will be communicated via the site. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">10. Contact</h2>
            <p>For privacy-related questions, email privacy@pellonutrition.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

// ── TERMS OF SERVICE ──────────────────────────────────────────
// app/legal/terms/page.tsx

// ── AFFILIATE DISCLOSURE ──────────────────────────────────────
// app/legal/affiliate-disclosure/page.tsx

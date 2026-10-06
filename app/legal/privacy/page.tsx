// ── PRIVACY POLICY ────────────────────────────────────────────
// app/legal/privacy/page.tsx

import Link from "next/link";
import { ACTIVE_PROGRAMMES } from "@/lib/affiliate";
import { PRO_ENABLED } from "@/lib/pro";
import { INTERVALS_ENABLED } from "@/lib/intervals";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Pello Nutrition privacy policy — how we collect, use and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">Legal</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">Privacy Policy</h1>
          <p className="text-muted text-sm">Last updated: October 2026</p>
        </div>

        <div className="prose prose-sm max-w-none space-y-6 text-muted leading-relaxed">
          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">1. Who we are</h2>
            <p>Pello Nutrition LLC (&ldquo;Pello&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is a limited liability company operating pellonutrition.com, a sports nutrition research platform for endurance athletes.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">2. What data we collect</h2>
            <p>You can browse Pello without an account. We collect:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-ink">Account details</strong> — if you create an account: your email address and password (stored securely by our authentication provider; we never see your password), or your Google account email if you sign in with Google</li>
              <li><strong className="text-ink">Profile information</strong> — anything you choose to add: a username, body weight and preferred unit, age, sex, training days per week, cycling FTP, caffeine preference, dietary preferences (vegan, gluten-free, dairy-free) and goals</li>
              <li><strong className="text-ink">Saved content</strong> — nutrition plans you save (including the inputs used to create them, such as event details and body weight), favorite products, and the products, doses, timing and notes in your supplement stack</li>
              {PRO_ENABLED && (
                <li><strong className="text-ink">Subscription details</strong> — if you subscribe to Pello Pro: your subscription status, trial and renewal dates, and the customer and subscription IDs Stripe assigns. Pello Pro is sold through Link, Stripe&apos;s checkout, which acts as the merchant of record: Stripe and Link collect your payment details and billing address under their own privacy policies. We never see or store your full card number</li>
              )}
              {PRO_ENABLED && (
                <li><strong className="text-ink">Planner usage</strong> — the date of each nutrition plan you generate, to count the free plan&apos;s monthly allowance</li>
              )}
              <li><strong className="text-ink">Workout files</strong> — if you plan from a workout file, it&apos;s read in your browser and never uploaded or stored. Only a summary (its name, duration, intensity and power figures, with no location or time data) is used for your plan, and it&apos;s saved with the plan if you save it</li>
              {INTERVALS_ENABLED && (
                <li><strong className="text-ink">intervals.icu connection</strong> — if you connect your intervals.icu account: your intervals.icu athlete ID and name, and an access token that lets Pello read the planned workouts on your intervals.icu calendar (read-only; no activities, wellness or settings). When you choose to use today&apos;s workout, Pello fetches that day&apos;s planned workouts from intervals.icu and passes them to your browser, where they&apos;re read like an uploaded workout file. We don&apos;t store your calendar or workouts</li>
              )}
              <li><strong className="text-ink">Community reviews</strong> — the display name, ratings and comments you choose to submit; these are public{PRO_ENABLED ? ". We also record which account wrote each review; that isn't shown publicly" : ""}</li>
              <li><strong className="text-ink">Emails you send us</strong> — if you contact us</li>
              <li><strong className="text-ink">Technical data</strong> — your IP address and browser details, which our hosting provider processes to deliver the site and which we use briefly to limit abuse of forms and AI features</li>
            </ul>
            <p className="mt-2">All profile fields are optional. We do not collect payment information or government IDs, and we do not use analytics or advertising trackers.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">3. How we use your data</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>To run your account: logging you in and showing your saved plans, favorites and stack</li>
              {PRO_ENABLED && <li>To provide Pello Pro: checking your subscription, counting free plans, and letting you manage billing through Stripe</li>}
              <li>To tailor nutrition plans: when you use the planner, the details you enter (such as body weight, age, sex, training days, event details and any workout-file summary) are sent to our AI provider to generate your plan</li>
              <li>To display community reviews on product pages</li>
              <li>To send account emails you trigger, such as email confirmation and password reset</li>
              <li>To keep the site secure and comply with legal obligations</li>
            </ul>
            <p className="mt-2">We do not sell your personal data, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">4. Affiliate links</h2>
            <p>
              {ACTIVE_PROGRAMMES.length > 0
                ? `Pello Nutrition LLC participates in these affiliate programs: ${ACTIVE_PROGRAMMES.map((p) => p.name).join(", ")}. When you click a retailer link and make a purchase, the retailer may set a cookie that credits the sale to us, and we may earn a commission at no additional cost to you. `
                : "Product pages link to retailers such as The Feed and Amazon. Pello Nutrition LLC doesn't currently take part in any affiliate program, so these links carry no affiliate tracking from us; the retailer's own privacy policy applies once you're on their site. "}
              This never influences our editorial scores, reviews or recommendations. See our <Link href="/legal/affiliate-disclosure" className="text-moss underline">affiliate disclosure</Link> for full details.
            </p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">5. Cookies and local storage</h2>
            <p>We use only what the site needs to work:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><strong className="text-ink">Login cookies</strong> — set when you log in, to keep you signed in; removed when you log out</li>
              <li><strong className="text-ink">Recently viewed</strong> — your browser&apos;s local storage remembers the last few products you viewed; this stays on your device and is never sent to us</li>
            </ul>
            <p className="mt-2">We don&apos;t use analytics or advertising cookies. Retailers you visit through our links may set their own cookies under their own policies. You can clear cookies and local storage in your browser settings; you&apos;ll need to log in again afterwards.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">6. Third-party services</h2>
            <p>We use the following services to run Pello. Each processes data on our behalf and has its own privacy policy:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Supabase — database and account login (stores your account, profile, saved content and reviews)</li>
              <li>Vercel — website hosting</li>
              {PRO_ENABLED && <li>Stripe and Link — payments, tax and subscription billing for Pello Pro, as merchant of record</li>}
              <li>Anthropic (Claude) — AI features: planner inputs and product information are sent to generate plans and summaries</li>
              <li>Google — only if you choose to sign in with Google</li>
              {INTERVALS_ENABLED && <li>intervals.icu — only if you connect your intervals.icu account, to read your planned workouts</li>}
            </ul>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">7. Data retention</h2>
            <p>We keep your account, profile and saved content until you delete them or ask us to delete your account. You can edit your profile and remove saved plans, favorites and stack items at any time from your account. When an account is deleted, all its profile data, saved plans, favorites and stack entries are deleted with it.{INTERVALS_ENABLED ? " An intervals.icu connection is kept until you disconnect it from your account page or delete your account; disconnecting also revokes Pello's access on intervals.icu." : ""} Community reviews are kept unless you ask us to remove them.{PRO_ENABLED ? " If you subscribe to Pello Pro, Stripe keeps payment and invoice records as required for tax and accounting." : ""}</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">8. Your rights</h2>
            <p>You have the right to access, correct, export or delete your personal data. To delete your account or exercise any of these rights, email pellonutrition@gmail.com from the address on your account. We will respond within 30 days.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">9. Changes to this policy</h2>
            <p>We may update this policy from time to time. Material changes will be communicated via the site. Continued use of the site after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="font-display font-semibold text-lg text-ink mb-2">10. Contact</h2>
            <p>For privacy-related questions, email pellonutrition@gmail.com.</p>
          </section>
        </div>
      </div>
    </div>
  );
}


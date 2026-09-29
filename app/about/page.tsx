import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Pello Nutrition",
  description: "Pello Nutrition is an independent sports nutrition research platform for endurance athletes: ingredients checked against peer-reviewed science, customer ratings and the Pello Score™.",
  alternates: { canonical: "https://www.pellonutrition.com/about" },
};

const WHAT_WE_DO = [
  { title: "Independent research", text: "We analyse ingredients against peer-reviewed science." },
  { title: "Community reviews", text: "Real athlete ratings across taste, GI comfort, energy and value." },
  { title: "AI-powered analysis", text: "Claude AI writes on-demand product summaries from each product's label, ingredients and ratings." },
  { title: "Pello Score™", text: "Our 5-pillar scoring system rates every product on science, transparency, value, athlete experience and quality." },
];

const LINKS = [
  { href: "/methodology", label: "How we score products" },
  { href: "/legal/privacy", label: "Privacy Policy" },
  { href: "/legal/terms", label: "Terms of Service" },
  { href: "/legal/affiliate-disclosure", label: "Affiliate Disclosure" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs text-muted uppercase tracking-widest mb-2">About</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-2">About Pello Nutrition</h1>
          <p className="text-muted">Independent sports nutrition research for endurance athletes</p>
        </div>

        <section className="mb-12">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Our mission</h2>
          <div className="text-muted text-sm leading-relaxed space-y-3">
            <p>
              Pello Nutrition LLC is an independent sports nutrition research platform. We bring together thousands of real
              customer reviews, cross-reference ingredients with peer-reviewed science, and use AI to generate clear, unbiased
              product reports.
            </p>
            <p>
              We are not affiliated with any nutrition brand. Our Pello Score™ ratings and editorial recommendations are entirely
              independent. We may earn affiliate commissions on purchases made through links on this site — this never
              influences our scores or content.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display font-semibold text-lg text-ink mb-4">What we do</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHAT_WE_DO.map((c) => (
              <div key={c.title} className="card">
                <h3 className="font-display font-semibold mb-1">{c.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{c.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-display font-semibold text-lg text-ink mb-3">Legal</h2>
          <address className="not-italic text-muted text-sm leading-relaxed">
            Pello Nutrition LLC<br />
            Registered in New York, United States<br />
            <a href="mailto:contact@pellonutrition.com" className="text-moss hover:underline">contact@pellonutrition.com</a><br />
            pellonutrition.com
          </address>
        </section>

        <section>
          <h2 className="font-display font-semibold text-lg text-ink mb-3">More about how we work</h2>
          <ul className="space-y-2">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="text-sm text-moss hover:underline">{l.label} →</Link></li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

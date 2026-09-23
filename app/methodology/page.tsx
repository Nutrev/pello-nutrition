import Link from "next/link";
import Logo from "@/components/Logo";
import { FULENS_SCORE_METHODOLOGY } from "@/lib/fulens-score";

const PILLAR_COLORS: Record<string, string> = {
  "Science": "bg-moss/10 text-moss border-moss/20",
  "Transparency": "bg-moss/5 text-moss border-moss/10",
  "Value": "bg-amber/10 text-amber border-amber/20",
  "Athlete Experience": "bg-blue-50 text-blue-700 border-blue-100",
  "Quality": "bg-purple-50 text-purple-700 border-purple-100",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      <Logo />
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden sm:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
      <Link href="/guides" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
      <Link href="/compare" className="hidden md:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Query</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      <Link href="/blog" className="text-sm text-muted hover:text-ink transition-colors">Blog</Link>
            <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="max-w-2xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Methodology</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">
            Pello Score™
          </h1>
          <p className="text-muted text-lg leading-relaxed mb-4">
            A transparent, five-pillar scoring system that evaluates every sports nutrition product on the same objective criteria. Version {FULENS_SCORE_METHODOLOGY.version}.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted">Last updated {FULENS_SCORE_METHODOLOGY.lastUpdated}</span>
            <span className="text-xs bg-moss/10 text-moss font-mono px-2 py-0.5 rounded-md">
              {FULENS_SCORE_METHODOLOGY.totalPoints} point scale
            </span>
          </div>
        </div>

        {/* Core principle */}
        <div className="card bg-moss/5 border-moss/20 mb-10">
          <h2 className="font-display font-bold text-xl mb-3">The core principle</h2>
          <p className="text-muted leading-relaxed">
            The Pello Score™ is designed to answer one question: <strong>how good is this product, really?</strong> Not how well-marketed it is. Not how pretty the packaging is. Not how much the brand spent on athlete endorsements. Just whether the product is genuinely worth buying.
          </p>
          <p className="text-muted leading-relaxed mt-3">
            Every score is calculated using the same transparent formula. No brand can pay to improve their score. The methodology is published in full so athletes, brands and researchers can scrutinise it.
          </p>
        </div>

        {/* The five pillars */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-6">The five pillars</h2>
          <div className="space-y-4">
            {FULENS_SCORE_METHODOLOGY.pillars.map((pillar: { name: string; weight: number; description: string; factors: string[] }) => (
              <div key={pillar.name} className={`card border ${PILLAR_COLORS[pillar.name] ?? "border-sand"}`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display font-bold text-lg">{pillar.name}</h3>
                  <span className="font-mono font-bold text-2xl">{pillar.weight}</span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-3">{pillar.description}</p>
                <ul className="space-y-1.5">
                  {pillar.factors.map((factor, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted">
                      <span className="flex-shrink-0 mt-0.5">→</span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Score labels */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-5">Score labels</h2>
          <div className="space-y-2">
            {[
              { range: "85-100", label: "Exceptional", color: "bg-moss/10 text-moss", desc: "Best in class — top science, transparency and athlete experience" },
              { range: "75-84", label: "Excellent", color: "bg-moss/5 text-moss", desc: "Strong across all pillars — highly recommended" },
              { range: "65-74", label: "Good", color: "bg-amber/10 text-amber", desc: "Above average — minor trade-offs worth knowing about" },
              { range: "50-64", label: "Average", color: "bg-sand text-muted", desc: "Meets the basics — check individual pillar scores" },
              { range: "35-49", label: "Below average", color: "bg-rust/10 text-rust", desc: "Notable weaknesses in one or more pillars" },
              { range: "0-34", label: "Poor", color: "bg-rust/20 text-rust", desc: "Significant concerns — transparency or evidence issues" },
            ].map((item) => (
              <div key={item.range} className="card flex items-center gap-4">
                <span className={`text-xs font-mono px-2 py-1 rounded-md font-medium flex-shrink-0 ${item.color}`}>
                  {item.label}
                </span>
                <div className="flex-1">
                  <span className="text-xs text-muted">{item.desc}</span>
                </div>
                <span className="text-xs font-mono text-muted flex-shrink-0">{item.range}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category adjustment */}
        <div className="mb-10">
          <h2 className="font-display font-bold text-2xl mb-4">Category adjustment</h2>
          <p className="text-muted leading-relaxed">
            Value scores are benchmarked against category averages — not across all products. An energy gel is compared to other energy gels, not to a protein powder. This ensures scores reflect genuine value within the context athletes actually care about.
          </p>
        </div>

        {/* Principles */}
        <div className="mb-12">
          <h2 className="font-display font-bold text-2xl mb-5">Principles</h2>
          <div className="space-y-2">
            {FULENS_SCORE_METHODOLOGY.principles.map((principle: string, i: number) => (
              <div key={i} className="flex items-start gap-3 py-2 border-b border-sand last:border-0">
                <span className="text-moss font-mono text-xs flex-shrink-0 mt-0.5">✓</span>
                <p className="text-sm text-muted">{principle}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card text-center py-8">
          <h3 className="font-display font-semibold mb-2">See the scores in action</h3>
          <p className="text-xs text-muted mb-4">Browse products and see their Pello Scores across all five pillars</p>
          <div className="flex gap-3 justify-center">
            <Link href="/products" className="btn-primary">Browse products</Link>
            <Link href="/query" className="btn-secondary">Query Explore</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
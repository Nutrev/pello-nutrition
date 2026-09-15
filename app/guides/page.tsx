import Link from "next/link";

const GUIDES = [
  {
    slug: "carb-calculator",
    title: "Carb Calculator",
    desc: "Calculate exactly how many carbs you need per hour based on your workout duration, intensity and body weight.",
    tags: ["Endurance", "Fuelling", "Calculator"],
    time: "2 min",
  },
  {
    slug: "recovery",
    title: "Post-Workout Recovery Guide",
    desc: "The science-backed recovery window explained — what to eat, when to eat it, and how to optimise your body's repair process.",
    tags: ["Recovery", "Nutrition", "Science"],
    time: "5 min read",
  },
];

export default function GuidesPage() {
  return (
    <div className="min-h-screen">
      <nav className="border-b border-sand bg-cream/80 backdrop-blur-sm sticky top-0 z-50">
  <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
    <Link href="/" className="font-display font-bold text-lg tracking-tight">
      Pel<span className="text-moss">lo</span>
    </Link>
    <div className="flex items-center gap-3">
      <Link href="/products" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">All products</Link>
            <Link href="/search" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Search</Link>
      <Link href="/guides" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Guides</Link>
      <Link href="/compare" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Compare</Link>
      <Link href="/query" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Query</Link>
      <Link href="/ingredients" className="hidden lg:block text-sm text-muted hover:text-ink transition-colors">Ingredients</Link>
      
      <Link href="/quiz" className="btn-secondary text-xs py-1.5 px-3">Build my plan →</Link>
    </div>
  </div>
</nav>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <div className="text-xs font-mono text-muted uppercase tracking-widest mb-3">Guides</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">
            Nutrition guides
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            Science-backed guides to help you fuel smarter — calculators, recovery protocols and practical nutrition advice.
          </p>
        </div>

        <div className="space-y-4">
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`}>
              <div className="card hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="font-display font-bold text-xl mb-2 group-hover:text-moss transition-colors">
                      {guide.title}
                    </h2>
                    <p className="text-muted text-sm leading-relaxed mb-4">{guide.desc}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {guide.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-sand font-mono px-2 py-0.5 rounded-md">{tag}</span>
                      ))}
                      <span className="text-xs text-muted ml-2">{guide.time}</span>
                    </div>
                  </div>
                  <span className="text-moss text-lg flex-shrink-0 mt-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

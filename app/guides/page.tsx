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

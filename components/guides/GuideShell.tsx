// Layout for the certification guides: breadcrumb, title, body, sources and the other guides.
import Link from "next/link";
import { CERT_GUIDES } from "@/lib/certification-guides";

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 mb-10">
      <h2 className="font-display font-semibold text-xl text-ink mb-3">{title}</h2>
      <div className="text-sm text-muted leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export function Facts({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((it, i) => (
        <li key={i} className="flex gap-2"><span aria-hidden="true" className="text-moss">·</span><span>{it}</span></li>
      ))}
    </ul>
  );
}

export function OnPello({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl bg-moss/5 border border-moss/20 px-4 py-3 text-sm text-ink">{children}</div>;
}

export default function GuideShell({ slug, title, intro, sources, children }: {
  slug: string;
  title: string;
  intro: React.ReactNode;
  sources: { label: string; url: string }[];
  children: React.ReactNode;
}) {
  const others = CERT_GUIDES.filter((g) => g.slug !== slug);
  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      <nav className="text-xs text-muted mb-4">
        <Link href="/guides" className="hover:text-ink">Guides</Link> <span aria-hidden="true">/</span>{" "}
        <Link href="/guides/certifications" className="hover:text-ink">Certifications</Link>
      </nav>
      <h1 className="font-display font-bold text-4xl tracking-tight mb-4">{title}</h1>
      <div className="text-muted text-lg leading-relaxed mb-10">{intro}</div>

      {children}

      <section className="border-t border-sand pt-6 mt-12">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-2">Sources</h2>
        <ul className="space-y-1 text-xs">
          {sources.map((s) => (
            <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-moss hover:underline">{s.label} ↗</a></li>
          ))}
        </ul>
        <p className="text-[11px] text-muted mt-3">Checked against each source in October 2026. Programs change their rules, so the certifier&apos;s own site is the final word.</p>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted mb-3">More certification guides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {others.map((g) => (
            <Link key={g.slug} href={`/guides/certifications/${g.slug}`} className="card hover:shadow-md transition-all">
              <div className="font-display font-semibold text-sm mb-1">{g.title}</div>
              <div className="text-xs text-muted">{g.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

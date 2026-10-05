// The "Quality standards" card on a product page: third-party certifications grouped by what
// they cover, how each was checked, and the diet claims, clearly labelled as claims.
import Link from "next/link";
import { QUALITY_STANDARDS, standardsFrom, meetsDiet, type QualityStandard, type DietFacts } from "@/lib/quality-standards";
import { formatDate } from "@/lib/format-date";

export interface NsfCheck {
  listing: { listingId: string; listingName: string } | null;  // found in NSF's database
  notFound: boolean;      // The Feed lists NSF, but NSF's database didn't have it
  checkedOn: string;
}

function Tick({ on }: { on: boolean }) {
  return on
    ? <span aria-hidden="true" className="h-5 w-5 rounded-full bg-moss text-cream flex items-center justify-center text-[11px] flex-shrink-0">✓</span>
    : <span aria-hidden="true" className="h-5 w-5 rounded-full border border-sand flex-shrink-0" />;
}

function StandardRow({ s, met, nsf }: { s: QualityStandard; met: boolean; nsf: NsfCheck }) {
  const verified = s.id === "nsf-sport" && met && nsf.listing;
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Tick on={met} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className={`text-sm ${met ? "font-medium text-ink" : "text-muted"}`}>{s.name}</span>
          {met && (verified ? (
            <a href={`https://www.nsfsport.com/certified-products/listing-detail.php?id=${nsf.listing!.listingId}`} target="_blank" rel="noopener noreferrer"
              className="text-[11px] bg-moss/10 text-moss px-1.5 py-0.5 rounded hover:underline">
              Verified with NSF · {formatDate(nsf.checkedOn)} ↗
            </a>
          ) : (
            <span className="text-[11px] bg-sand px-1.5 py-0.5 rounded text-muted">Listed by The Feed</span>
          ))}
        </div>
        {met && <p className="text-xs text-muted mt-0.5 leading-relaxed">{s.what}</p>}
        {met && !verified && (
          <a href={s.lookupUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-moss hover:underline">
            Check in the {s.lookupLabel} ↗
          </a>
        )}
        {s.id === "nsf-sport" && !met && nsf.notFound && (
          <p className="text-xs text-amber mt-0.5">
            The Feed lists this product as NSF Certified for Sport, but we couldn&apos;t find it in NSF&apos;s database
            (checked {formatDate(nsf.checkedOn)}), so we don&apos;t count it.
          </p>
        )}
      </div>
    </li>
  );
}

function ClaimRow({ label, value, note }: { label: string; value: boolean | null; note: string }) {
  return (
    <li className="flex items-start gap-3 py-2.5">
      <Tick on={value === true} />
      <div className="flex-1">
        <span className={`text-sm ${value ? "font-medium text-ink" : "text-muted"}`}>
          {label}: {value === true ? "yes" : value === false ? "no" : "not stated"}
        </span>
        <p className="text-xs text-muted mt-0.5">{note}</p>
      </div>
    </li>
  );
}

export default function QualityStandards({ certifications, diet, nsf }: {
  certifications: string[] | undefined;
  diet: DietFacts;
  nsf: NsfCheck;
}) {
  const met = new Set(standardsFrom(certifications));
  const sport = QUALITY_STANDARDS.filter((s) => s.group === "sport");
  const sourcing = QUALITY_STANDARDS.filter((s) => s.group === "sourcing");
  const sportTested = sport.some((s) => met.has(s.id));
  const dairyFree = meetsDiet(diet, "dairy-free") ? true : diet.allergens?.some((a) => /milk/i.test(a)) ? false : null;

  return (
    <div className="card lg:col-span-2" id="quality-standards">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
        <h2 className="font-display font-semibold text-base">Quality standards</h2>
        <Link href="/guides/certifications" className="text-xs text-moss hover:underline">What these mean →</Link>
      </div>
      <p className="text-sm mb-4">
        <span className="font-medium">{met.size} of {QUALITY_STANDARDS.length}</span>
        <span className="text-muted"> standards Pello tracks · </span>
        <span className={sportTested ? "text-moss font-medium" : "text-muted"}>
          {sportTested ? "Third-party tested for banned substances" : "No third-party banned-substance testing listed"}
        </span>
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6">
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted">Tested for sport</h3>
          <ul className="divide-y divide-sand">{sport.map((s) => <StandardRow key={s.id} s={s} met={met.has(s.id)} nsf={nsf} />)}</ul>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted">Food &amp; sourcing</h3>
          <ul className="divide-y divide-sand">{sourcing.map((s) => <StandardRow key={s.id} s={s} met={met.has(s.id)} nsf={nsf} />)}</ul>
        </div>
        <div>
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-muted">Diet claims</h3>
          <ul className="divide-y divide-sand">
            <ClaimRow label="Vegan" value={diet.isVegan ?? null} note="Brand or retailer label claim, not a certification." />
            <ClaimRow label="Gluten-free" value={diet.isGlutenFree ?? null} note="Brand or retailer label claim. In the US a gluten-free label means under 20 ppm gluten." />
            <ClaimRow label="Dairy-free" value={dairyFree}
              note={dairyFree === true && diet.isVegan === true ? "Labelled vegan." : "From the allergen list, where one is available."} />
          </ul>
        </div>
      </div>
      <p className="text-[11px] text-muted mt-4 leading-relaxed">
        Certifications are as listed on the product&apos;s page at The Feed. NSF Certified for Sport is also checked against NSF&apos;s
        own database. Certifications can lapse, so check the certifier&apos;s search before you rely on one, especially if you&apos;re drug tested.
      </p>
    </div>
  );
}

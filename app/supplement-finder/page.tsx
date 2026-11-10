import Link from "next/link";
import type { Metadata } from "next";
import ProductCard from "@/components/ProductCard";
import { getProductSummaries } from "@/lib/catalog";
import { FINDER_GOALS, FINDER_DIETS, GOAL_TOPIC, parseFinderParams, finderResults, type FinderResult } from "@/lib/supplement-finder";

// The free supplement finder. The answers live in the URL (a plain GET form), so the page works
// without JavaScript, results can be shared, and each goal has its own address.
type SearchParams = Record<string, string | string[] | undefined>;

const SITE = "https://www.pellonutrition.com";

export function generateMetadata({ searchParams }: { searchParams: SearchParams }): Metadata {
  const inputs = parseFinderParams(searchParams);
  const goal = inputs && FINDER_GOALS.find((g) => g.id === inputs.goal);
  const title = goal ? `Supplements for ${GOAL_TOPIC[goal.id]}` : "Supplement Finder";
  const description = "Answer a few questions and see the best-scoring supplements for your goal, ranked by independent Pello Scores, with the evidence behind each.";
  // Only the bare goal pages are indexed; filtered variations point back to them.
  const canonical = goal ? `${SITE}/supplement-finder?goal=${goal.id}` : `${SITE}/supplement-finder`;
  return { title, description, alternates: { canonical }, openGraph: { title: `${title} | Pello`, description, url: canonical } };
}

const VERDICT_LABEL = { proven: "Strong evidence", likely: "Some evidence", disputed: "Limited evidence" } as const;

const pill = "inline-flex items-center text-sm px-3 py-2 rounded-xl border border-sand bg-white/40 cursor-pointer transition-all hover:border-muted peer-checked:border-moss peer-checked:bg-moss/5 peer-checked:text-moss peer-checked:font-medium peer-focus-visible:ring-2 peer-focus-visible:ring-moss/40";

function Choice({ type, name, value, checked, label }: { type: "radio" | "checkbox"; name: string; value: string; checked: boolean; label: string }) {
  return (
    <label>
      <input type={type} name={name} value={value} defaultChecked={checked} className="sr-only peer" required={type === "radio"} />
      <span className={pill}>{label}</span>
    </label>
  );
}

function Result({ r }: { r: FinderResult }) {
  const k = r.keyIngredient;
  return (
    <div className="flex flex-col gap-2">
      <ProductCard product={r.product} />
      <div className="text-xs text-muted leading-relaxed px-1 space-y-1">
        {k && (
          <p>
            <span className="text-ink font-medium">{k.name}</span>{k.dose ? ` (${k.dose})` : ""}: {VERDICT_LABEL[k.verdict].toLowerCase()}.
          </p>
        )}
        <p>
          {r.evidence.proven + r.evidence.likely} of {r.product.ingredients.length} ingredient{r.product.ingredients.length === 1 ? "" : "s"} with strong or some evidence
          {r.tested.length > 0 && <> · {r.tested.join(", ")}</>}
        </p>
        {r.cautions.map((c) => <p key={c} className="text-amber">{c}</p>)}
      </div>
    </div>
  );
}

export default function SupplementFinderPage({ searchParams }: { searchParams: SearchParams }) {
  const inputs = parseFinderParams(searchParams);
  const goal = inputs && FINDER_GOALS.find((g) => g.id === inputs.goal);
  const results = inputs ? finderResults(getProductSummaries(), inputs) : [];

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-10">
          <div className="text-xs text-muted uppercase tracking-widest mb-3">Supplement finder</div>
          <h1 className="font-display font-bold text-4xl tracking-tight mb-4">
            {goal ? `Supplements for ${GOAL_TOPIC[goal.id]}` : "Find a supplement that fits"}
          </h1>
          <p className="text-muted text-lg leading-relaxed">
            Answer a few questions and see the best-scoring supplements in Pello&apos;s database for your goal, with the evidence behind each one. Free, and no account needed.
          </p>
        </div>

        <form method="get" action="/supplement-finder" className="card space-y-6 mb-12">
          <fieldset>
            <legend className="font-display font-semibold mb-3">What&apos;s your main goal?</legend>
            <div className="flex flex-wrap gap-2">
              {FINDER_GOALS.map((g) => <Choice key={g.id} type="radio" name="goal" value={g.id} checked={inputs?.goal === g.id} label={g.label} />)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-display font-semibold mb-1">Are you drug tested?</legend>
            <p className="text-xs text-muted mb-3">Only show products tested for banned substances by NSF Certified for Sport, Informed Sport or Cologne List.</p>
            <Choice type="checkbox" name="tested" value="1" checked={!!inputs?.tested} label="Yes, I'm drug tested" />
          </fieldset>
          <fieldset>
            <legend className="font-display font-semibold mb-3">Any dietary needs?</legend>
            <div className="flex flex-wrap gap-2">
              {FINDER_DIETS.map((d) => <Choice key={d.id} type="checkbox" name="diet" value={d.id} checked={!!inputs?.diets.includes(d.id)} label={d.label} />)}
            </div>
          </fieldset>
          <fieldset>
            <legend className="font-display font-semibold mb-3">Anything to avoid?</legend>
            <Choice type="checkbox" name="nocaffeine" value="1" checked={!!inputs?.noCaffeine} label="No caffeine or other stimulants" />
          </fieldset>
          <button type="submit" className="btn-primary">Show supplements</button>
        </form>

        {inputs && (
          <section aria-labelledby="results">
            <h2 id="results" className="font-display font-bold text-2xl mb-2">
              {results.length ? `Top ${results.length} for ${GOAL_TOPIC[goal!.id]}` : "No matches"}
            </h2>
            <p className="text-sm text-muted mb-6 leading-relaxed">
              {results.length
                ? "Ranked by Pello Score, which weighs the evidence for each ingredient, label transparency, value, athlete reviews and testing. At most two per brand."
                : "Nothing in Pello's database matches all of those answers. Try removing a filter."}
            </p>
            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-8 mb-10">
                {results.map((r) => <Result key={r.product.id} r={r} />)}
              </div>
            )}
            <div className="card bg-moss/5 border-moss/20">
              <p className="font-display font-semibold mb-1">Want a full daily plan?</p>
              <p className="text-sm text-muted mb-3 leading-relaxed">
                The supplement stack planner builds a morning, training and evening protocol across your goals, accounting for what you already take and your budget.
              </p>
              <Link href="/quiz?mode=supplement-stack" className="text-sm text-moss hover:underline">Build my supplement stack · Pello Pro</Link>
            </div>
          </section>
        )}

        <p className="text-xs text-muted leading-relaxed mt-12">
          This is general information, not medical advice. Supplements can interact with medications and health conditions, so check with your doctor or pharmacist before starting one, especially if you take prescription medicine, are pregnant or have a health condition. See <Link href="/methodology" className="underline">how Pello Scores work</Link>.
        </p>
      </div>
    </div>
  );
}

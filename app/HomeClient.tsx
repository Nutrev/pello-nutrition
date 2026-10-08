"use client";

import Link from "next/link";
import {
  TopPicks, FromTheBlog, FuelCalculator, HeadToHead, PlanCallToAction,
  type PickGroup, type PostTeaser, type HeadToHeadData,
} from "./HomeSections";

interface HomeProps {
  pickGroups: PickGroup[];
  posts: PostTeaser[];
  headToHead: HeadToHeadData | null;
  productCount: number;
  reviewTotal: number;
}

export default function HomeClient({ pickGroups, posts, headToHead, productCount, reviewTotal }: HomeProps) {
  return (
    <div className="min-h-screen">

      {/* Hero: one message and one action, "Build my plan". */}
      <section className="max-w-2xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="font-display font-bold text-4xl sm:text-6xl leading-[1.05] tracking-tight mb-5">
          <span className="block">Fuel smarter.</span>
          <span className="block">Perform better.</span>
        </h1>
        <p className="text-muted text-lg leading-relaxed max-w-lg mx-auto mb-8">
          Independent nutrition plans and product analysis for endurance athletes — backed by science, not brand partnerships.
        </p>
        <Link href="/quiz" className="btn-primary w-full sm:w-auto justify-center inline-flex text-base px-8 py-3.5">
          Build my plan →
        </Link>
        <div className="mt-4">
          <Link href="/products" className="text-sm text-muted hover:text-ink transition-colors">
            or browse {productCount} products →
          </Link>
        </div>

        <p className="text-xs text-muted uppercase tracking-wider sm:tracking-widest mt-10 flex flex-wrap justify-center gap-x-2 gap-y-1">
          <span className="whitespace-nowrap">Independent</span><span aria-hidden="true">·</span>
          <span className="whitespace-nowrap">Science-backed</span><span aria-hidden="true">·</span>
          <span className="whitespace-nowrap">No brand partnerships</span>
        </p>

        <div className="mt-12">
          <h2 className="font-display font-semibold text-xl mb-2">For runners, cyclists and triathletes, at every level</h2>
          <p className="text-muted text-sm leading-relaxed max-w-lg mx-auto">
            Whether it&apos;s your first 10k, a century ride or your tenth Ironman, tell us about your training and we&apos;ll build
            a personalized nutrition plan — what to eat before, during and after. No jargon, no guesswork.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-20 space-y-16">
        <TopPicks groups={pickGroups} productCount={productCount} />
        <FromTheBlog posts={posts} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FuelCalculator />
          {headToHead && <HeadToHead data={headToHead} />}
        </div>

        {/* Stats, kept but moved below the content */}
        <div className="border-y border-sand py-5 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="font-display font-semibold text-2xl">{reviewTotal.toLocaleString()}</div>
            <div className="text-muted text-xs mt-0.5">Customer reviews at The Feed</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">{productCount}</div>
            <div className="text-muted text-xs mt-0.5">Products tracked</div>
          </div>
          <div>
            <div className="font-display font-semibold text-2xl">100%</div>
            <div className="text-muted text-xs mt-0.5">Editorially independent</div>
          </div>
        </div>

        <PlanCallToAction />
      </div>
    </div>
  );
}

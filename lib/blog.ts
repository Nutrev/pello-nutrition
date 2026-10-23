// lib/blog.ts
// Blog posts stored directly in TypeScript — no filesystem reading needed

// A source the article relies on. Each one is checked against PubMed (or the publisher) before it's
// added: title, authors, journal and year exactly as listed there. Linked by DOI, else PubMed.
export interface Reference {
  text: string;   // "Kreider RB, et al. Title. Journal. 2017;14:18."
  doi?: string;
  pmid?: string;
  url?: string;   // for sources with neither (e.g. a governing body's document)
}

// Placeholder text ("TODO: author name") counts as not set: the page falls back to the
// organisation byline and shows no reviewer line until a real name is filled in.
export const isPlaceholder = (s?: string) => !s || /^TODO\b/i.test(s.trim());

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  category: string;
  tags: string[];
  relatedProducts: string[];
  content: string;
  readingTime: number;
  // Optional cover photo, e.g. { src: "/blog/marathon.jpg", alt: "..." } with the file in
  // public/blog/. Posts without one get a drawn cover for their category.
  image?: { src: string; alt: string };
  // Optional product pack shots shown side by side on the cover (a comparison's two
  // products, say), files in public/blog/. Used when there's no cover photo.
  packshots?: { src: string; alt: string }[];
  // Shown as the large featured card at the top of the blog page.
  startHere?: boolean;
  // Last substantive update (YYYY-MM-DD), shown as "Updated …" beside the publish date.
  updated?: string;
  // A named author and an optional reviewer, e.g. { name: "…", credential: "RD" }. Placeholders
  // (see isPlaceholder) are hidden on the page until filled in.
  authorName?: string;
  reviewer?: { name: string; credential: string };
  references?: Reference[];
  // Share image override (a path in public/ or a full URL). Without one, a branded image with the
  // title is generated at /og/blog/[slug].
  ogImage?: string;
  // Not published yet: hidden from the blog, home page and sitemap, and its page 404s in
  // production. It still shows in local development (npm run dev) for previewing, with a banner.
  draft?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "lactate-gels-endurance-athletes",
    title: "Lactate Gels for Endurance Athletes",
    description: "What lactate gels are supposed to do, what the research shows, how to take them, and the proven gels we'd pick instead, based on independent Pello Scores.",
    date: "2026-10-23",
    author: "Pello Nutrition",
    authorName: "Ethan",
    category: "Science",
    tags: ["lactate", "energy gels", "fueling", "supplements"],
    relatedProducts: ["sis-beta-fuel-gel", "maurten-gel-160", "enervit-tadej-secret-gel"],
    readingTime: 6,
    // Draft until the open points are settled: reference 3 and 5 details, and the claims flagged in review.
    draft: true,
    references: [
      { text: "Ewell TR, Bomar MC, Brown DM, Brown RL, Kwarteng BS, Thomson DP, et al. The influence of acute oral lactate supplementation on responses to cycle ergometer exercise: a randomized, crossover pilot clinical trial. Nutrients. 2024;16(16):2624.", doi: "10.3390/nu16162624", pmid: "39203761" },
      { text: "Bordoli C, Varley I, Sharpe GR, Johnson MA, Hennis PJ. Effects of oral lactate supplementation on acid-base balance and prolonged high-intensity interval cycling performance. J Funct Morphol Kinesiol. 2024;9(3):139.", doi: "10.3390/jfmk9030139", pmid: "39189224" },
      { text: "Seike K, Takahashi Y, Hatta H. Effects of acute oral lactate supplementation on energy metabolism in humans. J Phys Fit Sports Med. 2026;15(3):73-81.", doi: "10.7600/jpfsm.2025.002" },
      { text: "Brooks GA. The science and translation of lactate shuttle theory. Cell Metab. 2018;27(4):757-85.", doi: "10.1016/j.cmet.2018.03.008", pmid: "29617642" },
      { text: "Enervit C2:1PRO Lactate Gel Mix product details and directions, The Feed. Price from Velo." },
    ],
    content: `Lactate gels are the newest fuel in the pro peloton, and the hype is well ahead of the evidence. UAE Team Emirates-XRG used Enervit's lactate gel mix at the 2026 Tour de France, and other teams have been trialling ExoLactate gels. The theory is sound, but no controlled study has shown a lactate gel makes you faster, quite yet.

Here's how lactate is supposed to work, what the research shows, and whether it's worth paying for.

## How lactate is supposed to work

Lactate isn't a waste product. Your muscles, heart and brain burn it as fuel, and your body makes and clears large amounts of it during hard exercise. This idea, called the lactate shuttle, comes from decades of work by physiologist George Brooks.

**The pitch for lactate gels:**

- **A third fuel route:** glucose and fructose use their own gut transporters. Lactate is absorbed and burned through a different path, so in theory, while you reach a carb cap, lactate as an energy source allows you to take in more total energy per hour.
- **Sparing glycogen:** if muscles burn ingested lactate, they may use less stored carbohydrate, which could help late in long races.
- **A mild buffer:** lactate is usually taken as a sodium or calcium salt, which can nudge blood chemistry the way [bicarb](/blog/sodium-bicarbonate-endurance-athletes) does, but more gently.

## What the research shows

The research is small and mixed. There are no published trials of the gels the pros are using.

- **Lactate is used as fuel:** a 2025 University of Tokyo study confirmed that ingested lactate is burned during exercise. It didn't show a performance gain.
- **A small time-trial bump:** in a 2024 trial of 15 recreational exercisers, low-dose lactate capsules raised average power in a 20-minute cycling time trial by about 4% (204 vs 197 watts). There was no change in VO2max or lactate threshold, and 4 of the 15 got slower. The authors called it a pilot result.
- **Buffering without speed:** another 2024 trial of calcium lactate (about 8g for a 70kg rider) raised blood bicarbonate and lowered perceived effort, but didn't improve time-trial times.
- **Lactate in carb drinks:** older studies adding lactate to carbohydrate drinks found no consistent improvement in time to exhaustion.

Compare that with carbohydrate fueling at 60–120g per hour, which is backed by dozens of trials. Lactate is promising theory with very little proof so far.

## How to take them

There's no evidence-based protocol yet, so follow the label.

- **Enervit C2:1PRO Lactate Gel Mix:** one 130ml pouch (90g carbs, 10g lactate) mixed into 500–750ml of water. Enervit says to sip it during the final 1–2 hours of a hard race or session, one pouch per event.
- **Keep your carbs up:** a lactate gel adds to your normal fueling plan. It doesn't replace it.
- **Test it in training first,** and never try it for the first time on race day.

## Some drawbacks

- **Price:** Enervit's mix is about $10 a serving ($40 for four), more than twice the cost of a high-carb gel. We expect this to come down in the coming years, but no doubt a barrier for adoption.
- **Stomach sensitivity:** like bicarb, lactate salts can cause gut distress, and it gets worse with higher doses.
- **A lot of sodium:** one Enervit pouch has 2,050mg of sodium. That's useful in the heat, but count it in your total consumption.
- **Hard to find:** the lactate gels available right now are from SantaMadre and Enervit. Enervit's mix is sold through The Feed in the US. ExoLactate didn't ship to the US at the time of writing.

Personally, I am super intrigued by the introduction of lactate gels. I first heard of them this season, 2026, while watching Pogačar manhandle the peloton. While I can't imagine this has been the reason for his dominance, the science certainly supports a ton of upside for the incorporation of lactate gels into the greater nutrition protocol.

## Our picks

Pello doesn't score any lactate gels yet. Until there's evidence, the best way to spend the money is on proven high-carb gels. These are three high-scoring gels we track, from Pello's product reports. If you want to try lactate anyway, the options available are SantaMadre and Enervit's C2:1PRO Lactate Gel Mix. We'll score them once there's enough data.

[[disclosure]]

| Pick | Product | Pello Score | Price per gel | Why |
| --- | --- | --- | --- | --- |
| Best overall | [SiS Beta Fuel Gel](/report/sis-beta-fuel-gel) | {{score:sis-beta-fuel-gel}} ({{grade:sis-beta-fuel-gel}}) | {{pps:sis-beta-fuel-gel}} | {{carbs:sis-beta-fuel-gel}} of carbs, {{rating:sis-beta-fuel-gel}}/5 from over 1,300 reviews, and a third of the price of a lactate serving. |
| Gut comfort | [Maurten Gel 160](/report/maurten-gel-160) | {{score:maurten-gel-160}} ({{grade:maurten-gel-160}}) | {{pps:maurten-gel-160}} | Rated {{rating:maurten-gel-160}}/5 by athletes. Simple ingredients that are easy on the stomach. |
| The Pogačar gel without the lactate | [Enervit Tadej Secret Gel](/report/enervit-tadej-secret-gel) | {{score:enervit-tadej-secret-gel}} ({{grade:enervit-tadej-secret-gel}}) | {{pps:enervit-tadej-secret-gel}} | Same brand as the lactate mix. {{carbs:enervit-tadej-secret-gel}} of carbs, {{dose:enervit-tadej-secret-gel:Caffeine}} caffeine, Cologne List tested. |

[[products:sis-beta-fuel-gel|Best overall;maurten-gel-160|Gut comfort;enervit-tadej-secret-gel|Pogačar gel, no lactate]]

## The bottom line

Lactate gels are an interesting idea with pro-level buzz and almost no proof. The best study so far found a small gain in a 20-minute time trial and no change in fitness markers. At $10 a serving, that's a lot to pay for a maybe.

For now, hit 60–120g of carbs per hour with a proven gel. If you're curious, test a lactate mix in training before a key race. Expect to see it on Pello once real trials catch up with the marketing.`,
  },
  {
    slug: "beet-broccoli-shots-endurance-athletes",
    image: { src: "/blog/beet-broccoli-shots.jpg", alt: "Rows of beet and broccoli shot bottles with blank labels and metal caps" },
    title: "Broccoli and Beet Shots for Endurance Athletes",
    description: "What beet and broccoli shots do, what the research says, how to take them, and the products we'd pick, based on independent Pello Scores.",
    date: "2026-10-19",
    author: "Pello Nutrition",
    authorName: "Ethan",
    category: "Science",
    tags: ["beet", "nitrate", "broccoli", "sulforaphane", "supplements"],
    relatedProducts: ["beet-it-sport-nitrate-shot", "sis-go-nitrates-shot", "beet-it-sport-nitrate-gel", "amacx-beet-shot", "nomio-broccoli-shot"],
    readingTime: 5,
    references: [
      { text: "Jones AM. Dietary nitrate supplementation and exercise performance. Sports Med. 2014;44 Suppl 1:S35-45.", doi: "10.1007/s40279-014-0149-y", pmid: "24791915" },
      { text: "Maughan RJ, Burke LM, Dvorak J, Larson-Meyer DE, Peeling P, Phillips SM, et al. IOC consensus statement: dietary supplements and the high-performance athlete. Br J Sports Med. 2018;52(7):439-55.", doi: "10.1136/bjsports-2018-099027", pmid: "29540367" },
      { text: "Flockhart M, Nilsson LC, Tillqvist EN, Vinge F, Millbert F, Lännerström J, et al. Glucosinolate-rich broccoli sprouts protect against oxidative stress and improve adaptations to intense exercise training. Redox Biol. 2023;67:102873.", doi: "10.1016/j.redox.2023.102873", pmid: "37688976" },
    ],
    content: `Beet shots have solid evidence behind them for endurance performance. Broccoli shots are more promising than proven, and the sheer amount of broccoli pressed into a 2oz bottle is worth a double take. Both have moved from health-food shelves into race kits, and they're often sold in tandem, but they work in completely different ways.

Here's what each one does, what the research says, how to use them, and the products we'd pick based on the independent Pello Scores.

## Beet shots: the one with real evidence

Beet shots work because beetroot is rich in dietary nitrate. Your body converts nitrate to nitric oxide, which helps blood vessels widen and makes muscles more efficient. In practice, you use slightly less oxygen at the same pace.

**What the research shows:**

- **Efficiency:** nitrate can lower the oxygen cost of steady exercise and improve endurance, especially in recreational athletes.
- **Who benefits most:** the effect is smaller and less consistent in highly trained athletes.
- **Effective dose:** studies typically use about 300–550mg of nitrate, roughly one concentrated shot.

**How to take it:**

- **Timing:** about 2–3 hours before your session or race, when nitrite, which your body makes from nitrate, peaks in the blood.
- **Loading:** some athletes take a shot daily for several days before a key race.
- **Test it in training first,** like any race-day product.

**The drawbacks:**

- **Pink urine:** beets can turn urine and stools red or pink. It's harmless but alarming if you don't expect it.
- **Stomach upset:** concentrated shots can upset some stomachs.
- **Mouthwash cancels it out:** bacteria in your mouth help convert nitrate, so antibacterial mouthwash can blunt the effect.
- **Check the dose:** many beet powders contain far less nitrate than a concentrated shot. Look for the nitrate amount on the label, not just "beetroot."

Personally, while I've not yet leaned into shot format, I do incorporate beets into my dinner ~three days out from a major event. Given the ease of the shot, I'll likely be transferring to said format in 2027.

## Broccoli shots: promising, not proven

Broccoli shots are made from broccoli sprout extract, which is rich in sulforaphane. Sulforaphane switches on the body's own antioxidant defenses. The idea is that this helps you handle the oxidative stress of hard training.

**What the research shows:** small studies suggest sulforaphane may lower lactate or oxidative stress during exercise. But the evidence in athletes is still early, with few studies and small groups. There's no agreed dose for performance yet.

**How to take it:** follow the label. Because there's no performance protocol yet, there's no evidence-based timing to recommend.

**The drawbacks:**

- **Weak evidence:** this is a "maybe," not a "proven." Pello's science score reflects that.
- **Price:** shots run around $7 each, which adds up quickly for an unproven benefit.
- **Taste:** many people find broccoli extract bitter or sulfurous.

Broccoli shots are super interesting to me due to the sheer amount of vegetable packed into the 2oz bottle. Nomio's data estimates ~6lbs of broccoli in their product.

## Our picks

Our favorite beet shot is [Beet It Sport Nitrate 400](/report/beet-it-sport-nitrate-shot), the highest-scoring nitrate product we track. Scores and prices are from Pello's product reports.

[[disclosure]]

| Pick | Product | Pello Score | Price per serving | Why |
| --- | --- | --- | --- | --- |
| Best beet shot | [Beet It Sport Nitrate 400 Shot](/report/beet-it-sport-nitrate-shot) | {{score:beet-it-sport-nitrate-shot}} ({{grade:beet-it-sport-nitrate-shot}}) | {{pps:beet-it-sport-nitrate-shot}} | Informed Sport tested, organic, strong science score. No major weaknesses. |
| Also tested for sport | [SiS GO Nitrates Shot](/report/sis-go-nitrates-shot) | {{score:sis-go-nitrates-shot}} ({{grade:sis-go-nitrates-shot}}) | {{pps:sis-go-nitrates-shot}} | Informed Sport tested and slightly cheaper. Nitrate amount isn't listed on our report. |
| Nitrate in a gel | [Beet It Sport Nitrate Energy Gel](/report/beet-it-sport-nitrate-gel) | {{score:beet-it-sport-nitrate-gel}} ({{grade:beet-it-sport-nitrate-gel}}) | {{pps:beet-it-sport-nitrate-gel}} | {{carbs:beet-it-sport-nitrate-gel}} of carbs plus nitrate, Informed Sport tested. Pricey. |
| Higher dose | [Amacx Beet Shot](/report/amacx-beet-shot) | {{score:amacx-beet-shot}} ({{grade:amacx-beet-shot}}) | {{pps:amacx-beet-shot}} | {{dose:amacx-beet-shot:Nitrates}} of nitrate per shot, plus {{carbs:amacx-beet-shot}} of carbs. No banned-substance testing. |
| Broccoli shot | [Nomio Broccoli Sprout Shot](/report/nomio-broccoli-shot) | {{score:nomio-broccoli-shot}} ({{grade:nomio-broccoli-shot}}) | {{pps:nomio-broccoli-shot}} | The only broccoli shot we track. Well rated by users ({{rating:nomio-broccoli-shot}}/5), Cologne List tested, but weak science score. |

[[products:beet-it-sport-nitrate-shot|Best beet shot;sis-go-nitrates-shot|Also tested for sport;beet-it-sport-nitrate-gel|Nitrate in a gel;amacx-beet-shot|Higher dose;nomio-broccoli-shot|Broccoli shot]]

If you're drug tested, stick to the Informed Sport options: Beet It and SiS.

## The bottom line

Beet shots are worth trying if you're a recreational or age-group athlete. Take one about 2–3 hours before a key session, check the label for 300–550mg of nitrate, and test it in training first. Our pick is [Beet It Sport Nitrate 400](/report/beet-it-sport-nitrate-shot).

Broccoli shots are interesting but still unproven. If you enjoy them, they're unlikely to hurt. Anecdotally, people seem to feel a benefit, but don't expect a measurable performance boost quite yet.`,
  },
  {
    slug: "sodium-bicarbonate-endurance-athletes",
    image: { src: "/blog/bicarb-products.jpg", alt: "Flycarb Energy Mix and Bicarb Mix sachets beside a Bicarb jar, Carb Matrix packet and Performance Beadlets sachet" },
    title: "Sodium Bicarbonate for Endurance Athletes: Does Bicarb Work?",
    description: "What bicarb is, what the research says it does, the drawbacks, how to take it, and the bicarb product we'd pick, based on independent Pello Scores.",
    date: "2026-10-13",
    author: "Pello Nutrition",
    category: "Science",
    tags: ["bicarb", "sodium bicarbonate", "performance", "supplements"],
    relatedProducts: ["flycarb-bicarb", "carbs-fuel-bicarb", "powerbank-nutrition-bicarb-arc", "bicarb-3-0", "maurten-bicarb-system"],
    readingTime: 7,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Grgic J, Pedisic Z, Saunders B, Artioli GG, Schoenfeld BJ, McKenna MJ, et al. International Society of Sports Nutrition position stand: sodium bicarbonate and exercise performance. J Int Soc Sports Nutr. 2021;18(1):61.", doi: "10.1186/s12970-021-00458-w", pmid: "34503527" },
      { text: "Carr AJ, Hopkins WG, Gore CJ. Effects of acute alkalosis and acidosis on performance: a meta-analysis. Sports Med. 2011;41(10):801-14.", doi: "10.2165/11591440-000000000-00000", pmid: "21923200" },
      { text: "Christensen PM, Shirai Y, Ritz C, Nordsborg NB. Caffeine and bicarbonate for speed. A meta-analysis of legal supplements potential for improving intense endurance exercise performance. Front Physiol. 2017;8:240.", doi: "10.3389/fphys.2017.00240", pmid: "28536531" },
      { text: "Shannon ES, Regnier A, Dobson B, Yang X, Sparks SA, Mc Naughton LR. The effect of sodium bicarbonate mini-tablets ingested in a carbohydrate hydrogel system on 40 km cycling time trial performance and metabolism in trained male cyclists. Eur J Appl Physiol. 2024;124(12):3671-82.", doi: "10.1007/s00421-024-05567-3", pmid: "39068627" },
      { text: "Gough LA, Sparks SA. The effects of a carbohydrate hydrogel system for the delivery of bicarbonate mini-tablets on acid-base buffering and gastrointestinal symptoms in resting well-trained male cyclists. Sports Med Open. 2024;10(1):17.", doi: "10.1186/s40798-024-00684-x", pmid: "38356036" },
      { text: "U.S. Anti-Doping Agency. Buffers and anti-doping rules: what athletes should know about sodium bicarbonate. USADA.", url: "https://www.usada.org/?p=95015" },
    ],
    content: `Bicarb has gone from a niche track trick to something you'll see in pro cycling team buses and distance runners' race kits. It's also one of the few supplements with strong research behind it. But it comes with a real catch, and it's not useful for every event. Here's what it is, what it does, and which product we'd pick.

## What is bicarb?

Bicarb is sodium bicarbonate, the same compound as baking soda. Taken in large enough doses before exercise, it raises the amount of bicarbonate in your blood.

That matters because hard efforts produce acid. As acid builds up in working muscles, they fatigue faster. Bicarbonate is one of your body's natural buffers. Raising blood bicarbonate gives your body more capacity to clear that acid, so you can hold a hard effort a little longer.

Sports supplements simply package the right dose in a more convenient, and ideally more stomach-friendly, form than a spoonful of baking soda.

## What's the benefit?

The research is strong. The International Society of Sports Nutrition (ISSN) reviewed the evidence in its 2021 position stand and concluded that bicarb improves performance in high-intensity efforts lasting roughly 30 seconds to 12 minutes. That holds for cycling, running, swimming, rowing and combat sports, for both single and repeated efforts, and for both men and women.

A meta-analysis of 38 studies estimated an average improvement of about 1.7% in mean power in a 1-minute sprint (Carr 2011), and a second meta-analysis found a small but clear benefit in performance tests lasting 45 seconds to 8 minutes (Christensen 2017). That's small on paper, but at the sharp end of a race it's a big margin.

Where it helps most:

- Track and middle-distance running, from 800m to 5,000m.
- Short time trials, pursuits and hill climbs.
- Racing with repeated surges, like crit racing, cyclocross and the decisive attacks in a road race.
- Rowing, swimming and other events decided by a few minutes of all-out work.

Where the evidence is weaker: long, steady events like the marathon or a long road race, where acid build-up is rarely what limits you. Research on newer products has started to look at longer efforts. A 2024 study found 14 trained male cyclists completed a 40km time trial about 54 seconds faster with [Maurten's bicarb system](/report/maurten-bicarb-system) than with a placebo (Shannon 2024). One of its authors is affiliated with Maurten. That study was small, and the evidence for long endurance events is still thin.

## The drawbacks

**Stomach upset is the big one.** The effective dose is large, and the most common side effects are bloating, nausea, abdominal pain, diarrhea and, sometimes, vomiting. For some athletes, these cancel out the benefit entirely, or worse. A bad reaction on race morning can ruin your day.

Newer products try to fix this with enteric-coated capsules, which pass through the stomach before releasing, or by delivering the bicarb inside a carbohydrate gel. In one head-to-head study of 12 well-trained male cyclists at rest, bicarb delivered in a carbohydrate hydrogel caused much less stomach discomfort than the same dose in plain capsules (Gough 2024). The studies so far are small and mostly in male cyclists.

**It's a lot of sodium.** Sodium bicarbonate is about 27% sodium by weight. A typical dose for a 70kg athlete, around 21g, contains roughly 5.7g of sodium. If you have high blood pressure, kidney problems or are on a sodium-restricted diet, talk to your doctor before trying bicarb.

**It's not useful for every event.** If your race is a steady marathon or a long road race, bicarb is unlikely to be what makes the difference. Carbs and hydration matter far more.

**It's expensive.** Branded bicarb products can cost {{pps:bicarb-3-0}}–{{pps:maurten-bicarb-system}} per dose. That adds up if you use it for training as well as racing.

## How to take it

- **Dose:** about 0.3g per kg of body weight. That's 21g for a 70kg athlete. The ISSN position stand covers 0.2–0.5g/kg, with 0.3g/kg as the best balance of benefit and side effects.
- **Timing:** 60–180 minutes before your event. Taking it closer to the 180-minute end, with a carb-rich meal, can help reduce stomach upset.
- **Ease stomach upset:** the ISSN suggests a smaller dose (0.2–0.3g/kg), taking it around 180 minutes before, with a high-carbohydrate meal, or in enteric-coated capsules (Grgic 2021).
- **Multi-day option:** for stage races or heat-and-final events, a loading approach of 0.4–0.5g/kg per day, split across meals for 3–7 days, can work without needing a big dose on race morning.
- **Test it in training first.** Try it before a hard interval session, at the dose and timing you plan to race with. Race day is not the time to try bicarb for the first time.

Oral bicarb is not on the World Anti-Doping Agency's prohibited list (USADA). But if you're drug tested, choose a product that's batch-tested for banned substances, because the risk with any supplement is contamination.

## Our pick

We track five bicarb products. Here's how they compare.

[[disclosure]]

### Our favorite: Flycarb Bicarb

Pello Score: {{score:flycarb-bicarb}} ({{grade:flycarb-bicarb}}) · {{pps:flycarb-bicarb}} per serving · {{rating:flycarb-bicarb}}/5 from {{reviews:flycarb-bicarb}}

[[product:flycarb-bicarb]]

Flycarb is the only bicarb product we track that's Informed Sport certified, meaning every batch is tested for banned substances. It earns a perfect science score, comes in sizes matched to body weight, and has by far the most athlete reviews of any bicarb product we track. The trade-off is price: at about {{pergram:flycarb-bicarb}} per gram of bicarbonate, it's one of the most expensive options. For anyone who's drug tested, it's the clear choice.

### Best value: Carbs Fuel Bicarb

Pello Score: {{score:carbs-fuel-bicarb}} ({{grade:carbs-fuel-bicarb}}) · {{pps:carbs-fuel-bicarb}} per pouch

[[product:carbs-fuel-bicarb]]

At {{pergram:carbs-fuel-bicarb}} per gram of bicarbonate, Carbs Fuel costs a fraction of the branded systems. It comes in {{bicarbsizes:carbs-fuel-bicarb}} sizes matched to body weight and uses enteric-coated capsules to reduce stomach upset. It has no third-party banned-substance testing and no retailer reviews yet, so it's best for athletes who aren't drug tested and want to use bicarb regularly.

### Also worth knowing

- [Powerbank Nutrition BiCarb ARC](/report/powerbank-nutrition-bicarb-arc) has the highest Pello Score of the group ({{score:powerbank-nutrition-bicarb-arc}}) and good value at {{pergram:powerbank-nutrition-bicarb-arc}} per gram. But each capsule holds just {{bicarbg:powerbank-nutrition-bicarb-arc}} of bicarbonate, so a 70kg athlete would need about 21 capsules for a full dose.
- [Bicarb 3.0](/report/bicarb-3-0) ({{score:bicarb-3-0}}, {{grade:bicarb-3-0}}) includes {{carbs:bicarb-3-0}} of carbs per sachet to help with absorption but has a weak quality score and no banned-substance testing.
- [Maurten Bicarb System](/report/maurten-bicarb-system) ({{score:maurten-bicarb-system}}, {{grade:maurten-bicarb-system}}) is the best known and has some of the most direct research behind it, including the cycling studies above. But it's the most expensive per gram at {{pergram:maurten-bicarb-system}}, and it has no listed third-party testing.

## The bottom line

Bicarb works, and the research behind it is strong. But it works for a specific job: hard efforts of roughly 30 seconds to 12 minutes, or races decided by repeated surges. If that's your event, it's worth testing. Start with about 0.3g per kg, take it 60–180 minutes before with a carb-rich meal, and try it in hard training sessions first. If you're drug tested, choose [Flycarb](/report/flycarb-bicarb). If you're not, [Carbs Fuel](/report/carbs-fuel-bicarb) gives you the same buffer for far less.`,
  },
  {
    slug: "best-energy-gels-cycling-2026",
    image: { src: "/blog/energy-gels.jpg", alt: "Energy gels from Maurten, Carbs Fuel, GU, Honey Stinger, Precision Fuel, SiS and others" },
    title: "Best Energy Gels for Cycling 2026",
    description: "We compared 15+ energy gels for cyclists. Here are the top picks across price, carbohydrate science and ingredient quality.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Reviews",
    tags: ["energy gels", "cycling", "endurance", "fueling"],
    relatedProducts: ["maurten-gel-100", "maurten-gel-100-caf-100", "sis-go-isotonic", "sis-beta-fuel-gel", "precision-fuel-pf30", "gu-roctane-gel"],
    readingTime: 6,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Jeukendrup A. A step towards personalized sports nutrition: carbohydrate intake during exercise. Sports Med. 2014;44(Suppl 1):S25-33.", doi: "10.1007/s40279-014-0148-z", pmid: "24791914" },
      { text: "Thomas DT, Erdman KA, Burke LM. American College of Sports Medicine joint position statement. Nutrition and athletic performance. Med Sci Sports Exerc. 2016;48(3):543-68.", doi: "10.1249/MSS.0000000000000852", pmid: "26891166" },
      { text: "O'Brien WJ, Stannard SR, Clarke JA, Rowlands DS. Fructose-maltodextrin ratio governs exogenous and other CHO oxidation and performance. Med Sci Sports Exerc. 2013;45(9):1814-24.", doi: "10.1249/MSS.0b013e31828e12d4", pmid: "23949097" },
      { text: "de Oliveira EP, Burini RC, Jeukendrup A. Gastrointestinal complaints during exercise: prevalence, etiology, and nutritional recommendations. Sports Med. 2014;44(Suppl 1):S79-85.", doi: "10.1007/s40279-014-0153-2", pmid: "24791919" },
      { text: "Rowe JT, King RFGJ, King AJ, Morrison DJ, Preston T, Wilson OJ, et al. Glucose and fructose hydrogel enhances running performance, exogenous carbohydrate oxidation, and gastrointestinal tolerance. Med Sci Sports Exerc. 2022;54(1):129-40.", doi: "10.1249/MSS.0000000000002764", pmid: "34334720" },
      { text: "King AJ, Rowe JT, Burke LM. Carbohydrate hydrogel products do not improve performance or gastrointestinal distress during moderate-intensity endurance exercise. Int J Sport Nutr Exerc Metab. 2020;30(5):305-14.", doi: "10.1123/ijsnem.2020-0102", pmid: "32707564" },
    ],
    content: `Energy gels are the cornerstone of endurance cycling nutrition. Get them right and you can sustain effort for hours. Get them wrong and you're dealing with GI distress, energy crashes or simply running out of fuel.

We compared 15+ gels on ingredient quality, carbohydrate science, customer ratings and price per gel. Here are the best options for cyclists in 2026.

## What makes a good energy gel?

Before getting into picks, here's what actually matters in a gel:

**Carbohydrate type and ratio.** A single carb source such as glucose can be used at up to about 60g an hour. Mixing glucose and fructose uses separate gut transporters, allowing intakes of up to about 90g an hour (Jeukendrup 2014). In one study, a fructose-to-glucose ratio of 0.8:1 was used more efficiently than 0.5:1 or 1.25:1 (O'Brien 2013).

**Dose per gel.** Most gels provide 20-30g of carbs. Guidance suggests about 60g an hour for 2-3 hours and up to about 90g an hour for longer events (Jeukendrup 2014), so gel frequency matters.

**Osmolality.** Very concentrated carbohydrate can draw water into the gut and is linked with stomach symptoms, so a review recommends taking carbs with enough water (de Oliveira 2014). Isotonic gels are designed to be taken without water.

**Ingredient cleanliness.** Some gels contain artificial preservatives, artificial sweeteners or gums. Many athletes prefer to avoid these.

## Our top picks

### Best overall: Maurten Gel 100

Maurten's hydrogel technology encapsulates carbohydrates in a gel matrix designed to pass through the stomach smoothly. Research on whether hydrogels reduce stomach problems is mixed: one study in runners found fewer GI symptoms and a faster time trial (Rowe 2022), while a review found no clear advantage over standard carb drinks (King 2020). It's rated {{rating:maurten-gel-100}} out of 5 from {{reviews:maurten-gel-100}}.

At {{carbs:maurten-gel-100}} of carbs per gel with a short six-ingredient label, it's not the most carb-dense option, but its reputation for tolerance makes it a reliable choice for long events. The main drawback is price — at {{pps:maurten-gel-100}}/gel it's among the most expensive on the market.

Best for: Cyclists who've had GI issues with other gels, long sportives and gran fondos.

### Best value: SiS GO Isotonic Energy Gel

At {{pps:sis-go-isotonic}}/gel in a box of 18, this is one of the cheapest gels we list, with a Pello Score of {{score:sis-go-isotonic}}. Each gel has {{carbs:sis-go-isotonic}} of carbs from maltodextrin, and it's isotonic, so it's designed to be taken without water. It's Informed Sport certified, vegan, and rated {{rating:sis-go-isotonic}} out of 5 from {{reviews:sis-go-isotonic}}.

It has almost no sodium, so pair it with an electrolyte drink on long or hot rides. With a single carb source it's best at moderate intakes (up to around 60g per hour) rather than race-pace fueling.

Best for: Training rides, budget-conscious athletes, high-volume use.

### Best high-carb: SiS Beta Fuel Gel

Science in Sport's Beta Fuel delivers {{carbs:sis-beta-fuel-gel}} of carbs per gel at a 1:0.8 maltodextrin:fructose ratio — one of the highest per-gel doses available — so fewer gels cover a high hourly target. It's Informed Sport certified.

Best for: High-intensity efforts, athletes pushing 80-90g carbs/hr.

### Best caffeinated: Precision Fuel PF30 CAF

{{caffeine:precision-fuel-pf30-caf}} of caffeine paired with {{carbs:precision-fuel-pf30-caf}} of carbs. Precision Fuel's modular approach — separating carbs from electrolytes — gives athletes more control over their fueling strategy.

Best for: Late-race use, sportives over 3 hours, athletes who respond well to caffeine.

### Caffeinated hydrogel: Maurten Gel 100 CAF 100

Same hydrogel formula as the standard Gel 100 but with {{caffeine:maurten-gel-100-caf-100}} of caffeine. We haven't found studies testing whether the hydrogel reduces stomach problems caused by caffeine specifically.

Best for: Athletes who get on well with Maurten Gel 100 and want a caffeinated version.

## How many gels do you need?

Carb needs depend mostly on how long you're riding. A rough guide, from the 2016 position stand from the American College of Sports Medicine, the Academy of Nutrition and Dietetics and Dietitians of Canada (Thomas 2016) and from Jeukendrup (2014):

- Under about 45 minutes: you don't need carbs.
- Around an hour: small amounts, or even a carbohydrate mouth rinse, can help.
- 1-2.5 hours: 30-60g an hour, about one to two 25g gels.
- Over about 2.5 hours: up to 90g an hour from a mix of carb types, about three 25g gels, or gels plus drink mix.

Start fueling early in the ride rather than waiting until you feel hungry.

[[pro:/quiz?mode=event|See what your race fueling costs, gel by gel]]

## The bottom line

For most cyclists, a combination of Maurten Gel 100 for GI-sensitive moments and a cheaper gel like SiS GO Isotonic for training is the most practical approach. Reserve the expensive gels for race day and key training sessions.

Use our [Pello Planner](/quiz) to get a personalized gel recommendation based on your specific event duration and intensity.`,
  },
  {
    slug: "creatine-endurance-athletes",
    title: "Creatine for Endurance Athletes — What the Science Actually Says",
    description: "What creatine does, where it might help endurance athletes, the weight trade-off, how to take it, and the creatine we'd pick on Pello's data.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Science",
    tags: ["creatine", "endurance", "supplements", "science"],
    relatedProducts: ["the-feed-lab-creatine-monohydrate", "fluid-creatine", "the-feed-lab-creatine", "momentous-creatine", "thorne-creatine"],
    readingTime: 6,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Kreider RB, Kalman DS, Antonio J, Ziegenfuss TN, Wildman R, Collins R, et al. International Society of Sports Nutrition position stand: safety and efficacy of creatine supplementation in exercise, sport, and medicine. J Int Soc Sports Nutr. 2017;14:18.", doi: "10.1186/s12970-017-0173-z", pmid: "28615996" },
      { text: "Antonio J, Candow DG, Forbes SC, Gualano B, Jagim AR, Kreider RB, et al. Common questions and misconceptions about creatine supplementation: what does the scientific evidence really show? J Int Soc Sports Nutr. 2021;18(1):13.", doi: "10.1186/s12970-021-00412-w", pmid: "33557850" },
      { text: "Hultman E, Söderlund K, Timmons JA, Cederblad G, Greenhaff PL. Muscle creatine loading in men. J Appl Physiol (1985). 1996;81(1):232-7.", doi: "10.1152/jappl.1996.81.1.232", pmid: "8828669" },
      { text: "Forbes SC, Candow DG, Neto JHF, Kennedy MD, Forbes JL, Machado M, et al. Creatine supplementation and endurance performance: surges and sprints to win the race. J Int Soc Sports Nutr. 2023;20(1):2204071.", doi: "10.1080/15502783.2023.2204071", pmid: "37096381" },
      { text: "Fernández-Landa J, Santibañez-Gutierrez A, Todorovic N, Stajer V, Ostojic SM. Effects of creatine monohydrate on endurance performance in a trained population: a systematic review and meta-analysis. Sports Med. 2023;53(5):1017-27.", doi: "10.1007/s40279-023-01823-2", pmid: "36877404" },
    ],
    content: `Creatine monohydrate is one of the most studied supplements in sport. A 2021 review by researchers from the International Society of Sports Nutrition (ISSN) counted more than 500 peer-reviewed publications on it (Antonio 2021). For strength and power athletes, the case is well established.

For endurance athletes it's less clear. Here's what the research says creatine does, where it might help, the trade-off with body weight, and which products we'd pick.

## What creatine does

Your muscles store creatine, mostly as phosphocreatine. During short, very hard efforts, phosphocreatine regenerates ATP, the molecule muscles use for energy, faster than your other energy systems can. The store is small, so it runs low within seconds of all-out work and refills during recovery.

Supplementing raises the amount of creatine in muscle, by about 20% in a classic study of loading (Hultman 1996). The ISSN's 2017 position stand says this may help explain the improvements seen in high-intensity exercise performance, and the greater training adaptations that follow (Kreider 2017).

Most endurance racing runs on aerobic metabolism, not phosphocreatine. That's why the benefit for steady endurance work is much less certain.

## Where it might help endurance athletes

**Surges and sprints.** A 2023 review argues that creatine is most likely to help in the parts of endurance races that look like sprinting: attacks, surges and finishing kicks (Forbes 2023). It found creatine increases time to exhaustion in high-intensity endurance tests, but time-trial results are mixed. Several of its authors declare ties to companies that make or sell creatine.

**Steady endurance performance: probably not.** A 2023 meta-analysis of 13 placebo-controlled studies in trained athletes found no effect of creatine monohydrate on endurance performance (Fernández-Landa 2023). For a steady time trial, marathon or long road race, there's no good evidence it will make you faster.

**Strength training.** Many endurance athletes lift in the off-season. Supporting resistance training is creatine's best-established use (Kreider 2017), so if strength work is part of your plan, that's where creatine is most likely to pay off.

**Glycogen.** The 2023 review also notes that taking creatine with carbohydrate can increase muscle glycogen (Forbes 2023). That's a plausible benefit for endurance athletes, but it hasn't been shown to improve race performance directly.

## The weight trade-off

Creatine increases body mass (Forbes 2023). Some of that is water. The ISSN review of common questions notes that water retention is the most common side effect in the first several days of supplementing, especially with a loading phase, while longer training studies haven't shown a lasting increase in body water (Antonio 2021).

Extra weight matters most when you carry it uphill. For a climber or a hilly runner, a small gain in body mass could cancel out a small gain in power. For a track cyclist or a rower, it matters less. If watts per kilogram decide your races, weigh yourself through the first few weeks and judge for yourself.

## How to take it

- **Dose:** 3–5g a day, or about 0.1g per kg of body weight (Antonio 2021).
- **Loading is optional.** 20g a day for 6 days raised muscle creatine by about 20%. 3g a day reached a similar level more slowly, over 28 days (Hultman 1996). Skipping the loading phase also avoids most of the early water gain.
- **Timing:** taking it every day matters more than when you take it.
- **Form:** creatine monohydrate, the form used in most of the research.
- **Testing:** if you're drug tested, choose a product that's NSF Certified for Sport or Informed Sport certified.

The ISSN position stand also concludes that creatine is safe and well tolerated in healthy people, in studies using up to 30g a day for 5 years (Kreider 2017).

## Our picks

These come from Pello's creatine data. Prices are The Feed's, and every pick below has a sport certification.

[[disclosure]]

### Best value: The Feed Lab Creatine Monohydrate

[[product:the-feed-lab-creatine-monohydrate]]

{{creatineg:the-feed-lab-creatine-monohydrate}} of creatine monohydrate per scoop for {{pps:the-feed-lab-creatine-monohydrate}} a serving ({{price:the-feed-lab-creatine-monohydrate}} for {{servings:the-feed-lab-creatine-monohydrate}} servings), with a Pello Score of {{score:the-feed-lab-creatine-monohydrate}}. It's NSF Certified for Sport. The Feed Lab is The Feed's own brand.

### Also great value: Fluid Creatine

[[product:fluid-creatine]]

Also {{creatineg:fluid-creatine}} a scoop at {{pps:fluid-creatine}} a serving ({{price:fluid-creatine}} for {{servings:fluid-creatine}} servings), with a Pello Score of {{score:fluid-creatine}}. It's Informed Sport certified and rated {{rating:fluid-creatine}}/5 from {{reviews:fluid-creatine}}.

### Creapure: The Feed Lab Creatine

[[product:the-feed-lab-creatine]]

Creapure is a branded creatine monohydrate. The Feed Lab Creatine lists Creapure on its label, costs {{pps:the-feed-lab-creatine}} a serving and has a Pello Score of {{score:the-feed-lab-creatine}}. It's NSF Certified for Sport and the most reviewed creatine we track: {{rating:the-feed-lab-creatine}}/5 from {{reviews:the-feed-lab-creatine}}.

### Also NSF certified

[Momentous Creatine](/report/momentous-creatine) and [Thorne Creatine](/report/thorne-creatine) are both NSF Certified for Sport, at {{pps:momentous-creatine}} and {{pps:thorne-creatine}} a serving, with Pello Scores of {{score:momentous-creatine}} and {{score:thorne-creatine}}.

### What to look for on the label

- **One ingredient.** Creatine monohydrate on its own is all you need. Blends with other ingredients cost more and make the dose harder to check.
- **The dose per serving.** Check it's 3–5g, or know how many servings make a dose.
- **A sport certification** if you're drug tested: NSF Certified for Sport or Informed Sport.

### A note on chews

Creatine chews are convenient but cost more per dose. [Momentous Creatine Chews](/report/momentous-creatine-chews) have {{creatineg:momentous-creatine-chews}} of creatine per chew, so a 5g dose costs {{creatine5g:momentous-creatine-chews}}, compared with {{creatine5g:the-feed-lab-creatine-monohydrate}} for The Feed Lab's powder.

## The bottom line

Creatine is safe, inexpensive and well studied, but its benefits are clearest for strength training and short, repeated sprints, not steady endurance. If your races are decided by surges and finishing sprints, or you lift through the off-season, 3–5g a day is a low-cost thing to try. If your events are long and steady, the evidence that it will make you faster is weak, and the extra body mass may count against you on climbs.`,
  },

  {
    slug: "maurten-vs-sis-beta-fuel",
    packshots: [
      { src: "/blog/maurten-gel-100.png", alt: "Maurten Gel 100" },
      { src: "/blog/sis-go-isotonic-gel.png", alt: "SiS GO Isotonic Energy gel" },
    ],
    title: "Maurten vs SiS Beta Fuel — Which is Better?",
    description: "Two of the most popular high-carb fueling systems compared head to head. Ingredients, GI comfort, carb density, price and who each is best for.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Comparisons",
    tags: ["maurten", "sis", "energy gels", "comparison", "carbohydrates"],
    relatedProducts: ["maurten-gel-100", "sis-beta-fuel-gel", "maurten-drink-mix-320", "sis-beta-fuel-drink"],
    readingTime: 7,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "O'Brien WJ, Stannard SR, Clarke JA, Rowlands DS. Fructose-maltodextrin ratio governs exogenous and other CHO oxidation and performance. Med Sci Sports Exerc. 2013;45(9):1814-24.", doi: "10.1249/MSS.0b013e31828e12d4", pmid: "23949097" },
      { text: "Rowlands DS, Houltham S, Musa-Veloso K, Brown F, Paulionis L, Bailey D. Fructose-glucose composite carbohydrates and endurance performance: critical review and future perspectives. Sports Med. 2015;45(11):1561-76.", doi: "10.1007/s40279-015-0381-0", pmid: "26373645" },
      { text: "Jeukendrup A. A step towards personalized sports nutrition: carbohydrate intake during exercise. Sports Med. 2014;44(Suppl 1):S25-33.", doi: "10.1007/s40279-014-0148-z", pmid: "24791914" },
      { text: "Rowe JT, King RFGJ, King AJ, Morrison DJ, Preston T, Wilson OJ, et al. Glucose and fructose hydrogel enhances running performance, exogenous carbohydrate oxidation, and gastrointestinal tolerance. Med Sci Sports Exerc. 2022;54(1):129-40.", doi: "10.1249/MSS.0000000000002764", pmid: "34334720" },
      { text: "King AJ, Rowe JT, Burke LM. Carbohydrate hydrogel products do not improve performance or gastrointestinal distress during moderate-intensity endurance exercise. Int J Sport Nutr Exerc Metab. 2020;30(5):305-14.", doi: "10.1123/ijsnem.2020-0102", pmid: "32707564" },
    ],
    content: `Maurten and Science in Sport (SiS) Beta Fuel are the two most talked-about high-performance fueling systems in endurance sport. Both are used by professional athletes. Both are backed by science. And both cost significantly more than budget alternatives.

So which one is actually better — and for whom?

## The core difference

The fundamental difference between Maurten and SiS Beta Fuel comes down to delivery mechanism and carbohydrate ratio.

Maurten uses a hydrogel system — sodium alginate reacts with stomach acid to form a gel around the carbohydrates, which Maurten says helps them pass through the stomach with less gut stress. Independent studies have found mixed results so far (Rowe 2022; King 2020).

SiS Beta Fuel uses a 1:0.8 maltodextrin to fructose ratio — refined from the older 2:1 standard. In a study of 12 cyclists, a drink with 0.8 parts fructose to 1 part glucose was used more efficiently than 0.5:1 or 1.25:1, and sprint power afterwards was higher (O'Brien 2013). A review of 14 studies found that fructose-glucose blends improved endurance performance by small to moderate amounts compared with glucose alone (Rowlands 2015). Blends like this are what allow intakes of up to about 90g an hour (Jeukendrup 2014).

They're aimed at the same problem — getting more carbs in with less gut trouble — from different angles.

## Carbohydrate density

This is where SiS Beta Fuel has a clear advantage.

- Maurten Gel 100: {{carbs:maurten-gel-100}} carbs per gel
- SiS Beta Fuel Gel: {{carbs:sis-beta-fuel-gel}} carbs per gel

For athletes pushing 80-90g carbs per hour, SiS delivers more per unit. You need 3-4 Maurten gels per hour versus 2-3 SiS Beta Fuel gels. Fewer items to carry, fewer moments to fumble with packaging mid-race.

For the drink mixes, SiS Beta Fuel drink provides {{carbs:sis-beta-fuel-drink}} of carbs per serving and Maurten Drink Mix 320 provides {{carbs:maurten-drink-mix-320}}.

## GI comfort

Both are built for gut comfort, from different angles: Maurten through its hydrogel, SiS through its 1:0.8 carb ratio. Customers rate both highly: Maurten Gel 100 is rated {{rating:maurten-gel-100}}/5 from {{reviews:maurten-gel-100}}, and SiS Beta Fuel {{rating:sis-beta-fuel-gel}}/5 from {{reviews:sis-beta-fuel-gel}}.

Gut tolerance is highly individual, so the only reliable test is trying each in training at race intensity before you commit to one on race day.

[[pro:/fueling#gut-training|Start a gut-training plan to build toward 90g per hour]]

## Ingredient cleanliness

Maurten wins here. Gel 100 has six ingredients — water, glucose, fructose, calcium carbonate, gluconic acid and sodium alginate — with no flavorings, colors, preservatives or sweeteners.

SiS Beta Fuel adds flavorings, gums (gellan and xanthan) and preservatives (sodium benzoate and potassium sorbate). These are common, approved ingredients, but some athletes prefer to avoid them.

## Price

Both are expensive. SiS Beta Fuel costs less per gram of carbohydrate.

- Maurten Gel 100: {{pps:maurten-gel-100}} a gel, {{carbs:maurten-gel-100}} of carbs = {{cpgcarb:maurten-gel-100}} per gram of carbs
- SiS Beta Fuel Gel: {{pps:sis-beta-fuel-gel}} a gel, {{carbs:sis-beta-fuel-gel}} of carbs = {{cpgcarb:sis-beta-fuel-gel}} per gram of carbs

For athletes doing high-volume training and racing, that difference adds up over a season.

## Who should use each

**Choose Maurten if:**
- You have a sensitive stomach or history of GI issues during racing and the hydrogel works for you
- You want the shortest ingredient list, with no flavorings or preservatives
- You're racing at very high intensities where gut tolerance is critical
- Budget is secondary to performance reliability

**Choose SiS Beta Fuel if:**
- You need to hit 80-90g carbs per hour and want fewer gels to carry
- You want better value per gram of carbohydrate
- Your stomach tolerates most products well

## The verdict

There's no universal winner. For athletes with cast-iron stomachs who want maximum carb density and value, SiS Beta Fuel is the better choice. For athletes who've struggled with GI issues or want the cleanest possible label, Maurten is worth the premium.

A sensible middle ground is to use both — Maurten for racing and key sessions, SiS Beta Fuel for high-volume training where cost matters.

Use the Pello Planner to get a personalized recommendation based on your specific event and goals.`,
  },

  {
    slug: "marathon-nutrition-guide",
    image: { src: "/blog/marathon-course.jpg", alt: "Map of a marathon course from start to finish" },
    startHere: true,
    title: "Marathon Nutrition Guide 2026 — What to Eat Before, During and After",
    description: "Everything you need to know about fueling a marathon — from pre-race carb loading to mid-race gel strategy and post-race recovery.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Guides",
    tags: ["marathon", "running", "race nutrition", "carb loading", "gels"],
    relatedProducts: ["maurten-gel-100", "precision-fuel-pf30", "lmnt-electrolyte-mix", "momentous-whey-isolate"],
    readingTime: 9,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Thomas DT, Erdman KA, Burke LM. American College of Sports Medicine joint position statement. Nutrition and athletic performance. Med Sci Sports Exerc. 2016;48(3):543-68.", doi: "10.1249/MSS.0000000000000852", pmid: "26891166" },
      { text: "Jeukendrup A. A step towards personalized sports nutrition: carbohydrate intake during exercise. Sports Med. 2014;44(Suppl 1):S25-33.", doi: "10.1007/s40279-014-0148-z", pmid: "24791914" },
      { text: "Guest NS, VanDusseldorp TA, Nelson MT, Grgic J, Schoenfeld BJ, Jenkins NDM, et al. International Society of Sports Nutrition position stand: caffeine and exercise performance. J Int Soc Sports Nutr. 2021;18(1):1.", doi: "10.1186/s12970-020-00383-4", pmid: "33388079" },
      { text: "Jäger R, Kerksick CM, Campbell BI, Cribb PJ, Wells SD, Skwiat TM, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.", doi: "10.1186/s12970-017-0177-8", pmid: "28642676" },
      { text: "Barnes KA, Anderson ML, Stofan JR, Dalrymple KJ, Reimel AJ, Roberts TJ, et al. Normative data for sweating rate, sweat sodium concentration, and sweat sodium loss in athletes: an update and analysis by sport. J Sports Sci. 2019;37(20):2356-66.", doi: "10.1080/02640414.2019.1633159", pmid: "31230518" },
      { text: "de Oliveira EP, Burini RC, Jeukendrup A. Gastrointestinal complaints during exercise: prevalence, etiology, and nutritional recommendations. Sports Med. 2014;44(Suppl 1):S79-85.", doi: "10.1007/s40279-014-0153-2", pmid: "24791919" },
    ],
    content: `The marathon is 26.2 miles. For most runners, it lasts long enough that the carbohydrate stored in your muscles and liver can run low before the finish. That's where nutrition becomes the difference between a strong finish and hitting the wall.

This guide covers everything you need to fuel a marathon well — from the week before to the finish line.

## The week before — carb loading

Carb loading isn't about eating pasta the night before. That's a myth that leads to heavy legs and a poor night's sleep.

Effective carb loading means raising carbohydrate intake for the last 36-48 hours before the race while reducing training volume. The goal is to top up muscle glycogen stores beyond their normal resting level.

The 2016 position stand from the American College of Sports Medicine, the Academy of Nutrition and Dietetics and Dietitians of Canada recommends 10-12g of carbohydrate per kg of body weight per day for those 36-48 hours. For a 70kg runner, that's 700-840g of carbs a day — significantly more than a typical diet.

Focus on easily digestible sources: white rice, pasta, bread, potatoes, bananas, sports drinks. Reduce fiber, fat and protein relative to normal. This reduces gut bulk and minimizes the risk of GI issues on race day.

## Race morning — the pre-race meal

Eat 2-3 hours before the start. The goal is to top up liver glycogen (which depletes overnight) without leaving food sitting in your stomach at the gun.

A good pre-race meal for a 70kg runner:
- White rice or pasta: 200g cooked (55g carbs)
- White bread or bagel: 2 slices (40g carbs)
- Banana: 1 medium (25g carbs)
- Orange juice: 250ml (26g carbs)
- Pinch of salt: sodium primer

Total: approximately 150g carbs, low fiber, low fat.

In the hour before the start, sip water or a dilute sports drink. Avoid high-fibre foods from this point.

If you're using caffeine before the race, take it about 60 minutes before the start, the timing most commonly used in research. Caffeine gum may need less time than capsules (Guest 2021). See the caffeine section below.

## During the race — gel strategy

Guidance based on event length suggests about 60g of carbs an hour for efforts of 2–3 hours, and up to about 90g an hour for longer events. Intakes that high need a mix of carb types, such as glucose and fructose (Jeukendrup 2014), and practice in training to tolerate them (de Oliveira 2014).

[[pro:/quiz?mode=event|Build this plan for your race]]

A simple gel strategy for a 4-hour marathon:

- Start fueling at 30 minutes — don't wait until you feel it
- Take 1 gel every 25-30 minutes
- Take each gel with some water, which helps avoid very concentrated carbohydrate in the stomach (de Oliveira 2014)
- Save a caffeinated gel for miles 18-20 when fatigue sets in

For a 4-hour race you'll need approximately 8-10 gels depending on carb content. Pack more than you think you need.

**Sodium matters.** In one large dataset, endurance athletes lost about 1,190mg of sodium an hour on average, with a wide range between individuals (Barnes 2019). You don't need to replace all of it, and drinking far beyond thirst raises the risk of low blood sodium. If you're only taking gels, you may be getting very little sodium. See [our sodium guide](/blog/sodium-endurance-athletes) for how to estimate your own needs. Sodium loss may play a part in late-race cramping for some runners, but cramps have several causes.

## The wall — and how to avoid it

Hitting the wall is glycogen depletion. It happens when you've burned through your stored carbohydrates and your body switches to fat oxidation — a much slower fuel source.

The wall is avoidable with two things:

First, start fueling early and consistently, rather than trying to catch up late in the race.

Second, pace correctly. Running faster burns carbohydrate faster, so going out too fast in the early miles uses glycogen you'll want later.

## Post-race recovery

Eat soon after you finish. The post-race window is wider than often claimed, but your glycogen is low after a marathon and starting early helps recovery.

- Within about an hour: 20-40g of protein (Jäger 2017) plus fast carbs. Chocolate milk is a convenient way to get both. If you're training hard again within about 8 hours, the 2016 position stand recommends 1.0-1.2g of carbohydrate per kg of body weight per hour for the first 4 hours.
- Within 2 hours: a proper meal with protein, carbs and vegetables.
- That evening: prioritize sleep and keep eating carbohydrate to restore your glycogen.

Don't skip the post-race meal because you feel nauseous. Start small with liquid nutrition if needed — a protein shake, a banana, sports drink — and build from there.

## Caffeine strategy

Caffeine is one of the best-supported performance aids in sport. The ISSN's position stand finds its most consistent benefits in aerobic endurance exercise (Guest 2021).

Options:
- Single dose: 3-6mg per kg of body weight (about 200-400mg for a 70kg runner), most commonly taken about 60 minutes before the start (Guest 2021)
- Split dose: a smaller dose before the race plus a caffeinated gel at mile 18-20. Lower doses, around 1-3mg per kg, also appear to improve performance (Guest 2021)
- Progressive: caffeine-free gels early, caffeinated gels from halfway

If you're not a regular caffeine user, start with a lower dose and test in training first. Responses to caffeine vary between individuals (Guest 2021).

## Practice everything in training

The single most important piece of advice in this guide: practice your race nutrition in training. Long runs are dress rehearsals for your gut as much as your legs.

Take gels at race pace. Drink from cups while running. Test your pre-race meal. Try your caffeine strategy. Everything that goes into your body on race day should have been tested at least twice in training.

Race day is not the time to try a new gel.`,
  },

  {
    slug: "sodium-endurance-athletes",
    title: "How Much Sodium Do You Need for Endurance Sport?",
    description: "How much sodium you lose in sweat, how much to take, hyponatremia, cramps, and the electrolyte products we track, grouped by sodium per serving.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Science",
    tags: ["sodium", "electrolytes", "hydration", "endurance", "cramping"],
    relatedProducts: ["lmnt-electrolyte-mix", "precision-fuel-hydration-tablets", "skratch-sport-hydration", "saltstick-fastchews"],
    readingTime: 6,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Baker LB, Barnes KA, Anderson ML, Passe DH, Stofan JR. Normative data for regional sweat sodium concentration and whole-body sweating rate in athletes. J Sports Sci. 2016;34(4):358-68.", doi: "10.1080/02640414.2015.1055291", pmid: "26070030" },
      { text: "Barnes KA, Anderson ML, Stofan JR, Dalrymple KJ, Reimel AJ, Roberts TJ, et al. Normative data for sweating rate, sweat sodium concentration, and sweat sodium loss in athletes: an update and analysis by sport. J Sports Sci. 2019;37(20):2356-66.", doi: "10.1080/02640414.2019.1633159", pmid: "31230518" },
      { text: "Baker LB. Sweating rate and sweat sodium concentration in athletes: a review of methodology and intra/interindividual variability. Sports Med. 2017;47(Suppl 1):111-28.", doi: "10.1007/s40279-017-0691-5", pmid: "28332116" },
      { text: "Tiller NB, Roberts JD, Beasley L, Chapman S, Pinto JM, Smith L, et al. International Society of Sports Nutrition position stand: nutritional considerations for single-stage ultra-marathon training and racing. J Int Soc Sports Nutr. 2019;16(1):50.", doi: "10.1186/s12970-019-0312-9", pmid: "31699159" },
      { text: "American College of Sports Medicine; Sawka MN, Burke LM, Eichner ER, Maughan RJ, Montain SJ, Stachenfeld NS. American College of Sports Medicine position stand. Exercise and fluid replacement. Med Sci Sports Exerc. 2007;39(2):377-90.", doi: "10.1249/mss.0b013e31802ca597", pmid: "17277604" },
      { text: "McCubbin AJ, Allanson BA, Caldwell Odgers JN, Cort MM, Costa RJS, Cox GR, et al. Sports Dietitians Australia position statement: nutrition for exercise in hot environments. Int J Sport Nutr Exerc Metab. 2020;30(1):83-98.", doi: "10.1123/ijsnem.2019-0300", pmid: "31891914" },
      { text: "Hew-Butler T, Rosner MH, Fowkes-Godek S, Dugas JP, Hoffman MD, Lewis DP, et al. Statement of the 3rd International Exercise-Associated Hyponatremia Consensus Development Conference, Carlsbad, California, 2015. Br J Sports Med. 2015;49(22):1432-46.", doi: "10.1136/bjsports-2015-095004", pmid: "26227507" },
      { text: "Miller KC, McDermott BP, Yeargin SW, Fiol A, Schwellnus MP. An evidence-based review of the pathophysiology, treatment, and prevention of exercise-associated muscle cramps. J Athl Train. 2022;57(1):5-15.", doi: "10.4085/1062-6050-0696.20", pmid: "34185846" },
      { text: "Wright EM, Loo DD, Hirayama BA. Biology of human sodium glucose transporters. Physiol Rev. 2011;91(2):733-94.", doi: "10.1152/physrev.00055.2009", pmid: "21527736" },
      { text: "Gisolfi CV, Summers RD, Schedl HP, Bleiler TL. Effect of sodium concentration in a carbohydrate-electrolyte solution on intestinal absorption. Med Sci Sports Exerc. 1995;27(10):1414-20.", pmid: "8531613" },
    ],
    content: `Sodium is the main electrolyte you lose in sweat. How much you lose, and how much you need to replace, varies widely between athletes. Some popular claims about sodium also go further than the research does.

Here's what the evidence says about how much sodium you lose, how much to take, hyponatremia, cramps, and which products fit.

## How much sodium do you lose?

It depends on two things: how much you sweat, and how salty your sweat is. Both vary a lot from person to person.

In a study of 506 athletes, sweat sodium averaged about 830mg per liter (35.9 mmol/L), ranging from roughly 420mg to 1,630mg per liter (Baker 2016). Sweat rate averaged 1.21 liters an hour, ranging from 0.26 to 5.73 liters.

A larger dataset of 1,303 athletes found that endurance athletes sweated about 1.3 liters an hour on average and lost about 1,190mg of sodium an hour (51.7 mmol), with a wide spread between individuals (Barnes 2019).

Sweat rate and sweat sodium are affected by exercise intensity, heat, heat acclimation, diet and how the sweat is collected, so a sweat test gives an estimate rather than a fixed number (Baker 2017).

## How much should you take?

There's no single figure that fits everyone. Two useful reference points:

- **Losses:** endurance athletes in the Barnes dataset lost about 1,190mg of sodium an hour on average (Barnes 2019). You don't need to replace every milligram during exercise, but heavy, salty sweaters lose much more than the average.
- **Intake guidance:** the ISSN's position stand on ultra-marathon racing recommends 450–750 ml of fluid an hour, and says sodium may need to be above 575mg per liter, more than most commercial drinks provide, to reduce the risk of hyponatremia. Fluid and electrolyte needs rise in hot or humid conditions (Tiller 2019). At those volumes, 575mg per liter works out to roughly 260–430mg of sodium an hour.

Because sweat rate and sweat sodium vary so much, the American College of Sports Medicine recommends individual fluid plans, and suggests estimating your sweat rate by weighing yourself before and after exercise (Sawka 2007).

## How to estimate your own sweat rate

The simplest and most accurate way to measure whole-body sweat rate is the change in your body mass during exercise (Baker 2017). Here's how:

- Weigh yourself before a training session, with as little clothing as possible.
- Train for about an hour in conditions like your race, and note how much you drink.
- Weigh yourself again afterwards, after towelling off.
- Your sweat loss is the weight you lost plus the weight of what you drank. One kilogram of weight is roughly one liter of sweat.

Repeat it in different conditions, because your sweat rate in the heat can be very different from your sweat rate on a cool morning. Unless you've had a sweat test, you won't know how salty your sweat is, so use the averages above as a starting point and adjust from experience.

## Before the race

For events in the heat, the Sports Dietitians Australia position statement on exercise in hot environments says athletes should start exercise well hydrated, and that drinking extra fluid beforehand (pre-exercise hyperhydration) may help in some situations. It can be achieved with acute sodium or glycerol loading protocols (McCubbin 2020). If you want to try sodium loading, test it in training and get advice from a sports dietitian, particularly if you have high blood pressure or kidney problems.

## Hyponatremia

Exercise-associated hyponatremia is low blood sodium during or after exercise. It's uncommon, but it can be fatal (Tiller 2019).

The 2015 international consensus statement identifies drinking more fluid than you lose as its main cause, and recommends using thirst to guide how much you drink (Hew-Butler 2015). In other words, the fix isn't more sodium on top of too much water. It's not drinking far beyond your thirst.

## Sodium and cramps

Cramps are often blamed on sodium loss, but their cause is debated. A 2022 evidence-based review concluded that exercise-associated muscle cramps likely come from a mix of factors rather than a single cause, and that prevention works better when it targets an athlete's own risk factors than with generic advice such as drinking more (Miller 2022).

Sodium may be one factor for some athletes. But cramping on its own isn't proof that you're low on sodium.

## Sodium and carbohydrate absorption

The transporter that absorbs glucose in the small intestine, SGLT1, carries sodium and glucose into gut cells together, powered by the sodium gradient (Wright 2011). That's why sodium is often said to help you absorb carbs.

But when researchers perfused carbohydrate drinks into the small intestine, adding 0, 25 or 50 mEq/L of sodium made no difference to glucose or water absorption (Gisolfi 1995). There's little evidence that adding sodium to a carb drink helps you absorb the carbs. Take sodium to cover your sweat losses.

## Products by sodium content

These are the hydration products we track, grouped by sodium per serving, with their Pello Score and price per serving at The Feed.

[[disclosure]]

[[hydration-by-sodium]]

Energy gels usually aren't a big source of sodium. For example, [Maurten Gel 100](/report/maurten-gel-100) has {{sodium:maurten-gel-100}} of sodium per gel and [SiS GO Isotonic](/report/sis-go-isotonic) has {{sodium:sis-go-isotonic}}.

## Practical recommendations

- **Plan sodium for long or hot events.** If you rely on gels alone, you may be getting very little.
- **Estimate your sweat rate.** Weigh yourself before and after a long session, accounting for what you drank (Sawka 2007).
- **Drink to thirst on long events** rather than forcing fluid (Hew-Butler 2015).
- **Test it in training.** Try your race-day drink, product and amount in long sessions first.

## The bottom line

Endurance athletes lose about 1,190mg of sodium an hour on average, but sweat sodium alone varies about fourfold between athletes. Use the averages as a starting point, estimate your own sweat rate, drink to thirst, and test a sodium plan in training. If you cramp, treat sodium as one possible factor, not the whole answer.`,
  },
  {
    slug: "best-protein-powder-cyclists-2026",
    title: "Best Protein Powder for Cyclists in 2026",
    description: "Cyclists have different protein needs to gym athletes. We compared protein powders on Pello's data — protein per serving, price per gram, certifications and Pello Score — against what the research says riders need.",
    date: "2026-10-09",
    author: "Pello Nutrition",
    category: "Reviews",
    tags: ["protein", "cycling", "recovery", "supplements"],
    relatedProducts: ["transparent-labs-grass-fed-whey", "momentous-whey-isolate", "promix-whey-isolate", "amacx-recovery-shake", "momentous-collagen", "swissrx-collagen"],
    readingTime: 8,
    updated: "2026-10-14",
    authorName: "TODO: author name",
    reviewer: { name: "TODO: reviewer", credential: "TODO: credential" },
    references: [
      { text: "Thomas DT, Erdman KA, Burke LM. American College of Sports Medicine joint position statement. Nutrition and athletic performance. Med Sci Sports Exerc. 2016;48(3):543-68.", doi: "10.1249/MSS.0000000000000852", pmid: "26891166" },
      { text: "Jäger R, Kerksick CM, Campbell BI, Cribb PJ, Wells SD, Skwiat TM, et al. International Society of Sports Nutrition position stand: protein and exercise. J Int Soc Sports Nutr. 2017;14:20.", doi: "10.1186/s12970-017-0177-8", pmid: "28642676" },
      { text: "Shaw G, Lee-Barthel A, Ross ML, Wang B, Baar K. Vitamin C-enriched gelatin supplementation before intermittent activity augments collagen synthesis. Am J Clin Nutr. 2017;105(1):136-43.", doi: "10.3945/ajcn.116.138594", pmid: "27852613" },
    ],
    content: `Cyclists are not bodybuilders. The protein requirements, timing and product characteristics that matter for a rider are different from someone training for muscle size.

Yet most protein powder guides are written for gym athletes. The result is recommendations that miss what cyclists actually need — products that support recovery between sessions, help maintain muscle through heavy training and sit well on a stomach that has just spent three hours on the bike processing gels and drink mix.

This guide is for cyclists. We compared the protein products in Pello's database — their labels, prices and certifications — against what the research says matters for endurance athletes.

## Do cyclists actually need protein powder?

Need is a strong word: you can reach your protein target from food. But a powder is one of the simplest ways to close the gap.

Long rides increase muscle protein breakdown and deplete muscle glycogen. Protein supports the repair and adaptation that follow, and falling short over a training block makes recovery harder.

The 2016 joint position stand from the American College of Sports Medicine, the Academy of Nutrition and Dietetics and Dietitians of Canada recommends 1.2-2.0g of protein per kg of body weight per day for athletes. For a 70kg rider that's 84-140g a day, with heavier training blocks toward the top of that range.

Many riders find the upper end hard to reach from food alone, especially when appetite drops after a long ride. That's where a powder earns its place.

## What matters in a protein powder for cyclists

**Leucine content.** Leucine is the amino acid most closely tied to switching on muscle protein synthesis. The International Society of Sports Nutrition (ISSN) suggests each serving provide roughly 0.7-3g of leucine. Leucine content varies between proteins, so check the amino acid profile, not just the total protein.

**Digestion speed.** The ISSN notes that rapidly digested proteins with a high proportion of essential amino acids and enough leucine are the most effective at stimulating muscle protein synthesis. Casein is digested more slowly, and 30-40g before sleep increases muscle protein synthesis overnight (Jäger 2017).

**GI tolerance.** If dairy doesn't agree with you, a plant protein is the alternative.

**What's in the tub.** Read the label for added sugar and for proprietary blends that hide ingredient amounts. Some flavored powders add sugar — fine after a ride, but worth knowing if you're counting it.

**Certifications.** If you race in a tested event, choose a product that is NSF Certified for Sport or Informed Sport certified. Both test for substances banned in sport; NSF Certified for Sport also checks that the contents match the label.

## Our picks for cyclists

These picks come from Pello's product data. Prices are The Feed's at the time of writing, and Pello Scores are out of 100.

### Best overall: Transparent Labs 100% Grass-Fed Whey Protein Isolate

The highest Pello Score of the whey powders here at {{score:transparent-labs-grass-fed-whey}}. Each scoop provides {{protein:transparent-labs-grass-fed-whey}} of protein with {{carbs:transparent-labs-grass-fed-whey}} of carbohydrate, and it's NSF Certified for Sport.

At {{price:transparent-labs-grass-fed-whey}} for {{servings:transparent-labs-grass-fed-whey}} servings it works out at about {{pps:transparent-labs-grass-fed-whey}} a serving, around {{protein20g:transparent-labs-grass-fed-whey}} for every 20g of protein. An unflavored version is available if you'd rather mix it into food or a smoothie.

Best for: most cyclists, including those in tested events.

### Also NSF certified: Momentous Whey Protein Isolate

Momentous is NSF Certified for Sport and provides {{protein:momentous-whey-isolate}} of protein per scoop with {{carbs:momentous-whey-isolate}} of carbohydrate, a lighter serving than the others here. It's available unflavored.

It also contains ProHydrolase, a protease enzyme blend; the evidence for added digestive enzymes like this is mixed. At {{price:momentous-whey-isolate}} for {{servings:momentous-whey-isolate}} servings ({{pps:momentous-whey-isolate}} a serving) it's the most expensive per gram of protein of the three isolates, at {{protein20g:momentous-whey-isolate}} for every 20g. Pello Score: {{score:momentous-whey-isolate}}.

Best for: riders in tested events who want a smaller serving.

### Most protein per dollar: Promix Whey Isolate

Promix provides {{protein:promix-whey-isolate}} of protein per two-scoop serving, and at {{price:promix-whey-isolate}} for {{servings:promix-whey-isolate}} servings it's the lowest cost per gram of protein here, about {{protein20g:promix-whey-isolate}} for every 20g.

Two things to know: it has no third-party sport certification listed, and the version on Pello includes {{carbs:promix-whey-isolate}} of carbohydrate from sucrose per serving. Pello Score: {{score:promix-whey-isolate}}.

Best for: riders who aren't drug tested and want the most protein for the money.

### Best recovery shake: Amacx Recovery Shake

If you'd otherwise drink a protein shake and eat a banana, this combines both: {{protein:amacx-recovery-shake}} of protein and {{carbs:amacx-recovery-shake}} of carbohydrate (maltodextrin, fructose and sucrose) per serving. It's Informed Sport certified.

It costs more, {{price:amacx-recovery-shake}} for {{servings:amacx-recovery-shake}} servings or about {{pps:amacx-recovery-shake}} a serving, because you're also paying for the carbohydrate. Pello Score: {{score:amacx-recovery-shake}}.

Best for: back-to-back training days, when glycogen needs restoring as well as muscle.

### For tendons and joints: Momentous Collagen Peptides

Collagen is not a complete protein and shouldn't replace whey. Its interest for cyclists is connective tissue. In a small 2017 study of 8 men (Shaw 2017), 15g of vitamin C-enriched gelatin taken an hour before exercise increased markers of collagen synthesis. That's promising, but early evidence.

Each Momentous Collagen packet provides {{protein:momentous-collagen}} of protein ({{dose:momentous-collagen:Collagen Peptides}} of collagen peptides plus {{dose:momentous-collagen:Fortigel}} of Fortigel collagen hydrolysate) with {{dose:momentous-collagen:Vitamin C}} of vitamin C, and it's NSF Certified for Sport. At {{price:momentous-collagen}} for {{servings:momentous-collagen}} packets it's about {{pps:momentous-collagen}} a serving. Pello Score: {{score:momentous-collagen}}.

SwissRX Collagen is a popular alternative, but each scoop contains {{dose:swissrx-collagen:FORTIGEL}} of Fortigel — well short of the 15g used in that study — and it lists no sport certification. Pello Score: {{score:swissrx-collagen}}.

Best for: cyclists managing tendon or joint issues, alongside a proper training and rehab plan.

## Timing — what actually matters

The post-workout "anabolic window" is wider than gym lore suggests. The ISSN says the best timing is largely a matter of individual tolerance, because protein helps whether you have it before or after training, though the effect of exercise fades with time (Jäger 2017).

For cyclists the time-sensitive part is carbohydrate. If your next session is within about eight hours, the 2016 position stand recommends 1.0-1.2g of carbohydrate per kg of body weight per hour for the first four hours to restore glycogen quickly.

A practical protocol:

After hard rides: 20-40g of protein (about 0.25g per kg of body weight) with carbohydrate. A shake with a banana, a recovery shake or a proper meal all work.

Through the day: spread protein evenly, with 20-40g every 3-4 hours, rather than one or two large servings (Jäger 2017).

Before sleep on back-to-back training days: the ISSN reports that 30-40g of casein before sleep can increase overnight muscle protein synthesis.

## The bottom line

For most cyclists, a whey isolate after hard sessions is a simple way to reach a daily protein target that food alone can miss.

On Pello's data, Transparent Labs offers the best combination of protein per serving, NSF certification and price. Promix is the cheapest per gram of protein if you don't need a certified product. Amacx covers protein and carbohydrate in one shake, and Momentous Collagen is the option worth considering for connective tissue.

Use the Pello planner to build fueling and recovery around your next event.`,
  },
];

// Drafts show only in local development, never on the live site.
export const SHOW_DRAFTS = process.env.NODE_ENV === "development";
const visible = (p: BlogPost) => !p.draft || SHOW_DRAFTS;

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.filter(visible).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// Author and reviewer placeholders still to fill in, printed at build time.
export function blogPlaceholders(): string[] {
  return BLOG_POSTS.flatMap((p) => [
    ...(p.authorName && isPlaceholder(p.authorName) ? [`${p.slug}: author`] : []),
    ...(p.reviewer && (isPlaceholder(p.reviewer.name) || isPlaceholder(p.reviewer.credential)) ? [`${p.slug}: reviewer`] : []),
    ...(p.draft ? [`${p.slug}: draft, not published`] : []),
  ]);
}

export const referenceHref = (r: Reference) =>
  r.doi ? `https://doi.org/${r.doi}` : r.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${r.pmid}/` : r.url;

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find(p => p.slug === slug && visible(p)) ?? null;
}
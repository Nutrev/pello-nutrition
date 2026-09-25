// lib/blog.ts
// Blog posts stored directly in TypeScript — no filesystem reading needed

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
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-energy-gels-cycling-2026",
    title: "Best Energy Gels for Cycling 2026",
    description: "We compared 15+ energy gels for cyclists. Here are the top picks across price, carbohydrate science and ingredient quality.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Reviews",
    tags: ["energy gels", "cycling", "endurance", "fuelling"],
    relatedProducts: ["maurten-gel-100", "maurten-gel-100-caf-100", "science-in-sport-go-energy-gel", "sis-beta-fuel-gel", "precision-fuel-pf30", "gu-roctane-gel"],
    readingTime: 6,
    content: `Energy gels are the cornerstone of endurance cycling nutrition. Get them right and you can sustain effort for hours. Get them wrong and you're dealing with GI distress, energy crashes or simply running out of fuel.

We compared 15+ gels on ingredient quality, carbohydrate science, customer ratings and price per gel. Here are the best options for cyclists in 2026.

## What makes a good energy gel?

Before getting into picks, here's what actually matters in a gel:

**Carbohydrate type and ratio.** The best gels use a mix of glucose and fructose at a 2:1 or 1:0.8 ratio. This unlocks two separate intestinal transporters, allowing absorption of up to 90g of carbs per hour — significantly more than glucose alone (60g/hr ceiling).

**Dose per gel.** Most gels provide 20-30g of carbs. For high-intensity cycling, you need 60-90g per hour — so gel frequency matters.

**Osmolality.** Isotonic gels can be taken without water. Non-isotonic gels need water to dilute them in the gut, otherwise they can draw fluid from your body and cause cramping.

**Ingredient cleanliness.** Some gels contain artificial preservatives, artificial sweeteners or gums. Many athletes prefer to avoid these.

## Our top picks

### Best overall: Maurten Gel 100

Maurten's hydrogel technology encapsulates carbohydrates in a gel matrix designed to pass through the stomach smoothly, and it's a favourite of athletes who struggle with GI issues. It's rated 4.8 out of 5 from over 1,400 reviews on The Feed.

At 25g carbs per gel with a short six-ingredient label, it's not the most carb-dense option, but its reputation for tolerance makes it a reliable choice for long events. The main drawback is price — at $3.75/gel it's among the most expensive on the market.

Best for: Cyclists who've had GI issues with other gels, long sportives and gran fondos.

### Best value: SiS GO Energy + Electrolyte Gel

At about $1.17/gel, this is the cheapest proper energy gel we list. Each gel has 22g of carbs from maltodextrin plus 100mg of sodium, so it tops up electrolytes as well as fuel. It's Informed Sport certified, vegan, and rated 4.6 out of 5 from nearly 600 reviews on The Feed.

With a single carb source it's best at moderate intakes (up to around 60g per hour) rather than race-pace fuelling.

Best for: Training rides, budget-conscious athletes, high-volume use.

### Best high-carb: SiS Beta Fuel Gel

Science in Sport's Beta Fuel delivers 40g of carbs per gel at a 1:0.8 maltodextrin:fructose ratio — one of the highest per-gel doses available — so fewer gels cover a high hourly target. It's Informed Sport certified.

Best for: High-intensity efforts, athletes pushing 80-90g carbs/hr.

### Best caffeinated: Precision Fuel PF30 CAF

100mg of caffeine paired with 30g of carbs. Precision Fuel's modular approach — separating carbs from electrolytes — gives athletes more control over their fuelling strategy.

Best for: Late-race use, sportives over 3 hours, athletes who respond well to caffeine.

### Best for sensitive stomachs: Maurten Gel 100 CAF 100

Same hydrogel formula as the standard Gel 100 but with 100mg caffeine. The hydrogel delivery system appears to reduce caffeine-related GI issues compared to standard caffeinated gels.

Best for: Athletes who want caffeine but struggle with GI distress from standard caffeinated gels.

## How many gels do you need?

A rough guide based on intensity:

- Easy ride (Z1-Z2): 30g carbs/hr — 1 gel per hour
- Moderate (Z2-Z3): 50g carbs/hr — 2 gels per hour
- Hard/threshold (Z3-Z4): 70g carbs/hr — 2-3 gels per hour
- Race pace (Z4-Z5): 90g carbs/hr — 3 gels per hour plus drink mix

Start fuelling at 30-45 minutes into the ride. Don't wait until you feel hungry — by then it's too late.

## The bottom line

For most cyclists, a combination of Maurten Gel 100 for GI-sensitive moments and a cheaper gel like SiS GO Energy + Electrolyte for training is the most practical approach. Reserve the expensive gels for race day and key training sessions.

Use our [Pello Planner](/quiz) to get a personalised gel recommendation based on your specific event duration and intensity.`,
  },
  {
    slug: "creatine-endurance-athletes",
    title: "Creatine for Endurance Athletes — What the Science Actually Says",
    description: "Creatine is the most researched supplement in existence. But is it useful for cyclists, runners and triathletes? We break down the evidence.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Science",
    tags: ["creatine", "endurance", "supplements", "science"],
    relatedProducts: ["thorne-creatine", "momentous-creatine", "amacx-creatine"],
    readingTime: 7,
    content: `Creatine monohydrate is the most extensively researched performance supplement in sports science. Over 500 studies, consistent results, excellent safety profile. For strength and power athletes the evidence is overwhelming.

But what about endurance athletes? Cyclists, runners, triathletes — is creatine worth taking?

The short answer: probably yes, but not for the reasons you might think.

## What creatine actually does

Creatine is stored in muscle as phosphocreatine (PCr). During high-intensity efforts, PCr donates a phosphate group to ADP to rapidly regenerate ATP — the currency of muscular energy.

This is why creatine is so effective for strength and power: it directly fuels the phosphocreatine energy system used during short, intense efforts.

Endurance sport runs primarily on oxidative metabolism — the aerobic system. So the direct PCr-replenishment benefit is less relevant for a 4-hour ride than a 100m sprint.

## Where creatine helps endurance athletes

**Repeated high-intensity efforts**

Road cycling, criteriums, trail running and triathlon all involve repeated surges — attacks, hill sprints, race finishes. Creatine directly improves performance in these efforts by maintaining PCr availability between surges.

**Strength training adaptation**

Most endurance athletes do strength work in the off-season or as cross-training. Creatine meaningfully improves strength training adaptation — more force production, better recovery between sets, greater long-term gains.

**Cognitive function**

Emerging research shows creatine supplementation improves cognitive performance, particularly under sleep deprivation or fatigue. Relevant for ultramarathon runners and multi-day events.

**Recovery**

Creatine has demonstrated anti-inflammatory effects and may reduce muscle damage markers after intense exercise. Faster recovery between hard training sessions is valuable for any athlete.

**Muscle mass (if desired)**

Creatine increases intramuscular water retention and, over time, lean muscle mass. For power-to-weight sport this is a trade-off — some cyclists avoid it for this reason.

## The weight concern

The most common reason endurance athletes avoid creatine is the 1-2kg water weight gain from intramuscular hydration. For road cyclists where watts per kilogram matters, this is a real consideration.

The counter-argument: that water is inside muscle cells and may actually improve performance by maintaining cell hydration during long efforts. The net effect on endurance performance appears neutral to slightly positive in most studies.

## What dose and form to take

- Dose: 3-5g daily. No loading phase needed.
- Form: Creatine monohydrate. Specifically Creapure — a German-manufactured pharmaceutical-grade monohydrate.
- Timing: Timing matters less than consistency. Daily use is what matters.
- Certified: Look for NSF Certified for Sport or Informed Sport certification.

## Our recommended products

Thorne Creatine and Momentous Creatine are both NSF Certified for Sport, and Momentous uses Creapure monohydrate. Both represent excellent value at under $0.50 per serving.

View full analysis and community reviews on each product page linked below.

## The bottom line

Creatine is worth taking for most endurance athletes — particularly those who do repeated high-intensity efforts, strength training, or compete in multi-day events. The evidence is strong, the cost is low and the safety profile is excellent.

Start with 3-5g daily and give it 4 weeks to fully saturate. Don't load. Don't overthink the timing. Just be consistent.`,
  },

  {
    slug: "maurten-vs-sis-beta-fuel",
    title: "Maurten vs SiS Beta Fuel — Which is Better?",
    description: "Two of the most popular high-carb fuelling systems compared head to head. Ingredients, GI comfort, carb density, price and who each is best for.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Comparisons",
    tags: ["maurten", "sis", "energy gels", "comparison", "carbohydrates"],
    relatedProducts: ["maurten-gel-100", "sis-beta-fuel-gel", "maurten-drink-mix-320", "sis-beta-fuel-drink"],
    readingTime: 7,
    content: `Maurten and Science in Sport (SiS) Beta Fuel are the two most talked-about high-performance fuelling systems in endurance sport. Both are used by professional athletes. Both are backed by science. And both cost significantly more than budget alternatives.

So which one is actually better — and for whom?

## The core difference

The fundamental difference between Maurten and SiS Beta Fuel comes down to delivery mechanism and carbohydrate ratio.

Maurten uses a hydrogel system — sodium alginate reacts with stomach acid to form a gel around the carbohydrates, which Maurten says helps them pass through the stomach with less gut stress. Independent studies have found mixed results so far, but many athletes with sensitive stomachs rely on it.

SiS Beta Fuel uses a 1:0.8 maltodextrin to fructose ratio — refined from the older 2:1 standard. Research suggests a ratio closer to 1:1 can improve carbohydrate absorption and comfort at high intakes, supporting up to 90g of carbs per hour.

Both approaches are scientifically valid. They're solving the same problem — getting more carbs in faster with less gut trouble — from different angles.

## Carbohydrate density

This is where SiS Beta Fuel has a clear advantage.

- Maurten Gel 100: 25g carbs per gel
- SiS Beta Fuel Gel: 40g carbs per gel

For athletes pushing 80-90g carbs per hour, SiS delivers more per unit. You need 3-4 Maurten gels per hour versus 2-3 SiS Beta Fuel gels. Fewer items to carry, fewer moments to fumble with packaging mid-race.

The drink mixes are level: SiS Beta Fuel drink and Maurten Drink Mix 320 both provide 80g of carbs per serving.

## GI comfort

Both are built for gut comfort, from different angles: Maurten through its hydrogel, SiS through its 1:0.8 carb ratio. Customers rate them equally — both gels score 4.8 out of 5 on The Feed, from over 1,400 reviews for Maurten Gel 100 and nearly 1,300 for Beta Fuel.

Gut tolerance is highly individual, so the only reliable test is trying each in training at race intensity before you commit to one on race day.

## Ingredient cleanliness

Maurten wins here. Gel 100 has six ingredients — water, glucose, fructose, calcium carbonate, gluconic acid and sodium alginate — with no flavourings, colours, preservatives or sweeteners.

SiS Beta Fuel adds flavourings, gums (gellan and xanthan) and preservatives (sodium benzoate and potassium sorbate). These are common, approved ingredients, but some athletes prefer to avoid them.

## Price

Both are expensive. SiS Beta Fuel is slightly more affordable per gram of carbohydrate delivered.

- Maurten Gel 100: ~$3.75/gel (box of 12), 25g carbs = $0.150/g carb
- SiS Beta Fuel Gel: ~$3.39/gel (box of 18), 40g carbs = $0.085/g carb

SiS delivers about 1.8 times the carbs per dollar. For athletes doing high-volume training and racing, this adds up significantly over a season.

## Who should use each

**Choose Maurten if:**
- You have a sensitive stomach or history of GI issues during racing and the hydrogel works for you
- You want the shortest ingredient list, with no flavourings or preservatives
- You're racing at very high intensities where gut tolerance is critical
- Budget is secondary to performance reliability

**Choose SiS Beta Fuel if:**
- You need to hit 80-90g carbs per hour and want fewer gels to carry
- You want better value per gram of carbohydrate
- Your stomach tolerates most products well

## The verdict

There's no universal winner. For athletes with cast-iron stomachs who want maximum carb density and value, SiS Beta Fuel is the better choice. For athletes who've struggled with GI issues or want the cleanest possible label, Maurten is worth the premium.

A sensible middle ground is to use both — Maurten for racing and key sessions, SiS Beta Fuel for high-volume training where cost matters.

Use the Pello Planner to get a personalised recommendation based on your specific event and goals.`,
  },

  {
    slug: "marathon-nutrition-guide",
    title: "The Complete Marathon Nutrition Guide",
    description: "Everything you need to know about fuelling a marathon — from pre-race carb loading to mid-race gel strategy and post-race recovery.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Guides",
    tags: ["marathon", "running", "race nutrition", "carb loading", "gels"],
    relatedProducts: ["maurten-gel-100", "precision-fuel-pf30", "lmnt-electrolyte-mix", "momentous-whey-isolate"],
    readingTime: 9,
    content: `The marathon is 26.2 miles. At race pace, you'll burn through your glycogen stores in roughly 90-120 minutes. The race is twice as long. That gap is where nutrition becomes the difference between a strong finish and hitting the wall.

This guide covers everything you need to fuel a marathon well — from the week before to the finish line.

## The week before — carb loading

Carb loading isn't about eating pasta the night before. That's a myth that leads to heavy legs and a poor night's sleep.

Effective carb loading means gradually increasing carbohydrate intake over 2-3 days before the race while reducing training volume. The goal is to top up muscle glycogen stores beyond their normal resting level.

Target 8-10g of carbohydrate per kg of body weight per day for the 2-3 days before the race. For a 70kg runner, that's 560-700g of carbs daily — significantly more than a typical diet.

Focus on easily digestible sources: white rice, pasta, bread, potatoes, bananas, sports drinks. Reduce fibre, fat and protein relative to normal. This reduces gut bulk and minimises the risk of GI issues on race day.

## Race morning — the pre-race meal

Eat 2-3 hours before the start. The goal is to top up liver glycogen (which depletes overnight) without leaving food sitting in your stomach at the gun.

A good pre-race meal for a 70kg runner:
- White rice or pasta: 200g cooked (55g carbs)
- White bread or bagel: 2 slices (40g carbs)
- Banana: 1 medium (25g carbs)
- Orange juice: 250ml (26g carbs)
- Pinch of salt: sodium primer

Total: approximately 150g carbs, low fibre, low fat.

60 minutes before the start, sip 500ml of water or dilute sports drink. Avoid high-fibre foods from this point.

15-20 minutes before the gun, take a caffeine gel if using caffeine strategy — this times the peak caffeine effect with the early race miles.

## During the race — gel strategy

For marathon running, target 60g of carbs per hour. Elite runners may push to 90g/hr but this requires gut training and a carefully planned dual-transporter approach.

A simple gel strategy for a 4-hour marathon:

- Start fuelling at 30 minutes — don't wait until you feel it
- Take 1 gel every 25-30 minutes
- Sip water at every aid station — 150-200ml per gel
- Save a caffeinated gel for miles 18-20 when fatigue sets in

For a 4-hour race you'll need approximately 8-10 gels depending on carb content. Pack more than you think you need.

**Sodium matters.** At marathon pace you'll lose 1-2g of sodium per hour through sweat. If you're only taking gels, supplement with electrolyte capsules or choose gels with higher sodium content. Cramping in the late miles is often sodium depletion, not just fatigue.

## The wall — and how to avoid it

Hitting the wall is glycogen depletion. It happens when you've burned through your stored carbohydrates and your body switches to fat oxidation — a much slower fuel source.

The wall is avoidable with two things:

First, start fuelling early and consistently. Most runners start too late and try to catch up. You can't. Once glycogen is depleted, no amount of gels will bring it back in the time available.

Second, pace correctly. Going out too fast in miles 1-10 burns glycogen at an accelerated rate. Even 10-15 seconds per mile too fast in the early miles can determine whether you have energy for the final 6.

## Post-race recovery

The 30-minute window after finishing is the most important nutrition moment of the day. Muscle cells are maximally receptive to glucose uptake and protein synthesis.

- Within 30 minutes: 20-25g protein plus 40-60g fast carbs. Chocolate milk is a classic and genuinely effective option.
- Within 2 hours: a proper meal with protein, carbs and vegetables.
- That evening: prioritise sleep and continue eating — a marathon depletes glycogen stores that take 24-48 hours to fully replenish.

Don't skip the post-race meal because you feel nauseous. Start small with liquid nutrition if needed — a protein shake, a banana, sports drink — and build from there.

## Caffeine strategy

Caffeine is one of the most evidence-backed ergogenic aids in sport. For marathon running, a well-timed caffeine strategy can meaningfully improve late-race performance.

Options:
- Single dose: 200-400mg taken 45-60 minutes before the race
- Split dose: 100-200mg pre-race plus a caffeinated gel at mile 18-20
- Progressive: caffeine-free gels early, caffeinated gels from halfway

If you're not a regular caffeine user, start with a lower dose and test in training first. GI sensitivity to caffeine varies significantly between individuals.

## Practise everything in training

The single most important piece of advice in this guide: practise your race nutrition in training. Long runs are dress rehearsals for your gut as much as your legs.

Take gels at race pace. Drink from cups while running. Test your pre-race meal. Try your caffeine strategy. Everything that goes into your body on race day should have been tested at least twice in training.

Race day is not the time to try a new gel.`,
  },

  {
    slug: "sodium-endurance-athletes",
    title: "How Much Sodium Do You Need for Endurance Sport?",
    description: "Sodium is the most important electrolyte for endurance athletes. Here's what the science says about how much you need, when to take it and which products deliver it best.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Science",
    tags: ["sodium", "electrolytes", "hydration", "endurance", "cramping"],
    relatedProducts: ["lmnt-electrolyte-mix", "precision-fuel-hydration-tablets", "skratch-sport-hydration", "saltstick-fastchews"],
    readingTime: 6,
    content: `Sodium is the most important electrolyte for endurance athletes. It regulates fluid balance, drives carbohydrate absorption in the gut and maintains nerve and muscle function. Get it wrong and the consequences range from cramping and fatigue to, in extreme cases, hyponatraemia — dangerously low blood sodium from drinking too much water without adequate sodium replacement.

Yet most athletes dramatically underestimate how much sodium they lose during exercise and how much they need to replace.

## How much sodium do you lose?

Sweat sodium concentration varies enormously between individuals — from around 200mg per litre to over 2000mg per litre. This is largely genetically determined and consistent for a given individual.

A rough average is 900mg of sodium per litre of sweat. At a sweat rate of 1 litre per hour — typical for moderate intensity in mild conditions — that's 900mg of sodium lost per hour.

In hot conditions or at high intensity, sweat rates can reach 2-3 litres per hour. At these rates, sodium losses of 1800-2700mg per hour are not unusual.

Most energy gels provide 40-100mg of sodium per serving. A standard electrolyte tablet provides 100-300mg. The gap between what most athletes consume and what they actually lose is significant.

## Signs of sodium depletion

- Muscle cramps (particularly late in long events)
- Headache
- Nausea
- Fatigue disproportionate to effort
- Swelling in hands and feet
- Mental fog

If you experience these symptoms during or after long events, sodium depletion is a likely contributor.

## How much should you take?

A practical starting point based on exercise duration and intensity:

- Under 60 minutes: sodium replacement generally not needed
- 1-2 hours moderate: 300-500mg per hour
- 2-3 hours moderate to hard: 500-800mg per hour
- 3+ hours or hot conditions: 800-1500mg per hour
- Very salty sweaters (white residue on skin/kit): up to 2000mg per hour

These are starting points. Athletes who are salty sweaters or those racing in heat may need significantly more.

## The hyponatraemia risk

Hyponatraemia — low blood sodium — is a real risk for endurance athletes, particularly those racing at slower paces over long distances who drink large volumes of plain water.

The mechanism is straightforward: drinking water dilutes blood sodium concentration. Combined with sodium losses through sweat, blood sodium can drop to dangerous levels. Symptoms include nausea, headache, confusion and in severe cases seizures.

The fix is not to drink less water — it's to ensure what you drink contains adequate sodium. Sports drinks, electrolyte tablets in water, or electrolyte capsules alongside plain water all address this.

## Sodium and carbohydrate absorption

Sodium plays a critical role beyond hydration. The SGLT1 transporter — responsible for glucose absorption in the small intestine — requires sodium to function. Every molecule of glucose absorbed pulls a sodium ion with it.

This is why products like Maurten and Precision Fuel include sodium even in small amounts — it's not just electrolyte replacement, it's enabling carbohydrate absorption. Low sodium intake during high-carb fuelling can actually reduce carb absorption efficiency.

## Choosing the right product

Products vary enormously in sodium content:

**High sodium (1000mg+ per serving):**
- LMNT: 1000mg sodium — excellent for heavy sweaters and hot conditions
- SaltStick FastChews: 100mg per chew, easy to stack

**Medium sodium (300-600mg per serving):**
- Precision Fuel Hydration tablets: 500mg — solid middle-ground option
- Skratch Sport Hydration: 380mg — natural ingredients, good taste

**Low sodium (under 200mg per serving):**
- Most energy gels: 40-100mg — insufficient as sole sodium source for long efforts

## Practical recommendations

For events over 2 hours, don't rely on gels alone for sodium. Use a dedicated electrolyte product alongside your carb fuelling.

If you cramp regularly in long events, you're almost certainly sodium depleted. Increase sodium intake progressively in training and find your personal threshold.

Test your sodium strategy in training before race day. Sodium needs are individual — what works for one athlete may be insufficient for another with higher sweat rates or saltier sweat.

Start with a moderate sodium strategy and increase if you experience cramping, headaches or excessive fatigue in the late stages of long events.`,
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find(p => p.slug === slug) ?? null;
}
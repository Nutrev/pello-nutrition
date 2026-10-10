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
  // Optional cover photo, e.g. { src: "/blog/marathon.jpg", alt: "..." } with the file in
  // public/blog/. Posts without one get a drawn cover for their category.
  image?: { src: string; alt: string };
  // Optional product pack shots shown side by side on the cover (a comparison's two
  // products, say), files in public/blog/. Used when there's no cover photo.
  packshots?: { src: string; alt: string }[];
  // Shown as the large featured card at the top of the blog page.
  startHere?: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "best-energy-gels-cycling-2026",
    image: { src: "/blog/energy-gels.jpg", alt: "Energy gels from Maurten, Carbs Fuel, GU, Honey Stinger, Precision Fuel, SiS and others" },
    title: "Best Energy Gels for Cycling 2026",
    description: "We compared 15+ energy gels for cyclists. Here are the top picks across price, carbohydrate science and ingredient quality.",
    date: "2026-09-22",
    author: "Pello Nutrition",
    category: "Reviews",
    tags: ["energy gels", "cycling", "endurance", "fueling"],
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

Maurten's hydrogel technology encapsulates carbohydrates in a gel matrix designed to pass through the stomach smoothly, and it's a favorite of athletes who struggle with GI issues. It's rated 4.8 out of 5 from over 1,400 reviews on The Feed.

At 25g carbs per gel with a short six-ingredient label, it's not the most carb-dense option, but its reputation for tolerance makes it a reliable choice for long events. The main drawback is price — at $3.75/gel it's among the most expensive on the market.

Best for: Cyclists who've had GI issues with other gels, long sportives and gran fondos.

### Best value: SiS GO Energy + Electrolyte Gel

At about $1.17/gel, this is the cheapest proper energy gel we list. Each gel has 22g of carbs from maltodextrin plus 100mg of sodium, so it tops up electrolytes as well as fuel. It's Informed Sport certified, vegan, and rated 4.6 out of 5 from nearly 600 reviews on The Feed.

With a single carb source it's best at moderate intakes (up to around 60g per hour) rather than race-pace fueling.

Best for: Training rides, budget-conscious athletes, high-volume use.

### Best high-carb: SiS Beta Fuel Gel

Science in Sport's Beta Fuel delivers 40g of carbs per gel at a 1:0.8 maltodextrin:fructose ratio — one of the highest per-gel doses available — so fewer gels cover a high hourly target. It's Informed Sport certified.

Best for: High-intensity efforts, athletes pushing 80-90g carbs/hr.

### Best caffeinated: Precision Fuel PF30 CAF

100mg of caffeine paired with 30g of carbs. Precision Fuel's modular approach — separating carbs from electrolytes — gives athletes more control over their fueling strategy.

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

Start fueling at 30-45 minutes into the ride. Don't wait until you feel hungry — by then it's too late.

[[pro:/quiz?mode=event|See what your race fueling costs, gel by gel]]

## The bottom line

For most cyclists, a combination of Maurten Gel 100 for GI-sensitive moments and a cheaper gel like SiS GO Energy + Electrolyte for training is the most practical approach. Reserve the expensive gels for race day and key training sessions.

Use our [Pello Planner](/quiz) to get a personalized gel recommendation based on your specific event duration and intensity.`,
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
    content: `Maurten and Science in Sport (SiS) Beta Fuel are the two most talked-about high-performance fueling systems in endurance sport. Both are used by professional athletes. Both are backed by science. And both cost significantly more than budget alternatives.

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

[[pro:/fueling#gut-training|Start a gut-training plan to build toward 90g per hour]]

## Ingredient cleanliness

Maurten wins here. Gel 100 has six ingredients — water, glucose, fructose, calcium carbonate, gluconic acid and sodium alginate — with no flavorings, colors, preservatives or sweeteners.

SiS Beta Fuel adds flavorings, gums (gellan and xanthan) and preservatives (sodium benzoate and potassium sorbate). These are common, approved ingredients, but some athletes prefer to avoid them.

## Price

Both are expensive. SiS Beta Fuel is slightly more affordable per gram of carbohydrate delivered.

- Maurten Gel 100: ~$3.75/gel (box of 12), 25g carbs = $0.150/g carb
- SiS Beta Fuel Gel: ~$3.39/gel (box of 18), 40g carbs = $0.085/g carb

SiS delivers about 1.8 times the carbs per dollar. For athletes doing high-volume training and racing, this adds up significantly over a season.

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
    content: `The marathon is 26.2 miles. At race pace, you'll burn through your glycogen stores in roughly 90-120 minutes. The race is twice as long. That gap is where nutrition becomes the difference between a strong finish and hitting the wall.

This guide covers everything you need to fuel a marathon well — from the week before to the finish line.

## The week before — carb loading

Carb loading isn't about eating pasta the night before. That's a myth that leads to heavy legs and a poor night's sleep.

Effective carb loading means gradually increasing carbohydrate intake over 2-3 days before the race while reducing training volume. The goal is to top up muscle glycogen stores beyond their normal resting level.

Target 8-10g of carbohydrate per kg of body weight per day for the 2-3 days before the race. For a 70kg runner, that's 560-700g of carbs daily — significantly more than a typical diet.

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

60 minutes before the start, sip 500ml of water or dilute sports drink. Avoid high-fibre foods from this point.

15-20 minutes before the gun, take a caffeine gel if using caffeine strategy — this times the peak caffeine effect with the early race miles.

## During the race — gel strategy

For marathon running, target 60g of carbs per hour. Elite runners may push to 90g/hr but this requires gut training and a carefully planned dual-transporter approach.

[[pro:/quiz?mode=event|Build this plan for your race]]

A simple gel strategy for a 4-hour marathon:

- Start fueling at 30 minutes — don't wait until you feel it
- Take 1 gel every 25-30 minutes
- Sip water at every aid station — 150-200ml per gel
- Save a caffeinated gel for miles 18-20 when fatigue sets in

For a 4-hour race you'll need approximately 8-10 gels depending on carb content. Pack more than you think you need.

**Sodium matters.** At marathon pace you'll lose 1-2g of sodium per hour through sweat. If you're only taking gels, supplement with electrolyte capsules or choose gels with higher sodium content. Cramping in the late miles is often sodium depletion, not just fatigue.

## The wall — and how to avoid it

Hitting the wall is glycogen depletion. It happens when you've burned through your stored carbohydrates and your body switches to fat oxidation — a much slower fuel source.

The wall is avoidable with two things:

First, start fueling early and consistently. Most runners start too late and try to catch up. You can't. Once glycogen is depleted, no amount of gels will bring it back in the time available.

Second, pace correctly. Going out too fast in miles 1-10 burns glycogen at an accelerated rate. Even 10-15 seconds per mile too fast in the early miles can determine whether you have energy for the final 6.

## Post-race recovery

The 30-minute window after finishing is the most important nutrition moment of the day. Muscle cells are maximally receptive to glucose uptake and protein synthesis.

- Within 30 minutes: 20-25g protein plus 40-60g fast carbs. Chocolate milk is a classic and genuinely effective option.
- Within 2 hours: a proper meal with protein, carbs and vegetables.
- That evening: prioritize sleep and continue eating — a marathon depletes glycogen stores that take 24-48 hours to fully replenish.

Don't skip the post-race meal because you feel nauseous. Start small with liquid nutrition if needed — a protein shake, a banana, sports drink — and build from there.

## Caffeine strategy

Caffeine is one of the most evidence-backed ergogenic aids in sport. For marathon running, a well-timed caffeine strategy can meaningfully improve late-race performance.

Options:
- Single dose: 200-400mg taken 45-60 minutes before the race
- Split dose: 100-200mg pre-race plus a caffeinated gel at mile 18-20
- Progressive: caffeine-free gels early, caffeinated gels from halfway

If you're not a regular caffeine user, start with a lower dose and test in training first. GI sensitivity to caffeine varies significantly between individuals.

## Practice everything in training

The single most important piece of advice in this guide: practice your race nutrition in training. Long runs are dress rehearsals for your gut as much as your legs.

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
    content: `Sodium is the most important electrolyte for endurance athletes. It regulates fluid balance, drives carbohydrate absorption in the gut and maintains nerve and muscle function. Get it wrong and the consequences range from cramping and fatigue to, in extreme cases, hyponatremia — dangerously low blood sodium from drinking too much water without adequate sodium replacement.

Yet most athletes dramatically underestimate how much sodium they lose during exercise and how much they need to replace.

## How much sodium do you lose?

Sweat sodium concentration varies enormously between individuals — from around 200mg per liter to over 2000mg per liter. This is largely genetically determined and consistent for a given individual.

A rough average is 900mg of sodium per liter of sweat. At a sweat rate of 1 liter per hour — typical for moderate intensity in mild conditions — that's 900mg of sodium lost per hour.

In hot conditions or at high intensity, sweat rates can reach 2-3 liters per hour. At these rates, sodium losses of 1800-2700mg per hour are not unusual.

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

## The hyponatremia risk

Hyponatremia — low blood sodium — is a real risk for endurance athletes, particularly those racing at slower paces over long distances who drink large volumes of plain water.

The mechanism is straightforward: drinking water dilutes blood sodium concentration. Combined with sodium losses through sweat, blood sodium can drop to dangerous levels. Symptoms include nausea, headache, confusion and in severe cases seizures.

The fix is not to drink less water — it's to ensure what you drink contains adequate sodium. Sports drinks, electrolyte tablets in water, or electrolyte capsules alongside plain water all address this.

## Sodium and carbohydrate absorption

Sodium plays a critical role beyond hydration. The SGLT1 transporter — responsible for glucose absorption in the small intestine — requires sodium to function. Every molecule of glucose absorbed pulls a sodium ion with it.

This is why products like Maurten and Precision Fuel include sodium even in small amounts — it's not just electrolyte replacement, it's enabling carbohydrate absorption. Low sodium intake during high-carb fueling can actually reduce carb absorption efficiency.

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

For events over 2 hours, don't rely on gels alone for sodium. Use a dedicated electrolyte product alongside your carb fueling.

If you cramp regularly in long events, you're almost certainly sodium depleted. Increase sodium intake progressively in training and find your personal threshold.

Test your sodium strategy in training before race day. Sodium needs are individual — what works for one athlete may be insufficient for another with higher sweat rates or saltier sweat.

Start with a moderate sodium strategy and increase if you experience cramping, headaches or excessive fatigue in the late stages of long events.`,
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
    content: `Cyclists are not bodybuilders. The protein requirements, timing and product characteristics that matter for a rider are different from someone training for muscle size.

Yet most protein powder guides are written for gym athletes. The result is recommendations that miss what cyclists actually need — products that support recovery between sessions, help maintain muscle through heavy training and sit well on a stomach that has just spent three hours on the bike processing gels and drink mix.

This guide is for cyclists. We compared the protein products in Pello's database — their labels, prices and certifications — against what the research says matters for endurance athletes.

## Do cyclists actually need protein powder?

Need is a strong word: you can reach your protein target from food. But a powder is one of the simplest ways to close the gap.

Long rides increase muscle protein breakdown and deplete muscle glycogen. Protein supports the repair and adaptation that follow, and falling short over a training block makes recovery harder.

The 2016 joint position stand from the American College of Sports Medicine, the Academy of Nutrition and Dietetics and Dietitians of Canada recommends 1.2-2.0g of protein per kg of body weight per day for athletes. For a 70kg rider that's 84-140g a day, with heavier training blocks toward the top of that range.

Many riders find the upper end hard to reach from food alone, especially when appetite drops after a long ride. That's where a powder earns its place.

## What matters in a protein powder for cyclists

**Leucine content.** Leucine is the amino acid most closely tied to switching on muscle protein synthesis. The International Society of Sports Nutrition (ISSN) suggests each serving provide roughly 0.7-3g of leucine. Whey is naturally rich in it — a 20-25g serving typically provides around 2-3g. Plant proteins usually contain less per gram, so check the amino acid profile, not just the total protein.

**Digestion speed.** Whey is digested quickly and is higher in leucine than casein, which is why it's the usual choice after training. Casein digests slowly, which is why it's used before sleep.

**GI tolerance.** Whey isolate is filtered to remove most of the lactose, so people with lactose sensitivity usually tolerate it better than whey concentrate. If dairy doesn't agree with you at all, a plant protein is the alternative.

**What's in the tub.** Read the label for added sugar and for proprietary blends that hide ingredient amounts. Some flavored powders add sugar — fine after a ride, but worth knowing if you're counting it.

**Certifications.** If you race in a tested event, choose a product that is NSF Certified for Sport or Informed Sport certified. Both test for substances banned in sport; NSF Certified for Sport also checks that the contents match the label.

## Our picks for cyclists

These picks come from Pello's product data. Prices are The Feed's at the time of writing, and Pello Scores are out of 100.

### Best overall: Transparent Labs 100% Grass-Fed Whey Protein Isolate

The highest Pello Score of the whey powders here at 84. Each scoop provides 28g of protein with 1g of carbohydrate and 130 calories, and it's NSF Certified for Sport.

At $64.99 for 30 servings it works out at about $2.17 a serving — around $1.55 for every 20g of protein. An unflavored version is available if you'd rather mix it into food or a smoothie.

Best for: most cyclists, including those in tested events.

### Also NSF certified: Momentous Whey Protein Isolate

Momentous is NSF Certified for Sport and provides 20g of protein per scoop with 2g of carbohydrate and 90 calories — a lighter serving than the others here. It's available unflavored.

It also contains ProHydrolase, a protease enzyme blend; the evidence for added digestive enzymes like this is mixed. At $59.99 for 25 servings ($2.40 a serving) it's the most expensive per gram of protein of the three isolates, at $2.40 for every 20g. Pello Score: 66.

Best for: riders in tested events who want a smaller serving.

### Most protein per dollar: Promix Whey Isolate

Promix provides 31g of protein per two-scoop serving, and at $68.99 for 30 servings it's the lowest cost per gram of protein here — about $1.48 for every 20g.

Two things to know: it has no third-party sport certification listed, and the version on Pello includes 9g of carbohydrate from sucrose per serving. Pello Score: 65.

Best for: riders who aren't drug tested and want the most protein for the money.

### Best recovery shake: Amacx Recovery Shake

If you'd otherwise drink a protein shake and eat a banana, this combines both: 20g of protein and 30g of carbohydrate (maltodextrin, fructose and sucrose) per serving. It's Informed Sport certified.

It costs more — $64.99 for 15 servings, about $4.33 a serving — because you're also paying for the carbohydrate. Pello Score: 69.

Best for: back-to-back training days, when glycogen needs restoring as well as muscle.

### For tendons and joints: Momentous Collagen Peptides

Collagen is not a complete protein and shouldn't replace whey. Its interest for cyclists is connective tissue. In a small 2017 study (Shaw et al.), 15g of gelatin taken with vitamin C an hour before exercise increased markers of collagen synthesis — promising, but early evidence.

Each Momentous Collagen packet provides 15g of protein (11.6g of collagen peptides plus 5.2g of Fortigel collagen hydrolysate) with 50mg of vitamin C, and it's NSF Certified for Sport. At $29.95 for 10 packets it's about $3.00 a serving. Pello Score: 75.

SwissRX Collagen is a popular alternative, but each scoop contains 5.2g of Fortigel — well short of the 15g used in that study — and it lists no sport certification. Pello Score: 44.

Best for: cyclists managing tendon or joint issues, alongside a proper training and rehab plan.

## Timing — what actually matters

The post-workout "anabolic window" is wider than gym lore suggests. Total daily protein matters most, and the ISSN notes that protein within about two hours after exercise is an effective strategy.

For cyclists the time-sensitive part is carbohydrate. If your next session is within about eight hours, the 2016 position stand recommends 1.0-1.2g of carbohydrate per kg of body weight per hour for the first four hours to restore glycogen quickly.

A practical protocol:

After hard rides: 20-40g of protein (about 0.25g per kg of body weight) with carbohydrate. A shake with a banana, a recovery shake or a proper meal all work.

Through the day: spread protein across 4-5 meals and snacks of 20-40g each rather than one or two large servings.

Before sleep on back-to-back training days: the ISSN reports that 30-40g of casein before sleep can increase overnight muscle protein synthesis.

## The bottom line

For most cyclists, a whey isolate after hard sessions is a simple way to reach a daily protein target that food alone can miss.

On Pello's data, Transparent Labs offers the best combination of protein per serving, NSF certification and price. Promix is the cheapest per gram of protein if you don't need a certified product. Amacx covers protein and carbohydrate in one shake, and Momentous Collagen is the option worth considering for connective tissue.

Use the Pello planner to build fueling and recovery around your next event.`,
  },
];

export function getAllPosts(): BlogPost[] {
  return BLOG_POSTS.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getPostBySlug(slug: string): BlogPost | null {
  return BLOG_POSTS.find(p => p.slug === slug) ?? null;
}
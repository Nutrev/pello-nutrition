// lib/brand-profiles.ts
// Facts about each brand, taken only from the brand's own website (checked 2026-09-28; the
// pages are listed in `sources`). A brand whose site doesn't state a fact has none here, and
// its page shows only what Pello's product data supports. `philosophy` is quoted verbatim.

export interface BrandProfile {
  founded?: number;
  hq?: string;
  origin?: string;      // one sentence on how or where the brand started, from its site
  philosophy?: string;  // the brand's own words
  sources: string[];
}

export const BRAND_PROFILES: Record<string, BrandProfile> = {
  "Arrae": { founded: 2020, origin: "Founded by husband-and-wife duo Siff and Nish.", philosophy: "We want women to feel empowered as their most authentic selves, all while choosing natural alternatives to wellness.", sources: ["https://www.arrae.com/"] },
  "Ascent": { hq: "Denver, Colorado", sources: ["https://www.ascentprotein.com/pages/about-ascent-protein"] },
  "Bare Performance Nutrition": { founded: 2012, hq: "Round Rock, Texas", origin: "Founded by Nick Bare in 2012, in his college apartment in Western Pennsylvania.", philosophy: "BPN makes third-party tested performance and health supplements for athletes committed to their goals.", sources: ["https://www.bareperformancenutrition.com/pages/about", "https://www.bareperformancenutrition.com/"] },
  "Beet It": { founded: 2005, origin: "Started bottling beetroot juice in 2005 and has supplied it for dietary nitrate research since 2008.", sources: ["https://www.beet-it.com/pages/our-story"] },
  "Berkeley Life": { founded: 2016, philosophy: "Berkeley Life’s mission is to help people understand the crucial role Nitric Oxide plays in their overall health.", sources: ["https://berkeleylife.com/pages/about"] },
  "Bicarb": { hq: "Osage, Iowa", sources: ["https://cdn.shopify.com/s/files/1/1515/2714/files/bicarb30_original_nfs_1080x1080.png?v=1784218444"] },
  "Blonyx": { origin: "Founded by Rowan Minnion, an athlete and exercise physiologist from the UK.", philosophy: "Blonyx is a sports nutrition company with an unwavering commitment to science, performance and your athletic ambition.", sources: ["https://blonyx.com/pages/about-us", "https://blonyx.com/"] },
  "Bobo's": { founded: 2003, sources: ["https://eatbobos.com/pages/our-story"] },
  "BodyBio": { founded: 1998, origin: "Founded in 1998 by Ed Kane; family owned and operated.", philosophy: "We create supplements to improve the health of every cell in the body.", sources: ["https://bodybio.com/"] },
  "BodyHealth": { philosophy: "Our all natural vitamins & supplements focus on quality, purity of ingredients, and are crafted to help you achieve & maintain optimum health.", sources: ["https://bodyhealth.com/"] },
  "Cadence": { founded: 2024, origin: "Founded in New York in 2024 by Ross MacKay and George Heaton.", philosophy: "Cadence creates premium electrolyte hydration and fuelling products designed to elevate daily discipline, performance and recovery.", sources: ["https://usecadence.com/pages/our-story", "https://usecadence.com/"] },
  "Clif": { philosophy: "From CLIF to LUNA to Zbar, we make foods to help fuel every moment in your day and everybody in your family.", sources: ["https://www.clifbar.com/"] },
  "Create": { philosophy: "Create Wellness: Daily creatine that fits your life: Delicious, convenient, and easy to stick with.", sources: ["https://trycreate.co/"] },
  "Datefix": { philosophy: "Whether running errands or running marathons, datefix is the first squeezable date that's as clean and versatile as it gets.", sources: ["https://datefix.com/"] },
  "Designs for Sport": { origin: "The NSF Certified for Sport division of Designs for Health, which was founded in 1989.", sources: ["https://designsforsport.com/pages/about-us"] },
  "First Endurance": { founded: 2002, philosophy: "First Endurance offers premium sports nutrition products that are designed to allow endurance athletes to effectively fuel their training and racing.", sources: ["https://firstendurance.com/pages/about", "https://firstendurance.com/"] },
  "Flow Formulas": { founded: 2017, origin: "Started in Colorado in 2017.", philosophy: "A new standard in endurance nutrition.", sources: ["https://flowformulas.com/pages/our-story", "https://flowformulas.com/"] },
  "GU Energy": { philosophy: "At GU Energy, we want to optimize every aspect of diet and nutrition and serve athletes everywhere along the way.", sources: ["https://guenergy.com/pages/about-us"] },
  "Hammer Nutrition": { founded: 1987, origin: "Founded in 1987 by Brian Frank.", philosophy: "Hammer Nutrition provides superior endurance fuels, supplements, education, & client support since 1987.", sources: ["https://hammernutrition.com/"] },
  "Honey Stinger": { hq: "Steamboat Springs, Colorado", origin: "Founded in Steamboat Springs, Colorado, where it's still headquartered.", sources: ["https://honeystinger.com/pages/about-us"] },
  "Huma": { founded: 2012, philosophy: "Hüma Gel is a real food energy gel: stomach-friendly, great-tasting, and easy-to-swallow.", sources: ["https://humagel.com/"] },
  "Infinit": { founded: 2004, hq: "Cincinnati, Ohio", origin: "Started in 2004 by a group of endurance athletes.", sources: ["https://infinitnutrition.us/pages/about-infinit-nutrition"] },
  "Laird Superfood": { founded: 2015, origin: "Co-founded in 2015 by big-wave surfer Laird Hamilton and Paul Hodge.", sources: ["https://lairdsuperfood.com/"] },
  "Lecka": { origin: "Founded by trail runners in Southeast Asia, using fruit sourced from Vietnamese farmers.", sources: ["https://www.getlecka.com/pages/about-us"] },
  "Momentous": { philosophy: "Momentous is a human performance company dedicated creating no-compromise products and tools that support the endless improvement of personal performance.", sources: ["https://www.livemomentous.com/"] },
  "Myprotein": { founded: 2004, philosophy: "We empower those who demand more, dedicated to delivering a range of quality sports nutrition products.", sources: ["https://www.myprotein.com/c/about-us/"] },
  "Novos": { founded: 2018, sources: ["https://novoslabs.com/about-novos-anti-aging-supplements/"] },
  "Näak": { founded: 2016, origin: "Founded in Canada in 2016.", philosophy: "We make performance and sustainable nutrition to help you go longer and farther.", sources: ["https://www.naak.com/pages/our-story", "https://www.naak.com/"] },
  "Onnit": { founded: 2011, origin: "Founded in 2011 by Aubrey Marcus.", sources: ["https://www.onnit.com/pages/about-us"] },
  "Optibac": { founded: 2004, sources: ["https://www.optibacprobiotics.com/about-us"] },
  "Optimum Nutrition": { founded: 1986, sources: ["https://www.optimumnutrition.com/pages/about-us"] },
  "Osmo Nutrition": { philosophy: "Osmo makes natural hydration, fuel and recovery products backed by peer-reviewed science which help athletes of every type feel and perform their best", sources: ["https://osmonutrition.com/"] },
  "PROBAR": { origin: "Founded in Park City, Utah.", philosophy: "PROBAR® makes plant-based, gluten-free, all-natural GMO-free certified protein meal bars and snacks for families, athletes, bug-out kits and more.", sources: ["https://theprobar.com/"] },
  "PURE Sports Nutrition": { founded: 2012, origin: "Founded in 2012 by brother and sister Simon Kraak and Marewa Sutherland.", philosophy: "Fuelling Clean Performance - the PURE Sports Nutrition range is made in New Zealand with premium ingredients.", sources: ["https://www.puresportsnutrition.com/pages/about-us", "https://www.puresportsnutrition.com/"] },
  "Precision Fuel & Hydration": { philosophy: "We help athletes personalize their hydration and fueling strategies so they can perform at their best.", sources: ["https://www.precisionhydration.com/us/en/"] },
  "Qualia": { founded: 2015, hq: "Carlsbad, California", sources: ["https://www.qualialife.com/"] },
  "Quicksilver Scientific": { founded: 2006, sources: ["https://www.quicksilverscientific.com/pages/our-story"] },
  "Rawvelo": { philosophy: "We have created a range of vegan sports nutrition that helps to sustain the planet as well as your performance.", sources: ["https://rawvelo.com/pages/environmental"] },
  "Science in Sport": { founded: 1992, sources: ["https://www.scienceinsport.com/about-us"] },
  "Skratch Labs": { philosophy: "Skratch Labs offers real food-based sports nutrition for athletes, featuring hydration mixes, energy bars, and recovery drinks made with real food ingredients.", sources: ["https://www.skratchlabs.com/"] },
  "Spring Energy": { founded: 2014, sources: ["https://myspringenergy.com/pages/about-spring-energy"] },
  "Styrkr": { founded: 2018, origin: "Started in 2018 by Christian Sanderson.", philosophy: "The STYRKR sports fuel range was developed with one clear focus: to help everyday athletes reach their next endurance goal.", sources: ["https://styrkr.com/pages/about-us"] },
  "SwissRX": { philosophy: "SwissRX takes a \"spare-no-expense\" approach to producing the highest quality, pharmaceutical-grade products, to help athletes achieve their best.", sources: ["https://swissrx.com/"] },
  "Tailwind Nutrition": { founded: 2012, origin: "Founded in Durango, Colorado, in 2012.", sources: ["https://tailwindnutrition.com/pages/our-story"] },
  "Thorne": { hq: "Summerville, South Carolina", sources: ["https://d1vo8zfysxy97v.cloudfront.net/media/product/m272__v6bb9882930f789e7535f8c76a31ad55b39900810.png"] },
  "Trail Butter": { hq: "Sisters, Oregon", sources: ["https://www.trailbutter.com/"] },
  "Transparent Labs": { philosophy: "Transparent Labs offers a full suite of all-natural sports supplements that provide 100% formula transparency with science-backed ingredients at clinically tested dosages.", sources: ["https://www.transparentlabs.com/"] },
  "Truwild": { philosophy: "TRUWILD offers clean, all-natural supplements for hydration, energy, recovery & gut health.", sources: ["https://truwild.com/"] },
  "Vital Proteins": { founded: 2013, sources: ["https://www.vitalproteins.com/pages/our-story"] },
};

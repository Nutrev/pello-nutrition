// lib/category-groups.ts
// How product categories are grouped in the nav's Products menu and the home page's
// top picks. A category that isn't listed falls under "Other", so new categories
// never go missing.

export const CATEGORY_GROUPS: { label: string; short: string; categories: string[] }[] = [
  { label: "Fuel & hydration", short: "Fuel", categories: ["Energy Gel", "Energy Chew", "Energy Bar", "Energy", "Carbohydrate Mix", "Hydration"] },
  { label: "Strength & recovery", short: "Strength & recovery", categories: ["Protein", "Creatine", "Recovery", "Performance"] },
  { label: "Health & wellbeing", short: "Health", categories: ["Vitamin", "Mineral", "Omega-3", "Immune", "Greens", "Probiotic", "Gut Health", "Sleep", "Supplement"] },
];

export const OTHER_GROUP = "Other";

export function categoryGroup(category: string): string {
  return CATEGORY_GROUPS.find((g) => g.categories.includes(category))?.label ?? OTHER_GROUP;
}

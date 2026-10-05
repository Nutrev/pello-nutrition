// Pello Score grade bands, kept apart from the scoring code so client components can show a
// grade without bundling the ingredient taxonomy.
export function getFulensScoreLabel(score: number): {
  label: string;
  color: string;
  description: string;
} {
  if (score >= 90) return {
    label: "Exceptional",
    color: "#2D4A2D",
    description: "Best in class — top science, transparency and athlete experience",
  };
  if (score >= 75) return {
    label: "Excellent",
    color: "#3B6D11",
    description: "Strong across all pillars — highly recommended",
  };
  if (score >= 60) return {
    label: "Good",
    color: "#C8860A",
    description: "Above average — minor trade-offs worth knowing about",
  };
  if (score >= 45) return {
    label: "Average",
    color: "#8A8478",
    description: "Meets the basics — check individual pillar scores",
  };
  if (score >= 25) return {
    label: "Below average",
    color: "#B84C2E",
    description: "Notable weaknesses in one or more pillars",
  };
  return {
    label: "Poor",
    color: "#8B1A1A",
    description: "Significant concerns — transparency or evidence issues",
  };
}

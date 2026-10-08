// Pello Score grade bands, kept apart from the scoring code so client components can show a
// grade without bundling the ingredient taxonomy. The methodology page lists these bands too.

export interface ScoreBand {
  min: number;
  max: number;
  label: string;
  color: string;
  description: string;
}

// Highest first.
export const SCORE_BANDS: ScoreBand[] = [
  { min: 90, max: 100, label: "Exceptional", color: "#2D4A2D", description: "Best in class — top science, transparency and athlete experience" },
  { min: 75, max: 89, label: "Excellent", color: "#3B6D11", description: "Strong across all pillars — highly recommended" },
  { min: 60, max: 74, label: "Good", color: "#C8860A", description: "Above average — minor trade-offs worth knowing about" },
  { min: 45, max: 59, label: "Average", color: "#8A8478", description: "Meets the basics — check individual pillar scores" },
  { min: 25, max: 44, label: "Below average", color: "#B84C2E", description: "Notable weaknesses in one or more pillars" },
  { min: 0, max: 24, label: "Poor", color: "#8B1A1A", description: "Significant concerns — transparency or evidence issues" },
];

export function getFulensScoreLabel(score: number): { label: string; color: string; description: string } {
  const band = SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1];
  return { label: band.label, color: band.color, description: band.description };
}

// lib/fuelling.ts
// Intensity labels for the carb calculator (app/guides/carb-calculator) and the quick fuel
// calculator on the home page. The carb, sodium and fluid figures themselves come from
// lib/fueling.ts, the same rules as the planner.

export const INTENSITY_MULTIPLIERS = {
  easy: { label: "Easy / Recovery", desc: "Conversational pace, Z1-Z2" },
  moderate: { label: "Moderate", desc: "Steady effort, Z2-Z3" },
  hard: { label: "Hard", desc: "Threshold / tempo, Z3-Z4" },
  race: { label: "Race pace", desc: "Maximum effort, Z4-Z5" },
};

export type Intensity = keyof typeof INTENSITY_MULTIPLIERS;

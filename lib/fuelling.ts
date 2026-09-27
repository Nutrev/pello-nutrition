// lib/fuelling.ts
// Carbohydrate and sweat targets by workout intensity, shared by the carb calculator
// (app/guides/carb-calculator) and the quick fuel calculator on the home page.

export const INTENSITY_MULTIPLIERS = {
  easy: { label: "Easy / Recovery", desc: "Conversational pace, Z1-Z2", carbs: 30, sweat: 0.5 },
  moderate: { label: "Moderate", desc: "Steady effort, Z2-Z3", carbs: 50, sweat: 0.8 },
  hard: { label: "Hard", desc: "Threshold / tempo, Z3-Z4", carbs: 70, sweat: 1.1 },
  race: { label: "Race pace", desc: "Maximum effort, Z4-Z5", carbs: 90, sweat: 1.4 },
};

export type Intensity = keyof typeof INTENSITY_MULTIPLIERS;

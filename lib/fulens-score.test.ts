import { describe, expect, it } from "vitest";
import { hasDisclosedDose } from "./fulens-score";

describe("hasDisclosedDose", () => {
  it("counts real amounts", () => {
    for (const d of ["25g carbs", "400mg", "5,000 IU", "80% of the shot", "About 500mg"]) expect(hasDisclosedDose(d)).toBe(true);
  });
  it("doesn't count blanks or notes that the amount is hidden", () => {
    for (const d of [undefined, "", "  ", "Amount not listed", "Amounts not listed on The Feed", "Not listed on The Feed", "42% of the shot (nitrate amount not listed)"]) expect(hasDisclosedDose(d)).toBe(false);
  });
});

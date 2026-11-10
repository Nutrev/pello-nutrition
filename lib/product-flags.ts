// lib/product-flags.ts
// Yes/no facts about a product that several features share (swaps on report pages, category and
// search filters, the drug-tested page, the supplement finder), so each one means the same thing
// everywhere. Client-safe: definitions only, no product data.

import { SPORT_TESTING, STANDARD_BY_ID, standardsFrom } from "./quality-standards";

// The sport-testing certifications Pello tracks, by their product-listing names: NSF Certified for
// Sport, Informed Sport and Cologne List. NSF and Informed Sport test for banned substances batch
// by batch; the Cologne List analyses a product at least once a year (see lib/quality-standards.ts).
export const SPORT_TESTED_CERTS: string[] = SPORT_TESTING.map((id) => STANDARD_BY_ID[id].name);

// The sport-testing certifications a product holds.
export function sportTestedCerts(certifications: string[] | undefined): string[] {
  return (certifications ?? []).filter((c) => SPORT_TESTED_CERTS.includes(c));
}

export function isSportTested(certifications: string[] | undefined): boolean {
  return standardsFrom(certifications).some((s) => SPORT_TESTING.includes(s));
}

// Caffeine and other stimulants, by name: in the product name or any ingredient.
const STIMULANTS = /caffeine|guarana|coffee|green tea|matcha|yerba|cola nut|kola|theacrine|teacrine|synephrine|yohimb|energy blend|energy complex/i;

interface StimulantFacts {
  name: string;
  nutrition: { hasCaffeine: boolean };
  ingredients: { name: string }[];
}

// Caffeine or another stimulant anywhere: a caffeinated flavor counts even when the caffeine varies
// by flavor (nutrition.hasCaffeine), and so does caffeine inside a blend.
export function hasStimulant(p: StimulantFacts): boolean {
  return p.nutrition.hasCaffeine || STIMULANTS.test(p.name) || p.ingredients.some((i) => STIMULANTS.test(i.name));
}

// Caffeine-free: no caffeine recorded and no stimulant named anywhere on the label.
export function isCaffeineFree(p: StimulantFacts): boolean {
  return !hasStimulant(p);
}

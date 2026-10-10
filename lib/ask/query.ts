// lib/ask/query.ts
// "Ask Pello": the structured query a plain-English question is turned into, its JSON schema
// (sent to Claude as a structured-output format, so the model can only pick from Pello's own fields)
// and a validator that checks the model's output again before anything runs.
//
// The model never writes the answer. It only fills in this query; lib/ask/run.ts runs it on Pello's
// product data, and lib/ask/describe.ts says in plain words how the question was read.
import type { Category } from "../products";
import type { StandardChoice } from "../quality-standards";

export const ASK_CATEGORIES: Category[] = [
  "Energy Gel", "Energy Chew", "Energy Bar", "Carbohydrate Mix", "Hydration", "Protein", "Creatine",
  "Recovery", "Performance", "Supplement", "Vitamin", "Mineral", "Omega-3", "Probiotic", "Sleep",
  "Gut Health", "Immune", "Greens",
];

// Numbers a question can filter or sort by. Every one is a field Pello's data has.
export const NUMERIC_FIELDS = [
  "carbsPerServing", "sodiumPerServing", "caffeinePerServing", "proteinPerServing",
  "pricePerServing", "costPerGramCarb", "rating", "reviewCount", "pelloScore",
] as const;
export type NumericField = (typeof NUMERIC_FIELDS)[number];

export const ASK_CERTIFICATIONS: StandardChoice[] = ["sport-tested", "nsf-sport", "informed-sport", "cologne-list", "usda-organic", "non-gmo-project"];

export const UNSUPPORTED_REASONS = ["taste", "texture", "gi_comfort", "effectiveness", "other"] as const;
export type UnsupportedReason = (typeof UNSUPPORTED_REASONS)[number];

export interface AskQuery {
  supported: boolean;
  unsupportedReason: UnsupportedReason | null;
  categories: Category[];
  brand: string | null;
  filters: { field: NumericField; op: "gte" | "lte"; value: number }[];
  vegan: boolean | null;        // true: only products labeled vegan
  glutenFree: boolean | null;   // true: only products labeled gluten-free
  hydrogel: boolean | null;     // true: only hydrogel products
  caffeine: "with" | "without" | null;
  certifications: StandardChoice[];
  sort: { field: NumericField; direction: "desc" | "asc" } | null;
  limit: number;                // 1-20
}

export const MAX_LIMIT = 20;
export const DEFAULT_LIMIT = 10;

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: "null" }] });

// JSON schema for the structured output. Every property is required and no others are allowed.
export const ASK_QUERY_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["supported", "unsupportedReason", "categories", "brand", "filters", "vegan", "glutenFree", "hydrogel", "caffeine", "certifications", "sort", "limit"],
  properties: {
    supported: { type: "boolean" },
    unsupportedReason: nullable({ type: "string", enum: [...UNSUPPORTED_REASONS] }),
    categories: { type: "array", items: { type: "string", enum: ASK_CATEGORIES } },
    brand: nullable({ type: "string" }),
    filters: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["field", "op", "value"],
        properties: {
          field: { type: "string", enum: [...NUMERIC_FIELDS] },
          op: { type: "string", enum: ["gte", "lte"] },
          value: { type: "number" },
        },
      },
    },
    vegan: nullable({ type: "boolean" }),
    glutenFree: nullable({ type: "boolean" }),
    hydrogel: nullable({ type: "boolean" }),
    caffeine: nullable({ type: "string", enum: ["with", "without"] }),
    certifications: { type: "array", items: { type: "string", enum: ASK_CERTIFICATIONS } },
    sort: nullable({
      type: "object",
      additionalProperties: false,
      required: ["field", "direction"],
      properties: {
        field: { type: "string", enum: [...NUMERIC_FIELDS] },
        direction: { type: "string", enum: ["desc", "asc"] },
      },
    }),
    limit: { type: "integer" },
  },
} as const;

const oneOf = <T extends string>(v: unknown, list: readonly T[]): v is T => typeof v === "string" && (list as readonly string[]).includes(v);
const boolOrNull = (v: unknown) => (typeof v === "boolean" ? v : null);

// Checks the model's output against the schema again (never trust it blindly) and normalizes it.
// Returns null if it isn't a valid query.
export function parseAskQuery(raw: unknown): AskQuery | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.supported !== "boolean") return null;
  const filters: AskQuery["filters"] = [];
  for (const f of Array.isArray(r.filters) ? r.filters : []) {
    const x = f as Record<string, unknown>;
    if (!oneOf(x?.field, NUMERIC_FIELDS) || !oneOf(x?.op, ["gte", "lte"] as const) || typeof x.value !== "number" || !Number.isFinite(x.value) || x.value < 0) return null;
    filters.push({ field: x.field, op: x.op, value: x.value });
  }
  const s = r.sort as Record<string, unknown> | null | undefined;
  let sort: AskQuery["sort"] = null;
  if (s) {
    if (!oneOf(s.field, NUMERIC_FIELDS) || !oneOf(s.direction, ["desc", "asc"] as const)) return null;
    sort = { field: s.field, direction: s.direction };
  }
  const categories = Array.isArray(r.categories) ? r.categories.filter((c): c is Category => oneOf(c, ASK_CATEGORIES)) : [];
  const certifications = Array.isArray(r.certifications) ? r.certifications.filter((c): c is StandardChoice => oneOf(c, ASK_CERTIFICATIONS)) : [];
  const brand = typeof r.brand === "string" && r.brand.trim() ? r.brand.trim().slice(0, 60) : null;
  const limit = typeof r.limit === "number" && Number.isFinite(r.limit) ? Math.min(MAX_LIMIT, Math.max(1, Math.round(r.limit))) : DEFAULT_LIMIT;
  return {
    supported: r.supported,
    unsupportedReason: r.supported ? null : oneOf(r.unsupportedReason, UNSUPPORTED_REASONS) ? r.unsupportedReason : "other",
    categories: Array.from(new Set(categories)),
    brand,
    filters,
    vegan: boolOrNull(r.vegan),
    glutenFree: boolOrNull(r.glutenFree),
    hydrogel: boolOrNull(r.hydrogel),
    caffeine: oneOf(r.caffeine, ["with", "without"] as const) ? r.caffeine : null,
    certifications: Array.from(new Set(certifications)),
    sort,
    limit,
  };
}

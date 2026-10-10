// lib/ask/access.ts
// How many Ask Pello results a visitor sees: free visitors the top few, Pro members the full list.
// While Pro is switched off, everyone counts as Pro (as with every other Pro feature).
export const FREE_RESULTS = 3;

export function limitForAccess(limit: number, allowed: boolean): number {
  return allowed ? limit : Math.min(limit, FREE_RESULTS);
}

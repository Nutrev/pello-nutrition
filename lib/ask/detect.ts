// lib/ask/detect.ts
// Whether a search-box entry reads as a question for Ask Pello rather than a product or brand name.
// Plain names ("Maurten", "gu roctane gel") keep searching by name, as before.

const QUESTION_START = /^(what|whats|what's|which|how|who|best|top|cheapest|highest|lowest|most|least|show|find|list|any|is|are|does|do)\b/i;
const QUESTION_WORDS = /\b(most|least|highest|lowest|cheapest|best|top \d+|under|over|below|above|more than|less than|at least|at most|per serving|per gel|per bar|per scoop|without|caffeine[- ]free|vegan|gluten[- ]free|rated|reviews?|value)\b/i;

export function looksLikeQuestion(text: string): boolean {
  const t = text.trim();
  if (t.length < 8 || t.split(/\s+/).length < 3) return false;
  return t.endsWith("?") || QUESTION_START.test(t) || QUESTION_WORDS.test(t) || /\$\s?\d/.test(t);
}

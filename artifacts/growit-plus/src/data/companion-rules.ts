/**
 * Companion planting conflict pairs — source of truth for both
 * prompt injection (future AI) and grid adjacency validation.
 * Based on PRD V10 Section 11.3.
 *
 * Each pair is bidirectional: [A, B] means A conflicts with B and vice-versa.
 */
export const COMPANION_CONFLICTS: [string, string][] = [
  // Tomatoes avoid Broccoli, Cabbage, Kale, Dill, Potatoes
  ["Tomatoes",   "Broccoli"],
  ["Tomatoes",   "Cabbage"],
  ["Tomatoes",   "Kale"],
  ["Tomatoes",   "Dill"],
  ["Tomatoes",   "Potatoes"],

  // Beans avoid Chives, Broccoli, Cabbage, Kale, Beets
  ["Beans",      "Chives"],
  ["Beans",      "Broccoli"],
  ["Beans",      "Cabbage"],
  ["Beans",      "Kale"],
  ["Beans",      "Beets"],

  // Peas avoid Chives
  ["Peas",       "Chives"],

  // Cucumbers avoid Sage, Potatoes, Mint
  ["Cucumbers",  "Sage"],
  ["Cucumbers",  "Potatoes"],
  ["Cucumbers",  "Mint"],

  // Potatoes avoid Zucchini (Tomatoes already listed above)
  ["Potatoes",   "Zucchini"],

  // Basil and Sage conflict
  ["Basil",      "Sage"],

  // Lettuce avoids Parsley; Mint avoids Parsley
  ["Lettuce",    "Parsley"],
  ["Mint",       "Parsley"],
];

/** True when plant names A and B are a known conflict pair (order-independent). */
export function areConflicting(a: string, b: string): boolean {
  return COMPANION_CONFLICTS.some(
    ([x, y]) => (x === a && y === b) || (x === b && y === a)
  );
}

/**
 * Returns the set of plant names that are in at least one conflict pair
 * within the provided plant list (list-level check — used for the banner notice).
 */
export function detectConflicts(plantNames: string[]): Set<string> {
  const conflicts = new Set<string>();
  const nameSet = new Set(plantNames);
  for (const [a, b] of COMPANION_CONFLICTS) {
    if (nameSet.has(a) && nameSet.has(b)) {
      conflicts.add(a);
      conflicts.add(b);
    }
  }
  return conflicts;
}

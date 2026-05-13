// Pairs of plant names that are INCOMPATIBLE (show warning, don't block)
export const COMPANION_CONFLICTS: [string, string][] = [
  ["Tomatoes", "Beets"],
  ["Tomatoes", "Cabbage"],
  ["Tomatoes", "Potatoes"],
  ["Peas", "Garlic"],
  ["Peas", "Onions"],
  ["Beans", "Onions"],
  ["Fennel", "Tomatoes"],
  ["Mint", "Basil"],
  ["Dill", "Tomatoes"],
  ["Beets", "Beans"],
];

// Returns a set of conflict pairs present in the selected plant list
export function detectConflicts(plantNames: string[]): Set<string> {
  const conflicts = new Set<string>();
  for (const [a, b] of COMPANION_CONFLICTS) {
    if (plantNames.includes(a) && plantNames.includes(b)) {
      conflicts.add(a);
      conflicts.add(b);
    }
  }
  return conflicts;
}

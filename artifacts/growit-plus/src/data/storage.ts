const STORAGE_KEY = "growit_plan";

export function savePlan(plan: any): void {
  try {
    // Convert sets to arrays before saving
    const planToSave = {
      ...plan,
      conflicts: Array.from(plan.conflicts || []),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planToSave));
  } catch (e) {
    console.warn("Could not save plan to localStorage", e);
  }
}

export function loadPlan(): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const plan = JSON.parse(raw);
    // Rehydrate sets
    if (plan.conflicts) {
      plan.conflicts = new Set(plan.conflicts);
    }
    return plan;
  } catch (e) {
    return null;
  }
}

export function clearPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

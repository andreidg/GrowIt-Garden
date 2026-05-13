/**
 * GrowIt+ Plan Persistence
 * Saves and restores the latest generated plan using localStorage.
 * Uses sessionStorage as a secondary signal for same-tab continuity.
 * The GeneratedPlan type is serialization-safe (no Sets or Date objects).
 */

import type { GeneratedPlan } from "@/types/garden";

const STORAGE_KEY = "growit_plan_v3";

export function savePlan(plan: GeneratedPlan): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  } catch {
    // Storage quota exceeded or unavailable — fail silently
  }
}

export function loadPlan(): GeneratedPlan | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const plan = JSON.parse(raw) as GeneratedPlan;
    // Basic shape validation: must have id + profile + grid
    if (!plan.id || !plan.profile || !plan.grid) return null;
    return plan;
  } catch {
    return null;
  }
}

export function clearPlan(): void {
  localStorage.removeItem(STORAGE_KEY);
}

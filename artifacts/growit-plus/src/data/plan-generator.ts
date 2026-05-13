/**
 * GrowIt+ Deterministic Plan Generator
 * Selects plants, builds the garden grid (with adjacency-based companion validation),
 * and generates a week-by-week schedule anchored to regional frost dates.
 * PRD V10 Section 12.2 — deterministic fallback generator.
 */

import type {
  GardenProfile,
  GrowingRegion,
  GeneratedPlan,
  MapCell,
  WeeklyScheduleItem,
  PlantAction,
  ValidationResult,
} from "@/types/garden";
import { VEGETABLES, HERBS, FLOWERS, type PlantItem } from "@/data/plants";
import { detectConflicts, areConflicting } from "@/data/companion-rules";

export type { GardenProfile, GrowingRegion, GeneratedPlan, MapCell, WeeklyScheduleItem, PlantAction, PlantItem };

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete deterministic garden plan from a profile + region.
 * No API calls — pure synchronous logic suitable for demo resilience.
 */
export function generatePlan(profile: GardenProfile, region: GrowingRegion): GeneratedPlan {
  const selectedPlants = selectPlants(profile);
  const grid = buildGrid(selectedPlants, profile.lengthFt, profile.widthFt);
  const schedule = buildSchedule(selectedPlants, region);

  // Collect names of plants that have an adjacent conflict in the grid
  const conflictSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell.hasConflict && cell.plant) conflictSet.add(cell.plant.name);
    }
  }
  const conflicts = Array.from(conflictSet);

  // List-level conflicts (for the banner notice) covers plants anywhere in the selection
  const listConflicts = detectConflicts(selectedPlants.map(p => p.name));

  const validation: ValidationResult = {
    plantWhitelistPassed: selectedPlants.every(p => p.isWhitelisted),
    companionValidationPassed: conflicts.length === 0,
    adjacentConflictCount: conflicts.length,
    warnings: conflicts.length > 0
      ? [`Adjacent companion conflicts: ${conflicts.join(", ")}`]
      : [],
  };

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generationMode: "deterministic",
    profile,
    region,
    selectedPlants,
    grid,
    schedule,
    conflicts,
    validation,
  };
}

// ---------------------------------------------------------------------------
// Plant selection
// ---------------------------------------------------------------------------

function selectPlants(profile: GardenProfile): PlantItem[] {
  let pool: PlantItem[] = [...VEGETABLES];

  if (
    profile.plantPreference === "Vegetables + Herbs" ||
    profile.plantPreference === "Vegetables + Herbs + Flowers"
  ) {
    pool = [...pool, ...HERBS];
  }
  if (
    profile.plantPreference === "Vegetables + Herbs + Flowers" ||
    profile.plantPreference === "Vegetables + Flowers"
  ) {
    pool = [...pool, ...FLOWERS];
  }

  // Sunlight filtering
  pool = pool.filter(p => {
    if (profile.sunlight === "Full Sun") return true;
    if (profile.sunlight === "Partial Shade") {
      return p.minSunlight === "Partial Shade" || p.minSunlight === "Full Sun";
    }
    // Full Shade: only shade-tolerant plants
    return p.minSunlight === "Partial Shade";
  });

  // Container gardens: exclude plants that need more than 1 sq ft of spacing
  if (profile.soilType === "Container/Pots") {
    pool = pool.filter(p => p.spacingFt <= 1);
  }

  // Small garden: reduce variety to compact plants only
  const totalArea = profile.lengthFt * profile.widthFt;
  if (totalArea < 16) {
    pool = pool.filter(p => p.spacingFt <= 1);
  }

  // Select plants that fit within the garden area (one instance each)
  const sorted = [...pool].sort((a, b) => a.spacingFt - b.spacingFt);
  const selected: PlantItem[] = [];
  let usedArea = 0;

  for (const plant of sorted) {
    const fits = Math.floor((totalArea - usedArea) / plant.spacingFt);
    if (fits >= 1) {
      selected.push(plant);
      usedArea += plant.spacingFt;
    }
    if (usedArea >= totalArea * 0.8) break;
  }

  return selected.length > 0 ? selected : pool.slice(0, 4);
}

// ---------------------------------------------------------------------------
// Garden grid — with adjacency-based companion validation
// ---------------------------------------------------------------------------

function buildGrid(plants: PlantItem[], lengthFt: number, widthFt: number): MapCell[][] {
  const rows = widthFt;
  const cols = lengthFt;

  // Initialise empty grid
  const grid: MapCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ plant: null, hasConflict: false }))
  );

  // Round-robin plant fill
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (plants.length === 0) break;
      grid[r][c] = { plant: plants[idx % plants.length], hasConflict: false };
      idx++;
    }
  }

  // PRD P0: adjacency-based companion conflict check (4-directional neighbours)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.plant) continue;

      const neighbours: MapCell[] = [
        r > 0        ? grid[r - 1][c] : null,
        r < rows - 1 ? grid[r + 1][c] : null,
        c > 0        ? grid[r][c - 1] : null,
        c < cols - 1 ? grid[r][c + 1] : null,
      ].filter((n): n is MapCell => n !== null);

      for (const nb of neighbours) {
        if (nb.plant && areConflicting(cell.plant.name, nb.plant.name)) {
          cell.hasConflict = true;
          nb.hasConflict = true;
        }
      }
    }
  }

  return grid;
}

// ---------------------------------------------------------------------------
// Weekly schedule — from today through first fall frost
// ---------------------------------------------------------------------------

function buildSchedule(plants: PlantItem[], region: GrowingRegion): WeeklyScheduleItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  const lastFrost = parseFrostDate(region.lastSpringFrost, year);
  const firstFallFrost = parseFrostDate(region.firstFallFrost, year);

  // Start from the beginning of the current week (Sunday)
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const weeks: WeeklyScheduleItem[] = [];

  while (cursor <= firstFallFrost) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const isCurrent = today >= weekStart && today <= weekEnd;
    const actions: PlantAction[] = [];

    for (const plant of plants) {
      if (plant.startIndoors && plant.indoorWeeksAhead) {
        // Indoor start date
        const indoorDate = new Date(lastFrost);
        indoorDate.setDate(indoorDate.getDate() - plant.indoorWeeksAhead * 7);
        if (indoorDate >= weekStart && indoorDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "start_indoors",
            description: `Start ${plant.name} indoors (${plant.indoorWeeksAhead} weeks before last frost)`,
          });
        }
        // Transplant date = 1 week after last frost
        const transplantDate = new Date(lastFrost);
        transplantDate.setDate(transplantDate.getDate() + 7);
        if (transplantDate >= weekStart && transplantDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "transplant",
            description: `Transplant ${plant.name} seedlings outdoors`,
          });
        }
      } else if (plant.directSow) {
        const sowDate = new Date(lastFrost);
        sowDate.setDate(sowDate.getDate() - plant.weeksBeforeFrost * 7);
        if (sowDate >= weekStart && sowDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "direct_sow",
            description: `Direct sow ${plant.name} outdoors`,
          });
        }
      }
    }

    weeks.push({
      weekLabel: `Week of ${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`,
      weekStartDate: weekStart.toISOString(),
      isCurrent,
      hasActions: actions.length > 0,
      actions,
      notes: actions.length === 0
        ? "No actions this week — water and watch! 💧"
        : `${actions.length} action${actions.length > 1 ? "s" : ""}: ${actions.map(a => a.plant.name).join(", ")}`,
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrostDate(dateStr: string, year: number): Date {
  return new Date(`${dateStr} ${year}`);
}

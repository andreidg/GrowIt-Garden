import { VEGETABLES, HERBS, FLOWERS, Plant } from "./plants";
import { FrostData } from "./locations";
import { detectConflicts, areConflicting } from "./companion-rules";

export type SunlightLevel = "Full Sun" | "Partial Shade" | "Full Shade";
export type SoilType = "Raised Bed" | "In-Ground Clay" | "In-Ground Loam" | "Container/Pots";
export type PlantPreference = "Vegetables Only" | "Vegetables + Herbs" | "Vegetables + Herbs + Flowers" | "Vegetables + Flowers";

export interface GardenSetup {
  region: string;
  lengthFt: number;
  widthFt: number;
  sunlight: SunlightLevel;
  soilType: SoilType;
  plantPreference: PlantPreference;
  unitPreference?: "ft" | "m";
}

export interface GridCell {
  plant: Plant | null;
  hasConflict: boolean;
}

export interface WeekEntry {
  weekLabel: string;        // "Week of May 12"
  weekStart: Date;
  isCurrent: boolean;
  actions: PlantAction[];
  explanation: string;
}

export interface PlantAction {
  plant: Plant;
  actionType: "start_indoors" | "direct_sow" | "transplant" | "harvest_soon";
  description: string;
}

export interface GardenPlan {
  setup: GardenSetup;
  frostData: FrostData;
  selectedPlants: Plant[];
  grid: GridCell[][];       // [row][col], dimensions = widthFt x lengthFt
  schedule: WeekEntry[];
  conflicts: Set<string>;
  generatedAt: string;      // ISO date string
}

/**
 * Main entry point. Generates a complete garden plan deterministically.
 * No API calls — pure local logic.
 */
export function generatePlan(setup: GardenSetup, frostData: FrostData): GardenPlan {
  // 1. Select plants based on sunlight + preference + soil constraints
  const candidatePlants = selectCandidatePlants(setup);
  
  // 2. Detect companion planting conflicts (warn, don't block)
  const conflicts = detectConflicts(candidatePlants.map(p => p.name));
  
  // 3. Fill the garden grid
  const grid = buildGrid(candidatePlants, setup.lengthFt, setup.widthFt);
  
  // 4. Build week-by-week schedule from today through first fall frost
  const schedule = buildSchedule(candidatePlants, frostData);
  
  return {
    setup,
    frostData,
    selectedPlants: candidatePlants,
    grid,
    schedule,
    conflicts,
    generatedAt: new Date().toISOString(),
  };
}

function selectCandidatePlants(setup: GardenSetup): Plant[] {
  let pool: Plant[] = [...VEGETABLES];
  if (setup.plantPreference === "Vegetables + Herbs" || setup.plantPreference === "Vegetables + Herbs + Flowers") {
    pool = [...pool, ...HERBS];
  }
  if (setup.plantPreference === "Vegetables + Herbs + Flowers" || setup.plantPreference === "Vegetables + Flowers") {
    pool = [...pool, ...FLOWERS];
  }
  
  // Filter by sunlight: Full Shade can only grow shade-tolerant plants
  // Partial Shade can grow partial + any; Full Sun gets everything
  pool = pool.filter(p => {
    if (setup.sunlight === "Full Sun") return true;
    if (setup.sunlight === "Partial Shade") return p.minSunlight === "Partial Shade" || p.minSunlight === "Full Sun";
    // Full Shade: only partial shade tolerant plants
    return p.minSunlight === "Partial Shade";
  });
  
  // Container gardens: exclude large-spacing plants
  if (setup.soilType === "Container/Pots") {
    pool = pool.filter(p => p.spacingFt <= 1);
  }
  
  // Calculate how many plants fit given the garden area
  const totalArea = setup.lengthFt * setup.widthFt;
  const selected: Plant[] = [];
  let usedArea = 0;
  
  // Sort by spacing ascending (fill with more variety)
  const sorted = [...pool].sort((a, b) => a.spacingFt - b.spacingFt);
  
  for (const plant of sorted) {
    const needed = Math.max(1, Math.floor(totalArea / sorted.length));
    const fits = Math.floor((totalArea - usedArea) / plant.spacingFt);
    if (fits >= 1) {
      selected.push(plant);
      usedArea += plant.spacingFt;
    }
    if (usedArea >= totalArea * 0.8) break;
  }
  
  return selected.length > 0 ? selected : pool.slice(0, 4);
}

function buildGrid(plants: Plant[], lengthFt: number, widthFt: number): GridCell[][] {
  // Grid is widthFt rows x lengthFt cols, each cell = 1 sq ft
  const rows = widthFt;
  const cols = lengthFt;
  const grid: GridCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ plant: null, hasConflict: false }))
  );

  // Fill cells in a round-robin pattern
  let plantIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (plants.length === 0) break;
      grid[r][c] = { plant: plants[plantIdx % plants.length], hasConflict: false };
      plantIdx++;
    }
  }

  // PRD P0: validate adjacent cell pairings (4-directional neighbours)
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (!cell.plant) continue;
      const neighbours: GridCell[] = [
        r > 0           ? grid[r - 1][c] : null,
        r < rows - 1    ? grid[r + 1][c] : null,
        c > 0           ? grid[r][c - 1] : null,
        c < cols - 1    ? grid[r][c + 1] : null,
      ].filter((n): n is GridCell => n !== null);

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

function buildSchedule(plants: Plant[], frostData: FrostData): WeekEntry[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Parse frost dates for current year
  const currentYear = today.getFullYear();
  const lastFrostDate = parseFrostDate(frostData.lastSpringFrost, currentYear);
  const firstFallFrostDate = parseFrostDate(frostData.firstFallFrost, currentYear);
  
  // Start from today (or beginning of current week)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - startDate.getDay()); // go back to Sunday
  
  const weeks: WeekEntry[] = [];
  const cursor = new Date(startDate);
  
  while (cursor <= firstFallFrostDate) {
    const weekStart = new Date(cursor);
    const weekEnd = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);
    
    const isCurrent = today >= weekStart && today <= weekEnd;
    
    const actions: PlantAction[] = [];
    
    for (const plant of plants) {
      // Determine the action date for this plant
      if (plant.startIndoors && plant.indoorWeeksAhead) {
        const indoorDate = new Date(lastFrostDate);
        indoorDate.setDate(indoorDate.getDate() - plant.indoorWeeksAhead * 7);
        if (indoorDate >= weekStart && indoorDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "start_indoors",
            description: `Start ${plant.name} indoors (${plant.indoorWeeksAhead} weeks before last frost)`,
          });
        }
        // Transplant date = after last frost
        const transplantDate = new Date(lastFrostDate);
        transplantDate.setDate(transplantDate.getDate() + 7);
        if (transplantDate >= weekStart && transplantDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "transplant",
            description: `Transplant ${plant.name} seedlings outdoors`,
          });
        }
      } else if (plant.directSow) {
        const sowDate = new Date(lastFrostDate);
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
      weekStart: new Date(weekStart),
      isCurrent,
      actions,
      explanation: actions.length === 0
        ? "No actions this week — just water and watch!"
        : `${actions.length} action${actions.length > 1 ? "s" : ""} this week: ${actions.map(a => a.plant.name).join(", ")}`,
    });
    
    cursor.setDate(cursor.getDate() + 7);
  }
  
  return weeks;
}

/** Parse "May 14" into a Date for the given year */
function parseFrostDate(dateStr: string, year: number): Date {
  return new Date(`${dateStr} ${year}`);
}
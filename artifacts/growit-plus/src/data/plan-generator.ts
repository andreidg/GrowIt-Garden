/**
 * GrowIt+ Deterministic Plan Generator — v3
 * Selects plants with smart flower logic, builds the garden grid (adjacency companion
 * validation), generates a week-by-week schedule anchored to regional frost dates,
 * and produces human-readable timing + companion notes for the UI.
 * PRD V10 Section 12.2 — deterministic fallback generator. No AI API required.
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
  const { plants: selectedPlants, cautionNotes } = selectPlants(profile);
  const grid       = buildGrid(selectedPlants, profile.lengthFt, profile.widthFt);
  const schedule   = buildSchedule(selectedPlants, region);

  // Collect names of plants that have an adjacent conflict in the grid
  const conflictSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell.hasConflict && cell.plant) conflictSet.add(cell.plant.name);
    }
  }
  const conflicts = Array.from(conflictSet);

  detectConflicts(selectedPlants.map(p => p.name)); // side-effect free; kept for banner

  const validation: ValidationResult = {
    plantWhitelistPassed:    selectedPlants.every(p => p.isWhitelisted),
    companionValidationPassed: conflicts.length === 0,
    adjacentConflictCount:   conflicts.length,
    warnings: conflicts.length > 0
      ? [`Adjacent companion conflicts: ${conflicts.join(", ")}`]
      : [],
  };

  const timingExplanation = buildTimingExplanation(profile, region, selectedPlants);
  const companionNotes    = buildCompanionNotes(selectedPlants);

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
    timingExplanation,
    companionNotes,
    cautionNotes,
  };
}

// ---------------------------------------------------------------------------
// Smart flower selection
// ---------------------------------------------------------------------------

/**
 * Returns the flowers appropriate for the given garden profile, along with
 * caution notes for excluded or risky choices.
 *
 * Rules:
 *  - Always safe (full sun OR partial shade): marigolds, pansies, violas
 *  - Full sun or partial shade only: calendula, nasturtiums
 *  - Full sun only, container-safe: zinnias
 *  - Full sun + not container + ≥ 6 sq ft: cosmos, sweet peas
 *  - Full sun + not container + ≥ 9 sq ft: sunflowers
 *  - Full sun + raised bed or loam: lavender (with zone-3 caution note)
 */
function selectFlowersForPlan(
  profile: GardenProfile
): { flowers: PlantItem[]; cautions: string[] } {
  const area       = profile.lengthFt * profile.widthFt;
  const sun        = profile.sunlight;
  const soil       = profile.soilType;
  const isContainer = soil === "Container/Pots";
  const isRaisedBed = soil === "Raised Bed";
  const isLoam      = soil === "In-Ground Loam";
  const isClay      = soil === "In-Ground Clay";

  const flowers: PlantItem[] = [];
  const cautions: string[]   = [];

  const f = (id: string): PlantItem => {
    const p = FLOWERS.find(x => x.id === id);
    if (!p) throw new Error(`Flower "${id}" not found in whitelist`);
    return p;
  };

  // MARIGOLDS — top companion; full sun or partial shade, any size, container-friendly
  if (sun !== "Full Shade") flowers.push(f("marigolds"));

  // PANSIES — cool-season; partial shade tolerant; container-friendly
  if (sun !== "Full Shade") flowers.push(f("pansies"));

  // VIOLAS — cool-season; partial shade tolerant; container-friendly
  if (sun !== "Full Shade") flowers.push(f("violas"));

  // CALENDULA — full sun or partial shade; companion pest deterrent
  if (sun === "Full Sun" || sun === "Partial Shade") flowers.push(f("calendula"));

  // NASTURTIUMS — full sun or partial shade; trap crop + edible
  if (sun === "Full Sun" || sun === "Partial Shade") flowers.push(f("nasturtiums"));

  // ZINNIAS — full sun only; container-friendly in small pots
  if (sun === "Full Sun") {
    flowers.push(f("zinnias"));
  } else if (sun === "Partial Shade") {
    cautions.push("Zinnias need full sun to bloom well — excluded for partial shade. Violas and pansies are your best bet.");
  }

  // COSMOS — full sun + not container + enough room to branch (≥ 6 sq ft)
  if (sun === "Full Sun" && !isContainer && area >= 6) {
    flowers.push(f("cosmos"));
  } else if (sun === "Full Sun" && isContainer) {
    cautions.push("Cosmos grow 60–90 cm tall and aren't suited for containers — try zinnias instead.");
  } else if (sun === "Full Sun" && area < 6) {
    cautions.push("Cosmos excluded — your garden is under 6 sq ft, too small for their spread.");
  }

  // SUNFLOWERS — full sun + not container + garden ≥ 9 sq ft
  if (sun === "Full Sun" && !isContainer && area >= 9) {
    flowers.push(f("sunflowers"));
  } else if (sun === "Full Sun" && !isContainer && area < 9) {
    cautions.push("Sunflowers need full sun and at least 9 sq ft of open ground — consider them when you expand the garden.");
  } else if (sun === "Full Sun" && isContainer) {
    cautions.push("Standard sunflowers are too large for containers — dwarf varieties exist but aren't on the whitelist yet.");
  }

  // SWEET PEAS — full sun + climbing space (not containers) + ≥ 6 sq ft
  if (sun === "Full Sun" && !isContainer && area >= 6) {
    flowers.push(f("sweet-peas"));
  } else if (sun === "Full Sun" && isContainer) {
    cautions.push("Sweet Peas need a trellis to climb — not suited to containers without vertical support.");
  }

  // LAVENDER — full sun + well-drained soil (raised bed or loam); zone-3 caution always
  if (sun === "Full Sun" && (isRaisedBed || isLoam)) {
    flowers.push({ ...f("lavender"), riskLevel: "high" });
    cautions.push(
      "Lavender included with a caution: use zone-4 hardy varieties only (Hidcote, Munstead). " +
      "Needs excellent drainage — perfect for raised beds and loam. May not overwinter in zone 3b without mulching."
    );
  } else if (sun === "Full Sun" && isClay) {
    cautions.push(
      "Lavender excluded — it struggles in clay soil (poor drainage causes root rot). " +
      "A raised bed or loam mix would make it thrive."
    );
  } else if (sun === "Full Sun" && isContainer) {
    cautions.push(
      "Lavender can be grown in large containers (30 cm+ diameter) with gritty, well-draining mix. " +
      "Bring indoors or mulch heavily to overwinter in zone 3."
    );
  }

  // Full shade — very limited flower options
  if (sun === "Full Shade") {
    cautions.push(
      "Full shade limits flowering plants. Only pansies and violas tolerate low light. " +
      "Consider moving containers to a brighter spot if possible."
    );
  }

  return { flowers, cautions };
}

// ---------------------------------------------------------------------------
// Plant selection — builds the final list used for the grid and schedule
// ---------------------------------------------------------------------------

interface SelectionResult {
  plants: PlantItem[];
  cautionNotes: string[];
}

function selectPlants(profile: GardenProfile): SelectionResult {
  const pref     = profile.plantPreference;
  const area     = profile.lengthFt * profile.widthFt;
  const needsFlowers = pref !== "Vegetables Only" && pref !== "Vegetables + Herbs";

  // Gather flowers with caution notes
  const { flowers: availableFlowers, cautions } = needsFlowers
    ? selectFlowersForPlan(profile)
    : { flowers: [], cautions: [] };

  // ── Flowers Only ────────────────────────────────────────────────────────
  if (pref === "Flowers Only") {
    const pool = fitToArea(availableFlowers, area);
    return {
      plants: pool.length > 0 ? pool : availableFlowers.slice(0, 4),
      cautionNotes: cautions,
    };
  }

  // ── Flowers + Herbs ──────────────────────────────────────────────────────
  if (pref === "Flowers + Herbs") {
    const herbs    = filterByConditions([...HERBS], profile);
    const herbSel  = fitToArea(herbs, area * 0.5);
    const flowerSel = fitToArea(availableFlowers, area * 0.5);
    const combined = dedupeById([...herbSel, ...flowerSel]);
    return {
      plants: combined.length > 0 ? combined : herbs.slice(0, 3),
      cautionNotes: cautions,
    };
  }

  // ── Vegetable-based plans ────────────────────────────────────────────────
  let vegHerbPool: PlantItem[] = filterByConditions([...VEGETABLES], profile);

  if (pref === "Vegetables + Herbs" || pref === "Vegetables + Herbs + Flowers") {
    vegHerbPool = dedupeById([
      ...vegHerbPool,
      ...filterByConditions([...HERBS], profile),
    ]);
  }

  const baseAllocation = pref === "Vegetables + Herbs + Flowers" ? area * 0.65 : area * 0.85;
  const baseSel = fitToArea(vegHerbPool, baseAllocation);

  if (pref === "Vegetables + Herbs + Flowers") {
    const flowerSel = fitToArea(availableFlowers, area * 0.35);
    return {
      plants: dedupeById([...baseSel, ...flowerSel]),
      cautionNotes: cautions,
    };
  }

  return {
    plants: baseSel.length > 0 ? baseSel : vegHerbPool.slice(0, 4),
    cautionNotes: cautions,
  };
}

// ---------------------------------------------------------------------------
// Shared filtering helpers
// ---------------------------------------------------------------------------

/** Filter a pool by sunlight, container, and small-garden rules. */
function filterByConditions(pool: PlantItem[], profile: GardenProfile): PlantItem[] {
  const area = profile.lengthFt * profile.widthFt;

  // Sunlight: Full Shade allows only partial-shade-tolerant plants
  const filtered = pool.filter(p => {
    if (profile.sunlight === "Full Sun") return true;
    if (profile.sunlight === "Partial Shade") return true; // most edibles survive partial shade
    return p.minSunlight === "Partial Shade"; // Full Shade: strict
  });

  // Container gardens: compact plants only (≤ 1 sq ft spacing)
  if (profile.soilType === "Container/Pots") {
    return filtered.filter(p => p.spacingFt <= 1);
  }

  // Very small garden (< 8 sq ft): prioritise compact plants
  if (area < 8) {
    return filtered.filter(p => p.spacingFt <= 1);
  }

  // Small garden (8–16 sq ft): moderate plants only
  if (area < 16) {
    return filtered.filter(p => p.spacingFt <= 2);
  }

  return filtered;
}

/**
 * Greedily add plants from a pool (sorted smallest spacing first)
 * until cumulative spacing exceeds the target area.
 * Always includes at least 1 plant even if area is tiny.
 */
function fitToArea(pool: PlantItem[], targetArea: number): PlantItem[] {
  const sorted  = [...pool].sort((a, b) => a.spacingFt - b.spacingFt);
  const result: PlantItem[] = [];
  let used = 0;

  for (const p of sorted) {
    if (used + p.spacingFt <= targetArea + p.spacingFt) {
      result.push(p);
      used += p.spacingFt;
    }
    if (used >= targetArea) break;
  }

  return result;
}

function dedupeById(plants: PlantItem[]): PlantItem[] {
  const seen = new Set<string>();
  return plants.filter(p => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Timing explanation — human-readable growing season summary
// ---------------------------------------------------------------------------

function buildTimingExplanation(
  profile: GardenProfile,
  region: GrowingRegion,
  plants: PlantItem[]
): string {
  const year = new Date().getFullYear();
  const lastFrost      = parseFrostDate(region.lastSpringFrost, year);
  const firstFallFrost = parseFrostDate(region.firstFallFrost, year);

  const seasonWeeks = Math.round(
    (firstFallFrost.getTime() - lastFrost.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

  // Earliest indoor start
  const indoorStarters = plants.filter(p => p.startIndoors && p.indoorWeeksAhead);
  const maxIndoor = indoorStarters.length > 0
    ? Math.max(...indoorStarters.map(p => p.indoorWeeksAhead!))
    : 0;

  let explanation =
    `Your growing season in ${region.label} runs from ${region.lastSpringFrost} (last spring frost) ` +
    `to ${region.firstFallFrost} (first fall frost) — about ${seasonWeeks} weeks.`;

  if (maxIndoor > 0) {
    const indoorStart = new Date(lastFrost);
    indoorStart.setDate(indoorStart.getDate() - maxIndoor * 7);
    const month = indoorStart.toLocaleDateString("en-CA", { month: "long" });
    const topStarters = indoorStarters
      .sort((a, b) => (b.indoorWeeksAhead ?? 0) - (a.indoorWeeksAhead ?? 0))
      .slice(0, 2)
      .map(p => p.name);
    explanation +=
      ` Start ${topStarters.join(" and ")} indoors around ${month} — ` +
      `${maxIndoor} weeks before your frost date.`;
  }

  // Earliest direct-sow items (cool-season, before frost)
  const coolSeason = plants.filter(p => p.directSow && p.weeksBeforeFrost >= 2);
  if (coolSeason.length > 0) {
    const names = coolSeason.slice(0, 3).map(p => p.name.toLowerCase());
    explanation +=
      ` Cool-season crops like ${names.join(", ")} can go outside 2–4 weeks before ${region.lastSpringFrost}.`;
  }

  // Sunlight caveat
  if (profile.sunlight === "Full Shade") {
    explanation += " Full shade limits options significantly — consider shade-tolerant greens and cool-season flowers only.";
  } else if (profile.sunlight === "Partial Shade") {
    explanation += " Partial shade suits leafy greens and herbs well; fruiting crops (tomatoes, cucumbers) may yield less than in full sun.";
  }

  return explanation;
}

// ---------------------------------------------------------------------------
// Companion notes — contextual text about why selected flowers/plants help
// ---------------------------------------------------------------------------

function buildCompanionNotes(plants: PlantItem[]): string[] {
  const names     = new Set(plants.map(p => p.name));
  const hasVeggies = plants.some(p => p.type === "vegetable");
  const notes: string[] = [];

  if (names.has("Marigolds")) {
    notes.push(
      hasVeggies
        ? "🌼 Marigolds repel aphids and whiteflies — plant near tomatoes, peppers, and brassicas for best effect."
        : "🌼 Marigolds deter aphids and draw in beneficial insects; a workhorse of any flower garden."
    );
  }
  if (names.has("Nasturtiums")) {
    notes.push(
      "🟠 Nasturtiums act as a trap crop, drawing aphids away from vegetables. Both leaves and flowers are edible."
    );
  }
  if (names.has("Calendula")) {
    notes.push(
      "🏵️ Calendula deters aphids and tomato hornworms. Edible petals and great early-season pollinator support."
    );
  }
  if (names.has("Sunflowers")) {
    notes.push(
      "🌻 Sunflowers are strong pollinator magnets. Tall varieties can double as a windbreak or natural trellis."
    );
  }
  if (names.has("Cosmos")) {
    notes.push(
      "🌸 Cosmos attract lacewings and other beneficial predatory insects that keep pest populations in check."
    );
  }
  if (names.has("Zinnias")) {
    notes.push(
      "💮 Zinnias are long-blooming pollinator favourites — their bold colours attract butterflies all summer."
    );
  }
  if (names.has("Pansies") || names.has("Violas")) {
    notes.push(
      "🪻 Pansies and violas are edible cool-season flowers that attract early-season pollinators before other plants bloom."
    );
  }
  if (names.has("Sweet Peas")) {
    notes.push(
      "🌷 Sweet Peas are fragrant climbers that draw bees and butterflies; provide a trellis or fence for best results."
    );
  }
  if (names.has("Lavender")) {
    notes.push(
      "💜 Lavender repels moths, flies, and fleas while being a superb bee attractor. A long-lived perennial once established."
    );
  }

  // Mint container note
  if (names.has("Mint")) {
    notes.push("🍃 Mint spreads aggressively — grow it in a container sunk into the soil to keep it in bounds.");
  }

  // Companion benefit summary for mixed plans
  if (plants.some(p => p.type === "flower") && hasVeggies) {
    notes.push(
      "🐝 Pollinator-friendly flowers placed around the edge of the garden bed increase vegetable yields by improving fertilisation."
    );
  }

  return notes;
}

// ---------------------------------------------------------------------------
// Garden grid — with adjacency-based companion conflict validation
// ---------------------------------------------------------------------------

function buildGrid(plants: PlantItem[], lengthFt: number, widthFt: number): MapCell[][] {
  const rows = widthFt;
  const cols = lengthFt;

  const grid: MapCell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ plant: null, hasConflict: false }))
  );

  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (plants.length === 0) break;
      grid[r][c] = { plant: plants[idx % plants.length], hasConflict: false };
      idx++;
    }
  }

  // Adjacency-based companion conflict check (4-directional neighbours)
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
          nb.hasConflict   = true;
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

  const lastFrost      = parseFrostDate(region.lastSpringFrost, year);
  const firstFallFrost = parseFrostDate(region.firstFallFrost, year);

  // Start from Sunday of the current week
  const cursor = new Date(today);
  cursor.setDate(cursor.getDate() - cursor.getDay());

  const weeks: WeeklyScheduleItem[] = [];

  while (cursor <= firstFallFrost) {
    const weekStart = new Date(cursor);
    const weekEnd   = new Date(cursor);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const isCurrent = today >= weekStart && today <= weekEnd;
    const actions: PlantAction[] = [];

    for (const plant of plants) {
      if (plant.startIndoors && plant.indoorWeeksAhead) {
        const indoorDate = new Date(lastFrost);
        indoorDate.setDate(indoorDate.getDate() - plant.indoorWeeksAhead * 7);
        if (indoorDate >= weekStart && indoorDate <= weekEnd) {
          actions.push({
            plant,
            actionType: "start_indoors",
            description: `Start ${plant.name} indoors (${plant.indoorWeeksAhead} weeks before last frost)`,
          });
        }
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
      weekLabel:     `Week of ${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`,
      weekStartDate: weekStart.toISOString(),
      isCurrent,
      hasActions:    actions.length > 0,
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

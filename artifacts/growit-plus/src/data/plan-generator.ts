/**
 * GrowIt Deterministic Plan Generator — v4
 * Selects plants with smart flower logic, builds the garden grid (adjacency companion
 * validation), generates a week-by-week schedule anchored to regional frost dates,
 * and produces human-readable timing + companion notes for the UI.
 * Supports user-selected plant lists, custom plants, and multiple garden areas.
 * No AI API required — fully deterministic fallback.
 */

import type {
  GardenProfile,
  GrowingRegion,
  GeneratedPlan,
  MapCell,
  WeeklyScheduleItem,
  PlantAction,
  ValidationResult,
  SunlightLevel,
  GardenArea,
  AreaPlan,
  CustomPlant,
  PlantType,
} from "@/types/garden";
import { VEGETABLES, HERBS, FLOWERS, ALL_PLANTS, type PlantItem } from "@/data/plants";
import { detectConflicts, areConflicting } from "@/data/companion-rules";

export type { GardenProfile, GrowingRegion, GeneratedPlan, MapCell, WeeklyScheduleItem, PlantAction, PlantItem };

// ---------------------------------------------------------------------------
// Sunlight compatibility
// ---------------------------------------------------------------------------

const SUNLIGHT_SCORE: Record<SunlightLevel, number> = {
  "Full Sun":      5,
  "Part Sun":      4,
  "Partial Shade": 3,
  "Part Shade":    3,
  "Dappled Shade": 2,
  "Full Shade":    1,
};

/**
 * Returns true if the garden's sunlight level can support a plant with the
 * given minimum sunlight requirement.
 * Part Sun (score 4) is allowed a 1-level tolerance so it can support plants
 * that nominally need Full Sun (score 5) — 4 ≥ 5−1 = 4.
 */
function sunlightCompatible(garden: SunlightLevel, plantMin: SunlightLevel): boolean {
  const gs = SUNLIGHT_SCORE[garden] ?? 3;
  const ps = SUNLIGHT_SCORE[plantMin] ?? 3;
  return gs >= ps - 1;
}

// ---------------------------------------------------------------------------
// Custom plant helper
// ---------------------------------------------------------------------------

function customToPlantItem(cp: CustomPlant): PlantItem {
  const type: PlantType = cp.category === "other" ? "vegetable" : cp.category;
  return {
    id: cp.id,
    name: cp.name,
    type,
    emoji: "🌱",
    abbr: cp.name.slice(0, 3).toUpperCase(),
    spacingFt: 1,
    directSow: true,
    startIndoors: false,
    daysToMaturity: 60,
    weeksBeforeFrost: 0,
    actionType: "direct_sow",
    minSunlight: "Partial Shade",
    isWhitelisted: false,
    riskLevel: "normal",
    notes: [
      "Custom entry. GrowIt does not yet have verified local growing rules for this item.",
      cp.notes,
    ].filter(Boolean).join(" "),
  };
}

// ---------------------------------------------------------------------------
// Profile normalisation — backward compat for old saved plans
// ---------------------------------------------------------------------------

function normalizeProfile(profile: GardenProfile): GardenProfile {
  const areas: GardenArea[] = profile.areas?.length
    ? profile.areas
    : [{
        id: "area-primary",
        name: "My Garden",
        lengthFt: profile.lengthFt,
        widthFt:  profile.widthFt,
        sunlight: profile.sunlight,
        soilType: profile.soilType,
      }];
  return {
    ...profile,
    areas,
    selectedPlantIds: profile.selectedPlantIds ?? [],
    customPlants:     profile.customPlants ?? [],
  };
}

// ---------------------------------------------------------------------------
// Per-area plan building
// ---------------------------------------------------------------------------

function buildAreaPlans(areas: GardenArea[], allPlants: PlantItem[]): AreaPlan[] {
  return areas.map(area => {
    const areaPlants = allPlants.filter(p => sunlightCompatible(area.sunlight, p.minSunlight));
    const grid = buildGrid(areaPlants, area.lengthFt, area.widthFt);
    return { area, selectedPlants: areaPlants, grid };
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function generatePlan(profile: GardenProfile, region: GrowingRegion): GeneratedPlan {
  const p = normalizeProfile(profile);
  const { plants: selectedPlants, cautionNotes } = selectPlants(p);
  const grid     = buildGrid(selectedPlants, p.lengthFt, p.widthFt);
  const schedule = buildSchedule(selectedPlants, region, p);
  const areaPlans = buildAreaPlans(p.areas, selectedPlants);

  const conflictSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell.hasConflict && cell.plant) conflictSet.add(cell.plant.name);
    }
  }
  const conflicts = Array.from(conflictSet);

  detectConflicts(selectedPlants.map(pl => pl.name));

  const validation: ValidationResult = {
    plantWhitelistPassed:     selectedPlants.every(pl => pl.isWhitelisted),
    companionValidationPassed: conflicts.length === 0,
    adjacentConflictCount:    conflicts.length,
    warnings: conflicts.length > 0
      ? [`Adjacent companion conflicts: ${conflicts.join(", ")}`]
      : [],
  };

  const timingExplanation = buildTimingExplanation(p, region, selectedPlants);
  const companionNotes    = buildCompanionNotes(selectedPlants);

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generationMode: "deterministic",
    profile: p,
    region,
    selectedPlants,
    grid,
    schedule,
    conflicts,
    validation,
    timingExplanation,
    companionNotes,
    cautionNotes,
    areaPlans,
  };
}

/**
 * Build a complete plan from a pre-selected list of plants.
 * Used by the AI path: plant selection comes from the AI, but all structural
 * operations (grid, schedule, validation) remain deterministic.
 */
export function buildPlanFromSelection(
  profile:  GardenProfile,
  region:   GrowingRegion,
  selectedPlants: PlantItem[],
  overrides?: {
    timingExplanation?: string;
    companionNotes?:    string[];
    cautionNotes?:      string[];
    fallbackReason?:    string;
  },
): GeneratedPlan {
  const p    = normalizeProfile(profile);
  const grid = buildGrid(selectedPlants, p.lengthFt, p.widthFt);
  const schedule  = buildSchedule(selectedPlants, region, p);
  const areaPlans = buildAreaPlans(p.areas, selectedPlants);

  const conflictSet = new Set<string>();
  for (const row of grid) {
    for (const cell of row) {
      if (cell.hasConflict && cell.plant) conflictSet.add(cell.plant.name);
    }
  }
  const conflicts = Array.from(conflictSet);

  const validation: ValidationResult = {
    plantWhitelistPassed:     selectedPlants.every(pl => pl.isWhitelisted),
    companionValidationPassed: conflicts.length === 0,
    adjacentConflictCount:    conflicts.length,
    warnings: conflicts.length > 0
      ? [`Adjacent companion conflicts: ${conflicts.join(", ")}`]
      : [],
  };

  const timingExplanation = overrides?.timingExplanation
    || buildTimingExplanation(p, region, selectedPlants);
  const companionNotes    = overrides?.companionNotes
    || buildCompanionNotes(selectedPlants);
  const cautionNotes      = overrides?.cautionNotes ?? [];

  return {
    id:             `plan-${Date.now()}`,
    generatedAt:    new Date().toISOString(),
    generationMode: "ai",
    fallbackReason: overrides?.fallbackReason,
    profile: p,
    region,
    selectedPlants,
    grid,
    schedule,
    conflicts,
    validation,
    timingExplanation,
    companionNotes,
    cautionNotes,
    areaPlans,
  };
}

// ---------------------------------------------------------------------------
// Smart flower selection
// ---------------------------------------------------------------------------

function selectFlowersForPlan(
  profile: GardenProfile
): { flowers: PlantItem[]; cautions: string[] } {
  const area        = profile.lengthFt * profile.widthFt;
  const sun         = profile.sunlight;
  const soil        = profile.soilType;
  const isContainer = soil === "Container/Pots";
  const isRaisedBed = soil === "Raised Bed";
  const isLoam      = soil === "In-Ground Loam";
  const isClay      = soil === "In-Ground Clay";
  const isFullOrPartSun = sun === "Full Sun" || sun === "Part Sun";
  const isVeryShady     = sun === "Full Shade" || sun === "Dappled Shade";

  const flowers: PlantItem[] = [];
  const cautions: string[]   = [];

  const f = (id: string): PlantItem => {
    const p = FLOWERS.find(x => x.id === id);
    if (!p) throw new Error(`Flower "${id}" not found in whitelist`);
    return p;
  };

  // MARIGOLDS — top companion; tolerant of most light conditions
  if (!isVeryShady) flowers.push(f("marigolds"));

  // PANSIES — cool-season; shade tolerant; container-friendly
  if (sun !== "Full Shade") flowers.push(f("pansies"));

  // VIOLAS — cool-season; shade tolerant; container-friendly
  if (sun !== "Full Shade") flowers.push(f("violas"));

  // CALENDULA — full/part sun or moderate shade
  if (isFullOrPartSun || sun === "Partial Shade" || sun === "Part Shade") {
    flowers.push(f("calendula"));
  }

  // NASTURTIUMS — full/part sun or moderate shade; trap crop + edible
  if (isFullOrPartSun || sun === "Partial Shade" || sun === "Part Shade") {
    flowers.push(f("nasturtiums"));
  }

  // ZINNIAS — full or part sun only
  if (isFullOrPartSun) {
    flowers.push(f("zinnias"));
  } else {
    cautions.push("Zinnias need full sun or part sun to bloom well — excluded for your light conditions. Violas and pansies are your best bet.");
  }

  // COSMOS — full/part sun + not container + enough room
  if (isFullOrPartSun && !isContainer && area >= 6) {
    flowers.push(f("cosmos"));
  } else if (isFullOrPartSun && isContainer) {
    cautions.push("Cosmos grow tall and aren't suited for containers — try zinnias instead.");
  } else if (isFullOrPartSun && area < 6) {
    cautions.push("Cosmos excluded — your garden is under 6 sq ft, too small for their spread.");
  }

  // SUNFLOWERS — full/part sun + not container + ≥ 9 sq ft
  if (isFullOrPartSun && !isContainer && area >= 9) {
    flowers.push(f("sunflowers"));
  } else if (isFullOrPartSun && !isContainer && area < 9) {
    cautions.push("Sunflowers need full sun and at least 9 sq ft of open ground — consider them when you expand the garden.");
  } else if (isFullOrPartSun && isContainer) {
    cautions.push("Standard sunflowers are too large for containers — dwarf varieties exist but aren't on the whitelist yet.");
  }

  // SWEET PEAS — full/part sun + not container + ≥ 6 sq ft
  if (isFullOrPartSun && !isContainer && area >= 6) {
    flowers.push(f("sweet-peas"));
  } else if (isFullOrPartSun && isContainer) {
    cautions.push("Sweet Peas need a trellis to climb — not suited to containers without vertical support.");
  }

  // LAVENDER — full/part sun + well-drained soil; zone-3 caution always
  if (isFullOrPartSun && (isRaisedBed || isLoam)) {
    flowers.push({ ...f("lavender"), riskLevel: "high" });
    cautions.push(
      "Lavender included with a caution: use zone-4 hardy varieties only (Hidcote, Munstead). " +
      "Needs excellent drainage — perfect for raised beds and loam. May not overwinter in zone 3b without mulching."
    );
  } else if (isFullOrPartSun && isClay) {
    cautions.push(
      "Lavender excluded — it struggles in clay soil (poor drainage causes root rot). " +
      "A raised bed or loam mix would make it thrive."
    );
  } else if (isFullOrPartSun && isContainer) {
    cautions.push(
      "Lavender can be grown in large containers (30 cm+ diameter) with gritty, well-draining mix. " +
      "Bring indoors or mulch heavily to overwinter in zone 3."
    );
  }

  if (isVeryShady) {
    cautions.push(
      "Very low light limits flowering plants. Only pansies and violas tolerate low-light conditions. " +
      "Consider moving containers to a brighter spot if possible."
    );
  }

  return { flowers, cautions };
}

// ---------------------------------------------------------------------------
// Plant selection — user-chosen or smart deterministic
// ---------------------------------------------------------------------------

interface SelectionResult {
  plants: PlantItem[];
  cautionNotes: string[];
}

/** Select from the user's explicit plant ID list.
 *  All user-chosen plants are honoured as long as they pass sunlight/container
 *  compatibility checks.  We intentionally skip fitToArea here because the user
 *  has made a deliberate choice — limiting the list by area would silently drop
 *  plants they explicitly asked for. */
function selectFromUserList(profile: GardenProfile, customItems: PlantItem[]): SelectionResult {
  const cautions: string[] = [];

  const requested = (profile.selectedPlantIds ?? [])
    .map(id => ALL_PLANTS.find(p => p.id === id))
    .filter((p): p is PlantItem => p !== undefined);

  // Sunlight filter — warn but honour the choice when borderline
  const sunOk  = requested.filter(p => sunlightCompatible(profile.sunlight, p.minSunlight));
  const sunBad = requested.filter(p => !sunlightCompatible(profile.sunlight, p.minSunlight));
  if (sunBad.length > 0) {
    cautions.push(
      `${sunBad.map(p => p.name).join(", ")} ${sunBad.length === 1 ? "needs" : "need"} ` +
      `more sunlight than your ${profile.sunlight} garden offers and ${sunBad.length === 1 ? "has" : "have"} been excluded from this plan.`
    );
  }

  // Container filter
  let pool = sunOk;
  if (profile.soilType === "Container/Pots") {
    const large = pool.filter(p => p.spacingFt > 1);
    pool = pool.filter(p => p.spacingFt <= 1);
    if (large.length > 0) {
      cautions.push(
        `${large.map(p => p.name).join(", ")} ${large.length === 1 ? "is" : "are"} ` +
        `too large for containers and ${large.length === 1 ? "has" : "have"} been excluded. Consider a raised bed or in-ground area.`
      );
    }
  }

  // Merge with custom plants (deduplicated)
  const plants = dedupeById([...pool, ...customItems]);

  return { plants, cautionNotes: cautions };
}

/** Wrapper: route to user selection or smart selection as appropriate. */
function selectPlants(profile: GardenProfile): SelectionResult {
  const customItems   = (profile.customPlants ?? []).map(customToPlantItem);
  const customCautions = customItems.map(cp =>
    `"${cp.name}" is a custom plant. GrowIt does not yet have verified local growing rules for this item. ` +
    `The schedule timing shown is approximate — research the best planting window for your specific variety.`
  );

  // Goal-based (recommendation-first): non-custom goals drive selection; selectedPlantIds are additions
  if (profile.gardenGoal && profile.gardenGoal !== "custom") {
    const { plants, cautionNotes } = goalSelectPlants(profile);
    return { plants: dedupeById([...plants, ...customItems]), cautionNotes: [...cautionNotes, ...customCautions] };
  }

  // Custom goal or legacy explicit selection: use user's picked list
  if (profile.selectedPlantIds && profile.selectedPlantIds.length > 0) {
    const { plants, cautionNotes } = selectFromUserList(profile, customItems);
    return { plants, cautionNotes: [...cautionNotes, ...customCautions] };
  }

  // Smart deterministic fallback (legacy — no goal set, no explicit selection)
  const { plants, cautionNotes } = smartSelectPlants(profile);
  return {
    plants: [...plants, ...customItems],
    cautionNotes: [...cautionNotes, ...customCautions],
  };
}

/** Goal-based plant selection: maps the user's garden goal to an appropriate plant mix,
 *  then merges any optional manual additions from selectedPlantIds. */
function goalSelectPlants(profile: GardenProfile): SelectionResult {
  const area    = profile.lengthFt * profile.widthFt;
  const goal    = profile.gardenGoal ?? "vegetable";
  const cautions: string[] = [];

  const FAMILY_KEYWORDS = ["tomato", "bean", "pea", "carrot", "cucumber", "sunflower", "pumpkin", "lettuce", "radish"];

  let basePool: PlantItem[] = [];

  switch (goal) {
    case "beginner":
      basePool = filterByConditions([...VEGETABLES, ...HERBS], profile)
        .filter(p => p.riskLevel === "normal" && p.daysToMaturity <= 90);
      break;
    case "vegetable":
      basePool = filterByConditions([...VEGETABLES, ...HERBS], profile);
      break;
    case "herbs-flowers":
      basePool = filterByConditions([...HERBS, ...FLOWERS], profile);
      break;
    case "pollinator": {
      const pollinators    = filterByConditions(FLOWERS.filter(p => p.gardenBenefits?.pollinatorSupport), profile);
      const companionHerbs = filterByConditions(HERBS.filter(p => p.gardenBenefits?.companionPlanting), profile);
      basePool = dedupeById([...pollinators, ...companionHerbs]);
      if (basePool.length < 3) basePool = filterByConditions([...FLOWERS], profile);
      break;
    }
    case "family": {
      const familyPlants = [...VEGETABLES, ...FLOWERS].filter(p => FAMILY_KEYWORDS.some(k => p.id.includes(k)));
      basePool = filterByConditions(familyPlants, profile);
      if (basePool.length < 3) basePool = filterByConditions([...VEGETABLES], profile);
      break;
    }
    default:
      return smartSelectPlants(profile);
  }

  const fitted     = fitToArea(basePool, area);
  const basePlants = fitted.length > 0 ? fitted : basePool.slice(0, 6);

  // Merge optional manual additions (treated as preferences, not requirements)
  const additionalIds = profile.selectedPlantIds ?? [];
  if (additionalIds.length > 0) {
    const additions = additionalIds
      .map(id => ALL_PLANTS.find(p => p.id === id))
      .filter((p): p is PlantItem => !!p)
      .filter(p => !basePlants.some(b => b.id === p.id));

    for (const plant of additions) {
      if (!sunlightCompatible(profile.sunlight, plant.minSunlight)) {
        cautions.push(
          `You added ${plant.name} — it prefers more light than your ${profile.sunlight} garden provides. ` +
          `It has been included but may yield less. Consider giving it the sunniest spot in your garden.`
        );
      }
    }
    return { plants: dedupeById([...basePlants, ...additions]), cautionNotes: cautions };
  }

  return { plants: basePlants, cautionNotes: cautions };
}

/** Smart plant selection based on plantPreference (legacy) or inferred category mix. */
function smartSelectPlants(profile: GardenProfile): SelectionResult {
  const pref       = profile.plantPreference ?? "Vegetables + Herbs + Flowers";
  const area       = profile.lengthFt * profile.widthFt;
  const needsFlowers = pref !== "Vegetables Only" && pref !== "Vegetables + Herbs";

  const { flowers: availableFlowers, cautions } = needsFlowers
    ? selectFlowersForPlan(profile)
    : { flowers: [], cautions: [] };

  if (pref === "Flowers Only") {
    const pool = fitToArea(availableFlowers, area);
    return {
      plants: pool.length > 0 ? pool : availableFlowers.slice(0, 4),
      cautionNotes: cautions,
    };
  }

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

  let vegHerbPool: PlantItem[] = filterByConditions([...VEGETABLES], profile);
  if (pref === "Vegetables + Herbs" || pref === "Vegetables + Herbs + Flowers") {
    vegHerbPool = dedupeById([...vegHerbPool, ...filterByConditions([...HERBS], profile)]);
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

function filterByConditions(pool: PlantItem[], profile: GardenProfile): PlantItem[] {
  const area = profile.lengthFt * profile.widthFt;

  const filtered = pool.filter(p => sunlightCompatible(profile.sunlight, p.minSunlight));

  if (profile.soilType === "Container/Pots") {
    return filtered.filter(p => p.spacingFt <= 1);
  }
  if (area < 8)  return filtered.filter(p => p.spacingFt <= 1);
  if (area < 16) return filtered.filter(p => p.spacingFt <= 2);

  return filtered;
}

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
// Timing explanation
// ---------------------------------------------------------------------------

function buildTimingExplanation(
  profile: GardenProfile,
  region:  GrowingRegion,
  plants:  PlantItem[]
): string {
  const year           = new Date().getFullYear();
  const lastFrost      = parseFrostDate(region.lastSpringFrost, year);
  const firstFallFrost = parseFrostDate(region.firstFallFrost,  year);

  const seasonWeeks = Math.round(
    (firstFallFrost.getTime() - lastFrost.getTime()) / (7 * 24 * 60 * 60 * 1000)
  );

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
    const month       = indoorStart.toLocaleDateString("en-CA", { month: "long" });
    const topStarters = indoorStarters
      .sort((a, b) => (b.indoorWeeksAhead ?? 0) - (a.indoorWeeksAhead ?? 0))
      .slice(0, 2)
      .map(p => p.name);
    explanation +=
      ` Start ${topStarters.join(" and ")} indoors around ${month} — ` +
      `${maxIndoor} weeks before your frost date.`;
  }

  const coolSeason = plants.filter(p => p.directSow && p.weeksBeforeFrost >= 2);
  if (coolSeason.length > 0) {
    const names = coolSeason.slice(0, 3).map(p => p.name.toLowerCase());
    explanation +=
      ` Cool-season crops like ${names.join(", ")} can go outside 2–4 weeks before ${region.lastSpringFrost}.`;
  }

  const sun = profile.sunlight;
  if (sun === "Full Shade") {
    explanation += " Full shade limits options significantly — consider shade-tolerant greens and cool-season flowers only.";
  } else if (sun === "Dappled Shade") {
    explanation += " Dappled shade suits leafy greens, herbs, and cool-season flowers; fruiting vegetables should get the sunniest spots available.";
  } else if (sun === "Partial Shade" || sun === "Part Shade") {
    explanation += " Part shade suits leafy greens and herbs well; fruiting crops (tomatoes, cucumbers) may yield less than in full sun.";
  } else if (sun === "Part Sun") {
    explanation += " Part sun (4–6 hrs) supports most vegetables and herbs; tomatoes and cucumbers will still produce but may ripen a little more slowly.";
  }

  return explanation;
}

// ---------------------------------------------------------------------------
// Companion notes
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
    notes.push("🟠 Nasturtiums act as a trap crop, drawing aphids away from vegetables. Both leaves and flowers are edible.");
  }
  if (names.has("Calendula")) {
    notes.push("🏵️ Calendula deters aphids and tomato hornworms. Edible petals and great early-season pollinator support.");
  }
  if (names.has("Sunflowers")) {
    notes.push("🌻 Sunflowers are strong pollinator magnets. Tall varieties can double as a windbreak or natural trellis.");
  }
  if (names.has("Cosmos")) {
    notes.push("🌸 Cosmos attract lacewings and other beneficial predatory insects that keep pest populations in check.");
  }
  if (names.has("Zinnias")) {
    notes.push("💮 Zinnias are long-blooming pollinator favourites — their bold colours attract butterflies all summer.");
  }
  if (names.has("Pansies") || names.has("Violas")) {
    notes.push("🪻 Pansies and violas are edible cool-season flowers that attract early-season pollinators before other plants bloom.");
  }
  if (names.has("Sweet Peas")) {
    notes.push("🌷 Sweet Peas are fragrant climbers that draw bees and butterflies; provide a trellis or fence for best results.");
  }
  if (names.has("Lavender")) {
    notes.push("💜 Lavender repels moths, flies, and fleas while being a superb bee attractor. A long-lived perennial once established.");
  }
  if (names.has("Mint")) {
    notes.push("🍃 Mint spreads aggressively — grow it in a container sunk into the soil to keep it in bounds.");
  }
  if (plants.some(p => p.type === "flower") && hasVeggies) {
    notes.push("🐝 Pollinator-friendly flowers placed around the edge of the bed increase vegetable yields by improving fertilisation.");
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
      grid[r]![c] = { plant: plants[idx % plants.length]!, hasConflict: false };
      idx++;
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r]![c]!;
      if (!cell.plant) continue;

      const neighbours: MapCell[] = [
        r > 0        ? grid[r - 1]![c]! : null,
        r < rows - 1 ? grid[r + 1]![c]! : null,
        c > 0        ? grid[r]![c - 1]! : null,
        c < cols - 1 ? grid[r]![c + 1]! : null,
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
// Weekly schedule
// ---------------------------------------------------------------------------

const SOWING_DEPTH: Record<string, string> = {
  carrots:      "Sow 6 mm (¼ in) deep · thin to 5 cm (2 in) apart",
  radishes:     "Sow 1 cm (½ in) deep · 2.5 cm (1 in) apart",
  spinach:      "Sow 1 cm (½ in) deep · 5 cm (2 in) apart",
  lettuce:      "Sow 3 mm (⅛ in) deep · press firmly · keep moist",
  peas:         "Sow 2.5 cm (1 in) deep · 5 cm (2 in) apart",
  beans:        "Sow 2.5 cm (1 in) deep · 7–10 cm (3–4 in) apart",
  beets:        "Sow 1 cm (½ in) deep · thin to 10 cm (4 in) apart",
  "swiss-chard":"Sow 1 cm (½ in) deep · thin to 20 cm (8 in) apart",
  potatoes:     "Plant 10 cm (4 in) deep · 30 cm (12 in) apart",
  chives:       "Sow 6 mm (¼ in) deep · scatter thinly",
  dill:         "Sprinkle on surface · press gently · do not cover",
  cilantro:     "Sow 6 mm (¼ in) deep · thin to 5 cm (2 in) apart",
  marigolds:    "Sow 6 mm (¼ in) deep · 30 cm (12 in) apart",
  nasturtiums:  "Sow 2.5 cm (1 in) deep · cover lightly",
  calendula:    "Sow 6 mm (¼ in) deep · thin to 15 cm (6 in) apart",
  zinnias:      "Sow 6 mm (¼ in) deep · 15–20 cm (6–8 in) apart",
  cosmos:       "Sprinkle on surface · press gently · 30 cm (12 in) apart",
  sunflowers:   "Sow 2.5 cm (1 in) deep · 45 cm (18 in) apart",
  "sweet-peas": "Sow 2.5 cm (1 in) deep · 7 cm (3 in) apart · soak overnight first",
};

const TRANSPLANT_DEPTH = "Plant at pot depth · firm soil around roots · water in well";

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function weekSunday(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function buildSchedule(
  plants:  PlantItem[],
  region:  GrowingRegion,
  _profile: GardenProfile,
): WeeklyScheduleItem[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  const lastFrost      = parseFrostDate(region.lastSpringFrost, year);
  const firstFallFrost = parseFrostDate(region.firstFallFrost,  year);

  const actionMap = new Map<string, PlantAction[]>();
  const push = (date: Date, action: PlantAction) => {
    const key = weekSunday(date).toISOString();
    if (!actionMap.has(key)) actionMap.set(key, []);
    actionMap.get(key)!.push(action);
  };

  for (const plant of plants) {
    if (plant.startIndoors && plant.indoorWeeksAhead) {
      const indoorDate     = addDays(lastFrost, -plant.indoorWeeksAhead * 7);
      const transplantDate = addDays(lastFrost, 7);
      const isIndoorPast   = indoorDate < today;

      if (!isIndoorPast) {
        push(indoorDate, {
          plant,
          actionType: "start_indoors",
          description: `Start ${plant.name} seeds indoors`,
          timingNote: `${plant.indoorWeeksAhead} weeks before your last spring frost (${region.lastSpringFrost}) — gives seedlings time to reach transplant size`,
          depthNote: SOWING_DEPTH[plant.id],
        });
      } else {
        push(transplantDate, {
          plant,
          actionType: "buy_transplant",
          description: `Buy ${plant.name} seedlings from a garden centre`,
          timingNote: `The indoor-start window (${plant.indoorWeeksAhead} wks before frost) has passed — purchasing transplants is the best option now`,
        });
      }

      push(transplantDate, {
        plant,
        actionType: "transplant",
        description: `Transplant ${plant.name} outdoors`,
        timingNote: `1 week after your last spring frost (${region.lastSpringFrost}), once soil has warmed to 10 °C`,
        depthNote: TRANSPLANT_DEPTH,
      });

      if (plant.type === "flower") {
        const bloomDate = addDays(transplantDate, plant.daysToMaturity);
        if (bloomDate <= firstFallFrost) {
          push(bloomDate, {
            plant,
            actionType: "bloom_watch",
            description: `${plant.name} should begin blooming`,
            timingNote: `~${plant.daysToMaturity} days after transplanting outdoors`,
          });
        }
      }
    }

    if (plant.type === "foliage") {
      const plantDate = addDays(lastFrost, 7);
      push(plantDate, {
        plant,
        actionType: "plant_outdoors",
        description: `Plant ${plant.name} outdoors from a nursery start`,
        timingNote: `1 week after your last spring frost (${region.lastSpringFrost}) — once soil has warmed and risk of hard frost has passed`,
      });

      const establishDate = addDays(plantDate, 14);
      if (establishDate <= firstFallFrost) {
        push(establishDate, {
          plant,
          actionType: "maintenance",
          description: `Water ${plant.name} deeply while it establishes`,
          timingNote: "First few weeks after planting — keep soil consistently moist (but not waterlogged) so roots can develop",
        });
      }

      const winterPrepDate = addDays(firstFallFrost, -14);
      if (winterPrepDate >= today) {
        push(winterPrepDate, {
          plant,
          actionType: "winter_protect",
          description: `Mulch around ${plant.name} for winter protection`,
          timingNote: `2 weeks before your first fall frost (${region.firstFallFrost}) — apply 5–10 cm of mulch to insulate roots through Alberta winters`,
        });
      }
    }

    if (plant.directSow) {
      const sowDate = addDays(lastFrost, -plant.weeksBeforeFrost * 7);
      push(sowDate, {
        plant,
        actionType: "direct_sow",
        description: `Direct sow ${plant.name} outdoors`,
        timingNote: plant.weeksBeforeFrost > 0
          ? `${plant.weeksBeforeFrost} week${plant.weeksBeforeFrost !== 1 ? "s" : ""} before last frost (${region.lastSpringFrost}) — this plant tolerates light frost`
          : `After your last spring frost (${region.lastSpringFrost}), when the risk of frost has passed`,
        depthNote: SOWING_DEPTH[plant.id],
      });

      if (plant.type === "flower") {
        const bloomDate = addDays(sowDate, plant.daysToMaturity);
        if (bloomDate <= firstFallFrost) {
          push(bloomDate, {
            plant,
            actionType: "bloom_watch",
            description: `${plant.name} should begin blooming`,
            timingNote: `~${plant.daysToMaturity} days after sowing — deadhead regularly to extend blooming`,
          });
        }
      }
    }
  }

  const maint1 = addDays(lastFrost, 21);
  const maint2 = addDays(lastFrost, 49);

  if (maint1 >= today && maint1 <= firstFallFrost) {
    push(maint1, {
      actionType: "maintenance",
      description: "Thin seedlings, do first weeding, and check for pests",
      timingNote: `3 weeks after last frost (${region.lastSpringFrost}) — seedlings have their first true leaves; remove weaker ones to give winners room`,
    });
  }
  if (maint2 >= today && maint2 <= firstFallFrost) {
    push(maint2, {
      actionType: "maintenance",
      description: "Deep-water, side-dress with compost, and stake tall plants",
      timingNote: "Mid-season care — consistent moisture and feeding now pays off in August harvest",
    });
  }

  const cursor = weekSunday(today);
  const weeks: WeeklyScheduleItem[] = [];

  while (cursor <= firstFallFrost) {
    const weekStart = new Date(cursor);
    const weekEnd   = addDays(weekStart, 6);
    const isCurrent = today >= weekStart && today <= weekEnd;
    const actions   = actionMap.get(weekStart.toISOString()) ?? [];

    const label = `${weekStart.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}–${weekEnd.toLocaleDateString("en-CA", { month: "short", day: "numeric" })}`;

    weeks.push({
      weekLabel:     label,
      weekStartDate: weekStart.toISOString(),
      isCurrent,
      hasActions:    actions.length > 0,
      actions,
      notes: actions.length === 0
        ? "No actions this week — just water and watch! 💧"
        : actions.map(a => a.plant?.name ?? "Garden care").join(", "),
    });

    cursor.setDate(cursor.getDate() + 7);
  }

  return weeks;
}

// ---------------------------------------------------------------------------
// Grid layout optimizer — hill-climbing conflict minimization
// ---------------------------------------------------------------------------

export function optimizeGridLayout(
  grid: MapCell[][],
  lengthFt: number,
  widthFt: number,
): MapCell[][] {
  const rows = widthFt;
  const cols = lengthFt;

  // Deep copy
  const g: MapCell[][] = grid.map(row => row.map(cell => ({ ...cell })));

  function revalidate(g: MapCell[][]): void {
    for (const row of g) for (const cell of row) { cell.hasConflict = false; }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = g[r]![c]!;
        if (!cell.plant) continue;
        const neighbors: MapCell[] = [
          r > 0        ? g[r - 1]![c]! : null,
          r < rows - 1 ? g[r + 1]![c]! : null,
          c > 0        ? g[r]![c - 1]! : null,
          c < cols - 1 ? g[r]![c + 1]! : null,
        ].filter((n): n is MapCell => n !== null);
        for (const nb of neighbors) {
          if (nb.plant && areConflicting(cell.plant.name, nb.plant.name)) {
            cell.hasConflict = true;
            nb.hasConflict   = true;
          }
        }
      }
    }
  }

  function countConflicts(g: MapCell[][]): number {
    let n = 0;
    for (const row of g) for (const cell of row) if (cell.hasConflict) n++;
    return n;
  }

  let improved = true;
  let maxIter  = 500;

  while (improved && maxIter-- > 0) {
    improved = false;
    const before = countConflicts(g);
    if (before === 0) break;

    const conflicted: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (g[r]![c]!.hasConflict) conflicted.push([r, c]);
      }
    }

    outer:
    for (const [r1, c1] of conflicted) {
      for (let r2 = 0; r2 < rows; r2++) {
        for (let c2 = 0; c2 < cols; c2++) {
          if (r1 === r2 && c1 === c2) continue;
          const p1 = g[r1]![c1]!.plant;
          const p2 = g[r2]![c2]!.plant;
          if (!p1 || !p2 || p1.id === p2.id) continue;

          g[r1]![c1]! = { plant: p2, hasConflict: false };
          g[r2]![c2]! = { plant: p1, hasConflict: false };
          revalidate(g);

          if (countConflicts(g) < before) {
            improved = true;
            break outer;
          }

          g[r1]![c1]! = { plant: p1, hasConflict: false };
          g[r2]![c2]! = { plant: p2, hasConflict: false };
          revalidate(g);
        }
      }
    }
  }

  return g;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseFrostDate(dateStr: string, year: number): Date {
  return new Date(`${dateStr} ${year}`);
}

/**
 * GrowIt — Single source of truth for all TypeScript types.
 */

export type PlantType = "vegetable" | "herb" | "flower";

export type ActionType =
  | "start_indoors"
  | "buy_transplant"
  | "direct_sow"
  | "transplant"
  | "maintenance"
  | "bloom_watch"
  | "harvest_soon";

export type SunlightLevel =
  | "Full Sun"
  | "Part Sun"
  | "Partial Shade"    // kept for backward compat with plant minSunlight values
  | "Part Shade"
  | "Dappled Shade"
  | "Full Shade";

export type SoilType =
  | "Raised Bed"
  | "In-Ground Clay"
  | "In-Ground Loam"
  | "Container/Pots";

export type PlantPreference =
  | "Vegetables Only"
  | "Vegetables + Herbs"
  | "Vegetables + Herbs + Flowers"
  | "Flowers + Herbs"
  | "Flowers Only";

export type UnitSystem = "imperial" | "metric";

// ---------------------------------------------------------------------------
// Garden Area — one distinct growing space (bed, container group, etc.)
// ---------------------------------------------------------------------------

export interface GardenArea {
  id: string;
  name: string;
  lengthFt: number;
  widthFt: number;
  sunlight: SunlightLevel;
  soilType: SoilType;
}

// ---------------------------------------------------------------------------
// Custom plant — user-entered, not on the whitelist
// ---------------------------------------------------------------------------

export interface CustomPlant {
  id: string;
  name: string;
  category: PlantType | "other";
  notes?: string;
}

// ---------------------------------------------------------------------------
// Growing Region
// ---------------------------------------------------------------------------

export interface GrowingRegion {
  id: string;
  label: string;
  province: string;
  lastSpringFrost: string;
  firstFallFrost: string;
  zone: string;
}

// ---------------------------------------------------------------------------
// Plant
// ---------------------------------------------------------------------------

export interface FlowerBenefits {
  pollinatorSupport: boolean;
  pestDeterrence: boolean;
  companionPlanting: boolean;
  visualAppeal: boolean;
  notes?: string;
}

export interface PlantItem {
  id: string;
  name: string;
  type: PlantType;
  emoji: string;
  abbr: string;
  spacingFt: number;
  weeksBeforeFrost: number;
  directSow: boolean;
  startIndoors: boolean;
  daysToMaturity: number;
  indoorWeeksAhead?: number;
  actionType: ActionType;
  minSunlight: SunlightLevel;
  isWhitelisted: boolean;
  riskLevel: "normal" | "high";
  gardenBenefits?: FlowerBenefits;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Garden Profile (questionnaire inputs)
// ---------------------------------------------------------------------------

export interface GardenProfile {
  region: string;
  unitPreference: UnitSystem;
  // Primary area convenience fields — mirrors areas[0], kept for backward compat
  lengthFt: number;
  widthFt: number;
  sunlight: SunlightLevel;
  soilType: SoilType;
  // Multi-area support (always ≥ 1; areas[0] must match the primary fields)
  areas: GardenArea[];
  // Plant selection (empty = use smart deterministic logic)
  selectedPlantIds: string[];
  customPlants: CustomPlant[];
  // Optional legacy field (used when selectedPlantIds is empty and no AI)
  plantPreference?: PlantPreference;
}

// ---------------------------------------------------------------------------
// Garden Map
// ---------------------------------------------------------------------------

export interface MapCell {
  plant: PlantItem | null;
  hasConflict: boolean;
  conflictReason?: string;
}

// ---------------------------------------------------------------------------
// Weekly Schedule
// ---------------------------------------------------------------------------

export interface PlantAction {
  plant?: PlantItem;
  actionType: ActionType;
  description: string;
  timingNote?: string;
  depthNote?: string;
}

export interface WeeklyScheduleItem {
  weekLabel: string;
  weekStartDate: string;
  isCurrent: boolean;
  hasActions: boolean;
  actions: PlantAction[];
  notes: string;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export interface ValidationResult {
  plantWhitelistPassed: boolean;
  companionValidationPassed: boolean;
  adjacentConflictCount: number;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Per-area plan — one grid per garden area
// ---------------------------------------------------------------------------

export interface AreaPlan {
  area: GardenArea;
  selectedPlants: PlantItem[];
  grid: MapCell[][];
}

// ---------------------------------------------------------------------------
// Generated Plan
// ---------------------------------------------------------------------------

export interface GeneratedPlan {
  id: string;
  generatedAt: string;
  generationMode: "deterministic" | "ai";
  fallbackReason?: string;
  profile: GardenProfile;
  region: GrowingRegion;
  selectedPlants: PlantItem[];
  grid: MapCell[][];
  schedule: WeeklyScheduleItem[];
  conflicts: string[];
  validation: ValidationResult;
  timingExplanation: string;
  companionNotes: string[];
  cautionNotes: string[];
  // Per-area grids (parallel to profile.areas)
  areaPlans: AreaPlan[];
}

// ---------------------------------------------------------------------------
// Unit settings helper
// ---------------------------------------------------------------------------

export interface UnitSettings {
  system: UnitSystem;
  label: string;
  abbr: string;
  maxInput: number;
  capDisplay: string;
}

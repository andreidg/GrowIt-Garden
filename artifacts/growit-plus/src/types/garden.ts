/**
 * GrowIt+ — Single source of truth for all TypeScript types.
 * Import from here instead of from individual data/utility files.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

export type PlantType = "vegetable" | "herb" | "flower";

export type ActionType =
  | "start_indoors"
  | "direct_sow"
  | "transplant"
  | "harvest_soon";

export type SunlightLevel = "Full Sun" | "Partial Shade" | "Full Shade";

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

/** The measurement system chosen by the user for input and display. */
export type UnitSystem = "imperial" | "metric";

// ---------------------------------------------------------------------------
// Growing Region
// ---------------------------------------------------------------------------

/**
 * A location module with frost dates and growing-zone data.
 * Calgary is the default beachhead region; others are selectable.
 */
export interface GrowingRegion {
  id: string;               // URL-safe slug, e.g. "calgary"
  label: string;            // Display name, e.g. "Calgary"
  province: string;         // e.g. "Alberta"
  lastSpringFrost: string;  // e.g. "May 14"
  firstFallFrost: string;   // e.g. "Sep 17"
  zone: string;             // e.g. "3b–4a"
}

// ---------------------------------------------------------------------------
// Plant
// ---------------------------------------------------------------------------

/**
 * Garden-support benefits for flower items.
 * Flowers are treated as functional garden plants, not only decorative.
 */
export interface FlowerBenefits {
  pollinatorSupport: boolean;
  pestDeterrence: boolean;
  companionPlanting: boolean;
  visualAppeal: boolean;
  notes?: string;
}

/** A single plant in the regional whitelist. */
export interface PlantItem {
  id: string;                   // URL-safe slug, e.g. "tomatoes"
  name: string;
  type: PlantType;
  emoji: string;
  abbr: string;                 // 3-letter grid abbreviation
  spacingFt: number;            // square-foot spacing requirement
  weeksBeforeFrost: number;     // weeks before last spring frost to direct-sow
  directSow: boolean;
  startIndoors: boolean;
  daysToMaturity: number;
  indoorWeeksAhead?: number;    // weeks before last frost to start indoors
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

/**
 * All user inputs collected by the questionnaire.
 * Dimensions are always stored internally in feet for calculations.
 */
export interface GardenProfile {
  region: string;             // key into GROWING_REGIONS, e.g. "Calgary"
  lengthFt: number;           // internal feet value (always)
  widthFt: number;
  sunlight: SunlightLevel;
  soilType: SoilType;
  plantPreference: PlantPreference;
  unitPreference: UnitSystem; // the unit the user chose for input/display
}

// ---------------------------------------------------------------------------
// Garden Map
// ---------------------------------------------------------------------------

/** A single cell in the visual garden grid. */
export interface MapCell {
  plant: PlantItem | null;
  hasConflict: boolean;
  conflictReason?: string;
}

// ---------------------------------------------------------------------------
// Weekly Schedule
// ---------------------------------------------------------------------------

/** A single planting action within a weekly schedule entry. */
export interface PlantAction {
  plant: PlantItem;
  actionType: ActionType;
  description: string;
}

/**
 * One week in the planting calendar, from today through first fall frost.
 * Quiet weeks (no actions) are included per PRD requirement.
 */
export interface WeeklyScheduleItem {
  weekLabel: string;        // e.g. "Week of May 12"
  weekStartDate: string;    // ISO date string for serialization
  isCurrent: boolean;
  hasActions: boolean;
  actions: PlantAction[];
  notes: string;            // summary or "No actions this week"
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
// Generated Plan
// ---------------------------------------------------------------------------

/**
 * The complete output returned by the plan generator.
 * Serialization-safe: no Sets or Date objects.
 */
export interface GeneratedPlan {
  id: string;
  generatedAt: string;              // ISO date string
  generationMode: "deterministic" | "ai";
  profile: GardenProfile;
  region: GrowingRegion;
  selectedPlants: PlantItem[];
  grid: MapCell[][];
  schedule: WeeklyScheduleItem[];
  conflicts: string[];              // plant names with adjacent grid conflicts
  validation: ValidationResult;
  timingExplanation: string;        // human-readable growing season summary
  companionNotes: string[];         // why specific flowers/plants were included
  cautionNotes: string[];           // plants excluded or included with caveats
}

// ---------------------------------------------------------------------------
// Unit settings helper
// ---------------------------------------------------------------------------

export interface UnitSettings {
  system: UnitSystem;
  label: string;        // "feet" | "metres"
  abbr: string;         // "ft" | "m"
  maxInput: number;     // 20 | 6.1
  capDisplay: string;   // "20ft × 20ft" | "6.1m × 6.1m"
}

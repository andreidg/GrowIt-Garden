export type PlantType = "vegetable" | "herb";
export type ActionType = "start_indoors" | "direct_sow" | "transplant";

export interface Plant {
  name: string;
  type: PlantType;
  emoji: string;
  abbr: string;           // short label for grid cell, e.g. "CAR"
  spacingFt: number;      // square feet per plant
  weeksBeforeFrost: number; // weeks before last spring frost to start indoors (0 = direct sow after frost)
  directSow: boolean;     // can direct sow outdoors
  startIndoors: boolean;  // should start indoors
  daysToMaturity: number;
  indoorWeeksAhead?: number; // weeks before last frost to start indoors
  shade?: "full" | "partial" | "any"; // sun tolerance
  actionType: ActionType;
  minSunlight: "Full Sun" | "Partial Shade" | "Full Shade";
}

export const VEGETABLES: Plant[] = [
  { name: "Carrots",     type: "vegetable", emoji: "🥕", abbr: "CAR", spacingFt: 0.1, directSow: true,  startIndoors: false, daysToMaturity: 70,  weeksBeforeFrost: 4,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Kale",        type: "vegetable", emoji: "🥬", abbr: "KAL", spacingFt: 1,   directSow: false, startIndoors: true,  daysToMaturity: 55,  indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade" },
  { name: "Spinach",     type: "vegetable", emoji: "🌿", abbr: "SPN", spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 45,  weeksBeforeFrost: 4,  actionType: "direct_sow",   minSunlight: "Partial Shade" },
  { name: "Lettuce",     type: "vegetable", emoji: "🥗", abbr: "LET", spacingFt: 0.5, directSow: true,  startIndoors: false, daysToMaturity: 50,  weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Partial Shade" },
  { name: "Radishes",    type: "vegetable", emoji: "🔴", abbr: "RAD", spacingFt: 0.1, directSow: true,  startIndoors: false, daysToMaturity: 28,  weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Peas",        type: "vegetable", emoji: "🫛", abbr: "PEA", spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 60,  weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Beans",       type: "vegetable", emoji: "🫘", abbr: "BEA", spacingFt: 0.5, directSow: true,  startIndoors: false, daysToMaturity: 55,  weeksBeforeFrost: 0,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Zucchini",    type: "vegetable", emoji: "🥒", abbr: "ZUC", spacingFt: 9,   directSow: false, startIndoors: true,  daysToMaturity: 55,  indoorWeeksAhead: 4,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Tomatoes",    type: "vegetable", emoji: "🍅", abbr: "TOM", spacingFt: 4,   directSow: false, startIndoors: true,  daysToMaturity: 75,  indoorWeeksAhead: 8,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Cucumbers",   type: "vegetable", emoji: "🥒", abbr: "CUC", spacingFt: 2,   directSow: false, startIndoors: true,  daysToMaturity: 60,  indoorWeeksAhead: 4,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Beets",       type: "vegetable", emoji: "🟤", abbr: "BET", spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 55,  weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Swiss Chard", type: "vegetable", emoji: "🍃", abbr: "CHA", spacingFt: 1,   directSow: true,  startIndoors: false, daysToMaturity: 50,  weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Partial Shade" },
  { name: "Broccoli",    type: "vegetable", emoji: "🥦", abbr: "BRC", spacingFt: 2,   directSow: false, startIndoors: true,  daysToMaturity: 70,  indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Cabbage",     type: "vegetable", emoji: "🥬", abbr: "CAB", spacingFt: 2,   directSow: false, startIndoors: true,  daysToMaturity: 80,  indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Potatoes",    type: "vegetable", emoji: "🥔", abbr: "POT", spacingFt: 1,   directSow: true,  startIndoors: false, daysToMaturity: 80,  weeksBeforeFrost: 0,  actionType: "transplant",   minSunlight: "Full Sun" },
];

export const HERBS: Plant[] = [
  { name: "Basil",     type: "herb", emoji: "🌿", abbr: "BAS", spacingFt: 0.5, directSow: false, startIndoors: true,  daysToMaturity: 30, indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Chives",    type: "herb", emoji: "🌱", abbr: "CHV", spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 60, weeksBeforeFrost: 4,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Parsley",   type: "herb", emoji: "🌿", abbr: "PAR", spacingFt: 0.5, directSow: false, startIndoors: true,  daysToMaturity: 70, indoorWeeksAhead: 10, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade" },
  { name: "Dill",      type: "herb", emoji: "🌿", abbr: "DIL", spacingFt: 0.5, directSow: true,  startIndoors: false, daysToMaturity: 40, weeksBeforeFrost: 0,  actionType: "direct_sow",   minSunlight: "Full Sun" },
  { name: "Cilantro",  type: "herb", emoji: "🌿", abbr: "CIL", spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 45, weeksBeforeFrost: 2,  actionType: "direct_sow",   minSunlight: "Partial Shade" },
  { name: "Thyme",     type: "herb", emoji: "🌿", abbr: "THY", spacingFt: 0.5, directSow: false, startIndoors: true,  daysToMaturity: 85, indoorWeeksAhead: 8,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Oregano",   type: "herb", emoji: "🌿", abbr: "ORE", spacingFt: 0.5, directSow: false, startIndoors: true,  daysToMaturity: 85, indoorWeeksAhead: 8,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Mint",      type: "herb", emoji: "🌿", abbr: "MNT", spacingFt: 1,   directSow: false, startIndoors: true,  daysToMaturity: 60, indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade" },
  { name: "Sage",      type: "herb", emoji: "🌿", abbr: "SAG", spacingFt: 0.5, directSow: false, startIndoors: true,  daysToMaturity: 75, indoorWeeksAhead: 6,  weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
  { name: "Lavender",  type: "herb", emoji: "💜", abbr: "LAV", spacingFt: 2,   directSow: false, startIndoors: true,  daysToMaturity: 90, indoorWeeksAhead: 10, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun" },
];

/**
 * GrowIt+ Regional Plant Whitelist — Zone 3b–4a (Alberta)
 * All plants validated for short-season growing conditions.
 * Source of truth: PRD V10 Section 11.2 + flower additions.
 */

import type { PlantItem } from "@/types/garden";

export type { PlantItem };

export const VEGETABLES: PlantItem[] = [
  {
    id: "carrots", name: "Carrots", type: "vegetable", emoji: "🥕", abbr: "CAR",
    spacingFt: 0.1, directSow: true, startIndoors: false, daysToMaturity: 70,
    weeksBeforeFrost: 4, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "kale", name: "Kale", type: "vegetable", emoji: "🥬", abbr: "KAL",
    spacingFt: 1, directSow: false, startIndoors: true, daysToMaturity: 55,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "spinach", name: "Spinach", type: "vegetable", emoji: "🌿", abbr: "SPN",
    spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 45,
    weeksBeforeFrost: 4, actionType: "direct_sow", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "lettuce", name: "Lettuce", type: "vegetable", emoji: "🥗", abbr: "LET",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 50,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "radishes", name: "Radishes", type: "vegetable", emoji: "🔴", abbr: "RAD",
    spacingFt: 0.1, directSow: true, startIndoors: false, daysToMaturity: 28,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "peas", name: "Peas", type: "vegetable", emoji: "🫛", abbr: "PEA",
    spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 60,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "beans", name: "Beans", type: "vegetable", emoji: "🫘", abbr: "BEA",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 55,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "zucchini", name: "Zucchini", type: "vegetable", emoji: "🥒", abbr: "ZUC",
    spacingFt: 9, directSow: false, startIndoors: true, daysToMaturity: 55,
    indoorWeeksAhead: 4, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "tomatoes", name: "Tomatoes", type: "vegetable", emoji: "🍅", abbr: "TOM",
    spacingFt: 4, directSow: false, startIndoors: true, daysToMaturity: 75,
    indoorWeeksAhead: 8, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    notes: "Use early short-season varieties only (e.g. Tumbler, Siletz).",
  },
  {
    id: "cucumbers", name: "Cucumbers", type: "vegetable", emoji: "🫒", abbr: "CUC",
    spacingFt: 2, directSow: false, startIndoors: true, daysToMaturity: 60,
    indoorWeeksAhead: 4, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "beets", name: "Beets", type: "vegetable", emoji: "🟤", abbr: "BET",
    spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 55,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "swiss-chard", name: "Swiss Chard", type: "vegetable", emoji: "🍃", abbr: "CHA",
    spacingFt: 1, directSow: true, startIndoors: false, daysToMaturity: 50,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "broccoli", name: "Broccoli", type: "vegetable", emoji: "🥦", abbr: "BRC",
    spacingFt: 2, directSow: false, startIndoors: true, daysToMaturity: 70,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "cabbage", name: "Cabbage", type: "vegetable", emoji: "🥬", abbr: "CAB",
    spacingFt: 2, directSow: false, startIndoors: true, daysToMaturity: 80,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "potatoes", name: "Potatoes", type: "vegetable", emoji: "🥔", abbr: "POT",
    spacingFt: 1, directSow: true, startIndoors: false, daysToMaturity: 80,
    weeksBeforeFrost: 0, actionType: "transplant", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
];

export const HERBS: PlantItem[] = [
  {
    id: "basil", name: "Basil", type: "herb", emoji: "🫙", abbr: "BAS",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 30,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "chives", name: "Chives", type: "herb", emoji: "🌱", abbr: "CHV",
    spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 60,
    weeksBeforeFrost: 4, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "parsley", name: "Parsley", type: "herb", emoji: "🍀", abbr: "PAR",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 70,
    indoorWeeksAhead: 10, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "dill", name: "Dill", type: "herb", emoji: "🌾", abbr: "DIL",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 40,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "cilantro", name: "Cilantro", type: "herb", emoji: "🌿", abbr: "CIL",
    spacingFt: 0.25, directSow: true, startIndoors: false, daysToMaturity: 45,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "thyme", name: "Thyme", type: "herb", emoji: "🍵", abbr: "THY",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 85,
    indoorWeeksAhead: 8, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "oregano", name: "Oregano", type: "herb", emoji: "🫚", abbr: "ORE",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 85,
    indoorWeeksAhead: 8, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
  {
    id: "mint", name: "Mint", type: "herb", emoji: "🍃", abbr: "MNT",
    spacingFt: 1, directSow: false, startIndoors: true, daysToMaturity: 60,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
    notes: "Grow in containers to prevent spreading.",
  },
  {
    id: "sage", name: "Sage", type: "herb", emoji: "🌲", abbr: "SAG",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 75,
    indoorWeeksAhead: 6, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
  },
];

/**
 * Flower whitelist — PRD V10 user-specified list.
 * Flowers are treated as functional garden-support plants,
 * providing pollinator attraction, pest deterrence, and companion value.
 */
export const FLOWERS: PlantItem[] = [
  {
    id: "marigolds", name: "Marigolds", type: "flower", emoji: "🌼", abbr: "MAR",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 50,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: true, companionPlanting: true, visualAppeal: true,
      notes: "Repels aphids and whiteflies; excellent companion for most vegetables.",
    },
  },
  {
    id: "nasturtiums", name: "Nasturtiums", type: "flower", emoji: "🟠", abbr: "NAS",
    spacingFt: 1, directSow: true, startIndoors: false, daysToMaturity: 50,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: true, companionPlanting: true, visualAppeal: true,
      notes: "Edible flowers and leaves; acts as an aphid trap crop, protecting vegetables.",
    },
  },
  {
    id: "calendula", name: "Calendula", type: "flower", emoji: "🏵️", abbr: "CAL",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 50,
    weeksBeforeFrost: 2, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: true, companionPlanting: true, visualAppeal: true,
      notes: "Repels aphids and tomato hornworms; edible petals with mild flavour.",
    },
  },
  {
    id: "pansies", name: "Pansies", type: "flower", emoji: "🌺", abbr: "PAN",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 55,
    indoorWeeksAhead: 10, weeksBeforeFrost: 4, actionType: "start_indoors", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: false, visualAppeal: true,
      notes: "Cool-season colour; edible; attracts early-season pollinators before other plants bloom.",
    },
  },
  {
    id: "violas", name: "Violas", type: "flower", emoji: "🪻", abbr: "VIO",
    spacingFt: 0.5, directSow: false, startIndoors: true, daysToMaturity: 55,
    indoorWeeksAhead: 10, weeksBeforeFrost: 4, actionType: "start_indoors", minSunlight: "Partial Shade",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: false, visualAppeal: true,
      notes: "Edible flowers; cool-season ground cover; attracts beneficial insects.",
    },
  },
  {
    id: "sunflowers", name: "Sunflowers", type: "flower", emoji: "🌻", abbr: "SUN",
    spacingFt: 2, directSow: true, startIndoors: false, daysToMaturity: 70,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: true, visualAppeal: true,
      notes: "Strong pollinator magnet; tall varieties can act as a natural windbreak or trellis.",
    },
  },
  {
    id: "cosmos", name: "Cosmos", type: "flower", emoji: "🌸", abbr: "COS",
    spacingFt: 1, directSow: true, startIndoors: false, daysToMaturity: 60,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: true, visualAppeal: true,
      notes: "Attracts lacewings and other beneficial predatory insects.",
    },
  },
  {
    id: "zinnias", name: "Zinnias", type: "flower", emoji: "💮", abbr: "ZIN",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 60,
    weeksBeforeFrost: 0, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: false, visualAppeal: true,
      notes: "High-impact pollinator attractor with long-lasting, bold blooms.",
    },
  },
  {
    id: "sweet-peas", name: "Sweet Peas", type: "flower", emoji: "🌷", abbr: "SWP",
    spacingFt: 0.5, directSow: true, startIndoors: false, daysToMaturity: 70,
    weeksBeforeFrost: 4, actionType: "direct_sow", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: false, companionPlanting: false, visualAppeal: true,
      notes: "Fragrant climber; attracts bees and butterflies throughout summer.",
    },
  },
  {
    id: "lavender", name: "Lavender", type: "flower", emoji: "💜", abbr: "LAV",
    spacingFt: 2, directSow: false, startIndoors: true, daysToMaturity: 90,
    indoorWeeksAhead: 10, weeksBeforeFrost: 0, actionType: "start_indoors", minSunlight: "Full Sun",
    isWhitelisted: true, riskLevel: "normal",
    gardenBenefits: {
      pollinatorSupport: true, pestDeterrence: true, companionPlanting: true, visualAppeal: true,
      notes: "Zone 4 varieties only; repels moths, fleas, and flies; strong bee attractor.",
    },
  },
];

/** All whitelisted plants across all categories. */
export const ALL_PLANTS: PlantItem[] = [...VEGETABLES, ...HERBS, ...FLOWERS];

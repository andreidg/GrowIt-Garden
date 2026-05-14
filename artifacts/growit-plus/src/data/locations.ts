/**
 * SproutIt Growing-Region Frost Data
 * PRD V10 Section 11.1 — hardcoded demo frost dates for Alberta regions.
 * Calgary is the default beachhead location; others are selectable.
 */

import type { GrowingRegion } from "@/types/garden";

export type { GrowingRegion };

/**
 * Keyed by the display label (e.g. "Calgary") for easy dropdown lookup.
 * The `id` field is a URL-safe slug for future API use.
 */
export const GROWING_REGIONS: Record<string, GrowingRegion> = {
  Calgary: {
    id: "calgary",
    label: "Calgary",
    province: "Alberta",
    lastSpringFrost: "May 14",
    firstFallFrost: "Sep 17",
    zone: "3b–4a",
  },
  Edmonton: {
    id: "edmonton",
    label: "Edmonton",
    province: "Alberta",
    lastSpringFrost: "May 23",
    firstFallFrost: "Sep 10",
    zone: "3a–4a",
  },
  "Red Deer": {
    id: "red-deer",
    label: "Red Deer",
    province: "Alberta",
    lastSpringFrost: "May 21",
    firstFallFrost: "Sep 12",
    zone: "3b",
  },
  Airdrie: {
    id: "airdrie",
    label: "Airdrie",
    province: "Alberta",
    lastSpringFrost: "May 18",
    firstFallFrost: "Sep 13",
    zone: "3b",
  },
  Cochrane: {
    id: "cochrane",
    label: "Cochrane",
    province: "Alberta",
    lastSpringFrost: "May 20",
    firstFallFrost: "Sep 11",
    zone: "3b",
  },
  Okotoks: {
    id: "okotoks",
    label: "Okotoks",
    province: "Alberta",
    lastSpringFrost: "May 13",
    firstFallFrost: "Sep 18",
    zone: "4a",
  },
};

/** Sorted list of region keys for dropdown use. */
export const REGION_KEYS = Object.keys(GROWING_REGIONS);

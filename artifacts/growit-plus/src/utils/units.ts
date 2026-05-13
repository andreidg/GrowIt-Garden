import type { UnitSystem, UnitSettings } from "@/types/garden";

/** Display configuration for each unit system. */
export const UNIT_CONFIG: Record<UnitSystem, UnitSettings> = {
  imperial: {
    system:     "imperial",
    label:      "feet",
    abbr:       "ft",
    maxInput:   20,
    capDisplay: "20ft × 20ft",
  },
  metric: {
    system:     "metric",
    label:      "metres",
    abbr:       "m",
    maxInput:   6.1,
    capDisplay: "6.1m × 6.1m",
  },
};

/**
 * Convert a user-facing metre value to the internal foot representation.
 * Result is rounded to the nearest whole foot and capped at 20ft.
 */
export function mToFt(metres: number): number {
  return Math.min(20, Math.round(metres * 3.28084));
}

/**
 * Convert an internal foot value to metres for display.
 * Returns one decimal place.
 */
export function ftToM(feet: number): number {
  return parseFloat((feet * 0.3048).toFixed(1));
}

/**
 * Normalise a raw user input value to feet for internal storage.
 * Handles unit conversion and caps the result at the 20ft maximum.
 */
export function toInternalFt(value: number, unit: UnitSystem): number {
  const ft = unit === "metric" ? Math.round(value * 3.28084) : value;
  return Math.min(20, ft);
}

/**
 * Format an internal foot value for display in the user's chosen unit.
 * e.g. displayDimension(10, "imperial") → "10ft"
 *      displayDimension(10, "metric")   → "3.0m"
 */
export function displayDimension(feet: number, unit: UnitSystem): string {
  if (unit === "metric") return `${ftToM(feet)}m`;
  return `${feet}ft`;
}

/**
 * Cap a raw input number to the unit-system maximum before conversion.
 * Returns the capped value (still in the user's unit).
 */
export function capToMax(value: number, unit: UnitSystem): number {
  return Math.min(value, UNIT_CONFIG[unit].maxInput);
}

/**
 * ai-plan-client — Frontend orchestrator for AI-enhanced plan generation.
 *
 * Calls the backend /api/ai-plan endpoint, validates the response, looks up
 * full PlantItem objects from the local whitelist, and assembles the plan.
 * Automatically falls back to the deterministic generator on any failure.
 *
 * The OpenAI API key is NEVER referenced in this file.
 * All AI calls go through the backend.
 */

import type { GardenProfile, GrowingRegion, GeneratedPlan } from "@/types/garden";
import { ALL_PLANTS } from "@/data/plants";
import { generatePlan, buildPlanFromSelection } from "@/data/plan-generator";

// ── API response types ────────────────────────────────────────────────────

interface AIPlanSuccess {
  generationMode:    "ai";
  fallbackReason:    null;
  selectedPlantIds:  string[];
  timingExplanation: string;
  companionNotes:    string[];
  cautionNotes:      string[];
}

interface AIPlanFallback {
  generationMode:    "deterministic";
  fallbackReason:    string;
  selectedPlantIds:  null;
  timingExplanation: null;
  companionNotes:    null;
  cautionNotes:      null;
}

type AIPlanAPIResponse = AIPlanSuccess | AIPlanFallback;

// ── Result type returned to the UI ────────────────────────────────────────

export interface AIPlanResult {
  plan:           GeneratedPlan;
  aiUsed:         boolean;
  fallbackReason: string | null;
}

// ── Main exported function ────────────────────────────────────────────────

/**
 * Try to generate an AI-enhanced plan via the backend.
 * Always resolves — never rejects. Falls back to the deterministic
 * generator on any network error, API failure, or invalid response.
 */
export async function generateAIPlan(
  profile: GardenProfile,
  region:  GrowingRegion,
): Promise<AIPlanResult> {
  try {
    const res = await fetch("/api/ai-plan", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile,
        regionData: {
          label:           region.label,
          zone:            region.zone,
          lastSpringFrost: region.lastSpringFrost,
          firstFallFrost:  region.firstFallFrost,
        },
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = (await res.json()) as AIPlanAPIResponse;

    // ── Fallback signal from backend ────────────────────────────────────
    if (data.generationMode === "deterministic") {
      return {
        plan:           generatePlan(profile, region),
        aiUsed:         false,
        fallbackReason: data.fallbackReason ?? "Deterministic plan used",
      };
    }

    // ── AI success path ────────────────────────────────────────────────
    // Look up full PlantItem objects from local whitelist (source of truth)
    const selectedPlants = data.selectedPlantIds
      .map(id => ALL_PLANTS.find(p => p.id === id))
      .filter((p): p is typeof ALL_PLANTS[number] => p !== undefined);

    if (selectedPlants.length === 0) {
      return {
        plan:           generatePlan(profile, region),
        aiUsed:         false,
        fallbackReason: "AI returned no recognisable plants",
      };
    }

    const plan = buildPlanFromSelection(profile, region, selectedPlants, {
      timingExplanation: data.timingExplanation,
      companionNotes:    data.companionNotes,
      cautionNotes:      data.cautionNotes,
    });

    return { plan, aiUsed: true, fallbackReason: null };

  } catch {
    // Network error, timeout, parse failure, etc.
    return {
      plan:           generatePlan(profile, region),
      aiUsed:         false,
      fallbackReason: "Could not reach the AI service",
    };
  }
}

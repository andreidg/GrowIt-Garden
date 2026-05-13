/**
 * POST /api/ai-plan
 *
 * Optional AI-powered garden plan generation.
 * Reads the OpenAI API key from environment variables only — never from the client.
 * If the key is missing, the API is unreachable, or the response is invalid, the
 * route returns { generationMode: "deterministic", fallbackReason: "..." } so the
 * frontend can immediately run the deterministic generator instead.
 *
 * The AI only selects plant IDs and writes narrative text.
 * Grid layout, schedule, and companion validation remain deterministic on the client.
 */

import { Router, type IRouter } from "express";
import OpenAI from "openai";

// ── Plant whitelist (IDs + context for the prompt) ────────────────────────
const PLANT_METADATA: Record<string, { name: string; type: string; spacingFt: number; sunlight: string; container: boolean; notes?: string }> = {
  // Vegetables
  carrots:      { name: "Carrots",      type: "vegetable", spacingFt: 0.1, sunlight: "Full Sun",      container: true  },
  kale:         { name: "Kale",         type: "vegetable", spacingFt: 1,   sunlight: "Partial Shade",  container: true  },
  spinach:      { name: "Spinach",      type: "vegetable", spacingFt: 0.25,sunlight: "Partial Shade",  container: true  },
  lettuce:      { name: "Lettuce",      type: "vegetable", spacingFt: 0.5, sunlight: "Partial Shade",  container: true  },
  radishes:     { name: "Radishes",     type: "vegetable", spacingFt: 0.1, sunlight: "Full Sun",       container: true  },
  peas:         { name: "Peas",         type: "vegetable", spacingFt: 0.25,sunlight: "Full Sun",       container: true  },
  beans:        { name: "Beans",        type: "vegetable", spacingFt: 0.5, sunlight: "Full Sun",       container: false },
  zucchini:     { name: "Zucchini",     type: "vegetable", spacingFt: 9,   sunlight: "Full Sun",       container: false },
  tomatoes:     { name: "Tomatoes",     type: "vegetable", spacingFt: 4,   sunlight: "Full Sun",       container: false, notes: "Use short-season varieties only (Tumbler, Siletz)" },
  cucumbers:    { name: "Cucumbers",    type: "vegetable", spacingFt: 2,   sunlight: "Full Sun",       container: false },
  beets:        { name: "Beets",        type: "vegetable", spacingFt: 0.25,sunlight: "Full Sun",       container: true  },
  "swiss-chard":{ name: "Swiss Chard",  type: "vegetable", spacingFt: 1,   sunlight: "Partial Shade",  container: true  },
  broccoli:     { name: "Broccoli",     type: "vegetable", spacingFt: 2,   sunlight: "Full Sun",       container: false },
  cabbage:      { name: "Cabbage",      type: "vegetable", spacingFt: 2,   sunlight: "Full Sun",       container: false },
  potatoes:     { name: "Potatoes",     type: "vegetable", spacingFt: 1,   sunlight: "Full Sun",       container: false },
  // Herbs
  basil:        { name: "Basil",        type: "herb",      spacingFt: 0.5, sunlight: "Full Sun",       container: true  },
  chives:       { name: "Chives",       type: "herb",      spacingFt: 0.25,sunlight: "Full Sun",       container: true  },
  parsley:      { name: "Parsley",      type: "herb",      spacingFt: 0.5, sunlight: "Partial Shade",  container: true  },
  dill:         { name: "Dill",         type: "herb",      spacingFt: 0.5, sunlight: "Full Sun",       container: false },
  cilantro:     { name: "Cilantro",     type: "herb",      spacingFt: 0.25,sunlight: "Partial Shade",  container: true  },
  thyme:        { name: "Thyme",        type: "herb",      spacingFt: 0.5, sunlight: "Full Sun",       container: true  },
  oregano:      { name: "Oregano",      type: "herb",      spacingFt: 0.5, sunlight: "Full Sun",       container: true  },
  mint:         { name: "Mint",         type: "herb",      spacingFt: 1,   sunlight: "Partial Shade",  container: true, notes: "Invasive — best in containers" },
  sage:         { name: "Sage",         type: "herb",      spacingFt: 0.5, sunlight: "Full Sun",       container: true  },
  // Flowers
  marigolds:    { name: "Marigolds",    type: "flower",    spacingFt: 0.5, sunlight: "Partial Shade",  container: true,  notes: "Repels aphids; top companion plant" },
  nasturtiums:  { name: "Nasturtiums",  type: "flower",    spacingFt: 1,   sunlight: "Partial Shade",  container: false, notes: "Edible trap crop for aphids" },
  calendula:    { name: "Calendula",    type: "flower",    spacingFt: 0.5, sunlight: "Partial Shade",  container: true,  notes: "Repels aphids; frost-tolerant" },
  pansies:      { name: "Pansies",      type: "flower",    spacingFt: 0.5, sunlight: "Partial Shade",  container: true,  notes: "Cool-season; edible; attracts early pollinators" },
  violas:       { name: "Violas",       type: "flower",    spacingFt: 0.5, sunlight: "Partial Shade",  container: true,  notes: "Edible; cool-season ground cover" },
  sunflowers:   { name: "Sunflowers",   type: "flower",    spacingFt: 2,   sunlight: "Full Sun",       container: false, notes: "Strong pollinator magnet" },
  cosmos:       { name: "Cosmos",       type: "flower",    spacingFt: 1,   sunlight: "Full Sun",       container: false, notes: "Attracts beneficial insects; 60–90 cm tall" },
  zinnias:      { name: "Zinnias",      type: "flower",    spacingFt: 0.5, sunlight: "Full Sun",       container: true,  notes: "Bold blooms; long-lasting" },
  "sweet-peas": { name: "Sweet Peas",   type: "flower",    spacingFt: 0.5, sunlight: "Full Sun",       container: false, notes: "Climbing vine; needs trellis" },
  lavender:     { name: "Lavender",     type: "flower",    spacingFt: 2,   sunlight: "Full Sun",       container: false, notes: "Zone-4 varieties only; needs excellent drainage" },
};

const ALL_PLANT_IDS = Object.keys(PLANT_METADATA);

// ── Companion conflict pairs ──────────────────────────────────────────────
const COMPANION_CONFLICTS: [string, string][] = [
  ["tomatoes", "fennel"],
  ["beans",    "onions"],
  ["peas",     "onions"],
];

// ── Types ─────────────────────────────────────────────────────────────────
interface AIRequestBody {
  profile: {
    region:          string;
    lengthFt:        number;
    widthFt:         number;
    sunlight:        string;
    soilType:        string;
    plantPreference: string;
    unitPreference:  string;
  };
  regionData: {
    label:           string;
    zone:            string;
    lastSpringFrost: string;
    firstFallFrost:  string;
  };
}

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

type AIPlanResponse = AIPlanSuccess | AIPlanFallback;

// ── OpenAI client (lazy, at request time) ─────────────────────────────────
function tryCreateClient(): OpenAI | null {
  const apiKey  = process.env["OPENAI_API_KEY"] || process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] || undefined;
  if (!apiKey) return null;
  return new OpenAI({ apiKey, baseURL });
}

// ── Route ─────────────────────────────────────────────────────────────────
const router: IRouter = Router();

router.post("/ai-plan", async (req, res) => {
  const body = req.body as Partial<AIRequestBody>;
  const profile    = body.profile;
  const regionData = body.regionData;

  if (!profile || !regionData) {
    res.status(400).json({ error: "Missing profile or regionData" });
    return;
  }

  const fallback = (reason: string): AIPlanFallback => ({
    generationMode: "deterministic",
    fallbackReason: reason,
    selectedPlantIds: null,
    timingExplanation: null,
    companionNotes: null,
    cautionNotes: null,
  });

  // ── Check API key availability ──────────────────────────────────────────
  const client = tryCreateClient();
  if (!client) {
    req.log.info("ai-plan: no OpenAI key configured — returning fallback");
    res.json(fallback("OpenAI API key not configured"));
    return;
  }

  // ── Validate profile inputs ─────────────────────────────────────────────
  const MAX_FT = 20;
  if (
    typeof profile.lengthFt !== "number" || profile.lengthFt <= 0 || profile.lengthFt > MAX_FT ||
    typeof profile.widthFt  !== "number" || profile.widthFt  <= 0 || profile.widthFt  > MAX_FT
  ) {
    res.status(400).json({ error: "Garden dimensions out of range (max 20 ft × 20 ft)" });
    return;
  }

  // ── Build prompt ───────────────────────────────────────────────────────
  const area         = profile.lengthFt * profile.widthFt;
  const isContainer  = profile.soilType === "Container/Pots";
  const includeVeg   = profile.plantPreference !== "Flowers Only" && profile.plantPreference !== "Flowers + Herbs";
  const includeHerbs = profile.plantPreference !== "Vegetables Only";
  const includeFlowers = profile.plantPreference !== "Vegetables Only" && profile.plantPreference !== "Vegetables + Herbs";

  // Build filtered candidate list for the prompt
  const candidates = Object.entries(PLANT_METADATA)
    .filter(([, m]) => {
      if (!includeVeg     && m.type === "vegetable") return false;
      if (!includeHerbs   && m.type === "herb")       return false;
      if (!includeFlowers && m.type === "flower")     return false;
      if (profile.sunlight === "Full Shade" && m.sunlight === "Full Sun") return false;
      if (isContainer && !m.container) return false;
      return true;
    })
    .map(([id, m]) => {
      const note = m.notes ? ` [${m.notes}]` : "";
      return `${id} (${m.name}, ${m.type}, ${m.spacingFt} sqft spacing${note})`;
    });

  const conflictNote = COMPANION_CONFLICTS
    .map(([a, b]) => `${a} and ${b} should not be adjacent`)
    .join("; ");

  const prompt = `You are an expert Alberta garden planner. Your job is to select the best plants for a specific garden and write clear, helpful growing advice tailored to it.

GARDEN PROFILE:
- Region: ${regionData.label}, Alberta (Growing Zone ${regionData.zone})
- Last spring frost: ${regionData.lastSpringFrost} | First fall frost: ${regionData.firstFallFrost}
- Garden size: ${profile.lengthFt} ft × ${profile.widthFt} ft = ${area} sq ft
- Sunlight: ${profile.sunlight}
- Soil type: ${profile.soilType}
- Plant preference: ${profile.plantPreference}
- Unit system: ${profile.unitPreference}

APPROVED PLANT WHITELIST (select from these only):
${candidates.join("\n")}

COMPANION CONFLICT RULES: ${conflictNote}

TASK:
1. Select the most suitable plants for this garden from the whitelist above. Consider:
   - Total spacing must fit within ${area} sq ft
   - Container gardens: compact plants only (spacingFt ≤ 1)
   - Alberta short season: prioritise proven producers for zone ${regionData.zone}
   - Companion planting benefits (marigolds with vegetables, etc.)
   - Flag but do NOT exclude conflicting pairs — include them with a caution note
2. Write a 2–3 sentence timingExplanation summarising this specific garden's season
3. Write 2–4 companionNotes explaining why your flower/herb choices benefit vegetables
4. Write 0–3 cautionNotes for any high-risk inclusions or important caveats

Respond ONLY with valid JSON in this exact shape:
{
  "plantIds": ["id1", "id2", ...],
  "timingExplanation": "...",
  "companionNotes": ["...", "..."],
  "cautionNotes": ["...", "..."]
}`;

  // ── Call OpenAI ────────────────────────────────────────────────────────
  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a knowledgeable Alberta garden planner. Always respond with valid JSON only." },
        { role: "user",   content: prompt },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: { plantIds?: unknown; timingExplanation?: unknown; companionNotes?: unknown; cautionNotes?: unknown };
    try {
      parsed = JSON.parse(raw) as typeof parsed;
    } catch {
      req.log.warn({ raw }, "ai-plan: failed to parse JSON response");
      res.json(fallback("AI response was not valid JSON"));
      return;
    }

    // ── Validate plant IDs against whitelist ──────────────────────────────
    const rawIds = Array.isArray(parsed.plantIds) ? (parsed.plantIds as unknown[]) : [];
    const validatedIds = rawIds
      .filter((id): id is string => typeof id === "string" && ALL_PLANT_IDS.includes(id))
      .filter((id, i, arr) => arr.indexOf(id) === i); // dedupe

    if (validatedIds.length === 0) {
      req.log.warn({ rawIds }, "ai-plan: no valid plant IDs after whitelist check");
      res.json(fallback("AI returned no valid plant selections"));
      return;
    }

    // ── Check companion conflicts and build warning notes ──────────────────
    const extraCautions: string[] = [];
    for (const [a, b] of COMPANION_CONFLICTS) {
      if (validatedIds.includes(a) && validatedIds.includes(b)) {
        extraCautions.push(`Note: ${PLANT_METADATA[a]?.name} and ${PLANT_METADATA[b]?.name} are companion-planting conflicts — they've been included but the map will flag adjacent cells.`);
      }
    }

    // ── Sanitise text fields ───────────────────────────────────────────────
    const sanitise = (v: unknown, fallbackVal: string): string =>
      typeof v === "string" && v.trim().length > 0 ? v.trim() : fallbackVal;

    const sanitiseArr = (v: unknown): string[] =>
      Array.isArray(v)
        ? (v as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0).map(s => s.trim())
        : [];

    const timingExplanation = sanitise(
      parsed.timingExplanation,
      `Your ${regionData.label} garden has a growing season from ${regionData.lastSpringFrost} to ${regionData.firstFallFrost}.`
    );
    const companionNotes = sanitiseArr(parsed.companionNotes);
    const cautionNotes   = [...sanitiseArr(parsed.cautionNotes), ...extraCautions];

    const payload: AIPlanSuccess = {
      generationMode:   "ai",
      fallbackReason:   null,
      selectedPlantIds: validatedIds,
      timingExplanation,
      companionNotes,
      cautionNotes,
    };

    req.log.info({ region: regionData.label, plantCount: validatedIds.length }, "ai-plan: success");
    res.json(payload);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    // Classify error for user-friendly fallback reason
    let reason = "AI generation failed";
    if (/api.?key|auth|401|403/i.test(msg))          reason = "Invalid or expired OpenAI API key";
    else if (/rate.?limit|429|quota/i.test(msg))      reason = "OpenAI rate limit reached";
    else if (/timeout|abort|network/i.test(msg))      reason = "AI request timed out";
    else if (/insufficient_quota/i.test(msg))         reason = "OpenAI quota exceeded";

    req.log.warn({ err: msg, region: regionData.label }, `ai-plan: ${reason}`);
    res.json(fallback(reason));
  }
});

export default router;

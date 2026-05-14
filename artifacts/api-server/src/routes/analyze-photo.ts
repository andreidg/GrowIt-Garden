/**
 * POST /api/analyze-photo
 * GET  /api/analyze-photo/available
 *
 * Accepts a client-compressed base64 JPEG, calls OpenAI Vision to estimate
 * sunlight exposure and soil type only. Never estimates dimensions or
 * diagnoses pests/disease.
 *
 * If no API key is configured the route returns { available: false } instead
 * of an error, so the frontend can suppress the upload UI entirely.
 */

import { Router, type IRouter } from "express";
import OpenAI from "openai";

const router: IRouter = Router();

// ── Availability check ────────────────────────────────────────────────────
router.get("/analyze-photo/available", (_req, res) => {
  const hasKey =
    !!(process.env["OPENAI_API_KEY"] || process.env["AI_INTEGRATIONS_OPENAI_API_KEY"]);
  res.json({ available: hasKey });
});

// ── Analysis ──────────────────────────────────────────────────────────────
router.post("/analyze-photo", async (req, res) => {
  const { imageBase64 } = req.body as { imageBase64?: string };

  if (!imageBase64 || typeof imageBase64 !== "string" || imageBase64.length < 100) {
    res.status(400).json({ error: "invalid_image", reason: "Image data is missing or too small" });
    return;
  }

  // Rough size guard: 800px JPEG at 0.72 quality ≈ 80–200 KB → base64 ≈ 270 KB
  if (imageBase64.length > 500_000) {
    res.status(413).json({ error: "image_too_large", reason: "Please upload a smaller photo" });
    return;
  }

  const apiKey  = process.env["OPENAI_API_KEY"] || process.env["AI_INTEGRATIONS_OPENAI_API_KEY"];
  const baseURL = process.env["AI_INTEGRATIONS_OPENAI_BASE_URL"] || undefined;

  if (!apiKey) {
    res.json({ available: false });
    return;
  }

  const client = new OpenAI({ apiKey, baseURL });

  const systemPrompt =
    "You are a garden assessment assistant. Analyse garden photos to estimate growing conditions. " +
    "Never estimate dimensions, diagnose pests, or identify diseases. " +
    "Respond ONLY with valid JSON — no markdown, no extra text.";

  const userPrompt =
    "Look at this garden photo and estimate:\n" +
    "1. sunlight: one of EXACTLY these five values:\n" +
    "   - \"Full Sun\"      = 6+ hours of direct sunlight per day (open sky, strong shadows)\n" +
    "   - \"Part Sun\"      = 4–6 hours of direct sunlight per day\n" +
    "   - \"Part Shade\"    = 2–4 hours of direct sunlight per day, or filtered light most of the day\n" +
    "   - \"Dappled Shade\" = filtered light through trees, fences, pergolas, or structures\n" +
    "   - \"Full Shade\"    = less than 2 hours of direct sunlight per day, but still bright outdoor indirect light\n" +
    "2. sunlightConfidence: one of [\"high\", \"medium\", \"low\"]\n" +
    "   - high = clear evidence (deep shadows, bright open sky, dense canopy, etc.)\n" +
    "   - medium = reasonable inference\n" +
    "   - low = difficult to tell from this image\n" +
    "3. soilType: one of EXACTLY [\"Raised Bed\", \"In-Ground Clay\", \"In-Ground Loam\", \"Container/Pots\"]\n" +
    "4. soilTypeConfidence: one of [\"high\", \"medium\", \"low\"]\n" +
    "5. conditionNotes: array of 1–3 short strings describing observable garden conditions " +
    "   (drainage, sun exposure, surrounding structures, bed type — NOT pests, NOT dimensions, NOT plant identification)\n\n" +
    "Return exactly: { \"sunlight\": \"...\", \"sunlightConfidence\": \"...\", " +
    "\"soilType\": \"...\", \"soilTypeConfidence\": \"...\", \"conditionNotes\": [...] }";

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text",      text: userPrompt },
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}`, detail: "low" } },
          ],
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      req.log.warn({ raw }, "analyze-photo: JSON parse failed");
      res.status(502).json({ error: "parse_failed", reason: "AI returned an unexpected format" });
      return;
    }

    // ── Validate + sanitise fields ────────────────────────────────────────
    const SUNLIGHT_VALS = ["Full Sun", "Part Sun", "Part Shade", "Dappled Shade", "Full Shade"] as const;
    const SOIL_VALS     = ["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"] as const;
    const CONF_VALS     = ["high", "medium", "low"] as const;

    // Backward-compat alias: older models occasionally return the legacy "Partial Shade"
    const rawSunlight = parsed["sunlight"] === "Partial Shade" ? "Part Shade" : parsed["sunlight"];

    const sunlight           = SUNLIGHT_VALS.find(v => v === rawSunlight)                   ?? "Part Shade";
    const sunlightConfidence = CONF_VALS.find(v => v === parsed["sunlightConfidence"])      ?? "low";
    const soilType           = SOIL_VALS.find(v => v === parsed["soilType"])                ?? "In-Ground Loam";
    const soilTypeConfidence = CONF_VALS.find(v => v === parsed["soilTypeConfidence"])      ?? "low";

    const rawNotes = Array.isArray(parsed["conditionNotes"]) ? parsed["conditionNotes"] : [];
    const conditionNotes = rawNotes
      .filter((n): n is string => typeof n === "string" && n.trim().length > 0)
      .map(n => n.trim())
      .slice(0, 3);

    req.log.info({ sunlight, soilType }, "analyze-photo: success");

    res.json({
      available:           true,
      sunlight,
      sunlightConfidence,
      soilType,
      soilTypeConfidence,
      conditionNotes,
    });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.warn({ err: msg }, "analyze-photo: API call failed");

    let reason = "Photo analysis is temporarily unavailable";
    if (/api.?key|auth|401|403/i.test(msg))     reason = "Invalid or expired API key";
    else if (/rate.?limit|429|quota/i.test(msg)) reason = "Rate limit reached — try again in a moment";
    else if (/timeout|abort/i.test(msg))         reason = "Analysis timed out — try a smaller photo";

    res.status(503).json({ error: "analysis_failed", reason });
  }
});

export default router;

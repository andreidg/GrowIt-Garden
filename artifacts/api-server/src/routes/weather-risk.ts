/**
 * GET /api/weather-risk?region=Calgary
 *
 * Fetches 7-day forecast from Open-Meteo (no API key required) and evaluates
 * four garden-specific risk conditions for the selected Alberta growing region.
 * Returns a structured JSON payload; never throws to the client — on failure
 * it responds with 503 + { error: "weather_unavailable" }.
 */

import { Router, type IRouter } from "express";

// ── Region coordinates ────────────────────────────────────────────────────
const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  Calgary:    { lat: 51.0447, lon: -114.0719 },
  Edmonton:   { lat: 53.5461, lon: -113.4938 },
  "Red Deer": { lat: 52.2681, lon: -113.8112 },
  Airdrie:    { lat: 51.2917, lon: -114.0144 },
  Cochrane:   { lat: 51.1890, lon: -114.4679 },
  Okotoks:    { lat: 50.7250, lon: -113.9750 },
};

// ── Types ─────────────────────────────────────────────────────────────────
interface OpenMeteoDaily {
  time: string[];
  temperature_2m_min: number[];
  temperature_2m_max: number[];
  precipitation_sum: number[];
}

type RiskType    = "frost" | "heat" | "heavy_rain" | "dry_spell";
type Severity    = "high" | "medium" | "low";

interface WeatherRisk {
  type:     RiskType;
  label:    string;
  detail:   string;
  severity: Severity;
}

interface WeatherRiskResponse {
  region:             string;
  fetchedAt:          string;
  summary:            string;
  risks:              WeatherRisk[];
  recommendedActions: string[];
}

// ── Route ─────────────────────────────────────────────────────────────────
const router: IRouter = Router();

router.get("/weather-risk", async (req, res) => {
  const regionParam = typeof req.query["region"] === "string"
    ? req.query["region"]
    : "Calgary";

  const region = regionParam in REGION_COORDS ? regionParam : "Calgary";
  const { lat, lon } = REGION_COORDS[region]!;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum` +
      `&timezone=America%2FEdmonton` +
      `&forecast_days=7`;

    const apiRes = await fetch(url, { signal: AbortSignal.timeout(6000) });

    if (!apiRes.ok) {
      throw new Error(`Open-Meteo responded ${apiRes.status}`);
    }

    const raw = await apiRes.json() as { daily: OpenMeteoDaily };
    const { daily } = raw;

    const days = daily.time.map((date, i) => ({
      date,
      minTemp: daily.temperature_2m_min[i] ?? 99,
      maxTemp: daily.temperature_2m_max[i] ?? -99,
      precip:  daily.precipitation_sum[i] ?? 0,
    }));

    // ── Risk evaluation ──────────────────────────────────────────────────
    const risks: WeatherRisk[] = [];

    // 1. Frost risk: any day with min temp ≤ 2 °C
    const frostDays = days.filter(d => d.minTemp <= 2);
    if (frostDays.length > 0) {
      const worst = frostDays.reduce((a, b) => a.minTemp < b.minTemp ? a : b);
      risks.push({
        type:     "frost",
        label:    "Frost Risk",
        detail:   `Low of ${worst.minTemp.toFixed(1)} °C on ${fmtDay(worst.date)} — frost-sensitive plants at risk`,
        severity: "high",
      });
    }

    // 2. Heat risk: any day with max temp ≥ 30 °C
    const heatDays = days.filter(d => d.maxTemp >= 30);
    if (heatDays.length > 0) {
      const hottest = heatDays.reduce((a, b) => a.maxTemp > b.maxTemp ? a : b);
      risks.push({
        type:     "heat",
        label:    "Heat Risk",
        detail:   `High of ${hottest.maxTemp.toFixed(1)} °C on ${fmtDay(hottest.date)} — heat stress possible`,
        severity: "medium",
      });
    }

    // 3. Heavy rain: any day with precipitation ≥ 10 mm
    const rainDays = days.filter(d => d.precip >= 10);
    if (rainDays.length > 0) {
      const wettest = rainDays.reduce((a, b) => a.precip > b.precip ? a : b);
      risks.push({
        type:     "heavy_rain",
        label:    "Heavy Rain",
        detail:   `${wettest.precip.toFixed(0)} mm on ${fmtDay(wettest.date)} — soil saturation possible`,
        severity: "medium",
      });
    }

    // 4. Dry spell: total precipitation over 7 days < 3 mm
    const totalPrecip = days.reduce((s, d) => s + d.precip, 0);
    if (totalPrecip < 3) {
      risks.push({
        type:     "dry_spell",
        label:    "Dry Spell",
        detail:   `Only ${totalPrecip.toFixed(1)} mm total over 7 days — consistent watering needed`,
        severity: "low",
      });
    }

    const recommendedActions = buildActions(risks);

    let summary: string;
    if (risks.length === 0) {
      summary = "Good gardening conditions forecast for the next 7 days.";
    } else {
      const high = risks.find(r => r.severity === "high");
      summary = high
        ? `${high.label} forecast this week — take action to protect your garden.`
        : `${risks.length} condition${risks.length > 1 ? "s" : ""} to watch this week.`;
    }

    const payload: WeatherRiskResponse = {
      region,
      fetchedAt: new Date().toISOString(),
      summary,
      risks,
      recommendedActions,
    };

    req.log.info({ region, riskCount: risks.length }, "weather-risk evaluated");
    res.json(payload);

  } catch (err) {
    req.log.warn({ err, region }, "weather-risk fetch failed");
    res.status(503).json({ error: "weather_unavailable" });
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function fmtDay(iso: string): string {
  return new Date(iso).toLocaleDateString("en-CA", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function buildActions(risks: WeatherRisk[]): string[] {
  const types  = new Set(risks.map(r => r.type));
  const out: string[] = [];

  if (types.has("frost")) {
    out.push(
      "Cover tomatoes, peppers, basil, and any tender flower transplants before nightfall — these are the most frost-sensitive."
    );
    out.push(
      "Delay moving warm-season seedlings outside until the frost risk has cleared."
    );
  }

  if (types.has("heat")) {
    out.push(
      "Water vegetables and flowers in the early morning — this reduces evaporation and prevents leaf scorch."
    );
    out.push(
      "Apply mulch around herbs and vegetables to keep roots cool and retain soil moisture."
    );
  }

  if (types.has("heavy_rain")) {
    out.push(
      "Skip watering this week — the forecasted rain should cover your garden's needs."
    );
    out.push(
      "Check drainage around raised beds and containers to prevent waterlogging of roots."
    );
  }

  if (types.has("dry_spell")) {
    out.push(
      "Water deeply every 2–3 days — vegetables, herbs, and flowers all need consistent moisture during a dry stretch."
    );
    out.push(
      "Container gardens dry out faster than ground beds — check them daily and water when the top 2 cm of soil is dry."
    );
  }

  if (out.length === 0) {
    out.push(
      "Conditions look favourable! Keep up regular watering and watch for early signs of aphids or other pests."
    );
  }

  return out;
}

export default router;

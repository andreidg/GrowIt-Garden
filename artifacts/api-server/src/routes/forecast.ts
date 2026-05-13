/**
 * GET /api/forecast?region=Calgary
 *
 * Returns a 7-day daily forecast from Open-Meteo for the given Alberta region.
 * Used by the weather strip widget in the weekly schedule tab.
 */

import { Router, type IRouter } from "express";

const REGION_COORDS: Record<string, { lat: number; lon: number }> = {
  Calgary:    { lat: 51.0447, lon: -114.0719 },
  Edmonton:   { lat: 53.5461, lon: -113.4938 },
  "Red Deer": { lat: 52.2681, lon: -113.8112 },
  Airdrie:    { lat: 51.2917, lon: -114.0144 },
  Cochrane:   { lat: 51.1890, lon: -114.4679 },
  Okotoks:    { lat: 50.7250, lon: -113.9750 },
};

const DAY_ABBR = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface ForecastDay {
  date:        string;
  dayLabel:    string;
  high:        number;
  low:         number;
  weatherCode: number;
  precip:      number;
  dotColor:    "green" | "gold" | "red";
}

interface ForecastResponse {
  region: string;
  days:   ForecastDay[];
}

interface OpenMeteoDaily {
  time:                string[];
  temperature_2m_max:  number[];
  temperature_2m_min:  number[];
  precipitation_sum:   number[];
  weather_code:        number[];
}

function dotColor(min: number, precip: number): "green" | "gold" | "red" {
  if (min <= 2 || precip >= 10) return "red";
  if (min <= 5 || precip >= 3)  return "gold";
  return "green";
}

const router: IRouter = Router();

router.get("/forecast", async (req, res) => {
  const regionParam = typeof req.query["region"] === "string"
    ? req.query["region"]
    : "Calgary";
  const region = regionParam in REGION_COORDS ? regionParam : "Calgary";
  const { lat, lon } = REGION_COORDS[region]!;

  try {
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
      `&timezone=America%2FEdmonton` +
      `&forecast_days=7`;

    const apiRes = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!apiRes.ok) throw new Error(`Open-Meteo ${apiRes.status}`);

    const raw  = await apiRes.json() as { daily: OpenMeteoDaily };
    const { daily } = raw;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: ForecastDay[] = daily.time.map((date, i) => {
      const d   = new Date(date + "T00:00:00");
      const diff = Math.round((d.getTime() - today.getTime()) / 86_400_000);
      const dayLabel = diff === 0 ? "Today"
        : diff === 1 ? "Tomorrow"
        : DAY_ABBR[d.getDay()] ?? date;

      const high   = Math.round(daily.temperature_2m_max[i] ?? 0);
      const low    = Math.round(daily.temperature_2m_min[i] ?? 0);
      const precip = Math.round((daily.precipitation_sum[i] ?? 0) * 10) / 10;
      const code   = daily.weather_code[i] ?? 0;

      return { date, dayLabel, high, low, weatherCode: code, precip, dotColor: dotColor(low, precip) };
    });

    const payload: ForecastResponse = { region, days };
    req.log.info({ region }, "forecast fetched");
    res.json(payload);
  } catch (err) {
    req.log.warn({ err }, "forecast fetch failed");
    res.status(503).json({ error: "forecast_unavailable" });
  }
});

export default router;

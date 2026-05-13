/**
 * useWeatherRisk — fetches garden weather risk data from the backend.
 * Automatically re-fetches when the region changes.
 * Never throws; sets `error` to true on any failure so the UI can fall back.
 */

import { useState, useEffect } from "react";

export type RiskType = "frost" | "heat" | "heavy_rain" | "dry_spell";
export type Severity = "high" | "medium" | "low";

export interface WeatherRisk {
  type:     RiskType;
  label:    string;
  detail:   string;
  severity: Severity;
}

export interface WeatherRiskData {
  region:             string;
  fetchedAt:          string;
  summary:            string;
  risks:              WeatherRisk[];
  recommendedActions: string[];
}

interface UseWeatherRiskResult {
  data:    WeatherRiskData | null;
  loading: boolean;
  error:   boolean;
}

export function useWeatherRisk(region: string): UseWeatherRiskResult {
  const [data,    setData]    = useState<WeatherRiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await fetch(
          `/api/weather-risk?region=${encodeURIComponent(region)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as WeatherRiskData;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [region]);

  return { data, loading, error };
}

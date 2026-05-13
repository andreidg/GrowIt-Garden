import { useState, useEffect } from "react";

export interface ForecastDay {
  date:        string;
  dayLabel:    string;
  high:        number;
  low:         number;
  weatherCode: number;
  precip:      number;
  dotColor:    "green" | "gold" | "red";
}

interface UseForecastResult {
  days:    ForecastDay[];
  loading: boolean;
  error:   boolean;
}

export function useForecast(region: string): UseForecastResult {
  const [days,    setDays]    = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);

    fetch(`/api/forecast?region=${encodeURIComponent(region)}`, {
      signal: AbortSignal.timeout(8000),
    })
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: { days: ForecastDay[] }) => {
        if (!cancelled) { setDays(data.days); setLoading(false); }
      })
      .catch(() => {
        if (!cancelled) { setError(true); setLoading(false); }
      });

    return () => { cancelled = true; };
  }, [region]);

  return { days, loading, error };
}

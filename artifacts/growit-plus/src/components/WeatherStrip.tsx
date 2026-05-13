import type { ForecastDay } from "@/hooks/useForecast";

// ── WMO weather-code → icon mapping ──────────────────────────────────────

function WeatherIcon({ code, className = "w-8 h-8" }: { code: number; className?: string }) {
  if (code === 0) return <SunIcon className={className} />;
  if (code <= 2)  return <PartlyCloudyIcon className={className} />;
  if (code <= 3)  return <CloudIcon className={className} />;
  if (code <= 48) return <CloudIcon className={className} />;
  if (code <= 67) return <RainIcon className={className} />;
  if (code <= 77) return <SnowIcon className={className} />;
  if (code <= 82) return <RainIcon className={className} />;
  if (code <= 86) return <SnowIcon className={className} />;
  return <ThunderIcon className={className} />;
}

function SunIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="16" cy="16" r="5" />
      <line x1="16" y1="3"  x2="16" y2="7"  />
      <line x1="16" y1="25" x2="16" y2="29" />
      <line x1="3"  y1="16" x2="7"  y2="16" />
      <line x1="25" y1="16" x2="29" y2="16" />
      <line x1="7.5"  y1="7.5"  x2="10.3" y2="10.3" />
      <line x1="21.7" y1="21.7" x2="24.5" y2="24.5" />
      <line x1="7.5"  y1="24.5" x2="10.3" y2="21.7" />
      <line x1="21.7" y1="10.3" x2="24.5" y2="7.5"  />
    </svg>
  );
}

function PartlyCloudyIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="12" r="4" />
      <line x1="13" y1="4"  x2="13" y2="6"  />
      <line x1="5"  y1="12" x2="7"  y2="12" />
      <line x1="7.5" y1="7.5" x2="9" y2="9" />
      <path d="M14 20H10a5 5 0 0 1 0-10h.5A6 6 0 0 1 26 16a4 4 0 0 1-4 4h-8z" />
    </svg>
  );
}

function CloudIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 22h14a5 5 0 0 0 0-10h-1a7 7 0 0 0-13 3 5 5 0 0 0 0 7z" />
    </svg>
  );
}

function RainIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18h14a5 5 0 0 0 0-10h-1a7 7 0 0 0-13 3 5 5 0 0 0 0 7z" />
      <line x1="11" y1="23" x2="9"  y2="27" />
      <line x1="16" y1="23" x2="14" y2="27" />
      <line x1="21" y1="23" x2="19" y2="27" />
    </svg>
  );
}

function SnowIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18h14a5 5 0 0 0 0-10h-1a7 7 0 0 0-13 3 5 5 0 0 0 0 7z" />
      <line x1="11" y1="23" x2="11" y2="27" />
      <line x1="16" y1="23" x2="16" y2="27" />
      <line x1="21" y1="23" x2="21" y2="27" />
      <line x1="9"  y1="25" x2="13" y2="25" />
      <line x1="14" y1="25" x2="18" y2="25" />
      <line x1="19" y1="25" x2="23" y2="25" />
    </svg>
  );
}

function ThunderIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 18h14a5 5 0 0 0 0-10h-1a7 7 0 0 0-13 3 5 5 0 0 0 0 7z" />
      <polyline points="17,21 14,26 17,26 14,31" />
    </svg>
  );
}

// ── Dot ───────────────────────────────────────────────────────────────────

const DOT_COLOR: Record<ForecastDay["dotColor"], string> = {
  green: "bg-forest",
  gold:  "bg-gold",
  red:   "bg-terracotta",
};

// ── Skeleton card ─────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="flex-shrink-0 w-20 bg-white border border-cream-dark/40 rounded-2xl p-3 flex flex-col items-center gap-2 animate-pulse">
      <div className="h-3 w-10 bg-cream-dark rounded" />
      <div className="h-8 w-8 bg-cream-dark rounded-full" />
      <div className="h-4 w-12 bg-cream-dark rounded" />
      <div className="h-2 w-2 bg-cream-dark rounded-full" />
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

interface WeatherStripProps {
  days:    ForecastDay[];
  loading: boolean;
  error:   boolean;
}

export default function WeatherStrip({ days, loading, error }: WeatherStripProps) {
  if (error) return null;

  return (
    <div className="mb-5">
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar -mx-6 px-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          : days.map(day => (
            <div
              key={day.date}
              className="flex-shrink-0 w-20 bg-white border border-cream-dark/40 rounded-2xl p-3 flex flex-col items-center gap-1.5"
            >
              <p className="text-xs font-medium text-forest/60 leading-tight">{day.dayLabel}</p>
              <WeatherIcon code={day.weatherCode} className="w-8 h-8 text-forest/70 my-0.5" />
              <div className="flex items-baseline gap-1">
                <span className="text-sm font-bold text-forest">{day.high}°</span>
                <span className="text-xs text-forest/40">{day.low}°</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${DOT_COLOR[day.dotColor]}`} />
            </div>
          ))
        }
      </div>
    </div>
  );
}

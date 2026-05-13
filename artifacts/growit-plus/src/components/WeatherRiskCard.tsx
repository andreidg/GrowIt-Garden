/**
 * WeatherRiskCard — displays the 7-day garden weather risk summary.
 * Handles loading, error (fallback message), and up to 4 risk types.
 * Weather data supplements the static frost-date table; it never replaces it.
 */

import type { WeatherRiskData, WeatherRisk, Severity } from "@/hooks/useWeatherRisk";
import { CloudSun, Snowflake, Thermometer, CloudRain, Droplets, CheckCircle, Loader } from "lucide-react";

// ── Risk type visual config ────────────────────────────────────────────────
const RISK_CFG: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
  frost: {
    icon:   Snowflake,
    color:  "text-[#3A6B80]",
    bg:     "bg-[#E8F4FA]",
    border: "border-[#90C4DA]",
  },
  heat: {
    icon:   Thermometer,
    color:  "text-terracotta",
    bg:     "bg-terracotta/8",
    border: "border-terracotta/25",
  },
  heavy_rain: {
    icon:   CloudRain,
    color:  "text-[#3A5A80]",
    bg:     "bg-[#EAF0F8]",
    border: "border-[#90A8C4]",
  },
  dry_spell: {
    icon:   Droplets,
    color:  "text-gold",
    bg:     "bg-gold/10",
    border: "border-gold/30",
  },
};

const SEVERITY_DOT: Record<Severity, string> = {
  high:   "bg-terracotta",
  medium: "bg-gold",
  low:    "bg-forest/40",
};

// ── Props ─────────────────────────────────────────────────────────────────
interface WeatherRiskCardProps {
  loading: boolean;
  error:   boolean;
  data:    WeatherRiskData | null;
}

export default function WeatherRiskCard({ loading, error, data }: WeatherRiskCardProps) {
  // ── Loading skeleton ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex items-center gap-3 animate-pulse">
        <Loader className="w-5 h-5 text-forest/30 animate-spin shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-cream-dark rounded w-1/2" />
          <div className="h-2.5 bg-cream-dark rounded w-3/4" />
        </div>
      </div>
    );
  }

  // ── Fallback (API error) ──────────────────────────────────────────────
  if (error || !data) {
    return (
      <div
        className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex gap-3"
        data-testid="weather-risk-fallback"
      >
        <CloudSun className="w-5 h-5 text-forest/40 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-semibold text-forest/50 uppercase tracking-wider mb-1">
            Garden Weather
          </p>
          <p className="text-sm text-forest/60 leading-relaxed">
            Live weather is unavailable right now. Your plan still uses local frost-date guidance.
          </p>
        </div>
      </div>
    );
  }

  const hasRisks = data.risks.length > 0;

  return (
    <div
      className="bg-cream-light border border-cream-dark rounded-2xl overflow-hidden"
      data-testid="weather-risk-card"
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-cream-dark/60 bg-cream-dark/20">
        <CloudSun className="w-5 h-5 text-forest/60 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-forest/50 uppercase tracking-wider">
            This Week's Garden Weather
          </p>
          <p className="text-sm font-medium text-forest leading-snug mt-0.5">
            {data.summary}
          </p>
        </div>
        {!hasRisks && (
          <CheckCircle className="w-5 h-5 text-forest/50 shrink-0" />
        )}
      </div>

      {/* ── Risk list ─────────────────────────────────────────────────── */}
      {hasRisks && (
        <div className="px-4 pt-3 pb-2 space-y-2">
          {data.risks.map((risk, i) => (
            <RiskRow key={i} risk={risk} />
          ))}
        </div>
      )}

      {/* ── Recommended actions ───────────────────────────────────────── */}
      {data.recommendedActions.length > 0 && (
        <div className="px-4 pb-4">
          {hasRisks && (
            <p className="text-[10px] font-bold uppercase tracking-wider text-forest/45 mt-3 mb-2">
              Recommended Actions
            </p>
          )}
          <ul className="space-y-2">
            {data.recommendedActions.map((action, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-forest/40 mt-0.5 text-xs shrink-0">›</span>
                <span className="text-sm text-forest/75 leading-relaxed">{action}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-cream-dark/40 bg-cream-dark/10">
        <p className="text-[10px] text-forest/35 font-medium">
          7-day forecast · Open-Meteo · Frost-date table is the primary planting guide
        </p>
      </div>
    </div>
  );
}

function RiskRow({ risk }: { risk: WeatherRisk }) {
  const cfg  = RISK_CFG[risk.type] ?? RISK_CFG["dry_spell"]!;
  const Icon = cfg.icon;

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className={`text-xs font-bold ${cfg.color}`}>{risk.label}</span>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${SEVERITY_DOT[risk.severity]}`} />
          <span className="text-[10px] font-medium text-forest/45 capitalize">{risk.severity}</span>
        </div>
        <p className="text-xs text-forest/70 leading-snug">{risk.detail}</p>
      </div>
    </div>
  );
}

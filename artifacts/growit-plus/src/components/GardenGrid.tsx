import { useState } from "react";
import type { MapCell, UnitSystem } from "@/types/garden";
import { X } from "lucide-react";

interface GardenGridProps {
  grid: MapCell[][];
  lengthFt: number;
  widthFt: number;
  unitPreference: UnitSystem;
}

// ─── Category colour tokens ────────────────────────────────────────────────
const CAT = {
  vegetable: {
    cell:   "bg-[#DFF0E6] border-[#9DC9AD]",
    header: "bg-[#DFF0E6]",
    badge:  "bg-[#1A3C2E] text-[#F5F0E8]",
    dot:    "bg-[#1A3C2E]",
    pill:   "bg-[#DFF0E6] border-[#9DC9AD] text-[#1A3C2E]",
    label:  "Vegetable",
    icon:   "🥗",
  },
  herb: {
    cell:   "bg-[#F5EDD8] border-[#D4B068]",
    header: "bg-[#F5EDD8]",
    badge:  "bg-[#7A5218] text-[#F5F0E8]",
    dot:    "bg-[#C4902C]",
    pill:   "bg-[#F5EDD8] border-[#D4B068] text-[#7A5218]",
    label:  "Herb",
    icon:   "🌿",
  },
  flower: {
    cell:   "bg-[#F5E8F2] border-[#C8A0C8]",
    header: "bg-[#F5E8F2]",
    badge:  "bg-[#8B3A7E] text-[#F5F0E8]",
    dot:    "bg-[#B060A8]",
    pill:   "bg-[#F5E8F2] border-[#C8A0C8] text-[#8B3A7E]",
    label:  "Flower",
    icon:   "🌸",
  },
} as const;

const ACTION_LABELS: Record<string, string> = {
  start_indoors: "Start Indoors",
  direct_sow:    "Direct Sow",
  transplant:    "Transplant",
  harvest_soon:  "Harvest Soon",
};

// Show up to 5 chars of name (+ ellipsis if truncated) so cells stay readable
function cellLabel(name: string): string {
  return name.length > 5 ? name.slice(0, 5) : name;
}

// Spacing in the user's preferred unit
function formatSpacing(spacingFt: number, unit: UnitSystem): string {
  if (unit === "metric") {
    const cm = Math.round(spacingFt * 30.48);
    return cm < 100 ? `${cm} cm apart` : `${(spacingFt * 0.3048).toFixed(1)} m apart`;
  }
  if (spacingFt < 1) return `${Math.round(spacingFt * 12)} in apart`;
  return `${spacingFt} ft apart`;
}

// ─── Component ─────────────────────────────────────────────────────────────
export default function GardenGrid({
  grid,
  lengthFt,
  widthFt,
  unitPreference,
}: GardenGridProps) {
  const [selected, setSelected] = useState<{ r: number; c: number } | null>(null);

  const cols = Math.round(lengthFt);
  const rows = Math.round(widthFt);

  // Compute proportional cell size: fill viewport width on small screens,
  // clamp to 44–56 px so the grid never gets too large or too small.
  // Horizontal scroll kicks in when total grid width > 100%.
  const CELL_PX   = 44;
  const GAP_PX    = 6;
  const PADDING_PX = 10;

  const selectedCell  = selected ? grid[selected.r][selected.c] : null;
  const selectedPlant = selectedCell?.plant ?? null;

  const toggleCell = (r: number, c: number) => {
    if (!grid[r][c].plant) return;
    setSelected(prev => (prev?.r === r && prev?.c === c ? null : { r, c }));
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Grid ── */}
      <div className="overflow-x-auto hide-scrollbar -mx-1 px-1">
        <div
          className="inline-grid rounded-2xl"
          style={{
            gridTemplateColumns: `repeat(${cols}, ${CELL_PX}px)`,
            gridTemplateRows:    `repeat(${rows}, ${CELL_PX}px)`,
            gap:     GAP_PX,
            padding: PADDING_PX,
            background: "var(--color-cream-dark)",
          }}
          data-testid="garden-grid"
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const plant     = cell.plant;
              const cat       = plant ? CAT[plant.type] : null;
              const isSelected = selected?.r === r && selected?.c === c;

              return (
                <button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => toggleCell(r, c)}
                  disabled={!plant}
                  className={[
                    "relative flex flex-col items-center justify-center rounded-xl border select-none",
                    "transition-all duration-150",
                    plant ? "cursor-pointer" : "cursor-default",
                    plant && !isSelected ? `${cat!.cell} hover:brightness-95 active:scale-95 shadow-sm` : "",
                    isSelected ? `${cat!.cell} ring-2 ring-offset-1 ring-forest shadow-md scale-[1.08]` : "",
                    !plant ? "bg-[#E0D9CF]/60 border-[#C8C0B4]/60" : "",
                  ].join(" ")}
                  style={{ width: CELL_PX, height: CELL_PX }}
                  data-testid={`grid-cell-${r}-${c}`}
                  aria-label={plant?.name ?? "Empty cell"}
                >
                  {plant ? (
                    <>
                      <span className="text-[18px] leading-none">{plant.emoji}</span>
                      <span
                        className="text-[7px] font-bold uppercase tracking-tight w-full text-center px-0.5 mt-0.5 leading-tight truncate"
                        style={{ color: "rgba(26,60,46,0.70)" }}
                      >
                        {cellLabel(plant.name)}
                      </span>

                      {/* Companion conflict badge */}
                      {cell.hasConflict && (
                        <div
                          className="absolute -top-1.5 -right-1.5 bg-white border border-terracotta/40 rounded-full shadow text-[8px] w-[18px] h-[18px] flex items-center justify-center z-10"
                          title="Companion conflict with adjacent plant"
                        >
                          ⚠️
                        </div>
                      )}

                      {/* High-risk indicator (e.g. lavender) */}
                      {plant.riskLevel === "high" && !cell.hasConflict && (
                        <div
                          className="absolute -top-1.5 -right-1.5 bg-amber-100 border border-amber-400 rounded-full shadow text-[9px] font-bold w-[18px] h-[18px] flex items-center justify-center text-amber-700 z-10"
                          title="High-risk plant — see notes"
                        >
                          !
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-[9px] font-medium text-forest/25">—</span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Tap hint ── */}
      <p className="text-[10px] text-forest/35 text-center -mt-1 print:hidden">
        Tap a plant cell for spacing &amp; care details
      </p>

      {/* ── Dimension + legend row ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <span className="text-xs text-forest/50 font-medium">
          {formatDimLabel(lengthFt, widthFt, unitPreference)}
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CAT) as (keyof typeof CAT)[]).map(type => (
            <div
              key={type}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${CAT[type].pill}`}
            >
              <span>{CAT[type].icon}</span>
              <span>{CAT[type].label}</span>
            </div>
          ))}
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-terracotta/30 bg-white text-[10px] font-semibold text-terracotta">
            <span>⚠️</span>
            <span>Conflict</span>
          </div>
        </div>
      </div>

      {/* ── Detail panel ── */}
      {selectedPlant && selectedCell && (
        <DetailPanel
          cell={selectedCell}
          unitPreference={unitPreference}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

// ─── Detail panel component ─────────────────────────────────────────────────
function DetailPanel({
  cell,
  unitPreference,
  onClose,
}: {
  cell: MapCell;
  unitPreference: UnitSystem;
  onClose: () => void;
}) {
  const plant = cell.plant!;
  const cat   = CAT[plant.type];

  const benefitTags: { icon: string; label: string; color: string }[] = [];
  if (plant.gardenBenefits?.pollinatorSupport)
    benefitTags.push({ icon: "🐝", label: "Pollinator", color: "bg-forest/10 text-forest" });
  if (plant.gardenBenefits?.pestDeterrence)
    benefitTags.push({ icon: "🛡️", label: "Pest deterrent", color: "bg-terracotta/10 text-terracotta" });
  if (plant.gardenBenefits?.companionPlanting)
    benefitTags.push({ icon: "🤝", label: "Companion", color: "bg-gold/20 text-forest" });

  return (
    <div
      className="rounded-2xl border border-cream-dark overflow-hidden shadow-md animate-in slide-in-from-bottom-3 fade-in duration-200"
      data-testid="cell-detail-panel"
    >
      {/* Header */}
      <div className={`flex items-center gap-3 p-4 border-b border-cream-dark/60 ${cat.header}`}>
        <span className="text-4xl">{plant.emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-lg font-semibold text-forest leading-tight">{plant.name}</p>
          <div className="flex flex-wrap items-center gap-1.5 mt-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${cat.badge}`}>
              {cat.label}
            </span>
            {cell.hasConflict && (
              <span className="text-[10px] font-semibold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                ⚠️ Companion conflict
              </span>
            )}
            {plant.riskLevel === "high" && (
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                ⚠ High-risk plant
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full text-forest/40 hover:text-forest hover:bg-cream-dark transition-colors shrink-0"
          aria-label="Close detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats grid */}
      <div className="p-4 grid grid-cols-2 gap-2">
        <StatCard
          label="Action"
          value={ACTION_LABELS[plant.actionType] ?? plant.actionType}
        />
        <StatCard
          label={plant.type === "flower" ? "Days to Bloom" : "Days to Maturity"}
          value={`${plant.daysToMaturity} days`}
        />
        <StatCard
          label="Spacing"
          value={formatSpacing(plant.spacingFt, unitPreference)}
          className="col-span-2"
        />

        {/* Indoor start note */}
        {plant.startIndoors && plant.indoorWeeksAhead && (
          <div className="col-span-2 bg-forest/5 rounded-xl p-3 flex gap-2">
            <span className="text-sm shrink-0">🌱</span>
            <p className="text-xs text-forest/75 leading-relaxed">
              Start indoors <strong>{plant.indoorWeeksAhead} weeks</strong> before your last spring frost date.
            </p>
          </div>
        )}

        {/* Garden benefits (flowers) */}
        {benefitTags.length > 0 && (
          <div className="col-span-2 flex flex-wrap gap-1.5">
            {benefitTags.map(t => (
              <span key={t.label} className={`text-[10px] px-2.5 py-1 rounded-full font-semibold ${t.color}`}>
                {t.icon} {t.label}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {(plant.gardenBenefits?.notes ?? plant.notes) && (
          <div className="col-span-2 bg-cream-dark/40 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-forest/50 uppercase tracking-wider mb-1">
              {plant.type === "flower" ? "Garden Role" : "Notes"}
            </p>
            <p className="text-sm text-forest/80 leading-relaxed">
              {plant.gardenBenefits?.notes ?? plant.notes}
            </p>
          </div>
        )}

        {/* Conflict explanation */}
        {cell.hasConflict && (
          <div className="col-span-2 bg-terracotta/8 border border-terracotta/20 rounded-xl p-3">
            <p className="text-[10px] font-semibold text-terracotta uppercase tracking-wider mb-1">
              Companion Warning
            </p>
            <p className="text-xs text-terracotta/80 leading-relaxed">
              {plant.name} is adjacent to an incompatible companion plant. Space them apart or add a neutral plant between them.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-cream-dark/40 rounded-xl p-3 ${className}`}>
      <p className="text-[10px] font-semibold text-forest/50 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-semibold text-forest">{value}</p>
    </div>
  );
}

function formatDimLabel(lengthFt: number, widthFt: number, unit: UnitSystem): string {
  if (unit === "metric") {
    const l = (lengthFt * 0.3048).toFixed(1);
    const w = (widthFt  * 0.3048).toFixed(1);
    return `${l} m wide × ${w} m deep`;
  }
  return `${lengthFt} ft wide × ${widthFt} ft deep`;
}

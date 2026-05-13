import type { PlantItem, WeeklyScheduleItem } from "@/types/garden";

interface PlantTimelineProps {
  plants:   PlantItem[];
  schedule: WeeklyScheduleItem[];
}

interface PlantBands {
  plantStart:   Date | null;
  plantEnd:     Date | null;
  harvestStart: Date | null;
  harvestEnd:   Date | null;
}

// ── Derive plant / growing / harvest date bands from schedule ─────────────

function getPlantBands(plant: PlantItem, schedule: WeeklyScheduleItem[]): PlantBands {
  let plantStart:   Date | null = null;
  let plantEnd:     Date | null = null;
  let harvestStart: Date | null = null;
  let harvestEnd:   Date | null = null;

  for (const week of schedule) {
    const wStart = new Date(week.weekStartDate + "T00:00:00");
    const wEnd   = new Date(wStart.getTime() + 7 * 86_400_000);

    const hasPlant = week.actions.some(
      a => (a.actionType === "direct_sow" || a.actionType === "transplant") &&
           a.plant?.id === plant.id,
    );
    const hasHarvest = week.actions.some(
      a => (a.actionType === "harvest_soon" || a.actionType === "bloom_watch") &&
           a.plant?.id === plant.id,
    );

    if (hasPlant)   { if (!plantStart)   plantStart   = wStart; plantEnd   = wEnd; }
    if (hasHarvest) { if (!harvestStart) harvestStart = wStart; harvestEnd = wEnd; }
  }

  return { plantStart, plantEnd, harvestStart, harvestEnd };
}

// ── Helpers ───────────────────────────────────────────────────────────────

const MONTH_ABBR = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function getMonthBoundaries(start: Date, end: Date): { label: string; pct: number }[] {
  const rangeMs = end.getTime() - start.getTime();
  const months: { label: string; pct: number }[] = [];
  const d = new Date(start.getFullYear(), start.getMonth(), 1);
  while (d <= end) {
    const p = Math.max(0, ((d.getTime() - start.getTime()) / rangeMs) * 100);
    months.push({ label: MONTH_ABBR[d.getMonth()]!, pct: p });
    d.setMonth(d.getMonth() + 1);
  }
  return months;
}

function toPct(date: Date, rangeStart: Date, rangeMs: number) {
  return Math.max(0, Math.min(100, ((date.getTime() - rangeStart.getTime()) / rangeMs) * 100));
}

// ── Bar ───────────────────────────────────────────────────────────────────

function Bar({ bands, rangeStart, rangeMs }: { bands: PlantBands; rangeStart: Date; rangeMs: number }) {
  const { plantStart, plantEnd, harvestStart, harvestEnd } = bands;

  if (!plantStart || !plantEnd) {
    return <div className="h-6 rounded-full bg-cream-dark/40 w-full" />;
  }

  const growingEnd = harvestStart ?? null;
  const rightBound = harvestEnd ?? growingEnd ?? plantEnd;

  const leftPct  = toPct(plantStart, rangeStart, rangeMs);
  const rightPct = toPct(rightBound,  rangeStart, rangeMs);
  const totalPct = Math.max(rightPct - leftPct, 0.5);

  // Segments as fractions of the total coloured bar
  const plantMs   = plantEnd.getTime()    - plantStart.getTime();
  const growingMs = growingEnd ? growingEnd.getTime() - plantEnd.getTime() : 0;
  const harvestMs = (harvestEnd && harvestStart)
    ? harvestEnd.getTime() - harvestStart.getTime() : 0;
  const totalMs   = plantMs + growingMs + harvestMs;

  const frac = (ms: number) => totalMs > 0 ? `${(ms / totalMs) * 100}%` : "0%";

  return (
    <div className="relative h-6 w-full">
      {/* Track */}
      <div className="absolute inset-0 rounded-full bg-cream-dark/35" />
      {/* Coloured bar */}
      <div
        className="absolute inset-y-0 rounded-full overflow-hidden flex"
        style={{ left: `${leftPct}%`, width: `${totalPct}%` }}
      >
        {plantMs > 0 && (
          <div className="h-full bg-terracotta/75 shrink-0" style={{ width: frac(plantMs) }} />
        )}
        {growingMs > 0 && (
          <div className="h-full bg-forest/60 shrink-0" style={{ width: frac(growingMs) }} />
        )}
        {harvestMs > 0 && (
          <div className="h-full bg-gold/80 shrink-0" style={{ width: frac(harvestMs) }} />
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────

export default function PlantTimeline({ plants, schedule }: PlantTimelineProps) {
  if (!schedule.length || !plants.length) return null;

  const rangeStart = new Date(schedule[0]!.weekStartDate + "T00:00:00");
  const lastWeek   = schedule[schedule.length - 1]!;
  const rangeEnd   = new Date(new Date(lastWeek.weekStartDate + "T00:00:00").getTime() + 7 * 86_400_000);
  const rangeMs    = rangeEnd.getTime() - rangeStart.getTime();

  const activePlants = plants.filter(p =>
    schedule.some(w => w.actions.some(a => a.plant?.id === p.id)),
  );
  if (!activePlants.length) return null;

  const months = getMonthBoundaries(rangeStart, rangeEnd);

  return (
    <div className="bg-cream-light border border-cream-dark rounded-2xl p-4">
      <h3 className="font-serif text-base font-semibold text-forest mb-0.5">Plants Timeline</h3>
      <p className="text-xs text-forest/50 mb-4">Your planting, growing, and harvest windows at a glance.</p>

      {/* Chart area: icon column + timeline column */}
      <div className="flex gap-3 items-start">

        {/* Left: plant icon + name column */}
        <div className="flex flex-col shrink-0" style={{ width: "2.75rem" }}>
          {/* Header spacer (matches month label row height) */}
          <div className="h-5 mb-2" />
          {/* Plant icons */}
          {activePlants.map(plant => (
            <div key={plant.id} className="h-9 mb-4 flex flex-col items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-white border border-cream-dark flex items-center justify-center text-lg shadow-sm">
                {plant.emoji}
              </div>
            </div>
          ))}
        </div>

        {/* Right: timeline area */}
        <div className="flex-1 min-w-0 relative">

          {/* Month label row */}
          <div className="relative h-5 mb-2">
            {months.map(({ label, pct }) => (
              <span
                key={label}
                className="absolute top-0 text-[10px] font-semibold text-forest/40 uppercase tracking-wide -translate-x-1/2 first:translate-x-0"
                style={{ left: `${pct}%` }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Bars + grid lines */}
          <div className="relative">
            {/* Vertical month grid lines (behind bars) */}
            {months.map(({ label, pct }) => (
              <div
                key={label}
                className="absolute top-0 bottom-0 w-px bg-cream-dark/70 z-0"
                style={{ left: `${pct}%` }}
                aria-hidden
              />
            ))}

            {/* Plant bar rows */}
            <div className="relative z-10 flex flex-col gap-4">
              {activePlants.map(plant => (
                <div key={plant.id} className="h-9 flex items-center">
                  <div className="w-full">
                    <Bar bands={getPlantBands(plant, schedule)} rangeStart={rangeStart} rangeMs={rangeMs} />
                    <p className="text-center text-[9px] font-semibold text-forest/45 mt-0.5 truncate">
                      {plant.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap mt-4 pt-3 border-t border-cream-dark/60">
        {[
          { color: "bg-terracotta/75", label: "Plant" },
          { color: "bg-forest/60",     label: "Growing" },
          { color: "bg-gold/80",       label: "Harvest" },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-5 h-3 rounded-sm ${color}`} />
            <span className="text-xs text-forest/60">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

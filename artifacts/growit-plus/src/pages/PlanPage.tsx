import { useState } from "react";
import type { GeneratedPlan } from "@/types/garden";
import { displayDimension } from "@/utils/units";
import GardenGrid from "@/components/GardenGrid";
import WeeklySchedule from "@/components/WeeklySchedule";
import PlantLegend from "@/components/PlantLegend";
import BottomNav, { type PlanTab } from "@/components/BottomNav";
import { Printer, RotateCcw, AlertTriangle } from "lucide-react";

interface PlanPageProps {
  plan: GeneratedPlan;
  onStartOver: () => void;
}

export default function PlanPage({ plan, onStartOver }: PlanPageProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>("map");

  const { profile, region, conflicts, selectedPlants, grid, schedule } = plan;

  const fmt = (ft: number) => displayDimension(ft, profile.unitPreference);
  const gardenSizeStr = `${fmt(profile.lengthFt)} × ${fmt(profile.widthFt)}`;
  const hasConflicts = conflicts.length > 0;

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-cream animate-in fade-in duration-500 overflow-hidden">

      {/* ── Top header ── */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-cream-dark bg-cream z-10 shrink-0">
        <div>
          <h2 className="text-lg font-black text-forest font-serif leading-tight">GrowIt+</h2>
          <p className="text-xs text-forest/70 font-medium mt-0.5">
            {region.label} · Zone {region.zone} · {gardenSizeStr}
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button
            onClick={() => window.print()}
            className="w-10 h-10 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
            data-testid="btn-print"
            aria-label="Print"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={onStartOver}
            className="w-10 h-10 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
            data-testid="btn-start-over"
            aria-label="Start Over"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto w-full print:overflow-visible print:block">

        {/* Garden Map tab */}
        <div className={`${activeTab === "map" ? "block" : "hidden"} print:block p-6 space-y-6 pb-8`}>
          {hasConflicts && (
            <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl flex items-start gap-3 no-print">
              <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-terracotta text-sm">Companion Planting Notice</h4>
                <p className="text-xs text-terracotta/80 mt-1">
                  Adjacent plants with conflicts: {conflicts.join(", ")}. Cells marked ⚠️ are next to an incompatible neighbour.
                </p>
              </div>
            </div>
          )}

          <div className="bg-forest/5 border border-forest/10 p-3 rounded-2xl text-center no-print">
            <p className="text-sm font-medium text-forest/80">
              {selectedPlants.length} plants selected for your {gardenSizeStr} garden
            </p>
          </div>

          <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <GardenGrid grid={grid} lengthFt={profile.lengthFt} widthFt={profile.widthFt} />
          </div>
        </div>

        {/* Schedule tab */}
        <div className={`${activeTab === "schedule" ? "block" : "hidden"} print:block p-6 pb-8`}>
          <WeeklySchedule weeks={schedule} />
        </div>

        {/* Plants tab */}
        <div className={`${activeTab === "plants" ? "block" : "hidden"} print:block p-6 pb-8`}>
          <PlantLegend plants={selectedPlants} />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

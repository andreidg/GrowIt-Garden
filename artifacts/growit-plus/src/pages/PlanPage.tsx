import { useState } from "react";
import type { GeneratedPlan } from "@/types/garden";
import { displayDimension } from "@/utils/units";
import GardenGrid from "@/components/GardenGrid";
import WeeklySchedule from "@/components/WeeklySchedule";
import PlantLegend from "@/components/PlantLegend";
import BottomNav, { type PlanTab } from "@/components/BottomNav";
import { Printer, RotateCcw, AlertTriangle, MapPin } from "lucide-react";

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

      {/* ── Dashboard-style header ── */}
      <div className="px-6 pt-10 pb-4 bg-gradient-to-b from-cream-dark/30 to-cream shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-forest/50 mb-1.5 block">
          Your Garden Plan
        </span>
        <h1 className="font-serif text-3xl font-semibold text-forest mb-3">
          {region.label}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-forest text-cream px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3 h-3" />
            Zone {region.zone}
          </div>
          <div className="bg-cream-light border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest">
            {gardenSizeStr}
          </div>
          <div className="bg-cream-light border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest">
            {selectedPlants.length} plants
          </div>
          <div className="ml-auto flex gap-2 no-print">
            <button
              onClick={() => window.print()}
              className="w-9 h-9 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
              data-testid="btn-print"
              aria-label="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onStartOver}
              className="w-9 h-9 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
              data-testid="btn-start-over"
              aria-label="Start Over"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar w-full print:overflow-visible print:block">

        {/* Garden Map tab */}
        <div className={`${activeTab === "map" ? "block" : "hidden"} print:block px-6 py-6 space-y-6 pb-8`}>
          {hasConflicts && (
            <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl flex items-start gap-3 no-print">
              <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-terracotta text-sm mb-1">Companion Planting Notice</h4>
                <p className="text-xs text-terracotta/80 leading-relaxed">
                  Adjacent plants with conflicts: {conflicts.join(", ")}. Cells marked ⚠️ are next to an incompatible neighbour.
                </p>
              </div>
            </div>
          )}

          <div>
            <h2 className="font-serif text-xl font-semibold text-forest mb-4">
              Your Garden Map
            </h2>
            <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              <GardenGrid grid={grid} lengthFt={profile.lengthFt} widthFt={profile.widthFt} />
            </div>
          </div>
        </div>

        {/* Schedule tab */}
        <div className={`${activeTab === "schedule" ? "block" : "hidden"} print:block px-6 py-6 pb-8`}>
          <h2 className="font-serif text-xl font-semibold text-forest mb-4">
            Weekly Schedule
          </h2>
          <WeeklySchedule weeks={schedule} />
        </div>

        {/* Plants tab */}
        <div className={`${activeTab === "plants" ? "block" : "hidden"} print:block px-6 py-6 pb-8`}>
          <h2 className="font-serif text-xl font-semibold text-forest mb-4">
            Your Plants
          </h2>
          <PlantLegend plants={selectedPlants} />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

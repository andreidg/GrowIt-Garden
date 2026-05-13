import { useState } from "react";
import { GardenPlan } from "@/data/plan-generator";
import GardenGrid from "@/components/GardenGrid";
import WeeklySchedule from "@/components/WeeklySchedule";
import PlantLegend from "@/components/PlantLegend";
import BottomNav, { PlanTab } from "@/components/BottomNav";
import { Printer, RotateCcw, AlertTriangle } from "lucide-react";

interface PlanPageProps {
  plan: GardenPlan;
  onStartOver: () => void;
}

export default function PlanPage({ plan, onStartOver }: PlanPageProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>("map");
  
  const handlePrint = () => {
    window.print();
  };

  const hasConflicts = plan.conflicts.size > 0;

  const displayDim = (ft: number) => {
    if (plan.setup.unitPreference === "m") return `${(ft * 0.3048).toFixed(1)}m`;
    return `${ft}ft`;
  };

  const gardenSizeStr = `${displayDim(plan.setup.lengthFt)} × ${displayDim(plan.setup.widthFt)}`;

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-cream animate-in fade-in duration-500 overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-cream-dark bg-cream z-10 shrink-0">
        <div>
          <h2 className="text-lg font-black text-forest font-serif leading-tight">GrowIt+</h2>
          <p className="text-xs text-forest/70 font-medium mt-0.5">
            {plan.setup.region} • {gardenSizeStr}
          </p>
        </div>
        <div className="flex gap-2 no-print">
          <button 
            onClick={handlePrint} 
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

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto w-full print:overflow-visible print:block">
        
        {/* Garden Map Tab */}
        <div className={`${activeTab === "map" ? "block" : "hidden"} print:block p-6 space-y-6 pb-8`}>
          {hasConflicts && (
            <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl flex items-start gap-3 no-print">
              <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-terracotta text-sm">Companion Planting Notice</h4>
                <p className="text-xs text-terracotta/80 mt-1">
                  Some selected plants don't grow well together: {Array.from(plan.conflicts).join(", ")}. 
                  They've been placed with warnings (⚠️). Keep them separated.
                </p>
              </div>
            </div>
          )}

          <div className="bg-forest/5 border border-forest/10 p-3 rounded-2xl text-center no-print">
            <p className="text-sm font-medium text-forest/80">
              {plan.selectedPlants.length} plants selected for your {gardenSizeStr} garden
            </p>
          </div>

          <div className="w-full overflow-x-auto pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <GardenGrid grid={plan.grid} lengthFt={plan.setup.lengthFt} widthFt={plan.setup.widthFt} />
          </div>
        </div>

        {/* Schedule Tab */}
        <div className={`${activeTab === "schedule" ? "block" : "hidden"} print:block p-6 pb-8`}>
          <WeeklySchedule weeks={plan.schedule} />
        </div>

        {/* Plants Tab */}
        <div className={`${activeTab === "plants" ? "block" : "hidden"} print:block p-6 pb-8`}>
          <PlantLegend plants={plan.selectedPlants} />
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
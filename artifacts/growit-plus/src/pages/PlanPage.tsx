import { GardenPlan } from "@/data/plan-generator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GardenGrid from "@/components/GardenGrid";
import WeeklySchedule from "@/components/WeeklySchedule";
import PlantLegend from "@/components/PlantLegend";
import { Printer, RotateCcw, AlertTriangle } from "lucide-react";

interface PlanPageProps {
  plan: GardenPlan;
  onStartOver: () => void;
}

export default function PlanPage({ plan, onStartOver }: PlanPageProps) {
  const handlePrint = () => {
    window.print();
  };

  const hasConflicts = plan.conflicts.size > 0;

  return (
    <div className="w-full animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 no-print">
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-primary font-serif">Your Garden Plan</h2>
          <p className="text-muted-foreground mt-1">
            {plan.setup.lengthFt}×{plan.setup.widthFt} ft in {plan.setup.region} • {plan.setup.sunlight}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handlePrint} data-testid="btn-print">
            <Printer className="w-4 h-4 mr-2" />
            Print / PDF
          </Button>
          <Button variant="secondary" onClick={onStartOver} data-testid="btn-start-over">
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </div>

      {hasConflicts && (
        <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl mb-8 flex items-start gap-3 no-print">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-destructive">Companion Planting Notice</h4>
            <p className="text-sm text-destructive/80 mt-1">
              Some selected plants don't grow well together: {Array.from(plan.conflicts).join(", ")}. 
              They've been placed with warnings (⚠️) on the map. Try to keep them separated in your real garden.
            </p>
          </div>
        </div>
      )}

      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2 mb-8 no-print h-12 bg-muted/50 p-1">
          <TabsTrigger value="map" className="text-base data-[state=active]:bg-background">Garden Map</TabsTrigger>
          <TabsTrigger value="schedule" className="text-base data-[state=active]:bg-background">Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="space-y-8 mt-0 print:block">
          <div className="print-break" />
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4 hidden print:block">Garden Layout</h3>
            <div className="overflow-x-auto pb-4">
              <GardenGrid grid={plan.grid} lengthFt={plan.setup.lengthFt} widthFt={plan.setup.widthFt} />
            </div>
          </div>
          
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Plant List</h3>
            <PlantLegend plants={plan.selectedPlants} />
          </div>
        </TabsContent>
        
        <TabsContent value="schedule" className="mt-0 print:block">
          <div className="print-break" />
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold mb-6 hidden print:block">Planting Schedule</h3>
            <WeeklySchedule weeks={plan.schedule} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { GardenSetup, generatePlan, GardenPlan } from "@/data/plan-generator";
import { FROST_DATA } from "@/data/locations";
import { savePlan } from "@/data/storage";
import { ChevronLeft, Info, Calendar as CalendarIcon, MapPin } from "lucide-react";

interface FrostConfirmPageProps {
  setup: GardenSetup;
  onConfirm: (plan: GardenPlan) => void;
  onBack: () => void;
}

export default function FrostConfirmPage({ setup, onConfirm, onBack }: FrostConfirmPageProps) {
  const frostData = FROST_DATA[setup.region];

  const handleGenerate = () => {
    const plan = generatePlan(setup, frostData);
    savePlan(plan);
    onConfirm(plan);
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-in slide-in-from-right-8 duration-300">
      <Button variant="ghost" className="mb-6 -ml-4 text-muted-foreground" onClick={onBack} data-testid="btn-back-frost">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back
      </Button>
      
      <div className="bg-card p-8 rounded-2xl border shadow-sm text-center">
        <div className="inline-flex p-3 bg-secondary/10 rounded-full mb-4">
          <MapPin className="w-10 h-10 text-secondary" />
        </div>
        
        <h2 className="text-3xl font-bold text-primary mb-2">
          Planting in {setup.region}
        </h2>
        
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          We use historical frost dates to schedule when to start your seeds and transplant them outside.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-left">
          <div className="p-5 bg-background border rounded-xl flex items-start gap-4">
            <CalendarIcon className="w-6 h-6 text-primary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Last Spring Frost</p>
              <p className="text-2xl font-bold text-foreground">{frostData.lastSpringFrost}</p>
            </div>
          </div>
          
          <div className="p-5 bg-background border rounded-xl flex items-start gap-4">
            <CalendarIcon className="w-6 h-6 text-secondary mt-1" />
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">First Fall Frost</p>
              <p className="text-2xl font-bold text-foreground">{frostData.firstFallFrost}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3 text-left mb-8">
          <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-900">
            <strong>Zone {frostData.zone}:</strong> Your personalized plan will calculate exactly when to plant each crop based on these dates, ensuring everything matures before the fall frost.
          </p>
        </div>
        
        <Button size="lg" onClick={handleGenerate} className="w-full text-lg h-14" data-testid="btn-generate-plan">
          Generate My Plan
        </Button>
      </div>
    </div>
  );
}

import { GardenSetup, generatePlan, GardenPlan } from "@/data/plan-generator";
import { FROST_DATA } from "@/data/locations";
import { savePlan } from "@/data/storage";
import { ChevronLeft, MapPin } from "lucide-react";

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
    <div className="w-full flex-1 flex flex-col bg-cream overflow-y-auto pb-safe">
      <div className="px-6 py-4 flex items-center border-b border-cream-dark sticky top-0 bg-cream z-10">
        <button className="p-2 -ml-2 text-forest/70 active:bg-cream-dark rounded-full" onClick={onBack} data-testid="btn-back-frost">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-forest/20"></div>
          <div className="w-2 h-2 rounded-full bg-forest"></div>
          <div className="w-2 h-2 rounded-full bg-forest/20"></div>
        </div>
        <div className="w-10"></div>
      </div>
      
      <div className="p-6 flex flex-col items-center text-center animate-in slide-in-from-right-4 duration-300">
        <div className="w-20 h-20 bg-frost/20 rounded-full flex items-center justify-center mb-6 mt-4">
          <MapPin className="w-10 h-10 text-frost-dark" />
        </div>
        
        <h2 className="text-3xl font-bold text-forest mb-2 font-serif">
          {setup.region}
        </h2>
        
        <div className="bg-forest/5 text-forest px-3 py-1 rounded-full text-sm font-semibold mb-8 border border-forest/10">
          Zone {frostData.zone}
        </div>
        
        <div className="w-full flex flex-col gap-4 mb-8">
          <div className="bg-forest/10 border border-forest/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-forest/70 font-bold uppercase tracking-wider mb-1">Last Spring Frost</span>
            <span className="text-2xl font-bold text-forest">{frostData.lastSpringFrost}</span>
          </div>
          
          <div className="bg-terracotta/10 border border-terracotta/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-terracotta-dark/80 font-bold uppercase tracking-wider mb-1">First Fall Frost</span>
            <span className="text-2xl font-bold text-terracotta-dark">{frostData.firstFallFrost}</span>
          </div>
        </div>
        
        <p className="text-forest/70 text-sm mb-10 leading-relaxed max-w-sm">
          We use these historical frost dates to schedule when to start your seeds indoors and when it's safe to transplant them outside.
        </p>
        
        <button 
          onClick={handleGenerate} 
          className="w-full bg-forest text-cream text-lg font-semibold h-14 rounded-full shadow-md transition-transform active:scale-95"
          data-testid="btn-generate-plan"
        >
          Generate My Garden Plan
        </button>
      </div>
    </div>
  );
}
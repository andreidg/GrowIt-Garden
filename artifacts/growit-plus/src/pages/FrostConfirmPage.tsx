import { GROWING_REGIONS } from "@/data/locations";
import { generatePlan } from "@/data/plan-generator";
import { savePlan } from "@/data/storage";
import type { GardenProfile, GeneratedPlan } from "@/types/garden";
import { ChevronLeft, MapPin } from "lucide-react";

interface FrostConfirmPageProps {
  profile: GardenProfile;
  onConfirm: (plan: GeneratedPlan) => void;
  onBack: () => void;
}

export default function FrostConfirmPage({ profile, onConfirm, onBack }: FrostConfirmPageProps) {
  const region = GROWING_REGIONS[profile.region];

  const handleGenerate = () => {
    const plan = generatePlan(profile, region);
    savePlan(plan);
    onConfirm(plan);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-cream overflow-y-auto pb-safe">
      {/* Header / progress */}
      <div className="px-6 py-4 flex items-center border-b border-cream-dark sticky top-0 bg-cream z-10">
        <button
          className="p-2 -ml-2 text-forest/70 active:bg-cream-dark rounded-full"
          onClick={onBack}
          data-testid="btn-back-frost"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-forest/20" />
          <div className="w-2 h-2 rounded-full bg-forest" />
          <div className="w-2 h-2 rounded-full bg-forest/20" />
        </div>
        <div className="w-10" />
      </div>

      <div className="p-6 flex flex-col items-center text-center animate-in slide-in-from-right-4 duration-300">
        <div className="w-20 h-20 bg-frost/20 rounded-full flex items-center justify-center mb-6 mt-4">
          <MapPin className="w-10 h-10 text-frost-dark" />
        </div>

        <h2 className="text-3xl font-bold text-forest mb-2 font-serif">
          {region.label}
        </h2>
        <p className="text-forest/60 text-sm mb-2">{region.province}</p>

        <div className="bg-forest/5 text-forest px-3 py-1 rounded-full text-sm font-semibold mb-8 border border-forest/10">
          Zone {region.zone}
        </div>

        <div className="w-full flex flex-col gap-4 mb-8">
          <div className="bg-forest/10 border border-forest/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-forest/70 font-bold uppercase tracking-wider mb-1">
              Last Spring Frost
            </span>
            <span className="text-2xl font-bold text-forest">{region.lastSpringFrost}</span>
          </div>

          <div className="bg-terracotta/10 border border-terracotta/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-terracotta-dark/80 font-bold uppercase tracking-wider mb-1">
              First Fall Frost
            </span>
            <span className="text-2xl font-bold text-terracotta-dark">{region.firstFallFrost}</span>
          </div>
        </div>

        <p className="text-forest/70 text-sm mb-10 leading-relaxed max-w-sm">
          These historical frost dates set when to start seeds indoors and when it's safe to
          transplant outdoors. Your plan will be anchored to {region.label}'s growing season.
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

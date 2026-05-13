import { GROWING_REGIONS } from "@/data/locations";
import { generatePlan } from "@/data/plan-generator";
import { savePlan } from "@/data/storage";
import type { GardenProfile, GeneratedPlan } from "@/types/garden";
import { ArrowLeft } from "lucide-react";
import { FrostCrystalIcon } from "@/components/illustrations/PlantIcons";

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
    <div className="w-full flex-1 flex flex-col bg-cream overflow-y-auto hide-scrollbar">

      {/* Progress header */}
      <div className="px-6 pt-10 pb-4 flex items-center gap-4 sticky top-0 bg-cream z-10">
        <button
          className="p-2 -ml-2 text-forest hover:bg-cream-dark/50 rounded-full transition-colors"
          onClick={onBack}
          data-testid="btn-back-frost"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center gap-2">
          <div className="h-2 w-2 rounded-full bg-forest/30" />
          <div className="h-2 w-8 rounded-full bg-gold" />
          <div className="h-2 w-2 rounded-full bg-cream-dark" />
        </div>
        <div className="w-10" />
      </div>

      <div className="flex-1 px-6 pb-12 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">

        {/* Icon */}
        <div className="flex justify-center mt-4 mb-8">
          <div className="w-24 h-24 bg-frost/20 rounded-full flex items-center justify-center">
            <FrostCrystalIcon size={52} />
          </div>
        </div>

        {/* Region */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-semibold text-forest mb-1">
            {region.label}
          </h1>
          <p className="text-forest/60 text-sm mb-3">{region.province}</p>
          <span className="inline-block bg-forest text-cream px-4 py-1.5 rounded-full text-sm font-semibold">
            Zone {region.zone}
          </span>
        </div>

        {/* Frost date cards */}
        <div className="flex flex-col gap-3 mb-8">
          <div className="bg-forest/10 border border-forest/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-forest/60 font-bold uppercase tracking-wider mb-1.5">
              Last Spring Frost
            </span>
            <span className="font-serif text-2xl font-semibold text-forest">{region.lastSpringFrost}</span>
          </div>
          <div className="bg-terracotta/10 border border-terracotta/20 p-5 rounded-2xl flex flex-col items-center">
            <span className="text-xs text-terracotta-dark/70 font-bold uppercase tracking-wider mb-1.5">
              First Fall Frost
            </span>
            <span className="font-serif text-2xl font-semibold text-terracotta-dark">{region.firstFallFrost}</span>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-cream-dark/30 rounded-2xl p-4 mb-10">
          <p className="text-sm text-forest/70 leading-relaxed">
            These historical frost dates anchor your entire garden plan — from when to start seeds indoors to the last safe transplant date for {region.label}'s growing season.
          </p>
        </div>

        <button
          onClick={handleGenerate}
          className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95"
          data-testid="btn-generate-plan"
        >
          Generate My Garden Plan
        </button>
      </div>
    </div>
  );
}

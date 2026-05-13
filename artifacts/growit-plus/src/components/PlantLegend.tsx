import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { PlantItem } from "@/types/garden";

interface PlantLegendProps {
  plants: PlantItem[];
}

function formatSunlight(s: string): string {
  if (s === "Partial Shade") return "Part Shade or brighter";
  return s + " or brighter";
}

export default function PlantLegend({ plants }: PlantLegendProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3" data-testid="plant-legend">
      {plants.map(plant => {
        let typeClass = "bg-forest/10 text-forest-dark";
        let typeLabel = "Vegetable";
        if (plant.type === "herb") {
          typeClass = "bg-gold/20 text-gold-dark";
          typeLabel = "Herb";
        } else if (plant.type === "flower") {
          typeClass = "bg-frost/20 text-frost-dark";
          typeLabel = "Flower";
        }

        const benefits = plant.gardenBenefits;
        const benefitTags: string[] = [];
        if (benefits?.pollinatorSupport) benefitTags.push("🐝 Pollinator");
        if (benefits?.pestDeterrence)    benefitTags.push("🛡 Pest deterrent");
        if (benefits?.companionPlanting) benefitTags.push("🤝 Companion");
        if (benefits?.visualAppeal)      benefitTags.push("🌈 Colour");

        const isExpanded = expandedId === plant.id;

        return (
          <div key={plant.id}>
            <button
              onClick={() => setExpandedId(isExpanded ? null : plant.id)}
              className="w-full flex items-start gap-4 p-4 rounded-3xl border border-cream-dark bg-cream-light shadow-sm text-left transition-colors hover:bg-cream-dark/20 active:bg-cream-dark/30"
            >
              <div className="text-3xl w-14 h-14 flex items-center justify-center bg-white rounded-2xl shrink-0 shadow-sm border border-cream-dark/50">
                {plant.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg text-forest font-serif leading-none mb-2">
                  {plant.name}
                </p>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${typeClass}`}>
                    {typeLabel}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-forest/50">
                    {plant.daysToMaturity} days
                  </span>
                </div>
                {benefitTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {benefitTags.map(tag => (
                      <span key={tag} className="text-[10px] bg-frost/15 text-frost-dark px-2 py-0.5 rounded-full border border-frost/30">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-forest/40 shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>

            {isExpanded && (
              <div className="mx-4 px-4 py-3 bg-cream border border-cream-dark border-t-0 rounded-b-2xl flex flex-col gap-2 animate-in fade-in duration-150">
                <div className="flex flex-wrap gap-x-6 gap-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-forest/40">🗓</span>
                    <span className="text-xs text-forest/70">Matures in <strong className="text-forest">{plant.daysToMaturity}</strong> days</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-forest/40">☀️</span>
                    <span className="text-xs text-forest/70">Needs <strong className="text-forest">{formatSunlight(plant.minSunlight)}</strong></span>
                  </div>
                  {plant.riskLevel === "high" && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-terracotta/60">⚠️</span>
                      <span className="text-xs text-terracotta/80">Challenging in Alberta's short season</span>
                    </div>
                  )}
                </div>
                {plant.notes && (
                  <p className="text-xs text-forest/60 leading-relaxed italic border-t border-cream-dark pt-2">
                    {plant.notes}
                  </p>
                )}
                {!plant.notes && benefitTags.length === 0 && (
                  <p className="text-xs text-forest/50 leading-relaxed">
                    A reliable choice for Alberta gardens with the right conditions.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

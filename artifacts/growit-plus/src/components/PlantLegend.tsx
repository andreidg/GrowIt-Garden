import type { PlantItem } from "@/types/garden";

interface PlantLegendProps {
  plants: PlantItem[];
}

export default function PlantLegend({ plants }: PlantLegendProps) {
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

        return (
          <div
            key={plant.id}
            className="flex items-start gap-4 p-4 rounded-3xl border border-cream-dark bg-cream-light shadow-sm"
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
              {plant.notes && (
                <p className="text-[11px] text-forest/55 mt-1.5 leading-snug italic">
                  {plant.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

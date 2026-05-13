import { Plant } from "@/data/plants";

interface PlantLegendProps {
  plants: Plant[];
}

export default function PlantLegend({ plants }: PlantLegendProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" data-testid="plant-legend">
      {plants.map(plant => (
        <div key={plant.name} className="flex items-center gap-3 p-3 rounded-lg border bg-background shadow-sm">
          <div className="text-2xl w-10 h-10 flex items-center justify-center bg-muted rounded-md shrink-0">
            {plant.emoji}
          </div>
          <div>
            <p className="font-bold text-sm text-foreground leading-tight">{plant.name}</p>
            <p className="text-xs text-muted-foreground">
              {plant.abbr} • {plant.type === "vegetable" ? "Veggie" : "Herb"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

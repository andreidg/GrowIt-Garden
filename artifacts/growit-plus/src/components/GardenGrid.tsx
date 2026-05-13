import { GridCell } from "@/data/plan-generator";

interface GardenGridProps {
  grid: GridCell[][];
  lengthFt: number;
  widthFt: number;
}

export default function GardenGrid({ grid, lengthFt, widthFt }: GardenGridProps) {
  return (
    <div 
      className="inline-grid gap-1.5 p-3 bg-cream-dark rounded-3xl min-w-min mx-auto"
      style={{
        gridTemplateColumns: `repeat(${lengthFt}, minmax(3rem, 1fr))`,
        gridTemplateRows: `repeat(${widthFt}, minmax(3rem, 1fr))`
      }}
      data-testid="garden-grid"
    >
      {grid.map((row, r) => 
        row.map((cell, c) => {
          const isVeg = cell.plant?.type === "vegetable";
          const isHerb = cell.plant?.type === "herb";
          const isFlower = cell.plant?.type === "flower";
          
          let bgColorClass = "bg-cream"; // empty
          let borderClass = "border-cream-dark";

          if (isVeg) {
            bgColorClass = "bg-forest/15";
            borderClass = "border-forest/25";
          } else if (isHerb) {
            bgColorClass = "bg-gold/20";
            borderClass = "border-gold/40";
          } else if (isFlower) {
            bgColorClass = "bg-frost/25";
            borderClass = "border-frost/50";
          }
          
          return (
            <div 
              key={`${r}-${c}`}
              className={`relative flex flex-col items-center justify-center border aspect-square rounded-xl p-1 shadow-sm transition-transform hover:scale-105 ${bgColorClass} ${borderClass}`}
              title={cell.plant?.name || "Empty"}
              data-testid={`grid-cell-${r}-${c}`}
            >
              {cell.plant ? (
                <>
                  <span className="text-lg leading-none mb-0.5">{cell.plant.emoji}</span>
                  <span className="text-[9px] font-bold text-forest/80 uppercase tracking-tighter truncate w-full text-center">{cell.plant.abbr}</span>
                  {cell.hasConflict && (
                    <div className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow-md text-[10px] w-4 h-4 flex items-center justify-center border border-terracotta/20" title="Conflict Warning">
                      ⚠️
                    </div>
                  )}
                </>
              ) : (
                <span className="text-forest/20 text-[10px] uppercase font-bold">empty</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
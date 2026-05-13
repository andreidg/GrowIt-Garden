import { GridCell } from "@/data/plan-generator";

interface GardenGridProps {
  grid: GridCell[][];
  lengthFt: number;
  widthFt: number;
}

export default function GardenGrid({ grid, lengthFt, widthFt }: GardenGridProps) {
  return (
    <div 
      className="inline-grid gap-1 p-2 bg-muted rounded-xl"
      style={{
        gridTemplateColumns: `repeat(${lengthFt}, minmax(4rem, 1fr))`,
        gridTemplateRows: `repeat(${widthFt}, minmax(4rem, 1fr))`
      }}
      data-testid="garden-grid"
    >
      {grid.map((row, r) => 
        row.map((cell, c) => {
          const isVeg = cell.plant?.type === "vegetable";
          const isHerb = cell.plant?.type === "herb";
          
          let bgColorClass = "bg-background/80"; // empty
          if (isVeg) bgColorClass = "bg-primary/20 border-primary/30";
          if (isHerb) bgColorClass = "bg-secondary/20 border-secondary/30";
          
          return (
            <div 
              key={`${r}-${c}`}
              className={`relative flex flex-col items-center justify-center border aspect-square rounded-md p-1 ${bgColorClass}`}
              title={cell.plant?.name || "Empty"}
              data-testid={`grid-cell-${r}-${c}`}
            >
              {cell.plant ? (
                <>
                  <span className="text-2xl">{cell.plant.emoji}</span>
                  <span className="text-[10px] font-bold mt-1 text-foreground/80">{cell.plant.abbr}</span>
                  {cell.hasConflict && (
                    <div className="absolute -top-1 -right-1 bg-background rounded-full shadow-sm text-xs" title="Conflict Warning">
                      ⚠️
                    </div>
                  )}
                </>
              ) : (
                <span className="text-muted-foreground/30 text-xs">empty</span>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

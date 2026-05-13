import { WeekEntry } from "@/data/plan-generator";
import { Home, Sprout, Shovel } from "lucide-react";

interface WeeklyScheduleProps {
  weeks: WeekEntry[];
}

export default function WeeklySchedule({ weeks }: WeeklyScheduleProps) {
  // Filter out past weeks if they have no actions to keep it clean, 
  // but always show current and future weeks
  const today = new Date();
  today.setHours(0,0,0,0);
  
  return (
    <div className="space-y-4" data-testid="weekly-schedule">
      {weeks.map((week, i) => {
        const isPast = week.weekStart < today && !week.isCurrent;
        if (isPast && week.actions.length === 0) return null;

        return (
          <div 
            key={i} 
            className={`p-5 rounded-xl border flex flex-col md:flex-row gap-4 transition-all
              ${week.isCurrent ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-sm' : 'bg-background'}
              ${isPast ? 'opacity-60 grayscale-[50%]' : ''}
            `}
            data-testid={`week-entry-${i}`}
          >
            <div className="md:w-1/4 shrink-0">
              <h4 className={`font-bold ${week.isCurrent ? 'text-primary' : 'text-foreground'}`}>
                {week.weekLabel}
              </h4>
              {week.isCurrent && (
                <span className="text-xs font-semibold bg-primary text-primary-foreground px-2 py-0.5 rounded-full mt-1 inline-block">
                  Current Week
                </span>
              )}
            </div>
            
            <div className="md:w-3/4">
              {week.actions.length > 0 ? (
                <ul className="space-y-3">
                  {week.actions.map((action, j) => {
                    let Icon = Shovel;
                    let iconColor = "text-accent";
                    if (action.actionType === "start_indoors") {
                      Icon = Home;
                      iconColor = "text-secondary";
                    } else if (action.actionType === "direct_sow") {
                      Icon = Sprout;
                      iconColor = "text-primary";
                    }
                    
                    return (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`mt-0.5 bg-muted p-1.5 rounded-md ${iconColor}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {action.plant.emoji} {action.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground italic mt-1">
                  {week.explanation}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

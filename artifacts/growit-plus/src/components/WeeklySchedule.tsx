import type { WeeklyScheduleItem } from "@/types/garden";
import { Home, Sprout, Leaf } from "lucide-react";

interface WeeklyScheduleProps {
  weeks: WeeklyScheduleItem[];
}

export default function WeeklySchedule({ weeks }: WeeklyScheduleProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-4" data-testid="weekly-schedule">
      {weeks.map((week, i) => {
        const weekStart = new Date(week.weekStartDate);
        const isPast    = weekStart < today && !week.isCurrent;

        // Skip past quiet weeks to keep the schedule clean
        if (isPast && !week.hasActions) return null;

        // Quiet future weeks — compact row
        if (!week.isCurrent && !isPast && !week.hasActions) {
          return (
            <div
              key={i}
              className="flex justify-between items-center py-2 px-1 border-b border-cream-dark/50"
              data-testid={`week-entry-${i}`}
            >
              <span className="text-sm font-bold text-forest/60">{week.weekLabel}</span>
              <span className="text-sm font-medium text-forest/40">Water and watch 💧</span>
            </div>
          );
        }

        return (
          <div
            key={i}
            className={`p-5 rounded-3xl border flex flex-col gap-4 transition-all
              ${week.isCurrent ? "bg-forest text-cream border-forest shadow-md" : "bg-cream-light border-cream-dark"}
              ${isPast ? "opacity-70" : ""}
            `}
            data-testid={`week-entry-${i}`}
          >
            <div className="flex justify-between items-center">
              <h4 className={`font-bold ${week.isCurrent ? "text-cream" : "text-forest"}`}>
                {week.weekLabel}
              </h4>
              {week.isCurrent && (
                <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-forest px-2.5 py-1 rounded-full">
                  This Week
                </span>
              )}
            </div>

            <div className="w-full">
              {week.hasActions ? (
                <ul className="space-y-3">
                  {week.actions.map((action, j) => {
                    let Icon = Leaf;
                    let iconColorClass = week.isCurrent
                      ? "text-cream bg-white/20"
                      : "text-gold bg-gold/20";

                    if (action.actionType === "start_indoors") {
                      Icon = Home;
                      iconColorClass = week.isCurrent
                        ? "text-cream bg-white/20"
                        : "text-terracotta bg-terracotta/20";
                    } else if (action.actionType === "direct_sow") {
                      Icon = Sprout;
                      iconColorClass = week.isCurrent
                        ? "text-cream bg-white/20"
                        : "text-forest bg-forest/20";
                    }

                    return (
                      <li key={j} className="flex items-start gap-3">
                        <div className={`p-2 rounded-xl shrink-0 ${iconColorClass}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="mt-1">
                          <p className={`text-sm font-medium leading-snug ${week.isCurrent ? "text-cream/90" : "text-forest"}`}>
                            <span className="mr-1">{action.plant.emoji}</span>
                            {action.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`text-sm italic mt-1 ${week.isCurrent ? "text-cream/70" : "text-forest/60"}`}>
                  {week.notes}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

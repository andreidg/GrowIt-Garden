import { useState } from "react";
import type { WeeklyScheduleItem, PlantAction, ActionType } from "@/types/garden";
import {
  Home, ShoppingCart, Sprout, Leaf, Wrench, Sparkles, Scissors, Droplets, ChevronDown,
} from "lucide-react";

interface WeeklyScheduleProps {
  weeks: WeeklyScheduleItem[];
}

// ─── Action type config ────────────────────────────────────────────────────

type ActionCfg = {
  label: string;
  icon:  React.ElementType;
  cell:  string;
  badge: string;
};

const ACTION_CFG: Record<ActionType, ActionCfg> = {
  start_indoors: {
    label: "Start Indoors",
    icon:  Home,
    cell:  "bg-terracotta/15 border-terracotta/30 text-terracotta",
    badge: "bg-terracotta/15 text-terracotta",
  },
  buy_transplant: {
    label: "Buy Transplant",
    icon:  ShoppingCart,
    cell:  "bg-frost/20 border-frost/40 text-[#3A6B80]",
    badge: "bg-frost/20 text-[#3A6B80]",
  },
  direct_sow: {
    label: "Direct Sow",
    icon:  Sprout,
    cell:  "bg-forest/12 border-forest/25 text-forest",
    badge: "bg-forest/12 text-forest",
  },
  transplant: {
    label: "Transplant Outdoors",
    icon:  Leaf,
    cell:  "bg-[#E0F0E8] border-[#80C0A0] text-[#1A5035]",
    badge: "bg-[#E0F0E8] text-[#1A5035]",
  },
  plant_outdoors: {
    label: "Plant Outdoors",
    icon:  Leaf,
    cell:  "bg-[#DCE9E0] border-[#88B098] text-[#2C5848]",
    badge: "bg-[#DCE9E0] text-[#2C5848]",
  },
  winter_protect: {
    label: "Winter Protection",
    icon:  Droplets,
    cell:  "bg-frost/15 border-frost/35 text-[#3A6B80]",
    badge: "bg-frost/15 text-[#3A6B80]",
  },
  maintenance: {
    label: "Garden Care",
    icon:  Wrench,
    cell:  "bg-cream-dark/60 border-cream-dark text-forest/70",
    badge: "bg-cream-dark text-forest/70",
  },
  bloom_watch: {
    label: "Bloom Watch",
    icon:  Sparkles,
    cell:  "bg-[#F5E8F2] border-[#C8A0C8] text-[#8B3A7E]",
    badge: "bg-[#F5E8F2] text-[#8B3A7E]",
  },
  harvest_soon: {
    label: "Harvest Soon",
    icon:  Scissors,
    cell:  "bg-gold/20 border-gold/40 text-forest",
    badge: "bg-gold/20 text-forest",
  },
};

// ─── Action type icon strip (shown in collapsed row) ──────────────────────

function ActionTypeIcons({ actions }: { actions: PlantAction[] }) {
  const types = [...new Set(actions.map(a => a.actionType))];
  return (
    <div className="flex items-center gap-1">
      {types.slice(0, 4).map(type => {
        const Icon = ACTION_CFG[type].icon;
        return (
          <div key={type} className={`w-5 h-5 rounded-md flex items-center justify-center ${ACTION_CFG[type].badge}`}>
            <Icon className="w-3 h-3" />
          </div>
        );
      })}
      {types.length > 4 && (
        <span className="text-[10px] text-forest/40 font-medium">+{types.length - 4}</span>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function WeeklySchedule({ weeks }: WeeklyScheduleProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentIdx = weeks.findIndex(w => w.isCurrent);

  // By default only the current week (or first action week) is expanded
  const defaultOpen = new Set<number>(
    currentIdx >= 0 ? [currentIdx] : weeks.findIndex(w => w.hasActions) >= 0
      ? [weeks.findIndex(w => w.hasActions)]
      : []
  );
  const [openWeeks, setOpenWeeks] = useState<Set<number>>(defaultOpen);

  const toggle = (i: number) =>
    setOpenWeeks(prev => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  return (
    <div className="relative" data-testid="weekly-schedule">
      {/* Timeline vertical line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-cream-dark print:hidden" aria-hidden />

      <ol className="space-y-1 print:space-y-4">
        {weeks.map((week, i) => {
          const weekStart = new Date(week.weekStartDate);
          const isPast    = weekStart < today && !week.isCurrent;
          const isOpen    = openWeeks.has(i);

          if (isPast && !week.hasActions) return null;

          return (
            <li key={i} className="relative pl-10 print:pl-0" data-testid={`week-entry-${i}`}>
              {/* Timeline dot */}
              <div
                className={[
                  "absolute left-[11px] top-4 w-[15px] h-[15px] rounded-full border-2 z-10 print:hidden",
                  week.isCurrent
                    ? "bg-forest border-forest shadow-md ring-4 ring-forest/20"
                    : week.hasActions
                      ? "bg-cream-light border-forest/50"
                      : "bg-cream-dark border-cream-dark",
                ].join(" ")}
                aria-hidden
              />

              {/* ── Quiet week ── */}
              {!week.isCurrent && !week.hasActions && (
                <div className="flex items-center gap-3 py-2.5 border-b border-cream-dark/40">
                  <Droplets className="w-3.5 h-3.5 text-forest/25 shrink-0" />
                  <span className="text-xs font-semibold text-forest/40 w-[90px] shrink-0">
                    {week.weekLabel}
                  </span>
                  <span className="text-xs text-forest/35 italic">No actions this week — just water and watch!</span>
                </div>
              )}

              {/* ── Action week — collapsible ── */}
              {(week.isCurrent || week.hasActions) && (
                <div
                  className={[
                    "rounded-2xl border overflow-hidden mb-2 print:border-gray-300",
                    week.isCurrent
                      ? "bg-forest border-forest shadow-lg"
                      : isPast
                        ? "bg-cream-light border-cream-dark opacity-75"
                        : "bg-cream-light border-cream-dark shadow-sm",
                  ].join(" ")}
                >
                  {/* Clickable header row */}
                  <button
                    onClick={() => toggle(i)}
                    className={[
                      "w-full flex items-center justify-between px-4 py-3 border-b text-left",
                      week.isCurrent
                        ? "border-white/15 bg-forest"
                        : "border-cream-dark bg-cream-dark/30",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={`text-sm font-bold shrink-0 ${week.isCurrent ? "text-cream" : "text-forest"}`}>
                        {week.weekLabel}
                      </span>
                      {isPast && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-forest/40">
                          Past
                        </span>
                      )}
                      {week.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-forest px-2.5 py-0.5 rounded-full shrink-0">
                          This Week
                        </span>
                      )}
                      {/* Task count badge */}
                      {week.hasActions && !isOpen && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                          week.isCurrent ? "bg-white/15 text-cream/80" : "bg-cream-dark text-forest/60"
                        }`}>
                          {week.actions.length} task{week.actions.length !== 1 ? "s" : ""}
                        </span>
                      )}
                      {/* Collapsed: show action type icon strip */}
                      {!isOpen && week.hasActions && (
                        <div className="ml-1">
                          <ActionTypeIcons actions={week.actions} />
                        </div>
                      )}
                    </div>

                    {/* Chevron */}
                    <ChevronDown
                      className={[
                        "w-4 h-4 shrink-0 ml-2 transition-transform duration-200",
                        isOpen ? "rotate-180" : "",
                        week.isCurrent ? "text-cream/60" : "text-forest/40",
                      ].join(" ")}
                    />
                  </button>

                  {/* Expandable action list */}
                  {isOpen && (
                    <div className={`p-4 ${week.hasActions ? "space-y-3" : ""}`}>
                      {week.hasActions ? (
                        week.actions.map((action, j) => (
                          <ActionRow key={j} action={action} isCurrent={week.isCurrent} />
                        ))
                      ) : (
                        <div className="flex items-center gap-2 py-1">
                          <Droplets className="w-4 h-4 text-cream/50 shrink-0" />
                          <p className="text-sm italic text-cream/70">No actions this week — just water and watch!</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* End-of-season marker */}
      {weeks.length > 0 && (
        <div className="pl-10 flex items-center gap-3 mt-2 print:pl-0">
          <div className="w-[15px] h-[15px] rounded-full bg-terracotta/30 border-2 border-terracotta/50 absolute left-[11px] print:hidden" aria-hidden />
          <p className="text-xs font-semibold text-forest/50 italic">
            🍂 First fall frost — {weeks[weeks.length - 1]?.weekLabel.split("–")[0]} · end of outdoor season
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Single action row ─────────────────────────────────────────────────────

function ActionRow({ action, isCurrent }: { action: PlantAction; isCurrent: boolean }) {
  const cfg  = ACTION_CFG[action.actionType];
  const Icon = cfg.icon;

  return (
    <div className={["rounded-xl border overflow-hidden", isCurrent ? "border-white/15 bg-white/8" : cfg.cell].join(" ")}>
      <div className="flex items-center gap-2.5 px-3 pt-3 pb-2">
        <div className={["w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isCurrent ? "bg-white/15" : cfg.cell].join(" ")}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {action.plant && <span className="text-base leading-none">{action.plant.emoji}</span>}
            <span className={`font-semibold text-sm leading-tight ${isCurrent ? "text-cream" : "text-forest"}`}>
              {action.description}
            </span>
          </div>
          <span className={["inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1", isCurrent ? "bg-white/15 text-cream/70" : cfg.badge].join(" ")}>
            {cfg.label}
          </span>
        </div>
      </div>
      {action.timingNote && (
        <p className={`px-3 pb-2 text-xs leading-relaxed ${isCurrent ? "text-cream/65" : "text-forest/60"}`}>
          {action.timingNote}
        </p>
      )}
      {action.depthNote && (
        <div className={["mx-3 mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-start gap-1.5", isCurrent ? "bg-white/10 text-cream/60" : "bg-cream-dark/40 text-forest/65"].join(" ")}>
          <span className="text-[10px] mt-0.5 shrink-0">📏</span>
          <span className="leading-relaxed">{action.depthNote}</span>
        </div>
      )}
    </div>
  );
}

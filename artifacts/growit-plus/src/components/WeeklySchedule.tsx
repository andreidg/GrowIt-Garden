import type { WeeklyScheduleItem, PlantAction, ActionType } from "@/types/garden";
import {
  Home, ShoppingCart, Sprout, Leaf, Wrench, Sparkles, Scissors, Droplets,
} from "lucide-react";

interface WeeklyScheduleProps {
  weeks: WeeklyScheduleItem[];
}

// ─── Action type config ────────────────────────────────────────────────────
type ActionCfg = {
  label: string;
  icon: React.ElementType;
  cell: string;   // cell bg+border+text (active week variant handled separately)
  badge: string;  // pill badge
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

// ─── Component ─────────────────────────────────────────────────────────────
export default function WeeklySchedule({ weeks }: WeeklyScheduleProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find index of current / first future week so we can render a "you are here" marker
  const currentIdx = weeks.findIndex(w => w.isCurrent);

  return (
    <div className="relative" data-testid="weekly-schedule">
      {/* Timeline vertical line */}
      <div className="absolute left-[18px] top-0 bottom-0 w-px bg-cream-dark print:hidden" aria-hidden />

      <ol className="space-y-1 print:space-y-4">
        {weeks.map((week, i) => {
          const weekStart = new Date(week.weekStartDate);
          const isPast    = weekStart < today && !week.isCurrent;

          // Skip past quiet weeks — no value showing them
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

              {/* ── Quiet week — compact row ── */}
              {!week.isCurrent && !week.hasActions && (
                <div className="flex items-center gap-3 py-3 border-b border-cream-dark/40 print:border print:rounded-xl print:px-4">
                  <Droplets className="w-3.5 h-3.5 text-forest/25 shrink-0" />
                  <span className="text-xs font-semibold text-forest/40 w-[90px] shrink-0">
                    {week.weekLabel}
                  </span>
                  <span className="text-xs text-forest/35 italic">
                    No actions — water and watch! 💧
                  </span>
                </div>
              )}

              {/* ── Active week card ── */}
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
                  {/* Card header */}
                  <div
                    className={[
                      "flex items-center justify-between px-4 py-3 border-b",
                      week.isCurrent
                        ? "border-white/15 bg-forest"
                        : "border-cream-dark bg-cream-dark/30",
                    ].join(" ")}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-bold ${week.isCurrent ? "text-cream" : "text-forest"}`}
                      >
                        {week.weekLabel}
                      </span>
                      {isPast && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-forest/40">
                          Past
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {week.isCurrent && (
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-gold text-forest px-2.5 py-0.5 rounded-full">
                          This Week
                        </span>
                      )}
                      {week.hasActions && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            week.isCurrent ? "bg-white/15 text-cream/80" : "bg-cream-dark text-forest/60"
                          }`}
                        >
                          {week.actions.length} task{week.actions.length !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action list */}
                  <div className={`p-4 ${week.hasActions ? "space-y-3" : ""}`}>
                    {week.hasActions ? (
                      week.actions.map((action, j) => (
                        <ActionRow
                          key={j}
                          action={action}
                          isCurrent={week.isCurrent}
                        />
                      ))
                    ) : (
                      <div className="flex items-center gap-2 py-1">
                        <Droplets className="w-4 h-4 text-cream/50 shrink-0" />
                        <p className="text-sm italic text-cream/70">
                          No actions — water and watch! 💧
                        </p>
                      </div>
                    )}
                  </div>
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

      {/* Unused var suppression */}
      {currentIdx === -1 && null}
    </div>
  );
}

// ─── Single action row ─────────────────────────────────────────────────────
function ActionRow({
  action,
  isCurrent,
}: {
  action: PlantAction;
  isCurrent: boolean;
}) {
  const cfg  = ACTION_CFG[action.actionType];
  const Icon = cfg.icon;

  return (
    <div
      className={[
        "rounded-xl border overflow-hidden",
        isCurrent ? "border-white/15 bg-white/8" : cfg.cell,
      ].join(" ")}
    >
      {/* Action header */}
      <div className={`flex items-center gap-2.5 px-3 pt-3 pb-2`}>
        {/* Icon */}
        <div
          className={[
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
            isCurrent ? "bg-white/15" : cfg.cell,
          ].join(" ")}
        >
          <Icon className="w-4 h-4" />
        </div>

        {/* Plant + action label */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {action.plant && (
              <span className="text-base leading-none">{action.plant.emoji}</span>
            )}
            <span
              className={`font-semibold text-sm leading-tight ${
                isCurrent ? "text-cream" : "text-forest"
              }`}
            >
              {action.description}
            </span>
          </div>
          {/* Action type badge */}
          <span
            className={[
              "inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1",
              isCurrent ? "bg-white/15 text-cream/70" : cfg.badge,
            ].join(" ")}
          >
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Timing note */}
      {action.timingNote && (
        <p
          className={`px-3 pb-2 text-xs leading-relaxed ${
            isCurrent ? "text-cream/65" : "text-forest/60"
          }`}
        >
          {action.timingNote}
        </p>
      )}

      {/* Depth / spacing note */}
      {action.depthNote && (
        <div
          className={[
            "mx-3 mb-3 px-3 py-2 rounded-lg text-xs font-medium flex items-start gap-1.5",
            isCurrent ? "bg-white/10 text-cream/60" : "bg-cream-dark/40 text-forest/65",
          ].join(" ")}
        >
          <span className="text-[10px] mt-0.5 shrink-0">📏</span>
          <span className="leading-relaxed">{action.depthNote}</span>
        </div>
      )}
    </div>
  );
}

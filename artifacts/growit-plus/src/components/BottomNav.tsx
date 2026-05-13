import { Map, Calendar, Leaf } from "lucide-react";

export type PlanTab = "map" | "schedule" | "plants";

interface BottomNavProps {
  activeTab: PlanTab;
  onTabChange: (tab: PlanTab) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: "map" as PlanTab, label: "Garden Map", icon: Map },
    { id: "schedule" as PlanTab, label: "Schedule", icon: Calendar },
    { id: "plants" as PlanTab, label: "Plants", icon: Leaf },
  ];

  return (
    <nav className="bg-cream border-t border-cream-dark px-6 py-3 pb-safe flex justify-around items-center no-print mt-auto shrink-0 z-50">
      {tabs.map(({ id, label, icon: Icon }) => {
        const isActive = activeTab === id;
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            data-testid={`tab-${id}`}
            className="flex flex-col items-center gap-1 min-w-[64px]"
          >
            <div className={`p-2 rounded-full transition-colors ${isActive ? "bg-forest text-cream" : "text-forest/50"}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium ${isActive ? "text-forest" : "text-forest/50"}`}>
              {label}
            </span>
            {isActive && <div className="w-1 h-1 bg-gold rounded-full" />}
          </button>
        );
      })}
    </nav>
  );
}
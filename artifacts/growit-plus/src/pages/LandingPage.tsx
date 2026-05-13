import { BasilIcon, FrostCrystalIcon } from "@/components/illustrations/PlantIcons";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-cream overflow-y-auto hide-scrollbar animate-in fade-in duration-500">
      {/* Top bar */}
      <div className="px-6 pt-12 pb-4 flex items-center justify-between">
        <span className="font-serif text-lg font-semibold text-forest">GrowIt+</span>
        <div className="flex items-center gap-1.5 bg-forest/10 px-3 py-1.5 rounded-full">
          <FrostCrystalIcon size={14} />
          <span className="text-xs font-medium text-forest">Alberta · Zone 3–4</span>
        </div>
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-4">
        <h1 className="font-serif text-5xl font-semibold text-forest leading-tight mb-4">
          This season,<br />grow something<br />great.
        </h1>
        <p className="font-sans text-forest/70 text-lg mb-10 leading-relaxed">
          Location-aware garden plans built for Alberta's short growing season.
        </p>

        {/* Illustration */}
        <div className="flex justify-center mb-10">
          <div className="relative w-52 h-52 flex items-center justify-center">
            <div className="absolute inset-0 bg-cream-dark rounded-full opacity-60" />
            <div className="absolute inset-6 bg-cream-dark/40 rounded-full" />
            <BasilIcon size={96} className="relative z-10" />
          </div>
        </div>

        {/* Feature strip */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2 -mx-6 px-6 mb-10">
          {[
            { icon: "❄️", label: "Frost-Aware" },
            { icon: "🌿", label: "Companion Planting" },
            { icon: "☀️", label: "Sunlight Matched" },
            { icon: "📍", label: "Region-Specific" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="flex-shrink-0 flex items-center gap-2 bg-cream-light border border-cream-dark px-4 py-2.5 rounded-full text-sm font-medium text-forest"
            >
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 pb-12 flex flex-col items-center">
        <button
          onClick={onStart}
          className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
          data-testid="btn-plan-garden"
        >
          Plan My Garden
          <span className="text-cream/80">→</span>
        </button>
        <p className="text-forest/50 text-xs mt-4 font-medium">
          No account required · Free forever
        </p>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex-1 flex flex-col h-full bg-cream overflow-y-auto px-6 py-12 animate-in fade-in zoom-in duration-500 pb-safe">
      <div className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-5xl font-bold text-forest tracking-tight mb-2 font-serif text-center">
          GrowIt+
        </h1>
        
        <p className="text-lg text-forest/80 font-medium mb-10 text-center">
          Your local garden, planned by AI
        </p>

        <div className="w-48 h-48 bg-cream-dark rounded-full flex items-center justify-center mb-10 shadow-inner">
          <span className="text-[120px] leading-none">🌱</span>
        </div>
        
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <span className="bg-cream-light border border-cream-dark px-3 py-1.5 rounded-full text-sm font-medium text-forest/90">
            📅 Local Frost Dates
          </span>
          <span className="bg-cream-light border border-cream-dark px-3 py-1.5 rounded-full text-sm font-medium text-forest/90">
            ☀️ Custom Fit
          </span>
          <span className="bg-cream-light border border-cream-dark px-3 py-1.5 rounded-full text-sm font-medium text-forest/90">
            🌿 Smart Planting
          </span>
        </div>
      </div>
      
      <div className="mt-auto pt-6 flex flex-col items-center">
        <button 
          onClick={onStart} 
          className="w-full bg-forest text-cream text-lg font-semibold h-14 rounded-full shadow-lg transition-transform active:scale-95"
          data-testid="btn-plan-garden"
        >
          Plan My Garden
        </button>
        <p className="text-forest/60 text-xs mt-4 font-medium">No account required</p>
        <p className="text-forest/40 text-xs mt-6">
          <a href="#" className="underline underline-offset-2 hover:text-forest/60 transition-colors">Privacy</a>
          {" · "}No data stored · Built for Alberta gardeners
        </p>
      </div>
    </div>
  );
}
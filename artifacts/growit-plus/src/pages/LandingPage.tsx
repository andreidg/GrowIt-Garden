import { Button } from "@/components/ui/button";
import { Leaf, Sun, Calendar } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-3xl mx-auto animate-in fade-in zoom-in duration-500">
      <div className="mb-8 p-4 bg-primary/10 rounded-full">
        <Leaf className="w-16 h-16 text-primary" />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-black text-primary tracking-tight mb-4 font-serif">
        GrowIt+
      </h1>
      
      <p className="text-xl md:text-2xl text-foreground font-medium mb-8">
        Your local garden, planned by AI
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-left">
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <Calendar className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-bold text-lg mb-2">Alberta Frost Dates</h3>
          <p className="text-muted-foreground text-sm">We use precise frost dates for Calgary, Edmonton, and other regions to schedule your planting.</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <Sun className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-bold text-lg mb-2">Custom Fit</h3>
          <p className="text-muted-foreground text-sm">Tailored to your space, sun exposure, and soil type for the best possible yield.</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border shadow-sm">
          <Leaf className="w-8 h-8 text-secondary mb-4" />
          <h3 className="font-bold text-lg mb-2">Companion Planting</h3>
          <p className="text-muted-foreground text-sm">Smart grid placement avoids planting incompatible crops next to each other.</p>
        </div>
      </div>
      
      <Button 
        size="lg" 
        onClick={onStart} 
        className="text-lg px-8 h-14 rounded-full shadow-md"
        data-testid="btn-plan-garden"
      >
        Plan My Garden
      </Button>
    </div>
  );
}

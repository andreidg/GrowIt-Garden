import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadPlan, clearPlan } from "@/data/storage";
import LandingPage from "@/pages/LandingPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import FrostConfirmPage from "@/pages/FrostConfirmPage";
import PlanPage from "@/pages/PlanPage";
import MobileShell from "@/components/MobileShell";
import type { GardenProfile, GeneratedPlan } from "@/types/garden";

type Step = "landing" | "questionnaire" | "frost-confirm" | "plan";

export default function App() {
  const [step, setStep]           = useState<Step>("landing");
  const [profile, setProfile]     = useState<GardenProfile | null>(null);
  const [plan, setPlan]           = useState<GeneratedPlan | null>(null);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  useEffect(() => {
    if (loadPlan()) setHasSavedPlan(true);
  }, []);

  const handleRestorePlan = () => {
    const saved = loadPlan();
    if (saved) { setPlan(saved); setStep("plan"); }
    setHasSavedPlan(false);
  };

  const handleDiscardPlan = () => {
    clearPlan();
    setHasSavedPlan(false);
  };

  const startOver = () => {
    clearPlan();
    setProfile(null);
    setPlan(null);
    setStep("landing");
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col items-center bg-cream text-forest font-sans overflow-hidden">

        {/* Saved-plan restore banner */}
        {hasSavedPlan && step === "landing" && (
          <div className="w-full bg-forest text-cream p-4 flex flex-col sm:flex-row justify-between items-center z-50 shrink-0 gap-3">
            <p className="text-sm font-medium text-center sm:text-left">
              You have a saved garden plan. Restore it?
            </p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRestorePlan}
                className="bg-gold text-forest hover:bg-gold/90 rounded-full"
                data-testid="btn-restore-plan"
              >
                Restore
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDiscardPlan}
                className="bg-transparent border-cream text-cream hover:bg-cream hover:text-forest rounded-full"
                data-testid="btn-discard-plan"
              >
                Discard
              </Button>
            </div>
          </div>
        )}

        <main className="w-full flex-grow flex flex-col relative overflow-hidden">
          {step === "landing" && (
            <LandingPage onStart={() => setStep("questionnaire")} />
          )}

          {step === "questionnaire" && (
            <QuestionnairePage
              onNext={p => { setProfile(p); setStep("frost-confirm"); }}
              onBack={() => setStep("landing")}
            />
          )}

          {step === "frost-confirm" && profile && (
            <FrostConfirmPage
              profile={profile}
              onConfirm={generatedPlan => { setPlan(generatedPlan); setStep("plan"); }}
              onBack={() => setStep("questionnaire")}
            />
          )}

          {step === "plan" && plan && (
            <PlanPage plan={plan} onStartOver={startOver} />
          )}
        </main>
      </div>
    </MobileShell>
  );
}

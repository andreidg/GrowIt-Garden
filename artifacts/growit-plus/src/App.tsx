import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { loadPlan, clearPlan } from "@/data/storage";
import LandingPage from "@/pages/LandingPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import FrostConfirmPage from "@/pages/FrostConfirmPage";
import PlanPage from "@/pages/PlanPage";
import { GardenSetup, GardenPlan } from "@/data/plan-generator";

type Step = "landing" | "questionnaire" | "frost-confirm" | "plan";

export default function App() {
  const [step, setStep] = useState<Step>("landing");
  const [setup, setSetup] = useState<GardenSetup | null>(null);
  const [plan, setPlan] = useState<GardenPlan | null>(null);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  useEffect(() => {
    const savedPlan = loadPlan();
    if (savedPlan) {
      setHasSavedPlan(true);
    }
  }, []);

  const handleRestorePlan = () => {
    const savedPlan = loadPlan();
    if (savedPlan) {
      setPlan(savedPlan);
      setStep("plan");
    }
    setHasSavedPlan(false);
  };

  const handleDiscardPlan = () => {
    clearPlan();
    setHasSavedPlan(false);
  };

  const startOver = () => {
    clearPlan();
    setSetup(null);
    setPlan(null);
    setStep("landing");
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center bg-background text-foreground font-sans">
      {hasSavedPlan && step === "landing" && (
        <div className="w-full bg-primary text-primary-foreground p-4 flex justify-between items-center z-50">
          <p className="text-sm font-medium">You have a saved garden plan. Restore it?</p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={handleRestorePlan} data-testid="btn-restore-plan">
              Restore
            </Button>
            <Button variant="outline" size="sm" onClick={handleDiscardPlan} className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" data-testid="btn-discard-plan">
              Discard
            </Button>
          </div>
        </div>
      )}

      <main className="w-full flex-grow flex flex-col relative max-w-5xl mx-auto px-4 py-8">
        {step === "landing" && <LandingPage onStart={() => setStep("questionnaire")} />}
        {step === "questionnaire" && (
          <QuestionnairePage
            onNext={(data) => {
              setSetup(data);
              setStep("frost-confirm");
            }}
            onBack={() => setStep("landing")}
          />
        )}
        {step === "frost-confirm" && setup && (
          <FrostConfirmPage
            setup={setup}
            onConfirm={(generatedPlan) => {
              setPlan(generatedPlan);
              setStep("plan");
            }}
            onBack={() => setStep("questionnaire")}
          />
        )}
        {step === "plan" && plan && (
          <PlanPage plan={plan} onStartOver={startOver} />
        )}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Step1Location } from './Step1Location';
import { Step2Garden } from './Step2Garden';
import { Step3Alerts } from './Step3Alerts';
interface OnboardingFlowProps {
  onComplete: () => void;
}
export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete
}) => {
  const [step, setStep] = useState(1);
  return (
    <div className="h-full flex flex-col bg-cream relative">
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onComplete}
          className="text-sm font-medium text-forest/60 hover:text-forest">
          
          Skip to app
        </button>
      </div>

      <div className="pt-12 pb-4 flex justify-center gap-2">
        {[1, 2, 3].map((i) =>
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-gold' : i < step ? 'w-2 bg-forest/30' : 'w-2 bg-cream-dark'}`} />

        )}
      </div>

      <div className="flex-1 overflow-hidden">
        {step === 1 && <Step1Location onNext={() => setStep(2)} />}
        {step === 2 && <Step2Garden onNext={() => setStep(3)} />}
        {step === 3 && <Step3Alerts onComplete={onComplete} />}
      </div>
    </div>);

};
import { Button } from "@/components/ui/button";

interface PlanConflictModalProps {
  onKeepAccount: () => void;
  onUseLocal:    () => void;
}

/**
 * Shown when an authenticated user logs in and BOTH a local guest plan and a
 * saved account plan exist. The user picks which one to keep so we never
 * silently overwrite either.
 */
export default function PlanConflictModal({ onKeepAccount, onUseLocal }: PlanConflictModalProps) {
  return (
    <div className="fixed inset-0 z-[60] bg-forest/40 flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-cream-light rounded-3xl border border-cream-dark shadow-xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4 duration-200">
        <h2 className="font-serif text-xl font-semibold text-forest mb-2">
          Two garden plans found
        </h2>
        <p className="text-sm text-forest/75 leading-relaxed mb-5">
          You have a saved garden plan on your account and a different one on this device.
          Which would you like to keep? The other will be discarded.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={onKeepAccount}
            className="bg-forest text-cream hover:bg-forest/90 rounded-full h-11 font-semibold"
            data-testid="btn-keep-account-plan"
          >
            Keep my saved account plan
          </Button>
          <Button
            onClick={onUseLocal}
            variant="outline"
            className="border-forest/20 text-forest hover:bg-cream-dark rounded-full h-11 font-semibold"
            data-testid="btn-use-local-plan"
          >
            Replace it with this device's plan
          </Button>
        </div>
      </div>
    </div>
  );
}

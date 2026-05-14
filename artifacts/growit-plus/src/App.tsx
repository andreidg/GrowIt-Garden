import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { loadPlan, clearPlan, savePlan as saveLocalPlan } from "@/data/storage";
import { useAuth } from "@/hooks/useAuth";
import { usePlanSync } from "@/hooks/usePlanSync";
import LandingPage from "@/pages/LandingPage";
import QuestionnairePage from "@/pages/QuestionnairePage";
import FrostConfirmPage from "@/pages/FrostConfirmPage";
import PlanPage from "@/pages/PlanPage";
import MobileShell from "@/components/MobileShell";
import PlanConflictModal from "@/components/PlanConflictModal";
import type { GardenProfile, GeneratedPlan } from "@/types/garden";

type Step = "landing" | "questionnaire" | "frost-confirm" | "plan";

export default function App() {
  const [step, setStep]                 = useState<Step>("landing");
  const [qInitialStep, setQInitialStep] = useState(1);
  const [profile, setProfile]           = useState<GardenProfile | null>(null);
  const [plan, setPlan]                 = useState<GeneratedPlan | null>(null);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  const { isAuthenticated, isLoading: authLoading, user, logout } = useAuth();
  const { fetchPlan, savePlan: pushPlan, status: syncStatus, lastError: syncError } = usePlanSync();

  // Auth-driven sync state
  const [authBootstrapped, setAuthBootstrapped] = useState(false);
  const [conflict, setConflict]                 = useState<{ local: GeneratedPlan; account: GeneratedPlan } | null>(null);
  const [bootstrapping, setBootstrapping]       = useState(false);
  const [errorBanner, setErrorBanner]           = useState<string | null>(null);
  // Cached copy of the account's saved plan once we've fetched it. Used to
  // surface an explicit "Welcome back, open your saved garden" CTA on the
  // landing page so users always have a visible recovery path even if the
  // auto-adopt didn't move them onto PlanPage for any reason.
  const [accountPlan, setAccountPlan]           = useState<GeneratedPlan | null>(null);
  const lastSyncedIdRef                         = useRef<string | null>(null);
  const lastUserIdRef                           = useRef<string | null>(null);

  // ── Initial local-only check (guest restore banner) ────────────────────
  useEffect(() => {
    if (loadPlan()) setHasSavedPlan(true);
  }, []);

  // ── On login: fetch the user's saved plan and reconcile with local ─────
  // Re-runs when the user actually changes (login, logout, switch account).
  useEffect(() => {
    if (authLoading) return;

    const currentUserId = user?.id ?? null;
    if (currentUserId === lastUserIdRef.current && authBootstrapped) return;
    lastUserIdRef.current = currentUserId;

    if (!isAuthenticated) {
      // Guest mode — nothing to sync. Reset sync tracking so a future login
      // re-evaluates the local plan against the account plan. Also clear the
      // cached account plan so the previous user's saved plan can't leak into
      // a different account on the same browser.
      lastSyncedIdRef.current = null;
      setAccountPlan(null);
      setAuthBootstrapped(true);
      return;
    }

    let cancelled = false;
    setBootstrapping(true);
    setErrorBanner(null);

    (async () => {
      const result = await fetchPlan();
      if (cancelled) return;

      const localPlan = loadPlan();

      if (result.kind === "error") {
        // CRITICAL: do NOT migrate the local plan to the account on a fetch
        // error — we don't know whether the account already has a plan, and
        // pushing now could silently overwrite it. Surface a banner and keep
        // the local plan visible if there is one. The user can retry by
        // refreshing.
        setErrorBanner("We could not sync your plan right now. Your plan is still saved on this device.");
        if (localPlan) adoptPlan(localPlan, { pushToServer: false });
      } else if (result.kind === "ok" && localPlan && result.plan.id !== localPlan.id) {
        // Both exist and differ → ask the user.
        if (cancelled) return;
        setAccountPlan(result.plan);
        setConflict({ local: localPlan, account: result.plan });
      } else if (result.kind === "ok") {
        // Account plan wins (no local, or local matches).
        if (cancelled) return;
        setAccountPlan(result.plan);
        adoptPlan(result.plan, { pushToServer: false });
      } else if (result.kind === "empty" && localPlan) {
        // Guest-to-account migration: upload local plan as the user's first save.
        const ok = await pushPlan(localPlan);
        if (cancelled) return;
        if (!ok) setErrorBanner("We could not sync your plan right now. Your plan is still saved on this device.");
        adoptPlan(localPlan, { pushToServer: false, justSynced: ok });
      }
      // else: result.kind === "empty" with no local plan — let user create one normally.

      if (!cancelled) {
        setBootstrapping(false);
        setAuthBootstrapped(true);
      }
    })();

    return () => { cancelled = true; };
  }, [isAuthenticated, authLoading, user?.id, fetchPlan, pushPlan]);

  // ── Auto-push plan changes to the server when authenticated ────────────
  useEffect(() => {
    if (!isAuthenticated || !plan || bootstrapping) return;
    // Skip if we just adopted this plan from the server (or just pushed it).
    if (lastSyncedIdRef.current === planFingerprint(plan)) return;

    let cancelled = false;
    (async () => {
      const ok = await pushPlan(plan);
      if (cancelled) return;
      if (ok) {
        lastSyncedIdRef.current = planFingerprint(plan);
        setErrorBanner(null);
      } else {
        setErrorBanner("We could not sync your plan right now. Your plan is still saved on this device.");
      }
    })();
    return () => { cancelled = true; };
  }, [plan, isAuthenticated, bootstrapping, pushPlan]);

  // Surface fetch/save errors as a non-blocking banner.
  useEffect(() => {
    if (syncStatus === "error" && syncError) {
      setErrorBanner("We could not sync your plan right now. Your plan is still saved on this device.");
    }
  }, [syncStatus, syncError]);

  // ── Helpers ────────────────────────────────────────────────────────────
  function adoptPlan(p: GeneratedPlan, opts: { pushToServer: boolean; justSynced?: boolean }) {
    saveLocalPlan(p);
    setPlan(p);
    setHasSavedPlan(false); // suppress the guest restore banner — we're showing the plan directly
    setStep("plan");
    if (opts.justSynced) lastSyncedIdRef.current = planFingerprint(p);
    if (!opts.pushToServer) {
      // Mark as already-synced so the auto-push effect doesn't re-upload.
      lastSyncedIdRef.current = planFingerprint(p);
    }
  }

  // ── Conflict modal handlers ────────────────────────────────────────────
  const handleKeepAccount = () => {
    if (!conflict) return;
    adoptPlan(conflict.account, { pushToServer: false });
    setConflict(null);
  };
  const handleUseLocal = async () => {
    if (!conflict) return;
    const ok = await pushPlan(conflict.local);
    if (!ok) setErrorBanner("We could not sync your plan right now. Your plan is still saved on this device.");
    adoptPlan(conflict.local, { pushToServer: false, justSynced: ok });
    setConflict(null);
  };

  // ── Existing handlers ──────────────────────────────────────────────────
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
    // Hide the "Welcome back, open my garden" CTA — the user explicitly chose
    // to start fresh, so we shouldn't immediately invite them back to the plan
    // they just discarded. The plan still lives on the server (it'll be
    // overwritten when they save the next one), so they don't lose data.
    setAccountPlan(null);
    lastSyncedIdRef.current = null;
    setStep("landing");
  };

  return (
    <MobileShell>
      <div className="w-full h-full flex flex-col items-center bg-cream text-forest font-sans overflow-hidden">

        {/* Account strip — gives the user a way back to landing / a sign-out
            control while inside the questionnaire or plan view. The landing
            page already has its own sign-in/out control in the hero, so we
            only render this when the user is past it. */}
        {isAuthenticated && step !== "landing" && (
          <div className="w-full bg-cream-light border-b border-cream-dark px-4 py-1.5 flex items-center justify-end gap-3 shrink-0 text-xs">
            {user?.name?.trim() && (
              <span className="text-forest/60 truncate max-w-[160px]">
                Signed in as <span className="font-semibold text-forest">{user.name.trim()}</span>
              </span>
            )}
            <button
              onClick={logout}
              className="text-forest/70 hover:text-forest font-semibold underline-offset-2 hover:underline"
              data-testid="btn-sign-out"
            >
              Sign out
            </button>
          </div>
        )}

        {/* Sync error banner (non-blocking) */}
        {errorBanner && (
          <div className="w-full bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2 flex items-center justify-between gap-3 shrink-0 text-xs">
            <span className="flex-1">{errorBanner}</span>
            <button
              onClick={() => setErrorBanner(null)}
              className="font-semibold underline hover:no-underline shrink-0"
              aria-label="Dismiss"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Loading saved plan from account */}
        {bootstrapping && (
          <div className="w-full bg-forest/5 border-b border-forest/10 text-forest/70 px-4 py-2 text-xs text-center shrink-0">
            Loading your saved garden plan…
          </div>
        )}

        {/* Welcome-back CTA — visible recovery path. Shown when an authenticated
            user has a saved plan on their account but isn't currently viewing it
            (e.g. they just landed on / after sign-in, or hit Start Over). The
            auto-adopt in the bootstrap effect should normally take them straight
            to PlanPage; this CTA guarantees they always have a clear way back. */}
        {step === "landing" && isAuthenticated && accountPlan && !bootstrapping && (
          <div className="w-full bg-forest text-cream px-4 py-3 flex items-center justify-between gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">
                Welcome back{user?.name?.trim() ? `, ${user.name.trim().split(/\s+/)[0]}` : ""}
              </p>
              <p className="text-xs text-cream/70 leading-tight mt-0.5 truncate">
                Your saved garden plan is ready to view.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => adoptPlan(accountPlan, { pushToServer: false })}
              className="bg-gold text-forest hover:bg-gold/90 rounded-full font-semibold shrink-0"
              data-testid="btn-open-account-plan"
            >
              Open my garden →
            </Button>
          </div>
        )}

        {/* Saved-plan restore banner (guest mode only) */}
        {hasSavedPlan && step === "landing" && !isAuthenticated && (
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
              initialStep={qInitialStep}
              onNext={p => { setProfile(p); setQInitialStep(1); setStep("frost-confirm"); }}
              onBack={() => { setQInitialStep(1); setStep("landing"); }}
            />
          )}

          {step === "frost-confirm" && profile && (
            <FrostConfirmPage
              profile={profile}
              onConfirm={generatedPlan => { setPlan(generatedPlan); setStep("plan"); }}
              onBack={() => { setQInitialStep(4); setStep("questionnaire"); }}
            />
          )}

          {step === "plan" && plan && (
            <PlanPage plan={plan} onStartOver={startOver} onPlanUpdated={setPlan} />
          )}
        </main>

        {conflict && (
          <PlanConflictModal
            onKeepAccount={handleKeepAccount}
            onUseLocal={handleUseLocal}
          />
        )}
      </div>
    </MobileShell>
  );
}

/**
 * Stable fingerprint used to deduplicate redundant server pushes. The plan
 * `id` plus the count of selected plants gives us cheap change detection
 * without deep-equal cost on every state update.
 */
function planFingerprint(plan: GeneratedPlan): string {
  return `${plan.id}:${plan.selectedPlants?.length ?? 0}:${plan.areaPlans?.length ?? 0}`;
}

import { useState, useCallback } from "react";
import type { GeneratedPlan } from "@/types/garden";

/**
 * Server-side plan persistence for authenticated users.
 *
 * The frontend continues to own its own state and `localStorage` cache (see
 * `data/storage.ts`). This hook is a thin sync layer that uploads the latest
 * plan to `/api/plans` whenever an authenticated user changes it, and fetches
 * their saved plan on login.
 *
 * Failures are non-blocking — the local plan remains usable and the caller is
 * notified via `lastError` so it can show a friendly toast.
 */

export type SyncStatus = "idle" | "loading" | "saving" | "error";

/**
 * Tri-state result for plan fetch. Crucially, `"error"` is **distinct** from
 * `"empty"` so the caller can avoid mistaking a transient network failure
 * for "this user has no saved plan" (which would otherwise trigger an
 * unintended guest→account migration that overwrites the real account plan).
 */
export type FetchPlanResult =
  | { kind: "ok";    plan: GeneratedPlan }
  | { kind: "empty" }
  | { kind: "error"; message: string };

export interface PlanSyncApi {
  status:    SyncStatus;
  lastError: string | null;
  fetchPlan: () => Promise<FetchPlanResult>;
  savePlan:  (plan: GeneratedPlan) => Promise<boolean>;
}

export function usePlanSync(): PlanSyncApi {
  const [status,    setStatus]    = useState<SyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (): Promise<FetchPlanResult> => {
    setStatus("loading");
    setLastError(null);
    try {
      const res = await fetch("/api/plans", { credentials: "include" });
      // 401 means "session expired / not authenticated" — treat as a soft empty
      // result rather than an error: the auth hook will already drive the UI
      // back to a logged-out state and we don't want a scary banner.
      if (res.status === 401) { setStatus("idle"); return { kind: "empty" }; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json() as { plan: GeneratedPlan | null };
      setStatus("idle");
      return body.plan
        ? { kind: "ok", plan: body.plan }
        : { kind: "empty" };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setStatus("error");
      setLastError(message);
      return { kind: "error", message };
    }
  }, []);

  const savePlan = useCallback(async (plan: GeneratedPlan): Promise<boolean> => {
    setStatus("saving");
    setLastError(null);
    try {
      const res = await fetch("/api/plans", {
        method:      "PUT",
        credentials: "include",
        headers:     { "Content-Type": "application/json" },
        body:        JSON.stringify({ plan }),
      });
      if (res.status === 401) { setStatus("idle"); return false; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus("idle");
      return true;
    } catch (err) {
      setStatus("error");
      setLastError(err instanceof Error ? err.message : "Unknown error");
      return false;
    }
  }, []);

  return { status, lastError, fetchPlan, savePlan };
}

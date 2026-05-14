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

export interface PlanSyncApi {
  status:    SyncStatus;
  lastError: string | null;
  fetchPlan: () => Promise<GeneratedPlan | null>;
  savePlan:  (plan: GeneratedPlan) => Promise<boolean>;
}

export function usePlanSync(): PlanSyncApi {
  const [status,    setStatus]    = useState<SyncStatus>("idle");
  const [lastError, setLastError] = useState<string | null>(null);

  const fetchPlan = useCallback(async (): Promise<GeneratedPlan | null> => {
    setStatus("loading");
    setLastError(null);
    try {
      const res = await fetch("/api/plans", { credentials: "include" });
      if (res.status === 401) { setStatus("idle"); return null; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = await res.json() as { plan: GeneratedPlan | null };
      setStatus("idle");
      return body.plan ?? null;
    } catch (err) {
      setStatus("error");
      setLastError(err instanceof Error ? err.message : "Unknown error");
      return null;
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

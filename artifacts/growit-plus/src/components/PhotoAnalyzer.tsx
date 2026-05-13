/**
 * PhotoAnalyzer — optional garden photo scan for step 3 of the questionnaire.
 *
 * States:
 *   idle      → prompt card with camera icon
 *   loading   → spinner while compressing / calling API
 *   done      → thumbnail + estimated values with confidence badges
 *   error     → friendly message with retry or skip
 *   unavailable → backend has no vision key; component renders nothing
 *
 * The component only renders the scan CTA. It never blocks the user from
 * filling in sunlight and soil type manually.
 */

import { useState, useEffect, useRef } from "react";
import type { SunlightLevel, SoilType } from "@/types/garden";
import { compressImage } from "@/utils/compressImage";
import { Camera, Loader, CheckCircle, AlertCircle, X } from "lucide-react";

export type Confidence = "high" | "medium" | "low";

export interface PhotoAnalysisResult {
  sunlight:            SunlightLevel;
  sunlightConfidence:  Confidence;
  soilType:            SoilType;
  soilTypeConfidence:  Confidence;
  conditionNotes:      string[];
}

interface PhotoAnalyzerProps {
  onResult: (result: PhotoAnalysisResult) => void;
}

type State = "checking" | "unavailable" | "idle" | "loading" | "done" | "error";

const CONFIDENCE_STYLE: Record<Confidence, string> = {
  high:   "bg-forest/10 text-forest border-forest/20",
  medium: "bg-gold/15 text-forest/80 border-gold/30",
  low:    "bg-cream-dark text-forest/50 border-cream-dark",
};

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high:   "High confidence",
  medium: "Medium confidence",
  low:    "Low confidence",
};

export default function PhotoAnalyzer({ onResult }: PhotoAnalyzerProps) {
  const [state,  setState]  = useState<State>("checking");
  const [error,  setError]  = useState<string>("");
  const [result, setResult] = useState<PhotoAnalysisResult | null>(null);
  const [thumb,  setThumb]  = useState<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Check if backend vision is available ─────────────────────────────
  useEffect(() => {
    let cancelled = false;
    fetch("/api/analyze-photo/available")
      .then(r => r.json())
      .then((d: { available: boolean }) => {
        if (!cancelled) setState(d.available ? "idle" : "unavailable");
      })
      .catch(() => { if (!cancelled) setState("unavailable"); });
    return () => { cancelled = true; };
  }, []);

  // ── Hidden file input handler ─────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setState("error");
      setError("Please upload a JPG or PNG photo.");
      return;
    }

    setState("loading");
    setError("");

    try {
      // Client-side compress
      const { base64, compressedBytes } = await compressImage(file, 800, 0.72);

      if (compressedBytes > 400_000) {
        setState("error");
        setError("Photo is still too large after compression. Try a smaller image.");
        return;
      }

      // Preview thumbnail
      setThumb(`data:image/jpeg;base64,${base64}`);

      // Call backend
      const res  = await fetch("/api/analyze-photo", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ imageBase64: base64 }),
        signal:  AbortSignal.timeout(20000),
      });

      const data = await res.json() as Record<string, unknown>;

      if (!res.ok || data["error"]) {
        setState("error");
        setError(
          typeof data["reason"] === "string"
            ? data["reason"]
            : "Photo analysis failed. You can still fill in details manually."
        );
        return;
      }

      if (data["available"] === false) {
        setState("unavailable");
        return;
      }

      const analysisResult: PhotoAnalysisResult = {
        sunlight:           data["sunlight"]            as SunlightLevel,
        sunlightConfidence: data["sunlightConfidence"]  as Confidence,
        soilType:           data["soilType"]            as SoilType,
        soilTypeConfidence: data["soilTypeConfidence"]  as Confidence,
        conditionNotes:     (data["conditionNotes"] as string[]) ?? [],
      };

      setResult(analysisResult);
      setState("done");
      onResult(analysisResult);

    } catch {
      setState("error");
      setError("Could not reach the analysis service. You can still fill in details manually.");
    }

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = "";
  };

  const openPicker = () => inputRef.current?.click();

  const handleDismiss = () => {
    setState("idle");
    setResult(null);
    setThumb("");
  };

  // ── Render ────────────────────────────────────────────────────────────

  // Nothing to show — no key configured
  if (state === "unavailable") return null;

  // Checking availability — render nothing to avoid flash
  if (state === "checking") return null;

  return (
    <div data-testid="photo-analyzer">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        onChange={handleFileChange}
        data-testid="photo-file-input"
      />

      {/* ── IDLE: scan CTA ── */}
      {state === "idle" && (
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-forest/25 bg-cream-dark/20 hover:border-forest/40 hover:bg-cream-dark/30 transition-all group"
          data-testid="btn-scan-photo"
        >
          <div className="w-11 h-11 rounded-xl bg-forest/8 flex items-center justify-center shrink-0 group-hover:bg-forest/12 transition-colors">
            <Camera className="w-5 h-5 text-forest/50" />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-semibold text-forest/70">
              Scan my garden photo
              <span className="ml-1.5 text-[10px] font-medium text-forest/35 uppercase tracking-wide">optional</span>
            </p>
            <p className="text-xs text-forest/40 mt-0.5 leading-snug">
              Estimates sun exposure and soil type from a photo · JPG or PNG
            </p>
          </div>
        </button>
      )}

      {/* ── LOADING ── */}
      {state === "loading" && (
        <div className="w-full flex items-center gap-4 p-4 rounded-2xl border border-forest/15 bg-forest/5">
          <Loader className="w-5 h-5 text-forest/50 animate-spin shrink-0" />
          <div>
            <p className="text-sm font-semibold text-forest/70">Analysing photo…</p>
            <p className="text-xs text-forest/40 mt-0.5">Compressing and reading garden conditions</p>
          </div>
        </div>
      )}

      {/* ── DONE: show thumbnail + estimates ── */}
      {state === "done" && result && (
        <div className="rounded-2xl border border-forest/15 bg-forest/5 overflow-hidden">
          {/* Header row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-forest/10">
            {thumb && (
              <img
                src={thumb}
                alt="Garden preview"
                className="w-10 h-10 rounded-lg object-cover shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-forest/60 shrink-0" />
                <p className="text-xs font-semibold text-forest/60 uppercase tracking-wider">
                  Photo scan complete
                </p>
              </div>
              <p className="text-xs text-forest/45 mt-0.5 leading-snug">
                Pre-filled below — review and adjust if needed
              </p>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-1.5 rounded-full hover:bg-forest/10 text-forest/40 transition-colors shrink-0"
              aria-label="Dismiss photo scan"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Estimates */}
          <div className="px-4 py-3 space-y-2">
            <EstimateRow
              label="Sun Exposure"
              value={result.sunlight}
              confidence={result.sunlightConfidence}
            />
            <EstimateRow
              label="Soil Type"
              value={result.soilType}
              confidence={result.soilTypeConfidence}
            />
          </div>

          {/* Condition notes */}
          {result.conditionNotes.length > 0 && (
            <div className="px-4 pb-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-forest/40 mb-1.5">
                Observed Conditions
              </p>
              <ul className="space-y-1">
                {result.conditionNotes.map((note, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-forest/30 text-xs mt-0.5 shrink-0">›</span>
                    <span className="text-xs text-forest/65 leading-snug">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── ERROR ── */}
      {state === "error" && (
        <div className="rounded-2xl border border-terracotta/20 bg-terracotta/8 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-terracotta">Photo scan unavailable</p>
              <p className="text-xs text-terracotta/75 mt-1 leading-snug">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setState("idle")}
            className="mt-3 text-xs font-semibold text-terracotta/80 underline underline-offset-2"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}

// ── Estimate row sub-component ─────────────────────────────────────────────
function EstimateRow({
  label,
  value,
  confidence,
}: {
  label:      string;
  value:      string;
  confidence: Confidence;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-forest/50 shrink-0">{label}:</span>
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-forest">{value}</span>
        <span
          className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLE[confidence]}`}
        >
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>
    </div>
  );
}

// ── Confidence badge — exported for use in QuestionnairePage ──────────────
export function ConfidenceBadge({ confidence }: { confidence: Confidence }) {
  return (
    <span
      className={`inline-flex items-center text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${CONFIDENCE_STYLE[confidence]}`}
    >
      {CONFIDENCE_LABEL[confidence]}
    </span>
  );
}

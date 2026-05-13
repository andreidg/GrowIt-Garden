import { useState } from "react";
import { REGION_KEYS } from "@/data/locations";
import type { GardenProfile, SunlightLevel, SoilType, PlantPreference, UnitSystem } from "@/types/garden";
import { UNIT_CONFIG, capToMax, toInternalFt } from "@/utils/units";
import { ArrowLeft, Sun, CloudSun, Cloud, ChevronDown, ChevronUp } from "lucide-react";
import PhotoAnalyzer, { ConfidenceBadge, type Confidence } from "@/components/PhotoAnalyzer";

interface QuestionnairePageProps {
  onNext: (profile: GardenProfile) => void;
  onBack: () => void;
}

const REGION_LABELS: Record<string, string> = {
  Calgary:    "Calgary",
  Edmonton:   "Edmonton",
  "Red Deer": "Red Deer",
  Airdrie:    "Airdrie",
  Cochrane:   "Cochrane",
  Okotoks:    "Okotoks",
};

const SUNLIGHT_OPTIONS: { id: SunlightLevel; icon: typeof Sun; label: string; sub: string }[] = [
  { id: "Full Sun",      icon: Sun,      label: "Full Sun",      sub: "6+ hrs direct sun" },
  { id: "Partial Shade", icon: CloudSun, label: "Partial Shade", sub: "3–6 hrs per day"  },
  { id: "Full Shade",    icon: Cloud,    label: "Full Shade",    sub: "Under 3 hrs"       },
];

const SOIL_OPTIONS: SoilType[] = ["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"];

const PLANT_PREFS: { id: PlantPreference; emoji: string; label: string; sub: string }[] = [
  { id: "Vegetables Only",              emoji: "🥕", label: "Vegetables Only",        sub: "Tomatoes, kale, carrots…"        },
  { id: "Vegetables + Herbs",           emoji: "🌿", label: "Vegetables + Herbs",      sub: "Edibles + basil, mint…"          },
  { id: "Vegetables + Herbs + Flowers", emoji: "🌸", label: "Veggies, Herbs & Flowers",sub: "Full mix with pollinators"       },
  { id: "Flowers + Herbs",              emoji: "🌺", label: "Flowers + Herbs",          sub: "Aromatic + decorative"           },
  { id: "Flowers Only",                 emoji: "🌻", label: "Flowers Only",             sub: "Dahlias, marigolds, lavender…"  },
];

export default function QuestionnairePage({ onNext, onBack }: QuestionnairePageProps) {
  const [step, setStep]                     = useState(1);
  const [region, setRegion]                 = useState("Calgary");
  const [showWhyTip, setShowWhyTip]         = useState(false);
  const [unit, setUnit]                     = useState<UnitSystem>("imperial");
  const [lengthVal, setLengthVal]           = useState<string>("10");
  const [widthVal, setWidthVal]             = useState<string>("8");
  const [dimensionCapped, setDimensionCapped] = useState(false);
  const [sunlight, setSunlight]             = useState<SunlightLevel>("Full Sun");
  const [soilType, setSoilType]             = useState<SoilType>("Raised Bed");
  const [plantPref, setPlantPref]           = useState<PlantPreference>("Vegetables + Herbs + Flowers");
  const [sunlightConf, setSunlightConf]     = useState<Confidence | null>(null);
  const [soilConf, setSoilConf]             = useState<Confidence | null>(null);

  const handlePhotoResult = (r: { sunlight: SunlightLevel; sunlightConfidence: Confidence; soilType: SoilType; soilTypeConfidence: Confidence }) => {
    setSunlight(r.sunlight);       setSunlightConf(r.sunlightConfidence);
    setSoilType(r.soilType);       setSoilConf(r.soilTypeConfidence);
  };

  const cfg = UNIT_CONFIG[unit];
  const TOTAL_STEPS = 4;

  const handleDimension = (val: string, setter: (v: string) => void) => {
    if (val === "" || val === "-") { setter(val); setDimensionCapped(false); return; }
    const num = parseFloat(val);
    if (isNaN(num) || num <= 0) { setter(val); return; }
    const capped = capToMax(num, unit);
    if (capped < num) setDimensionCapped(true);
    setter(String(capped));
  };

  const handleUnitSwitch = (sys: UnitSystem) => {
    setUnit(sys);
    setDimensionCapped(false);
    // Reset to sensible defaults for the new unit
    setLengthVal(sys === "imperial" ? "10" : "3");
    setWidthVal(sys === "imperial" ? "8" : "2.5");
  };

  const canAdvanceStep2 = () => {
    const l = parseFloat(lengthVal);
    const w = parseFloat(widthVal);
    return !isNaN(l) && l > 0 && !isNaN(w) && w > 0;
  };

  const handleSubmit = () => {
    const rawLen = parseFloat(lengthVal) || 10;
    const rawWid = parseFloat(widthVal)  || 8;
    const lengthFt = toInternalFt(capToMax(rawLen, unit), unit);
    const widthFt  = toInternalFt(capToMax(rawWid, unit), unit);
    onNext({ region, lengthFt, widthFt, sunlight, soilType, plantPreference: plantPref, unitPreference: unit });
  };

  const goBack = () => step > 1 ? setStep(s => s - 1) : onBack();
  const goNext = () => setStep(s => s + 1);

  return (
    <div className="w-full flex-1 flex flex-col bg-cream min-h-full">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 bg-cream z-10 px-6 pt-8 pb-4 border-b border-cream-dark/50">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={goBack}
            className="p-2 -ml-2 text-forest hover:bg-cream-dark/50 rounded-full transition-colors"
            data-testid="btn-back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                  i + 1 < step  ? "bg-forest/40" :
                  i + 1 === step ? "bg-forest" :
                  "bg-cream-dark"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-forest/40 w-10 text-right">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">

        {/* ── STEP 1: Region ── */}
        {step === 1 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-forest leading-tight mb-2">
                Where is your garden?
              </h1>
              <p className="text-forest/60 text-base">
                We'll set your frost dates and growing zone automatically.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REGION_KEYS.map(key => (
                <button
                  key={key}
                  onClick={() => setRegion(key)}
                  className={`py-4 px-4 rounded-2xl border text-left font-medium transition-all ${
                    region === key
                      ? "bg-forest border-forest text-cream shadow-md"
                      : "bg-cream-light border-cream-dark text-forest hover:border-forest/30"
                  }`}
                  data-testid={`region-btn-${key.toLowerCase().replace(" ", "-")}`}
                >
                  <span className="block text-base font-semibold">{REGION_LABELS[key]}</span>
                </button>
              ))}
            </div>

            {/* Why does this matter */}
            <div className="bg-cream-dark/30 rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowWhyTip(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-forest"
              >
                <span>Why does this matter?</span>
                {showWhyTip ? <ChevronUp className="w-4 h-4 text-forest/50" /> : <ChevronDown className="w-4 h-4 text-forest/50" />}
              </button>
              {showWhyTip && (
                <p className="px-4 pb-4 text-sm text-forest/70 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                  Each Alberta region has slightly different frost dates due to local elevation and wind patterns. 
                  Your region determines when to start seeds indoors, when it's safe to transplant, and your effective growing season length.
                </p>
              )}
            </div>

            <button
              onClick={goNext}
              className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95 mt-2"
              data-testid="btn-next-step1"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP 2: Garden Size ── */}
        {step === 2 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-forest leading-tight mb-2">
                How big is your garden?
              </h1>
              <p className="text-forest/60 text-base">
                Enter the length and width of your growing space.
              </p>
            </div>

            {/* Unit toggle */}
            <div className="flex bg-cream-dark rounded-full p-1 self-start">
              {(["imperial", "metric"] as UnitSystem[]).map(sys => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => handleUnitSwitch(sys)}
                  className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                    unit === sys ? "bg-forest text-cream shadow-sm" : "text-forest/60 hover:text-forest"
                  }`}
                  data-testid={`unit-${UNIT_CONFIG[sys].abbr}`}
                >
                  {UNIT_CONFIG[sys].abbr === "ft" ? "Imperial (ft)" : "Metric (m)"}
                </button>
              ))}
            </div>

            {/* Dimension inputs */}
            <div className="grid grid-cols-2 gap-4">
              {([
                { label: "Length", val: lengthVal, setter: setLengthVal, testId: "input-length" },
                { label: "Width",  val: widthVal,  setter: setWidthVal,  testId: "input-width"  },
              ] as const).map(({ label, val, setter, testId }) => (
                <div key={label} className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-forest/70 ml-1">
                    {label} ({cfg.label})
                  </label>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="any"
                    min="0.1"
                    value={val}
                    onChange={e => handleDimension(e.target.value, setter)}
                    className="h-14 bg-cream-light border border-cream-dark rounded-2xl px-4 text-forest text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest/30"
                    placeholder={String(cfg.maxInput)}
                    data-testid={testId}
                  />
                </div>
              ))}
            </div>

            {/* Size guidance */}
            <div className="grid grid-cols-3 gap-2">
              {(unit === "imperial"
                ? [{ label: "Small", sub: "4 × 4 ft",  len: "4",  wid: "4"  },
                   { label: "Medium",sub: "8 × 8 ft",  len: "8",  wid: "8"  },
                   { label: "Large", sub: "12 × 12 ft",len: "12", wid: "12" }]
                : [{ label: "Small", sub: "1.2 × 1.2 m",len: "1.2",wid: "1.2"},
                   { label: "Medium",sub: "2.4 × 2.4 m",len: "2.4",wid: "2.4"},
                   { label: "Large", sub: "3.7 × 3.7 m",len: "3.7",wid: "3.7"}]
              ).map(({ label, sub, len, wid }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => { setLengthVal(len); setWidthVal(wid); setDimensionCapped(false); }}
                  className="bg-cream-light border border-cream-dark rounded-xl py-3 flex flex-col items-center hover:border-forest/30 transition-colors"
                >
                  <span className="text-xs font-bold text-forest">{label}</span>
                  <span className="text-[10px] text-forest/50 mt-0.5">{sub}</span>
                </button>
              ))}
            </div>

            {dimensionCapped && (
              <div
                data-testid="text-dimension-cap-notice"
                className="text-sm text-terracotta font-medium bg-terracotta/10 p-4 rounded-2xl border border-terracotta/20 flex items-start gap-2"
              >
                <span className="text-base">⚠️</span>
                <span>
                  GrowIt+ supports gardens up to {cfg.capDisplay}. Your dimensions have been adjusted.
                </span>
              </div>
            )}

            <button
              onClick={goNext}
              disabled={!canAdvanceStep2()}
              className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed mt-2"
              data-testid="btn-next-step2"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP 3: Growing Conditions ── */}
        {step === 3 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-forest leading-tight mb-2">
                Growing conditions
              </h1>
              <p className="text-forest/60 text-base">
                Help us match plants to your space.
              </p>
            </div>

            {/* Optional photo scan */}
            <PhotoAnalyzer onResult={handlePhotoResult} />

            {/* Sunlight */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-forest/70 uppercase tracking-wider">
                  Sun Exposure
                </label>
                {sunlightConf && (
                  <ConfidenceBadge confidence={sunlightConf} />
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SUNLIGHT_OPTIONS.map(({ id, icon: Icon, label, sub }) => {
                  const active = sunlight === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { setSunlight(id); setSunlightConf(null); }}
                      className={`flex flex-col items-center gap-2 py-4 px-1 rounded-2xl border transition-all ${
                        active
                          ? "bg-forest border-forest text-cream shadow-md"
                          : "bg-cream-light border-cream-dark text-forest hover:border-forest/30"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${active ? "text-gold" : "text-forest/50"}`} />
                      <span className="text-xs font-bold text-center leading-tight">{label}</span>
                      <span className={`text-[10px] text-center leading-tight ${active ? "text-cream/60" : "text-forest/40"}`}>
                        {sub}
                      </span>
                    </button>
                  );
                })}
              </div>
              {sunlight === "Full Shade" && (
                <div className="text-sm text-terracotta bg-terracotta/10 p-3 rounded-xl border border-terracotta/20">
                  ⚠️ Full shade limits edibles. Only shade-tolerant greens and some herbs can be recommended.
                </div>
              )}
            </div>

            {/* Soil type */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-forest/70 uppercase tracking-wider">
                  Soil Setup
                </label>
                {soilConf && (
                  <ConfidenceBadge confidence={soilConf} />
                )}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {SOIL_OPTIONS.map(soil => {
                  const active = soilType === soil;
                  const emoji = soil === "Raised Bed" ? "🪴" : soil === "In-Ground Clay" ? "🏔" : soil === "In-Ground Loam" ? "🌍" : "🫙";
                  return (
                    <button
                      key={soil}
                      onClick={() => { setSoilType(soil); setSoilConf(null); }}
                      className={`py-4 px-4 rounded-2xl border text-left transition-all ${
                        active
                          ? "bg-forest border-forest text-cream shadow-md"
                          : "bg-cream-light border-cream-dark text-forest hover:border-forest/30"
                      }`}
                    >
                      <span className="text-xl block mb-1">{emoji}</span>
                      <span className={`text-sm font-medium leading-tight block ${active ? "text-cream" : "text-forest"}`}>
                        {soil}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={goNext}
              className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95 mt-2"
              data-testid="btn-next-step3"
            >
              Continue
            </button>
          </div>
        )}

        {/* ── STEP 4: Plant Preference ── */}
        {step === 4 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h1 className="font-serif text-4xl font-semibold text-forest leading-tight mb-2">
                What are you growing?
              </h1>
              <p className="text-forest/60 text-base">
                Pick the mix that excites you most.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              {PLANT_PREFS.map(({ id, emoji, label, sub }) => {
                const active = plantPref === id;
                return (
                  <button
                    key={id}
                    onClick={() => setPlantPref(id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all ${
                      active
                        ? "bg-forest border-forest shadow-md"
                        : "bg-cream-light border-cream-dark hover:border-forest/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
                      active ? "bg-cream/15" : "bg-cream"
                    }`}>
                      {emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-base leading-tight ${active ? "text-cream" : "text-forest"}`}>
                        {label}
                      </p>
                      <p className={`text-sm mt-0.5 ${active ? "text-cream/60" : "text-forest/50"}`}>
                        {sub}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      active ? "border-cream bg-cream" : "border-forest/30"
                    }`}>
                      {active && <div className="w-2.5 h-2.5 rounded-full bg-forest" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={handleSubmit}
              className="w-full bg-forest text-cream text-lg font-semibold py-4 rounded-full shadow-md transition-transform active:scale-95 mt-2"
              data-testid="btn-next-questionnaire"
            >
              Review Frost Dates →
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

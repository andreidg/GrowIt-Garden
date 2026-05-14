import { useState } from "react";
import { REGION_KEYS, GROWING_REGIONS } from "@/data/locations";
import { VEGETABLES, HERBS, FLOWERS, FOLIAGE, type PlantItem } from "@/data/plants";
import type { GardenProfile, SunlightLevel, SoilType, UnitSystem, GardenArea, CustomPlant, PlantType } from "@/types/garden";
import { UNIT_CONFIG, capToMax, toInternalFt } from "@/utils/units";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, Check, X, Search } from "lucide-react";
import PhotoAnalyzer, { ConfidenceBadge, type Confidence } from "@/components/PhotoAnalyzer";

interface QuestionnairePageProps {
  onNext: (profile: GardenProfile) => void;
  onBack: () => void;
  initialStep?: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const REGION_LABELS: Record<string, string> = {
  Calgary:    "Calgary",
  Edmonton:   "Edmonton",
  "Red Deer": "Red Deer",
  Airdrie:    "Airdrie",
  Cochrane:   "Cochrane",
  Okotoks:    "Okotoks",
};

const SUNLIGHT_OPTIONS: { id: SunlightLevel; emoji: string; label: string; desc: string }[] = [
  { id: "Full Sun",      emoji: "☀️", label: "Full Sun",      desc: "6+ hours of direct sun per day. Best for vegetables, herbs, and sun-loving flowers." },
  { id: "Part Sun",      emoji: "🌤", label: "Part Sun",      desc: "4–6 hours of direct sun. Works well for many vegetables with some afternoon shade." },
  { id: "Part Shade",    emoji: "⛅", label: "Part Shade",    desc: "2–4 hours of direct sun or filtered light all day. Suits leafy greens and herbs." },
  { id: "Dappled Shade", emoji: "🌥", label: "Dappled Shade", desc: "Sunlight filtered through trees or structures. Common near fences or pergolas." },
  { id: "Full Shade",    emoji: "☁️", label: "Full Shade",    desc: "Under 2 hours of direct sun. Needs bright indirect outdoor light." },
];

const SOIL_OPTIONS: SoilType[] = ["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"];
const SOIL_EMOJI: Record<SoilType, string> = {
  "Raised Bed":     "🪴",
  "In-Ground Clay": "🏔",
  "In-Ground Loam": "🌍",
  "Container/Pots": "🫙",
};

const QUICK_PRESETS = [
  { label: "Small 4×4",   ft: { len: 4,  wid: 4  } },
  { label: "Medium 10×8", ft: { len: 10, wid: 8  } },
  { label: "Large 16×12", ft: { len: 16, wid: 12 } },
];

const GARDEN_GOALS = [
  { id: "beginner",      emoji: "🌱", label: "Beginner-friendly",    desc: "Easy, forgiving plants for first-time gardeners" },
  { id: "vegetable",     emoji: "🥕", label: "Vegetable-focused",     desc: "Food-first: salads, roots, greens and staple crops" },
  { id: "herbs-flowers", emoji: "🌿", label: "Herbs & Flowers",       desc: "Fragrant herbs and colourful seasonal blooms" },
  { id: "pollinator",    emoji: "🐝", label: "Pollinator-friendly",   desc: "Attract bees, butterflies and beneficial insects" },
  { id: "family",        emoji: "🧺", label: "Family / Kid-friendly", desc: "Easy-win crops kids love to grow and harvest" },
  { id: "custom",        emoji: "⚙️", label: "Custom selection",      desc: "I'll choose my own plants" },
] as const;

const PREVIEW_SUNLIGHT_SCORE: Record<string, number> = {
  "Full Sun": 5, "Part Sun": 4, "Partial Shade": 3, "Part Shade": 3, "Dappled Shade": 2, "Full Shade": 1,
};
const FAMILY_KW = ["tomato", "bean", "pea", "carrot", "cucumber", "sunflower", "pumpkin", "lettuce", "radish"];

function computeGoalPreview(goal: string, sunlight: SunlightLevel, soilType: SoilType, totalArea: number): PlantItem[] {
  const gardenScore = PREVIEW_SUNLIGHT_SCORE[sunlight] ?? 3;
  const compat = (plants: PlantItem[]) => plants.filter(p => {
    const plantScore = PREVIEW_SUNLIGHT_SCORE[p.minSunlight] ?? 3;
    const sunOk      = gardenScore >= plantScore - 1;
    const containerOk = soilType !== "Container/Pots" || p.spacingFt <= 1;
    const sizeOk     = totalArea < 8 ? p.spacingFt <= 1 : totalArea < 16 ? p.spacingFt <= 2 : true;
    return sunOk && containerOk && sizeOk;
  });
  switch (goal) {
    case "beginner":
      return compat([...VEGETABLES, ...HERBS]).filter(p => p.riskLevel === "normal" && p.daysToMaturity <= 90);
    case "vegetable":
      return compat([...VEGETABLES, ...HERBS]);
    case "herbs-flowers":
      return compat([...HERBS, ...FLOWERS]);
    case "pollinator": {
      const p = compat(FLOWERS.filter(p => p.gardenBenefits?.pollinatorSupport));
      const h = compat(HERBS.filter(p => p.gardenBenefits?.companionPlanting));
      return [...p, ...h].length >= 3 ? [...p, ...h] : compat([...FLOWERS]);
    }
    case "family": {
      const pool = compat([...VEGETABLES, ...FLOWERS].filter(p => FAMILY_KW.some(k => p.id.includes(k))));
      return pool.length >= 3 ? pool : compat([...VEGETABLES]);
    }
    default: return [];
  }
}

const TOTAL_STEPS = 4;
const PRIMARY_ID   = "area-primary";

type PlantFilter = "all" | "vegetables" | "herbs" | "flowers" | "foliage";

// ---------------------------------------------------------------------------
// Plant-section sub-component
// ---------------------------------------------------------------------------

function PlantSection({
  title, emoji, plants, selectedPlantIds, onToggle, onToggleAll, onRecommend, recommendNote,
}: {
  title: string;
  emoji: string;
  plants: PlantItem[];
  selectedPlantIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onRecommend: () => void;
  recommendNote?: string;
}) {
  const allSelected = plants.length > 0 && plants.every(p => selectedPlantIds.includes(p.id));
  return (
    <div>
      <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
        <h3 className="text-xs font-bold text-forest/40 uppercase tracking-widest shrink-0">
          {emoji} {title}
        </h3>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRecommend}
            className="text-xs bg-forest text-cream px-3 py-1.5 rounded-full font-semibold hover:bg-forest/85 active:scale-95 transition-all"
          >
            Pick My Plants
          </button>
          <button
            onClick={onToggleAll}
            className="text-xs text-forest/50 font-medium hover:text-forest transition-colors"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>
      {recommendNote && (
        <div className="mb-2 bg-forest/6 border border-forest/12 rounded-xl px-3 py-2">
          <p className="text-xs text-forest/70 leading-snug">{recommendNote}</p>
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        {plants.map(plant => {
          const selected = selectedPlantIds.includes(plant.id);
          return (
            <button key={plant.id} onClick={() => onToggle(plant.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all ${
                selected ? "bg-forest/10 border-forest/30" : "bg-cream-light border-cream-dark/50"
              }`}>
              <span className="text-xl">{plant.emoji}</span>
              <p className="flex-1 min-w-0 text-sm font-semibold text-forest">{plant.name}</p>
              <div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${
                selected ? "bg-forest border-forest" : "border-forest/25"
              }`}>
                {selected && <Check className="w-3 h-3 text-cream" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function valToDisplay(ft: number, unit: UnitSystem): string {
  const v = unit === "imperial" ? ft : Math.round(ft * 0.3048 * 10) / 10;
  return String(v);
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function QuestionnairePage({ onNext, onBack, initialStep = 1 }: QuestionnairePageProps) {

  // ── Navigation ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(initialStep);

  // ── Step 1 ───────────────────────────────────────────────────────────────
  const [region,      setRegion]      = useState("Calgary");
  const [showWhyTip,  setShowWhyTip]  = useState(false);

  // ── Step 2 ───────────────────────────────────────────────────────────────
  const [unit, setUnit] = useState<UnitSystem>("imperial");
  const [areas, setAreas] = useState<GardenArea[]>([{
    id: PRIMARY_ID, name: "My Garden",
    lengthFt: 6, widthFt: 6,
    sunlight: "Full Sun", soilType: "Raised Bed",
  }]);
  const [areaInputs, setAreaInputs] = useState<Record<string, { len: string; wid: string }>>({
    [PRIMARY_ID]: { len: "6", wid: "6" },
  });
  const [capWarnings,  setCapWarnings]  = useState<Record<string, boolean>>({});
  const [areaConfs,    setAreaConfs]    = useState<Record<string, { sunlight: Confidence | null; soil: Confidence | null }>>({});

  // ── Step 3 ───────────────────────────────────────────────────────────────
  const [gardenGoal,       setGardenGoal]       = useState<string>("");
  const [showAddPlants,    setShowAddPlants]    = useState(false);
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [recommendNotes,   setRecommendNotes]   = useState<Record<string, string>>({});

  const [customPlants,     setCustomPlants]     = useState<CustomPlant[]>([]);
  const [showCustomForm,   setShowCustomForm]   = useState(false);
  const [customName,       setCustomName]       = useState("");
  const [customCategory,   setCustomCategory]   = useState<PlantType | "other">("vegetable");
  const [customNotes,      setCustomNotes]      = useState("");
  const [plantFilter,      setPlantFilter]      = useState<PlantFilter>("all");
  const [plantSearch,      setPlantSearch]      = useState("");
  const [plantError,       setPlantError]       = useState(false);

  // ── Step 4 ───────────────────────────────────────────────────────────────
  const [alertFrost,    setAlertFrost]    = useState(true);
  const [alertHail,     setAlertHail]     = useState(true);
  const [alertPlanting, setAlertPlanting] = useState(false);
  const [alertWatering, setAlertWatering] = useState(true);
  const [notifHour,     setNotifHour]     = useState(7);
  const [notifMinute,   setNotifMinute]   = useState(0);
  const [notifAmPm,     setNotifAmPm]     = useState<"AM" | "PM">("AM");

  const cfg = UNIT_CONFIG[unit];

  // ── Area management ───────────────────────────────────────────────────────
  const updateArea = (id: string, patch: Partial<GardenArea>) =>
    setAreas(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));

  const handleAreaDim = (areaId: string, field: "len" | "wid", rawVal: string) => {
    setAreaInputs(prev => ({
      ...prev,
      [areaId]: { ...(prev[areaId] ?? { len: "10", wid: "8" }), [field]: rawVal },
    }));
    const num = parseFloat(rawVal);
    if (!isNaN(num) && num > 0) {
      const capped = capToMax(num, unit);
      const ft     = toInternalFt(capped, unit);
      updateArea(areaId, field === "len" ? { lengthFt: ft } : { widthFt: ft });
      setCapWarnings(prev => ({ ...prev, [areaId]: capped < num }));
    }
  };

  const handleUnitSwitch = (sys: UnitSystem) => {
    setUnit(sys);
    setAreaInputs(_prev => {
      const next: Record<string, { len: string; wid: string }> = {};
      for (const a of areas) {
        next[a.id] = { len: valToDisplay(a.lengthFt, sys), wid: valToDisplay(a.widthFt, sys) };
      }
      return next;
    });
    setCapWarnings({});
  };

  const applyPreset = (areaId: string, ft: { len: number; wid: number }) => {
    updateArea(areaId, { lengthFt: ft.len, widthFt: ft.wid });
    setAreaInputs(prev => ({
      ...prev,
      [areaId]: { len: valToDisplay(ft.len, unit), wid: valToDisplay(ft.wid, unit) },
    }));
    setCapWarnings(prev => ({ ...prev, [areaId]: false }));
  };

  const addArea = () => {
    const n  = areas.length + 1;
    const id = `area-${Date.now()}`;
    const defaultNames = ["", "My Garden", "Front Yard", "Side Bed", "Herb Planter", "Balcony"];
    const newArea: GardenArea = {
      id,
      name:     defaultNames[n] ?? `Garden Area ${n}`,
      lengthFt: 6, widthFt: 6,
      sunlight: "Full Sun", soilType: "Raised Bed",
    };
    setAreas(prev => [...prev, newArea]);
    setAreaInputs(prev => ({
      ...prev,
      [id]: { len: valToDisplay(8, unit), wid: valToDisplay(6, unit) },
    }));
  };

  const removeArea = (id: string) => {
    setAreas(prev => prev.filter(a => a.id !== id));
    setAreaInputs(prev => { const n = { ...prev }; delete n[id]; return n; });
    setCapWarnings(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handlePhotoResult = (areaId: string, r: {
    sunlight: SunlightLevel;
    sunlightConfidence: Confidence;
    soilType: SoilType;
    soilTypeConfidence: Confidence;
  }) => {
    updateArea(areaId, { sunlight: r.sunlight, soilType: r.soilType });
    setAreaConfs(prev => ({
      ...prev,
      [areaId]: { sunlight: r.sunlightConfidence, soil: r.soilTypeConfidence },
    }));
  };

  // ── Plant selection ───────────────────────────────────────────────────────
  const togglePlant = (id: string) => {
    setPlantError(false);
    setSelectedPlantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const makeToggleAll = (ids: string[]) => () => {
    setPlantError(false);
    setSelectedPlantIds(prev => {
      const allOn = ids.every(id => prev.includes(id));
      return allOn ? prev.filter(id => !ids.includes(id)) : [...new Set([...prev, ...ids])];
    });
  };

  // ── Plant recommendation ─────────────────────────────────────────────────
  const SUNLIGHT_SCORE: Record<string, number> = {
    "Full Sun": 5, "Part Sun": 4, "Partial Shade": 3,
    "Part Shade": 3, "Dappled Shade": 2, "Full Shade": 1,
  };

  const recommendForCategory = (categoryPlants: PlantItem[], categoryKey: string) => {
    const primary = areas[0]!;
    const { sunlight, soilType, lengthFt, widthFt } = primary;
    const totalArea = lengthFt * widthFt;
    const gardenScore = SUNLIGHT_SCORE[sunlight] ?? 3;

    let pool = categoryPlants.filter(p => {
      const plantScore = SUNLIGHT_SCORE[p.minSunlight] ?? 3;
      return gardenScore >= plantScore - 1;
    });

    if (soilType === "Container/Pots") pool = pool.filter(p => p.spacingFt <= 1);
    if (totalArea < 8)       pool = pool.filter(p => p.spacingFt <= 1);
    else if (totalArea < 16) pool = pool.filter(p => p.spacingFt <= 2);

    const recIds = pool.map(p => p.id);
    setSelectedPlantIds(prev => [...new Set([...prev, ...recIds])]);
    setPlantError(false);

    let note: string;
    if (pool.length === 0) {
      note = "No plants in this category suit your current garden conditions — try adjusting the sunlight or soil settings.";
    } else {
      const ctx = soilType === "Container/Pots" ? "container" : `${sunlight.toLowerCase()} garden`;
      note = `SproutIt picked ${pool.length} plant${pool.length !== 1 ? "s" : ""} suited to your ${ctx}.`;
    }
    setRecommendNotes(prev => ({ ...prev, [categoryKey]: note }));
  };

  const addCustomPlant = () => {
    if (!customName.trim()) return;
    setPlantError(false);
    setCustomPlants(prev => [...prev, {
      id:       `custom-${Date.now()}`,
      name:     customName.trim(),
      category: customCategory,
      notes:    customNotes.trim() || undefined,
    }]);
    setCustomName(""); setCustomNotes(""); setShowCustomForm(false);
  };

  const removeCustom = (id: string) => setCustomPlants(prev => prev.filter(c => c.id !== id));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!gardenGoal) { setPlantError(true); return; }
    if (gardenGoal === "custom" && totalSelected === 0) { setPlantError(true); return; }
    setPlantError(false);
    const primary = areas[0]!;
    onNext({
      region,
      unitPreference: unit,
      lengthFt: primary.lengthFt,
      widthFt:  primary.widthFt,
      sunlight: primary.sunlight,
      soilType: primary.soilType,
      areas,
      gardenGoal,
      selectedPlantIds,
      customPlants,
    });
  };

  const goBack = () => step > 1 ? setStep(s => s - 1) : onBack();
  const totalSelected = selectedPlantIds.length + customPlants.length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full flex-1 flex flex-col bg-cream min-h-full">

      {/* Sticky progress header */}
      <div className="sticky top-0 bg-cream z-10 px-6 pt-8 pb-4 border-b border-cream-dark/40">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} data-testid="btn-back"
            className="p-2 -ml-2 text-forest hover:bg-cream-dark/50 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex gap-1.5">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 rounded-full flex-1 transition-all duration-300 ${
                i < step ? "bg-forest/40" : i === step ? "bg-forest" : "bg-cream-dark"
              }`} />
            ))}
          </div>
          <span className="text-xs font-medium text-forest/40 w-10 text-right">
            {step}/{TOTAL_STEPS}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar">

        {/* ── STEP 1: Region ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <p className="text-xs font-semibold text-forest/40 uppercase tracking-widest mb-1">
                Step 1 of 4
              </p>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-1">
                Where is your garden?
              </h2>
              <p className="text-sm text-forest/60 leading-relaxed">
                We use your location to set frost dates and climate-matched growing advice.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REGION_KEYS.map(key => {
                const r = GROWING_REGIONS[key];
                const isSelected = region === key;
                return (
                  <button key={key} onClick={() => setRegion(key)}
                    className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-forest border-forest text-cream"
                        : "bg-cream-light border-cream-dark text-forest"
                    }`}>
                    <span className="font-semibold text-sm leading-tight mb-1">
                      {REGION_LABELS[key] ?? key}
                    </span>
                    <span className={`text-[10px] font-medium ${isSelected ? "text-cream/60" : "text-forest/45"}`}>
                      Zone {r?.zone} · ❄️ {r?.lastSpringFrost}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Why this matters */}
            <div className="bg-forest/5 rounded-2xl overflow-hidden border border-forest/8">
              <button
                onClick={() => setShowWhyTip(v => !v)}
                className="w-full flex items-center justify-between px-4 py-3.5">
                <span className="text-sm font-medium text-forest/70">
                  Why does location matter?
                </span>
                {showWhyTip
                  ? <ChevronUp className="w-4 h-4 text-forest/40" />
                  : <ChevronDown className="w-4 h-4 text-forest/40" />}
              </button>
              {showWhyTip && (
                <div className="px-4 pb-4 text-sm text-forest/65 leading-relaxed">
                  Each Alberta city has different frost dates and microclimates. Your last spring frost
                  date sets when to start seeds indoors, when to direct sow, and when the risk of frost
                  passes for tender crops like tomatoes and basil.
                </div>
              )}
            </div>

            <div className="pt-2">
              <button onClick={() => setStep(2)} data-testid="btn-next-step"
                className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Garden Areas ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="px-6 py-8 flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <p className="text-xs font-semibold text-forest/40 uppercase tracking-widest mb-1">
                Step 2 of 4
              </p>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-1">
                Your garden spaces
              </h2>
              <p className="text-sm text-forest/60 leading-relaxed">
                Tell us about each growing area. You can add more than one.
              </p>
            </div>

            {/* Unit toggle */}
            <div className="flex items-center gap-1 bg-cream-dark/60 rounded-xl p-1 w-fit">
              {(["imperial", "metric"] as UnitSystem[]).map(sys => (
                <button key={sys} onClick={() => handleUnitSwitch(sys)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    unit === sys ? "bg-white text-forest shadow-sm" : "text-forest/50"
                  }`}>
                  {sys === "imperial" ? "ft (Imperial)" : "m (Metric)"}
                </button>
              ))}
            </div>

            {/* Area cards */}
            {areas.map((area) => (
              <div key={area.id}
                className="bg-cream-light border border-cream-dark rounded-2xl overflow-hidden shadow-sm">

                {/* Card header — name + remove */}
                <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-cream-dark/60">
                  <input
                    value={area.name}
                    onChange={e => updateArea(area.id, { name: e.target.value })}
                    placeholder="Area name"
                    className="flex-1 text-sm font-bold text-forest bg-transparent border-none outline-none placeholder:text-forest/30"
                  />
                  {areas.length > 1 && (
                    <button onClick={() => removeArea(area.id)}
                      className="text-forest/25 hover:text-terracotta transition-colors p-1 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-4 flex flex-col gap-5">

                  {/* Photo scanner for this area */}
                  <PhotoAnalyzer onResult={r => handlePhotoResult(area.id, r)} />

                  {/* Dimensions */}
                  <div>
                    <p className="text-xs font-semibold text-forest/45 uppercase tracking-wider mb-2">
                      Size
                    </p>
                    <div className="grid grid-cols-2 gap-3 mb-2">
                      <div>
                        <label className="text-xs text-forest/50 mb-1 block">
                          Length ({cfg.abbr})
                        </label>
                        <input
                          inputMode="decimal"
                          value={areaInputs[area.id]?.len ?? ""}
                          onChange={e => handleAreaDim(area.id, "len", e.target.value)}
                          className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm font-medium text-forest focus:outline-none focus:border-forest/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-forest/50 mb-1 block">
                          Width ({cfg.abbr})
                        </label>
                        <input
                          inputMode="decimal"
                          value={areaInputs[area.id]?.wid ?? ""}
                          onChange={e => handleAreaDim(area.id, "wid", e.target.value)}
                          className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm font-medium text-forest focus:outline-none focus:border-forest/40"
                        />
                      </div>
                    </div>
                    {capWarnings[area.id] && (
                      <p className="text-xs text-terracotta mb-2">
                        SproutIt supports gardens up to {cfg.maxInput}{cfg.abbr} × {cfg.maxInput}{cfg.abbr}. Your dimensions have been adjusted.
                      </p>
                    )}
                    {/* Quick presets */}
                    <div className="flex gap-2 flex-wrap">
                      {QUICK_PRESETS.map(p => (
                        <button key={p.label} onClick={() => applyPreset(area.id, p.ft)}
                          className="text-xs text-forest/55 border border-cream-dark bg-cream hover:bg-cream-dark/50 px-2.5 py-1 rounded-lg transition-colors">
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sunlight */}
                  <div>
                    <p className="text-xs font-semibold text-forest/45 uppercase tracking-wider mb-2">
                      Sunlight
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {SUNLIGHT_OPTIONS.map(opt => {
                        const active = area.sunlight === opt.id;
                        return (
                          <button key={opt.id} onClick={() => updateArea(area.id, { sunlight: opt.id })}
                            className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                              active
                                ? "bg-forest/10 border-forest/30"
                                : "bg-cream border-cream-dark"
                            }`}>
                            <div className={`mt-1 w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                              active ? "border-forest" : "border-forest/25"
                            }`}>
                              {active && <div className="w-1.5 h-1.5 rounded-full bg-forest" />}
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-forest leading-tight">
                                {opt.emoji} {opt.label}
                              </p>
                              <p className="text-[10px] text-forest/50 leading-snug mt-0.5">
                                {opt.desc}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {areaConfs[area.id]?.sunlight && (
                      <div className="mt-2 space-y-1">
                        <ConfidenceBadge confidence={areaConfs[area.id]!.sunlight!} />
                        {areaConfs[area.id]!.sunlight === "low" && (
                          <p className="text-[11px] text-terracotta/80 leading-snug">
                            Please confirm or adjust this value before continuing.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Soil type */}
                  <div>
                    <p className="text-xs font-semibold text-forest/45 uppercase tracking-wider mb-2">
                      Soil Setup
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {SOIL_OPTIONS.map(soil => {
                        const active = area.soilType === soil;
                        return (
                          <button key={soil} onClick={() => updateArea(area.id, { soilType: soil })}
                            className={`py-2.5 px-3 rounded-xl border text-left transition-all ${
                              active
                                ? "bg-forest border-forest text-cream"
                                : "bg-cream border-cream-dark text-forest"
                            }`}>
                            <span className="text-base block">{SOIL_EMOJI[soil]}</span>
                            <span className="text-xs font-medium leading-tight">{soil}</span>
                          </button>
                        );
                      })}
                    </div>
                    {areaConfs[area.id]?.soil && (
                      <div className="mt-2 space-y-1">
                        <ConfidenceBadge confidence={areaConfs[area.id]!.soil!} />
                        {areaConfs[area.id]!.soil === "low" && (
                          <p className="text-[11px] text-terracotta/80 leading-snug">
                            Please confirm or adjust this value before continuing.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}

            {/* Add area button */}
            {areas.length < 5 && (
              <button onClick={addArea}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-forest/20 text-sm font-medium text-forest/50 hover:border-forest/40 hover:text-forest/70 transition-all">
                <Plus className="w-4 h-4" />
                Add another garden area
              </button>
            )}

            <div className="pt-2">
              <button onClick={() => setStep(3)} data-testid="btn-next-step"
                className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Garden Goal ──────────────────────────────────────── */}
        {step === 3 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Header */}
            <div>
              <p className="text-xs font-semibold text-forest/40 uppercase tracking-widest mb-1">Step 3 of 4</p>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-1">What's your garden goal?</h2>
              <p className="text-sm text-forest/60 leading-relaxed">
                SproutIt will recommend the right plants. You can add specific favourites below.
              </p>
            </div>

            {/* Goal cards */}
            <div className="grid grid-cols-2 gap-2.5">
              {GARDEN_GOALS.map(g => (
                <button
                  key={g.id}
                  onClick={() => {
                    setGardenGoal(g.id);
                    setPlantError(false);
                    if (g.id !== "custom") setSelectedPlantIds([]);
                  }}
                  className={`flex flex-col items-start gap-1.5 p-4 rounded-2xl border text-left transition-all ${
                    gardenGoal === g.id
                      ? "bg-forest text-cream border-forest"
                      : "bg-cream-light border-cream-dark text-forest"
                  }`}
                >
                  <span className="text-xl">{g.emoji}</span>
                  <p className="text-sm font-semibold leading-tight">{g.label}</p>
                  <p className={`text-[11px] leading-snug ${gardenGoal === g.id ? "text-cream/70" : "text-forest/50"}`}>
                    {g.desc}
                  </p>
                </button>
              ))}
            </div>

            {/* Non-custom: recommendation preview */}
            {gardenGoal && gardenGoal !== "custom" && (() => {
              const primary  = areas[0]!;
              const preview  = computeGoalPreview(gardenGoal, primary.sunlight, primary.soilType, primary.lengthFt * primary.widthFt);
              return (
                <div>
                  <p className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-3">
                    SproutIt recommends
                  </p>
                  {preview.length > 0 ? (
                    <>
                      <div className="flex flex-wrap gap-2 mb-2.5">
                        {preview.map(p => (
                          <span key={p.id} className="inline-flex items-center gap-1 bg-forest/8 border border-forest/12 rounded-full px-3 py-1.5 text-xs font-medium text-forest">
                            {p.emoji} {p.name}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-forest/50">
                        {preview.length} plant{preview.length !== 1 ? "s" : ""} suited to your {primary.sunlight.toLowerCase()} {primary.soilType.toLowerCase()} garden — final selection may vary based on space.
                      </p>
                    </>
                  ) : (
                    <div className="bg-gold/10 border border-gold/25 rounded-xl px-3 py-2.5">
                      <p className="text-xs text-forest/65">
                        No plants from this goal suit your current conditions. Try a different goal or choose Custom selection to pick manually.
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Non-custom: optional "Add specific plants" accordion */}
            {gardenGoal && gardenGoal !== "custom" && (
              <div className="border-t border-cream-dark">
                <button
                  onClick={() => setShowAddPlants(v => !v)}
                  className="flex items-center justify-between w-full py-3.5 text-sm font-semibold text-forest"
                >
                  <span>Add specific plants (optional)</span>
                  {showAddPlants ? <ChevronUp className="w-4 h-4 text-forest/40" /> : <ChevronDown className="w-4 h-4 text-forest/40" />}
                </button>
                {showAddPlants && (
                  <div className="flex flex-col gap-4 pb-2">
                    <p className="text-xs text-forest/55 leading-snug">
                      These will be added on top of SproutIt's recommendations. Plants that don't suit your conditions will be noted in your plan.
                    </p>
                    <div className="flex gap-1 bg-cream-dark/60 rounded-xl p-1">
                      {(["all", "vegetables", "herbs", "flowers", "foliage"] as PlantFilter[]).map(f => (
                        <button key={f} onClick={() => setPlantFilter(f)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                            plantFilter === f ? "bg-white text-forest shadow-sm" : "text-forest/50 hover:text-forest/70"
                          }`}>
                          {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                    {(plantFilter === "all" || plantFilter === "vegetables") && (
                      <PlantSection title="Vegetables" emoji="🥕" plants={VEGETABLES}
                        selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                        onToggleAll={makeToggleAll(VEGETABLES.map(p => p.id))}
                        onRecommend={() => recommendForCategory(VEGETABLES, "vegetables")}
                        recommendNote={recommendNotes["vegetables"]} />
                    )}
                    {(plantFilter === "all" || plantFilter === "herbs") && (
                      <PlantSection title="Herbs" emoji="🌿" plants={HERBS}
                        selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                        onToggleAll={makeToggleAll(HERBS.map(p => p.id))}
                        onRecommend={() => recommendForCategory(HERBS, "herbs")}
                        recommendNote={recommendNotes["herbs"]} />
                    )}
                    {(plantFilter === "all" || plantFilter === "flowers") && (
                      <PlantSection title="Flowers" emoji="🌸" plants={FLOWERS}
                        selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                        onToggleAll={makeToggleAll(FLOWERS.map(p => p.id))}
                        onRecommend={() => recommendForCategory(FLOWERS, "flowers")}
                        recommendNote={recommendNotes["flowers"]} />
                    )}
                    {(plantFilter === "all" || plantFilter === "foliage") && (
                      <PlantSection title="Foliage & Ornamental" emoji="🌿" plants={FOLIAGE}
                        selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                        onToggleAll={makeToggleAll(FOLIAGE.map(p => p.id))}
                        onRecommend={() => recommendForCategory(FOLIAGE, "foliage")}
                        recommendNote={recommendNotes["foliage"]} />
                    )}
                    {selectedPlantIds.length > 0 && (
                      <p className="text-xs text-forest/50">
                        {selectedPlantIds.length} plant{selectedPlantIds.length !== 1 ? "s" : ""} added to recommendations.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Custom selection: full plant picker */}
            {gardenGoal === "custom" && (() => {
              const q = plantSearch.trim().toLowerCase();
              const isSearching = q.length > 0;
              const matches = (p: PlantItem, categoryAliases: string[]) => {
                if (!isSearching) return true;
                if (p.name.toLowerCase().includes(q)) return true;
                if (p.type.toLowerCase().includes(q)) return true;
                return categoryAliases.some(a => a.toLowerCase().includes(q));
              };
              const vegFiltered     = VEGETABLES.filter(p => matches(p, ["vegetable", "vegetables", "veggies"]));
              const herbFiltered    = HERBS.filter(p => matches(p, ["herb", "herbs"]));
              const flowerFiltered  = FLOWERS.filter(p => matches(p, ["flower", "flowers", "blooms"]));
              const foliageFiltered = FOLIAGE.filter(p => matches(p, ["foliage", "ornamental", "ornamentals", "greenery", "shrub", "groundcover"]));
              const totalMatches = vegFiltered.length + herbFiltered.length + flowerFiltered.length + foliageFiltered.length;
              const showVeg     = (isSearching ? vegFiltered.length     > 0 : (plantFilter === "all" || plantFilter === "vegetables"));
              const showHerb    = (isSearching ? herbFiltered.length    > 0 : (plantFilter === "all" || plantFilter === "herbs"));
              const showFlower  = (isSearching ? flowerFiltered.length  > 0 : (plantFilter === "all" || plantFilter === "flowers"));
              const showFoliage = (isSearching ? foliageFiltered.length > 0 : (plantFilter === "all" || plantFilter === "foliage"));

              return (
              <div className="flex flex-col gap-4">
                <div className="flex gap-1 bg-cream-dark/60 rounded-xl p-1">
                  {(["all", "vegetables", "herbs", "flowers", "foliage"] as PlantFilter[]).map(f => (
                    <button key={f} onClick={() => setPlantFilter(f)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        plantFilter === f ? "bg-white text-forest shadow-sm" : "text-forest/50 hover:text-forest/70"
                      }`}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                {/* ── Search box (Custom selection only) ── */}
                <div className="relative w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-forest/40 pointer-events-none" />
                  <input
                    type="text"
                    inputMode="search"
                    value={plantSearch}
                    onChange={e => setPlantSearch(e.target.value)}
                    placeholder="Search plants…"
                    aria-label="Search plants"
                    className="w-full bg-[#f0ece4] border border-cream-dark/60 rounded-full pl-11 pr-11 py-2.5 text-sm text-forest placeholder:text-forest/40 focus:outline-none focus:border-[#1f3b2f] focus:ring-2 focus:ring-[#1f3b2f]/15 transition-all"
                    data-testid="plant-search-input"
                  />
                  {plantSearch && (
                    <button
                      type="button"
                      onClick={() => setPlantSearch("")}
                      aria-label="Clear search"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-forest/10 text-forest/70 hover:bg-forest/20 active:scale-95 transition-all"
                      data-testid="plant-search-clear"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {showVeg && (
                  <PlantSection title="Vegetables" emoji="🥕" plants={vegFiltered}
                    selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                    onToggleAll={makeToggleAll(VEGETABLES.map(p => p.id))}
                    onRecommend={() => recommendForCategory(VEGETABLES, "vegetables")}
                    recommendNote={isSearching ? undefined : recommendNotes["vegetables"]} />
                )}
                {showHerb && (
                  <PlantSection title="Herbs" emoji="🌿" plants={herbFiltered}
                    selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                    onToggleAll={makeToggleAll(HERBS.map(p => p.id))}
                    onRecommend={() => recommendForCategory(HERBS, "herbs")}
                    recommendNote={isSearching ? undefined : recommendNotes["herbs"]} />
                )}
                {showFlower && (
                  <PlantSection title="Flowers" emoji="🌸" plants={flowerFiltered}
                    selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                    onToggleAll={makeToggleAll(FLOWERS.map(p => p.id))}
                    onRecommend={() => recommendForCategory(FLOWERS, "flowers")}
                    recommendNote={isSearching ? undefined : recommendNotes["flowers"]} />
                )}
                {showFoliage && (
                  <PlantSection title="Foliage & Ornamental" emoji="🌿" plants={foliageFiltered}
                    selectedPlantIds={selectedPlantIds} onToggle={togglePlant}
                    onToggleAll={makeToggleAll(FOLIAGE.map(p => p.id))}
                    onRecommend={() => recommendForCategory(FOLIAGE, "foliage")}
                    recommendNote={isSearching ? undefined : recommendNotes["foliage"]} />
                )}
                {isSearching && totalMatches === 0 && (
                  <div className="bg-cream-light border border-cream-dark/60 rounded-2xl px-4 py-6 text-center">
                    <p className="text-sm text-forest/60">No plants match your search.</p>
                  </div>
                )}
                {plantError && totalSelected === 0 && (
                  <div className="bg-terracotta/10 border border-terracotta/25 rounded-xl px-4 py-3">
                    <p className="text-sm font-medium text-terracotta">Please select at least one plant to continue.</p>
                  </div>
                )}
              </div>
              );
            })()}

            {/* Custom plant entry — always visible */}
            <div className="border-t border-cream-dark pt-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-forest/40 uppercase tracking-widest">Add a custom plant</h3>
                {!showCustomForm && (
                  <button onClick={() => setShowCustomForm(true)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-forest border border-forest/20 px-3 py-1.5 rounded-full hover:bg-forest/5 transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </button>
                )}
              </div>
              {showCustomForm && (
                <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 mb-3 flex flex-col gap-3">
                  <input placeholder="Plant name..." value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40" />
                  <select value={customCategory} onChange={e => setCustomCategory(e.target.value as PlantType | "other")}
                    className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest focus:outline-none focus:border-forest/40">
                    <option value="vegetable">Vegetable</option>
                    <option value="herb">Herb</option>
                    <option value="flower">Flower</option>
                    <option value="foliage">Foliage & Ornamental</option>
                    <option value="other">Other</option>
                  </select>
                  <input placeholder="Notes (optional)..." value={customNotes}
                    onChange={e => setCustomNotes(e.target.value)}
                    className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40" />
                  <div className="flex gap-2">
                    <button onClick={addCustomPlant} disabled={!customName.trim()}
                      className="flex-1 bg-forest text-cream py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40">Add</button>
                    <button onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomNotes(""); }}
                      className="flex-1 border border-cream-dark text-forest/70 py-2.5 rounded-xl text-sm font-medium">Cancel</button>
                  </div>
                </div>
              )}
              {customPlants.map(cp => (
                <div key={cp.id} className="flex items-center gap-3 px-4 py-3 bg-cream-light border border-cream-dark rounded-2xl mb-2">
                  <span className="text-xl">🌱</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-forest">{cp.name}</p>
                    <p className="text-[10px] text-forest/50 capitalize">{cp.category}{cp.notes ? ` · ${cp.notes}` : ""}</p>
                  </div>
                  <button onClick={() => removeCustom(cp.id)} className="text-forest/30 hover:text-terracotta transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* No goal selected error */}
            {plantError && !gardenGoal && (
              <div className="bg-terracotta/10 border border-terracotta/25 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-terracotta">Please choose a garden goal to continue.</p>
              </div>
            )}

            {/* Custom selection: no plants picked */}
            {plantError && gardenGoal === "custom" && totalSelected === 0 && (
              <div className="bg-terracotta/10 border border-terracotta/25 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-terracotta">Select at least one plant, or choose a recommended garden goal.</p>
              </div>
            )}

            <div className="pt-2 pb-6">
              <button
                onClick={() => {
                  if (!gardenGoal) { setPlantError(true); return; }
                  if (gardenGoal === "custom" && totalSelected === 0) { setPlantError(true); return; }
                  setPlantError(false);
                  setStep(4);
                }}
                data-testid="btn-next-step"
                className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform">
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Set your alerts ────────────────────────────────────── */}
        {step === 4 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <p className="text-xs font-semibold text-forest/40 uppercase tracking-widest mb-1">
                Step 4 of 4
              </p>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-serif text-2xl font-semibold text-forest">
                  Set your alerts
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gold/20 text-forest border border-gold/30">
                  Coming soon
                </span>
              </div>
              <p className="text-sm text-forest/60 leading-relaxed">
                Preview your alert preferences — push notifications will be available in the next release.
              </p>
            </div>

            {/* Alert toggles */}
            <div className="flex flex-col divide-y divide-cream-dark/60 bg-cream-light border border-cream-dark rounded-2xl overflow-hidden">
              {[
                { label: "Frost Warnings",     desc: "Alerts when temps drop below 2°C",    on: alertFrost,    set: setAlertFrost },
                { label: "Hail Alerts",        desc: "Summer storm warnings for your area",  on: alertHail,     set: setAlertHail },
                { label: "Planting Reminders", desc: "Weekly tips based on your calendar",   on: alertPlanting, set: setAlertPlanting },
                { label: "Watering Days",      desc: "Optimal days based on rainfall",       on: alertWatering, set: setAlertWatering },
              ].map(({ label, desc, on, set }) => (
                <div key={label} className="flex items-center justify-between px-5 py-4 gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-forest">{label}</p>
                    <p className="text-xs text-forest/50 mt-0.5">{desc}</p>
                  </div>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => set(!on)}
                    className={`relative w-12 h-7 rounded-full shrink-0 transition-colors duration-200 focus:outline-none ${on ? "bg-forest" : "bg-forest/20"}`}
                  >
                    <span
                      className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-200"
                      style={{ left: on ? "calc(100% - 1.5rem)" : "0.25rem" }}
                    />
                  </button>
                </div>
              ))}
            </div>

            {/* Preferred notification time */}
            <div>
              <p className="text-sm font-semibold text-forest mb-3">Preferred notification time</p>
              <div className="bg-white border border-cream-dark rounded-2xl px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  {/* Hour */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button onClick={() => setNotifHour(h => h === 12 ? 1 : h + 1)}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-3xl font-semibold text-forest w-10 text-center tabular-nums">
                      {String(notifHour).padStart(2, "0")}
                    </span>
                    <button onClick={() => setNotifHour(h => h === 1 ? 12 : h - 1)}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-3xl font-semibold text-forest mb-0.5">:</span>

                  {/* Minute */}
                  <div className="flex flex-col items-center gap-1.5">
                    <button onClick={() => setNotifMinute(m => (m + 15) % 60)}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-3xl font-semibold text-forest w-10 text-center tabular-nums">
                      {String(notifMinute).padStart(2, "0")}
                    </span>
                    <button onClick={() => setNotifMinute(m => m === 0 ? 45 : m - 15)}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* AM/PM */}
                  <div className="flex flex-col items-center gap-1.5 ml-1">
                    <button onClick={() => setNotifAmPm(v => v === "AM" ? "PM" : "AM")}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <span className="text-2xl font-semibold text-forest w-10 text-center">
                      {notifAmPm}
                    </span>
                    <button onClick={() => setNotifAmPm(v => v === "AM" ? "PM" : "AM")}
                      className="text-forest/40 hover:text-forest transition-colors p-1">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 pb-6">
              <button onClick={handleSubmit} data-testid="btn-generate"
                className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform">
                Continue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

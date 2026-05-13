import { useState } from "react";
import { REGION_KEYS } from "@/data/locations";
import { VEGETABLES, HERBS, FLOWERS, type PlantItem } from "@/data/plants";
import type { GardenProfile, SunlightLevel, SoilType, UnitSystem, GardenArea, CustomPlant, PlantType } from "@/types/garden";
import { UNIT_CONFIG, capToMax, toInternalFt } from "@/utils/units";
import { ArrowLeft, ChevronDown, ChevronUp, Plus, Trash2, Check, X, Camera } from "lucide-react";
import PhotoAnalyzer, { ConfidenceBadge, type Confidence } from "@/components/PhotoAnalyzer";

interface QuestionnairePageProps {
  onNext: (profile: GardenProfile) => void;
  onBack: () => void;
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

const TOTAL_STEPS = 3;
const PRIMARY_ID   = "area-primary";

type PlantFilter = "all" | "vegetables" | "herbs" | "flowers";

// ---------------------------------------------------------------------------
// Plant-section sub-component
// ---------------------------------------------------------------------------

function PlantSection({
  title, emoji, plants, selectedPlantIds, onToggle, onToggleAll,
}: {
  title: string;
  emoji: string;
  plants: PlantItem[];
  selectedPlantIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: () => void;
}) {
  const allSelected  = plants.length > 0 && plants.every(p => selectedPlantIds.includes(p.id));
  const someSelected = plants.some(p => selectedPlantIds.includes(p.id));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-forest/40 uppercase tracking-widest">
          {emoji} {title}
        </h3>
        <button onClick={onToggleAll} className="text-xs text-forest font-semibold hover:underline">
          {allSelected ? "Deselect all" : someSelected ? "Select all" : "Select all"}
        </button>
      </div>
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

export default function QuestionnairePage({ onNext, onBack }: QuestionnairePageProps) {

  // ── Navigation ──────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);

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
  const [showPhotoFor, setShowPhotoFor] = useState<string | null>(null);

  // ── Step 3 ───────────────────────────────────────────────────────────────
  const [selectedPlantIds, setSelectedPlantIds] = useState<string[]>([]);
  const [customPlants,     setCustomPlants]     = useState<CustomPlant[]>([]);
  const [showCustomForm,   setShowCustomForm]   = useState(false);
  const [customName,       setCustomName]       = useState("");
  const [customCategory,   setCustomCategory]   = useState<PlantType | "other">("vegetable");
  const [customNotes,      setCustomNotes]      = useState("");
  const [plantFilter,      setPlantFilter]      = useState<PlantFilter>("all");
  const [plantError,       setPlantError]       = useState(false);

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
    if (showPhotoFor === id) setShowPhotoFor(null);
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
    setShowPhotoFor(null);
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
    if (totalSelected === 0) {
      setPlantError(true);
      return;
    }
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
            {[1, 2, 3].map(i => (
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
                Step 1 of 3
              </p>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-1">
                Where is your garden?
              </h2>
              <p className="text-sm text-forest/60 leading-relaxed">
                We use your location to set frost dates and climate-matched growing advice.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {REGION_KEYS.map(key => (
                <button key={key} onClick={() => setRegion(key)}
                  className={`flex flex-col items-start p-4 rounded-2xl border transition-all ${
                    region === key
                      ? "bg-forest border-forest text-cream"
                      : "bg-cream-light border-cream-dark text-forest"
                  }`}>
                  <span className="font-semibold text-sm leading-tight">
                    {REGION_LABELS[key] ?? key}
                  </span>
                </button>
              ))}
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
                Step 2 of 3
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
                  <div>
                    <button
                      onClick={() => setShowPhotoFor(showPhotoFor === area.id ? null : area.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-forest/25 text-xs font-medium text-forest/55 hover:border-forest/40 hover:text-forest/75 transition-all bg-cream"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {showPhotoFor === area.id ? "Close photo scanner" : "Scan a photo to auto-detect sunlight & soil"}
                    </button>
                    {showPhotoFor === area.id && (
                      <div className="mt-3 bg-forest/5 border border-forest/10 rounded-xl p-3">
                        <PhotoAnalyzer onResult={r => handlePhotoResult(area.id, r)} />
                      </div>
                    )}
                  </div>

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
                        Maximum {cfg.maxInput} {cfg.abbr} per dimension applied.
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
                      <div className="mt-2">
                        <ConfidenceBadge confidence={areaConfs[area.id]!.sunlight!} />
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
                      <div className="mt-2">
                        <ConfidenceBadge confidence={areaConfs[area.id]!.soil!} />
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

        {/* ── STEP 3: Plant Selection ────────────────────────────────────── */}
        {step === 3 && (
          <div className="px-6 py-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <p className="text-xs font-semibold text-forest/40 uppercase tracking-widest mb-1">
                Step 3 of 3
              </p>
              <h2 className="font-serif text-2xl font-semibold text-forest mb-1">
                Pick your plants
              </h2>
              <p className="text-sm text-forest/60 leading-relaxed">
                Select the plants you want to grow. Only your chosen plants will appear in your plan — you must pick at least one.
              </p>
            </div>

            {/* Category filter tabs */}
            <div className="flex gap-1 bg-cream-dark/60 rounded-xl p-1">
              {(["all", "vegetables", "herbs", "flowers"] as PlantFilter[]).map(f => (
                <button
                  key={f}
                  onClick={() => setPlantFilter(f)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                    plantFilter === f
                      ? "bg-white text-forest shadow-sm"
                      : "text-forest/50 hover:text-forest/70"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {(plantFilter === "all" || plantFilter === "vegetables") && (
              <PlantSection
                title="Vegetables" emoji="🥕"
                plants={VEGETABLES}
                selectedPlantIds={selectedPlantIds}
                onToggle={togglePlant}
                onToggleAll={makeToggleAll(VEGETABLES.map(p => p.id))}
              />
            )}
            {(plantFilter === "all" || plantFilter === "herbs") && (
              <PlantSection
                title="Herbs" emoji="🌿"
                plants={HERBS}
                selectedPlantIds={selectedPlantIds}
                onToggle={togglePlant}
                onToggleAll={makeToggleAll(HERBS.map(p => p.id))}
              />
            )}
            {(plantFilter === "all" || plantFilter === "flowers") && (
              <PlantSection
                title="Flowers" emoji="🌸"
                plants={FLOWERS}
                selectedPlantIds={selectedPlantIds}
                onToggle={togglePlant}
                onToggleAll={makeToggleAll(FLOWERS.map(p => p.id))}
              />
            )}

            {/* Custom plants */}
            {(plantFilter === "all") && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-forest/40 uppercase tracking-widest">
                    Custom Plants
                  </h3>
                  {!showCustomForm && (
                    <button onClick={() => setShowCustomForm(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-forest border border-forest/20 px-3 py-1.5 rounded-full hover:bg-forest/5 transition-colors">
                      <Plus className="w-3 h-3" /> Add custom plant
                    </button>
                  )}
                </div>

                <div className="bg-gold/10 border border-gold/25 rounded-xl px-3 py-2.5 mb-3">
                  <p className="text-xs text-forest/65 leading-snug">
                    Custom plants are not yet validated against Alberta growing conditions. Timing in the schedule will be approximate — verify planting windows for your specific variety.
                  </p>
                </div>

                {showCustomForm && (
                  <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 mb-3 flex flex-col gap-3">
                    <input
                      placeholder="Plant name..."
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40"
                    />
                    <select
                      value={customCategory}
                      onChange={e => setCustomCategory(e.target.value as PlantType | "other")}
                      className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest focus:outline-none focus:border-forest/40">
                      <option value="vegetable">Vegetable</option>
                      <option value="herb">Herb</option>
                      <option value="flower">Flower</option>
                      <option value="other">Other</option>
                    </select>
                    <input
                      placeholder="Notes (optional)..."
                      value={customNotes}
                      onChange={e => setCustomNotes(e.target.value)}
                      className="w-full bg-cream border border-cream-dark rounded-xl px-3 py-2.5 text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40"
                    />
                    <div className="flex gap-2">
                      <button onClick={addCustomPlant} disabled={!customName.trim()}
                        className="flex-1 bg-forest text-cream py-2.5 rounded-xl text-sm font-semibold disabled:opacity-40">
                        Add
                      </button>
                      <button
                        onClick={() => { setShowCustomForm(false); setCustomName(""); setCustomNotes(""); }}
                        className="flex-1 border border-cream-dark text-forest/70 py-2.5 rounded-xl text-sm font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {customPlants.map(cp => (
                  <div key={cp.id}
                    className="flex items-center gap-3 px-4 py-3 bg-cream-light border border-cream-dark rounded-2xl mb-2">
                    <span className="text-xl">🌱</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest">{cp.name}</p>
                      <p className="text-[10px] text-forest/50 capitalize">
                        {cp.category}{cp.notes ? ` · ${cp.notes}` : ""}
                      </p>
                    </div>
                    <button onClick={() => removeCustom(cp.id)}
                      className="text-forest/30 hover:text-terracotta transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {totalSelected > 0 && (
              <div className="bg-forest/5 border border-forest/10 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-forest">
                  {totalSelected} plant{totalSelected !== 1 ? "s" : ""} selected
                </p>
              </div>
            )}

            {plantError && (
              <div className="bg-terracotta/10 border border-terracotta/25 rounded-xl px-4 py-3">
                <p className="text-sm font-medium text-terracotta">
                  Please select at least one plant to continue.
                </p>
              </div>
            )}

            <div className="pt-2 pb-6">
              <button onClick={handleSubmit} data-testid="btn-generate"
                className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base active:scale-[0.97] transition-transform">
                Generate My Plan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

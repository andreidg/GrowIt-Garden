import { useState, useMemo } from "react";
import type { GeneratedPlan, MapCell } from "@/types/garden";
import { displayDimension } from "@/utils/units";
import GardenGrid from "@/components/GardenGrid";
import WeeklySchedule from "@/components/WeeklySchedule";
import PlantLegend from "@/components/PlantLegend";
import BottomNav, { type PlanTab } from "@/components/BottomNav";
import { Download, Share2, RotateCcw, AlertTriangle, MapPin, Calendar, Info, Sparkles, Cpu, Wand2, Pencil, X, Search, RefreshCw } from "lucide-react";
import WeatherRiskCard from "@/components/WeatherRiskCard";
import WeatherStrip from "@/components/WeatherStrip";
import PlantTimeline from "@/components/PlantTimeline";
import { useWeatherRisk } from "@/hooks/useWeatherRisk";
import { useForecast } from "@/hooks/useForecast";
import { generatePlan } from "@/data/plan-generator";
import { ALL_PLANTS } from "@/data/plants";
import { savePlan } from "@/data/storage";

interface PlanPageProps {
  plan: GeneratedPlan;
  onStartOver: () => void;
}

export default function PlanPage({ plan, onStartOver }: PlanPageProps) {
  const [activeTab, setActiveTab] = useState<PlanTab>("map");
  const [copied, setCopied]       = useState(false);

  // Local plan state — updated when user edits plants
  const [localPlan, setLocalPlan]       = useState(plan);
  const [editingPlants, setEditingPlants] = useState(false);
  const [editPlantIds, setEditPlantIds]   = useState<string[]>([]);
  const [editSearch, setEditSearch]       = useState("");
  const [editSaving, setEditSaving]       = useState(false);

  const { profile, region, conflicts, selectedPlants, grid, schedule,
          timingExplanation, companionNotes, cautionNotes } = localPlan;

  const { data: weatherData, loading: weatherLoading, error: weatherError } =
    useWeatherRisk(region.label);

  const { days: forecastDays, loading: forecastLoading, error: forecastError } =
    useForecast(region.label);

  const fmt = (ft: number) => displayDimension(ft, profile.unitPreference);

  const multiArea     = localPlan.areaPlans && localPlan.areaPlans.length > 1;
  const gardenSizeStr = multiArea
    ? `${localPlan.areaPlans.length} areas`
    : `${fmt(profile.lengthFt)} × ${fmt(profile.widthFt)}`;

  const hasConflicts  = conflicts.length > 0;
  const flowerCount   = selectedPlants.filter(p => p.type === "flower").length;
  const highRiskCount = selectedPlants.filter(p => p.riskLevel === "high").length;

  // ── Edit plants ─────────────────────────────────────────────────────────
  const openEditPlants = () => {
    setEditPlantIds(localPlan.selectedPlants.map(p => p.id));
    setEditSearch("");
    setEditingPlants(true);
  };

  const toggleEditPlant = (id: string) =>
    setEditPlantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleRegeneratePlants = () => {
    if (editPlantIds.length === 0) return;
    setEditSaving(true);
    const updatedProfile = { ...localPlan.profile, gardenGoal: "custom", selectedPlantIds: editPlantIds };
    const newPlan = generatePlan(updatedProfile, localPlan.region);
    setLocalPlan(newPlan);
    savePlan(newPlan);
    setEditingPlants(false);
    setEditSaving(false);
  };

  const filteredAddPlants = useMemo(() => {
    const q = editSearch.toLowerCase();
    return ALL_PLANTS.filter(p => !editPlantIds.includes(p.id) && (q === "" || p.name.toLowerCase().includes(q)));
  }, [editSearch, editPlantIds]);


  // ── Get the current grid to render ──────────────────────────────────────
  const getGrid = (_areaId: string, fallback: MapCell[][]): MapCell[][] => fallback;

  // ── Download plan as Markdown ────────────────────────────────────────────
  const downloadPlan = () => {
    const areaLines = (plan.areaPlans?.length
      ? plan.areaPlans.map(ap =>
          `- **${ap.area.name}** — ${fmt(ap.area.lengthFt)} × ${fmt(ap.area.widthFt)} · ${ap.area.sunlight} · ${ap.area.soilType}`)
      : [`- **My Garden** — ${fmt(profile.lengthFt)} × ${fmt(profile.widthFt)} · ${profile.sunlight} · ${profile.soilType}`]
    );

    const scheduleLines = schedule
      .filter(w => w.hasActions)
      .slice(0, 16)
      .flatMap(w => [
        `### ${w.weekLabel}`,
        ...w.actions.map(a =>
          `- ${a.description}${a.timingNote ? ` — ${a.timingNote}` : ""}`),
        "",
      ]);

    const lines = [
      `# My GrowIt Garden Plan`,
      ``,
      `**Region:** ${region.label}, Alberta (Zone ${region.zone})`,
      `**Last spring frost:** ${region.lastSpringFrost}`,
      `**First fall frost:** ${region.firstFallFrost}`,
      ``,
      `## Garden Areas`,
      ...areaLines,
      ``,
      `## Plants (${selectedPlants.length})`,
      ...selectedPlants.map(p => `- ${p.emoji} **${p.name}** (${p.type})`),
      ``,
      `## Weekly Schedule`,
      ...scheduleLines,
      `## Notes`,
      ...(cautionNotes.length > 0
        ? cautionNotes.map(n => `- ${n}`)
        : ["No caution notes."]),
      ``,
      `---`,
      `Generated by GrowIt`,
    ];

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `growit-plan-${region.label.toLowerCase().replace(/\s+/g, "-")}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ── Share plan via Web Share API or clipboard ────────────────────────────
  const sharePlan = async () => {
    const title = "My GrowIt Garden Plan";
    const text = [
      `My GrowIt garden plan for ${region.label} (Zone ${region.zone}):`,
      ``,
      `🌱 ${selectedPlants.length} plants:`,
      ...selectedPlants.slice(0, 8).map(p => `  • ${p.emoji} ${p.name}`),
      selectedPlants.length > 8 ? `  • …and ${selectedPlants.length - 8} more` : "",
      ``,
      `❄️ Season: ${region.lastSpringFrost} – ${region.firstFallFrost}`,
    ].filter(l => l !== undefined).join("\n");

    if (navigator.share) {
      try { await navigator.share({ title, text }); } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch { /* clipboard unavailable */ }
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col h-full bg-cream animate-in fade-in duration-500 overflow-hidden">

      {/* Clipboard copied toast */}
      {copied && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-forest text-cream px-4 py-2 rounded-xl text-sm font-medium shadow-lg animate-in fade-in z-50">
          Plan summary copied to clipboard
        </div>
      )}

      {/* ── Dashboard header ── */}
      <div className="px-6 pt-10 pb-4 bg-gradient-to-b from-cream-dark/30 to-cream shrink-0">
        <span className="text-xs font-medium uppercase tracking-wider text-forest/50 mb-1.5 block">
          Your Garden Plan
        </span>
        <h1 className="font-serif text-3xl font-semibold text-forest mb-3">
          {region.label}
        </h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-forest text-cream px-3 py-1 rounded-full text-xs font-semibold">
            <MapPin className="w-3 h-3" />
            Zone {region.zone}
          </div>
          <div className="bg-cream-light border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest">
            {gardenSizeStr}
          </div>
          <div className="bg-cream-light border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest">
            {selectedPlants.length} plants
          </div>
          <div className="bg-cream-light border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest flex items-center gap-1.5">
            <span>❄️</span>
            <span>{region.lastSpringFrost} – {region.firstFallFrost}</span>
          </div>
          {flowerCount > 0 && (
            <div className="bg-gold/20 border border-gold/30 px-3 py-1 rounded-full text-xs font-medium text-forest">
              {flowerCount} flower{flowerCount > 1 ? "s" : ""}
            </div>
          )}
          {localPlan.generationMode === "ai" ? (
            <div
              className="flex items-center gap-1 bg-forest text-cream border border-forest/20 px-3 py-1 rounded-full text-xs font-semibold"
              title="Plant selection and growing advice generated by AI">
              <Sparkles className="w-3 h-3" />
              AI-Enhanced
            </div>
          ) : localPlan.fallbackReason ? (
            <div
              className="flex items-center gap-1 bg-cream-dark border border-cream-dark px-3 py-1 rounded-full text-xs font-medium text-forest/60"
              title={localPlan.fallbackReason}>
              <Cpu className="w-3 h-3" />
              Classic Plan
            </div>
          ) : null}

          {/* Action buttons */}
          <div className="ml-auto flex gap-2">
            <button
              onClick={downloadPlan}
              className="w-9 h-9 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
              data-testid="btn-download"
              aria-label="Download Plan"
              title="Download Plan">
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={sharePlan}
              className="w-9 h-9 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
              data-testid="btn-share"
              aria-label="Share Plan"
              title="Share Plan">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onStartOver}
              className="w-9 h-9 rounded-full bg-cream-light border border-cream-dark flex items-center justify-center text-forest hover:bg-cream-dark transition-colors"
              data-testid="btn-start-over"
              aria-label="Start Over">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-y-auto hide-scrollbar w-full">

        {/* ── MAP TAB ── */}
        <div className={`${activeTab === "map" ? "block" : "hidden"} px-6 py-6 space-y-5 pb-8`}>

          {/* Growing season card */}
          {timingExplanation && (
            <div className="bg-forest/5 border border-forest/10 rounded-2xl p-4 flex gap-3">
              <Calendar className="w-5 h-5 text-forest/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-forest/50 uppercase tracking-wider mb-1">
                  Growing Season
                </p>
                <p className="text-sm text-forest/80 leading-relaxed">{timingExplanation}</p>
              </div>
            </div>
          )}

          {/* Weather risk */}
          <WeatherRiskCard
            loading={weatherLoading}
            error={weatherError}
            data={weatherData}
          />

          {/* Companion conflicts */}
          {hasConflicts && (
            <div className="bg-terracotta/10 border border-terracotta/20 p-4 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-terracotta text-sm mb-1">Companion Planting Notice</h4>
                <p className="text-xs text-terracotta/80 leading-relaxed">
                  Adjacent plants with conflicts: {conflicts.join(", ")}. Cells marked ⚠️ are next to an incompatible neighbour.
                </p>
              </div>
            </div>
          )}


          {/* Garden map(s) */}
          {multiArea ? (
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest mb-4">
                Your Garden Maps
              </h2>
              {localPlan.areaPlans.map(ap => (
                <div key={ap.area.id} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <h3 className="font-semibold text-base text-forest">{ap.area.name}</h3>
                    <span className="text-xs text-forest/50 bg-cream-dark/50 px-2 py-0.5 rounded-full">
                      {fmt(ap.area.lengthFt)} × {fmt(ap.area.widthFt)} · {ap.area.sunlight}
                    </span>
                  </div>
                  {ap.selectedPlants.length > 0 ? (
                    <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                      <GardenGrid
                        grid={getGrid(ap.area.id, ap.grid)}
                        lengthFt={ap.area.lengthFt}
                        widthFt={ap.area.widthFt}
                        unitPreference={profile.unitPreference}
                      />
                    </div>
                  ) : (
                    <div className="bg-cream-dark/30 rounded-2xl p-4 text-center text-sm text-forest/50">
                      No compatible plants for this area's light conditions.
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-xl font-semibold text-forest mb-4">
                Your Garden Map
              </h2>
              <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
                <GardenGrid
                  grid={getGrid("primary", grid)}
                  lengthFt={profile.lengthFt}
                  widthFt={profile.widthFt}
                  unitPreference={profile.unitPreference}
                />
              </div>
            </div>
          )}


          {/* Caution notes */}
          {cautionNotes && cautionNotes.length > 0 && (
            <div className="bg-gold/10 border border-gold/25 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-4 h-4 text-forest/60 shrink-0" />
                <p className="text-xs font-semibold text-forest/60 uppercase tracking-wider">
                  Notes & Caveats
                </p>
                {highRiskCount > 0 && (
                  <span className="ml-auto text-[10px] bg-terracotta/20 text-terracotta px-2 py-0.5 rounded-full font-medium">
                    {highRiskCount} high-risk plant{highRiskCount > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <ul className="space-y-2">
                {cautionNotes.map((note, i) => (
                  <li key={i} className="text-sm text-forest/75 leading-relaxed">{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ── SCHEDULE TAB ── */}
        <div className={`${activeTab === "schedule" ? "block" : "hidden"} print:!block px-6 py-6 pb-8`}>
          <h2 className="font-serif text-xl font-semibold text-forest mb-1">
            Weekly Schedule
          </h2>
          <p className="text-sm text-forest/50 mb-5">
            {region.lastSpringFrost} last spring frost · {region.firstFallFrost} first fall frost
          </p>
          <WeatherStrip days={forecastDays} loading={forecastLoading} error={forecastError} />
          <WeeklySchedule weeks={schedule} />
        </div>

        {/* ── PLANTS TAB ── */}
        <div className={`${activeTab === "plants" ? "block" : "hidden"} print:!block px-6 py-6 pb-8 space-y-6`}>
          {/* PlantTimeline hidden until bar data is fixed */}
          {/* <PlantTimeline plants={selectedPlants} schedule={schedule} /> */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-xl font-semibold text-forest">Your Plants</h2>
              <button
                onClick={openEditPlants}
                className="flex items-center gap-1.5 text-xs font-semibold text-forest border border-forest/20 px-3 py-1.5 rounded-full hover:bg-forest/5 transition-colors"
                data-testid="btn-edit-plants"
              >
                <Pencil className="w-3 h-3" /> Edit
              </button>
            </div>
            <p className="text-sm text-forest/50 mb-4">Tap any plant to see more details.</p>
            <PlantLegend plants={selectedPlants} />
          </div>

          {companionNotes && companionNotes.length > 0 && (
            <div className="bg-forest/5 border border-forest/10 rounded-2xl p-4">
              <p className="text-xs font-semibold text-forest/50 uppercase tracking-wider mb-3">
                Companion & Pollinator Notes
              </p>
              <ul className="space-y-3">
                {companionNotes.map((note, i) => (
                  <li key={i} className="text-sm text-forest/80 leading-relaxed">{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Edit Plants overlay ────────────────────────────────────────────── */}
      {editingPlants && (
        <div className="absolute inset-0 z-50 flex flex-col bg-cream animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="px-6 pt-10 pb-4 border-b border-cream-dark/60 shrink-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-serif text-xl font-semibold text-forest">Edit your plants</h2>
              <button onClick={() => setEditingPlants(false)}
                className="p-2 text-forest/50 hover:text-forest rounded-full hover:bg-cream-dark/50 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-forest/55">
              Remove plants or add new ones, then tap Regenerate to update your plan.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto hide-scrollbar px-6 py-5 space-y-6">
            {/* Current plants */}
            <div>
              <p className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-3">
                Current plants ({editPlantIds.length})
              </p>
              {editPlantIds.length === 0 ? (
                <p className="text-sm text-forest/40 italic">No plants selected — add some below.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {editPlantIds.map(id => {
                    const plant = ALL_PLANTS.find(p => p.id === id);
                    if (!plant) return null;
                    return (
                      <div key={id} className="flex items-center gap-3 px-4 py-3 bg-cream-light border border-cream-dark rounded-2xl">
                        <span className="text-xl">{plant.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-forest">{plant.name}</p>
                          <p className="text-[10px] text-forest/50 capitalize">{plant.type}</p>
                        </div>
                        <button onClick={() => toggleEditPlant(id)}
                          className="text-forest/30 hover:text-terracotta transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add more plants */}
            <div>
              <p className="text-xs font-bold text-forest/40 uppercase tracking-widest mb-3">
                Add plants
              </p>
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-forest/35 pointer-events-none" />
                <input
                  value={editSearch}
                  onChange={e => setEditSearch(e.target.value)}
                  placeholder="Search plants…"
                  className="w-full pl-10 pr-4 py-2.5 bg-cream border border-cream-dark rounded-xl text-sm text-forest placeholder:text-forest/30 focus:outline-none focus:border-forest/40"
                />
              </div>
              <div className="flex flex-col gap-2">
                {filteredAddPlants.slice(0, 30).map(plant => (
                  <button key={plant.id} onClick={() => toggleEditPlant(plant.id)}
                    className="flex items-center gap-3 px-4 py-3 bg-cream-light border border-cream-dark rounded-2xl text-left hover:border-forest/30 transition-colors">
                    <span className="text-xl">{plant.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-forest">{plant.name}</p>
                      <p className="text-[10px] text-forest/50 capitalize">{plant.type}</p>
                    </div>
                    <span className="text-xs font-semibold text-forest/40 border border-forest/15 px-2 py-0.5 rounded-full">+ Add</span>
                  </button>
                ))}
                {filteredAddPlants.length === 0 && (
                  <p className="text-sm text-forest/40 italic">No more plants match your search.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer — regenerate */}
          <div className="px-6 pt-4 pb-8 border-t border-cream-dark/60 shrink-0">
            {editPlantIds.length === 0 && (
              <p className="text-xs text-terracotta text-center mb-3">Add at least one plant to regenerate.</p>
            )}
            <button
              onClick={handleRegeneratePlants}
              disabled={editPlantIds.length === 0 || editSaving}
              className="w-full bg-forest text-cream py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 disabled:opacity-40 active:scale-[0.97] transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${editSaving ? "animate-spin" : ""}`} />
              {editSaving ? "Regenerating…" : "Regenerate Plan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

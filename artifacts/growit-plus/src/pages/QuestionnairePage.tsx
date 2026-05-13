import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { GROWING_REGIONS, REGION_KEYS } from "@/data/locations";
import type { GardenProfile, UnitSystem } from "@/types/garden";
import { UNIT_CONFIG, capToMax, toInternalFt } from "@/utils/units";
import { ChevronLeft, MapPin, Sun, CloudSun, Cloud } from "lucide-react";

const formSchema = z.object({
  region:          z.string().min(1, "Please select a region"),
  lengthFt:        z.coerce.number().min(1).max(20),
  widthFt:         z.coerce.number().min(1).max(20),
  sunlight:        z.enum(["Full Sun", "Partial Shade", "Full Shade"]),
  soilType:        z.enum(["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"]),
  plantPreference: z.enum(["Vegetables Only", "Vegetables + Herbs", "Vegetables + Herbs + Flowers"]),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionnairePageProps {
  onNext: (profile: GardenProfile) => void;
  onBack: () => void;
}

export default function QuestionnairePage({ onNext, onBack }: QuestionnairePageProps) {
  const [unit, setUnit] = useState<UnitSystem>("imperial");
  const [dimensionCapped, setDimensionCapped] = useState(false);
  const cfg = UNIT_CONFIG[unit];

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region:          "Calgary",
      lengthFt:        10,
      widthFt:         8,
      sunlight:        "Full Sun",
      soilType:        "Raised Bed",
      plantPreference: "Vegetables + Herbs + Flowers",
    },
  });

  const onSubmit = (values: FormValues) => {
    const lengthFt = toInternalFt(values.lengthFt, unit);
    const widthFt  = toInternalFt(values.widthFt,  unit);
    onNext({ ...values, lengthFt, widthFt, unitPreference: unit });
  };

  const handleDimensionChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "lengthFt" | "widthFt"
  ) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val <= 0) { form.setValue(field, "" as any); return; }
    const capped = capToMax(val, unit);
    if (capped < val) setDimensionCapped(true);
    form.setValue(field, capped);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-cream overflow-y-auto pb-safe">
      {/* Header / progress */}
      <div className="px-6 py-4 flex items-center border-b border-cream-dark sticky top-0 bg-cream z-10">
        <button
          className="p-2 -ml-2 text-forest/70 active:bg-cream-dark rounded-full"
          onClick={onBack}
          data-testid="btn-back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-forest" />
          <div className="w-2 h-2 rounded-full bg-forest/20" />
          <div className="w-2 h-2 rounded-full bg-forest/20" />
        </div>
        <div className="w-10" />
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="p-6 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300"
      >
        <div>
          <h2 className="text-2xl font-bold text-forest mb-1 font-serif">Tell us about your space</h2>
          <p className="text-forest/70 text-sm">We need a few details to generate your perfect garden plan.</p>
        </div>

        {/* ── Growing Region ── */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <div>
            <label className="text-base font-semibold text-forest">Growing Region</label>
            <p className="text-xs text-forest/60 mt-0.5">Your region sets frost dates and plant recommendations.</p>
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-forest/50" />
            <select
              {...form.register("region")}
              className="w-full h-12 bg-white border border-cream-dark rounded-xl pl-10 pr-4 text-forest font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-forest/20"
              data-testid="select-region"
            >
              {REGION_KEYS.map(key => (
                <option key={key} value={key}>{GROWING_REGIONS[key].label}, {GROWING_REGIONS[key].province}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Garden Size ── */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-forest">Garden Size</label>
            {/* Unit toggle */}
            <div className="flex bg-cream-dark rounded-full p-0.5">
              {(["imperial", "metric"] as UnitSystem[]).map(sys => (
                <button
                  key={sys}
                  type="button"
                  onClick={() => { setUnit(sys); setDimensionCapped(false); }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    unit === sys ? "bg-forest text-cream shadow-sm" : "text-forest/60"
                  }`}
                  data-testid={`unit-${UNIT_CONFIG[sys].abbr}`}
                >
                  {UNIT_CONFIG[sys].abbr}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {(["lengthFt", "widthFt"] as const).map(field => (
              <div key={field} className="flex flex-col gap-1">
                <span className="text-xs text-forest/70 font-medium ml-1">
                  {field === "lengthFt" ? "Length" : "Width"} ({cfg.label})
                </span>
                <input
                  type="number"
                  step="any"
                  min="1"
                  className="h-12 bg-white border border-cream-dark rounded-xl px-4 text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                  placeholder={String(cfg.maxInput)}
                  {...form.register(field)}
                  onChange={e => handleDimensionChange(e, field)}
                  data-testid={field === "lengthFt" ? "input-length" : "input-width"}
                />
              </div>
            ))}
          </div>

          {dimensionCapped && (
            <p
              data-testid="text-dimension-cap-notice"
              className="text-sm text-terracotta font-medium mt-1 bg-terracotta/10 p-3 rounded-xl border border-terracotta/20"
            >
              GrowIt+ supports gardens up to {cfg.capDisplay}. Your dimensions have been adjusted.
            </p>
          )}
        </div>

        {/* ── Sunlight ── */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">Sunlight Exposure</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Full Sun",      icon: Sun,      label: "Full Sun"      },
              { id: "Partial Shade", icon: CloudSun, label: "Partial Shade" },
              { id: "Full Shade",    icon: Cloud,    label: "Full Shade"    },
            ].map(({ id, icon: Icon, label }) => {
              const active = form.watch("sunlight") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => form.setValue("sunlight", id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors h-24 ${
                    active ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest/70"
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${active ? "text-gold" : "text-forest/50"}`} />
                  <span className="text-xs text-center font-medium leading-tight">{label}</span>
                </button>
              );
            })}
          </div>
          {form.watch("sunlight") === "Full Shade" && (
            <p className="text-sm text-terracotta font-medium bg-terracotta/10 p-3 rounded-xl border border-terracotta/20">
              ⚠️ Full shade significantly limits food-growing potential. Only shade-tolerant greens and herbs can be recommended.
            </p>
          )}
        </div>

        {/* ── Soil Setup ── */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">Soil Setup</label>
          <div className="grid grid-cols-2 gap-2">
            {(["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"] as const).map(soil => {
              const active = form.watch("soilType") === soil;
              return (
                <button
                  key={soil}
                  type="button"
                  onClick={() => form.setValue("soilType", soil)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border transition-colors ${
                    active ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest"
                  }`}
                >
                  {soil}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Plant Preference ── */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">What do you want to grow?</label>
          <div className="flex flex-col gap-2">
            {[
              { id: "Vegetables + Herbs + Flowers", label: "Veggies + Herbs + Flowers 🌸" },
              { id: "Vegetables + Herbs",           label: "Vegetables + Herbs 🌿"         },
              { id: "Vegetables Only",              label: "Vegetables Only 🥕"            },
            ].map(({ id, label }) => {
              const active = form.watch("plantPreference") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => form.setValue("plantPreference", id as any)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border transition-colors text-left ${
                    active ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-forest text-cream text-lg font-semibold h-14 rounded-full shadow-md transition-transform active:scale-95 mt-4"
          data-testid="btn-next-questionnaire"
        >
          Review Frost Dates
        </button>
      </form>
    </div>
  );
}

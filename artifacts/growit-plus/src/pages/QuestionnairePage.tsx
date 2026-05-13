import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { FROST_DATA } from "@/data/locations";
import { GardenSetup } from "@/data/plan-generator";
import { ChevronLeft, MapPin, Sun, CloudSun, Cloud } from "lucide-react";

const formSchema = z.object({
  region: z.string().min(1, "Please select a region"),
  lengthFt: z.coerce.number().min(1).max(20),
  widthFt: z.coerce.number().min(1).max(20),
  sunlight: z.enum(["Full Sun", "Partial Shade", "Full Shade"]),
  soilType: z.enum(["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"]),
  plantPreference: z.enum(["Vegetables Only", "Vegetables + Herbs", "Vegetables + Herbs + Flowers"]),
});

type FormValues = z.infer<typeof formSchema>;

interface QuestionnairePageProps {
  onNext: (data: GardenSetup) => void;
  onBack: () => void;
}

export default function QuestionnairePage({ onNext, onBack }: QuestionnairePageProps) {
  const [dimensionCapped, setDimensionCapped] = useState(false);
  const [unit, setUnit] = useState<"ft" | "m">("ft");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      region: "Calgary",
      lengthFt: 10,
      widthFt: 8,
      sunlight: "Full Sun",
      soilType: "Raised Bed",
      plantPreference: "Vegetables + Herbs + Flowers",
    },
  });

  const onSubmit = (values: FormValues) => {
    const lengthFt = unit === "m" ? Math.min(20, Math.round(values.lengthFt * 3.281)) : values.lengthFt;
    const widthFt  = unit === "m" ? Math.min(20, Math.round(values.widthFt  * 3.281)) : values.widthFt;
    onNext({ ...values, lengthFt, widthFt, unitPreference: unit });
  };

  const handleDimensionChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: "lengthFt" | "widthFt") => {
    let val = parseFloat(e.target.value);
    if (isNaN(val) || val <= 0) {
      form.setValue(fieldName, "" as any);
      return;
    }
    const maxInput = unit === "m" ? 6.1 : 20; // 6.1m ≈ 20ft
    if (val > maxInput) {
      val = maxInput;
      setDimensionCapped(true);
    }
    form.setValue(fieldName, val);
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-cream overflow-y-auto pb-safe">
      <div className="px-6 py-4 flex items-center border-b border-cream-dark sticky top-0 bg-cream z-10">
        <button className="p-2 -ml-2 text-forest/70 active:bg-cream-dark rounded-full" onClick={onBack} data-testid="btn-back">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1 flex justify-center gap-1">
          <div className="w-2 h-2 rounded-full bg-forest"></div>
          <div className="w-2 h-2 rounded-full bg-forest/20"></div>
          <div className="w-2 h-2 rounded-full bg-forest/20"></div>
        </div>
        <div className="w-10"></div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 flex flex-col gap-6 animate-in slide-in-from-right-4 duration-300">
        <div>
          <h2 className="text-2xl font-bold text-forest mb-1 font-serif">Tell us about your space</h2>
          <p className="text-forest/70 text-sm">We need a few details to generate your perfect garden plan.</p>
        </div>

        {/* Region */}
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
              {Object.keys(FROST_DATA).map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Garden Size */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-base font-semibold text-forest">Garden Size</label>
            <div className="flex bg-cream-dark rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setUnit("ft")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${unit === "ft" ? "bg-forest text-cream shadow-sm" : "text-forest/60"}`}
                data-testid="unit-ft"
              >ft</button>
              <button
                type="button"
                onClick={() => setUnit("m")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${unit === "m" ? "bg-forest text-cream shadow-sm" : "text-forest/60"}`}
                data-testid="unit-m"
              >m</button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-forest/70 font-medium ml-1">Length ({unit === "m" ? "metres" : "feet"})</span>
              <input
                type="number"
                step="any"
                min="1"
                className="h-12 bg-white border border-cream-dark rounded-xl px-4 text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                placeholder={unit === "m" ? "6" : "20"}
                {...form.register("lengthFt")}
                onChange={(e) => handleDimensionChange(e, "lengthFt")}
                data-testid="input-length"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-forest/70 font-medium ml-1">Width ({unit === "m" ? "metres" : "feet"})</span>
              <input
                type="number"
                step="any"
                min="1"
                className="h-12 bg-white border border-cream-dark rounded-xl px-4 text-forest font-medium focus:outline-none focus:ring-2 focus:ring-forest/20"
                placeholder={unit === "m" ? "6" : "20"}
                {...form.register("widthFt")}
                onChange={(e) => handleDimensionChange(e, "widthFt")}
                data-testid="input-width"
              />
            </div>
          </div>
          {dimensionCapped && (
            <p data-testid="text-dimension-cap-notice" className="text-sm text-terracotta font-medium mt-1 bg-terracotta/10 p-3 rounded-xl border border-terracotta/20">
              GrowIt+ supports gardens up to {unit === "m" ? "6m × 6m" : "20ft × 20ft"}. Your dimensions have been adjusted.
            </p>
          )}
        </div>

        {/* Sunlight */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">Sunlight Exposure</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "Full Sun", icon: Sun, label: "Full Sun" },
              { id: "Partial Shade", icon: CloudSun, label: "Partial Shade" },
              { id: "Full Shade", icon: Cloud, label: "Full Shade" },
            ].map(({ id, icon: Icon, label }) => {
              const isSelected = form.watch("sunlight") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => form.setValue("sunlight", id as any)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-colors h-24 ${
                    isSelected ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest/70"
                  }`}
                >
                  <Icon className={`w-8 h-8 mb-2 ${isSelected ? "text-gold" : "text-forest/50"}`} />
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

        {/* Soil Setup */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">Soil Setup</label>
          <div className="grid grid-cols-2 gap-2">
            {["Raised Bed", "In-Ground Clay", "In-Ground Loam", "Container/Pots"].map((soil) => {
              const isSelected = form.watch("soilType") === soil;
              return (
                <button
                  key={soil}
                  type="button"
                  onClick={() => form.setValue("soilType", soil as any)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium border transition-colors ${
                    isSelected ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest"
                  }`}
                >
                  {soil}
                </button>
              );
            })}
          </div>
        </div>

        {/* Plant Preference */}
        <div className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col gap-3">
          <label className="text-base font-semibold text-forest">What do you want to grow?</label>
          <div className="flex flex-col gap-2">
            {[
              { id: "Vegetables + Herbs + Flowers", label: "Veggie + Herbs + Flowers 🌸" },
              { id: "Vegetables + Herbs", label: "Vegetables + Herbs 🌿" },
              { id: "Vegetables Only", label: "Vegetables Only 🥕" },
            ].map(({ id, label }) => {
              const isSelected = form.watch("plantPreference") === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => form.setValue("plantPreference", id as any)}
                  className={`py-3 px-4 rounded-xl text-sm font-medium border transition-colors text-left ${
                    isSelected ? "bg-forest border-forest text-cream" : "bg-white border-cream-dark text-forest"
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
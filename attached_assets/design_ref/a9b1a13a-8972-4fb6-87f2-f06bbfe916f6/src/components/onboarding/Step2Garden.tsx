import React, { useState } from 'react';
import { Sun, CloudSun, Cloud, Camera } from 'lucide-react';
import { GardenPlotIcon } from '../illustrations/PlantIcons';
interface Step2Props {
  onNext: () => void;
}
export const Step2Garden: React.FC<Step2Props> = ({ onNext }) => {
  const [size, setSize] = useState<string | null>(null);
  const [sun, setSun] = useState<string | null>(null);
  const [plants, setPlants] = useState<string[]>([]);
  const plantOptions = [
  'Tomatoes',
  'Peppers',
  'Roses',
  'Perennials',
  'Annuals',
  'Vegetables',
  'Herbs'];

  const togglePlant = (plant: string) => {
    setPlants((prev) =>
    prev.includes(plant) ? prev.filter((p) => p !== plant) : [...prev, plant]
    );
  };
  return (
    <div className="flex flex-col h-full px-6 py-8 overflow-y-auto hide-scrollbar animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="font-serif text-3xl font-semibold text-forest mb-6">
        Tell us about your garden
      </h1>

      <button className="w-full border-2 border-dashed border-terracotta/50 rounded-2xl p-8 flex flex-col items-center justify-center bg-cream-light/50 hover:bg-cream-light transition-colors mb-6 group">
        <div className="bg-cream p-4 rounded-full mb-4 group-hover:scale-105 transition-transform">
          <Camera size={32} className="text-terracotta" />
        </div>
        <span className="font-medium text-forest mb-1">
          Upload a photo of your plot
        </span>
        <span className="text-sm text-forest/60">
          We'll analyze it automatically
        </span>
      </button>

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px bg-cream-dark flex-1"></div>
        <span className="text-sm text-forest/50 font-medium uppercase tracking-wider">
          or tell us yourself
        </span>
        <div className="h-px bg-cream-dark flex-1"></div>
      </div>

      <div className="space-y-8 mb-8">
        <div>
          <label className="block font-sans font-medium text-forest mb-3">
            Garden Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {['Small', 'Medium', 'Large'].map((s) =>
            <button
              key={s}
              onClick={() => setSize(s)}
              className={`py-2 px-1 rounded-xl border text-center text-sm font-medium transition-all ${size === s ? 'bg-forest text-cream border-forest' : 'bg-cream-light text-forest border-cream-dark'}`}>
              
                {s}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block font-sans font-medium text-forest mb-3">
            Sun Exposure
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
            {
              id: 'full',
              label: 'Full Sun',
              icon: Sun
            },
            {
              id: 'partial',
              label: 'Partial',
              icon: CloudSun
            },
            {
              id: 'shade',
              label: 'Shade',
              icon: Cloud
            }].
            map((s) =>
            <button
              key={s.id}
              onClick={() => setSun(s.id)}
              className={`py-3 px-1 rounded-xl border flex flex-col items-center gap-2 text-sm font-medium transition-all ${sun === s.id ? 'bg-forest text-cream border-forest' : 'bg-cream-light text-forest border-cream-dark'}`}>
              
                <s.icon size={20} />
                {s.label}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block font-sans font-medium text-forest mb-3">
            What are you growing?
          </label>
          <div className="flex flex-wrap gap-2">
            {plantOptions.map((plant) =>
            <button
              key={plant}
              onClick={() => togglePlant(plant)}
              className={`py-2 px-4 rounded-full border text-sm font-medium transition-all ${plants.includes(plant) ? 'bg-forest text-cream border-forest' : 'bg-cream-light text-forest border-cream-dark'}`}>
              
                {plant}
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-forest text-cream py-4 rounded-full font-semibold text-lg mt-auto">
        
        Continue
      </button>
    </div>);

};
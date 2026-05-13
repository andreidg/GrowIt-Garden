import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { BasilIcon } from '../illustrations/PlantIcons';
interface Step1Props {
  onNext: () => void;
}
export const Step1Location: React.FC<Step1Props> = ({ onNext }) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const zones = [
  'NW',
  'NE',
  'SW',
  'SE',
  'Centre',
  'Airdrie',
  'Cochrane',
  'Okotoks'];

  return (
    <div className="flex flex-col h-full px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-center mb-6">
        <BasilIcon size={48} />
      </div>

      <h1 className="font-serif text-4xl font-semibold text-forest mb-3 leading-tight">
        Let's protect your garden
      </h1>

      <p className="font-sans text-forest/80 text-lg mb-10">
        FrostSmart is built specifically for Calgary's unique climate.
      </p>

      <div className="flex-1">
        <label className="block font-sans font-medium text-forest mb-4">
          Where is your garden located?
        </label>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {zones.map((zone) =>
          <button
            key={zone}
            onClick={() => setSelectedZone(zone)}
            className={`py-3 px-4 rounded-xl border text-left font-medium transition-all ${selectedZone === zone ? 'bg-forest text-cream border-forest shadow-md' : 'bg-cream-light text-forest border-cream-dark hover:border-forest/30'}`}>
            
              {zone}
            </button>
          )}
        </div>

        <div className="bg-cream-dark/30 rounded-xl p-4">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="flex items-center justify-between w-full text-forest font-medium">
            
            Why does this matter?
            <ChevronDown
              size={20}
              className={`transition-transform ${showTooltip ? 'rotate-180' : ''}`} />
            
          </button>

          {showTooltip &&
          <p className="mt-3 text-sm text-forest/80 leading-relaxed animate-in fade-in slide-in-from-top-2">
              Calgary has distinct micro-climates. The NW often sees frost
              earlier than the inner city, and chinook winds affect areas
              differently. We use your location to give you hyper-local frost
              warnings.
            </p>
          }
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!selectedZone}
        className="w-full bg-forest text-cream py-4 rounded-full font-semibold text-lg mt-8 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity">
        
        Continue
      </button>
    </div>);

};
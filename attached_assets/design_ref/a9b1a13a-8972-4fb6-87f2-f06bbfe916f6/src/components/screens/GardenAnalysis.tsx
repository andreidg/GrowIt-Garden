import React from 'react';
import { ArrowLeft, Check, AlertTriangle } from 'lucide-react';
import {
  GardenPlotIcon,
  TomatoIcon,
  BasilIcon,
  DahliaIcon,
  KaleIcon,
  CarrotIcon } from
'../illustrations/PlantIcons';
import { Screen } from '../shared/BottomNav';
interface GardenAnalysisProps {
  onBack: (screen: Screen) => void;
  onPlantSelect: () => void;
}
export const GardenAnalysis: React.FC<GardenAnalysisProps> = ({
  onBack,
  onPlantSelect
}) => {
  return (
    <div className="h-full flex flex-col bg-cream animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 pt-12 pb-4 flex items-center gap-4 bg-cream z-10 relative">
        <button
          onClick={() => onBack('dashboard')}
          className="p-2 -ml-2 text-forest hover:bg-cream-dark/50 rounded-full transition-colors">
          
          <ArrowLeft size={24} />
        </button>
        <h1 className="font-serif text-2xl font-semibold text-forest">
          Garden Analysis
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {/* Hero Image Area */}
        <div className="relative w-full aspect-square max-h-[350px] bg-cream-dark/30 flex items-center justify-center overflow-hidden">
          <GardenPlotIcon size={280} className="opacity-80" />

          {/* Overlay Zones */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/3 bg-forest-light/30 rounded-3xl blur-md border-2 border-forest-light/50" />
          <div className="absolute bottom-1/4 right-1/4 w-1/3 h-1/4 bg-gold/30 rounded-full blur-md border-2 border-gold/50" />
          <div className="absolute top-1/3 right-1/4 w-1/4 h-1/2 bg-terracotta/20 rounded-2xl blur-md border-2 border-terracotta/40" />

          {/* Legend */}
          <div className="absolute bottom-4 left-4 right-4 bg-cream/90 backdrop-blur-sm p-3 rounded-xl flex justify-between items-center text-xs font-medium border border-cream-dark shadow-sm">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-forest-light/50 border border-forest-light" />{' '}
              Ideal
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gold/50 border border-gold" />{' '}
              Partial Sun
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terracotta/40 border border-terracotta" />{' '}
              Avoid
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-8">
          {/* Report Card */}
          <div className="bg-cream-dark/20 rounded-3xl p-6 border border-cream-dark">
            <h2 className="font-serif text-xl font-semibold text-forest mb-6">
              Your Garden Report
            </h2>

            <div className="mb-6">
              <div className="flex justify-between text-sm font-medium text-forest mb-2">
                <span>Sunlight Score</span>
                <span>7.2/10</span>
              </div>
              <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                <div className="h-full bg-gold w-[72%] rounded-full" />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm text-forest/70">Estimated zone:</span>
              <span className="px-3 py-1 bg-forest text-cream text-xs font-bold rounded-full">
                3b (Calgary NW)
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-forest mb-2">
                  <Check size={16} className="text-forest-light" /> Best for
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Vegetables', 'Hardy Perennials', 'Root Veg'].map((tag) =>
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-cream text-forest text-xs font-medium rounded-lg border border-cream-dark">
                    
                      {tag}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm font-medium text-terracotta-dark mb-2">
                  <AlertTriangle size={16} /> Avoid
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Tropicals', 'Zone 5+ species'].map((tag) =>
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-terracotta/10 text-terracotta-dark text-xs font-medium rounded-lg border border-terracotta/20">
                    
                      {tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div>
            <h2 className="font-serif text-xl font-semibold text-forest mb-4">
              Recommended for you
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
              {
                name: 'Tomato',
                icon: TomatoIcon,
                badge: 'Plant May 28',
                color: 'bg-gold/20 text-forest'
              },
              {
                name: 'Kale',
                icon: KaleIcon,
                badge: 'Frost Hardy',
                color: 'bg-frost/30 text-forest'
              },
              {
                name: 'Carrot',
                icon: CarrotIcon,
                badge: 'Plant now',
                color: 'bg-forest/10 text-forest'
              },
              {
                name: 'Basil',
                icon: BasilIcon,
                badge: 'Wait for Jun',
                color: 'bg-terracotta/10 text-terracotta-dark'
              }].
              map((plant, i) =>
              <button
                key={i}
                onClick={onPlantSelect}
                className="bg-cream-light border border-cream-dark rounded-2xl p-4 flex flex-col items-center text-center hover:border-forest/30 transition-colors">
                
                  <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mb-3">
                    <plant.icon size={32} />
                  </div>
                  <h3 className="font-serif font-semibold text-forest mb-2">
                    {plant.name}
                  </h3>
                  <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-md ${plant.color}`}>
                  
                    {plant.badge}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>);

};
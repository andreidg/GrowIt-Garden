import React from 'react';
import {
  FrostCrystalIcon,
  TomatoIcon,
  BasilIcon,
  DahliaIcon } from
'../illustrations/PlantIcons';
import { ChevronRight, MapPin, X } from 'lucide-react';
import { Screen } from '../shared/BottomNav';
interface FrostAlertProps {
  onClose: (screen: Screen) => void;
}
export const FrostAlert: React.FC<FrostAlertProps> = ({ onClose }) => {
  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-frost-light/40 to-cream animate-in slide-in-from-bottom-full duration-500 z-50 relative">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => onClose('dashboard')}
          className="p-2 bg-cream/50 rounded-full text-forest hover:bg-cream transition-colors">
          
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar px-6 pt-16 pb-24">
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-24 h-24 bg-frost/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <FrostCrystalIcon size={64} />
          </div>
          <h1 className="font-serif text-4xl font-semibold text-forest mb-3">
            Frost Warning Tonight
          </h1>
          <p className="font-sans text-forest/80 text-lg max-w-xs">
            Environment Canada forecasts{' '}
            <span className="font-bold text-terracotta">-2°C</span> overnight in
            Calgary NW at 3:00 AM.
          </p>
        </div>

        <div className="bg-cream rounded-3xl p-6 shadow-lg shadow-frost/10 border border-cream-dark mb-6">
          <h2 className="font-serif text-xl font-semibold text-forest mb-4">
            Your at-risk plants
          </h2>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cream-dark/50 flex items-center justify-center flex-shrink-0">
                <TomatoIcon size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-forest">Tomatoes</h3>
                <p className="text-sm text-terracotta font-medium">
                  Cover or bring inside
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 flex items-center justify-center flex-shrink-0 border border-terracotta/20">
                <BasilIcon size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-forest">Basil</h3>
                <p className="text-sm text-terracotta-dark font-bold">
                  Bring inside immediately
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cream-dark/50 flex items-center justify-center flex-shrink-0">
                <DahliaIcon size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-forest">Dahlias</h3>
                <p className="text-sm text-forest/70">Cover with frost cloth</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 mb-8">
          <button className="flex items-center justify-between bg-cream-light p-4 rounded-2xl border border-cream-dark hover:border-forest/30 transition-colors">
            <div className="text-left">
              <h3 className="font-medium text-forest">How to cover plants</h3>
              <p className="text-xs text-forest/60 mt-1">
                Quick guide for Calgary winds
              </p>
            </div>
            <ChevronRight size={20} className="text-forest/40" />
          </button>

          <button className="flex items-center justify-between bg-cream-light p-4 rounded-2xl border border-cream-dark hover:border-forest/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-forest/10 rounded-full text-forest">
                <MapPin size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-medium text-forest">
                  Golden Acre Garden Centre
                </h3>
                <p className="text-xs text-forest/60 mt-1">
                  Open until 8pm · 2.3 km
                </p>
              </div>
            </div>
            <ChevronRight size={20} className="text-forest/40" />
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => onClose('dashboard')}
            className="w-full bg-forest text-cream py-4 rounded-full font-semibold text-lg shadow-lg shadow-forest/20">
            
            I've protected my plants
          </button>
          <button
            onClick={() => onClose('dashboard')}
            className="w-full py-4 text-forest/60 font-medium hover:text-forest transition-colors">
            
            Dismiss
          </button>
        </div>
      </div>
    </div>);

};
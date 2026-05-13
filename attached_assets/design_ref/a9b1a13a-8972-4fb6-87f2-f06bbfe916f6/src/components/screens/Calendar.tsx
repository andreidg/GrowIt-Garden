import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';
import {
  TomatoIcon,
  BasilIcon,
  PepperIcon,
  KaleIcon,
  CarrotIcon } from
'../illustrations/PlantIcons';
export const Calendar: React.FC = () => {
  const [activeMonth, setActiveMonth] = useState('May');
  const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep'];
  // Mock calendar grid for May
  const days = Array.from(
    {
      length: 31
    },
    (_, i) => i + 1
  );
  const startOffset = 4; // May 1st is a Thursday (mock)
  return (
    <div className="h-full flex flex-col bg-cream animate-in fade-in duration-500">
      <div className="px-6 pt-12 pb-4 bg-cream-dark/20">
        <h1 className="font-serif text-3xl font-semibold text-forest mb-6">
          Planting Calendar
        </h1>

        {/* Month Tabs */}
        <div className="flex justify-between items-center bg-cream-light p-1 rounded-xl border border-cream-dark">
          {months.map((month) =>
          <button
            key={month}
            onClick={() => setActiveMonth(month)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeMonth === month ? 'bg-forest text-cream shadow-sm' : 'text-forest/60 hover:text-forest'}`}>
            
              {month}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {/* Calendar Grid */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-forest">
              {activeMonth} 2026
            </h2>
            <div className="flex gap-2">
              <button className="p-1 text-forest/50 hover:text-forest">
                <ChevronLeft size={20} />
              </button>
              <button className="p-1 text-forest/50 hover:text-forest">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) =>
            <div
              key={i}
              className="text-center text-xs font-medium text-forest/50 py-2">
              
                {day}
              </div>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({
              length: startOffset
            }).map((_, i) =>
            <div
              key={`empty-${i}`}
              className="aspect-square rounded-lg bg-transparent" />

            )}
            {days.map((day) => {
              const isFrostRisk = day <= 24; // May 24 is last frost
              const isOptimal = day === 28;
              const isToday = day === 13;
              return (
                <div
                  key={day}
                  className={`aspect-square rounded-lg flex items-center justify-center relative text-sm font-medium border ${isToday ? 'border-forest text-forest bg-cream-light' : isFrostRisk ? 'bg-terracotta/10 border-transparent text-terracotta-dark' : 'bg-forest-light/10 border-transparent text-forest'}`}>
                  
                  {day}
                  {isOptimal &&
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gold rounded-full border-2 border-cream" />
                  }
                </div>);

            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-6 text-xs font-medium text-forest/70">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-terracotta/20" /> Frost
              Risk
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-forest-light/20" /> Safe
              Window
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-gold" /> Optimal Day
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="px-6 py-6 border-t border-cream-dark">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-forest">
              Your Plants Timeline
            </h2>
            <button className="text-forest/50 hover:text-forest">
              <Info size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Timeline Header */}
            <div className="flex ml-16 text-xs font-medium text-forest/50">
              <div className="flex-1">May</div>
              <div className="flex-1">Jun</div>
              <div className="flex-1">Jul</div>
              <div className="flex-1">Aug</div>
            </div>

            {/* Plant Rows */}
            {[
            {
              name: 'Tomatoes',
              icon: TomatoIcon,
              start: 25,
              grow: 40,
              harvest: 35
            },
            {
              name: 'Basil',
              icon: BasilIcon,
              start: 30,
              grow: 20,
              harvest: 50
            },
            {
              name: 'Peppers',
              icon: PepperIcon,
              start: 35,
              grow: 45,
              harvest: 20
            },
            {
              name: 'Kale',
              icon: KaleIcon,
              start: 10,
              grow: 30,
              harvest: 60
            },
            {
              name: 'Carrots',
              icon: CarrotIcon,
              start: 15,
              grow: 50,
              harvest: 35
            }].
            map((plant, i) =>
            <div
              key={i}
              className="flex items-center gap-4 group cursor-pointer">
              
                <div className="w-12 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-cream-light flex items-center justify-center mb-1 group-hover:bg-forest/5 transition-colors">
                    <plant.icon size={20} />
                  </div>
                  <span className="text-[10px] font-medium text-forest/70">
                    {plant.name}
                  </span>
                </div>

                <div className="flex-1 h-6 bg-cream-dark/30 rounded-full flex overflow-hidden relative">
                  {/* Spacer for start offset */}
                  <div
                  style={{
                    width: `${plant.start}%`
                  }} />
                
                  {/* Prep/Seedling */}
                  <div
                  style={{
                    width: '10%'
                  }}
                  className="bg-terracotta/60 h-full" />
                
                  {/* Growing */}
                  <div
                  style={{
                    width: `${plant.grow}%`
                  }}
                  className="bg-forest-light/60 h-full" />
                
                  {/* Harvesting */}
                  <div
                  style={{
                    width: `${plant.harvest}%`
                  }}
                  className="bg-gold/80 h-full" />
                
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>);

};
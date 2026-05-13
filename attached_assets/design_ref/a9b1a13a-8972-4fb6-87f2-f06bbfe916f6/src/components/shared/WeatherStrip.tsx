import React from 'react';
import { Sun, CloudSun, CloudRain, CloudLightning } from 'lucide-react';
export const WeatherStrip: React.FC = () => {
  const forecast = [
  {
    day: 'Today',
    icon: Sun,
    high: 22,
    low: 8,
    risk: 'green'
  },
  {
    day: 'Thu',
    icon: CloudSun,
    high: 19,
    low: 6,
    risk: 'green'
  },
  {
    day: 'Fri',
    icon: CloudRain,
    high: 15,
    low: 4,
    risk: 'amber'
  },
  {
    day: 'Sat',
    icon: CloudLightning,
    high: 12,
    low: 1,
    risk: 'red'
  },
  {
    day: 'Sun',
    icon: Sun,
    high: 16,
    low: 3,
    risk: 'amber'
  },
  {
    day: 'Mon',
    icon: CloudSun,
    high: 20,
    low: 7,
    risk: 'green'
  }];

  return (
    <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
      {forecast.map((day, i) =>
      <div
        key={i}
        className="flex-shrink-0 bg-cream-light border border-cream-dark rounded-2xl p-3 flex flex-col items-center min-w-[72px]">
        
          <span className="text-xs font-medium text-forest/70 mb-2">
            {day.day}
          </span>
          <day.icon size={24} className="text-forest mb-2" strokeWidth={1.5} />
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-sm font-semibold text-forest">
              {day.high}°
            </span>
            <span className="text-xs text-forest/50">{day.low}°</span>
          </div>
          <div
          className={`w-2 h-2 rounded-full ${day.risk === 'green' ? 'bg-forest-light' : day.risk === 'amber' ? 'bg-gold' : 'bg-terracotta'}`} />
        
        </div>
      )}
    </div>);

};
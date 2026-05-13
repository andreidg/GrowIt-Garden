import React from 'react';
import { WeatherStrip } from '../shared/WeatherStrip';
import { PlantCard } from '../shared/PlantCard';
import {
  TomatoIcon,
  DahliaIcon,
  KaleIcon,
  FrostCrystalIcon } from
'../illustrations/PlantIcons';
import { Camera, Calendar, Bell, ChevronRight } from 'lucide-react';
import { Screen } from '../shared/BottomNav';
interface DashboardProps {
  onNavigate: (screen: Screen) => void;
}
export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="h-full overflow-y-auto hide-scrollbar bg-cream pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 bg-gradient-to-b from-cream-dark/30 to-cream">
        <span className="text-xs font-medium uppercase tracking-wider text-forest/60 mb-2 block">
          Wednesday, May 13
        </span>
        <h1 className="font-serif text-3xl font-semibold text-forest mb-2">
          Good morning, Sarah.
        </h1>
        <div className="flex items-center gap-2 text-forest/80 bg-frost/20 inline-flex px-3 py-1.5 rounded-full">
          <FrostCrystalIcon size={16} />
          <span className="text-sm font-medium">
            12 days until your last frost date.
          </span>
        </div>
      </div>

      <div className="px-6 space-y-8">
        {/* Weather */}
        <section>
          <WeatherStrip />
        </section>

        {/* This Week */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-semibold text-forest">
              Your Garden — This Week
            </h2>
            <button className="text-sm font-medium text-forest/60 hover:text-forest">
              View all
            </button>
          </div>
          <div className="space-y-3">
            <PlantCard
              name="Tomatoes"
              action="Water today"
              actionColor="frost"
              icon={<TomatoIcon size={32} />}
              onClick={() => onNavigate('plant-detail')} />
            
            <PlantCard
              name="Dahlias"
              action="Fertilize"
              actionColor="gold"
              icon={<DahliaIcon size={32} />}
              onClick={() => onNavigate('plant-detail')} />
            
            <PlantCard
              name="Kale"
              action="Ready to harvest"
              actionColor="terracotta"
              icon={<KaleIcon size={32} />}
              onClick={() => onNavigate('plant-detail')} />
            
          </div>
        </section>

        {/* Upcoming */}
        <section>
          <h2 className="font-serif text-xl font-semibold text-forest mb-4">
            Upcoming
          </h2>
          <div className="bg-cream-light border border-cream-dark rounded-2xl overflow-hidden">
            {[
            {
              icon: '🌱',
              text: 'Best day to plant tomatoes',
              date: 'May 28',
              color: 'text-gold-dark'
            },
            {
              icon: '❄️',
              text: 'Frost risk window ends',
              date: 'May 24',
              color: 'text-frost-dark'
            },
            {
              icon: '🌿',
              text: 'Harvest window opens: Basil',
              date: 'July 1',
              color: 'text-forest'
            }].
            map((item, i) =>
            <div
              key={i}
              className={`flex items-center p-4 ${i !== 2 ? 'border-b border-cream-dark' : ''}`}>
              
                <span className="text-xl mr-3">{item.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${item.color}`}>
                    {item.text}
                  </p>
                </div>
                <span className="text-sm text-forest/50 font-medium mr-2">
                  {item.date}
                </span>
                <ChevronRight size={16} className="text-forest/30" />
              </div>
            )}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="pb-8">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('scan')}
              className="flex flex-col items-center justify-center p-4 bg-forest text-cream rounded-2xl hover:bg-forest-light transition-colors">
              
              <Camera size={24} className="mb-2" />
              <span className="text-xs font-medium text-center">
                Scan my
                <br />
                garden
              </span>
            </button>
            <button
              onClick={() => onNavigate('calendar')}
              className="flex flex-col items-center justify-center p-4 bg-cream-light border border-cream-dark text-forest rounded-2xl hover:border-forest/30 transition-colors">
              
              <Calendar size={24} className="mb-2" />
              <span className="text-xs font-medium text-center">
                View
                <br />
                calendar
              </span>
            </button>
            <button
              onClick={() => onNavigate('alerts')}
              className="flex flex-col items-center justify-center p-4 bg-cream-light border border-cream-dark text-forest rounded-2xl hover:border-forest/30 transition-colors relative">
              
              <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-terracotta rounded-full border-2 border-cream-light"></div>
              <Bell size={24} className="mb-2" />
              <span className="text-xs font-medium text-center">
                Alert
                <br />
                settings
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>);

};
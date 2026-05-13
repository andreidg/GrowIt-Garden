import React, { useState } from 'react';
import { ArrowLeft, Droplets, Sun, Sprout, AlertCircle } from 'lucide-react';
import { TomatoIcon } from '../illustrations/PlantIcons';
import { Screen } from '../shared/BottomNav';
interface PlantDetailProps {
  onBack: () => void;
}
export const PlantDetail: React.FC<PlantDetailProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'care' | 'calendar' | 'problems'>(
    'care'
  );
  return (
    <div className="h-full flex flex-col bg-cream animate-in slide-in-from-right duration-300 z-40 relative">
      {/* Header */}
      <div className="absolute top-12 left-6 z-10">
        <button
          onClick={onBack}
          className="p-2 bg-cream/80 backdrop-blur-sm text-forest rounded-full shadow-sm">
          
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto hide-scrollbar pb-24">
        {/* Hero */}
        <div className="w-full h-[40vh] bg-cream-dark/40 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-texture opacity-50 mix-blend-multiply" />
          <TomatoIcon size={180} className="relative z-10 drop-shadow-xl" />
        </div>

        <div className="px-6 py-6 -mt-6 bg-cream relative z-20 rounded-t-3xl">
          <div className="mb-6">
            <h1 className="font-serif text-4xl font-semibold text-forest mb-1">
              Tomato
            </h1>
            <p className="font-sans text-forest/60 italic">
              Solanum lycopersicum
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="px-3 py-1.5 bg-forest text-cream text-xs font-medium rounded-full flex items-center gap-1">
              Zone 3b compatible ✓
            </span>
            <span className="px-3 py-1.5 bg-gold/20 text-forest-dark text-xs font-medium rounded-full">
              Plant after May 24
            </span>
            <span className="px-3 py-1.5 bg-terracotta/10 text-terracotta-dark text-xs font-medium rounded-full">
              Frost sensitive: high
            </span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-cream-dark mb-6">
            {[
            {
              id: 'care',
              label: 'Care'
            },
            {
              id: 'calendar',
              label: 'Calendar'
            },
            {
              id: 'problems',
              label: 'Problems'
            }].
            map((tab) =>
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 pb-3 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-forest' : 'text-forest/50'}`}>
              
                {tab.label}
                {activeTab === tab.id &&
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
              }
              </button>
            )}
          </div>

          {/* Tab Content */}
          <div className="animate-in fade-in duration-300">
            {activeTab === 'care' &&
            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-4 p-4 bg-cream-light rounded-2xl border border-cream-dark">
                    <div className="p-2 bg-frost/20 rounded-xl text-forest">
                      <Droplets size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-forest text-sm mb-1">
                        Watering
                      </h3>
                      <p className="text-sm text-forest/70">
                        Every 2-3 days in Calgary heat. Water at the base to
                        prevent blight.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-cream-light rounded-2xl border border-cream-dark">
                    <div className="p-2 bg-gold/20 rounded-xl text-forest">
                      <Sun size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-forest text-sm mb-1">
                        Sunlight
                      </h3>
                      <p className="text-sm text-forest/70">
                        Full sun, 6-8 hours daily. South-facing is ideal.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-cream-light rounded-2xl border border-cream-dark">
                    <div className="p-2 bg-forest/10 rounded-xl text-forest">
                      <Sprout size={20} />
                    </div>
                    <div>
                      <h3 className="font-medium text-forest text-sm mb-1">
                        Fertilizing
                      </h3>
                      <p className="text-sm text-forest/70">
                        Monthly with 10-10-10 once flowers appear.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-cream-light border-l-4 border-gold p-4 rounded-r-2xl">
                  <h4 className="font-medium text-forest text-sm mb-2 flex items-center gap-2">
                    <span className="text-gold">✨</span> Calgary Tip
                  </h4>
                  <p className="text-sm text-forest/80 leading-relaxed">
                    Our dry chinook winds can stress tomatoes and dry out soil
                    rapidly. Mulch heavily around the base to retain moisture
                    and regulate soil temperature.
                  </p>
                </div>
              </div>
            }

            {activeTab === 'problems' &&
            <div className="space-y-4">
                <h3 className="text-sm font-medium text-forest/60 uppercase tracking-wider mb-4">
                  Common in Calgary
                </h3>

                <div className="p-4 bg-cream-light rounded-2xl border border-terracotta/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={18} className="text-terracotta" />
                    <h4 className="font-medium text-forest">Cutworms</h4>
                  </div>
                  <p className="text-sm text-forest/70 mb-3">
                    Common in Alberta soil. They chew through stems of young
                    seedlings at soil level.
                  </p>
                  <div className="text-xs font-medium text-forest bg-cream-dark/50 p-2 rounded-lg inline-block">
                    Fix: Place a cardboard collar around the stem when planting.
                  </div>
                </div>

                <div className="p-4 bg-cream-light rounded-2xl border border-terracotta/20">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle size={18} className="text-terracotta" />
                    <h4 className="font-medium text-forest">Early Blight</h4>
                  </div>
                  <p className="text-sm text-forest/70 mb-3">
                    Fungal disease causing dark spots on lower leaves. Thrives
                    in humidity after our summer thunderstorms.
                  </p>
                  <div className="text-xs font-medium text-forest bg-cream-dark/50 p-2 rounded-lg inline-block">
                    Fix: Remove affected leaves, water only at base, ensure good
                    airflow.
                  </div>
                </div>
              </div>
            }

            {activeTab === 'calendar' &&
            <div className="py-4">
                <div className="relative border-l-2 border-cream-dark ml-4 space-y-8 pb-4">
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-cream border-2 border-forest" />
                    <h4 className="font-medium text-forest text-sm">
                      Start Indoors
                    </h4>
                    <p className="text-sm text-forest/60 mt-1">
                      Mid-March (6-8 weeks before last frost)
                    </p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-cream border-2 border-gold" />
                    <h4 className="font-medium text-forest text-sm">
                      Transplant Outdoors
                    </h4>
                    <p className="text-sm text-forest/60 mt-1">
                      Late May / Early June (After all danger of frost)
                    </p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-cream border-2 border-terracotta" />
                    <h4 className="font-medium text-forest text-sm">Harvest</h4>
                    <p className="text-sm text-forest/60 mt-1">
                      August through September
                    </p>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>);

};
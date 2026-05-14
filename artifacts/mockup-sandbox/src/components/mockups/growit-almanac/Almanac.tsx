import React from 'react';
import { Leaf, CalendarDays, Sprout, Map, Sun, MoveRight, Quote } from 'lucide-react';

export function Almanac() {
  return (
    <div className="w-[390px] mx-auto bg-[#F5F0E8] min-h-[100dvh] font-sans text-[#1A3C2E] overflow-hidden flex flex-col relative shadow-2xl ring-1 ring-black/5">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&display=swap');
        
        .font-serif {
          font-family: 'Playfair Display', serif;
        }
        .font-sans {
          font-family: 'Inter', sans-serif;
        }
        .text-forest { color: #1A3C2E; }
        .text-brown { color: #6B4E3D; }
        .text-terracotta { color: #C4622D; }
        .bg-terracotta { background-color: #C4622D; }
        .bg-cream { background-color: #F5F0E8; }
        .bg-cream-light { background-color: #FDF8F3; }
        .bg-cream-dark { background-color: #F0E8DC; }
        
        .shadow-warm {
          box-shadow: 0 4px 14px -2px rgba(107, 78, 61, 0.1), 0 2px 4px -2px rgba(107, 78, 61, 0.05);
        }
      `}</style>

      {/* 1. Top bar */}
      <div className="bg-terracotta text-[#F5F0E8] px-5 py-3 flex items-center justify-between z-10 relative shadow-sm">
        <div className="font-serif font-bold text-xl tracking-tight">SproutIt</div>
        <div className="bg-[#A44C1D] text-[#FDF8F3] px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide uppercase flex items-center gap-1.5 opacity-90">
          <Leaf size={10} />
          Alberta · Zone 3b–4a
        </div>
      </div>

      {/* 2. Hero */}
      <div className="bg-cream px-6 pt-12 pb-10 flex flex-col items-center text-center relative overflow-hidden">
        {/* Subtle background texture/pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C4622D 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        <h1 className="font-serif italic font-bold text-[44px] leading-[1.1] text-[#1A3C2E] mb-5 relative z-10">
          This season,<br />grow something<br />great.
        </h1>
        <p className="text-[#6B4E3D] text-[17px] leading-relaxed mb-8 max-w-[280px] font-medium relative z-10">
          Location-aware garden plans built for Alberta's short growing season.
        </p>

        {/* Illustrated area */}
        <div className="w-48 h-48 relative mb-10 mt-2">
          {/* Concentric circles */}
          <div className="absolute inset-0 rounded-full border border-[#D4A853]/40"></div>
          <div className="absolute inset-4 rounded-full border border-[#C4622D]/30"></div>
          <div className="absolute inset-8 rounded-full border border-[#1A3C2E]/20 bg-[#F0E8DC]/50"></div>
          <div className="absolute inset-12 rounded-full border border-[#C4622D]/40 bg-[#FDF8F3]"></div>
          
          {/* Decorative seeds/leaves */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-terracotta">
            <Sprout size={40} strokeWidth={1.5} />
          </div>
          
          <div className="absolute top-6 right-10 text-[#D4A853] rotate-45"><Leaf size={16} /></div>
          <div className="absolute bottom-8 left-8 text-[#1A3C2E] opacity-60 -rotate-12"><Sun size={20} /></div>
          <div className="absolute top-1/2 right-4 -translate-y-1/2 w-2 h-2 rounded-full bg-[#C4622D]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-[#1A3C2E] opacity-40"></div>
          <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-[#D4A853]"></div>
        </div>

        <button className="bg-terracotta text-white w-full h-14 rounded-full font-bold text-[17px] shadow-lg shadow-[#C4622D]/20 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 relative z-10">
          Plan My Garden
          <MoveRight size={18} strokeWidth={2.5} />
        </button>
        <p className="text-[#6B4E3D] text-[13px] mt-4 opacity-80 font-medium relative z-10">
          No account required · Free forever
        </p>
      </div>

      {/* 3. Trust strip */}
      <div className="bg-[#F0E8DC] border-y border-[#D4A853]/20 py-3.5 px-2 flex justify-center items-center divide-x divide-[#C4622D]/20">
        <div className="px-2.5 text-[11px] font-bold text-[#1A3C2E] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
          <span>📅</span> Frost-aware
        </div>
        <div className="px-2.5 text-[11px] font-bold text-[#1A3C2E] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
          <span>🌿</span> Companion
        </div>
        <div className="px-2.5 text-[11px] font-bold text-[#1A3C2E] uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap">
          <span>☀️</span> Sunlight
        </div>
      </div>

      {/* 4. "Your Plan Includes" */}
      <div className="bg-cream-light px-6 py-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px bg-terracotta/30 flex-1"></div>
          <h2 className="text-[12px] font-bold text-terracotta uppercase tracking-[0.15em]">What You Get</h2>
          <div className="h-px bg-terracotta/30 flex-1"></div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-warm border-l-4 border-l-terracotta flex gap-4 items-start relative overflow-hidden">
            <div className="w-10 h-10 rounded-full bg-[#FDF8F3] flex items-center justify-center text-xl shrink-0">
              🗺️
            </div>
            <div>
              <h3 className="font-bold text-[#1A3C2E] text-[16px] mb-1">Custom Garden Map</h3>
              <p className="text-[#6B4E3D] text-[14px] leading-snug">Visual layout optimized for sunlight and companion planting rules.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-warm border-l-4 border-l-[#D4A853] flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#FDF8F3] flex items-center justify-center text-xl shrink-0">
              📋
            </div>
            <div>
              <h3 className="font-bold text-[#1A3C2E] text-[16px] mb-1">Weekly Schedule</h3>
              <p className="text-[#6B4E3D] text-[14px] leading-snug">Step-by-step tasks tailored to your local frost dates.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-warm border-l-4 border-l-[#1A3C2E] flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#FDF8F3] flex items-center justify-center text-xl shrink-0">
              ⏱️
            </div>
            <div>
              <h3 className="font-bold text-[#1A3C2E] text-[16px] mb-1">Plant Timing</h3>
              <p className="text-[#6B4E3D] text-[14px] leading-snug">Exactly when to start indoors, transplant, and harvest.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Peek at the output */}
      <div className="bg-cream px-6 py-12 border-t border-[#D4A853]/20">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px bg-terracotta/30 flex-1"></div>
          <h2 className="text-[12px] font-bold text-terracotta uppercase tracking-[0.15em]">Sample Plan</h2>
          <div className="h-px bg-terracotta/30 flex-1"></div>
        </div>

        {/* Mocked Garden Map */}
        <div className="bg-white rounded-2xl p-4 shadow-warm border border-[#F0E8DC] mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="text-[13px] font-bold text-[#1A3C2E]">Raised Bed 1</div>
            <div className="text-[11px] font-semibold text-terracotta bg-[#FDF8F3] px-2 py-1 rounded">Full Sun</div>
          </div>
          <div className="grid grid-cols-6 grid-rows-4 gap-1.5 aspect-[3/2]">
            {Array.from({ length: 24 }).map((_, i) => {
              // Create a structured but organic looking pattern
              let content = '';
              let bg = 'bg-[#FDF8F3]';
              let border = 'border-[#F0E8DC]';
              
              if (i < 4) { content = '🍅'; bg = 'bg-red-50'; border = 'border-red-100'; }
              else if (i < 6) { content = '🌿'; bg = 'bg-green-50'; border = 'border-green-100'; }
              else if (i >= 6 && i < 12) { content = '🥕'; bg = 'bg-orange-50'; border = 'border-orange-100'; }
              else if (i >= 12 && i < 15) { content = '🥬'; bg = 'bg-emerald-50'; border = 'border-emerald-100'; }
              else if (i >= 18 && i < 22) { content = '🧄'; bg = 'bg-amber-50'; border = 'border-amber-100'; }

              return (
                <div key={i} className={`rounded-md border ${border} ${bg} flex items-center justify-center text-sm shadow-sm`}>
                  {content}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule preview */}
        <div className="space-y-3">
          <div className="bg-white rounded-xl p-3.5 shadow-warm border border-[#F0E8DC] flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#FDF8F3] text-terracotta flex items-center justify-center shrink-0">
              <CalendarDays size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-terracotta uppercase tracking-wider mb-0.5">Week of May 14</div>
              <div className="text-[#1A3C2E] text-[14px] font-medium">Transplant Tomatoes</div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-[#D4A853]/40"></div>
          </div>
          
          <div className="bg-white rounded-xl p-3.5 shadow-warm border border-[#F0E8DC] flex items-center gap-3 opacity-70">
            <div className="w-8 h-8 rounded-full bg-[#FDF8F3] text-terracotta flex items-center justify-center shrink-0">
              <Sprout size={16} />
            </div>
            <div className="flex-1">
              <div className="text-[11px] font-bold text-terracotta uppercase tracking-wider mb-0.5">Week of May 21</div>
              <div className="text-[#1A3C2E] text-[14px] font-medium">Direct sow Carrots</div>
            </div>
            <div className="w-5 h-5 rounded-full border-2 border-[#D4A853]/40"></div>
          </div>
        </div>
      </div>

      {/* 6. Quote / Trust */}
      <div className="bg-cream-dark px-6 py-12">
        <div className="relative">
          <div className="absolute -top-3 -left-2 text-terracotta opacity-20">
            <Quote size={48} className="rotate-180" fill="currentColor" />
          </div>
          <div className="pl-6 border-l-2 border-terracotta relative z-10">
            <p className="font-serif italic text-[22px] leading-snug text-[#1A3C2E] mb-4">
              "Finally a garden planner that actually knows when frost hits in Calgary."
            </p>
            <div className="flex items-center gap-2">
              <div className="flex text-[#D4A853]">
                {'★★★★★'.split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <span className="text-[#6B4E3D] text-[13px] font-medium">— Sarah T., Zone 4a</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7. Footer */}
      <div className="bg-[#1A3C2E] text-[#F0E8DC] px-6 py-8 mt-auto">
        <div className="flex flex-col items-center text-center">
          <div className="font-serif font-bold text-xl tracking-tight mb-4 text-[#D4A853]">SproutIt</div>
          <div className="flex items-center gap-3 text-[13px] opacity-80 mb-6">
            <span>Privacy</span>
            <span>·</span>
            <span>No data stored</span>
          </div>
          <p className="text-[12px] opacity-60 max-w-[200px] leading-relaxed">
            Built with care for Alberta gardeners facing short, unpredictable seasons.
          </p>
        </div>
      </div>
    </div>
  );
}

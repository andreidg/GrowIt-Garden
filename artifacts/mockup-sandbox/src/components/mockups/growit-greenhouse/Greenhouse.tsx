import React from "react";
import { Leaf } from "lucide-react";

export function Greenhouse() {
  return (
    <div className="flex justify-center w-full min-h-screen bg-gray-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500&family=Playfair+Display:wght@700&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
      `}</style>
      
      {/* Mobile Frame (max 390px) */}
      <div className="w-full max-w-[390px] bg-[#FDFCFB] shadow-xl relative overflow-x-hidden flex flex-col min-h-[100dvh]">
        
        {/* 1. Hero Zone */}
        <section className="bg-[#1A3C2E] text-[#F5F0E8] px-6 pt-12 pb-16 rounded-b-3xl relative overflow-hidden shrink-0 z-10">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
            <div className="w-64 h-64 border border-[#F5F0E8] rounded-full absolute top-10 -right-20"></div>
            <div className="w-96 h-96 border border-[#F5F0E8] rounded-full absolute -top-10 -left-20"></div>
          </div>
          
          <header className="flex items-center gap-2 mb-10 relative z-10">
            <Leaf className="w-5 h-5 text-[#F5F0E8]" />
            <span className="font-semibold text-sm tracking-wide">SproutIt</span>
          </header>

          <div className="relative z-10 space-y-4">
            <h1 className="font-serif text-4xl leading-[1.15] text-[#F5F0E8]">
              Your Alberta garden, perfectly planned.
            </h1>
            <p className="text-[#F5F0E8]/90 text-lg max-w-[280px]">
              The smart gardening app designed exclusively for Alberta's short growing season.
            </p>
          </div>

          <div className="mt-12 relative z-10 flex flex-col items-center">
            <button className="w-full bg-[#D4A853] text-[#1A3C2E] font-semibold text-lg h-14 rounded-full flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform">
              Plan My Garden <span>→</span>
            </button>
            <span className="text-[#F5F0E8]/70 text-xs mt-3">No account required</span>
          </div>
        </section>

        {/* 2. Feature Chips Zone */}
        <section className="bg-[#F5F0E8] px-6 py-10 -mt-6 pt-12 shrink-0">
          <div className="flex flex-wrap gap-2">
            <div className="bg-[#1A3C2E]/5 border border-[#1A3C2E]/10 text-[#1A3C2E] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span>📅</span> Local Frost Dates
            </div>
            <div className="bg-[#1A3C2E]/5 border border-[#1A3C2E]/10 text-[#1A3C2E] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span>☀️</span> Sunlight Match
            </div>
            <div className="bg-[#1A3C2E]/5 border border-[#1A3C2E]/10 text-[#1A3C2E] px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2">
              <span>🌿</span> Smart Companion Planting
            </div>
          </div>
        </section>

        {/* 3. How it works */}
        <section className="bg-[#FDFCFB] px-6 py-10 shrink-0">
          <h2 className="font-serif text-2xl text-[#1A3C2E] mb-6">How it works</h2>
          <div className="space-y-4">
            {[
              { step: 1, title: "Choose your space", desc: "Tell us about your garden beds and sunlight.", emoji: "📐" },
              { step: 2, title: "Confirm your frost dates", desc: "We'll pinpoint your exact growing window.", emoji: "❄️" },
              { step: 3, title: "Get your full garden plan", desc: "A customized schedule for starting seeds and transplanting.", emoji: "🌱" }
            ].map((item) => (
              <div key={item.step} className="bg-white p-4 rounded-2xl shadow-sm border border-black/5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5F0E8] flex items-center justify-center text-xl shrink-0">
                  {item.emoji}
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#C4622D] uppercase tracking-wider mb-1">Step {item.step}</div>
                  <h3 className="font-semibold text-[#1A3C2E] mb-1">{item.title}</h3>
                  <p className="text-[#1A3C2E]/70 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Garden plan preview teaser */}
        <section className="bg-[#1A3C2E]/5 px-6 py-12 shrink-0 border-t border-[#1A3C2E]/10">
          <h2 className="font-serif text-2xl text-[#1A3C2E] mb-6 text-center">A peek at your plan</h2>
          
          <div className="bg-white rounded-3xl shadow-md p-5 border border-black/5">
            <h3 className="text-sm font-semibold text-[#1A3C2E] mb-3">Your Garden Map</h3>
            <div className="grid grid-cols-5 gap-1 mb-6">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="aspect-square bg-[#1A3C2E]/10 rounded-md flex items-center justify-center text-lg">
                  {i === 2 || i === 3 ? "🍅" : i === 7 || i === 8 ? "🥬" : i === 15 ? "🥕" : i === 11 ? "🌿" : ""}
                </div>
              ))}
            </div>

            <div className="bg-[#F5F0E8] rounded-xl p-3 border border-[#1A3C2E]/5 flex items-start gap-3">
              <div className="bg-[#D4A853] w-1.5 h-full rounded-full shrink-0"></div>
              <div>
                <div className="text-xs font-semibold text-[#1A3C2E]/60 mb-1">Week of May 14</div>
                <div className="text-sm font-medium text-[#1A3C2E]">Start tomatoes indoors 🍅</div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Footer */}
        <footer className="bg-[#F5F0E8] px-6 py-10 text-center flex-grow flex flex-col justify-end border-t border-[#1A3C2E]/5">
          <div className="text-[#1A3C2E]/60 text-xs space-y-2">
            <p>Built for Alberta gardeners</p>
            <p>Privacy · No data stored</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

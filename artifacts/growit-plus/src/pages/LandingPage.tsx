interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  return (
    <div className="flex-1 flex flex-col min-h-full bg-cream-light overflow-y-auto hide-scrollbar animate-in fade-in duration-500">

      {/* ── 1. Hero — dark forest ── */}
      <section className="bg-forest text-cream px-6 pt-12 pb-20 rounded-b-3xl relative overflow-hidden shrink-0">
        {/* Subtle decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 border border-cream/10 rounded-full top-8 -right-20" />
          <div className="absolute w-96 h-96 border border-cream/10 rounded-full -top-12 -left-24" />
        </div>

        {/* Logo + wordmark */}
        <header className="flex items-center gap-3 mb-10 relative z-10">
          <img src="/logo.svg" alt="GrowIt+ logo" className="w-10 h-10" />
          <span className="font-serif text-xl font-semibold text-cream tracking-wide">GrowIt+</span>
        </header>

        {/* Headline */}
        <div className="relative z-10 space-y-4 mb-12">
          <h1 className="font-serif text-4xl font-semibold text-cream leading-[1.15]">
            Your Alberta garden,<br />perfectly planned.
          </h1>
          <p className="text-cream/80 text-lg leading-relaxed max-w-xs">
            The smart gardening app built exclusively for Alberta's short growing season.
          </p>
        </div>

        {/* CTA */}
        <div className="relative z-10 flex flex-col items-center">
          <button
            onClick={onStart}
            className="w-full bg-gold text-forest font-semibold text-lg h-14 rounded-full flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
            data-testid="btn-plan-garden"
          >
            Plan My Garden <span>→</span>
          </button>
          <span className="text-cream/60 text-xs mt-3">No account required · Free forever</span>
        </div>
      </section>

      {/* ── 2. Feature chips ── */}
      <section className="bg-cream px-6 py-8 shrink-0">
        <div className="flex flex-wrap gap-2">
          {[
            { icon: "📅", label: "Local Frost Dates" },
            { icon: "☀️", label: "Sunlight Match" },
            { icon: "🌿", label: "Companion Planting" },
            { icon: "📍", label: "Region-Specific" },
          ].map(({ icon, label }) => (
            <div
              key={label}
              className="bg-forest/5 border border-forest/10 text-forest px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2"
            >
              <span>{icon}</span>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. How it works ── */}
      <section className="bg-cream-light px-6 py-8 shrink-0">
        <h2 className="font-serif text-2xl font-semibold text-forest mb-6">How it works</h2>
        <div className="space-y-3">
          {[
            { step: 1, emoji: "📐", title: "Choose your space",       desc: "Tell us your garden bed size and sun exposure." },
            { step: 2, emoji: "❄️", title: "Confirm your frost dates", desc: "We pinpoint your exact growing window for your region." },
            { step: 3, emoji: "🌱", title: "Get your full garden plan", desc: "A customised schedule for starting seeds and transplanting." },
          ].map(({ step, emoji, title, desc }) => (
            <div
              key={step}
              className="bg-cream border border-cream-dark p-4 rounded-2xl flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-cream-dark flex items-center justify-center text-xl shrink-0">
                {emoji}
              </div>
              <div>
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-wider mb-1">
                  Step {step}
                </div>
                <h3 className="font-medium text-forest mb-0.5">{title}</h3>
                <p className="text-forest/60 text-sm leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 4. Plan preview teaser ── */}
      <section className="bg-forest/5 px-6 py-10 shrink-0 border-t border-forest/10">
        <h2 className="font-serif text-2xl font-semibold text-forest mb-6 text-center">
          A peek at your plan
        </h2>

        <div className="bg-cream rounded-3xl shadow-sm p-5 border border-cream-dark">
          <h3 className="text-sm font-semibold text-forest mb-3">Your Garden Map</h3>
          <div className="grid grid-cols-5 gap-1 mb-5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-forest/8 border border-forest/10 rounded-xl flex items-center justify-center text-base"
              >
                {i === 2 || i === 3 ? "🍅" : i === 7 || i === 8 ? "🥬" : i === 15 ? "🥕" : i === 11 ? "🌿" : ""}
              </div>
            ))}
          </div>

          <div className="bg-cream-dark/40 rounded-xl p-3 border border-cream-dark flex items-start gap-3">
            <div className="w-1.5 rounded-full bg-gold shrink-0 self-stretch" />
            <div>
              <div className="text-[10px] font-semibold text-forest/50 mb-0.5 uppercase tracking-wider">This Week</div>
              <div className="text-sm font-medium text-forest">Start tomatoes indoors 🍅</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Footer ── */}
      <footer className="bg-cream px-6 py-8 text-center border-t border-forest/5 mt-auto">
        <p className="text-forest/40 text-xs leading-relaxed">
          Built for Alberta gardeners · Privacy · No data stored
        </p>
      </footer>

    </div>
  );
}

import { useAuth } from "@/hooks/useAuth";
import { LogIn, LogOut, User } from "lucide-react";

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  return (
    <div className="flex-1 flex flex-col min-h-full bg-cream-light overflow-y-auto hide-scrollbar animate-in fade-in duration-500">

      {/* ── 1. Hero — dark forest ── */}
      <section className="bg-forest text-cream px-6 pt-12 pb-20 rounded-b-3xl relative overflow-hidden shrink-0">
        {/* Subtle decorative rings */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute w-64 h-64 border border-cream/10 rounded-full top-8 -right-20" />
          <div className="absolute w-96 h-96 border border-cream/10 rounded-full -top-12 -left-24" />
        </div>

        {/* Logo + wordmark + auth */}
        <header className="flex items-center gap-3 mb-10 relative z-10">
          <div className="w-10 h-10 bg-cream rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <img src="/logo.svg" alt="GrowIt logo" className="w-7 h-7" />
          </div>
          <span className="font-serif text-xl font-semibold text-cream tracking-wide flex-1">GrowIt</span>

          {!isLoading && (
            isAuthenticated && user ? (
              <div className="flex items-center gap-2">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-8 h-8 rounded-full border-2 border-cream/30 object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-cream/20 flex items-center justify-center border border-cream/30">
                    <User className="w-4 h-4 text-cream" />
                  </div>
                )}
                <span className="text-sm text-cream/80 font-medium hidden xs:block max-w-[80px] truncate">{user.name}</span>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-1.5 bg-cream/15 hover:bg-cream/25 border border-cream/20 text-cream text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                data-testid="btn-sign-in"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </button>
            )
          )}
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
          <span className="text-cream/60 text-xs mt-3">No account required · Free to use</span>
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
        <h2 className="font-serif text-2xl font-semibold text-forest mb-2">How it works</h2>
        <p className="text-sm text-forest/55 mb-6 leading-relaxed">Four steps from blank yard to full garden plan.</p>
        <div className="space-y-3">
          {[
            { step: 1, emoji: "📍", title: "Pick your Alberta location",     desc: "We look up your city's exact frost dates and climate zone." },
            { step: 2, emoji: "🌿", title: "Describe your garden space",      desc: "Enter bed dimensions, sunlight level, and soil type." },
            { step: 3, emoji: "🎯", title: "Choose a goal or select plants",  desc: "Pick a growing goal and we'll recommend the right plants — or choose your own." },
            { step: 4, emoji: "🗓", title: "Get your complete plan",          desc: "A visual garden map and week-by-week schedule, from seed to harvest." },
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-forest">Sample Garden Map</h3>
            <div className="flex gap-1.5">
              {[
                { icon: "🥗", label: "Veg",    pill: "bg-[#DFF0E6] border border-[#9DC9AD] text-[#1A3C2E]" },
                { icon: "🌿", label: "Herb",   pill: "bg-[#F5EDD8] border border-[#D4B068] text-[#7A5218]" },
                { icon: "🌸", label: "Flower", pill: "bg-[#F5E8F2] border border-[#C8A0C8] text-[#8B3A7E]" },
              ].map(c => (
                <span key={c.label} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.pill}`}>
                  {c.icon} {c.label}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-5 gap-1 mb-5">
            {[
              { emoji: "🍅", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "🍅", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "",   cls: "bg-forest/5 border-forest/10" },
              { emoji: "🌼", cls: "bg-[#F5E8F2] border-[#C8A0C8]" },
              { emoji: "🌼", cls: "bg-[#F5E8F2] border-[#C8A0C8]" },
              { emoji: "🥬", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "🥬", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "",   cls: "bg-forest/5 border-forest/10" },
              { emoji: "🌿", cls: "bg-[#F5EDD8] border-[#D4B068]" },
              { emoji: "🌿", cls: "bg-[#F5EDD8] border-[#D4B068]" },
              { emoji: "🥕", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "🥕", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "",   cls: "bg-forest/5 border-forest/10" },
              { emoji: "🌿", cls: "bg-[#F5EDD8] border-[#D4B068]" },
              { emoji: "🌸", cls: "bg-[#F5E8F2] border-[#C8A0C8]" },
              { emoji: "🌸", cls: "bg-[#F5E8F2] border-[#C8A0C8]" },
              { emoji: "",   cls: "bg-forest/5 border-forest/10" },
              { emoji: "🥕", cls: "bg-[#DFF0E6] border-[#9DC9AD]" },
              { emoji: "",   cls: "bg-forest/5 border-forest/10" },
              { emoji: "🌿", cls: "bg-[#F5EDD8] border-[#D4B068]" },
            ].map(({ emoji, cls }, i) => (
              <div
                key={i}
                className={`aspect-square border rounded-xl flex items-center justify-center text-base ${cls}`}
              >
                {emoji}
              </div>
            ))}
          </div>

          <div className="bg-forest text-cream rounded-xl p-3 flex items-start gap-3">
            <div className="w-1.5 rounded-full bg-gold shrink-0 self-stretch" />
            <div>
              <div className="text-[10px] font-semibold text-cream/50 mb-0.5 uppercase tracking-wider">📅 This Week · May 14</div>
              <div className="text-sm font-medium">Start tomatoes indoors 🍅 &amp; direct sow carrots 🥕</div>
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

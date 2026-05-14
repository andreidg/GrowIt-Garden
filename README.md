# GrowIt

**A location-aware, mobile-first garden planning web app built for Alberta homeowners.**

---

## Product Description

GrowIt is a free, account-optional web application that generates a personalised vegetable, herb, and flower garden plan calibrated to your specific Alberta location. You answer four questions — where you live, how big your garden beds are, and what you want to grow — and GrowIt produces a colour-coded garden map, a week-by-week planting schedule anchored to your city's historical frost dates, companion-planting conflict detection, and a live 7-day weather risk advisory. No sign-up, no spreadsheets, no guesswork.

---

## Business Problem

Alberta's growing season is short (as few as 100–120 frost-free days), highly variable by location, and frequently misunderstood by home gardeners who rely on generic national advice. Planting even one or two weeks too early or too late can mean losing an entire crop. Existing gardening apps are designed for temperate North American climates and do not account for Alberta's Zone 3–4a conditions, city-level microclimates, or the practical reality that most home gardeners have never heard of a "last spring frost date." GrowIt solves this by making location-specific frost-date intelligence the foundation of every plan.

---

## Target Users

- Alberta homeowners with a backyard garden bed, raised bed, container garden, or small urban plot
- First-time or early-stage gardeners who want a structured, data-backed starting point
- Experienced gardeners who want a companion-planting-aware layout and a downloadable schedule

---

## MVP Features

| Feature | Details |
|---|---|
| Location selection | Six Alberta cities: Calgary, Edmonton, Red Deer, Airdrie, Cochrane, Okotoks — each with historical frost dates |
| Multi-area garden setup | Up to five named garden beds with individual dimensions, sunlight level (5 options), and soil type |
| Imperial / metric toggle | All dimensions entered and stored in feet internally; displayed in the user's preferred unit throughout |
| Garden goal selection | Six goals (Beginner-friendly, Vegetable-focused, Herbs & Flowers, Pollinator-friendly, Family/Kid-friendly, Custom) that drive automatic plant recommendations |
| Manual plant selection | Full override: choose from 40+ vegetables, herbs, and flowers across all three categories |
| Custom plant entry | Add any plant not in the database with category, basic schedule, and caution notes |
| Companion-planting analysis | Detects and highlights incompatible adjacent plant pairs on the map; one-tap layout optimiser |
| Garden map | Colour-coded grid (green = vegetable, gold = herb, pink = flower) with per-cell detail panel showing spacing, action type, days to maturity, and care notes |
| Week-by-week schedule | Collapsible timeline from first indoor seed start to last fall frost, with current-week highlight |
| AI-enhanced plan | Optional AI layer (OpenAI-compatible) refines plant selection and adds growing notes; deterministic fallback on any failure |
| Photo analyser | Upload a photo of your garden space; AI detects likely sunlight level and soil type to pre-fill the form |
| Weather risk card | Live 7-day forecast via Open-Meteo; surfaces frost risk, heat stress, heavy rain, and dry-spell advisories specific to your garden |
| Post-plan plant editing | Edit the plant list on the plan page and regenerate the map and schedule without starting over |
| Download & share | Export plan as Markdown; share via Web Share API with clipboard fallback |
| Print styling | All three plan tabs (Map, Schedule, Plants) visible in print; colour-accurate; A4 page margins |
| No account required | Plans saved to `localStorage`; returning users see their last plan |

---

## Technology Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Language | TypeScript 5.9 (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Routing | Wouter |
| State | React `useState` / `useMemo` (no global store) |
| Data fetching | Fetch API via custom hooks |

### Backend
| Layer | Technology |
|---|---|
| Server | Express 5 (Node.js 24) |
| Database | PostgreSQL via Drizzle ORM |
| Validation | Zod v4 + drizzle-zod |
| API contract | OpenAPI 3.1 spec → Orval codegen (React Query hooks + Zod schemas) |
| Logging | Pino |
| Build | esbuild (CJS bundle) |

### Infrastructure
| Layer | Technology |
|---|---|
| Monorepo | pnpm workspaces |
| Reverse proxy | Replit path-based shared proxy |
| Weather data | Open-Meteo (open, no API key required) |
| AI inference | OpenAI-compatible API (Replit AI Integrations proxy) |
| Auth | Replit Auth (optional sign-in via OpenID Connect) |

---

## How AI-Assisted Development Was Used

GrowIt was built as a project for **ENTI 633 Generative AI and Prompting** at the Haskayne School of Business, University of Calgary. The entire codebase was produced through iterative prompting of a generative AI coding assistant (Replit Agent / GPT-4-class model). Key AI-assisted steps included:

1. **Architecture design** — prompting the AI to propose a monorepo structure, API contract-first workflow, and deterministic-first plan generation strategy before writing any code
2. **Feature implementation** — describing each feature in plain language and having the AI generate TypeScript components, hooks, and route handlers
3. **Debugging and refactoring** — providing error messages or screenshots to the AI and having it diagnose and fix issues
4. **Data modelling** — AI-generated Zod schemas, Drizzle table definitions, and OpenAPI spec sections
5. **Prompt engineering within the app** — designing the system and user prompts sent to the AI plan-generation route (`/api/ai-plan`) to elicit structured JSON responses that augment the deterministic plan

The project demonstrates that a non-engineer can use generative AI to ship a functional, multi-layer full-stack web application without writing raw code by hand.

---

## Location-Specific Frost Dates and Plant Rules

Every Alberta city in GrowIt has a hardcoded frost date table (`artifacts/growit-plus/src/data/locations.ts`):

| City | Zone | Last Spring Frost | First Fall Frost |
|---|---|---|---|
| Calgary | 3b–4a | May 14 | Sep 17 |
| Edmonton | 3a–4a | May 23 | Sep 10 |
| Red Deer | 3b | May 21 | Sep 12 |
| Airdrie | 3b | May 18 | Sep 13 |
| Cochrane | 3b | May 20 | Sep 11 |
| Okotoks | 4a | May 13 | Sep 18 |

The plan generator (`plan-generator.ts`) uses these dates to anchor every action in the weekly schedule:

- **Start indoors** tasks are scheduled N weeks before the last spring frost
- **Transplant outdoors** tasks are scheduled for or after the last spring frost
- **Direct sow** tasks are scheduled within the safe outdoor window
- **Harvest** and **harvest-soon** tasks are placed before the first fall frost
- The entire schedule runs from the earliest indoor seed start to the last fall frost date

Plant suitability is also filtered by the area's sunlight level. A tolerance of one sunlight level is applied (e.g., a "Full Sun" plant can survive "Part Sun") to avoid over-exclusion in real-world gardens.

---

## Vegetables, Herbs, and Flowers

Plants are organised into three categories with distinct visual treatment throughout the app:

| Category | Map colour | Badge colour | Examples |
|---|---|---|---|
| Vegetable | Green (`#DFF0E6`) | Green pill | Tomato, Carrot, Kale, Zucchini, Pea |
| Herb | Gold (`#F5EDD8`) | Gold pill | Basil, Dill, Chives, Mint, Oregano |
| Flower | Pink (`#F5E8F2`) | Pink pill | Nasturtium, Marigold, Lavender, Cosmos |

Each plant in the database (`plants.ts`) carries:
- `type`: `"vegetable"` | `"herb"` | `"flower"`
- `daysToMaturity`: used to schedule harvest windows
- `minSunlight`: filtered against the area's sunlight level
- `spacingFt`: rendered in the detail panel in the user's preferred unit
- `startIndoors` + `indoorWeeksAhead`: used to schedule seed-start actions
- `gardenBenefits`: `pollinatorSupport`, `pestDeterrence`, `companionPlanting`, `visualAppeal`
- `badCompanions`: plant IDs that trigger conflict warnings on the map

Flowers receive special treatment — they show a "Bloom Watch" action type in the schedule and their detail panel shows "Days to Bloom" and garden role notes instead of harvest timing.

---

## Imperial / Metric Conversion

Users select their preferred unit system (Imperial or Metric) at the top of Step 2. All internal values are stored in **feet** regardless of the display unit:

- `lengthFt` and `widthFt` on each `GardenArea` are always in feet
- Display conversion happens at render time via `displayDimension(ft, unitPreference)` in `utils/units.ts`
- The dimension inputs re-compute when the unit toggle changes; the stored ft values are the source of truth
- Plant spacing in the garden-map detail panel is converted at render time via `formatSpacing(spacingFt, unit)`, which outputs inches, feet, centimetres, or metres as appropriate
- The downloaded Markdown plan uses the user's preferred unit for all displayed dimensions
- A maximum dimension cap (20 ft / 6.1 m per side) is enforced in the input handler and shown as a user-facing warning

---

## Live Weather Risk Advisories

The weather risk feature (`useWeatherRisk` hook + `WeatherRiskCard` component) fetches a 7-day hourly forecast from the **Open-Meteo** free API using the coordinates of the selected city. The hook then classifies the week into up to four risk types:

| Risk | Trigger |
|---|---|
| Frost risk | Any hour below 2 °C in the next 7 days |
| Heat stress | Any day above 30 °C |
| Heavy rain | Accumulated precipitation above 25 mm in any 24-hour window |
| Dry spell | Zero precipitation for 5+ consecutive days |

Each risk carries a severity level (high / medium / low), a human-readable label, and a detail sentence. The card also surfaces a list of recommended actions (e.g., "Cover tender transplants tonight"). If the API call fails, the card shows a graceful fallback message and the plan continues to function using the static frost-date table.

---

## How to Run Locally

### Prerequisites
- Node.js 22+ (Node 24 recommended)
- pnpm 10+
- PostgreSQL 15+ (local or hosted)

### Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd growit

# 2. Install dependencies
pnpm install

# 3. Set environment variables (see section below)
cp .env.example .env
# Edit .env with your values

# 4. Push the database schema
pnpm --filter @workspace/db run push

# 5. Start the API server (port 5000)
pnpm --filter @workspace/api-server run dev

# 6. Start the frontend (port auto-assigned)
pnpm --filter @workspace/growit-plus run dev
```

The app is served through a shared reverse proxy. In development the frontend is at `http://localhost:<PORT>/` and the API is at `http://localhost:<PORT>/api`.

### Useful commands

```bash
# Type-check all packages
pnpm run typecheck

# Regenerate API hooks from OpenAPI spec
pnpm --filter @workspace/api-spec run codegen

# Build all packages
pnpm run build
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | Yes | Secret used to sign session cookies. Use a long random string (32+ chars). Never commit this value. |
| `DATABASE_URL` | Yes | PostgreSQL connection string, e.g. `postgres://user:pass@localhost:5432/growit` |
| `OPENAI_API_KEY` | No | API key for the AI plan generation and photo analysis routes. If absent, the app falls back to the deterministic plan generator. |
| `PORT` | No | Port for the API server. Defaults to `5000`. Set automatically by the Replit workflow system. |
| `BASE_PATH` | No | Base path prefix for the API server. Set automatically by the Replit reverse proxy. |

Create a `.env` file in the workspace root (never commit it). Example:

```
SESSION_SECRET=replace-with-a-long-random-string
DATABASE_URL=postgres://postgres:password@localhost:5432/growit
OPENAI_API_KEY=sk-...
```

---

## Known Limitations

- **Alberta only** — Frost dates and climate zones are currently hardcoded for six Alberta cities. No other Canadian provinces or US regions are supported.
- **Six cities** — Only Calgary, Edmonton, Red Deer, Airdrie, Cochrane, and Okotoks are available. Rural or small-town users should select their nearest city.
- **Frost dates are historical averages** — Dates are based on Environment Canada historical records, not real-time long-range forecasting. An unusually early or late frost year will not be reflected.
- **AI plan generation requires a valid API key** — Without `OPENAI_API_KEY`, the app falls back to the deterministic generator. The fallback is fully functional but does not include AI-written growing notes.
- **No cross-device sync** — Plans are saved to `localStorage` and are lost if the browser cache is cleared or a different device is used (unless the user downloads the Markdown file).
- **Photo analyser accuracy** — The AI light/soil detection from a garden photo is best-effort and may misread unusual conditions (deep shade, overexposed photos, snow cover). Always verify the pre-filled values.
- **Plant database scope** — The database includes 34 plants (15 vegetables, 9 herbs, 10 flowers) common to Alberta gardens. Unusual or specialty varieties are not included; use the custom-plant entry for these.
- **No real-time soil data** — Soil type is self-reported. The app does not connect to soil databases or mapping services.

---

## Future Enhancements

- **More Alberta regions** — Lethbridge, Medicine Hat, Grande Prairie, Fort McMurray, and rural zones
- **User accounts with cloud sync** — Save and share multiple plans across devices
- **Planting reminders** — Push notifications or email reminders keyed to the schedule (requires accounts)
- **Succession planting** — Generate staggered planting dates for continuous harvest of quick-maturing crops
- **Seed inventory tracking** — Log which seeds you have on hand and generate a shopping list for gaps
- **Alberta Garden Network integration** — Pull community frost reports to calibrate dates in real time
- **Soil testing integration** — Connect to Alberta Agriculture soil database for more precise soil classification
- **Year-over-year journaling** — Photograph plant progress week by week and build a garden history
- **Native plant support** — Extend the flower database with Alberta native species for pollinator corridors
- **Full PWA** — Service worker + offline mode so the plan is accessible without internet at the garden centre

---

## Course Context

This project was created as part of:

> **ENTI 633 — Generative AI and Prompting**
> Haskayne School of Business, University of Calgary
> Instructor course on applied use of large language models in entrepreneurship and product development

The project demonstrates end-to-end AI-assisted product development: from problem identification and solution design through to a deployed, functional web application — without the developer writing raw code by hand. All implementation was guided through natural-language prompts to a generative AI coding assistant.

---

## License

MIT — see [LICENSE](./LICENSE)

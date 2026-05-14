# SproutIt

**A location-aware, mobile-first garden planning web app built for Alberta homeowners.**

---

## Product Description

SproutIt is a free, account-optional web application that generates a personalised vegetable, herb, and flower garden plan calibrated to your specific Alberta location. You answer four questions — where you live, how big your garden beds are, and what you want to grow — and SproutIt produces a colour-coded garden map, a week-by-week planting schedule anchored to your city's historical frost dates, and a live 7-day weather risk advisory. No sign-up, no spreadsheets, no guesswork.

---

## Business Problem

Beginner and casual gardeners often don't know **what** to plant, **when** to plant it, or **where** to put it in their garden. Local growing seasons and frost dates are confusing — planting even one or two weeks too early or too late can mean losing an entire crop. Plant placement and timing are difficult to plan from scratch, and generic chatbot answers, while informative, are unstructured: they don't translate into an actionable garden map, a week-by-week schedule, or a downloadable plan you can take outside.

The MVP is anchored in Alberta (Zone 3–4a, with a 100–120 frost-free-day season) because short-season growers feel this pain most acutely and existing gardening apps are designed for temperate climates. The same architecture is intended to expand to other short-season regions across Canada.

---

## Target Users

- **Beginner gardeners** who want a structured, data-backed starting point instead of a wall of forum advice
- **Homeowners with small yards** who want a clear plan for one or two beds
- **Balcony and container gardeners** who can pick "Container/Pots" as their soil type and still get a usable plan
- **Users in short-season growing regions** (currently Alberta) where timing is the difference between a harvest and a loss
- **Gardeners who want vegetables, herbs, and flowers planned together** in one map and one schedule, not three separate tools

---

## MVP Features

| Feature | Details |
|---|---|
| Location-aware setup | Six selectable Alberta growing regions, each with its own historical frost dates and zone. Calgary is the default demo region; users can switch to Edmonton, Red Deer, Airdrie, Cochrane, or Okotoks at any time. |
| Multi-area garden setup | Up to five named garden beds with individual dimensions, sunlight level (5 options), and soil type |
| Imperial / metric toggle | All dimensions entered and stored in feet internally; displayed in the user's preferred unit throughout |
| Garden goal selection | Six goals (Beginner-friendly, Vegetable-focused, Herbs & Flowers, Pollinator-friendly, Family/Kid-friendly, Custom) that drive automatic plant recommendations |
| Manual plant selection | Full override: choose from 53 plants across vegetables, herbs, flowers, and foliage & ornamental plants |
| Custom plant entry | Add any plant not in the database with category, basic schedule, and caution notes |
| Companion-planting placement | Companion rules are used internally to inform plant placement on the map; no warning UI is shown to the user |
| Garden map | Colour-coded grid (green = vegetable, gold = herb, pink = flower, sage = foliage & ornamental) with per-cell detail panel showing spacing, action type, days to maturity, and care notes |
| Week-by-week schedule | Collapsible timeline from first indoor seed start to last fall frost, with current-week highlight |
| AI-enhanced plan | Optional AI layer (OpenAI-compatible) refines plant selection and adds growing notes; deterministic fallback on any failure |
| Photo scanner | Inline within each garden area card — tap "Scan my garden photo" to upload a JPG or PNG. The photo appears immediately as a full-width preview; the AI then estimates sunlight level and soil/container type with high / medium / low confidence labels, pre-fills the form fields, and shows a "Photo analysis" result panel. If analysis fails, the photo stays visible and manual entry is unaffected. |
| Weather risk card | Live 7-day forecast via Open-Meteo; surfaces frost risk, heat stress, heavy rain, and dry-spell advisories specific to your garden |
| Resumable questionnaire | Back navigation moves one step at a time and preserves all answers; returning from the frost-confirmation screen restores Step 4 instead of restarting |
| Alert preferences (preview) | Step 4 lets users preview which alerts they would like to receive; push notifications are scheduled for the next release |
| Post-plan plant editing | Edit the plant list on the plan page and regenerate the map and schedule without starting over |
| Download & share | Export plan as a branded multi-page PDF (jsPDF) with paginated schedule cards and category-grouped plant lists; share via Web Share API with clipboard fallback |
| Print styling | All three plan tabs (Map, Schedule, Plants) visible in print; colour-accurate; A4 page margins |
| No account required | Plans saved to `localStorage`; returning users see their last plan |
| Optional account sync | Sign in with Replit to save your plan to your account so it follows you across devices and browsers. Guest plans are automatically migrated to your account on first login; if both a guest plan and an account plan exist, the app asks which one to keep. Sync failures show a non-blocking banner and the local plan stays usable. |

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

### Infrastructure & Tooling
| Layer | Technology |
|---|---|
| Hosting & dev environment | Replit (workspace, workflows, secrets, deployment) |
| AI development assistant | Replit Agent (primary build), ChatGPT (planning, prompts, QA) |
| Monorepo | pnpm workspaces |
| Reverse proxy | Replit path-based shared proxy |
| Weather data | Open-Meteo (open, no API key required) |
| AI inference | OpenAI-compatible API via Replit AI Integrations proxy |
| Persistence | Browser `localStorage` for guests; PostgreSQL (one row per user, keyed by Replit `sub`) for signed-in users — local cache is kept as an offline fallback |
| Auth | Replit Auth (optional sign-in, OpenID Connect with PKCE) — gates only the `/api/plans` sync endpoints |

---

## How AI-Assisted Development Was Used

SproutIt was built using AI-assisted development tools, with a clear division of labour:

- **Replit Agent** was the primary development tool, used to scaffold the monorepo, generate React components and Express routes, run typechecks, fix bugs, and apply iterative polish.
- **ChatGPT** was used for upstream work: refining product requirements, planning prompt structures, drafting QA checklists, and producing this documentation.

Importantly, **AI did not write the app independently**. The team reviewed every change, ran the app after each iteration, identified bugs and gaps, drafted explicit specs (e.g. for the photo scanner, plant rules, and weekly schedule), and directed the AI through targeted instructions. Each round followed a *spec → generate → review → test → revise* loop, and the team kept final authority on scope, copy, visual design, and what shipped.

Specific AI-assisted activities included:

1. **Architecture design** — proposing a monorepo structure, contract-first OpenAPI workflow, and deterministic-first plan generation strategy
2. **Feature implementation** — generating TypeScript components, hooks, and route handlers from natural-language descriptions
3. **Debugging** — diagnosing errors and stack traces against the actual codebase and proposing fixes
4. **Data modelling** — drafting Zod schemas, Drizzle tables, and OpenAPI fragments
5. **In-app prompt engineering** — designing the system/user prompts sent to the AI plan-generation and photo-analysis routes so they return structured JSON that the deterministic generator can augment safely

The project demonstrates that, with disciplined prompting and human review, AI tooling can ship a full-stack web application end to end — *with* the team, not *instead of* it.

---

## How SproutIt Is Different From a Plain Chatbot

A general-purpose chatbot can give useful gardening advice, but the answers are unstructured prose: a paragraph about tomatoes, a list of tips, no plan you can actually use outside. SproutIt turns the same underlying knowledge into a working planning tool by combining:

| Layer | What SproutIt adds over a chatbot |
|---|---|
| Structured questionnaire | Captures region, units, garden areas, sunlight, soil, and plant preferences in a guided 4-step flow — no prompt engineering required |
| Location-specific frost dates | Six Alberta cities with hardcoded last-spring / first-fall frost dates and climate zones drive every scheduling decision |
| Curated plant whitelist | 53 region-vetted vegetables, herbs, flowers, and foliage & ornamental plants with structured metadata (sunlight needs, spacing, days to maturity, indoor weeks ahead) instead of free-text plant names |
| Garden-area constraints | Per-area dimensions, sunlight, soil type, and 20 ft / 6.1 m caps are enforced — the plan is sized to the user's actual space |
| Deterministic fallback logic | Every plan is generated by a local algorithm first; AI augmentation is optional and never blocks a plan |
| Visual garden map | A grid view per area, colour-coded by category, with per-cell plant detail panels — not a wall of text |
| Week-by-week schedule | Frost-anchored timeline of "start indoors", "transplant", "direct sow", "harvest", and quiet weeks, with the current week highlighted |
| Weather-risk advisory | Live Open-Meteo 7-day forecast classified into frost / heat / heavy-rain / dry-spell risks with concrete actions, falling back gracefully if the API is down |
| Photo scanner | Always-visible inline card within each garden area. Upload a photo → instant preview → AI analysis result panel with confidence labels → form fields pre-filled. No toggle or dropdown required. |
| Download / share workflow | Branded PDF export and Web Share API (with clipboard fallback) so the plan goes from app to fridge to garden without re-typing |

The result is a planning tool, not a conversation. The user gets a plan they can act on the same day, in the unit system they prefer, sized to their actual beds.

---

## Location-Specific Frost Dates and Plant Rules

Every Alberta city in SproutIt has a hardcoded frost date table (`artifacts/growit-plus/src/data/locations.ts`):

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

## Vegetables, Herbs, Flowers, and Foliage & Ornamental Plants

Plants are organised into four categories with distinct visual treatment throughout the app:

| Category | Map colour | Badge colour | Examples |
|---|---|---|---|
| Vegetable | Green (`#DFF0E6`) | Green pill | Tomato, Carrot, Kale, Zucchini, Pea |
| Herb | Gold (`#F5EDD8`) | Gold pill | Basil, Dill, Chives, Mint, Oregano |
| Flower | Pink (`#F5E8F2`) | Pink pill | Nasturtium, Marigold, Lavender, Cosmos |
| Foliage & Ornamental | Sage (`#DCE9E0`) | Sage pill | Hostas, Ferns, Ornamental Grasses, Boxwood, Juniper, Coral Bells, Brunnera, Bergenia, Solomon's Seal |

Each plant in the database (`plants.ts`) carries:
- `type`: `"vegetable"` | `"herb"` | `"flower"` | `"foliage"`
- `daysToMaturity`: used to schedule harvest windows
- `minSunlight`: filtered against the area's sunlight level
- `spacingFt`: rendered in the detail panel in the user's preferred unit
- `startIndoors` + `indoorWeeksAhead`: used to schedule seed-start actions
- `gardenBenefits`: `pollinatorSupport`, `pestDeterrence`, `companionPlanting`, `visualAppeal`
- `badCompanions`: plant IDs that the placement algorithm avoids putting adjacent on the map (used internally only — no warning UI is shown)

Flowers receive special treatment — they show a "Bloom Watch" action type in the schedule and their detail panel shows "Days to Bloom" and garden role notes instead of harvest timing.

---

## Imperial / Metric Conversion

Users select their preferred unit system (Imperial or Metric) at the top of Step 2. All internal values are stored in **feet** regardless of the display unit:

- `lengthFt` and `widthFt` on each `GardenArea` are always in feet
- Display conversion happens at render time via `displayDimension(ft, unitPreference)` in `utils/units.ts`
- The dimension inputs re-compute when the unit toggle changes; the stored ft values are the source of truth
- Plant spacing in the garden-map detail panel is converted at render time via `formatSpacing(spacingFt, unit)`, which outputs inches, feet, centimetres, or metres as appropriate
- The downloaded PDF plan uses the user's preferred unit for all displayed dimensions
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
OPENAI_API_KEY=your-openai-api-key-here
```

> **Security:** Never commit `.env` files, real API keys, or session secrets to GitHub. On Replit, store secrets in the **Secrets** panel; locally, use a `.env` file that is excluded by `.gitignore` (see this repo's `.gitignore` for the pattern).

---

## Known Limitations

- **Alberta only** — Frost dates and climate zones are currently hardcoded for six Alberta cities. No other Canadian provinces or US regions are supported.
- **Six cities** — Only Calgary, Edmonton, Red Deer, Airdrie, Cochrane, and Okotoks are available. Rural or small-town users should select their nearest city.
- **Frost dates are historical averages** — Dates are based on Environment Canada historical records, not real-time long-range forecasting. An unusually early or late frost year will not be reflected.
- **AI plan generation requires a valid API key** — Without `OPENAI_API_KEY`, the app falls back to the deterministic generator. The fallback is fully functional but does not include AI-written growing notes.
- **Cross-device sync requires sign-in** — Guest plans are saved to `localStorage` only and are lost if the browser cache is cleared or a different device is used (unless the user downloads the PDF). Signing in with Replit Auth syncs the active plan to PostgreSQL so it follows the user across devices.
- **One saved plan per signed-in user** — Each authenticated user has at most one synced plan (the most recent one). Multi-plan history is not yet supported.
- **Server-side sessions are in-memory** — Auth sessions are kept in a process-local map; restarting the API server signs everyone out. Saved plans are unaffected (they live in PostgreSQL).
- **Photo analyser accuracy** — The AI light/soil detection from a garden photo is best-effort and may misread unusual conditions (deep shade, overexposed photos, snow cover). Always verify the pre-filled values.
- **Plant database scope** — The database includes 53 plants (15 vegetables, 9 herbs, 10 flowers, 19 foliage & ornamental) common to Alberta gardens. Unusual or specialty varieties are not included; use the custom-plant entry for these.
- **No real-time soil data** — Soil type is self-reported. The app does not connect to soil databases or mapping services.
- **Alert preferences are a preview feature** — Step 4 of the questionnaire collects alert preferences (frost warnings, hail alerts, planting reminders, watering days) and a preferred notification time, but no push-notification or email service is wired up yet. The screen is clearly labelled "Coming soon" and the preferences are not persisted between sessions.
- **Plants Timeline temporarily hidden** — The timeline view on the Plants tab is hidden in this build because the bar-rendering data is incomplete. The plant list, care notes, and schedule view remain fully functional.
- **Companion conflict warnings are intentionally suppressed** — Companion-planting rules still inform internal plant placement, but per the MVP design no warning badges, conflict notices, or "incompatible neighbour" text are surfaced to the user.
- **Educational planning support, not professional advice** — SproutIt is designed as a planning aid for home gardeners. It does not replace local horticultural expertise, soil testing, or guidance from a master gardener.
- **Photo scanner does not diagnose pests or disease** — It only estimates sunlight level and soil/container type. It will not identify plant pests, fungal disease, nutrient deficiency, or any other plant-health issue.
- **Custom plants may not have verified local growing rules** — Plants added via the custom-entry field do not go through the regional whitelist, so their fit with the selected region, sunlight, and frost window is not validated.
- **Weather-risk advisory is short-term** — The card surfaces the next 7 days only and should not replace local judgement about long-range conditions.
- **No payment or admin features in the MVP** — There is no premium tier, no e-commerce, no analytics, and no admin dashboard. Replit Auth is wired as an optional sign-in; it is only used to enable cross-device plan sync and does not gate any other feature.

---

## Future Enhancements

- **Broader Canadian growing regions** — Expand beyond Alberta to other short-season provinces (Saskatchewan, Manitoba, Quebec interior, Atlantic Canada), and eventually US zones with similar climate profiles
- **Richer plant database** — Significantly more vegetables, herbs, flowers, native species, and small fruits, with deeper region-by-region suitability data
- **Improved AI plan generation** — Better prompt structure, model choice, and validation so the AI layer adds more reliable growing notes and per-plant care guidance
- **Gemini / video garden walkthrough analysis** — Allow users to upload a short video walk-through of their yard so the system can identify multiple zones (sun pockets, shade, slope) instead of one photo at a time
- **Multi-plan account history** — Saving and restoring more than one named plan per account (the current build syncs a single active plan per signed-in user)
- **Persistent server sessions** — Move auth sessions from the in-memory map to a `sessions` table or Redis so deployments don't sign users out
- **Multi-season crop rotation** — Plan year 2 and year 3 layouts that rotate plant families to maintain soil health
- **Deeper companion-planting education** — Surface the "why" behind plant pairings (pest deterrence, pollinator support, nutrient balance) as opt-in learning content
- **Nursery / seed supplier integrations** — Direct links to local suppliers for the plants in the plan, with availability and seed-vs-transplant filters
- **Push notifications and email reminders** — Tie the existing alert preferences to a real notification service
- **Succession planting** — Staggered planting dates for continuous harvest of quick-maturing crops
- **Native mobile app** — A React Native / Expo build if usage justifies it, with offline mode so the plan is usable at the garden without internet
- **Year-over-year journaling** — Weekly photo progress and a personal garden history

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

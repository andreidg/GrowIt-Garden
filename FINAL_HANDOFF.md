# SproutIt — Final Handoff

## 1. App name
**SproutIt** — a location-aware, mobile-first garden planning web app for Alberta homeowners.

## 2. Deployed app URL
https://sproutit.replit.app/

The app is published as a static frontend + Express API on Replit Deployments. The deployment URL is also exposed via `$REPLIT_DOMAINS` at runtime.

## 3. GitHub repository URL
https://github.com/andreidg/SproutIt

## 4. Product summary
SproutIt turns four short answers — your Alberta city, your garden dimensions, your light/soil conditions, and what you want to grow — into a complete garden plan: a colour-coded garden map, a frost-anchored week-by-week planting schedule, a curated plant list across vegetables / herbs / flowers / foliage, and a live 7-day weather-risk advisory. It works without an account (plans persist in `localStorage`), and signing in with Replit Auth syncs the active plan to a PostgreSQL-backed account so it follows the user across devices and browsers.

## 5. Core MVP features
- **Location-aware setup** — six Alberta cities with hardcoded frost dates and zones; Calgary is the default demo region.
- **Multi-area garden setup** — up to five named beds, each with its own dimensions, sunlight level (5 options), and soil/container type. Imperial / metric toggle with 20 ft / 6.1 m caps.
- **Photo scanner** — upload a garden photo to auto-fill sunlight and soil for the primary area, with high / medium / low confidence labels and graceful fallback to manual entry.
- **Garden goals + manual / custom plant selection** — six goals plus full manual override across 53 plants in four categories (vegetables, herbs, flowers, foliage & ornamental). Custom plants can be added by name with category and caution notes. Custom Selection has a pill-shaped, cross-category search.
- **Deterministic plan generator** — sunlight-tolerant placement, per-area grids, internal companion logic. AI augmentation is optional and never blocks generation.
- **Plan view** — Garden Map (colour-coded grid + per-cell detail panel), Schedule (frost-anchored weekly timeline with current-week highlight), and Plants (category-grouped list with edit/regenerate).
- **Weather-risk card** — live 7-day Open-Meteo advisory (frost / heat / heavy rain / dry spell) with graceful fallback if the API is down.
- **Download & share** — branded multi-page PDF (jsPDF) and Web Share API with clipboard fallback.
- **Optional account sync** — sign in with Replit to save your active plan to PostgreSQL; guest plans auto-migrate on first login; conflicts are resolved with a "keep account / replace with this device's plan" modal; sync failures show a non-blocking banner and the local plan stays usable.

## 6. Recommended 2–3 minute demo flow
See [`DEMO_SCRIPT.md`](./DEMO_SCRIPT.md) for the full script. Short version:
1. Open the deployed URL → landing page → **Start your plan**.
2. Pick **Calgary** (mention it's the default but other regions work).
3. Add a **10 ft × 8 ft** raised bed, **Part Sun**, **Loam**.
4. (Optional) Upload a sample garden photo to demo the scanner.
5. Choose **Custom Selection** → search **"mar"** → select Marigolds + a couple of vegetables.
6. Generate plan → walk through Map → Schedule → Plants tabs.
7. Show **Download Plan** (PDF) and **Share Plan**.
8. (Optional) Sign in → show the plan persists in the account.

## 7. Technology stack
- **Frontend**: React 19, Vite 6, TypeScript 5.9 (strict), Tailwind v4, shadcn/ui, Wouter, jsPDF.
- **Backend**: Express 5 on Node.js 24, Pino logging, Zod v4 validation.
- **Database**: PostgreSQL via Drizzle ORM. Single new table `garden_plans (user_id PK, plan_json jsonb, created_at, updated_at)`.
- **Auth**: Replit Auth (OpenID Connect with PKCE), HTTP-only session cookie (`growit_sid`), in-memory session map.
- **AI**: OpenAI-compatible plan generation and photo analysis via the Replit AI Integrations proxy. Deterministic fallback always wins on failure.
- **Weather**: Open-Meteo (no API key required).
- **API contract**: OpenAPI 3.1 → Orval codegen (React Query hooks + Zod schemas).
- **Build**: pnpm workspaces, esbuild (server CJS bundle), Vite (frontend).
- **Hosting**: Replit Deployments (static frontend + API server) behind Replit's path-based reverse proxy.

## 8. AI-assisted development summary
SproutIt was built end-to-end with AI-assisted development:
- **Replit Agent** scaffolded the monorepo, generated React components and Express routes, wrote and ran the deterministic plan generator, fixed bugs, and applied iterative polish.
- **ChatGPT** was used upstream for product discovery, prompt design, QA checklists, and copy/documentation.
- The team owned scope, copy, visual design, and what shipped. Each iteration followed a *spec → generate → review → test → revise* loop. AI did **not** write the app independently — every change was reviewed and tested.

## 9. Known limitations
- **Alberta only**, six cities (Calgary, Edmonton, Red Deer, Airdrie, Cochrane, Okotoks).
- Frost dates are historical averages, not real-time long-range forecasts.
- AI plan generation is optional — without `OPENAI_API_KEY` the deterministic generator runs alone (fully functional, no AI growing notes).
- One saved plan per signed-in user — multi-plan history is not yet supported.
- Server-side auth sessions are in-memory; redeploying signs everyone out (saved plans in PostgreSQL are unaffected).
- Photo scanner only estimates sunlight and soil/container — it does **not** identify pests, disease, plant species, or property location.
- Custom plants bypass the regional whitelist and are not validated against frost windows.
- Weather risk advisory is short-term (7 days).
- Alert preferences (Step 4) are a preview only — no notification service is wired up.
- Plants Timeline view is intentionally hidden in this build.
- Companion-planting conflict warnings are intentionally suppressed in the UI; the rules still inform internal placement.
- No payments, premium tier, e-commerce, or admin dashboard.

## 10. Future enhancements
- Broader Canadian / US growing regions and richer plant database.
- Multi-plan account history and persistent (DB-backed) auth sessions.
- Improved AI plan generation prompts and validation.
- Video garden walkthrough analysis (multi-zone sun/shade detection).
- Multi-season crop rotation and succession planting.
- Push / email reminders tied to alert preferences.
- Nursery / seed supplier integrations.
- Native mobile (Expo) build with offline mode.
- Year-over-year garden journaling.

## 11. Environment variables needed
| Variable | Required | Description |
|---|---|---|
| `SESSION_SECRET` | Yes | Long random string used to sign session cookies. |
| `DATABASE_URL` | Yes | PostgreSQL connection string. |
| `OPENAI_API_KEY` | No | Enables AI plan augmentation and photo analysis. App falls back gracefully if missing. |
| `PORT` | No | Set automatically by the Replit workflow. |
| `BASE_PATH` | No | Set automatically by the Replit reverse proxy. |
| `REPLIT_DOMAINS` | No (auto) | Set in Replit Deployments; used by Replit Auth callbacks. |

Never commit real values. Use the Replit **Secrets** panel in development and the Deployments secrets UI in production.

## 12. Final D2L submission checklist
- [ ] **GitHub repository link** — _add before submission_
- [ ] **Deployed app link** — _add before submission_
- [ ] **Blog / article link** — _add before submission_
- [ ] **Video walkthrough link** — _add before submission_
- [ ] **Presentation slides link / attachment** — _add before submission_
- [x] README.md updated and accurate
- [x] LICENSE present (MIT)
- [x] FINAL_HANDOFF.md present (this file)
- [x] DEMO_SCRIPT.md present
- [x] Typecheck clean across all packages
- [x] App deployed and reachable

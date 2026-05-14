# GrowIt — 2–3 Minute Demo Script

**Audience:** ENTI 633 video walkthrough.
**Goal:** Show that GrowIt turns four short answers into a real, location-specific garden plan — not a chatbot reply.
**Default demo region:** Calgary. (Mention once that GrowIt is location-aware and not Calgary-only — Edmonton, Red Deer, Airdrie, Cochrane, and Okotoks are all selectable.)

---

## Opening (≈ 15 sec)

> "Beginner gardeners in Alberta lose entire crops because they don't know what to plant, when to plant it, or where to put it. A chatbot can give them a paragraph of tips. **GrowIt** gives them a real plan — a garden map, a week-by-week schedule, and a downloadable PDF — calibrated to their city's frost dates and the actual size of their beds."

Show the landing page on a phone-width preview while saying this.

---

## Step 1 — Region (≈ 15 sec)

**Click:** **Start your plan** → Region step.

**Say:**
> "Calgary is the default for this demo, but GrowIt is location-aware — six Alberta cities are wired up today, each with its own historical frost dates. Pick a region and the entire schedule re-anchors to your local frost window."

**Do:** Quickly open the region dropdown to show the other cities, then leave **Calgary** selected → **Next**.

---

## Step 2 — Garden setup (≈ 30 sec)

**Inputs to enter:**
- Area name: **Backyard bed**
- Dimensions: **10 ft × 8 ft** (briefly toggle Imperial ↔ Metric to show ~3 m × 2.4 m and toggle back)
- Sunlight: **Part Sun**
- Soil: **Loam**

**Say:**
> "I can add multiple garden areas. Each one has its own dimensions, sunlight level, and soil type. The 20 ft / 6.1 m cap matches what most homeowners can actually plant."

**Optional (only if photo is ready):** Tap **Scan my garden photo**, upload a sample image.
> "I can also upload a photo and GrowIt's scanner estimates sunlight and soil for me with a confidence label. It does not identify pests or plant species — it just speeds up these two fields. If it fails, the photo stays visible and I can keep editing manually."

→ **Next**.

---

## Step 3 — Plants (≈ 30 sec)

**Click:** **Custom Selection** → show the search bar.

**Demo inputs:**
- Type **mar** in search → point at **Marigolds** appearing → select.
- Clear the search.
- Add **Tomato**, **Basil**, **Hostas** (one from each of vegetables, herbs, foliage).

**Say:**
> "Custom Selection is the source of truth — if I only pick these four plants, GrowIt won't sneak in a generic mixed garden. The search runs across all four categories — vegetables, herbs, flowers, and foliage & ornamental plants — and selections stay even when I clear the search."

→ **Generate plan**.

---

## Step 4 — Plan view (≈ 45 sec)

**Tabs to walk through, in order:**

1. **Map**
   > "Here's the garden as a colour-coded grid — green for vegetables, gold for herbs, pink for flowers, sage for foliage. Each cell shows the plant and tapping it gives spacing and care details. The grid scrolls horizontally on small screens so the left side never gets cut off."

2. **Schedule**
   > "Every action is anchored to Calgary's last spring frost (May 14) and first fall frost (September 17). Start indoors, transplant, direct sow, harvest — current week is highlighted. Empty weeks just say 'No actions this week — just water and watch'."

3. **Plants**
   > "And here's the plant list grouped by category, with care notes. I can edit plant selections from here and regenerate without starting over."

4. **Weather card** (scroll up briefly)
   > "Live 7-day Open-Meteo forecast classified into frost, heat, heavy-rain, and dry-spell risks. If the weather API is down, this falls back to a friendly message and the plan still works."

---

## Step 5 — Download / share / save (≈ 20 sec)

- Click **Download Plan** → show the branded PDF preview.
  > "Branded multi-page PDF — title, region, garden summary, plant list, map, full schedule, weather notes — paginated cleanly so cards don't get cut across pages."
- Click **Share Plan** → show the share sheet or "Plan summary copied to clipboard" toast.
- (Optional) Tap **Sign in** → after Replit Auth round-trip:
  > "If I sign in with Replit, my plan is saved to my account and follows me to any device. I can sign out, log in on a phone, and the same plan is there."

---

## Closing (≈ 15 sec)

> "That's the whole point of GrowIt — a chatbot can describe what tomatoes need. GrowIt gives me a *plan I can take outside*: my beds, my city's frost dates, my plants, on one page, with the schedule that tells me exactly what to do this week. No account required to try it, account sync if I want it."

---

## What **not** to spend time on

- Don't read out long care notes — point at them, move on.
- Don't toggle every region or every plant — show one example each.
- Don't open the alert-preferences screen — it's preview-only ("Coming soon").
- Don't open the Plants Timeline — it's intentionally hidden in this build.
- Don't paste real API keys, secrets, or session cookies on screen.
- Don't claim pest, disease, or plant-species identification — the photo scanner doesn't do that.
- Don't claim plans for any region outside the six Alberta cities.

---

## Suggested demo inputs (cheat sheet)

| Step | Field | Value |
|---|---|---|
| 1 | Region | Calgary |
| 2 | Area name | Backyard bed |
| 2 | Dimensions | 10 ft × 8 ft |
| 2 | Sunlight | Part Sun |
| 2 | Soil | Loam |
| 3 | Mode | Custom Selection |
| 3 | Search demo | "mar" → Marigolds |
| 3 | Selected plants | Marigolds, Tomato, Basil, Hostas |
| 5 | Sign-in | Optional — only if time allows |

Total runtime target: **2 min 30 sec**.

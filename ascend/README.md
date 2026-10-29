# ASCEND — Earn Your Rank

A private, mobile-first gym tracker with a strength-ranking system, a rules-based coach and goal tracking. It's a zero-dependency installable web app (PWA): plain ES modules, no build step, works offline, and stores all data on the device.

## Run it

```bash
python3 -m http.server 4321 --directory ascend   # or any static server
# open http://127.0.0.1:4321/  (on a phone: Share → Add to Home Screen)
```

When the repo is published with GitHub Pages it is served at `/ascend/`.

| Command | What it does |
| --- | --- |
| `npm run test:ascend` | Engine unit tests (`node --test`, no install needed) |
| `node ascend/tests/e2e.mjs` | Browser test of the critical flows: onboarding → split editing → 3 logged workouts → PR + rank reveal → goal change → persistence across reload → dark mode/desktop. Needs the static server above and Playwright. Screenshots go to `e2e-output/ascend` |

## Features

- **Onboarding**: age, units, height, body weight, experience, training days, equipment, current split, main and secondary goals, a specific target with an optional date, and strength-standard context.
- **Split builder**: 10 templates (PPL, Upper/Lower, Arnold, Full Body, Bro, 4/5/6-day, Fully Custom). Templates adapt to your equipment and number of training days. You can rename days, reorder or swap exercises, edit sets/reps/rest/RPE/warm-ups/notes, assign weekdays or rest days, and duplicate days or whole splits.
- **Exercise library**: 75+ exercises with muscles, equipment, technique cues and alternatives. It's searchable and filterable, and you can add custom exercises.
- **Live workout**: shows last session and today's target for each exercise. It has instant set logging with weight, reps and RPE, auto rest timer, warm-up ramps, add/duplicate/delete sets, swap exercises mid-workout, notes, pause/resume, and a summary at the end. An in-progress workout survives reloads.
- **Strength Rank**: Unranked → Iron → Bronze → Silver → Gold → Platinum → Diamond → Elite → Titan → Ascendant. Each rank has its own procedural SVG insignia. The **Rank** tab explains exactly how the score is calculated (see below).
- **Cinematic reveal**: a five-second canvas + CSS sequence with a marble surface, light beam, metal fragments, ring, emblem assembly, lock-in pulse, title and progress bar. Sound and haptics are optional. It's skippable and respects reduced motion. A shorter version plays for PRs and goal milestones.
- **Coach (rules-based, on-device, clearly labelled)**: double progression, small load increases that need your confirmation, stall detection with reset/variation options, re-entry after breaks, readiness check-ins, volume-balance and workload-spike warnings, rest-day prompts, and goal plans that give a range in weeks, never a guaranteed date. Users under 18 get technique-first guidance and no max attempts.
- **Goals**: lift, rep, body-weight, consistency or custom goals. The main goal gets a mission dashboard with a progress ring, milestones, recent change and next action.
- **Analytics**: e1RM, weekly volume, consistency against your plan, muscle distribution, body weight and goal progress, filterable from a week to all time. Every chart uses logged data only.
- **XP & achievements**: 18 achievements, levels, and unlockable accent themes, profile frames and titles. Sessions beyond the weekly plan earn no workout XP.
- **Also**: calendar, history, workout duplication ("repeat this workout"), PR history, streaks, lbs/kg switching, private progress photos, dark mode, JSON/CSV export, restore, automatic snapshots, and optional reminders.

## How the rank works

1. **e1RM per working set** = average of Epley `w·(1+r/30)` and Brzycki `w·36/(37−r)`, with `r = reps + RIR` (RIR = 10 − RPE). Sets above 12 effective reps and warm-ups don't count.
2. Rank-eligible exercises map to five **movement patterns** (squat, hinge, press, overhead, pull) through fixed reference-lift factors. Body-weight lifts include body weight.
3. **e1RM ÷ body weight** is placed on approximate community strength-standard bands (male / female / blended) and mapped to 0–100. Strength = mean of trained patterns × (0.6 + 0.4 × coverage).
4. **Anti-inflation**: one session can raise a pattern's verified strength by at most 10%, implausible entries are ignored, 3 placement workouts are required, and volume never adds score.
5. **Score** = 0.75 Strength + 0.15 Consistency (capped at your plan) + 0.10 Improvement (12-week verified gain, measured at least a week after the baseline). Under 18: 0.4 Consistency + 0.3 Improvement + 0.3 Technique milestones, with no adult standards.

Ranks are a fictional motivational ladder, not a validated classification, and the app says so.

## Code map

```
ascend/
  index.html, manifest.webmanifest, sw.js, icon*.{svg,png}
  css/app.css              design system (tokens, light/dark, components)
  js/main.js               boot, routing from hash, reminders, service worker
  js/app.js                render loop, event delegation, sheets, toasts
  js/store.js, db.js       state document per account, IndexedDB → localStorage → memory, snapshots, export/import
  js/flows.js              start/finish workout, PRs, XP, rank, goals, celebrations
  js/engine/*.js           pure logic: strength, rank, coach, goals, xp, history, analytics (unit-tested)
  js/data/*.js             exercise library, split templates
  js/ui/*.js               icons, emblems, marble texture, charts, reveal, haptics/sound
  js/views/*.js            onboarding, home, train (split/day/library/history/calendar), workout/summary, rank, goals, profile
```

The state is stored per account ID (`user:<id>`), so more profiles can be added later without a migration.

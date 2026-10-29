# ASCEND — Earn Your Rank

A private, mobile-first gym tracker with a strength-ranking system, a rules-based coach and goal tracking. It's a zero-dependency installable web app (PWA): plain ES modules, no build step, works offline, and stores all data on the device.

## Run it

```bash
npm run ascend          # = node ascend/server/server.mjs → http://localhost:8787/
```

The server has no dependencies. It serves the app and the AI coach API. Any static server also works (`python3 -m http.server --directory ascend`), and so does GitHub Pages at `/ascend/`. Everything except the AI coach runs that way; the Coach tab then explains that it needs the server.

## AI Coach (Google Gemini)

### Set up the key

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Local: `cp ascend/.env.example ascend/.env.local` and set `GEMINI_API_KEY=…`. `.env.local` is gitignored.
3. Run `npm run ascend` and open the **Coach** tab. The start-up log says whether the key was found. It never prints the key.

Optional variables: `GEMINI_MODEL` (default `gemini-flash-latest`), `PORT`, and `ASCEND_ACCESS_CODE`. If `ASCEND_ACCESS_CODE` is set, the app must send that code (Coach settings → Access code). Use it on any public deployment so strangers can't use your Gemini quota.

### Deploy with a hosted secret (Vercel)

Import the repo in Vercel and set **Root Directory** to `ascend`. Under **Settings → Environment Variables**, add `GEMINI_API_KEY` (and ideally `ASCEND_ACCESS_CODE`). Vercel serves the static app and runs `api/coach/chat.mjs` and `api/coach/status.mjs`, which reuse the same code as the local server (`server/coach-core.mjs`). On any other Node host, run `node ascend/server/server.mjs` with the variables set.

### How it works

- **Key stays on the server.** The browser only calls `/api/coach/status` and `/api/coach/chat` on its own origin. The server adds the key as an `x-goog-api-key` header when it calls `…/v1beta/models/gemini-flash-latest:generateContent`. Responses and logs never contain it (tested), and the service worker never caches `/api/` requests.
- **Data selection happens on the device.** ASCEND has no server database; your history lives only in the browser. For each message, `js/engine/coachContext.js` picks only what's relevant:
  - profile basics, units, rank and score breakdown, goals with progress, the split, today's plan, frequency and the latest recovery check-in
  - detailed sets, e1RM, PRs and the rules-based target only for the exercises your question mentions (plus the active workout and the exercise you're on)

  The server validates and caps that input, then builds the system instruction itself: personality, safety rules, under-18 rules and "only cite numbers from this data". The app can't override those instructions.
- **Personalities** (`js/data/coaches.js`): Drill Sergeant, Hype Coach, Professional, Gym Bro, Mentor, or a Custom coach with a description and five 1–10 sliders. All of them feed the system instruction. Safety rules always override the persona.
- **Conversation and memory.** The conversation is stored on-device and the last 16 messages are sent each time. Past 40 messages, older ones are condensed into a summary by a Gemini call. Long-term memory holds only notes you approve (tap **Remember** on a message, or add one in Coach settings), and the coach is told it remembers nothing else. You can view, edit and delete memories, delete the summary, or clear everything.
- **Ask Coach during a workout.** It opens over the tracker with the current exercise and the sets logged so far. Your logging is never interrupted. Replies that mention an exercise link to its demonstration.
- **Voice** uses the device: speech-to-text through the browser's SpeechRecognition (Safari: `webkitSpeechRecognition`) and spoken replies through `speechSynthesis` with the device's installed voices, shaped by the chosen voice style. Gemini only returns text. Without these APIs, text chat works as normal.
- **Coach intro and rank-up takeover** reuse the existing cinematic reveal, so no ranking logic changed. During a promotion your coach's personality-specific line appears, and is spoken if voice is on.
- **Check-ins** are short lines in your coach's style. They come only from real events: a planned workout day, a PR, a missed planned session, or the day after a hard session (RPE 9+, much higher volume than usual, or 95+ minutes). Each event fires once, with at most two a day. You can turn them off, or have them also show as device notifications. They're templates, not Gemini replies: they send no data and work offline.
- **Errors are explained, never faked.** If there's no server, no key, a rejected key, a rate limit, a timeout, offline, or a blocked reply, you get a specific message. Failed messages get a **Retry** button.

### Tests

| Command | Covers |
| --- | --- |
| `npm run test:ascend` | Engine + server: request shape, key handling and redaction, every error mapping, a distinct prompt per personality, safety/youth rules, input caps, access code, rate limit, no secret files served, no keys in client code, context accuracy, check-in triggers, rank lines |
| `GEMINI_LIVE=1 node --test ascend/tests/server.test.js` | Calls Google's real endpoint. Without a key it confirms a bad key is rejected and reported as `invalid_key`; with `GEMINI_API_KEY` set it expects a real reply |
| `node ascend/tests/e2e-coach.mjs` | Browser test through the real server, with Google replaced by `tests/mock-gemini.mjs`: setup → intro → greeting → chat with your real numbers → 429 and retry → persistence → memory → personality switch keeps data → Ask Coach mid-workout keeps sets → rank-up takeover line → missing-key screen → key never sent to the browser → no horizontal overflow on mobile |

| Command | What it does |
| --- | --- |
| `npm run test:ascend` | Engine + server unit tests (`node --test`, no install needed) |
| `node ascend/tests/e2e.mjs` | Browser test of the critical flows: onboarding → split editing → 3 logged workouts → PR + rank reveal → goal change → persistence across reload → dark mode/desktop. Needs the static server above and Playwright. Screenshots go to `e2e-output/ascend` |

## Features

- **Onboarding**: age, units, height, body weight, experience, training days, equipment, current split, main and secondary goals, a specific target with an optional date, and strength-standard context.
- **Split builder**: 10 templates (PPL, Upper/Lower, Arnold, Full Body, Bro, 4/5/6-day, Fully Custom). Templates adapt to your equipment and number of training days. You can rename days, reorder or swap exercises, edit sets/reps/rest/RPE/warm-ups/notes, assign weekdays or rest days, and duplicate days or whole splits.
- **Exercise library**: 75+ exercises with muscles, equipment, technique cues and alternatives. It's searchable and filterable, and you can add custom exercises.
- **Exercise demonstrations**: every exercise in the split builder, library and live workout has a thumbnail with a play button. It opens a player over the current screen without interrupting the workout. The player shows primary and secondary muscles, numbered how-to steps, common mistakes and form tips. 87 of 95 exercises have a real-person photo sequence of the exact variation (start ↔ finish, looping) from [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (public domain). No licensed demonstration *video* library is available to bundle, so these are labelled "No video · photo sequence". Exercises without an exact match say so rather than showing a similar lift. You can attach your own video file (stored on-device) or a link (.mp4/.webm/.mov or YouTube) to any exercise; it plays muted, looping, with full-screen. Images lazy-load, and each is cached offline after it's first viewed. The library filters by Chest, Back, Shoulders, Biceps, Triceps, Legs, Glutes, Core, Cardio and Mobility, and by equipment.
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
  server/                  zero-dependency Node server + Gemini coach core (key from env)
  api/coach/*.mjs          the same coach API as Vercel functions
  js/coachApi.js, js/ui/chat.js, js/views/coach.js, js/engine/coachContext.js, js/coachNudges.js   AI coach client
  js/app.js                render loop, event delegation, sheets, toasts
  js/store.js, db.js       state document per account, IndexedDB → localStorage → memory, snapshots, export/import
  js/flows.js              start/finish workout, PRs, XP, rank, goals, celebrations
  js/engine/*.js           pure logic: strength, rank, coach, goals, xp, history, analytics (unit-tested)
  js/data/*.js             exercise library, split templates
  js/ui/*.js               icons, emblems, marble texture, charts, reveal, haptics/sound
  js/views/*.js            onboarding, home, train (split/day/library/history/calendar), workout/summary, rank, goals, profile
```

The state is stored per account ID (`user:<id>`), so more profiles can be added later without a migration.

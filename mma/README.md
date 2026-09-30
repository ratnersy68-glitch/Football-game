# Octagon Fight Night

A tactical, real-time UFC-style MMA game for **personal, non-commercial** use. You pick a real fighter, pick a real opponent, choose how smart the AI is, and fight it out in the Octagon: striking, clinch, wrestling, ground-and-pound, interactive submissions, three judges on the 10-point must system, full stats and replays.

> Real fighter names, records and styles are used for immersion. No official logos, images or likenesses are included — the arenas and broadcast graphics are original, generic designs ("inspired by", never branded). Records are a hand-curated snapshot and may be out of date; edit `src/data/fighters.ts` freely.

## Run it

Needs Node 18+.

```bash
cd mma
npm install
npm run dev              # http://localhost:5180
```

**No-server option:** `npm run build:standalone` writes `dist-standalone/octagon-fight-night.html` — one self-contained file (≈220 KB) you can double-click to play offline.

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm run build:standalone` | Single-file HTML build (works from `file://`) |
| `npm test` | Vitest suite: engine, judging, submissions, AI style/difficulty/fairness, tournament |
| `npm run sim -- 300` | Balance report: N random AI-vs-AI fights → finish methods, strikes, takedowns, knockdowns, control |
| `npm run sim:styles -- 30` | Style report for marquee matchups (Jones–Pereira, Holloway–Gaethje, Makhachev–Oliveira, …) |

## Game modes

- **Quick Fight** — choose your fighter (red corner, left), the AI opponent (blue corner, right), difficulty, arena, 3 or 5 rounds and the round-clock speed. Cross-division superfights are allowed (weight matters: power, takedowns and grappling scale with the weight difference); men and women are kept separate.
- **Main Event** — the full broadcast: main-event card, Tale of the Tape, both walkouts (challenger first), referee instructions, 5 × 5:00, official scorecards.
- **Tournament** — 8 or 16 fighters, single elimination, seeded by overall rating. Any division with enough fighters, plus Open Weight Grand Prix brackets. You fight your bouts; every other bout is fought AI-vs-AI by the real engine. Early rounds are 3 rounds, the final is 5. Progress is saved in the browser; you can continue later.
- **Career / Championship** is not in this build. The architecture hook lives in `src/modes/career/CareerMode.ts` (state shape + service interface) and is intentionally not shown as a menu option.

## Controls (keyboard defaults — everything is rebindable in *Controls*)

| | |
| --- | --- |
| **Move** | `W A S D` (or arrows) |
| **Punches** | `J` jab · `K` cross · `U` lead hook · `I` rear hook |
| **Kicks** | `N` lead kick (inside leg kick) · `M` rear kick (leg kick) |
| **Modifiers (hold)** | `E` body · `Shift` head kicks · `Q` specials |
| **Defense** | `Space` high block (hold) · `C` low block / check / sprawl (hold) · `L` slip · `O` duck · `;` pull back · `F` side-step |
| **Grappling** | `G` clinch · `T` takedown (`E+T` single leg, in clinch = trip/cage takedown, during their kick = catch it) · `R` transition (`Shift+R` take the back) · `Y` submission (`E+Y`/`Q+Y` alternatives) · `X` get up / break / hurry up after a knockdown |
| **Other** | `V` feint · `Z` switch stance · `Esc`/`P` pause |

Specials (`Q`): `Q+J` spinning backfist · `Q+K` overhand · `Q+U/I` uppercuts (elbows when close) · `Q+N` front kick (knee when close) · `Q+M` calf kick (step knee when close) · `Q+Shift+N` spinning back kick · `Q+Shift+M` flying knee · `Q+Shift+J/K` superman punch. The Controls screen prints the full strike table straight from the game's resolver.

**Gamepad (standard mapping):** left stick move · X jab · Y cross · A lead kick · B rear kick · RB = hooks / head kicks · LB = body · LT = specials · RT = block (with LB = low block) · right stick: ←/→ slip (with RT: side-step), ↓ duck, ↑ pull · D-pad: ↑ transition, ↓ get up/break, ← clinch, → takedown · R3 submission · L3 feint · Back switch stance · Start pause. Buttons are rebindable too.

**Combos:** press the next strike during the previous one's recovery. Faster fighters chain sooner. Landing while your opponent is winding up is a *timed counter* (the most dangerous shot in the game); landing right after they miss is a *whiff counter*.

**Submissions** are an interactive scramble: both fighters get a direction prompt; hit yours to push the meter (strength scales with submission skill / defence and stamina), wrong inputs lock you out briefly, and holds loosen the longer they last.

## What's simulated

- **Striking** — 25+ standing strikes, clinch strikes and ground strikes, each with reach, wind-up/active/recovery timings, damage, "daze", stamina cost and cut risk. Hit resolution uses range, facing and angle (side-steps steal angles), accuracy vs defence, speed, stamina, being rocked, blocks, slips/ducks/pulls (a slip beats a straight but walks you into a hook; a duck beats hooks and head kicks but eats uppercuts and knees), counters, signature techniques and fight-night form.
- **Damage** — separate head, body and both legs; cuts (doctor stoppages), swelling; body damage drains stamina and the gas tank; leg damage slows movement and weakens kicks (leg-kick TKOs exist but are rare); head damage feeds a short-term *daze* meter whose floor rises with accumulated damage.
- **Rocked / knockdowns / KO** — daze past chin-based thresholds rocks (slower, worse defence and accuracy), then drops (flash vs heavy; body-shot and leg knockdowns too); huge single shots can spike. Downed fighters can be followed to the mat or allowed up. KOs, referee TKOs (unanswered damage while hurt, ground-and-pound), doctor and corner stoppages.
- **Stamina** — every action costs; misses cost more; wrestling and scrambles are expensive; regeneration depends on cardio, activity and body damage; the tank shrinks across rounds; low stamina reduces speed, power, defence, takedowns and recovery.
- **Wrestling / clinch / ground** — double, single, trip/body lock, clinch and cage takedowns with sprawls and kick catches; clinch control, cage pins, knees/elbows/dirty boxing, breaks; full guard, half guard, side control, mount, back control and turtle with passes, sweeps, escapes, get-ups (wall-walking near the fence), stand-ups and referee resets.
- **Rounds & judging** — accelerated 5:00 clock (configurable), 10-second clapper, horn, between-round recovery with corner advice; three judges with different striking/grappling biases score effective striking/grappling, damage and near-finishes first, then aggression, then control → 10-9 / 10-8 / (rare) 10-7 → unanimous, split, majority decisions or draws.
- **AI** — see below. **Presentation** — broadcast camera, crowd with reactions and camera flashes, synthesized audio (no assets), dynamic commentary with anti-repetition, scorebug, highlight replays.

### The AI

- **Strategy engine** (`src/ai/StrategyEngine.ts`) turns style (archetype + per-fighter tendencies), pre-fight matchup analysis (striking/wrestling/ground/reach edges), damage (attack a hurt leg or body, finish a rocked opponent, survive when hurt), stamina, round, clock, a live score estimate (protect a lead late, take risks when behind), in-fight performance (losing the striking → change levels) and observed habits into a game plan.
- **Player model** (`src/ai/PlayerModel.ts`) learns from what's visible: strike frequencies and sequences (e.g. "cross is usually followed by a head kick"), high/low guard habits, pressure, retreating after combos, takedown defence, reactions to feints.
- **Tactical controller** (`src/ai/AIController.ts`) executes the plan: footwork, range, cage craft (cutting off vs circling off the fence), combos re-aimed at body/legs, timed takedowns, clinch and ground decisions, feints and traps, counters, submission scrambles.
- **Difficulty** (`src/ai/Difficulty.ts`) changes intelligence only — reaction time, how often and how correctly it defends, counter rate, combo variety, stamina discipline, ground IQ, learning, adaptation (including strategy changes between rounds), cage IQ, score awareness, feints/traps, mistakes. It never changes attributes or health.
- **Fairness** — the AI only sees the opponent's *visible* actions after a human-range reaction delay (≥ 0.14 s even on Legendary; enforced by a test). It never sees your inputs.

Measured with the headless simulator: AI-vs-AI finish mix ≈ KO/TKO 35–40 %, SUB ≈ 20–25 %, decisions ≈ 35–40 %; in mirror matches Legendary beats Easy ≈ 85 % and every step up the ladder wins the majority.

## Architecture

```
src/
  core/        rng (seeded), math, EventBus
  data/        FighterData: fighters (≈115), weight classes, archetypes, strikes (+ input resolver), combos, submissions, arenas
  engine/      FightEngine (coordinator) · MovementSystem · StrikeSystem · DamageSystem · StaminaSystem ·
               GrapplingSystem (clinch, takedowns, ground) · SubmissionSystem · RoundManager · JudgeSystem ·
               FightStatistics · Octagon (cage geometry) · tuning.ts (all balance constants)
  ai/          AIController · StrategyEngine · PlayerModel · Difficulty
  input/       InputManager (keyboard + gamepad, rebindable, persisted) · PlayerController · Bindings
  presentation/ CommentarySystem · CrowdSystem · ReplayRecorder · Snapshot (render/replay frame format)
  render/      Renderer · CameraController · ArenaRenderer · FighterRenderer (procedural skeleton + ground/sub keyframes)
  audio/       AudioSystem (Web Audio synthesis)
  modes/       FightSession (live fight loop) · SimFight (headless AI-vs-AI) · Tournament · GameFlow · career/ (hook)
  ui/          UIManager (screen stack + frame loop) · Hud · CornerAdvice · screens/*
```

The engine is pure TypeScript with no DOM access, runs on a fixed 60 Hz step, and publishes `FightEvent`s. Everything else (stats, commentary, crowd, replays, audio, camera) listens to events. The same engine powers your fight, tournament bouts you don't take part in, and the test/balance scripts. Controllers (keyboard/pad or AI) only ever produce `Command`s.

## Editing fighters

Each fighter is one line in `src/data/fighters.ts`:

```ts
F('LW', 'Islam Makhachev', '', 'Russia', 1991, 70, 70.5, 'Southpaw', '27-1', 'sambo',
  [86, 80, 82, 88, 86, 90, 84, 94, 92, 92, 94, 90, 92, 95, 86], { sig: ['armTriangle', 'kimura', 'leadHeadKick'], t: { counter: 0.5 } });
```

Attribute order: striking, power, speed, accuracy, defense, cardio, chin, wrestling, takedowns, takedown defense, submissions, submission defense, clinch, ground control, recovery. Tendencies default from the archetype and can be overridden per fighter (`t`). Signature techniques get small accuracy/damage bonuses and are preferred by the AI.

## Known limitations

- 2D canvas "broadcast" rendering with stylised procedural fighters — no licensed models, faces or likenesses.
- Records/ages are a static snapshot, and results aren't written back to fighter records (tournament progress is saved separately).
- The standing camera uses a side-on projection; fighters facing directly toward/away from the camera are drawn foreshortened.

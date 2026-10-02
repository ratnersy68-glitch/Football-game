# DIAMOND '26 — playable MLB-style baseball (browser, Three.js)

A personal, non-commercial baseball game you actually play: you pitch, hit, field, throw and run
the bases for one of the 30 MLB clubs while the computer plays the other side.

## Run it

```bash
npm install
npm run baseball        # opens http://localhost:5173/baseball.html
npm run build           # production build -> dist/baseball.html
npm test                # includes tests/baseball.test.ts (physics, swing model, full CPU game)
npm run sim:baseball -- 20   # headless CPU-vs-CPU games + league-average stats (engine tuning)
```

Browser tests (need the dev server on port 5199: `npx vite --port 5199`):
`node scripts/baseball/e2e.mjs out/` (menus), `e2e-play.mjs` (batting + replay), `e2e-field.mjs` (pitching + fielding).

## Game flow

Home → **Play Ball** → your team → opponent → ballpark & conditions (home/away, day/afternoon/night,
clear/cloudy/light rain, temperature, wind) → lineup (order, positions, starters, starting pitcher)
→ difficulty (Rookie … Legend) and length (1/3/6/9 innings, extra-inning runner on/off) → play.

## Controls

| Batting | |
| --- | --- |
| Mouse / arrows / left stick | Move the PCI |
| SPACE / left-click | Normal swing |
| SHIFT+SPACE / right-click | Power swing (smaller PCI & timing window, more exit velo) |
| CTRL+SPACE (or ALT+SPACE) | Contact swing (bigger PCI & window, less power) |
| Q before the pitch | Steal (selected runner, or all) |

| Pitching | |
| --- | --- |
| A S D F G H | Select a pitch from the pitcher's real repertoire |
| Mouse | Aim |
| SPACE, SPACE | Start the meter, stop it on the gold line (control rating sets the zone width). Early = pitch sails up/arm-side, late = yanked into the dirt |

| Fielding | |
| --- | --- |
| WASD | Move (camera-relative). Control auto-switches to the best fielder, then to whoever has the ball / is receiving the throw |
| SHIFT | Sprint |
| SPACE | Dive (or leap at the wall to rob a home run) |
| Hold 1/2/3/4, release | Throw to 1st/2nd/3rd/home. Release in the green zone; early = weak/in the dirt, late = sails/overthrow. Or run the ball to a bag / tag a runner |

| Running | |
| --- | --- |
| Q / E | Advance / retreat runners |
| 1 2 3 / 4 / 0 | Select the runner on that base / the batter-runner / all runners |

ESC pause menu (resume, lineup & substitutions, bullpen, box score, controls, settings, simulate
half-inning / to end, restart, quit) · R instant replay (SPACE pause, Z slow-mo, ←/→ scrub,
drag or A/D rotate, wheel or W/S zoom) · SPACE/ENTER skip a banner.

Settings: pitch speed (by difficulty / slower / real), fielding assist (AI routes your fielder
until you touch WASD), baserunning assist, strike zone overlay, camera shake, volumes.

## How it works

Nothing decides "hit or out" with a dice roll. The chain is:

1. **PitchEngine** — pitch type + target + meter error + control/fatigue → a real trajectory
   (release point, velocity, gravity, induced break that grows like `(t/T)^late`, so sliders and
   splitters break late; changeups arrive later than the fastball from the same release).
2. **BattingEngine** — the PCI position vs the ball's actual position at the contact plane and the
   swing timing (ms) → contact quality (MISS / FOUL / WEAK / OKAY / GOOD / BARRELED / PERFECT-PERFECT)
   → exit velocity, launch angle (ball above PCI centre = loft), spray (early = pull), spin.
3. **BallPhysics** — drag, Magnus lift and sidespin, wind, air density from temperature and park
   altitude, bounces/rolling on grass vs dirt, and collisions with each park's walls (Fenway's 37-ft
   Monster, Oracle's arcade, Coors' thin air). Calibrated to Statcast (105 mph @ 28° ≈ 400 ft).
4. **LivePlay** (+ **FieldingEngine**, **BaseRunningEngine**) — fielders compute intercepts on the
   predicted path (rating-dependent reaction, speed, route error), catch/bobble/error, throw with
   arm-strength speeds and accuracy; runners run real base paths at rating-based speeds, freeze on
   line drives, tag up, take extra bases by comparing their time against the defense's time.
   Force outs, tag outs, appeals (doubled off), rundowns, fielder's choices, double/triple plays,
   ground-rule doubles, wild pitches/passed balls, steals and the 3rd-out run rule all fall out of it.
5. **RulesEngine / StatsManager** — counts, innings, walk-offs, extra innings, box score, W/L/S.
6. **AIController** — the CPU pitcher sequences by count/batter/history and executes with a
   difficulty-dependent miss rate; the CPU hitter never sees your pitch selection: it perceives the
   ball's location with noise, sits on the fastball (so changeups fool it) and decides to swing by
   count and discipline. The CPU manager warms up and brings in relievers.

Headless average over CPU-vs-CPU games (All-Star): ~3.5 R, 8 H, 0.7 HR, 1.2 2B, 6 K, 1.8 BB,
0.4 E per team per game.

## Code layout (`src/baseball/`)

```
core/        types, math (vectors, seeded RNG)
data/        teams.ts, stadiums.ts (30 parks), pitchTypes.ts, rosters/*.ts (editable)
managers/    TeamManager (teams, attributes, lineups), RosterManager (row -> Player)
engine/      GameEngine (state machine), GameState, RulesEngine, StatsManager, PitchEngine,
             BattingEngine, BallPhysics, LivePlay, FieldingEngine, BaseRunningEngine, Field,
             QuickSim (only for explicit "simulate"), ReplaySystem
ai/          AIController (pitcher, hitter, steals, bullpen)
render/      Renderer, StadiumBuilder, PlayerModel, CameraManager
input/       PlayerController (keyboard, mouse, gamepad)
audio/       AudioManager (file hooks + synthesized placeholders)
ui/          MenuScreens, Hud, Modals, styles.css
main.ts      wires it together
```

## Editing rosters

Rosters live in `src/baseball/data/rosters/*.ts` (2025 MLB season). See `format.ts`:

```ts
// [name, number, pos, bats, throws, contact, power, eye, speed, fielding, arm, 'secondary,positions', {overrides}]
['Aaron Judge', 99, 'RF', 'R', 'R', 82, 99, 92, 52, 70, 80, 'CF'],
// [name, number, role, throws, velocityMph, control, break, stamina, 'pitch codes']
['Gerrit Cole', 45, 'SP', 'R', 97, 70, 82, 85, 'FF,SL,KC,CH,FC'],
```

The first nine hitters are the default batting order. Splits vs RHP/LHP, plate vision, discipline,
stealing and reaction are derived but can be overridden per player. A pitcher row with the same name
as a hitter makes a two-way player (Ohtani).

## Sound

Drop files named `batCrack`, `glove`, `crowdRoar`, … into `public/baseball/audio/`
(see the README there). Missing files fall back to synthesized placeholders; umpire calls use the
browser's speech synthesis.

## Known limitations / next steps

- Player models are stylized primitives with procedural animation (no skeletal mocap).
- No pickoffs, balks, bunts, infield-in/shifts, dropped third strikes or injuries yet.
- Season stats on broadcast cards are derived from ratings, not real stat lines.
- Defensive positioning is standard alignment only.

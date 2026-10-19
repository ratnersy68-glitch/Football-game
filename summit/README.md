# SUMMIT — Ultimate Ski Resort Simulator

A single-player 3D skiing and snowboarding game that runs in the browser: physics-driven carving,
a full freestyle trick system, terrain parks with rails and a superpipe, alpine racing against AI
that physically skis the courses, eight procedurally generated (deterministic) resorts with 203
trails and 43 working lifts, career progression, a gear shop, weather, replays and ghosts.

Built with TypeScript, Three.js, React and Vite. No servers, no multiplayer, no real-money anything.

## Run it

```bash
cd summit
npm install
npm run dev          # http://localhost:5180
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the game |
| `npm run build` | Typecheck + production build to `dist/` (static, can be hosted anywhere) |
| `npm test` | Unit + simulation tests (terrain, all 203 trails, physics, AI racing on every course, lifts, progression, replay) |
| `npm run e2e -- <scenario>` | Browser test with real keyboard input (needs `npm run dev`). Scenarios: `freeride`, `race`, `park`, `tutorial`, `screens`, `showcase`. Screenshots go to `e2e-output/` |

Add `?unlock=1` to the URL to open every resort for testing.

## Controls

| Key | Action |
| --- | --- |
| W | Tuck / push with poles on flats (on a lift: fast-forward) |
| S | Brake / snowplow / skid check |
| A / D | Turn left / right |
| Shift | Carve — clean, fast arcs (skidded turns scrub speed) |
| Space | Hold to load, release to pop / jump · on a rail: pop off |
| Q / E | Spin left / right (air) |
| ↑ / ↓ | Frontflip / backflip (air) |
| ← / → | Cork tilt — hold while spinning for corks (air) |
| 1–4 | Safety, Mute, Tail, Japan grabs · with Shift: Nose, Method, Stalefish, Truck Driver |
| F | Board a lift at its bottom station / skip the ride |
| R | Reset to trail (in races: back to the last gate) |
| C | Cycle camera: follow, freestyle close, cinematic, first person, race |
| M | Trail map (select a trail → “Ski this trail”, fast travel to lifts you have ridden) |
| Tab | Session scoreboard / race standings (hold) |
| V | Instant replay of the last 20 s |
| Esc / P | Pause |

Bindings are remappable in Settings. Gamepads work (left stick steer, A jump, B brake, RT tuck,
LT carve, right stick spin/flip, bumpers cork tilt, X/Y grabs, Start pause, Back map).

## What's in the game

- **8 resorts / 203 trails / 43 lifts** — Pine Valley, Frost Peak, Glacier Ridge, Blackstone
  Mountain, Powder Paradise, Summit X, Avalanche Mountain, Alpine World. Each trail is a real
  carved route from a lift top to the base, shaped so its steepest 60 m pitch matches its rating
  (bunny < 8°, green ≤ 14°, blue 13–22°, black 22–31°, double 31–41°, triple 41°+ with cliff bands
  and couloirs). Tests verify every trail.
- **Physics** — gravity on the real surface, Coulomb snow friction, aerodynamic drag (tuck vs
  upright), edge grip that redirects momentum (carving) up to a lateral-acceleration limit with
  skid friction beyond it, powder/slush drag, ice with low grip, moguls, true ballistic airs
  whenever the snow falls away faster than gravity, landing impact/orientation checks, tree/rock
  collisions, Verlet ragdoll crashes. Terminal speeds ≈ 90 km/h upright / 130 km/h tucked on a 17° slope.
- **Freestyle** — spins to 1800, front/back flips, corks, misties, rodeos, bios (named from real
  rotation integrals and measured inversions), eight grabs, rails/boxes/tubes with balance,
  combo multiplier, repeat penalties, landing quality.
- **Terrain parks** — kickers (small→massive big air), step-ups/step-downs, gap jumps, straight,
  down, kinked, rainbow and flat-down rails, boxes, tubes, wall rides, quarterpipes, halfpipe and
  superpipe, natural cliff drops, rollers and banked turns (ski cross).
- **Racing** — downhill, slalom, giant slalom, super-G, ski cross (4 riders, contact), freestyle
  race. Gate detection between the poles, missed-gate penalties, splits, ghosts of your best run,
  six AI levels, six tournaments with points standings.
- **Career** — 8 stages from Rookie to Mountain Legend, ~90 events (races, park comps, time trials,
  speed traps, exploration, lifts, hang time), sponsors, achievements, resort unlocks.
- **Character & shop** — skin, hair, face, build, height, custom colours; 40+ items across skis,
  snowboards, helmets, goggles, jackets, pants, gloves, boots and accessories, each with stats that
  change the physics (speed, control, carving, stability, jump, powder). Peak Coins only.
- **World** — LOD terrain with a corduroy/ice/sparkle snow shader, instanced forests, rocks,
  frozen lakes, lodges, village chalets, trail signs, map boards, snow guns, night lamps,
  chairlifts/gondolas/T-bars with animated carriers, distant ranges, weather (clear, light/heavy
  snow, overcast, fog, wind), time of day incl. night skiing, ski tracks and spray.
- **Replays** — 30 Hz recording, play/pause, 0.25–1× speed, scrubbing, four cameras, save/load.
- **Audio** — fully procedural WebAudio (wind, edge scrape, powder, grind, lift motors, crowd,
  countdown, horn, trick chimes).

See `PROGRESS.md` for architecture, test coverage and known issues.

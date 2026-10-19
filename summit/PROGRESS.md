# SUMMIT — progress log

Status of every phase in the build brief, what was verified, and what is left.

## Architecture

```
src/
  core/      rng (mulberry32), simplex noise + fbm/ridged, math helpers
  data/      resorts (8 defs), equipment/shop, career (stages, events, tournaments, sponsors, achievements), names
  world/     terrain (bicubic heightfield + micro relief + moguls + features, surface types),
             resortBuilder (generator), features (kickers, pipes, berms… as height functions), liftPath, types
  physics/   skier (ride/air/grind/crash/recover), tricks (naming, scoring, combos), rails, ragdoll
  ai/        racerAI (racing line, pure pursuit, speed planning)
  race/      race session (start order, gates, penalties, results)
  game/      Game (orchestrator + modes), input, camera, lifts, audio, weather, replay
  render/    sceneSetup (renderer, sky, fog, backdrop, quality presets), terrainRenderer (LOD chunks + snow shader),
             trees (instanced), props, liftMeshes, featureMeshes, character (IK rig), effects, mapRender
  state/     save (profile/localStorage, runs/IndexedDB), progress (rewards, medals, tournaments, shop)
  ui/        React app: menus, screens, HUD, trail map, pause, results, replay controls
```

Physics, terrain generation, AI and progression are renderer-independent and run headless in tests.

### Resort generation (deterministic per seed)
1. Raw mountain: concave summit-to-base profile, peaks, side ridges, ridges/gullies, ridged crests.
2. Lifts from per-resort specs; tower heights solved so both cable lines clear the snow.
3. Parks: straight site search for a constant natural grade. Racecourses + trails: slope-targeting
   planner (lookahead grade matching, traverses/switchbacks, lane & occupancy steering).
4. Each corridor is shaped (forward/backward gradient-clamped profile, pitch steepening by balanced
   cut/fill, cliff bands for triples) and carved into the live heightfield, easiest trails first;
   later trails are pinned to existing snow where they cross, so earlier trails stay intact.
5. Base area, station pads, frozen lakes; park features, rails, gates; trees (kept off every
   trail line), rocks, buildings; obstacle index for collisions.

## Phase status

| Phase | Status |
| --- | --- |
| 1 Core gameplay (engine, mountain, skier, physics, controls, jumps, camera) | Done |
| 2 Freestyle (spins, flips, corks, grabs, scoring, parks, rails, crashes) | Done |
| 3 Racing (courses, gates, timers, AI, results, ghosts, disciplines) | Done |
| 4 Resorts (generator, 8 resorts, 203 trails, lifts, maps, selection) | Done |
| 5 Progression (character, equipment, shop, coins, career, championships, saves) | Done |
| 6 Polish (animation, snow material, weather, audio, replay, UI, performance) | Done (ongoing tuning) |

## Tests (`npm test`, 57 tests)

- **world.test.ts** — 8 resorts generate deterministically; exactly 203 trails with the advertised
  per-difficulty counts, lifts, parks, racecourses; every trail is a continuous route with no trees on
  its line; steepest-pitch within the difficulty band for ≥ 90 % of trails (all within tolerance);
  harder ratings are steeper on average at every resort; lift cables clear the snow.
- **physics.test.ts** — gravity acceleration and terminal speeds, exact snow following on undulating
  terrain, right-turn direction and carve > skid speed, braking to a stop, kicker launch + clean
  landing, 720 Mute and backflip from real inputs, rail grind, tree crash.
- **race.test.ts** — AI racers (Beginner / Pro / World Class) finish every one of the 18 racecourses
  across all resorts, with near-zero missed gates and skill ordering preserved.
- **systems.test.ts** — trick naming (corks, misties, rodeos, grabs), combo/repeat scoring, a full
  chairlift ride bottom → top → unload, shop/equip/locks, medal accounting and tournament standings,
  replay record → encode → decode → sample, snowboard ride/turn/jump.

Browser (`npm run e2e -- <scenario>` with Playwright + Chromium): menu → free ride → skiing with real
keys, carving, jump/spin, every camera, trail map, instant replay, pause; race start/countdown/racing;
park session; all menu screens; tutorial; a showcase across resorts (triple-black, chute in heavy
snow, superpipe, slopestyle rails, rail plaza, sunset base, gondola, night, chairlift, fog).
No console errors in any scenario.

## Bugs found & fixed during testing (highlights)
- Trail crossings bulldozing each other's profiles → sequential carving with crossing pins.
- Velocity re-projection on the post-lip normal killed kicker launches → use last contact normal.
- Micro-hops at speed reset the ski heading and erased carves (AI drifted off downhill courses).
- Crashed riders bounced off steep slopes and free-fell at 90 m/s → contact-sliding crash physics, then ragdoll.
- Props/snow guns spawned inside other trails; race corridors lost ownership to crossing mogul runs.
- Start house blocked the race camera; trail-map close re-opened the map; dt cap made slow machines run in slow motion.

## Known issues / next priorities
- Software-rendered browsers (no GPU) run at very low frame rates; use the Low preset.
- Character is a stylised capsule rig; no cloth or facial detail.
- Racecourses do not yet show a live split comparison against the ghost.
- AI racers do not take lifts or free ride; they exist in races only.
- The production bundle is a single ~1 MB chunk (300 kB gzip); could be code-split.
- Some expert trails exceed their pitch band by a few degrees at cat-track crossings (by design, tested with tolerance).

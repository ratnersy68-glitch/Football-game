# Architecture

**Stack:** TypeScript · React 19 (UI) · Three.js (3D player mode) · Canvas 2D (coach-mode field) · Vite · Vitest · Playwright. No backend; saves live in IndexedDB / localStorage.

The repo holds two games that share data (teams, rosters, colors): the **Coach Dynasty** (play-by-play sim, below) and the **Player Career** (real-time 3D, next section).
Everything under `src/simulation` is pure TypeScript with no DOM/React imports, so it runs identically in the browser, in Node scripts and in tests, and a future 3D renderer (Three.js) can consume the same play events.

## Core principle

```
SIMULATION (gameEngine) ──▶ PlayEvent ──▶ PlayAnimator ──▶ FieldRenderer (canvas)
```

The engine decides every outcome. The animator only choreographs players so the ball ends exactly where the engine spotted it (enforced by `tests/animation.test.ts`). Visual randomness uses a separate seeded stream so it never changes results.

## Layout

```
src/
  data/            All tunable content as JSON (data-first)
    conferences.json      membership rules, conference game count, title-game config
    teams/*.json          50 Big Ten/SEC/Big 12 programs + 75-team non-conference opponent pool
    rivalries.json        rivalries, trophies, intensity, rivalry-week & neutral-site flags
    positions.json        attributes per position + overall weights, roster counts, hidden traits
    archetypes.json       player archetypes (attribute modifiers)
    schemes.json          offensive/defensive schemes: run rate, tempo, formation/concept weights, personnel, blitz/man rates, scheme fit
    playbook.json         formations, run concepts, pass concepts (depth profiles)
    gameConfig.json       clock, kickoff/touchback spots, OT rules, tempo, penalty rates, home field, rating spread
    rankingConfig.json    Elo + poll weights
    playoffConfig.json    CFP team count, auto-bids, seeding, byes, rounds/bracket slots, bowl sites
    bowls.json            non-playoff bowls, eligibility
    awards.json           award names and position groups
    logos.json            ESPN team ids / URL templates for runtime logos
    scheduleRules.json    season length, games per team, rivalry week, non-con mix
    names.json, geography.json
    index.ts              typed accessors (TEAM_BY_ID, rivalryBetween, ...)
  core/            rng.ts (seeded mulberry32, forkable), util.ts
  models/types.ts  All persisted shapes (Dynasty, TeamState, Player, Coach, Game, GameResult, ...)
  simulation/
    world.ts              build rosters/coaches/depth charts for every program; GameSetup helpers
    rosterGenerator.ts    players from team strength + archetypes + hidden traits
    coachGenerator.ts     HC/OC/DC with ratings & schemes
    playerRatings.ts      overall calc, scheme fit
    depthChart.ts         auto/manual depth charts
    teamRatings.ts        unit ratings from starters
    scheduleGenerator.ts  circle-method conference slates + rivalry placement + non-con fill
    rankingEngine.ts      Elo updates + AP-style poll
    standings.ts          conference standings & tiebreakers
    newsEngine.ts         headlines from real sim events
    seasonEngine.ts       createDynasty, applyGameResult, completeWeek (phase state machine)
    postseasonEngine.ts   conference title games, CFP selection/seeding/bracket rounds, bowls
    awardsEngine.ts       Heisman, position awards, Coach of the Year from season stats
    offseasonEngine.ts    archive stats, draft, graduation, development, signing classes, prestige, next season
    game/
      gameEngine.ts       GameSimulation: stepwise play-by-play state machine
      personnel.ts        who's on the field, fatigue, rotations, effective ratings
      stats.ts            per-game player/team stat accumulation
      weather.ts          seeded weather by site and week
      types.ts            PlayEvent, GameSetup, decisions
  visualization/
    animation.ts          PlayAnimation model + sampling
    playAnimator.ts       PlayEvent → PlayAnimation (runs, passes, sacks, scrambles, kicks, punts, FG/XP, penalties)
    fieldRenderer.ts      perspective broadcast camera + All-22 camera, stadium, players, ball, LOS/first-down lines
  save/saveManager.ts     IndexedDB/memory backends, slots, autosave, import/export
  app/                    App shell, global store, screen routing
  ui/                     screens (menu, team select, overview, load, settings, quick sim),
                          dynasty hub pages, game screen (viewer, scorebug, controls, box score)
tests/                    Vitest suites (engine invariants, reproducibility, OT, schedule, season, save/load, animation)
scripts/                  simulateMany (10k-game audit), oneGame, simulateSeason, e2e/ (Playwright)
```

## Player Career (real-time 3D)

```
InputManager (keyboard/gamepad) ─▶ Frame ─▶ GameController ─▶ PlaySim.step(1/60, UserInput)
                                                  │                   │
                                                  │                   ▼ athletes, ball, events, outcome
                                                  ├─▶ Drive.apply(outcome)  (downs, clock, score, stats)
                                                  └─▶ GameRenderer.render(sim)  (Three.js, read-only)
React PlayScreen ◀─ Snapshot (20 Hz) ─ GameController
```

Nothing is predetermined: every outcome (completion, drop, INT, YAC, sack, tackle) emerges from the positions, velocities and ratings of 22 athletes stepped at 60 Hz. The renderer never feeds back into the simulation.

```
src/career/
  data/qbArchetypes.json   attributes, weights, 5 archetypes, 5 body types, build points/cap, position list
  data/gear.json           every gear slot + options (each one is visible on the 3D model)
  data/uniforms.json       home/away/alternate sets (fallback: team colors)
  player.ts                CreatedPlayer model, rating math (archetype + body + height/weight + build), OVR/stars/rank, persistence
src/play/
  engine/  (pure TS, no DOM — runs in tests and the headless bot)
    types.ts               Ratings, Athlete, Task, Ball, SimEvent, PlayOutcome, UserInput, SimSettings
    playbook.ts            route tree (points in downfield/outside yards), formations, 10 pass concepts, defensive calls, routePreview()
    roster.ts              22 athletes: the user's QB + generated Ohio State / Michigan starters mapped to engine ratings
    sim.ts                 PlaySim: movement/accel, routes, pass pro vs rush (engage/shed), man/zone coverage with reaction lag,
                           projectile ball + lead + accuracy model, catch/deflection/INT, pursuit (intercept angles), tackling
                           (moves, momentum, gang, diving), boundaries, outcomes
    drive.ts               Drive: downs/distance/spot, clock runoff, score, QB stats, coach play caller, adaptive DC, FG odds
  input.ts                 InputManager → Frame (move, sprint, snap, throw charge/release, lob, moves, camera) for keys + gamepad
  controller.ts            GameController: stage machine call → presnap → live → whistle → result → fourth/over; fixed-step loop
  settings.ts              difficulty / quarter length / read assist persistence
  render/
    playerModel.ts         low-poly rigged player built from primitives; gear → meshes; procedural run/throw/catch/tackle poses
    stadium.ts             painted field texture, horseshoe double deck + south stands, facade, lights, video board, sun/shadows
    scene.ts               GameRenderer: avatars, ball (held/air/snap), LOS & first-down lines, route art, receiver icons, cameras
src/ui/career/             CareerMenu, CreatePlayer (7 steps), PlayerPreview (3D turntable), PlayScreen (HUD/overlays)
scripts/playtestBot.ts     headless bot QB for tuning (completion %, YPA, sacks, INTs, YAC percentiles)
scripts/e2e/career.mjs     Playwright: create player → gear → stadium → call/snap/throw/run with real keyboard input
tests/playEngine.test.ts   determinism, legal outcomes, control switch, route art ≡ sim routes, drive rules, input charging
```

**Career layer (Milestone 2).**
```
src/career/data/positions.json   QB/RB/WR/TE attributes, OVR weights, archetypes, body types, build points
src/career/data/activities.json  week templates, activities (meter effects, XP tags), invite/chatter text
src/career/season.ts             CareerState: schedule (generateSchedule), calendar clock, meters, contacts &
                                 messages, invites/plans, training → player.progress, eligibility, games
src/play/engine/possession.ts    simulated possessions and whole games from unit ratings (teamRatings)
src/ui/career/CareerHub.tsx      week view, calendar, phone, schedule, stats, ratings, diary
```
`GameController` runs in `drive` mode (one practice drive) or `game` mode: our possessions are played in
3D, the opponent's are `simPossession` cards; halftime, end of regulation and overtime are handled in
`afterPossession`. The final score and the user's stat line flow back into `finishGame` in the career.
In the engine, non-QB users have their task (route, block, run path) run by the AI until they move the
stick; the AI QB (`aiQuarterback`) and AI carrier (`aiCarrier`) play the rest.

**Units & axes.** Yards and seconds. Field x = downfield (offense attacks +x, goal line at 100), y = across (0–53.33), z = height. Scene mapping: `scene.x = x`, `scene.z = y`, `scene.y = z`.

**Key models.**
- *Reaction:* defenders track `perceived()` positions — where a receiver was `delay` seconds ago, extrapolated with his velocity then. Delay comes from route running vs coverage/awareness and difficulty, so hard cuts create real separation and straight lines don't.
- *Throw:* speed from power (charge time) and arm strength; lead solved iteratively against the receiver's projected route (`predict`); aim error sigma grows with distance band accuracy, pressure, throwing on the run, fatigue; vz is solved so the ball arrives at catch height. The ball is a projectile; anyone near it can make a play.
- *Catch:* receiver probability from hands, contest, ball height/speed; defenders attempt INTs/deflections by ball skills.
- *Tackling:* tackle vs break-tackle, momentum (weight × speed), carrier moves with timing windows, gang tackles, diving tackles from behind.
- *Difficulty* changes only AI brains: reaction delays, pursuit angle commitment, rush technique, coordinator adapting to your tendencies. Ratings are never boosted (`tests/playEngine.test.ts`).

**Adding content.** New route/concept: add to `ROUTES`/`PLAYS` (art and the sim update together). New gear option: add to `gear.json` and draw it in `playerModel.ts`. New position for the user: set `available` in `qbArchetypes.json`'s position list, add its archetype data and a controller mode (the sim already switches control to any ball carrier). Gamepad remaps: `input.ts` only.

## Coach Dynasty — game engine

`GameSimulation` holds a `GState` (quarter, clock, possession, ball spot 0–100 from the offense's goal line, down, distance, score, timeouts, phase `kickoff | scrimmage | pat | final`, OT state, momentum). `step()` resolves exactly one play or period transition and returns a `PlayEvent`. This lets the UI animate plays one at a time, change coaching settings between snaps and pause for 4th-down decisions, while `simulateToEnd()` is used for CPU games.

Per play: pre-snap clock runoff (tempo) or timeouts → kneel / end-of-half logic → 4th-down decision (AI chart or user) → pre-snap penalties → play call (run/pass probability by scheme + situation + user sliders; formation & concept weights from data) → defensive call (blitz/man-zone) → resolution from effective unit matchups (OL vs DL, receivers vs coverage, QB accuracy by depth, pressure/sack/scramble, YAC, tackles, fumbles, INTs, DPI/holding) → down/distance/possession/score/clock update → stats → injuries.

Effective ratings = attribute compressed by `ratingSpread` around a pivot, minus fatigue, plus scheme fit, coaching staff, home field (stadium size × fan support × rivalry), momentum, game-day form and garbage-time let-up. Weather affects accuracy, fumbles and kicking.

College rules implemented: 15-min quarters, 3 timeouts/half, clock stops on first downs only inside 2:00 of each half, clock restarts after out-of-bounds outside 2:00, touchback to the 25, fair catch inside the 25, 15-yard max DPI with automatic first down, missed FG returns to the previous spot (min 20), safety free kick from the 20, OT from the 25 with mandatory 2-pt tries from 2OT and alternating 2-pt shootout from 3OT.

## Season flow

`Dynasty.phase`: `regular` (weeks 1–14) → `ccg` (week 15, top two per conference at a neutral site) → `postseason` (week 16 bowls + CFP first round, then one CFP round per week) → `seasonComplete` (champion crowned, history recorded) → `offseason` (`startOffseason`) → `startNextSeason` → `regular`.
Every transition happens in `completeWeek`, so the UI only calls "play/sim this week". The playoff bracket is data: each round lists its games as pairs of seeds or earlier slots (`"R1-4"` = winner of first-round game 4), so a 4-team, 12-team or 16-team format is a config change.

Offseason player development depends on potential, year, work ethic, development rate, staff development ratings, facilities, playing time, injuries and random variance, including ~5% breakouts and ~4% busts. Until the recruiting system exists, every program's staff auto-signs a class whose quality comes from recruiting power, current prestige, HC recruiting rating and recent success. Stars are assigned by national rank with scouting noise, which yields about 2,400 recruits per year. Old seasons are compacted (box-score detail dropped) and departed players removed, so saves stay around 11 MB across many seasons.

## Reproducibility

Every game has a stored seed (`Game.seed`, derived from dynasty seed + season + game id). Same rosters + same seed + same decisions = identical game, play for play (`tests/gameEngine.test.ts`). Quick Sim exposes the seed.

## Persistence

The `Dynasty` object is plain JSON (≈7–11 MB for ~10k players; stable across seasons). Saves carry a `version`; `migrateDynasty` upgrades older saves (v1 → v2 resumes a finished Milestone 1 regular season at championship week). `SaveManager` stores it in IndexedDB (localStorage is too small) under manual slots or one autosave slot per dynasty; export/import uses the same JSON.

## Extending

- More conferences/teams: add JSON files under `data/teams/` and a conference entry with `"playable": true`. The schedule, rankings and UI pick them up.
- 3D renderer: implement a new renderer that consumes `PlayAnimation` (world coordinates in yards, z = height).
- New systems (recruiting, portal, NIL): add modules under `simulation/`, persisted fields on `Dynasty`, and hub tabs.

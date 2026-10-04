# LCPS BOWL

**Friday Nights. Loudoun County. One Champion.**

A pixel-art, arcade American football game about Loudoun County Public Schools high school football. You pick an LCPS school, become the head coach, and play every snap of every Friday night yourself, from Week 1 through the LCPS Bowl, across as many seasons as you want.

> Personal, non-commercial fan project. School names, mascots, colors and districts are real. Every player is fictional: names are random first/last combinations, never real students. Real logos are not bundled (see [Team logos](#team-logos)).

## Play online

Every push to `claude/lcps-bowl-game-i7fuzv` builds the game and publishes it to the `gh-pages` branch (`.github/workflows/lcps-bowl-pages.yml`). It is served at **https://ratnersy68-glitch.github.io/Football-game/** once Pages is set to *Deploy from a branch → gh-pages / (root)* in the repo settings.

## Run it

```bash
cd lcps-bowl
npm install
npm run dev        # → http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the game (Vite dev server) |
| `npm run build` | Typecheck + production build to `dist/` (static, relative paths, so it works from any folder) |
| `npm test` | Vitest suite: rules, play engine, full games, schedule, full dynasty season, saves |
| `npm run sim -- 10 300` | Simulate 10 CPU-vs-CPU games (5-min quarters) and print league averages |
| `npx tsx scripts/botGames.ts 6 300 LEGEND` | A scripted "human" plays real games through the input path vs. the CPU |
| `npx tsx scripts/simDynasty.ts 3` | Simulate 3 complete dynasty seasons headlessly |
| `npx tsx scripts/playLab.ts slants 200 "Cover 2"` | Run one play 200 times against a coverage and report the outcomes |
| `node scripts/e2e.mjs out/` | Browser playtest with screenshots (needs `npm run dev` on port 5199, or pass a URL) |
| `node scripts/e2eExactGear.mjs out/` | Correction-pack acceptance: earn BB → shop shows the 4 supplied helmet and 4 pad images → buy both → equip on the QB → reload → next game, where the QB wears both |
| `node scripts/e2eMotion.mjs out/ URL 6` | Plays real downs and samples the animation director against engine events (throw → flight → catch → carry, tackles), with zoomed contact sheets |
| `npx tsx scripts/exportAtlases.ts` | Exports the character rig as PNG atlases + `manifest.json` (frames, fps, loops, events, anchors) to `public/assets/sprites/` |
| `npx tsx scripts/assetAudit.ts` | Rewrites `docs/ASSET_AUDIT.md`, re-hashing every supplied file against the pack's SHA-256 list |

## Controls

| Key | Action |
| --- | --- |
| WASD / Arrows | Move |
| Shift | Sprint (uses stamina) |
| Space | Snap · dive · jump for the ball · kick meter |
| 1 – 5 | Throw to that receiver. Icons are green when open, yellow when tight, red when covered. On the QB Read, 1 gives it to the back. |
| T | Throw it away (during the play) · Timeout (in the huddle) |
| Q / E, or double-tap W/S | Juke up / down |
| F | Spin move |
| R | Stiff arm (ball carrier) |
| Tab / C | Switch defender (before or during the snap) |
| H | Hurry-up offense |
| Enter | Continue |
| Esc / P | Pause (resume, controls, sim to end, quit) |

Input goes through `src/game/input/Input.ts`, which builds an abstract `ControlInput`, so a gamepad or touch layer can be added later by feeding the same structure.

## What's in the game

**Football engine** (`src/game`): a real-time 11-on-11 simulation, not a text sim.
- Players are physical bodies with speed, acceleration, mass and stamina, and they collide. Blocking is a strength-vs-strength engagement where linemen get beaten, the pocket collapses, and rushers who win slip past their blockers.
- Receivers run actual routes, and man/zone coverage reacts to route breaks. Passes have flight time, leading, accuracy (arm, accuracy, pressure, throwing on the move, weather) and contested catches. You get drops, deflections, interceptions, throwaways and intentional grounding.
- You control the runner directly, with jukes, spins, dives, broken tackles, gang tackles, fumbles and big hits.
- Kickoffs (deep or onside), punts (fair catches, touchbacks, blocks), and a two-stage aim/power kick meter for field goals and extra points.
- NFHS-flavored rules: downs, first downs, touchdowns, PATs, two-point tries, safeties, touchbacks, timeouts, halftime, Kansas-plan overtime, and the VHSL-style running clock at a 35-point second-half lead.
- Clock management: the clock runs between snaps unless stopped, and you can use timeouts or hurry-up. Quarters are 2, 3, 5 or 8 minutes.
- You can play defense as well: pick a formation (4-3, 3-4, Nickel, Dime, Goal Line) and a coverage (Man, Cover 2/3/4, Blitz, Zone Blitz), see a coverage preview, control any defender and switch between them. Auto-sim defense is optional.
- CPU AI by difficulty (Freshman → Legend): reaction time, pursuit angles, coverage discipline, QB reads, ball-carrier vision, tendency recognition against your play calls, blitz and coverage selection, clock management, timeouts, 4th-down and 2-point decisions. Harder levels make the AI smarter. Your players are never slowed down.

**Presentation**
- 16-bit canvas renderer: night stadium with light towers, an animated crowd that stands up on big plays, a student section, the band, the home team's banner wall, cheerleaders, the bench, refs and the chain crew.
- Home-team end zones, yard numbers, hash marks and goalposts. Rain, snow, wind and cold.
- "FRIDAY NIGHT" intro with PA announcements, rivalry, senior night and playoff tags. Confetti and fireworks for wins and titles.
- Scoreboard, banners, and a box score with a retro newspaper write-up generated from the real game stats.
- Synthesized retro sound (crowd, whistle, cadence, hits, catches, kicks, horn, drumline) with volume controls. You can override any sound with your own audio files.

**Dynasty** (`src/dynasty`)
- All 17 LCPS programs with researched mascots, colors, districts and history (`src/data/teams.ts`). Programs start at different strengths and expectations, from Rebuild to Powerhouse.
- 10-week schedules: full district round-robins (Catoctin, Dulles, Potomac), Independence's Cedar Run games against out-of-county opponents, non-district fill, and a Rivalry Week finale.
- Standings sortable by district or region, LCPS power rankings (margin-aware Elo, so strength of schedule and quality wins count) and a weekly Top 10.
- Playoffs: Region 4C (Catoctin + Dulles) and Region 5D/6 (Potomac + Independence) seed by record and power. The two regional champions meet in the **LCPS Bowl**. Two formats: 8 teams or 12 teams. There's a visual bracket and a championship presentation with a trophy.
- Players have position-specific ratings, potential, XP and levels, and you spend upgrade points as they level. Grades advance every year (FR/SO/JR/SR), seniors graduate, and new freshman classes arrive. Injuries happen, and Sports Medicine helps.
- Program building ("Recruiting" for high schools): earn Program Points and spend them on Weight Room, Practice Facilities, Coaching Staff, Youth Development, Sports Medicine, Film Room and Community Support. These drive your freshman pipeline, development, crowds and how smart your teammates play.
- Awards: LCPS Player of the Year, Offensive and Defensive Player of the Year, QB/RB/WR/Lineman of the Year, Coach of the Year, and All-LCPS First and Second Teams.
- An all-time record book (single game, season, career, team) that persists across seasons, plus championship banners, program history, alumni, and rivalry series records since your dynasty began.
- Weekly events: injuries, breakout freshmen, QB competitions, boosters, staff departures and early returns. Weather follows the calendar.
- Saves: 3 slots in IndexedDB using a compact format, with autosave after every week.

**Exhibition**: pick any two schools, home/away, weather, time of day, difficulty and quarter length, or watch the CPU play.

## LCPS Locker: Bowl Bucks and gear

Gear is cosmetic only. It never changes ratings, speed, accuracy, strength, injury odds or collision size.

- **Bowl Bucks (BB)** are earned only by playing dynasty games.
  - The rewards screen itemizes every line.
  - Each completed game pays exactly once, keyed by season and game id, so reloads and revisits never pay again.
  - A new dynasty starts with 300 BB, and a typical win pays 250–700 BB.
- **Exact supplied products:** the shop's **Helmets** and **Shoulder Pads** categories are the eight products from the correction pack. Each shows its supplied image unchanged on a white panel, with `object-fit: contain`.

  | Item | Category | Rarity | Price |
  | --- | --- | --- | --- |
  | SPEEDFLEX | Helmet | Epic | 1,500 BB |
  | F7 | Helmet | Rare | 1,000 BB |
  | VICIS ZERO2 | Helmet | Legendary | 2,000 BB |
  | VICIS ZERO2 TRENCH | Helmet | Legendary | 2,250 BB |
  | X-FLEX PADS | Shoulder Pads | Epic | 1,250 BB |
  | VICIS ELITE PADS | Shoulder Pads | Legendary | 2,000 BB |
  | BATTLE PADS | Shoulder Pads | Rare | 750 BB |
  | 2-IN-1 PADS | Shoulder Pads | Common | 400 BB |

  - Everyone starts with a team-issued helmet and pads, which are not sold.
  - Source-to-destination mappings and hashes are in `src/assets/registry.ts` and `docs/ASSET_AUDIT.md`.
- **In game**, each product becomes its own low-res layer:
  - Helmets are team-colored shells. Each model has its own side, front and back profile, panel cuts and facemask shape.
  - Pads change the shoulder silhouette under the jersey; they are never drawn exposed.
- **Other gear:** visors, sleeves, bands, gloves, towels, spats/tape, cleats and accessories stay attached to their joints in every frame.
- **Purchases** check funds, deduct once, block duplicates and save immediately. One purchase unlocks the style for any number of roster players.
- **Save migration:** the save schema is versioned (`locker.gearSchema`).
  - Before migrating, older saves are backed up raw (`lcps-bowl:backup:<slot>:gear-v1`).
  - Earlier invented helmets map to a supplied model only where there was a clear match (Flex Panel → SPEEDFLEX, Faceted → F7, Smooth Zero → ZERO2, Trench → ZERO2 TRENCH).
  - Anything else is kept as a legacy record and is never sold.
- **LOCKER** has five sections:
  - **SHOP:** helmets, shoulder pads, finishes and the other gear categories, plus school collections and Friday Night Drops.
  - **MY GEAR**
  - **CUSTOMIZE PLAYER**
  - **COLLECTION:** achievements, trophy gear and drops.
  - **TEAM THEMES**
- **GAME DAY FIT** appears before each dynasty game.

## Characters and animation

Players are drawn by one layered pixel rig (`src/gear/rig/`), built from `Character_Motion_Guide.png`, `IMG_3755.png` and the techpack (`docs/correction-pack/`).

- **Grid:** a 48×48 cell with its origin at (24, 42), drawn nearest-neighbor at integer scale.
- **Builds:** three builds share one pixel grid and helmet size.
  - **SKILL:** QB, WR, CB, S, K. Front shoulders 15 px.
  - **HYBRID:** RB, LB, TE. Front shoulders 17 px.
  - **LINEMAN:** OL, DL. Front shoulders 22 px.
- **Directions:** right, left, toward the camera and away from it. Numbers and school marks are never mirrored, and left/right gear stays on the anatomical side.
- **Actions:** all 31 techpack actions, with their frame counts, fps, loop modes, next states and zero-based event frames (`src/gear/rig/spec.ts`).
- **Gameplay director:** `src/game/render/anim.ts` picks actions from the play simulation and its confirmed events, including snap, handoff, throw, catch, interception, tackle, sack, kick, shed, juke, spin, stiff arm and dive. Animations never award a catch, turnover or score on their own.
- **Football:** there is exactly one football. It sits at the holder's grip anchor and flies on its own after release.
- **ANIMATION LAB** (main menu footer) previews every action, frame, build, direction and helmet/pad pair, with anchor overlays.

## Team logos

Real logos are not downloaded. To use them, drop files into the team folders and the game picks them up automatically everywhere:

```
public/assets/teams/<team-id>/logo.png
public/assets/teams/<team-id>/helmet.png   (optional)
```

Until a file exists, a clean initials badge in school colors is shown. A fake logo is never substituted. Team ids are listed in `public/assets/teams/README.md`.

## Data notes

- **Schools:** all 17 LCPS high schools that field varsity football as of 2025-26.
- **District alignment:** follows 2025-26, which also applies to the 2026 season. Catoctin and Dulles are Class 4 / Region 4C, Potomac is Class 5 / Region 5D, and Independence is Class 6 / Cedar Run. The VHSL realignment approved for 2027-31 is not applied.
- **Colors and mascots:** taken from school and LCPS pages, Wikipedia and MaxPreps. Hex values approximate the published color names. Loudoun County is the Captains (renamed in 2020). Lightridge is the Lightning ("Bolts"). Potomac Falls is purple and black.
- **Stadiums:** only Riverside's stadium name (FACT Field) is used as an official name. Other stadiums are labeled generically ("<School> Stadium"). The LCPS Bowl is played at a neutral site, which is a game-design choice.
- **Rivalries:**
  - Strongly sourced: Battle of the 'Burn (Stone Bridge vs Broad Run) and Loudoun Valley vs Woodgrove.
  - Supported: Loudoun County vs Loudoun Valley, Stone Bridge vs Briar Woods, and Briar Woods vs Broad Run.
  - Plausible same-town or neighbor pairings: the rest.
  - Series records start counting when your dynasty begins. No historical results are invented.
- **Team ratings and prestige:** game-design starting points based on recent program success, not factual claims.

## Project layout

```
src/
  game/        engine: PlaySim (one play), AI, Rules, GameSession (one game), Coach (CPU play calling),
               Plays (playbook/formations/routes), players, Lineup, Bot, render/, input/, audio/
  dynasty/     Season (orchestrator), Schedule, Standings, Rankings, Playoffs, Development, Awards,
               Records, Events, Stories, DynastyApp/DynastyPages (UI)
  gear/        Bowl Bucks economy, gear catalog, look resolver, Locker/Shop/Rewards UI
  gear/rig/    character rig: spec (actions/timing/events), poses, rasterizer, helmet & pad layers, canvas cache
  assets/      registry of the supplied correction-pack files (paths + SHA-256)
  data/        teams, fictional name pools
  screens/     MainMenu, Exhibition, GameScreen, Settings, TeamDatabase, RecordBook
  components/  shared UI (logos, play diagrams, box score)
  save/        settings + IndexedDB save slots
public/assets/ teams/<id>/logo.png (supplied official logos), gear/ (supplied product art), sprites/ (exported atlases), reference/
tests/         Vitest
scripts/       sims, audits, browser playtests
```

Game logic never touches the DOM. The renderer only reads state. That means the whole game, including a full dynasty, can run headless in Node for tests and balance audits.

See [CHECKLIST.md](CHECKLIST.md) for the feature checklist and status.

# Changelog

## 0.3.0 — Player Career, Milestone 1: play one drive in 3D

### Added
- **Player Career mode** (main menu). Create a QB: name/nickname/hometown, position (QB), archetype, height/weight/body type, skin/hair/facial hair, 100-point build with live OVR/stars/recruiting rank, jersey number with coach alternatives, full gear customization with a live 3D turntable (helmet/arms/cleats close-ups), difficulty and quarter length.
- **Real-time football engine** (`src/play/engine`): 22 athletes at 60 Hz; route running, pass protection vs 4-man rush and blitzes, Cover 0/1/2/3 with reaction lag, projectile ball flight with lead and an accuracy model, catches/drops/deflections/INTs, control of the receiver after the catch, pursuit with intercept angles, tackling with jukes/spins/stiff arms/hurdles/dives and gang/diving tackles, sacks, out of bounds, touchdowns, safeties.
- **Three.js presentation**: Ohio Stadium-style horseshoe (double deck, south stands, stone facade, press box, light towers, video board), painted field with Block-O midfield and end zones, PS2/PS3-style rigged players showing every gear option, animated runs/throws/catches/tackles, ball with spiral, LOS & first-down lines, pre-snap route art, receiver icons with read assist, three cameras with zoom/height.
- **Drive loop & HUD**: play-call screen with route diagrams and the coach's call, play clock with delay-of-game, snap/drop back/charge-and-release throws (touch/bullet/lob), result cards, 4th-down go/FG/punt, drive summary with QB stats and log, pause menu, controls help, scorebug.
- Keyboard + gamepad input layer (`src/play/input.ts`).
- Tests: `tests/playEngine.test.ts` (15). `scripts/playtestBot.ts` tuning harness. `scripts/e2e/career.mjs` browser playtest.

### Changed
- Main menu leads with Player Career; coach dynasty unchanged.

## 0.2.0 — Milestone 2: postseason, multi-season & logos

### Added
- Official team logos for all 125 programs, loaded at runtime from ESPN's CDN via `data/logos.json` (badges, scorebug, midfield), with team-color fallback and a Settings toggle.
- Conference championship games (week 15) at Lucas Oil Stadium, Mercedes-Benz Stadium and AT&T Stadium.
- Data-driven College Football Playoff (`playoffConfig.json`): 12 teams, 5 highest-ranked champions auto-bid, straight seeding, top-4 byes, campus first round, Rose/Sugar/Orange/Cotton quarterfinals, Fiesta/Peach semifinals, title game at Hard Rock Stadium.
- 22 named bowls for bowl-eligible teams (`bowls.json`).
- Awards engine: Heisman, Davey O'Brien, Doak Walker, Biletnikoff, Outland, Ted Hendricks, Butkus, Jim Thorpe, Coach of the Year, with finalists.
- Season history, coach career achievements and season log.
- Offseason: stat archiving, graduation, early NFL declarations, 7-round/224-pick draft, player development (work ethic, dev rate, coaching, facilities, playing time, injuries, breakouts, busts), auto-signed classes with national star rankings, class rankings, prestige evolution, next-season rollover.
- UI: postseason home cards, CFP & Bowls tab with bracket, History tab, national-champion celebration, offseason summary, postseason rows on the schedule, coach career stats, scorebug ranks and logos.
- Save migration v1 → v2.
- Tests: postseason structure, playoff selection/seeding/byes, bowls, awards/history, offseason, development distribution, 4-season stability, save migration, logo coverage (48 tests). `npm run sim:dynasty` multi-season audit; `scripts/e2e/season.mjs` plays a full season through the UI.

### Fixed
- Box-score popup after "Sim Game" disappeared when the following week was a bye.
- Initial Elo now uses current (evolving) program prestige.


## 0.1.0 — Milestone 1: playable vertical slice

### Added
- Project scaffold: Vite + React + TypeScript, Vitest, Playwright smoke scripts.
- Data: 18 Big Ten, 16 SEC, 16 Big 12 programs (stadiums, capacities, colors, prestige, NIL, facilities, recruiting territory, schemes, philosophy), 75 non-conference opponents (ACC, Notre Dame, Pac-12, Group of Five, FCS), 50+ rivalries with trophies, neutral sites and rivalry-week flags; positions, archetypes, schemes, playbook, game/ranking/schedule configs.
- Seeded RNG; roster, coach and world generation.
- Play-by-play `GameSimulation` engine: run/pass/sack/scramble/kicks/punts/FG/XP/2-pt, onside kicks, safeties, penalties (false start, offside, holding, DPI), fatigue & rotations, injuries, weather, home field, momentum, game-day form, garbage time, college clock & overtime rules, timeouts, kneel-downs, hail marys, 4th-down chart, user 4th-down decisions and coaching sliders.
- Tuned against real college football averages (≈28 PPG, 62% completions, 7.3 YPA, 4.1 YPC, 42% third downs, ≈4% OT).
- Schedule generator (circle-method conference slates, rivalry week, relocated non-conference rivalry games, neutral sites, non-con fill, home/away balance).
- Elo power ratings, AP-style Top 25, conference standings with tiebreakers, news feed from sim events.
- Season engine: apply results (records, team & player stats, injuries, coach records), weekly CPU depth charts, injury healing, weekly polls & news.
- Visualization: event → animation choreographer; canvas renderer with perspective broadcast camera and All-22 camera, stadium crowd, painted end zones and midfield logo, LOS/first-down lines, player sprites with jersey numbers, ball flight.
- UI: main menu, team select, program overview, dynasty hub (9 tabs), game screen with scorebug, lower thirds, highlight banners, play-by-play, live box score, coaching tab, 4th-down prompt, final screen; quick sim with seeds; settings; save/load/export/import.
- Tests: RNG, engine invariants over 400 games, reproducibility, user decisions, OT, schedule validity, full season, save/load, depth chart, animation↔simulation consistency. `npm run simtest` audits 10,000 games (0 violations).

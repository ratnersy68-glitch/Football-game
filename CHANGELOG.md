# Changelog

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

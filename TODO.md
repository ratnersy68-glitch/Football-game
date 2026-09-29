# TODO

## Milestone 1 — Playable vertical slice ✅
- [x] Main menu (New / Continue / Load / Quick Sim / Settings)
- [x] Team selection with Big Ten / SEC / Big 12 tabs and program cards
- [x] Program overview + Become Head Coach (name, schemes)
- [x] 50 programs + 75 non-conference opponents as data
- [x] Generated rosters (82 players/team, attributes, archetypes, hidden traits)
- [x] Coaches (HC/OC/DC) feeding the engine
- [x] Dynasty hub: Home, Team, Depth Chart (drag & arrows), Schedule, Game Plan, Top 25, Conference, News, Coach Profile
- [x] Schedule generator (9 conference games, rivalry week, neutral sites, non-con)
- [x] Play-by-play engine with college clock/OT rules, penalties, injuries, fatigue, weather, home field, momentum
- [x] 4th-down user decisions + live coaching sliders
- [x] Canvas field viewer: broadcast + All-22 cameras, animated plays, LOS/first-down lines, scorebug, banners
- [x] Watch / Fast Sim / Next Possession / Halftime / 4th Qtr / End controls
- [x] Box scores, player season/career stats, team stats
- [x] Elo + AP-style Top 25, conference standings, news feed
- [x] Save / Save As / Autosave / Export / Import
- [x] Tests + 10,000-game audit

## Milestone 1 audit notes / known limitations
- Season ends after week 14 regular season (no title games, bowls or CFP yet).
- Top 25 ranks only Big Ten/SEC/Big 12 teams; pool opponents are unranked.
- Team passing yards are net of sacks (NFL convention); sacks are not charged to rushing.
- No redshirts, position changes, promises or medical redshirts yet.
- Special teams returners are auto-selected (not on the depth chart).
- Two-point plays are resolved by a simplified model (still animated).
- Save files are large (~10 MB) — fine for IndexedDB; could be compacted.
- Google Fonts load from the network; offline falls back to system fonts.

## Next: Milestone 2 — Postseason & multi-season core
- [ ] Conference championship games (config already in `conferences.json`)
- [ ] `playoffConfig` (team count, auto-bids, seeding, byes) + 12-team CFP bracket UI
- [ ] Bowl games, national championship, celebration screens
- [ ] Season rollover: graduation, class advancement, player development (potential, coaching, playing time, work ethic, variance)
- [ ] Dynasty history (champions, awards, records by season)
- [ ] Awards (Heisman-style, position awards, Coach of the Year)

## Later milestones (priority order)
- [ ] Recruiting: ~2,500-recruit classes, scouting, weekly actions, interest meters, CPU competition, commitments, news
- [ ] NIL economy (collectives, budgets, market values, offers)
- [ ] Transfer portal
- [ ] Player development depth, redshirts, position changes, promises
- [ ] Coaching staffs, carousel, job offers, job security / AD expectations
- [ ] Program prestige evolution (historical vs current)
- [ ] NFL draft projections
- [ ] Coaches poll + CFP committee rankings
- [ ] Actual play calling during games
- [ ] Difficulty settings (recruiting/portal competition, AI roster management, scouting fog)
- [ ] 100-season inflation audit
- [ ] Presentation: crowd noise, bands, night games, individual stadium geometry, Three.js renderer

# LCPS BOWL — Development Checklist

Status: ✅ done · 🟡 partial / simplified · ⬜ not yet

## Milestone 1: playable game (required before the dynasty)
- ✅ Start LCPS Bowl → select a school → start an exhibition → select an opponent
- ✅ Load the football field → call an offensive play → snap → control the QB → throw to receivers
- ✅ Run the football → tackle players → score touchdowns
- ✅ Track downs and score → play a complete game → win or lose

## Phase 1: football engine
- ✅ Field (end zones, yard numbers, hash marks, goalposts, sidelines, benches)
- ✅ Players as physical bodies (speed, acceleration, mass, stamina) with collisions
- ✅ Blocking engagements (run and pass blocking, sheds, pancakes, pocket collapse)
- ✅ Routes (go, fade, seam, slant, out, hitch, curl, stick, dig, post, corner, drag, cross, flat, wheel, swing, screen…)
- ✅ Passing: lead, flight time, accuracy model, pressure, contested catches, drops, INTs, throwaways, grounding
- ✅ Running: user-controlled carrier, sprint and stamina, juke, spin, dive, broken tackles, fumbles
- ✅ Defense: man and zone coverage, blitzes, pursuit angles, tackling
- ✅ Play calling: RUN / SHORT / MEDIUM / DEEP / PLAY ACTION / SCREEN / SPECIAL, 4 plays per page
- ✅ Defensive play calling: 4-3, 3-4, Nickel, Dime, Goal Line × Man, Cover 2/3/4, Blitz, Zone Blitz
- ✅ Human defense: control any defender, switch player, dive tackle, jump for the ball, coverage preview
- ✅ Kickoffs (deep and onside), punts (fair catch, touchback, blocks), field goals and PATs (aim + power meter), two-point tries
- ✅ Rules: downs, first downs, TD, FG, XP, 2PT, safeties, touchbacks, turnovers, OOB, sacks
- ✅ Clock: running clock between snaps, stoppages, timeouts (3 per half), hurry-up, halftime, Kansas-plan OT, mercy running clock
- ✅ Quarter lengths of 2, 3, 5 or 8 minutes
- ✅ CPU AI scaled by difficulty: reads, pursuit, coverage, tendency recognition, blitzes, clock, timeouts, 4th downs, FG and 2PT decisions
- ✅ Frame-rate-independent simulation, so headless CPU games match live play

## Phase 2: LCPS presentation
- ✅ Researched team database (17 schools: mascots, colors, districts, history, rivalries)
- ✅ Logo/helmet asset pipeline (`public/assets/teams/<id>/`) with initials-badge fallback
- ✅ Home and away uniforms and helmet designs drawn from school colors
- ✅ Main menu with a live CPU game under a Friday-night stadium
- ✅ School selection cards (ratings, prestige, program expectation)
- ✅ Scoreboard, banners, Friday Night intro, PA lines, rivalry, senior night and playoff tags
- ✅ Stadium atmosphere: lights, animated crowd, student section, band, cheerleaders, chain crew, refs
- ✅ Weather (rain, snow, wind, cold) and time of day (night, dusk, day)
- ✅ Sound (synthesized, with optional real audio overrides) and volume controls
- 🟡 Crowd and band are pixel sprites, not hand-drawn art (real art can be dropped into `public/assets`)

## Phase 3: dynasty
- ✅ 10-game schedules: district round-robins, rivalry week, non-district and out-of-county opponents
- ✅ Standings (sortable; district, region and all views)
- ✅ Roster with depth chart editing, player cards, season/career stats
- ✅ Player progression: XP, levels, upgrade points, potential caps
- ✅ Graduation, grade advancement, freshman classes
- ✅ Program prestige evolution

## Phase 4: postseason
- ✅ LCPS power rankings (weekly, with movement)
- ✅ Playoff bracket: 2 regions → LCPS Bowl; 8-team or 12-team format
- ✅ Championship presentation (special intro, trophy, confetti and fireworks), permanent banners
- ✅ Awards: POY, OPOY, DPOY, QB/RB/WR/Lineman of the Year, Coach of the Year, All-LCPS 1st and 2nd teams

## Phase 5: depth
- ✅ All-time record book: single game, season, career and team records; champions list
- ✅ Rivalries: series history, rivalry week, bigger crowds, bonus program points, morale
- ✅ Injuries (in-game and practice), healed weekly; Sports Medicine reduces them
- ✅ Dynamic weekly events (breakouts, QB competition, boosters, staff changes, early returns)
- ✅ Program upgrades (7 facilities) feeding development, freshman talent, crowds and in-game AI
- ✅ Newspaper game stories from real stats; news feed
- ✅ Save system: 3 slots, IndexedDB with fallback, autosave after every week

## Gear shop and Bowl Bucks
- ✅ Bowl Bucks earned from play: itemized post-game rewards, balance shown in the menu and dynasty header
- ✅ LCPS Locker: shop (16 categories, filters, featured drops), my gear, customize player, collection, team themes
- ✅ ~250 original items with rarity price bands, plus a 6-item collection for every LCPS school
- ✅ Purchase, inventory, favorites, equip on any player, randomize fit, team drip, player card GEAR tab
- ✅ Layered player sprite: purchased gear renders on players during gameplay (verified in the browser)
- ✅ Achievements, trophy gear, rare drops, championship collection, team themes, game day fit
- ✅ CPU auto drip by position and style personality; cosmetic only

## Testing
- ✅ Unit and integration tests (Vitest) for every rule listed in the spec plus full games and a dynasty season
- ✅ Headless balance audits (CPU vs CPU, scripted-human bot vs CPU at each difficulty)
- ✅ Browser playtests with screenshots (menu, exhibition, play calling, passing, defense, dynasty, season end)

## Ideas / next
- ⬜ Gamepad and touch controls (input layer is ready for them)
- ⬜ Penalties (false start, holding, pass interference)
- ⬜ Coach-defined custom playbooks
- ⬜ Hand-drawn sprite sheets to replace the procedural pixel art
- ⬜ Web Worker for faster weekly simulation

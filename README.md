# SATURDAY 26

Two ways to play college football:

- **Player Career (new, 3D):** create a quarterback, customize every piece of his gear, walk into an Ohio Stadium-style horseshoe and play the snaps yourself — real-time Three.js, real ball flight, real route running and coverage.
- **Coach Dynasty:** a college football **head coach** simulation. You run a Big Ten, SEC or Big 12 program; the engine simulates every game play by play, and you watch it unfold on a broadcast-style field while making the calls a head coach makes.

> Private personal-use prototype. Real program names, stadiums and colors are used as data; all players and coaches are fictional.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the game (Vite dev server) |
| `npm run build` | Typecheck + production build to `dist/` |
| `npm test` | Unit/simulation test suite (Vitest) |
| `npm run simtest -- 10000` | Simulate N random games and print league averages + rule-violation audit |
| `npm run sim:game -- ohio_state michigan 48291` | Print a full play-by-play for one seeded game |
| `npm run sim:season` | Simulate a full dynasty season headlessly |
| `npm run sim:dynasty -- 10` | Simulate N complete seasons (postseason + offseason) and print champions, Heismans and rating trends |
| `npm run build:embed` | Build ONE self-contained HTML file (`dist-embed/saturday26-embed.html`) to paste into Google Sites → Insert → Embed → Embed code |
| `npm run e2e:career` | Browser test that creates a player and plays a drive with real keyboard input (needs `npm run dev`) |
| `npx tsx scripts/playtestBot.ts 400 1` | Headless bot QB plays N snaps at difficulty D and prints completion %, YPA, sacks, INTs, YAC — the engine tuning harness |
| `npm run e2e` | Browser smoke tests (needs `npm run dev` running; set `CHROMIUM_PATH` if Playwright can't find Chromium) |

## Player Career — Milestone 1 (playable 3D drive)

Main menu → **Player Career** → **Create New Player**: name/nickname/hometown → position (QB; the others are listed for later milestones) → archetype (Field General, Dual Threat, Gunslinger, Scrambler, Improviser) → height/weight/body type, skin tone, hair, facial hair → spend 100 build points (live OVR, stars and recruiting rank) → jersey number (the coach offers alternatives if a returning player wears it) → gear with a live 3D turntable (facemask style & color, visor, mouthguard, eye black, each sleeve, wristbands/QB play card, gloves, hand warmer, towel, back plate, shoulder pads, socks, cleats) → difficulty → **Enter Ohio Stadium** vs Michigan.

In the stadium: call a play (10 pass concepts with route diagrams, or the coach's call) → line up → **Space** to snap → drop back with **WASD** → **hold 1–5** to charge a throw to that receiver and release to throw (tap = touch, hold = bullet, **Q** = lob) → the ball flies as a projectile and is caught, dropped, broken up or intercepted by whoever gets to it → after a catch you control the receiver (**Shift** sprint, **J/L** juke, **K** spin, **I** stiff arm, **H** hurdle, **F** dive) → tackled → down & distance, spot, clock and score update → call the next play. 4th down: go for it / field goal / punt. Full controls: **F1** in game.

## Coach Dynasty — what works (Milestone 1)

Main menu → **New Dynasty** → Big Ten / SEC / Big 12 tabs → program cards → program overview → **Become Head Coach** → Dynasty Hub (Home, Team, Depth Chart, Schedule, Game Plan, Top 25, Conference, News, Coach Profile) → **Play Week** → watch the game on the field (or fast sim / sim to next possession / halftime / 4th quarter / end) → final score + box score → back to the hub with records, rankings, standings, stats, injuries and news updated → autosave. Also: Quick Sim of any matchup with a reproducible seed, Continue/Load/Save/Save As/Export/Import, Settings.

## Milestone 2 — postseason & multi-season

Conference championship games at their real neutral sites → 12-team College Football Playoff (format in `src/data/playoffConfig.json`: 5 highest-ranked champions + at-large, top-4 byes, campus first round, New Year's Six quarterfinals/semifinals, title game) → 20+ named bowls → national champion celebration → statistically-driven awards (Heisman, O'Brien, Doak Walker, Biletnikoff, Outland, Hendricks, Butkus, Thorpe, Coach of the Year) → offseason (graduation, early NFL declarations, 7-round draft, player development with breakouts and busts, signing classes, prestige changes) → next season. Every season is stored in the History tab.

**Team logos:** official logos load at runtime from ESPN's public CDN using team IDs in `src/data/logos.json` (nothing is bundled in the repo). Any logo that can't load falls back to a team-color roundel; Settings has a toggle. To use your own image for a team, put its URL in `overrides` in `logos.json`.

See [ARCHITECTURE.md](ARCHITECTURE.md), [TODO.md](TODO.md) and [CHANGELOG.md](CHANGELOG.md).

## Embedding (Google Sites)

`npm run build:embed` produces a single ~1.2 MB HTML file (includes the 3D Player Career mode) with all JS/CSS inlined. In Google Sites: **Insert → Embed → Embed code**, paste the whole file, then drag the embed box as large as you like. The ⛶ button (bottom-right) goes full screen; if the site's frame doesn't allow full screen it opens the game in its own tab instead. Saves live in that browser's storage, so use **Export** in the hub to keep a backup file.

### Short embed code (no big file)

`npm run build:cdn`, commit + push, then `node scripts/buildCdn.mjs --snippet <commitSha>` prints a 5-line snippet (saved to `embed/EMBED_CODE.html`) that loads `embed/saturday26.js`/`.css` from this public repo via jsDelivr. Paste that snippet into Google Sites → Insert → Embed → Embed code. Rebuild and use the new commit id after game updates.

## ⚾ DIAMOND '26 — playable baseball (new)

A separate, fully playable MLB-style baseball game lives on its own page: `npm run baseball`
(→ `/baseball.html`). You pitch, hit with a PCI, field, throw and run the bases against the CPU
with all 30 MLB clubs and simplified versions of their ballparks. See [BASEBALL.md](BASEBALL.md).

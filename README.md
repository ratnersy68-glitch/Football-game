# SATURDAY 26

A college football **head coach** simulation. You run a Big Ten, SEC or Big 12 program; the engine simulates every game play by play, and you watch it unfold on a broadcast-style field while making the calls a head coach makes.

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
| `npm run e2e` | Browser smoke tests (needs `npm run dev` running; set `CHROMIUM_PATH` if Playwright can't find Chromium) |

## What works (Milestone 1)

Main menu → **New Dynasty** → Big Ten / SEC / Big 12 tabs → program cards → program overview → **Become Head Coach** → Dynasty Hub (Home, Team, Depth Chart, Schedule, Game Plan, Top 25, Conference, News, Coach Profile) → **Play Week** → watch the game on the field (or fast sim / sim to next possession / halftime / 4th quarter / end) → final score + box score → back to the hub with records, rankings, standings, stats, injuries and news updated → autosave. Also: Quick Sim of any matchup with a reproducible seed, Continue/Load/Save/Save As/Export/Import, Settings.

See [ARCHITECTURE.md](ARCHITECTURE.md), [TODO.md](TODO.md) and [CHANGELOG.md](CHANGELOG.md).

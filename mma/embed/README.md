# Putting Octagon Fight Night on Google Sites

**Option A — paste the whole game (works offline, no external files):**
open `octagon-fight-night-google-sites.txt`, select all, copy. In Google Sites: **Insert → Embed → Embed code**, paste, **Next → Insert**, then drag the embed box as large as you like.

**Option B — short snippet:** paste the 5 lines in `EMBED_CODE.html` instead. They load `octagon.js`/`octagon.css` from this public repo through jsDelivr (pinned to a commit). Requires the GitHub repository to be public.

Tips: click inside the game once so it receives your keyboard. The ⛶ button (bottom-right) goes full screen; if the site's frame blocks full screen it opens the game in its own tab. Settings/bindings/tournament saves use browser storage and are simply not kept if the embed blocks storage.

Rebuild after game changes: `npm run build:standalone` (and `node scripts/buildStandalone.mjs <commitSha>` to regenerate the pinned snippet).

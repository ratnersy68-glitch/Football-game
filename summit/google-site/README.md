# Putting SUMMIT on a Google Site

`summit.html` is the whole game in one self-contained file (about 1 MB, no external files).
Rebuild it after code changes with `npm run build:site`.

## Option A: paste the code (simplest)

1. Download `summit.html` from this folder (on GitHub: open the file → **Download raw file**).
2. Open it in a text editor (Notepad, TextEdit in plain-text mode, VS Code) and copy **everything**.
3. In Google Sites: **Insert → Embed → Embed code**, paste, click **Next → Insert**.
4. Drag the embed box's corners to make it big (full width, ~700 px tall works well).
5. **Publish**. Visitors click inside the game once so it receives the keyboard.

If Google Sites refuses the paste because it is too large, use Option B.

## Option B: host the file and embed by URL

Upload `summit.html` to any static host (GitHub Pages, Netlify Drop, Cloudflare Pages, itch.io as an
HTML game), then in Google Sites use **Insert → Embed → By URL** with the page's address, or paste:

```html
<iframe src="https://YOUR-HOST/summit.html" style="width:100%;height:720px;border:0"
        allow="fullscreen; gamepad; autoplay" allowfullscreen></iframe>
```

## Notes

- Saves (profile, coins, gear) are stored in the visitor's browser. In some embedded frames the browser
  blocks storage; the game still runs, but progress resets when the page is reloaded.
- It needs a computer with a keyboard (or a gamepad) and a reasonably modern graphics chip.
  Use **Settings → Graphics → Low** on slow machines.

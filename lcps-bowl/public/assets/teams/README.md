# Team logos

`<team-id>/logo.png` holds the supplied official logo for each of the 17 LCPS schools, downloaded from that school's LCPS website header. Sources, URLs and download dates are in `src/data/logo-manifest.json`. `tests/assets.test.ts` checks every file byte-for-byte against the correction pack's SHA-256 list.

These are school logos and lockups, not verified football helmet decals. The game shows the full logo, unchanged, in menus and on scoreboards. The tiny in-game helmet mark is a downsampled derivative of it.

There is no generated fallback. If a file fails to load, the UI shows **MISSING LOGO** and logs an error.

The logos belong to their schools. This personal project is not endorsed by LCPS or any school.

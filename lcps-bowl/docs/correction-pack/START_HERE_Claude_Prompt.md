# LCPS BOWL — FIX EXACT GEAR, CHARACTER MOTIONS AND REAL TEAM LOGOS

Work inside my EXISTING LCPS Bowl project. This is a correction and integration task, NOT a new game.

The previous implementation invented its own equipment and team logos. That is not what I want. I am supplying an asset pack with the actual shop images, real school logo files, the character motion guide and the full animation tech pack. Use those files. Do not substitute your own designs.

First locate this extracted `lcps-correction-pack` folder, inspect every supplied image, and inspect the existing game, asset loader, equipment database, player renderer, animations, team registry and save system. Then implement the corrections, run the game, and verify them visually and through tests. Do not stop after describing a plan.

## 1. Required input files

This folder contains:

- `gear/`: eight exact product images, with original filenames.
- `logos/`: 17 downloaded real school logos from each school's official LCPS website.
- `logo-manifest.json`: exact team IDs, local image paths, official source pages, direct image URLs and athletics links.
- `Character_Motion_Guide.png`: visual key-pose sheet.
- `IMG_3755.png`: the original coarse-pixel character style reference.
- `LCPS_Bowl_Character_Techpack.md`: full technical specification.

Read the entire tech pack. Use the motion guide for pose appearance and the tech pack for frame counts, timing and attachments. The visual sheet is not an evenly registered machine-ready sprite atlas: build correctly aligned sprites from it; do not blindly crop it.

If an input cannot be found or decoded, report the EXACT missing path. Do not quietly generate a replacement. Do not say a file was imported when you only added its name to a database.

## 2. EXACT helmets and pads — authoritative mapping

The following eight items must appear in the shop using the corresponding SUPPLIED IMAGE. The filenames, not the order of an upload, determine the mapping.

| Item ID | Display name | Exact supplied file under `gear/` | Rarity | Price |
| --- | --- | --- | --- | --- |
| `speedflex` | SPEEDFLEX | `25C53D5B-3475-4BED-B326-2FB03A0A5B5C.jpeg` | Epic | 1,500 BB |
| `f7` | F7 | `3A6EFFAB-8FD9-42AD-9E99-162ADC973A56.jpeg` | Rare | 1,000 BB |
| `vicis-zero2` | VICIS ZERO2 | `94A2F4DE-7730-423A-ABBB-C8CAB722B78D.jpeg` | Legendary | 2,000 BB |
| `vicis-zero2-trench` | VICIS ZERO2 TRENCH | `0A2D9EEB-F7B5-4504-8F92-1EBF914501F9.jpeg` | Legendary | 2,250 BB |
| `x-flex-pads` | X-FLEX PADS | `16961CB2-D683-4D8C-9AEE-5D01AF1D0307(1).jpeg` | Epic | 1,250 BB |
| `vicis-elite-pads` | VICIS ELITE PADS | `EB908341-A1CF-42CD-969F-D48411E0B595(1).jpeg` | Legendary | 2,000 BB |
| `battle-pads` | BATTLE PADS | `08D2B271-8C9B-48C7-BEF3-28256D1519C6(1).jpeg` | Rare | 750 BB |
| `2-in-1-pads` | 2-IN-1 PADS | `738AF0EB-3B68-4A96-8C89-3CC9D191C8E4(1).jpeg` | Common | 400 BB |

The `(1)` suffix on the four pad filenames matters: use those versions. Do not replace them with the original photography or another similarly named file.

Visual checks:

- SPEEDFLEX: supplied red shell, dark visor, black facemask, distinctive shell panels and white chinstrap.
- F7: supplied black Schutt-marked shell and angular black facemask; no added visor in the unchanged shop image.
- VICIS ZERO2: supplied white shell, white facemask, dark face opening, VICIS forehead mark.
- VICIS ZERO2 TRENCH: supplied black shell, black facemask, dark visor, VICIS forehead mark.
- X-FLEX PADS: supplied gray/black segmented shoulders with lime accents.
- VICIS ELITE PADS: supplied charcoal/black pads, gold fasteners and attached-looking lower plate in the product art.
- BATTLE PADS: supplied white/black pads with BATTLE/DEFENDER marks.
- 2-IN-1 PADS: supplied black pads with striped gray shoulder/chest sections and 2-in-1 marks.

These names are game catalog labels supplied by me, not a request to authenticate commercial product model numbers.

### Shop image rules

Use the actual images through an image element or texture loader. NO emoji, generated SVG helmets, generic vector icons, CSS silhouettes, initials or newly drawn product art as substitutes. Do not redraw, recolor, mirror, distort, crop the equipment or overwrite the originals.

Use large white product panels with `object-fit: contain`. Preserve image aspect ratio and all equipment edges. The original white backgrounds are acceptable. Copy originals into project assets; optional clean filenames are fine only with explicit source-to-destination mappings. Verify copied bytes against the supplied files with hashes.

Show name, rarity, price, owned/equipped state and a larger detail preview. The Helmets category must contain the four supplied models; Shoulder Pads must contain the four supplied pad models. Stop serving the made-up replacements for these slots. Leave unrelated working shop categories intact. Do not delete unrelated assets.

### In-game versions are a different asset class

The large product image is shop artwork, NOT a head overlay to paste onto a small player. Create low-resolution gameplay equipment layers based on the exact supplied shapes. Preserve recognizable model differences. Team-colored gameplay helmet shells are allowed; changing the supplied shop artwork is not.

Never implement four names pointing to the same gameplay silhouette. Preserve shell panel and facemask distinctions where native resolution allows. Shoulder pad choices change shoulder width/profile UNDER the jersey, rather than appearing exposed. Treat an exposed back plate as its own optional slot; do not force one onto every player merely because it appears in a product image.

All eight items must be cosmetic: no changes to speed, accuracy, strength, injury probability or collision size.

## 3. Real logos — use the included files

The following are actual school logos downloaded from official school sites, NOT AI-generated replacements. Some are school crest/wordmark lockups rather than isolated football helmet decals. Use the complete supplied logo in menus and scoreboards. Do not claim these are verified exact helmet decal designs.

| Team ID | School | Team | Logo file |
| --- | --- | --- | --- |
| `briar-woods` | Briar Woods | Falcons | `logos/briar-woods.png` |
| `broad-run` | Broad Run | Spartans | `logos/broad-run.png` |
| `dominion` | Dominion | Titans | `logos/dominion.png` |
| `freedom` | Freedom, South Riding | Eagles | `logos/freedom.png` |
| `heritage` | Heritage, Leesburg | Pride | `logos/heritage.png` |
| `independence` | Independence, Ashburn | Tigers | `logos/independence.png` |
| `john-champe` | John Champe | Knights | `logos/john-champe.png` |
| `lightridge` | Lightridge | Lightning | `logos/lightridge.png` |
| `loudoun-county` | Loudoun County | Captains | `logos/loudoun-county.png` |
| `loudoun-valley` | Loudoun Valley | Vikings | `logos/loudoun-valley.png` |
| `park-view` | Park View, Sterling | Patriots | `logos/park-view.png` |
| `potomac-falls` | Potomac Falls | Panthers | `logos/potomac-falls.png` |
| `riverside` | Riverside, Leesburg | Rams | `logos/riverside.png` |
| `rock-ridge` | Rock Ridge | Phoenix | `logos/rock-ridge.png` |
| `stone-bridge` | Stone Bridge | Bulldogs | `logos/stone-bridge.png` |
| `tuscarora` | Tuscarora, Leesburg | Huskies | `logos/tuscarora.png` |
| `woodgrove` | Woodgrove | Wolverines | `logos/woodgrove.png` |

Match existing team IDs safely: if the game uses different IDs, map rather than duplicate teams or break saved dynasties. These are Loudoun County PUBLIC SCHOOL teams; do not substitute schools with the same names from other counties or states. Loudoun County's current identity is CAPTAINS, not Raiders.

Read `logo-manifest.json` for each source and attribution. Copy logos locally into the project's public/assets/teams directory and reference those files. Do not hotlink remote images during games. Do not search again or replace a supplied logo unless the file is corrupt or I explicitly ask for another official variant.

Use the SAME centralized team logo registry everywhere:

- Main team selection and opponent selection.
- Exhibition previews, dynasty home, roster and schedule.
- Standings, rankings, playoff bracket and championship screens.
- Pregame presentation and live scoreboard.
- Postgame results and team-based locker collections.

Remove generated letters, mascot icons and invented shields from these team-logo locations. Keep aspect ratios, preserve native colors and transparency, and never tint the entire school logo to a team color. Do not stretch a wide lockup into a square. Keep numbers and text unmirrored.

For tiny in-game helmet markings, render a faithful downsampled derivative from the official file. It is a simplified school mark, not proof of an actual helmet decal. Do not invent mascot artwork or automatically crop lettering off an official logo. If exact real-life decal layout is needed and no verified source exists, flag that gap instead of fabricating it.

No fallback should silently look like a finished logo. During development show an obvious missing-asset label and record an error. Final acceptance requires all 17 assets to load. This is a personal project; do not represent it as officially endorsed, and do not assume public/commercial distribution rights.

## 4. Character style and builds

Match `IMG_3755.png`: coarse square-pixel football characters, flat colors, compact helmet, chunky limbs and clear silhouette. Do not switch to smooth vector people, stick figures, detailed realistic players or rounded rectangles sliding around.

Use three builds on one pixel grid:

- SKILL: QB, WR, DB, K, P; slim shoulders and legs.
- HYBRID: RB, LB, TE; medium torso and thicker thighs.
- LINEMAN: OL, DL; broad shoulders, thicker arms, low stance.

Suggested native frame: 48×48 transparent PNG, origin `(24,42)`. Render nearest-neighbor at integer zooms. Keep helmet scale consistent; widen bodies instead of scaling the entire player. The reference's orange/white uniform is a style demo, not the uniform for every school. Preserve verified team colors and correct inaccurate data only from reliable school sources.

## 5. ALL motion requirements

Implement the full schedule from `LCPS_Bowl_Character_Techpack.md`. At minimum these named actions and timing defaults must exist; counts are per build and direction. FPS means animation frames per second, not game rendering FPS.

| Action | Unique frames | FPS | Visual behavior |
| --- | --- | --- | --- |
| Idle | 2 | 3 | Subtle breathing, planted feet |
| Pre-snap skill stance | 2 | 3 | Bent knees, ready hands |
| Three-point stance | 2 | 3 | One hand down, low hips |
| Walk | 4 | 6 | Alternating foot contact and arm swing |
| Run without ball | 6 | 10 | Contact/compress/push on each leg |
| Run with ball | 6 | 10 | Football tucked, free arm swings |
| Sprint | 6 | 12 | Deeper lean, stronger stride |
| QB dropback | 4 | 8 | Backward steps, two hands on football |
| Throw | 6 | 12 | Set, draw back, cock, step, release, follow through |
| Handoff | 4 | 10 | Secure, turn, extend, retract |
| Receive handoff | 4 | 10 | Approach, pocket, accept, tuck |
| Chest/low catch | 4 | 12 | Reach, contact, pull in, tuck |
| High catch | 6 | 10 | Load, jump, reach, contact, tuck, land |
| Juke | 4 | 12 | Plant, lean, direction shift, accelerate |
| Spin | 6 | 12 | Plant, turn through facing views, recover |
| Stiff arm | 4 | 10 | Protect football and extend free arm |
| Block | 4 | 8 | Crouch, step, hands extend, contact hold |
| Shed block | 4 | 10 | Brace, swipe, turn, disengage |
| Defensive shuffle | 4 | 8 | Lateral movement in low stance |
| Backpedal | 4 | 8 | Low hips, backward foot contacts |
| Tackle | 6 | 12 | Lower, plant, shoulder contact, wrap, descend, ground |
| Get tackled | 6 | 12 | Impact, twist, collapse, land, settle |
| Dive | 6 | 12 | Load, push, horizontal travel, descend, land, slide |
| Sack | 6 | 12 | Defender contact plus QB protecting ball and falling |
| Interception | 6 | 10 | Track, reach, contact, secure, pivot, return ready |
| Center snap | 4 | 10 | Stance, grip, backward snap, rise |
| Kick / field goal | 6 | 12 | Approach, plant, backswing, strike, follow through, recover |
| Punt | 6 | 10 | Hold, extend, drop, swing, strike, follow through |
| Kneel | 4 | 8 | Secure, lower, knee contact, hold |
| Get up | 6 | 8 | Prone, hands down, knee, foot planted, rise, ready |
| Celebrate | 6 | 8 | Stand tall, raise arms, bounce, fist pump, settle, neutral |

The tech pack contains the authoritative loop modes and zero-based action event frames. Support right, left, toward-camera and away-camera. Do not mirror numbers/logos backward. A left sleeve stays on the anatomical left arm when the player turns. Right/left handedness and kicking-foot variants must not silently swap accessory ownership.

Not every position uses every action. Position-specific state machines choose relevant actions: center snaps, QB throws, receivers catch, linemen block, defenders tackle, kickers kick. Make states respond to real gameplay, not a disconnected animation gallery.

If the game does not yet support a listed move, wire up its mechanic and controls within the existing input system before marking it complete. Keep the full asset schedule available in a development preview while implementing. Do not pretend that having an animation ID means the action is playable.

## 6. Layered rendering and synchronization

Per-frame attachment points: head, shoulders, elbows, wrists, hips, ankles and football grip. Build near/far limb layers; jersey covers pads. Helmet, facemask and visor move as a head group. Sleeve follows arm, glove follows hand, spats and cleat follow ankle. Back plate follows lower torso; towel follows waist.

There is one football entity. Attach it to the hand/tuck anchor while possessed and render it independently during flight. Do not leave a ball painted into the body sprite after a pass. Trigger releases/catches/turnovers exactly once and only when confirmed by gameplay. A visual animation cannot award a score or force a turnover on its own.

Tackles align attacker and victim at contact; do not teleport either to finish a pose. Recovery states return players to ready/run or the dead-ball sequence. Looped blocking uses the hold phase, not repeated lunging. Shadows stay on the ground beneath jumping/diving characters. Logical collision sizes remain separate from gear and animated limb bounds.

## 7. Purchasing, ownership and saves

Use the existing Bowl Bucks system and reward rules. Fix the flow: completed game → rewards → shop → buy → own → equip → next game visibly uses chosen gear.

Purchases check funds, deduct once, unlock the style for multiple roster players, and save immediately. Block insufficient funds and duplicate purchases. Show equipped state per selected player. Cosmetics do not add ratings.

Existing saves must survive. Version the schema, map old equipment IDs where a clear corresponding item exists, and preserve balance, season, stats and rosters. For unrelated invented gear with no mapping, keep legacy save data without offering it as one of these eight exact products. Do not clear localStorage or silently reset the dynasty to make tests pass. Export a save backup before migrations when possible.

Rewards must be keyed to a unique completed game so reloads and revisiting results do not award BB repeatedly. Never award test currency in production code.

## 8. Verification and definition of done

Create an asset audit listing each required source, imported path, equipment/team ID and hash. Add tests that the eight catalog items map to the correct supplied images and all 17 teams map to their own supplied logos.

Run an animation preview for every action, build, direction and equipped helmet/pad pair. Check pose shapes against the motion guide, attachment stability, transparent edges and clean transitions. Use screenshots of real shop cards and gameplay, not only successful build logs.

Test:

1. The four helmet cards display the four actual provided images, not invented assets.
2. The four pad cards display the four exact `(1)` images.
3. All 17 team logos load locally on team select, live scoreboard and postseason screens.
4. Buy a helmet and pads, equip a real roster player, play the next game, and verify both changed the intended visuals.
5. Change teams, body builds and facing directions; gear remains attached and school identity stays correct.
6. A completed pass shows throw/release → flight → catch/contact → tuck → carry run.
7. Tackles, sacks, kicks, punts and recoveries do not create double footballs or stuck states.
8. Reload the game; balance, ownership, equipped items, logo mapping and dynasty persist.
9. Complete a full game without breaking downs, possession, score or clock.

Implement in stages: exact source assets and registry → shop correction → team logo correction → core motion rig → gameplay gear layers → remaining actions → save migration and full-game QA. Keep working gameplay usable during each stage.

At completion report what was actually implemented, show visual evidence, list tests run and disclose unfinished actions or asset gaps. Do not call this done merely because the UI displays the right names.

BEGIN NOW: locate and inspect the supplied pack, audit the existing code, then correct the actual assets and rendering.

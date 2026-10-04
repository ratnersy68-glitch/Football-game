# LCPS Bowl — Character Animation Tech Pack

Use this specification with the accompanying Character Motion Guide image and `IMG_3755.png`. The guide illustrates key poses; the frame counts and implementation requirements below define the production assets. The guide is not a ready-to-import sprite atlas.

## Art direction

Match the supplied character: coarse square pixels, flat color areas, compact helmet, broad jersey shoulders, short block-shaped arms, white pants, colored socks and simple cleats. Default demonstration palette: orange jersey, white helmet/pants/cleats, tan skin, pale blue visor, dark brown football. School palettes replace uniform colors without changing the style.

No smoothing, gradients, realistic textures, detailed fingers, round vector curves or thin outlines. All players share one pixel density. Do not scale up a skill player to create a lineman; widen the body on the same grid. Use varied skin palettes independently of position or attributes. The green rounded tile in the reference is a background, not part of the player.

## Production grid

- Suggested native cell: 48 × 48 pixels, transparent RGBA PNG.
- Standing hybrid character: approximately 16 × 28 pixels, positioned inside the cell with room for throwing, kicking and diving.
- Origin: `(24, 42)`, the standing foot baseline. Keep this registration constant in every frame and equipment layer.
- Preview at 4× or 8× nearest-neighbor scale. Use `imageSmoothingEnabled = false` on Canvas and `image-rendering: pixelated` in CSS.
- Separate shadow from the character; render it at the ground position even while the player jumps.
- Logical collisions follow gameplay position, not helmet/arm pixels or airborne silhouette.
- Final pixel coordinates must be rebuilt on the fixed grid. Do not crop the generated visual guide and assume its cells are registered assets.

## Player builds and roles

| Build | Body specification | Positions | Typical visual posture |
| --- | --- | --- | --- |
| Skill | 13–15 px shoulder width; slim torso and legs | QB, WR, DB, K, P | Upright QB; forward lean for runners; low DB stance |
| Hybrid | 16–18 px shoulders; medium torso and thighs | RB, LB, TE | Compact runner; planted, lower defensive stance |
| Lineman | 20–22 px shoulders; wider torso, thicker arms/thighs | OL, DL | Low hips and broad blocking base |

Helmet height stays consistent between builds. Shoulder pad selection adjusts shoulder shape within each build instead of changing total character scale. All schools reuse these rigs with school uniform colors and marks. Individual roster players use equipment, skin palette and build variants.

## Directions

Deliver right, left, toward-camera and away-camera sets. The visual guide demonstrates right-facing motions and neutral reference views. Use the same action timing across directions. Left-facing sprites may mirror the body, but preserve left/right equipment ownership, readable numbers and school marks. Throwing hand and kicking foot are player properties. Use right-handed poses by default, with left-handed variants supported by the rig.

## Animation schedule

Counts below are unique frames per direction, per build. Timings are art playback defaults; gameplay event timing remains authoritative. Looping motion rate can adapt to movement speed.

| Motion | Frames / FPS | Loop | Required sequence and gameplay event |
| --- | --- | --- | --- |
| Idle | 2 / 3 | Yes | Neutral, subtle shoulder lift; feet stay planted |
| Pre-snap skill stance | 2 / 3 | Yes | Knees bent, slight weight shift; QB hands ready for snap |
| Three-point stance | 2 / 3 | Yes | One hand down, low hips, feet staggered; OL/DL variant |
| Walk | 4 / 6 | Yes | Left contact, passing, right contact, passing |
| Run without ball | 6 / 10 | Yes | Contact, compress, push, opposite contact, compress, push; opposite arm/leg swing |
| Run with ball | 6 / 10 | Yes | Same leg cycle; ball tucked at ribs, free arm swings |
| Sprint | 6 / 12 | Yes | Stronger torso lean and longer stride; no taller helmet |
| QB dropback | 4 / 8 | Yes | Two hands on football; alternating back steps; head looks downfield |
| Throw | 6 / 12 | No | Set, draw back, cock, step, release, follow through; detach ball entering frame 4 (zero-based) |
| Handoff | 4 / 10 | No | Secure, rotate, extend into runner pocket, retract; transfer only on confirmed runner contact during frame 2 |
| Receive handoff | 4 / 10 | No | Approach, form pocket, accept, tuck; synchronize with handoff event |
| Low / chest catch | 4 / 12 | No | Reach, contact, pull to chest, tuck; secure only if catch succeeds at frame 1 |
| High catch | 6 / 10 | No | Load, jump, reach, contact, tuck, land; contact at frame 3 |
| Juke | 4 / 12 | No | Plant, lean, shift, accelerate; ball stays tucked |
| Spin | 6 / 12 | No | Plant, quarter turn, back view, opposite side, front quarter, run recovery |
| Stiff arm | 4 / 10 | No | Tuck ball, raise free forearm, extend into contact, recover |
| Block | 4 / 8 | Yes after contact | Crouch, step, extend hands, hold; only final two frames loop during engagement |
| Shed block | 4 / 10 | No | Brace, swipe arm, turn shoulder, disengage |
| Defensive shuffle | 4 / 8 | Yes | Low stance, lateral step, close feet without crossing, next lateral step |
| Backpedal | 4 / 8 | Yes | Low hips, head forward, alternating backward foot contacts |
| Tackle | 6 / 12 | No | Lower, plant, drive shoulder, wrap, descend, grounded; resolve collision at contact, not on animation completion |
| Get tackled | 6 / 12 | No | Run interrupted, impact, twist, collapse, land, settle; retain ball unless fumble event occurs |
| Dive | 6 / 12 | No | Load, push off, horizontal travel, descend, ground contact, slide; football remains tucked |
| Sack | 6 / 12 | No | Tackle variant; QB protects ball, buckles, falls; coordinated attacker/victim poses |
| Interception | 6 / 10 | No | Track, reach, contact, secure, pivot, return-ready; reuse catch mechanics and trigger possession change once |
| Snap — center | 4 / 10 | No | Three-point hold, grip ball, drive backward, rise; detach snap ball at frame 2 |
| Kick / field goal | 6 / 12 | No | Approach, plant, backswing, strike, follow through, recover; launch football at frame 3 |
| Punt | 6 / 10 | No | Hold, extend, drop, leg swing, contact, follow through; free ball from hands at frame 2, strike at frame 4 |
| Kneel | 4 / 8 | No | Secure snap, lower, knee contact, hold; dead ball at legal knee-down event |
| Get up | 6 / 8 | No | Prone, hands down, one knee, plant foot, rise, ready; keep helmet fixed to head |
| Celebrate | 6 / 8 | Yes briefly | Stand tall, arms up, bounce, fist pump, settle, neutral; no invented extra limbs |

Zero-based frame events: first frame is frame 0. An animation event cannot create a catch, turnover or score that the football engine has not confirmed. All one-shot actions need explicit exit states.

## Position-specific requirements

| Position | Priority motions | Distinguishing detail |
| --- | --- | --- |
| QB | Snap reception, dropback, throw, handoff, scramble, sack, kneel | Ball held with both hands until throw or tuck; wrist coach optional |
| RB | Receive handoff, carry run, juke, spin, stiff arm, catch, get tackled | Tight elbow and protected football; free hand handles stiff arm |
| WR / TE | Stance, route run, chest/high catch, carry run, block | Hands reach toward actual ball arrival; TE uses hybrid build |
| OL / center | Three-point stance, snap, block, recovery | Low wide base; center alone performs snap |
| DL | Three-point stance, rush run, shed block, tackle, sack | Broad shoulders and forward lean |
| LB | Ready stance, shuffle, run, tackle, interception | Hybrid build with low read-and-react posture |
| DB | Backpedal, shuffle, sprint, catch/interception, tackle | Skill build; eyes/head oriented toward play |
| K / P | Approach run, kick/punt, recover | Visible planted foot and swinging leg; ball is separate |

## Equipment behavior

Shop pictures remain the supplied artwork. Gameplay equipment uses compatible low-resolution layers based on those models. Helmet differences are simplified shell profiles, panel blocks and facemask shapes. Pads are covered by the jersey and change shoulder silhouette; exposed back plates appear only where orientation allows.

Use the eight supplied equipment assets and item mappings from the existing shop prompt: SpeedFlex, F7, VICIS ZERO2, VICIS ZERO2 TRENCH; X-Flex, VICIS Elite, Battle and 2-in-1 pads.

Layer attachment points per animation frame: head, left/right shoulders, elbows, wrists, hips, ankles and ball grip. Store points in local cell coordinates. A left arm sleeve stays on the player's anatomical left arm during turns. Gloves follow wrists; cleats and spats follow ankles. Helmet, facemask and visor move together. Back plate follows lower torso. Towel hangs from waistband. Separate near/far limbs so the ball and equipment can pass behind/in front of the torso correctly.

Suggested depth: far limbs → body/pad silhouette → jersey/pants → near limbs/accessories → helmet → facemask/visor. Ball depth is pose dependent. Keep jersey numbers and team marks as separate orientation-aware overlays. Do not flatten all gear into one character image.

Cosmetics must remain attached during every action and must not alter player ratings or hitboxes. At native scale use strong silhouettes and a few contrasting pixels for visors, sleeves, gloves and cleats; enlarged previews may show extra detail without changing the game sprite style.

## Export and integration contract

- Deliver transparent PNG atlases and a JSON manifest containing native cell size, row/column layout, frame count, duration, loop mode, anchor positions and action events.
- Name atlases `{build}_{direction}_{layer}.png`, e.g. `skill_right_body.png`. Item atlases include item ID, build and direction, e.g. `speedflex_skill_right_helmet.png`.
- Prefer one animation per atlas row and reserve six cells per row; leave unused cells transparent. Keep identical animation row order across matching body/equipment atlases.
- Provide separate neutral front, side and back previews for all three builds.
- Suggested manifest fields: `animationId`, `frameIndices`, `fps`, `loop`, `nextState`, `events`, `anchorsByFrame`. Collision data belongs to the football engine.
- Keep ball as an independent sprite. Never show both a painted ball in the hand layer and a separate ball entity.

## Claude Code implementation brief

Inspect the existing renderer and animation state machine first. Adapt this proposal to the existing engine without rebuilding the game. Use the provided reference and motion guide as visual targets, then construct consistently registered pixel assets and layered attachments. Implement skill, hybrid and lineman rigs; apply them to roster positions and existing team colors.

Start with idle, carry/non-carry run, throw, catch, tackle and get up. Verify those in a playable game before implementing the remaining motions. Tie snap, release, catch and kick events to authoritative gameplay events, once each. Preserve working controls and saves.

Acceptance: completed passes show release → flight → contact → tuck; running ball carriers keep possession visually; tackle participants align at contact; left/right accessories survive facing changes; equipment stays attached in every frame; players recover from one-shot animations; all three builds stay recognizable; players remain sharp at integer zoom levels; a full game can finish with no stuck animation state.

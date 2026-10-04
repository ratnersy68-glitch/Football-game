/**
 * Equipment catalog — every piece of cosmetic gear in LCPS Bowl.
 * Helmets and shoulder pads are the eight EXACT supplied products (registry: src/assets/registry.ts).
 * Every other design is original.
 * Prices follow the rarity bands: common 100–300, rare 300–700, epic 700–1,500, legendary 1,500–4,000,
 * except the eight supplied products, which use the owner's exact prices (exact: true).
 */
import type { EquipmentCategory, EquipmentItem, Rarity, UnlockRequirement } from './types';
import { LCPS_TEAMS } from '../data/teams';

export const C = {
  white: '#f4f4f4', black: '#1b1b1f', gray: '#8a919c', silver: '#c0c6cf', gold: '#e8b923', goldHi: '#ffe27a',
  red: '#d62828', blue: '#2f6bff', green: '#2e9e4f', purple: '#7b3fe4', orange: '#ff7f1f', pink: '#ff6fb0',
  neon: '#b8ff2e', navy: '#14213d',
};
export const P = {
  flame: ['#ff4d00', '#ffb000', '#ffe066'],
  lightning: [C.black, '#ffe066'],
  ice: ['#bfe9ff', '#ffffff', '#7fd3ff'],
  camo: ['#4b5320', '#7a7f3a', '#2f3a1a'],
  checker: [C.black, C.white],
  flag: ['#c8102e', C.white, '#1f3a93'],
  rainbow: ['#ff3b3b', '#ffb000', '#ffee33', '#3bd16f', '#3b8bff', '#9b5cff'],
  iridescent: ['#7af0ff', '#c58bff', '#ff8bd8'],
  chrome: ['#eef3fa', '#9aa4b2', '#ffffff'],
  goldRush: [C.gold, C.goldHi, '#b8860b'],
  midnight: ['#0b0f2a', '#3a2a7a'],
  fridayNight: ['#0b0f2a', '#ffd84a', '#c8102e'],
};

export const CATEGORY_LABEL: Record<EquipmentCategory, string> = {
  helmet: 'Helmets', pads: 'Shoulder Pads', finish: 'Helmet Finishes', facemask: 'Facemasks', visor: 'Visors', mouthguard: 'Mouthguards',
  gloves: 'Gloves', sleeve: 'Arm Sleeves', wristband: 'Wristbands', armband: 'Arm Bands', handwarmer: 'Hand Warmers',
  towel: 'Towels', cleats: 'Cleats', socks: 'Socks', spats: 'Spats / Tape', undershirt: 'Undershirts',
  legsleeve: 'Leg Sleeves', accessory: 'Accessories',
};

export const RARITY_COLOR: Record<Rarity, string> = { common: '#9aa4b2', rare: '#3b8bff', epic: '#b45cff', legendary: '#ffb000' };

const items: EquipmentItem[] = [];
function add(category: EquipmentCategory, id: string, name: string, rarity: Rarity, price: number, colors: string[], desc: string, extra: Partial<EquipmentItem> = {}) {
  items.push({ id, name, category, rarity, price, colors, desc, ...extra });
}
const unlock = (u: UnlockRequirement) => ({ unlock: u, price: 0 });

// ---------------------------------------------------------------- helmets
// The four shop helmets are the EXACT supplied products (shop art = the supplied image, unchanged; see src/assets/registry.ts).
// Names/prices/rarities are the owner's catalog labels. In-game they become low-res, team-colored shell layers (sprite.ts).
add('helmet', 'helm-standard', 'Standard Issue Helmet', 'common', 0, [], 'Team-issued helmet every player starts with. Not sold in the shop.', { style: 'standard', issued: true });
add('helmet', 'speedflex', 'SPEEDFLEX', 'epic', 1500, [], 'Red shell, dark visor, black facemask, flex shell panels and white chinstrap in the shop art. Plays in your school colors.', { style: 'speedflex', image: 'assets/gear/speedflex.jpeg', exact: true });
add('helmet', 'f7', 'F7', 'rare', 1000, [], 'Black angular shell with an angular black facemask. Plays in your school colors.', { style: 'f7', image: 'assets/gear/f7.jpeg', exact: true });
add('helmet', 'vicis-zero2', 'VICIS ZERO2', 'legendary', 2000, [], 'White shell, white facemask, dark face opening and forehead mark. Plays in your school colors.', { style: 'zero2', image: 'assets/gear/vicis-zero2.jpeg', exact: true });
add('helmet', 'vicis-zero2-trench', 'VICIS ZERO2 TRENCH', 'legendary', 2250, [], 'Black shell, black lineman facemask, dark visor and forehead mark. Plays in your school colors.', { style: 'zero2trench', image: 'assets/gear/vicis-zero2-trench.jpeg', exact: true });

// ---------------------------------------------------------------- shoulder pads (worn UNDER the jersey: they change the shoulder silhouette)
add('pads', 'pads-standard', 'Standard Issue Pads', 'common', 0, [], 'Team-issued shoulder pads. Not sold in the shop.', { style: 'standard', issued: true });
add('pads', 'x-flex-pads', 'X-FLEX PADS', 'epic', 1250, [], 'Gray/black segmented shoulders with lime accents.', { style: 'xflex', image: 'assets/gear/x-flex-pads.jpeg', exact: true });
add('pads', 'vicis-elite-pads', 'VICIS ELITE PADS', 'legendary', 2000, [], 'Charcoal/black pads, gold fasteners and an attached lower plate.', { style: 'elite', image: 'assets/gear/vicis-elite-pads.jpeg', exact: true });
add('pads', 'battle-pads', 'BATTLE PADS', 'rare', 750, [], 'White/black pads with BATTLE / DEFENDER marks.', { style: 'battle', image: 'assets/gear/battle-pads.jpeg', exact: true });
add('pads', '2-in-1-pads', '2-IN-1 PADS', 'common', 400, [], 'Black pads with striped gray shoulder and chest sections.', { style: 'twoinone', image: 'assets/gear/2-in-1-pads.jpeg', exact: true });

// ---------------------------------------------------------------- finishes
add('finish', 'finish-gloss', 'Gloss Finish', 'common', 0, [], 'Classic shine.', { style: 'gloss' });
add('finish', 'finish-matte', 'Matte Finish', 'rare', 350, [], 'Flat, no glare. Looks fast standing still.', { style: 'matte' });
add('finish', 'finish-metallic', 'Metallic Finish', 'epic', 800, [], 'Flake-metal shell that catches the stadium lights.', { style: 'metallic' });
add('finish', 'finish-pearl', 'Pearl Finish', 'epic', 900, [], 'Soft pearlescent glow.', { style: 'pearl' });
add('finish', 'finish-chrome', 'Chrome Finish', 'legendary', 2200, [], 'Mirror-chrome shell. Everyone in the bleachers sees it.', { style: 'chrome' });
add('finish', 'finish-threepeat', 'Three-Peat Gold Trim', 'legendary', 0, [P.goldRush[0]], 'Awarded for three straight LCPS Bowl titles. Gold stripe and trim on any helmet.', { style: 'threepeat', ...unlock({ kind: 'threepeat', text: 'Win three consecutive LCPS Bowls' }), collection: 'championship' });
add('finish', 'finish-goat', 'GOAT Gold Finish', 'legendary', 0, [C.goldHi], 'Five championships. A solid-gold finish for any helmet.', { style: 'goat', ...unlock({ kind: 'titles', count: 5, text: 'Win 5 LCPS Bowl championships' }), collection: 'championship' });

// ---------------------------------------------------------------- facemasks
for (const [id, name, rarity, price, style, desc] of [
  ['mask-qb', 'QB Mask', 'common', 0, 'qb', 'Two open bars for clear sightlines.'],
  ['mask-skill', 'Skill Mask', 'common', 0, 'skill', 'Light three-bar mask for receivers and DBs.'],
  ['mask-rb', 'RB Mask', 'common', 150, 'rb', 'Center bar plus a protective jaw bar.'],
  ['mask-lb', 'LB Mask', 'common', 0, 'lb', 'Closed center bar for the second level.'],
  ['mask-dl', 'DL Mask', 'common', 200, 'dl', 'Heavy bars for life in the pile.'],
  ['mask-ol', 'OL Cage', 'common', 0, 'cage', 'Full cage. Nothing gets through.'],
  ['mask-kicker', 'Kicker Bar', 'common', 120, 'kicker', 'Single bar. Specialists only.'],
  ['mask-oldschool', 'Old School Bar', 'rare', 350, 'oldschool', 'One-bar throwback mask.'],
  ['mask-cage', 'Big Cage', 'rare', 450, 'bigcage', 'Oversized cage that wraps the jaw.'],
  ['mask-aggressive', 'Predator Mask', 'epic', 850, 'aggressive', 'Jagged, swept bars. Looks like it bites.'],
] as [string, string, Rarity, number, string, string][]) add('facemask', id, name, rarity, price, [], desc, { style });
add('facemask', 'mask-gold', 'Gold Mask', 'legendary', 1600, [C.gold], 'Solid gold-plated cage bars.', { style: 'skill' });
add('facemask', 'mask-chrome', 'Chrome Mask', 'legendary', 1800, [C.silver], 'Polished chrome bars.', { style: 'skill' });

// ---------------------------------------------------------------- visors
for (const [id, name, rarity, price, colors, desc] of [
  ['visor-clear', 'Clear Visor', 'common', 150, ['#d9f1ff'], 'Clear shield. Protection, no style points… yet.'],
  ['visor-lightsmoke', 'Light Smoke Visor', 'rare', 450, ['#7e8a9a'], 'Subtle tint.'],
  ['visor-darksmoke', 'Dark Smoke Visor', 'epic', 800, ['#3a3f4a'], 'Dark tint. Opponents can\'t read your eyes.'],
  ['visor-black', 'Blackout Visor', 'epic', 950, ['#0d0d10'], 'Pitch black. Pure menace.'],
  ['visor-mirror', 'Mirror Visor', 'epic', 1200, ['#c9d6e8', '#ffffff'], 'Reflects the stadium lights back at the crowd.'],
  ['visor-gold', 'Gold Visor', 'epic', 1300, [C.gold, C.goldHi], 'Gold iridium tint.'],
  ['visor-blue', 'Blue Visor', 'rare', 600, ['#3b8bff'], 'Electric blue tint.'],
  ['visor-red', 'Red Visor', 'rare', 600, ['#e03131'], 'Red tint.'],
  ['visor-purple', 'Purple Visor', 'rare', 650, ['#8a4dff'], 'Purple haze.'],
  ['visor-green', 'Green Visor', 'rare', 600, ['#2fbf5a'], 'Emerald tint.'],
  ['visor-orange', 'Orange Visor', 'rare', 650, ['#ff8a1f'], 'Sunset orange.'],
  ['visor-rainbow', 'Rainbow Visor', 'legendary', 2500, P.rainbow, 'Full-spectrum oil-slick shine.'],
  ['visor-iridescent', 'Iridescent Visor', 'legendary', 2200, P.iridescent, 'Shifts color as you move.'],
  ['visor-chrome', 'Chrome Visor', 'legendary', 2800, P.chrome, 'Liquid chrome. The rarest look on the field.'],
  ['visor-ice', 'Ice Visor', 'legendary', 2000, P.ice, 'Frozen blue mirror.'],
  ['visor-fire', 'Fire Visor', 'legendary', 3000, P.flame, 'Molten orange-to-gold gradient.'],
] as [string, string, Rarity, number, string[], string][]) add('visor', id, name, rarity, price, colors, desc);
add('visor', 'visor-rivalry', 'Rivalry Visor', 'legendary', 0, ['#c8102e', '#1b1b1f'], 'Win 5 rivalry games. Blood-red tint for rivalry night.', unlock({ kind: 'achievement', id: 'rivalry-king', text: 'Win 5 rivalry games' }));
add('visor', 'visor-lockdown', 'Lockdown Visor', 'legendary', 0, ['#0d0d10', '#5ad1ff'], 'Record 10 team interceptions in a season.', unlock({ kind: 'achievement', id: 'lockdown', text: '10 team interceptions in a season' }));
add('visor', 'visor-championship', 'Championship Visor', 'legendary', 0, [C.gold, '#0d0d10'], 'Second LCPS Bowl title.', { ...unlock({ kind: 'titles', count: 2, text: 'Win 2 LCPS Bowl championships' }), collection: 'championship' });
add('visor', 'visor-fridaynight', 'Friday Night Visor', 'legendary', 0, P.fridayNight, 'Stadium-light gradient. Only found in gear drops.', unlock({ kind: 'drop', text: 'Gear drop exclusive' }));

// ---------------------------------------------------------------- mouthguards
for (const [id, name, rarity, price, colors, style] of [
  ['mg-white', 'Standard Mouthguard', 'common', 0, [C.white], 'standard'],
  ['mg-black', 'Black Mouthguard', 'common', 100, [C.black], 'standard'],
  ['mg-team', 'Team Mouthguard', 'common', 150, ['primary'], 'standard'],
  ['mg-strap', 'Strapped Mouthguard', 'common', 120, [C.white], 'strapped'],
  ['mg-lip-black', 'Black Lip Guard', 'rare', 350, [C.black], 'lip'],
  ['mg-lip-gold', 'Gold Lip Guard', 'rare', 600, [C.gold], 'lip'],
  ['mg-lip-pink', 'Pink Lip Guard', 'rare', 450, [C.pink], 'lip'],
  ['mg-neon', 'Neon Mouthguard', 'rare', 400, [C.neon], 'strapped'],
  ['mg-fangs', 'Fang Lip Guard', 'epic', 900, [C.white, '#c8102e'], 'lip'],
] as [string, string, Rarity, number, string[], string][]) add('mouthguard', id, name, rarity, price, colors, style === 'lip' ? 'Lip guard that covers the teeth. Pure swagger.' : style === 'strapped' ? 'Strapped to the facemask; hangs loose between plays.' : 'Basic mouthguard.', { style });

// ---------------------------------------------------------------- gloves
for (const [id, name, rarity, price, colors, desc] of [
  ['gloves-white', 'White Gloves', 'common', 150, [C.white], 'Clean white receiver gloves.'],
  ['gloves-black', 'Black Gloves', 'common', 150, [C.black], 'All-business black.'],
  ['gloves-team', 'Team Gloves', 'rare', 400, ['primary'], 'Your school\'s primary color.'],
  ['gloves-twotone', 'Two-Tone Gloves', 'rare', 500, ['primary', 'secondary'], 'School primary and secondary, split.'],
  ['gloves-pink', 'Pink Gloves', 'rare', 450, [C.pink], 'Pink-out ready.'],
  ['gloves-neon', 'Neon Gloves', 'rare', 500, [C.neon], 'You can see these from the parking lot.'],
  ['gloves-camo', 'Camo Gloves', 'rare', 600, P.camo, 'Woodland camo.'],
  ['gloves-checker', 'Checker Gloves', 'epic', 900, P.checker, 'Black and white checkerboard.'],
  ['gloves-lightning', 'Lightning Gloves', 'rare', 650, P.lightning, 'Black with yellow bolts.'],
  ['gloves-flame', 'Flame Gloves', 'epic', 1000, P.flame, 'Hot hands.'],
  ['gloves-ice', 'Ice Gloves', 'epic', 1100, P.ice, 'Ice cold in the clutch.'],
  ['gloves-stars', 'Stars & Stripes Gloves', 'epic', 900, P.flag, 'Red, white and blue.'],
  ['gloves-gold', 'Gold Gloves', 'legendary', 1600, P.goldRush, 'Solid gold grip.'],
  ['gloves-chrome', 'Chrome Gloves', 'legendary', 1800, P.chrome, 'Liquid-metal palms.'],
] as [string, string, Rarity, number, string[], string][]) add('gloves', id, name, rarity, price, colors, desc);
add('gloves', 'gloves-1000', '1,000 Yard Gloves', 'legendary', 0, [C.black, C.gold], 'A player on your team rushes for 1,000 yards in a season.', unlock({ kind: 'achievement', id: 'thousand-yards', text: 'A player rushes for 1,000 yards in a season' }));
add('gloves', 'gloves-airraid', 'Air Raid Gloves', 'legendary', 0, [C.white, '#5ad1ff'], 'Throw for 400 yards in one game.', unlock({ kind: 'achievement', id: 'air-it-out', text: 'Throw for 400 yards in one game' }));
add('gloves', 'gloves-championship', 'Championship Gloves', 'legendary', 0, [C.gold, C.white], 'First LCPS Bowl title.', { ...unlock({ kind: 'titles', count: 1, text: 'Win the LCPS Bowl' }), collection: 'championship' });

// ---------------------------------------------------------------- arm sleeves
for (const [id, name, rarity, price, colors, style] of [
  ['sleeve-white', 'White Full Sleeve', 'common', 150, [C.white], 'full'],
  ['sleeve-black', 'Black Full Sleeve', 'common', 150, [C.black], 'full'],
  ['sleeve-white-half', 'White Half Sleeve', 'common', 120, [C.white], 'half'],
  ['sleeve-black-half', 'Black Half Sleeve', 'common', 120, [C.black], 'half'],
  ['sleeve-team', 'Team Sleeve', 'rare', 350, ['primary'], 'full'],
  ['sleeve-second', 'Secondary Sleeve', 'rare', 350, ['secondary'], 'full'],
  ['sleeve-padded', 'Padded Sleeve', 'rare', 450, [C.black, '#3a3f4a'], 'padded'],
  ['sleeve-stripe', 'Stripe Sleeve', 'rare', 550, ['primary', C.white], 'full'],
  ['sleeve-camo', 'Camo Sleeve', 'rare', 600, P.camo, 'full'],
  ['sleeve-gradient', 'Gradient Sleeve', 'epic', 750, ['primary', 'secondary', C.white], 'full'],
  ['sleeve-gold', 'Gold Arm Sleeve', 'epic', 700, P.goldRush, 'full'],
  ['sleeve-lightning', 'Lightning Sleeve', 'epic', 850, P.lightning, 'full'],
  ['sleeve-flame', 'Flame Sleeve', 'epic', 900, P.flame, 'full'],
  ['sleeve-chrome', 'Chrome Sleeve', 'legendary', 1700, P.chrome, 'full'],
] as [string, string, Rarity, number, string[], string][]) add('sleeve', id, name, rarity, price, colors, style === 'half' ? 'Elbow-length compression sleeve.' : style === 'padded' ? 'Padded forearm sleeve for linemen and backs.' : 'Shoulder-to-wrist compression sleeve.', { style });
add('sleeve', 'sleeve-airraid', 'Air Raid Sleeve', 'legendary', 0, [C.white, '#5ad1ff', C.black], 'Throw for 3,000 yards in a season.', { style: 'full', ...unlock({ kind: 'achievement', id: 'air-raid', text: '3,000 passing yards in a season' }) });

// ---------------------------------------------------------------- wristbands / armbands / hand warmers
for (const [id, name, rarity, price, colors] of [
  ['wrist-white', 'White Wristband', 'common', 0, [C.white]], ['wrist-black', 'Black Wristband', 'common', 100, [C.black]],
  ['wrist-team', 'Team Wristband', 'common', 150, ['primary']], ['wrist-gold', 'Gold Wristband', 'rare', 450, [C.gold]],
  ['wrist-neon', 'Neon Wristband', 'rare', 350, [C.neon]],
] as [string, string, Rarity, number, string[]][]) add('wristband', id, name, rarity, price, colors, 'Sweatband at the wrist. Stackable with sleeves.');
add('wristband', 'wrist-coach', 'Wrist Coach', 'rare', 300, [C.white, C.black], 'QB playcard on the forearm.', { style: 'coach' });
for (const [id, name, rarity, price, colors] of [
  ['band-white', 'White Arm Band', 'common', 100, [C.white]], ['band-black', 'Black Arm Band', 'common', 100, [C.black]],
  ['band-team', 'Team Arm Band', 'common', 200, ['primary']], ['band-double', 'Double Bands', 'rare', 400, [C.white, C.black]],
  ['band-gold', 'Gold Arm Band', 'epic', 750, P.goldRush],
] as [string, string, Rarity, number, string[]][]) add('armband', id, name, rarity, price, colors, 'Upper-arm band. Stack them up.');
for (const [id, name, rarity, price, colors] of [
  ['warm-black', 'Black Hand Warmer', 'common', 150, [C.black]], ['warm-white', 'White Hand Warmer', 'common', 150, [C.white]],
  ['warm-team', 'Team Hand Warmer', 'rare', 350, ['primary']], ['warm-gold', 'Gold Hand Warmer', 'epic', 800, P.goldRush],
] as [string, string, Rarity, number, string[]][]) add('handwarmer', id, name, rarity, price, colors, 'Waist hand warmer for November nights.');

// ---------------------------------------------------------------- towels
for (const [id, name, rarity, price, colors] of [
  ['towel-white', 'White Towel', 'common', 100, [C.white]], ['towel-black', 'Black Towel', 'common', 120, [C.black]],
  ['towel-team', 'Team Towel', 'rare', 300, ['primary']], ['towel-school', 'School Mark Towel', 'rare', 450, ['primary', 'secondary']],
  ['towel-gold', 'Gold Towel', 'epic', 800, P.goldRush],
] as [string, string, Rarity, number, string[]][]) add('towel', id, name, rarity, price, colors, 'Hangs from the waistband. Pick front, side or back.');

// ---------------------------------------------------------------- cleats
for (const [id, name, rarity, price, colors, style, desc] of [
  ['cleats-classic-black', 'Classic Black', 'common', 0, [C.black, C.white], 'classic', 'Standard black cleats.'],
  ['cleats-classic-white', 'Classic White', 'common', 150, [C.white, C.black], 'classic', 'Standard white cleats.'],
  ['cleats-low-black', 'Low Top Black', 'common', 180, [C.black, C.black], 'low', 'Low-cut for quick feet.'],
  ['cleats-hightop-black', 'High Top Black', 'common', 200, [C.black, C.white], 'high', 'Ankle support for the big fellas.'],
  ['cleats-hightop-white', 'High Top White', 'common', 200, [C.white, C.black], 'high', 'Classic lineman high-tops.'],
  ['cleats-speed-white', 'Speed White', 'common', 250, [C.white, C.silver], 'speed', 'Featherweight speed cleat.'],
  ['cleats-mid-team', 'Mid Team', 'rare', 400, ['primary', C.white], 'mid', 'Mid-cut in school colors.'],
  ['cleats-speed-team', 'Speed Team', 'rare', 500, ['primary', 'secondary'], 'speed', 'Speed cleat, two-tone school colors.'],
  ['cleats-twotone', 'Two-Tone Mid', 'rare', 550, [C.black, 'secondary'], 'mid', 'Black upper, school accent.'],
  ['cleats-retro-silver', 'Retro Silver', 'rare', 600, [C.silver, C.black], 'retro', 'Old-school silver shoes.'],
  ['cleats-red', 'Modern Red', 'rare', 450, [C.red, C.white], 'modern', 'Bright red modern cleat.'],
  ['cleats-blue', 'Modern Blue', 'rare', 450, [C.blue, C.white], 'modern', 'Bright blue modern cleat.'],
  ['cleats-green', 'Modern Green', 'rare', 450, [C.green, C.white], 'modern', 'Bright green modern cleat.'],
  ['cleats-purple', 'Modern Purple', 'rare', 450, [C.purple, C.white], 'modern', 'Bright purple modern cleat.'],
  ['cleats-pink', 'Modern Pink', 'rare', 500, [C.pink, C.white], 'modern', 'Pink-out special.'],
  ['cleats-neon', 'Neon Speed', 'epic', 900, [C.neon, C.black], 'speed', 'Highlighter-yellow speed cleat.'],
  ['cleats-silver', 'Silver Bullet', 'epic', 1000, P.chrome, 'speed', 'Silver speed cleat.'],
  ['cleats-ice', 'ICE', 'epic', 1200, P.ice, 'modern', 'Frozen blue and white.'],
  ['cleats-midnight', 'MIDNIGHT', 'legendary', 2000, P.midnight, 'modern', 'Deep purple-black with a night-sky sheen.'],
  ['cleats-chrome', 'CHROME', 'legendary', 2400, P.chrome, 'speed', 'Full chrome. Blinding under the lights.'],
  ['cleats-goldrush', 'GOLD RUSH', 'legendary', 2600, P.goldRush, 'speed', 'Gold-plated speed cleats.'],
  ['cleats-fridaynight', 'FRIDAY NIGHT', 'legendary', 3200, P.fridayNight, 'modern', 'Stadium lights, scoreboard red, night sky.'],
] as [string, string, Rarity, number, string[], string, string][]) add('cleats', id, name, rarity, price, colors, desc, { style });
add('cleats', 'cleats-champgold', 'CHAMPIONSHIP GOLD', 'legendary', 0, [C.gold, C.white], 'Win the LCPS Bowl.', { style: 'speed', ...unlock({ kind: 'achievement', id: 'champions', text: 'Win the LCPS Bowl' }), collection: 'championship' });
add('cleats', 'cleats-perfect', 'PERFECT SEASON', 'legendary', 0, [C.white, C.gold], 'Finish a season undefeated.', { style: 'modern', ...unlock({ kind: 'achievement', id: 'perfect-season', text: 'Finish undefeated' }) });
add('cleats', 'cleats-dynasty', 'DYNASTY', 'legendary', 0, [C.black, C.gold], 'Third LCPS Bowl title.', { style: 'high', ...unlock({ kind: 'titles', count: 3, text: 'Win 3 LCPS Bowl championships' }), collection: 'championship' });

// ---------------------------------------------------------------- socks
for (const [id, name, rarity, price, colors] of [
  ['socks-white', 'White Socks', 'common', 0, [C.white]], ['socks-black', 'Black Socks', 'common', 100, [C.black]],
  ['socks-team', 'Team Socks', 'common', 150, ['primary']], ['socks-second', 'Secondary Socks', 'common', 150, ['secondary']],
  ['socks-striped', 'Striped Socks', 'rare', 350, [C.white, 'primary']], ['socks-pink', 'Pink Socks', 'rare', 400, [C.pink]],
  ['socks-gold', 'Gold Socks', 'epic', 750, P.goldRush],
] as [string, string, Rarity, number, string[]][]) add('socks', id, name, rarity, price, colors, 'Game socks.');

// ---------------------------------------------------------------- spats / tape
for (const [id, name, rarity, price, colors, level] of [
  ['tape-low', 'Low Tape', 'common', 0, [C.white], 1], ['tape-medium', 'Medium Tape', 'common', 150, [C.white], 2],
  ['tape-heavy', 'Heavy Tape', 'rare', 300, [C.white], 3], ['tape-black', 'Black Tape', 'common', 150, [C.black], 2],
  ['spats-white', 'Full Spat — White', 'rare', 400, [C.white], 4], ['spats-black', 'Full Spat — Black', 'rare', 400, [C.black], 4],
  ['spats-team', 'Team Spats', 'epic', 750, ['primary'], 4], ['spats-gold', 'Gold Spats', 'legendary', 1800, P.goldRush, 4],
] as [string, string, Rarity, number, string[], number][]) add('spats', id, name, rarity, price, colors, level >= 4 ? 'Full spat covering the cleat and ankle.' : 'Ankle tape job.', { style: String(level) });

// ---------------------------------------------------------------- undershirts / leg sleeves / accessories
for (const [id, name, rarity, price, colors, style] of [
  ['under-white', 'White Undershirt', 'common', 100, [C.white], 'short'], ['under-black', 'Black Undershirt', 'common', 100, [C.black], 'short'],
  ['under-team', 'Team Undershirt', 'rare', 300, ['primary'], 'short'], ['under-cold', 'Cold Gear Long Sleeve', 'rare', 450, [C.black], 'long'],
  ['under-cold-white', 'White Cold Gear', 'rare', 450, [C.white], 'long'],
] as [string, string, Rarity, number, string[], string][]) add('undershirt', id, name, rarity, price, colors, style === 'long' ? 'Long-sleeve compression for cold nights.' : 'Compression undershirt; shows at the collar.', { style });
for (const [id, name, rarity, price, colors] of [
  ['leg-white', 'White Leg Sleeves', 'common', 200, [C.white]], ['leg-black', 'Black Leg Sleeves', 'common', 200, [C.black]],
  ['leg-team', 'Team Leg Sleeves', 'rare', 400, ['primary']], ['leg-gold', 'Gold Leg Sleeves', 'epic', 1000, P.goldRush],
] as [string, string, Rarity, number, string[]][]) add('legsleeve', id, name, rarity, price, colors, 'Knee-to-ankle compression sleeves.');
add('accessory', 'acc-eyeblack', 'Eye Black', 'common', 100, [C.black], 'Two stripes under the eyes.', { style: 'eyeblack' });
add('accessory', 'acc-neckroll', 'Neck Roll', 'rare', 350, [C.white], 'Old-school collar roll for linebackers.', { style: 'neckroll' });
add('accessory', 'acc-backplate', 'Back Plate', 'rare', 400, [C.black], 'Lower-back protector peeking out under the jersey.', { style: 'backplate' });
add('accessory', 'acc-brace', 'Elbow Brace', 'common', 200, [C.black], 'Lineman elbow brace (goes on an arm).', { style: 'brace' });
add('accessory', 'acc-brace-white', 'Taped Elbows', 'common', 150, [C.white], 'Heavy elbow tape (goes on an arm).', { style: 'brace' });

// ---------------------------------------------------------------- school collections
for (const t of LCPS_TEAMS) {
  const coll = { collection: t.id };
  const pc = [t.colors.primary, t.colors.secondary];
  const M = t.mascot.toUpperCase();
  const beat = { kind: 'beat' as const, team: t.id, text: `Beat ${t.shortName} (or coach there) to unlock` };
  const mk = (cat: EquipmentCategory, suffix: string, name: string, rarity: Rarity, price: number, colors: string[], desc: string, style?: string) =>
    add(cat, `${t.id}-${suffix}`, `${M} ${name}`, rarity, price, colors, desc, { ...coll, style, unlock: beat });
  mk('gloves', 'gloves', 'Gloves', 'rare', 550, pc, `${t.shortName} two-tone gloves.`);
  mk('sleeve', 'sleeve', 'Sleeve', 'rare', 500, [t.colors.primary, t.colors.secondary, t.colors.primary], `${t.shortName} striped sleeve.`, 'full');
  mk('cleats', 'cleats', 'Cleats', 'epic', 950, pc, `${t.shortName} custom cleats.`, 'modern');
  mk('visor', 'visor', 'Visor', 'epic', 1100, [t.colors.primary, '#1b1b1f'], `${t.shortName}-tinted visor.`);
  mk('spats', 'spats', 'Spats', 'epic', 800, [t.colors.primary], `${t.shortName} full spats.`, '4');
  mk('wristband', 'wrist', 'Wristbands', 'rare', 300, [t.colors.secondary], `${t.shortName} wristbands.`);
}

export const CATALOG: EquipmentItem[] = items;
const BY_ID = new Map(items.map((i) => [i.id, i]));
export const itemById = (id?: string) => (id ? BY_ID.get(id) : undefined);
export const STARTER_ITEMS = items.filter((i) => i.price === 0 && !i.unlock).map((i) => i.id);
/** Shown in the shop (team-issued defaults are owned by everyone and never sold). */
export const inShop = (i: EquipmentItem) => !i.issued;

/**
 * Save migration for helmets from the earlier invented catalog. Only clear correspondences are mapped;
 * everything else is kept in locker.legacy (never offered as one of the eight exact products).
 */
export const LEGACY_ITEM_MAP: Record<string, string> = {
  'helm-flex': 'speedflex', // was "Flex Panel Shell — Speed-Flex era look"
  'helm-facet': 'f7', // was "Faceted Shell — F-series era look"
  'helm-minimal': 'vicis-zero2', // was "Smooth Zero Shell"
  'helm-aggressive': 'vicis-zero2-trench', // was "Trench Shell"
  'helm-threepeat': 'finish-threepeat',
  'helm-goat': 'finish-goat',
};
export const LEGACY_UNMAPPED = ['helm-classic', 'helm-retro', 'helm-oldschool', 'helm-speed'];
export const isPurchasable = (i: EquipmentItem) => !i.unlock || i.unlock.kind === 'beat';

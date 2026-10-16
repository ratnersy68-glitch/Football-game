/** Shop catalog (Peak Coins), gear stats and character appearance options. */
import type { GearStats } from '../physics/skier';

export type Slot = 'skis' | 'snowboard' | 'helmet' | 'goggles' | 'jacket' | 'pants' | 'gloves' | 'boots' | 'accessory';

export interface Item {
  id: string;
  slot: Slot;
  name: string;
  brand: string;
  type: string;
  price: number;
  color: string;
  accent?: string;
  /** Stat deltas (−0.2..+0.35) added to the 0.5 baseline. */
  stats: Partial<GearStats>;
  desc: string;
  unlockStage?: number;
}

export const BRANDS = ['Nordline', 'Ridgecraft', 'Apex Forge', 'Coldfront', 'Talus', 'Vertigo Labs', 'Polaris Works', 'Drift & Co'];

export const ITEMS: Item[] = [
  // ---- skis
  { id: 'ski-rental', slot: 'skis', name: 'Rental All-Mountain', brand: 'Nordline', type: 'All-mountain skis', price: 0, color: '#d94a3a', stats: {}, desc: 'Forgiving rental skis. They get you down the hill.' },
  { id: 'ski-allmtn', slot: 'skis', name: 'Traverse 88', brand: 'Ridgecraft', type: 'All-mountain skis', price: 900, color: '#2b6cd8', accent: '#ffffff', stats: { speed: 0.06, control: 0.1, carving: 0.08, stability: 0.06 }, desc: 'Balanced everyday ski that does everything well.' },
  { id: 'ski-park', slot: 'skis', name: 'Twinline Jib', brand: 'Drift & Co', type: 'Freestyle skis', price: 1400, color: '#f2c12e', accent: '#111111', stats: { jump: 0.22, control: 0.08, stability: 0.04, speed: -0.03 }, desc: 'Twin-tip park ski: faster spins, soft landings.' },
  { id: 'ski-race-gs', slot: 'skis', name: 'Gatekeeper GS', brand: 'Apex Forge', type: 'Racing skis', price: 2200, color: '#e8e8e8', accent: '#d8282a', stats: { speed: 0.18, carving: 0.22, stability: 0.12, jump: -0.08, powder: -0.1 }, desc: 'Stiff race ski: locks into carves at speed.', unlockStage: 1 },
  { id: 'ski-race-dh', slot: 'skis', name: 'Velocity DH', brand: 'Apex Forge', type: 'Racing skis', price: 3800, color: '#151515', accent: '#ffcc00', stats: { speed: 0.3, carving: 0.15, stability: 0.2, control: -0.06, jump: -0.1 }, desc: 'Long downhill boards built for 140 km/h.', unlockStage: 3 },
  { id: 'ski-powder', slot: 'skis', name: 'Cold Smoke 118', brand: 'Coldfront', type: 'Powder skis', price: 1900, color: '#4fb39a', accent: '#ffffff', stats: { powder: 0.35, stability: 0.06, carving: -0.06 }, desc: 'Fat and rockered: floats through bottomless days.' },
  { id: 'ski-freeride', slot: 'skis', name: 'Big Line 106', brand: 'Talus', type: 'Freeride skis', price: 2600, color: '#8a3fd1', accent: '#f2f2f2', stats: { powder: 0.2, stability: 0.2, speed: 0.1, jump: 0.08 }, desc: 'Charger for cliffs and steeps. Stomps big landings.', unlockStage: 2 },
  { id: 'ski-pro', slot: 'skis', name: 'Summit Pro Edition', brand: 'Vertigo Labs', type: 'All-mountain skis', price: 6500, color: '#c9a227', accent: '#101010', stats: { speed: 0.22, control: 0.2, carving: 0.22, stability: 0.2, jump: 0.15, powder: 0.15 }, desc: 'The best all-round ski money can buy.', unlockStage: 5 },
  // ---- snowboards
  { id: 'sb-rental', slot: 'snowboard', name: 'Rental Board', brand: 'Nordline', type: 'All-mountain snowboard', price: 0, color: '#3a3f4a', stats: {}, desc: 'A plain rental snowboard.' },
  { id: 'sb-park', slot: 'snowboard', name: 'Jibstick 152', brand: 'Drift & Co', type: 'Park snowboard', price: 1300, color: '#ff6a3d', accent: '#222', stats: { jump: 0.25, control: 0.1, speed: -0.04 }, desc: 'Soft-flex park board for rails and spins.' },
  { id: 'sb-race', slot: 'snowboard', name: 'Carve Blade 163', brand: 'Apex Forge', type: 'Racing snowboard', price: 2400, color: '#e6e6e6', accent: '#1f4fd0', stats: { speed: 0.2, carving: 0.25, stability: 0.12, jump: -0.08 }, desc: 'Hard-boot race board: edge hold for days.', unlockStage: 1 },
  { id: 'sb-powder', slot: 'snowboard', name: 'Swallowtail 158', brand: 'Coldfront', type: 'Powder snowboard', price: 1800, color: '#2f8f6a', accent: '#fff', stats: { powder: 0.35, stability: 0.08 }, desc: 'Surfy swallowtail that never sinks.' },
  // ---- helmets
  { id: 'helm-basic', slot: 'helmet', name: 'Shell Lite', brand: 'Nordline', type: 'Helmet', price: 0, color: '#2a2f38', stats: {}, desc: 'Basic certified helmet.' },
  { id: 'helm-white', slot: 'helmet', name: 'Whiteout MIPS', brand: 'Talus', type: 'Helmet', price: 350, color: '#f2f2f2', stats: { stability: 0.03 }, desc: 'Clean white shell with rotational protection.' },
  { id: 'helm-race', slot: 'helmet', name: 'Aero Race', brand: 'Apex Forge', type: 'Helmet', price: 900, color: '#d8282a', stats: { speed: 0.04, stability: 0.03 }, desc: 'Aerodynamic race helmet.' },
  { id: 'helm-gold', slot: 'helmet', name: 'Champion Gold', brand: 'Vertigo Labs', type: 'Helmet', price: 2500, color: '#c9a227', stats: { stability: 0.06, speed: 0.03 }, desc: 'For podium regulars.', unlockStage: 4 },
  // ---- goggles
  { id: 'gog-basic', slot: 'goggles', name: 'Clear Lens', brand: 'Nordline', type: 'Goggles', price: 0, color: '#9ab', accent: '#222', stats: {}, desc: 'Standard goggles.' },
  { id: 'gog-mirror', slot: 'goggles', name: 'Mirror Blue', brand: 'Polaris Works', type: 'Goggles', price: 300, color: '#3a7ff0', accent: '#fff', stats: { control: 0.03 }, desc: 'Mirrored lens for bluebird days.' },
  { id: 'gog-gold', slot: 'goggles', name: 'Sunrise Gold', brand: 'Polaris Works', type: 'Goggles', price: 450, color: '#f0a020', accent: '#111', stats: { control: 0.04 }, desc: 'High-contrast gold lens.' },
  { id: 'gog-rose', slot: 'goggles', name: 'Flat-Light Rose', brand: 'Coldfront', type: 'Goggles', price: 600, color: '#e85d8a', accent: '#111', stats: { control: 0.05, stability: 0.02 }, desc: 'See the terrain in fog and snow.' },
  // ---- jackets
  { id: 'jk-red', slot: 'jacket', name: 'Patrol Shell', brand: 'Nordline', type: 'Jacket', price: 0, color: '#c8322b', accent: '#ffffff', stats: {}, desc: 'Reliable red shell.' },
  { id: 'jk-navy', slot: 'jacket', name: 'Alpine Down', brand: 'Ridgecraft', type: 'Jacket', price: 400, color: '#1d2f55', accent: '#e8c547', stats: { stability: 0.02 }, desc: 'Warm down jacket.' },
  { id: 'jk-neon', slot: 'jacket', name: 'Neon Anorak', brand: 'Drift & Co', type: 'Jacket', price: 550, color: '#b6f23a', accent: '#1c1c1c', stats: { jump: 0.03 }, desc: 'Loud park anorak.' },
  { id: 'jk-race', slot: 'jacket', name: 'Speed Suit Top', brand: 'Apex Forge', type: 'Jacket', price: 1200, color: '#1a1a1a', accent: '#d8282a', stats: { speed: 0.05 }, desc: 'Low-drag race suit.', unlockStage: 2 },
  { id: 'jk-camo', slot: 'jacket', name: 'Backcountry Pro', brand: 'Talus', type: 'Jacket', price: 900, color: '#6b7a4a', accent: '#f2f2f2', stats: { powder: 0.04, stability: 0.03 }, desc: 'Tough freeride shell.' },
  // ---- pants
  { id: 'pt-black', slot: 'pants', name: 'Basic Bib', brand: 'Nordline', type: 'Pants', price: 0, color: '#23262d', stats: {}, desc: 'Black bib pants.' },
  { id: 'pt-grey', slot: 'pants', name: 'Storm Pant', brand: 'Ridgecraft', type: 'Pants', price: 300, color: '#6c727c', stats: { stability: 0.02 }, desc: 'Grey waterproof pants.' },
  { id: 'pt-baggy', slot: 'pants', name: 'Baggy Cargo', brand: 'Drift & Co', type: 'Pants', price: 380, color: '#d7c49e', stats: { jump: 0.03 }, desc: 'Loose park pants.' },
  { id: 'pt-race', slot: 'pants', name: 'Speed Suit Legs', brand: 'Apex Forge', type: 'Pants', price: 900, color: '#d8282a', stats: { speed: 0.04 }, desc: 'Race suit bottoms.', unlockStage: 2 },
  // ---- gloves
  { id: 'gl-black', slot: 'gloves', name: 'Work Gloves', brand: 'Nordline', type: 'Gloves', price: 0, color: '#1f1f1f', stats: {}, desc: 'Plain gloves.' },
  { id: 'gl-leather', slot: 'gloves', name: 'Leather Mitts', brand: 'Talus', type: 'Gloves', price: 200, color: '#8a5a2b', stats: { control: 0.02 }, desc: 'Classic leather.' },
  { id: 'gl-orange', slot: 'gloves', name: 'Pipe Gloves', brand: 'Drift & Co', type: 'Gloves', price: 220, color: '#ff7a1a', stats: { jump: 0.02 }, desc: 'Grab-friendly gloves.' },
  // ---- boots
  { id: 'bt-basic', slot: 'boots', name: 'Comfort 80', brand: 'Nordline', type: 'Boots', price: 0, color: '#3b3f46', stats: {}, desc: 'Soft rental boots.' },
  { id: 'bt-110', slot: 'boots', name: 'Precision 110', brand: 'Ridgecraft', type: 'Boots', price: 700, color: '#e8e8e8', stats: { control: 0.06, carving: 0.05 }, desc: 'Stiff, precise boots.' },
  { id: 'bt-race', slot: 'boots', name: 'Plug 140', brand: 'Apex Forge', type: 'Boots', price: 1600, color: '#d8282a', stats: { carving: 0.1, speed: 0.04, control: 0.05 }, desc: 'Race plug: instant edge response.', unlockStage: 2 },
  { id: 'bt-park', slot: 'boots', name: 'Freestyle 100', brand: 'Drift & Co', type: 'Boots', price: 650, color: '#1d8ad6', stats: { jump: 0.06, stability: 0.04 }, desc: 'Shock-absorbing park boots.' },
  // ---- accessories
  { id: 'acc-none', slot: 'accessory', name: 'No Backpack', brand: '—', type: 'Accessory', price: 0, color: '#000000', stats: {}, desc: 'Travel light.' },
  { id: 'acc-pack', slot: 'accessory', name: 'Avalanche Pack', brand: 'Talus', type: 'Backpack', price: 500, color: '#e0582b', stats: { powder: 0.04, stability: 0.02 }, desc: 'Airbag pack for the backcountry.' },
  { id: 'acc-hydro', slot: 'accessory', name: 'Hydration Pack', brand: 'Coldfront', type: 'Backpack', price: 250, color: '#2d6a8a', stats: { stability: 0.02 }, desc: 'Slim pack with water.' },
  { id: 'acc-poles', slot: 'accessory', name: 'Carbon Poles', brand: 'Apex Forge', type: 'Poles', price: 400, color: '#111111', stats: { speed: 0.02, control: 0.02 }, desc: 'Featherweight carbon poles.' },
];

export const ITEM_BY_ID = new Map(ITEMS.map((i) => [i.id, i]));

export interface Appearance {
  skin: string;
  hair: string;
  hairStyle: 'short' | 'long' | 'ponytail' | 'buzz';
  face: 'clean' | 'beard' | 'stubble' | 'freckles';
  build: number;
  height: number;
  jacketColor?: string;
  pantsColor?: string;
  helmetColor?: string;
}

export const SKIN_TONES = ['#f6d7c3', '#ecc1a0', '#d9a07a', '#b97a52', '#8d5a3b', '#5e3b26'];
export const HAIR_COLORS = ['#1b1410', '#4a2e1c', '#8a5a2b', '#c9a24a', '#e6d39a', '#b84a24', '#9a9a9a'];

export const DEFAULT_APPEARANCE: Appearance = { skin: '#ecc1a0', hair: '#4a2e1c', hairStyle: 'short', face: 'clean', build: 0.5, height: 1 };

export const DEFAULT_EQUIPPED: Record<Slot, string> = {
  skis: 'ski-rental', snowboard: 'sb-rental', helmet: 'helm-basic', goggles: 'gog-basic', jacket: 'jk-red',
  pants: 'pt-black', gloves: 'gl-black', boots: 'bt-basic', accessory: 'acc-none',
};

export const SLOT_LABEL: Record<Slot, string> = {
  skis: 'Skis', snowboard: 'Snowboards', helmet: 'Helmets', goggles: 'Goggles', jacket: 'Jackets', pants: 'Pants', gloves: 'Gloves', boots: 'Boots', accessory: 'Accessories',
};

/** Combine equipped items into the physics gear stats (0..1). */
export function gearStats(equipped: Record<Slot, string>, board: 'ski' | 'snowboard'): GearStats {
  const s: GearStats = { speed: 0.5, control: 0.5, carving: 0.5, stability: 0.5, jump: 0.5, powder: 0.5 };
  for (const [slot, id] of Object.entries(equipped) as [Slot, string][]) {
    if (slot === 'skis' && board === 'snowboard') continue;
    if (slot === 'snowboard' && board === 'ski') continue;
    const it = ITEM_BY_ID.get(id);
    if (!it) continue;
    for (const [k, v] of Object.entries(it.stats) as [keyof GearStats, number][]) s[k] += v;
  }
  for (const k of Object.keys(s) as (keyof GearStats)[]) s[k] = Math.max(0.1, Math.min(1, s[k]));
  return s;
}

/** Visual loadout derived from equipped items. */
export interface Look {
  appearance: Appearance;
  ski: string; skiAccent: string; board: string; boardAccent: string; helmet: string; lens: string; frame: string;
  jacket: string; jacketAccent: string; pants: string; gloves: string; boots: string; pack: string | null; poles: string;
  bib?: number;
}

export function lookFor(app: Appearance, eq: Record<Slot, string>): Look {
  const g = (s: Slot) => ITEM_BY_ID.get(eq[s]) ?? ITEM_BY_ID.get(DEFAULT_EQUIPPED[s])!;
  const acc = g('accessory');
  return {
    appearance: app,
    ski: g('skis').color, skiAccent: g('skis').accent ?? '#ffffff',
    board: g('snowboard').color, boardAccent: g('snowboard').accent ?? '#ffffff',
    helmet: app.helmetColor ?? g('helmet').color,
    lens: g('goggles').color, frame: g('goggles').accent ?? '#222',
    jacket: app.jacketColor ?? g('jacket').color, jacketAccent: g('jacket').accent ?? '#ffffff',
    pants: app.pantsColor ?? g('pants').color, gloves: g('gloves').color, boots: g('boots').color,
    pack: acc.type === 'Backpack' ? acc.color : null,
    poles: acc.type === 'Poles' ? acc.color : '#9aa3ad',
  };
}

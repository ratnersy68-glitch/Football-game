import type { Difficulty, Discipline, LiftType } from '../world/types';

export interface LiftSpec {
  type: LiftType;
  name: string;
  /** Bottom/top as [x fraction of half-width, t height fraction (0 = base, 1 = summit)]. */
  from: [number, number];
  to: [number, number];
}

export interface ResortDef {
  id: string;
  index: number;
  name: string;
  tagline: string;
  description: string;
  seed: string;
  width: number;
  length: number;
  vertical: number;
  baseAlt: number;
  profilePow: number;
  rugged: number;
  peaks: { x: number; h: number; w: number }[];
  treeline: number;
  treeDensity: number;
  glacier: boolean;
  lakes: number;
  village: boolean;
  trails: Partial<Record<Difficulty, number>>;
  lifts: LiftSpec[];
  parks: ('beginner' | 'slopestyle' | 'bigair' | 'rails' | 'superpipe' | 'halfpipe' | 'standard')[];
  races: Discipline[];
  theme: { sky: string; fog: string; snowTint: string; rock: string; foliage: string };
  unlock: { stage: number; medals: number };
  themeWords: string[];
}

export const RESORTS: ResortDef[] = [
  {
    id: 'pine-valley', index: 0, name: 'Pine Valley', tagline: 'Where every legend learns to turn',
    description: 'A friendly forested valley with wide groomers, a learning area at the base and a small terrain park.',
    seed: 'pine-valley-01', width: 1900, length: 2100, vertical: 420, baseAlt: 980, profilePow: 1.35, rugged: 0.6,
    peaks: [{ x: 0.15, h: 1, w: 0.5 }], treeline: 2, treeDensity: 0.62, glacier: false, lakes: 1, village: false,
    trails: { bunny: 2, green: 6, blue: 5, black: 2 },
    lifts: [
      { type: 'surface', name: 'Cubby Carpet', from: [0.42, 0.0], to: [0.46, 0.09] },
      { type: 'chair', name: 'Pinecone Double', from: [-0.12, 0.0], to: [-0.32, 0.6] },
      { type: 'chair', name: 'Valley Quad', from: [0.12, 0.0], to: [0.12, 0.97] },
    ],
    parks: ['beginner'], races: ['giant-slalom'],
    theme: { sky: '#8ec5ff', fog: '#cfe3f5', snowTint: '#ffffff', rock: '#6b6660', foliage: '#2f5a3a' },
    unlock: { stage: 0, medals: 0 }, themeWords: ['Pine', 'Cub', 'Hemlock', 'Fawn', 'Maple', 'Robin', 'Chipmunk', 'Cedar', 'Birch', 'Owl', 'Juniper', 'Spruce'],
  },
  {
    id: 'frost-peak', index: 1, name: 'Frost Peak', tagline: 'Big rolling cruisers under a frosty crown',
    description: 'An intermediate mountain of long rolling blues, two terrain parks and a pair of racecourses.',
    seed: 'frost-peak-02', width: 2500, length: 2700, vertical: 680, baseAlt: 1250, profilePow: 1.45, rugged: 0.8,
    peaks: [{ x: -0.2, h: 1, w: 0.4 }, { x: 0.35, h: 0.85, w: 0.35 }], treeline: 0.82, treeDensity: 0.55, glacier: false, lakes: 1, village: false,
    trails: { bunny: 1, green: 6, blue: 9, black: 5, double: 1 },
    lifts: [
      { type: 'surface', name: 'Snowflake T-Bar', from: [0.5, 0.0], to: [0.52, 0.12] },
      { type: 'chair', name: 'Frostbite Quad', from: [-0.15, 0.0], to: [-0.2, 0.96] },
      { type: 'chair', name: 'Rime Express', from: [0.18, 0.0], to: [0.32, 0.85] },
      { type: 'chair', name: 'Icicle Triple', from: [-0.5, 0.0], to: [-0.55, 0.62] },
      { type: 'chair', name: 'Hoarfrost Chair', from: [0.4, 0.0], to: [0.6, 0.5] },
    ],
    parks: ['standard', 'halfpipe'], races: ['slalom', 'giant-slalom'],
    theme: { sky: '#9cc9f2', fog: '#d6e6f4', snowTint: '#f7fbff', rock: '#666a70', foliage: '#2d5238' },
    unlock: { stage: 1, medals: 2 }, themeWords: ['Frost', 'Rime', 'Glint', 'Crystal', 'Sleet', 'Winter', 'Polar', 'Comet', 'Aurora', 'Flurry', 'Sparrow', 'Lynx'],
  },
  {
    id: 'glacier-ridge', index: 2, name: 'Glacier Ridge', tagline: 'High-alpine bowls above the clouds',
    description: 'A high-altitude resort with a living glacier, wide open bowls, a gondola and advanced speed courses.',
    seed: 'glacier-ridge-03', width: 3000, length: 3300, vertical: 1150, baseAlt: 1900, profilePow: 1.65, rugged: 1.1,
    peaks: [{ x: 0.0, h: 1, w: 0.45 }, { x: -0.55, h: 0.82, w: 0.3 }, { x: 0.55, h: 0.88, w: 0.3 }], treeline: 0.45, treeDensity: 0.45, glacier: true, lakes: 1, village: false,
    trails: { bunny: 1, green: 5, blue: 9, black: 8, double: 4, triple: 1 },
    lifts: [
      { type: 'surface', name: 'Moraine Platter', from: [0.48, 0.0], to: [0.5, 0.1] },
      { type: 'gondola', name: 'Glacier Gondola', from: [0.0, 0.0], to: [0.02, 0.97] },
      { type: 'chair', name: 'Serac Six', from: [-0.3, 0.0], to: [-0.5, 0.8] },
      { type: 'chair', name: 'Crevasse Quad', from: [0.3, 0.0], to: [0.5, 0.86] },
      { type: 'chair', name: 'Cirque Chair', from: [-0.62, 0.0], to: [-0.7, 0.55] },
      { type: 'chair', name: 'Icefall Triple', from: [0.62, 0.0], to: [0.72, 0.6] },
    ],
    parks: ['slopestyle', 'bigair'], races: ['downhill', 'super-g'],
    theme: { sky: '#6fb2f5', fog: '#d9e9f7', snowTint: '#f3f9ff', rock: '#5e626b', foliage: '#2a4a36' },
    unlock: { stage: 2, medals: 5 }, themeWords: ['Glacier', 'Serac', 'Moraine', 'Cirque', 'Ibex', 'Edelweiss', 'Crevasse', 'Arete', 'Bergschrund', 'Ptarmigan', 'Nunatak', 'Firn'],
  },
  {
    id: 'blackstone', index: 3, name: 'Blackstone Mountain', tagline: 'Steep, rocky and unforgiving',
    description: 'An expert mountain of steep chutes, rocky cliffs and relentless mogul fields.',
    seed: 'blackstone-04', width: 2600, length: 2700, vertical: 1000, baseAlt: 1500, profilePow: 1.95, rugged: 1.5,
    peaks: [{ x: -0.1, h: 1, w: 0.35 }, { x: 0.45, h: 0.9, w: 0.3 }], treeline: 0.7, treeDensity: 0.5, glacier: false, lakes: 0, village: false,
    trails: { green: 3, blue: 5, black: 8, double: 7, triple: 2 },
    lifts: [
      { type: 'chair', name: 'Basalt Quad', from: [0.0, 0.0], to: [-0.08, 0.97] },
      { type: 'chair', name: 'Obsidian Triple', from: [-0.4, 0.0], to: [-0.48, 0.8] },
      { type: 'chair', name: 'Flint Double', from: [0.35, 0.0], to: [0.45, 0.9] },
      { type: 'chair', name: 'Slate Chair', from: [0.62, 0.0], to: [0.65, 0.45] },
      { type: 'surface', name: 'Granite Poma', from: [-0.62, 0.0], to: [-0.64, 0.3] },
    ],
    parks: [], races: ['slalom'],
    theme: { sky: '#8bb4dc', fog: '#c9d6e2', snowTint: '#f2f5f8', rock: '#3d3b3c', foliage: '#26402f' },
    unlock: { stage: 3, medals: 10 }, themeWords: ['Basalt', 'Raven', 'Gauntlet', 'Anvil', 'Widowmaker', 'Flint', 'Slate', 'Crag', 'Talon', 'Scree', 'Iron', 'Obsidian'],
  },
  {
    id: 'powder-paradise', index: 4, name: 'Powder Paradise', tagline: 'Bottomless bowls and silent glades',
    description: 'A freeride haven of massive powder bowls, deep tree skiing and natural jumps.',
    seed: 'powder-paradise-05', width: 2700, length: 2800, vertical: 900, baseAlt: 1600, profilePow: 1.6, rugged: 1.0,
    peaks: [{ x: -0.3, h: 1, w: 0.5 }, { x: 0.4, h: 0.95, w: 0.45 }], treeline: 0.78, treeDensity: 0.72, glacier: false, lakes: 2, village: false,
    trails: { green: 3, blue: 6, black: 6, double: 4, triple: 1 },
    lifts: [
      { type: 'chair', name: 'Bottomless Quad', from: [-0.2, 0.0], to: [-0.3, 0.96] },
      { type: 'chair', name: 'Faceshot Express', from: [0.25, 0.0], to: [0.4, 0.92] },
      { type: 'chair', name: 'Glade Triple', from: [0.55, 0.0], to: [0.62, 0.6] },
      { type: 'chair', name: 'Pillow Chair', from: [-0.55, 0.0], to: [-0.62, 0.55] },
    ],
    parks: [], races: [],
    theme: { sky: '#a6cdf0', fog: '#e2ecf5', snowTint: '#ffffff', rock: '#605d5a', foliage: '#284d35' },
    unlock: { stage: 3, medals: 14 }, themeWords: ['Pillow', 'Faceshot', 'Bottomless', 'Cold Smoke', 'Whiteroom', 'Stash', 'Fir', 'Snorkel', 'Champagne', 'Feather', 'Huckleberry', 'Elk'],
  },
  {
    id: 'summit-x', index: 5, name: 'Summit X', tagline: 'Built for flight',
    description: 'A freestyle mecca: four terrain parks, a superpipe, big-air jumps, slopestyle and a rail plaza.',
    seed: 'summit-x-06', width: 2300, length: 2400, vertical: 720, baseAlt: 1400, profilePow: 1.5, rugged: 0.8,
    peaks: [{ x: 0.0, h: 1, w: 0.5 }], treeline: 0.85, treeDensity: 0.5, glacier: false, lakes: 0, village: false,
    trails: { bunny: 1, green: 3, blue: 6, black: 5, double: 3 },
    lifts: [
      { type: 'chair', name: 'Launchpad Express', from: [-0.05, 0.0], to: [-0.1, 0.96] },
      { type: 'chair', name: 'Rail Garden Quad', from: [0.3, 0.0], to: [0.35, 0.55] },
      { type: 'chair', name: 'Pipe Dream Chair', from: [-0.4, 0.0], to: [-0.45, 0.6] },
      { type: 'surface', name: 'Jib Tow', from: [0.55, 0.0], to: [0.58, 0.14] },
    ],
    parks: ['slopestyle', 'bigair', 'rails', 'superpipe'], races: ['ski-cross', 'freestyle'],
    theme: { sky: '#7ab8f7', fog: '#d3e4f5', snowTint: '#fbfdff', rock: '#64646a', foliage: '#2c5039' },
    unlock: { stage: 2, medals: 7 }, themeWords: ['Launch', 'Boost', 'Stomp', 'Butter', 'Cork', 'Method', 'Shifty', 'Huck', 'Bonk', 'Nollie', 'Spin', 'Steeze'],
  },
  {
    id: 'avalanche', index: 6, name: 'Avalanche Mountain', tagline: 'Only the bold come home',
    description: 'Extreme terrain: triple-black couloirs, massive cliffs, knife-edge ridgelines and expert-only racecourses.',
    seed: 'avalanche-07', width: 2900, length: 3000, vertical: 1450, baseAlt: 1700, profilePow: 1.8, rugged: 1.5,
    peaks: [{ x: 0.0, h: 1, w: 0.3 }, { x: -0.45, h: 0.92, w: 0.28 }, { x: 0.5, h: 0.95, w: 0.28 }], treeline: 0.55, treeDensity: 0.45, glacier: false, lakes: 1, village: false,
    trails: { green: 3, blue: 5, black: 8, double: 8, triple: 6 },
    lifts: [
      { type: 'chair', name: 'Thunder Quad', from: [0.0, 0.0], to: [0.0, 0.98] },
      { type: 'chair', name: 'Cornice Triple', from: [-0.35, 0.0], to: [-0.45, 0.92] },
      { type: 'chair', name: 'Couloir Chair', from: [0.35, 0.0], to: [0.5, 0.94] },
      { type: 'chair', name: 'Slide Path Double', from: [-0.65, 0.0], to: [-0.7, 0.42] },
      { type: 'chair', name: 'Debris Field Chair', from: [0.66, 0.0], to: [0.72, 0.4] },
      { type: 'gondola', name: 'Avalanche Tram', from: [0.18, 0.0], to: [0.24, 0.99] },
    ],
    parks: [], races: ['downhill', 'super-g'],
    theme: { sky: '#7aa6d1', fog: '#c5d3e0', snowTint: '#eef3f8', rock: '#454245', foliage: '#253f2e' },
    unlock: { stage: 5, medals: 30 }, themeWords: ['Avalanche', 'Cornice', 'Couloir', 'Slide Path', 'Thunder', 'Hangfire', 'Fracture', 'Debris', 'Whiteout', 'Precipice', 'Reaper', 'Vertigo'],
  },
  {
    id: 'alpine-world', index: 7, name: 'Alpine World', tagline: 'Three peaks. One legendary resort.',
    description: 'The largest resort: connected peaks, a mountain village, a gondola network, four terrain parks and five racecourses.',
    seed: 'alpine-world-08', width: 4200, length: 4000, vertical: 1400, baseAlt: 1350, profilePow: 1.7, rugged: 1.2,
    peaks: [{ x: -0.55, h: 0.9, w: 0.3 }, { x: 0.0, h: 1, w: 0.32 }, { x: 0.55, h: 0.93, w: 0.3 }], treeline: 0.62, treeDensity: 0.55, glacier: true, lakes: 2, village: true,
    trails: { bunny: 2, green: 9, blue: 12, black: 10, double: 7, triple: 5 },
    lifts: [
      { type: 'gondola', name: 'Village Gondola', from: [0.0, 0.0], to: [0.0, 0.55] },
      { type: 'gondola', name: 'Peak-to-Peak Gondola', from: [0.05, 0.55], to: [0.02, 0.98] },
      { type: 'chair', name: 'West Peak Express', from: [-0.3, 0.0], to: [-0.55, 0.92] },
      { type: 'chair', name: 'East Peak Express', from: [0.3, 0.0], to: [0.55, 0.94] },
      { type: 'chair', name: 'Alpenrose Quad', from: [-0.62, 0.0], to: [-0.75, 0.6] },
      { type: 'chair', name: 'Edelweiss Six', from: [0.62, 0.0], to: [0.75, 0.62] },
      { type: 'chair', name: 'Midway Triple', from: [-0.18, 0.0], to: [-0.25, 0.45] },
      { type: 'chair', name: 'Sunny Side Chair', from: [0.18, 0.0], to: [0.28, 0.4] },
      { type: 'surface', name: 'Village Carpet', from: [0.42, 0.0], to: [0.43, 0.06] },
      { type: 'surface', name: 'Kinder T-Bar', from: [-0.42, 0.0], to: [-0.43, 0.1] },
    ],
    parks: ['beginner', 'slopestyle', 'rails', 'superpipe'], races: ['downhill', 'super-g', 'giant-slalom', 'slalom', 'ski-cross'],
    theme: { sky: '#86bdf2', fog: '#d7e6f3', snowTint: '#fbfcff', rock: '#5c5a5e', foliage: '#2b4c37' },
    unlock: { stage: 4, medals: 20 }, themeWords: ['Alpen', 'Matterhorn', 'Chamois', 'Gentian', 'Kaiser', 'Lammergeier', 'Panorama', 'Grand', 'Tyrol', 'Zirbe', 'Sonnen', 'Gipfel'],
  },
];

export const TOTAL_TRAILS = RESORTS.reduce(
  (n, r) => n + Object.values(r.trails).reduce((a, b) => a + (b ?? 0), 0), 0);

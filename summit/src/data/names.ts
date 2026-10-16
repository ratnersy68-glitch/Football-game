import type { Difficulty, Discipline } from '../world/types';
import { Rng } from '../core/rng';

const SUFFIX: Record<Difficulty, string[]> = {
  bunny: ['Learning Area', 'Discovery Slope', 'First Tracks', 'Wonderland', 'Snow School Hill'],
  green: ['Way', 'Lane', 'Meadow', 'Path', 'Glide', 'Ramble', 'Traverse', 'Trail', 'Loop', 'Promenade', 'Boulevard', 'Wander'],
  blue: ['Run', 'Ridge', 'Cruiser', 'Bend', 'Corkscrew', 'Flyer', 'Express', 'Rollers', 'Sweep', 'Carousel', 'Twister', 'Highway'],
  black: ['Plunge', 'Face', 'Drop', 'Steeps', 'Bumps', 'Gully', 'Headwall', 'Pitch', 'Bowl', 'Ridge', 'Glades', 'Shoulder'],
  double: ['Couloir', 'Chute', 'Gauntlet', 'Spine', 'Notch', 'Wall', 'Fang', 'Slot', 'Funnel', 'Cleaver'],
  triple: ['Abyss', 'Free Fall', 'Cliffs', 'Corridor', 'No Return', 'Precipice', 'Exit', 'Death Slot', 'Vertigo Wall', 'Last Rites'],
};

const LANDMARKS: Record<Difficulty, string[]> = {
  bunny: ['Magic carpet & snow school', 'Gentle learning pitch'],
  green: ['Snow-covered cabin', 'Wide groomed boulevard', 'Frozen creek bridge', 'Scenic overlook', 'Snowmaking pond'],
  blue: ['Rolling terrain', 'Natural side hits', 'Long carving pitch', 'Valley vista', 'Tree-lined bends'],
  black: ['Mogul field', 'Steep headwall', 'Icy rollover', 'Tight glades', 'Rock garden'],
  double: ['Narrow rock chute', 'Hanging snowfield', 'Mandatory air', 'Deep powder stash', 'Boulder choke'],
  triple: ['Cliff band', 'Knife-edge entrance', 'Exposed couloir', 'Massive drop-in', 'Rock corridor'],
};

export function trailName(rng: Rng, words: string[], d: Difficulty, used: Set<string>): string {
  for (let tries = 0; tries < 60; tries++) {
    const w = rng.pick(words), suf = rng.pick(SUFFIX[d]);
    if (w.split(' ').some((p) => suf.includes(p))) continue;
    const name = `${w} ${suf}`;
    if (!used.has(name)) { used.add(name); return name; }
  }
  const n = `${rng.pick(words)} ${rng.pick(SUFFIX[d])} ${used.size}`;
  used.add(n);
  return n;
}

export function landmarkFor(rng: Rng, d: Difficulty): string {
  return rng.pick(LANDMARKS[d]);
}

export const DISCIPLINE_INFO: Record<Discipline, { label: string; short: string; desc: string }> = {
  downhill: { label: 'Downhill', short: 'DH', desc: 'Long, high-speed course with wide gates. Fastest total time wins.' },
  slalom: { label: 'Slalom', short: 'SL', desc: 'Short and technical: tight, frequent gates demand precision.' },
  'giant-slalom': { label: 'Giant Slalom', short: 'GS', desc: 'Medium length, wider turns — balance speed and control.' },
  'super-g': { label: 'Super-G', short: 'SG', desc: 'Fast technical racing through high-speed gates on steep slopes.' },
  'ski-cross': { label: 'Ski Cross', short: 'SX', desc: 'Four racers at once over jumps, rollers and banked turns.' },
  freestyle: { label: 'Freestyle Race', short: 'FR', desc: 'Race through the park — your trick points cut your time.' },
};

export const AI_RACERS: { name: string; country: string; skill: number }[] = [
  { name: 'Lars Eikvang', country: 'NOR', skill: 0.98 },
  { name: 'Mila Ferraro', country: 'ITA', skill: 0.95 },
  { name: 'Jonas Brändli', country: 'SUI', skill: 0.97 },
  { name: 'Aiko Tanabe', country: 'JPN', skill: 0.9 },
  { name: 'Tess Delacroix', country: 'FRA', skill: 0.93 },
  { name: 'Kai Lindqvist', country: 'SWE', skill: 0.88 },
  { name: 'Rory McCallan', country: 'CAN', skill: 0.91 },
  { name: 'Sasha Volkova', country: 'KAZ', skill: 0.86 },
  { name: 'Felix Ortner', country: 'AUT', skill: 0.99 },
  { name: 'Ingrid Haugen', country: 'NOR', skill: 0.92 },
  { name: 'Mateo Rivas', country: 'ARG', skill: 0.84 },
  { name: 'Jada Whitlock', country: 'USA', skill: 0.89 },
  { name: 'Emil Kowalczyk', country: 'POL', skill: 0.85 },
  { name: 'Noa Peretz', country: 'ISR', skill: 0.82 },
  { name: 'Hugo Lemaire', country: 'BEL', skill: 0.83 },
  { name: 'Freya Lund', country: 'DEN', skill: 0.87 },
];

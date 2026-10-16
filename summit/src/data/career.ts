/** Career stages, events, tournaments, sponsors and achievements. */
import { RESORTS } from './resorts';
import type { Difficulty, Discipline } from '../world/types';

export const STAGES = [
  { name: 'Rookie', xp: 0, medals: 0 },
  { name: 'Amateur', xp: 1200, medals: 1 },
  { name: 'Advanced', xp: 4000, medals: 4 },
  { name: 'Expert', xp: 9000, medals: 8 },
  { name: 'Pro', xp: 18000, medals: 14 },
  { name: 'Elite', xp: 32000, medals: 22 },
  { name: 'World Champion', xp: 52000, medals: 32 },
  { name: 'Mountain Legend', xp: 80000, medals: 45 },
] as const;

export type Medal = 'gold' | 'silver' | 'bronze';
export const MEDAL_COLOR: Record<Medal, string> = { gold: '#e8b923', silver: '#c0c6cf', bronze: '#c07a3c' };

export type FreestyleMode = 'score' | 'best' | 'combo' | 'grind' | 'pipe' | 'slopestyle';
export type ChallengeType = 'trailTime' | 'topSpeed' | 'trails' | 'lifts' | 'air' | 'trickScore';

export interface CareerEvent {
  id: string;
  resortId: string;
  title: string;
  desc: string;
  kind: 'race' | 'freestyle' | 'challenge';
  race?: { course: number; level: number; discipline: Discipline };
  freestyle?: { park: number; mode: FreestyleMode; time: number; targets: [number, number, number] };
  challenge?: { type: ChallengeType; difficulty?: Difficulty; nth?: number; targets: [number, number, number] };
  minStage: number;
  reward: { coins: [number, number, number]; xp: [number, number, number] };
}

const DISC_NAME: Record<Discipline, string> = {
  downhill: 'Downhill', slalom: 'Slalom', 'giant-slalom': 'Giant Slalom', 'super-g': 'Super-G', 'ski-cross': 'Ski Cross', freestyle: 'Freestyle Race',
};

export const FREESTYLE_INFO: Record<FreestyleMode, { label: string; desc: string }> = {
  score: { label: 'Park Session', desc: 'Total trick score in the time limit.' },
  best: { label: 'Big Air', desc: 'Your single best trick counts.' },
  combo: { label: 'Best Combo', desc: 'Your best banked combo counts — link tricks without crashing.' },
  grind: { label: 'Rail Jam', desc: 'Score only from rails, boxes and tubes.' },
  pipe: { label: 'Halfpipe', desc: 'Total score from airs in the pipe.' },
  slopestyle: { label: 'Slopestyle', desc: 'One run through the course: best total score.' },
};

function scale(base: number, k: number): [number, number, number] {
  return [Math.round(base * k * 0.45), Math.round(base * k * 0.75), Math.round(base * k)];
}

/** Career events for every resort, deterministic from the catalogue. */
export function careerEvents(): CareerEvent[] {
  const out: CareerEvent[] = [];
  for (const r of RESORTS) {
    const k = 1 + r.index * 0.6;
    const lvlBase = [1, 2, 3, 4, 3, 3, 5, 4][r.index];
    r.races.forEach((d, i) => {
      out.push({
        id: `${r.id}:race:${i}`, resortId: r.id, kind: 'race', title: `${r.name} ${DISC_NAME[d]}`,
        desc: `Beat the field on the ${DISC_NAME[d]} course. Podium for a medal.`,
        race: { course: i, level: Math.min(5, lvlBase + (d === 'downhill' || d === 'super-g' ? 0 : 0)), discipline: d },
        minStage: r.unlock.stage, reward: { coins: scale(600, k), xp: scale(900, k) },
      });
    });
    r.parks.forEach((style, i) => {
      const mode: FreestyleMode = style === 'superpipe' || style === 'halfpipe' ? 'pipe' : style === 'rails' ? 'grind' : style === 'bigair' ? 'best' : style === 'slopestyle' ? 'slopestyle' : 'score';
      const base = mode === 'best' ? 3200 : mode === 'grind' ? 5200 : mode === 'pipe' ? 9000 : mode === 'slopestyle' ? 9000 : 6000;
      out.push({
        id: `${r.id}:park:${i}`, resortId: r.id, kind: 'freestyle', title: `${FREESTYLE_INFO[mode].label}: ${r.name}`,
        desc: FREESTYLE_INFO[mode].desc, freestyle: { park: i, mode, time: mode === 'slopestyle' ? 150 : 120, targets: scale(base, 0.8 + r.index * 0.15) },
        minStage: r.unlock.stage, reward: { coins: scale(500, k), xp: scale(800, k) },
      });
      if (mode === 'score' || mode === 'slopestyle') {
        out.push({
          id: `${r.id}:combo:${i}`, resortId: r.id, kind: 'freestyle', title: `Best Combo: ${r.name}`,
          desc: FREESTYLE_INFO.combo.desc, freestyle: { park: i, mode: 'combo', time: 120, targets: scale(6000, 0.8 + r.index * 0.15) },
          minStage: r.unlock.stage, reward: { coins: scale(450, k), xp: scale(700, k) },
        });
      }
    });
    // mountain challenges
    const diffs = (Object.keys(r.trails) as Difficulty[]).filter((d) => (r.trails[d] ?? 0) > 0 && d !== 'bunny');
    const hardest = diffs[diffs.length - 1];
    out.push({
      id: `${r.id}:time:${hardest}`, resortId: r.id, kind: 'challenge', title: `Time Trial: hardest run`,
      desc: `Ski the resort's first ${hardest === 'triple' ? 'triple-black' : hardest === 'double' ? 'double-black' : hardest} trail top to bottom against the clock.`,
      challenge: { type: 'trailTime', difficulty: hardest, nth: 0, targets: [0, 0, 0] }, minStage: r.unlock.stage, reward: { coins: scale(500, k), xp: scale(700, k) },
    });
    out.push({
      id: `${r.id}:time:blue`, resortId: r.id, kind: 'challenge', title: `Time Trial: cruiser`,
      desc: 'Ski the first blue trail top to bottom against the clock.',
      challenge: { type: 'trailTime', difficulty: diffs.includes('blue') ? 'blue' : diffs[0], nth: 0, targets: [0, 0, 0] }, minStage: r.unlock.stage, reward: { coins: scale(350, k), xp: scale(500, k) },
    });
    out.push({
      id: `${r.id}:speed`, resortId: r.id, kind: 'challenge', title: 'Speed Trap',
      desc: 'Hit the target top speed anywhere on the mountain.', challenge: { type: 'topSpeed', targets: [70 + r.index * 6, 90 + r.index * 7, 105 + r.index * 8] },
      minStage: r.unlock.stage, reward: { coins: scale(300, k), xp: scale(450, k) },
    });
    out.push({
      id: `${r.id}:explore`, resortId: r.id, kind: 'challenge', title: 'Mountain Explorer',
      desc: 'Ski different trails top to bottom (each counts once).', challenge: { type: 'trails', targets: [3, 6, Math.min(12, Object.values(r.trails).reduce((a, b) => a + (b ?? 0), 0))] },
      minStage: r.unlock.stage, reward: { coins: scale(400, k), xp: scale(600, k) },
    });
    out.push({
      id: `${r.id}:lifts`, resortId: r.id, kind: 'challenge', title: 'Lift Pass',
      desc: 'Ride the resort’s lifts to the top.', challenge: { type: 'lifts', targets: [1, Math.ceil(r.lifts.length / 2), r.lifts.length] },
      minStage: r.unlock.stage, reward: { coins: scale(250, k), xp: scale(350, k) },
    });
    out.push({
      id: `${r.id}:air`, resortId: r.id, kind: 'challenge', title: 'Hang Time',
      desc: 'Stay airborne this long in a single jump (natural features count).', challenge: { type: 'air', targets: [1.5, 2.3, 3.2 + r.index * 0.2] },
      minStage: r.unlock.stage, reward: { coins: scale(300, k), xp: scale(450, k) },
    });
  }
  return out;
}

export interface Tournament {
  id: string; name: string; desc: string; level: number; minStage: number;
  races: { resortId: string; course: number }[];
  prize: number;
}

export const TOURNAMENTS: Tournament[] = [
  { id: 'local-cup', name: 'Local Cup', desc: 'Two giant-slalom runs at Pine Valley.', level: 1, minStage: 0, prize: 1500, races: [{ resortId: 'pine-valley', course: 0 }, { resortId: 'pine-valley', course: 0 }] },
  { id: 'mountain-champ', name: 'Mountain Championship', desc: 'Technical events at Frost Peak and Pine Valley.', level: 2, minStage: 1, prize: 3500, races: [{ resortId: 'frost-peak', course: 0 }, { resortId: 'frost-peak', course: 1 }, { resortId: 'pine-valley', course: 0 }] },
  { id: 'alpine-tour', name: 'Alpine Tour', desc: 'Speed and tech across three resorts.', level: 3, minStage: 2, prize: 7000, races: [{ resortId: 'glacier-ridge', course: 0 }, { resortId: 'glacier-ridge', course: 1 }, { resortId: 'frost-peak', course: 1 }, { resortId: 'alpine-world', course: 2 }] },
  { id: 'national', name: 'National Championship', desc: 'Every alpine discipline at Alpine World plus Blackstone slalom.', level: 4, minStage: 4, prize: 12000, races: [{ resortId: 'alpine-world', course: 0 }, { resortId: 'alpine-world', course: 1 }, { resortId: 'alpine-world', course: 2 }, { resortId: 'alpine-world', course: 3 }, { resortId: 'blackstone', course: 0 }] },
  { id: 'world-champ', name: 'World Ski Championship', desc: 'The world’s best across five events.', level: 5, minStage: 5, prize: 25000, races: [{ resortId: 'alpine-world', course: 0 }, { resortId: 'glacier-ridge', course: 0 }, { resortId: 'avalanche', course: 1 }, { resortId: 'alpine-world', course: 3 }, { resortId: 'alpine-world', course: 4 }] },
  { id: 'extreme-cup', name: 'Extreme Mountain Cup', desc: 'Expert-only racing on the steepest courses.', level: 5, minStage: 6, prize: 30000, races: [{ resortId: 'avalanche', course: 0 }, { resortId: 'avalanche', course: 1 }, { resortId: 'blackstone', course: 0 }, { resortId: 'summit-x', course: 0 }] },
];

export const POINTS = [100, 80, 60, 50, 45, 40, 36, 32, 29, 26];

export interface Sponsor { id: string; name: string; pitch: string; req: string; bonus: { race: number; trick: number; all: number }; gift?: string }

export const SPONSORS: Sponsor[] = [
  { id: 'nordline', name: 'Nordline', pitch: 'Gear for every skier.', req: 'Reach Amateur', bonus: { race: 0, trick: 0, all: 0.1 }, gift: 'bt-110' },
  { id: 'drift', name: 'Drift & Co', pitch: 'Built in the park.', req: 'Land a 3,000+ point trick', bonus: { race: 0, trick: 0.2, all: 0 }, gift: 'ski-park' },
  { id: 'apex', name: 'Apex Forge', pitch: 'Engineered for the clock.', req: 'Win 3 race gold medals', bonus: { race: 0.2, trick: 0, all: 0 }, gift: 'ski-race-gs' },
  { id: 'coldfront', name: 'Coldfront', pitch: 'Deep days only.', req: 'Reach Expert', bonus: { race: 0, trick: 0, all: 0.1 }, gift: 'ski-powder' },
  { id: 'vertigo', name: 'Vertigo Labs', pitch: 'For legends.', req: 'Reach Elite', bonus: { race: 0.1, trick: 0.1, all: 0.1 }, gift: 'ski-pro' },
];

export interface Achievement { id: string; name: string; desc: string; icon: string }
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-run', name: 'First Tracks', desc: 'Ski a trail top to bottom.', icon: '⛷' },
  { id: 'speed-100', name: 'Ton Up', desc: 'Reach 100 km/h.', icon: '💨' },
  { id: 'speed-130', name: 'Speed Demon', desc: 'Reach 130 km/h.', icon: '🚀' },
  { id: 'first-360', name: 'Full Circle', desc: 'Land a 360.', icon: '🔄' },
  { id: 'first-1080', name: 'Ten-Eighty', desc: 'Land a 1080 or bigger.', icon: '🌀' },
  { id: 'backflip', name: 'Head Over Heels', desc: 'Land a backflip.', icon: '🤸' },
  { id: 'cork', name: 'Off Axis', desc: 'Land any cork.', icon: '🍾' },
  { id: 'triple-cork', name: 'Triple Threat', desc: 'Land a triple cork.', icon: '👑' },
  { id: 'grind', name: 'Rail Rat', desc: 'Grind a rail for 2 seconds.', icon: '🛤' },
  { id: 'combo-10k', name: 'Combo King', desc: 'Bank a 10,000 point combo.', icon: '🔥' },
  { id: 'gold', name: 'Podium Top', desc: 'Win a race.', icon: '🥇' },
  { id: 'triple-black', name: 'Death Wish', desc: 'Ski a triple-black trail top to bottom.', icon: '◆' },
  { id: 'all-lifts', name: 'Lift Collector', desc: 'Ride every lift at a resort.', icon: '🚡' },
  { id: 'tourney', name: 'Champion', desc: 'Win a tournament.', icon: '🏆' },
  { id: 'big-air', name: 'Sky Walker', desc: 'Stay airborne for 4 seconds.', icon: '☁' },
  { id: 'legend', name: 'Mountain Legend', desc: 'Reach the final career stage.', icon: '🏔' },
];

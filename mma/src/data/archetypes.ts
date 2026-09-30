import type { ArchetypeDef, ArchetypeId, Tendencies } from './types';

const T = (p: Partial<Tendencies>): Tendencies => ({
  pressure: 0.5, volume: 0.5, kicks: 0.3, legKicks: 0.4, bodyWork: 0.2, takedowns: 0.15,
  clinch: 0.2, counter: 0.35, submissionHunt: 0.2, groundPound: 0.5, movement: 0.5,
  feints: 0.3, spinning: 0.05, switchStance: 0.05, ...p,
});

export const ARCHETYPES: Record<ArchetypeId, ArchetypeDef> = {
  pressureBoxer: {
    id: 'pressureBoxer', name: 'Pressure Boxer',
    description: 'Walks opponents down, cuts off the cage and lands in combination.',
    tendencies: T({ pressure: 0.9, volume: 0.8, kicks: 0.12, legKicks: 0.5, bodyWork: 0.35, counter: 0.2, movement: 0.3, takedowns: 0.05 }),
    combos: ['1-2', '1-2-3', 'jab-bodycross', '3-2', 'bodyhook-hook', '1-2-3-2', 'double-jab-cross', 'hook-uppercut'],
    subs: ['rnc'],
  },
  kickboxer: {
    id: 'kickboxer', name: 'Kickboxer',
    description: 'Long-range striker who mixes punches with kicks at every level.',
    tendencies: T({ pressure: 0.45, volume: 0.65, kicks: 0.45, legKicks: 0.45, bodyWork: 0.3, counter: 0.4, movement: 0.7, takedowns: 0.03, spinning: 0.15, switchStance: 0.25, feints: 0.45 }),
    combos: ['1-2', 'jab-legkick', '1-2-legkick', 'hook-headkick', 'jab-bodykick', 'cross-hook-cross', 'teep', 'double-jab-cross'],
    subs: ['guillotine'],
  },
  muayThai: {
    id: 'muayThai', name: 'Muay Thai',
    description: 'Heavy kicks, knees and elbows. Dangerous in the clinch, punishes legs.',
    tendencies: T({ pressure: 0.6, volume: 0.55, kicks: 0.55, legKicks: 0.55, bodyWork: 0.4, clinch: 0.45, counter: 0.35, movement: 0.4, takedowns: 0.04, feints: 0.35 }),
    combos: ['1-2-legkick', 'jab-bodykick', 'cross-calf', 'hook-headkick', 'teep', 'jab-legkick', '1-2'],
    subs: ['guillotine'],
  },
  counterStriker: {
    id: 'counterStriker', name: 'Counter Striker',
    description: 'Comfortable giving ground, reads entries and punishes mistakes.',
    tendencies: T({ pressure: 0.2, volume: 0.4, kicks: 0.35, legKicks: 0.5, bodyWork: 0.2, counter: 0.9, movement: 0.85, takedowns: 0.03, feints: 0.6, switchStance: 0.2 }),
    combos: ['1-2', 'cross-hook-cross', 'jab-legkick', 'hook-headkick', 'double-jab-cross', 'uppercut-hook', 'calf'],
    subs: ['guillotine'],
  },
  powerPuncher: {
    id: 'powerPuncher', name: 'Power Puncher',
    description: 'Economical output, loads up on fight-ending shots and waits for openings.',
    tendencies: T({ pressure: 0.55, volume: 0.3, kicks: 0.2, legKicks: 0.7, bodyWork: 0.15, counter: 0.55, movement: 0.35, takedowns: 0.04, feints: 0.3 }),
    combos: ['overhand', '2', 'hook', '1-2', 'cross-hook-cross', 'uppercut-hook', 'calf'],
    subs: ['guillotine'],
  },
  wrestler: {
    id: 'wrestler', name: 'Wrestler',
    description: 'Strikes to set up takedowns, then controls from top position.',
    tendencies: T({ pressure: 0.7, volume: 0.45, kicks: 0.15, bodyWork: 0.2, takedowns: 0.75, clinch: 0.5, counter: 0.15, groundPound: 0.6, submissionHunt: 0.25, movement: 0.35 }),
    combos: ['1-2', 'jab', 'overhand', '1-2-3', 'jab-bodycross'],
    subs: ['armTriangle', 'rnc', 'guillotine'],
  },
  chainWrestler: {
    id: 'chainWrestler', name: 'Chain Wrestler',
    description: 'Relentless takedown chains, cage wrestling and suffocating control.',
    tendencies: T({ pressure: 0.85, volume: 0.5, kicks: 0.12, bodyWork: 0.15, takedowns: 0.9, clinch: 0.65, counter: 0.1, groundPound: 0.5, submissionHunt: 0.3, movement: 0.3 }),
    combos: ['1-2', 'jab', 'double-jab-cross', 'overhand'],
    subs: ['rnc', 'armTriangle'],
  },
  sambo: {
    id: 'sambo', name: 'Sambo',
    description: 'Clinch trips, body locks and top pressure that ends in a submission.',
    tendencies: T({ pressure: 0.65, volume: 0.5, kicks: 0.3, legKicks: 0.45, bodyWork: 0.3, takedowns: 0.7, clinch: 0.7, counter: 0.35, groundPound: 0.45, submissionHunt: 0.6, movement: 0.45 }),
    combos: ['1-2', 'jab-bodykick', '1-2-3', 'jab-legkick', 'cross-hook-cross'],
    subs: ['armTriangle', 'kimura', 'rnc', 'armbar'],
  },
  bjj: {
    id: 'bjj', name: 'BJJ Specialist',
    description: 'Wants the fight on the mat — even off the back — and hunts the tap.',
    tendencies: T({ pressure: 0.5, volume: 0.45, kicks: 0.3, takedowns: 0.45, clinch: 0.45, counter: 0.3, groundPound: 0.3, submissionHunt: 0.9, movement: 0.45 }),
    combos: ['1-2', 'jab-legkick', 'teep', 'jab'],
    subs: ['rnc', 'triangle', 'armbar', 'guillotine', 'kimura'],
  },
  submissionHunter: {
    id: 'submissionHunter', name: 'Submission Hunter',
    description: 'Dangerous everywhere; scrambles into chokes the moment you make a mistake.',
    tendencies: T({ pressure: 0.65, volume: 0.6, kicks: 0.4, legKicks: 0.35, bodyWork: 0.3, takedowns: 0.4, clinch: 0.45, counter: 0.3, groundPound: 0.35, submissionHunt: 0.95, movement: 0.45 }),
    combos: ['1-2', 'jab-bodykick', 'teep', '1-2-3', 'hook-headkick'],
    subs: ['rnc', 'guillotine', 'triangle', 'armbar'],
  },
  groundAndPound: {
    id: 'groundAndPound', name: 'Ground-and-Pound Wrestler',
    description: 'Takes you down and punishes you with heavy shots from the top.',
    tendencies: T({ pressure: 0.75, volume: 0.45, kicks: 0.15, takedowns: 0.7, clinch: 0.5, counter: 0.15, groundPound: 0.95, submissionHunt: 0.15, movement: 0.3 }),
    combos: ['1-2', 'overhand', 'jab', '1-2-3'],
    subs: ['armTriangle', 'rnc'],
  },
  balanced: {
    id: 'balanced', name: 'Balanced MMA Fighter',
    description: 'Complete skill set. Chooses where the fight happens.',
    tendencies: T({ pressure: 0.55, volume: 0.55, kicks: 0.35, bodyWork: 0.3, takedowns: 0.35, clinch: 0.35, counter: 0.45, groundPound: 0.55, submissionHunt: 0.4, movement: 0.55, feints: 0.45 }),
    combos: ['1-2', '1-2-3', 'jab-legkick', 'jab-bodykick', 'cross-hook-cross', 'hook-headkick', '1-2-legkick'],
    subs: ['rnc', 'armTriangle', 'guillotine', 'kimura'],
  },
};

export const ARCHETYPE_LIST = Object.values(ARCHETYPES);

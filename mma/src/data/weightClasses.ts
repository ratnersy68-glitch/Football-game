import type { WeightClassDef, WeightClassId } from './types';

export const WEIGHT_CLASSES: WeightClassDef[] = [
  { id: 'HW', name: 'Heavyweight', short: 'HW', limitLbs: 265, gender: 'M', order: 0 },
  { id: 'LHW', name: 'Light Heavyweight', short: 'LHW', limitLbs: 205, gender: 'M', order: 1 },
  { id: 'MW', name: 'Middleweight', short: 'MW', limitLbs: 185, gender: 'M', order: 2 },
  { id: 'WW', name: 'Welterweight', short: 'WW', limitLbs: 170, gender: 'M', order: 3 },
  { id: 'LW', name: 'Lightweight', short: 'LW', limitLbs: 155, gender: 'M', order: 4 },
  { id: 'FW', name: 'Featherweight', short: 'FW', limitLbs: 145, gender: 'M', order: 5 },
  { id: 'BW', name: 'Bantamweight', short: 'BW', limitLbs: 135, gender: 'M', order: 6 },
  { id: 'FLW', name: 'Flyweight', short: 'FLW', limitLbs: 125, gender: 'M', order: 7 },
  { id: 'WBW', name: "Women's Bantamweight", short: 'WBW', limitLbs: 135, gender: 'F', order: 8 },
  { id: 'WFLW', name: "Women's Flyweight", short: 'WFLW', limitLbs: 125, gender: 'F', order: 9 },
  { id: 'WSW', name: "Women's Strawweight", short: 'WSW', limitLbs: 115, gender: 'F', order: 10 },
];

export const WEIGHT_CLASS_BY_ID: Record<WeightClassId, WeightClassDef> = Object.fromEntries(
  WEIGHT_CLASSES.map((w) => [w.id, w]),
) as Record<WeightClassId, WeightClassDef>;

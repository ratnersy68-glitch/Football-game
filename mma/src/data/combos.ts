/** Named combinations. Used by the AI repertoire and by commentary to recognise player combos. */
export interface ComboDef {
  id: string;
  name: string;
  seq: string[];
}

export const COMBOS: ComboDef[] = [
  { id: 'jab', name: 'Jab', seq: ['jab'] },
  { id: '2', name: 'Cross', seq: ['cross'] },
  { id: 'hook', name: 'Left hook', seq: ['leadHook'] },
  { id: 'overhand', name: 'Overhand', seq: ['overhand'] },
  { id: 'calf', name: 'Calf kick', seq: ['calfKick'] },
  { id: 'teep', name: 'Front kick', seq: ['frontKick'] },
  { id: '1-2', name: 'One-two', seq: ['jab', 'cross'] },
  { id: 'double-jab-cross', name: 'Double jab, cross', seq: ['jab', 'jab', 'cross'] },
  { id: '1-2-3', name: 'One-two-hook', seq: ['jab', 'cross', 'leadHook'] },
  { id: '1-2-3-2', name: 'One-two-three-two', seq: ['jab', 'cross', 'leadHook', 'cross'] },
  { id: '3-2', name: 'Hook, cross', seq: ['leadHook', 'cross'] },
  { id: 'jab-legkick', name: 'Jab, leg kick', seq: ['jab', 'rearLegKick'] },
  { id: '1-2-legkick', name: 'One-two, leg kick', seq: ['jab', 'cross', 'leadHook', 'rearLegKick'] },
  { id: 'cross-hook-cross', name: 'Cross, hook, cross', seq: ['cross', 'leadHook', 'cross'] },
  { id: 'jab-bodycross', name: 'Jab, body cross', seq: ['jab', 'bodyCross'] },
  { id: 'hook-headkick', name: 'Hook, head kick', seq: ['leadHook', 'rearHeadKick'] },
  { id: 'jab-bodykick', name: 'Jab, body kick', seq: ['jab', 'rearBodyKick'] },
  { id: 'cross-calf', name: 'Cross, calf kick', seq: ['cross', 'calfKick'] },
  { id: 'bodyhook-hook', name: 'Body hook to head hook', seq: ['leadBodyHook', 'leadHook'] },
  { id: 'hook-uppercut', name: 'Hook, uppercut', seq: ['leadHook', 'rearUppercut'] },
  { id: 'uppercut-hook', name: 'Uppercut, hook', seq: ['rearUppercut', 'leadHook'] },
  { id: 'spin', name: 'Spinning backfist', seq: ['spinningBackfist'] },
  { id: 'sbk', name: 'Spinning back kick', seq: ['spinningBackKick'] },
  { id: 'headkick', name: 'Head kick', seq: ['rearHeadKick'] },
  { id: 'lead-headkick', name: 'Lead head kick', seq: ['leadHeadKick'] },
  { id: 'jab-overhand', name: 'Jab, overhand', seq: ['jab', 'overhand'] },
  { id: 'bodyjab-overhand', name: 'Body jab, overhand', seq: ['bodyJab', 'overhand'] },
  { id: 'liver-hook', name: 'Liver shot, hook', seq: ['leadBodyHook', 'leadHook', 'cross'] },
  { id: 'knee', name: 'Step knee', seq: ['stepKnee'] },
  { id: 'flyingknee', name: 'Flying knee', seq: ['flyingKnee'] },
];

export const COMBO_BY_ID: Record<string, ComboDef> = Object.fromEntries(COMBOS.map((c) => [c.id, c]));

/** Recognises a named combo (length >= 2) at the end of a strike sequence. */
export function recogniseCombo(seq: string[]): ComboDef | undefined {
  let best: ComboDef | undefined;
  for (const c of COMBOS) {
    if (c.seq.length < 2 || c.seq.length > seq.length) continue;
    const tail = seq.slice(seq.length - c.seq.length);
    if (tail.every((s, i) => s === c.seq[i]) && (!best || c.seq.length > best.seq.length)) best = c;
  }
  return best;
}

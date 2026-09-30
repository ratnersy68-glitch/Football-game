import type { FightEngine } from '../engine/FightEngine';
import { leadLegKey } from '../engine/FighterState';
import { JudgeSystem } from '../engine/JudgeSystem';
import type { Side } from '../engine/types';

/** Between-round corner advice for the player, built from the round's stats and both fighters' condition. */
export function cornerAdvice(e: FightEngine, me: Side): { verdict: string; tips: string[] } {
  const op: Side = me === 0 ? 1 : 0;
  const r = e.stats.rounds[e.round - 1];
  const est = JudgeSystem.estimateRound(r) * (me === 0 ? 1 : -1);
  const verdict = est > 8 ? 'You won that round clearly.' : est > 1 ? 'We probably took that round.' : est > -1 ? 'That round was razor close.' : est > -8 ? 'We probably dropped that round.' : 'You lost that round badly — something has to change.';
  const tips: string[] = [];
  const M = e.f[me];
  const O = e.f[op];
  const mine = r[me];
  const theirs = r[op];
  if (M[leadLegKey(M)] > 40) tips.push('Your lead leg is hurt — check the kicks (hold Low Block) or switch stance.');
  if (O[leadLegKey(O)] > 35) tips.push(`${O.last}'s lead leg is compromised. Keep chopping it.`);
  if (O.body > 40) tips.push('The body work is paying off — keep going downstairs.');
  if (theirs.tdLanded >= 1) tips.push(`Sprawl! Hold Low Block the moment ${O.last} changes levels, and stay off the fence.`);
  if (M.tank < 70 || M.stamina < 35) tips.push("You're gassing. Pick your shots, don't chase, breathe.");
  if (theirs.sigLanded > mine.sigLanded * 1.5 + 5) tips.push("You're eating too many clean shots — hands up, move your head, work angles.");
  if (theirs.damageDealt > mine.damageDealt * 1.3 && M.data.attributes.takedowns > 70) tips.push('Change levels — mix in the takedown.');
  if (mine.tdAttempted >= 2 && mine.tdLanded === 0) tips.push('The shots aren’t landing from range. Set them up with strikes or use the clinch.');
  if (O.cut > 30) tips.push(`${O.last} is cut — target the head.`);
  if (O.stamina < 35) tips.push(`${O.last} is tired. Push the pace.`);
  if (e.round === e.cfg.rounds - 1 && est < 0) tips.push('Last round coming — you may need a finish.');
  if (!tips.length) tips.push('Stay composed and keep doing what works.');
  return { verdict, tips: tips.slice(0, 3) };
}

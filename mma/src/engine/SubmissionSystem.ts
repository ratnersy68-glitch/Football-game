import { clamp } from '../core/math';
import { SUB_POSITION_BONUS, SUBMISSIONS, SUBS_FROM, type GroundPosition } from '../data';
import type { FightEngine } from './FightEngine';
import { fatigueFactor, isRocked, staminaFrac } from './FighterState';
import type { FighterState, Side, SubKey, SubmissionState } from './types';

const KEYS: SubKey[] = ['up', 'down', 'left', 'right'];

/**
 * Interactive submission scramble. Both fighters get a direction prompt; hitting it pushes the
 * tightness meter your way (strength scales with skill and stamina), wrong inputs lock you out
 * briefly. The meter also drifts on skill difference and loosens as the hold drags on.
 * 100 = tap / choked out. 0 = escape.
 */
export class SubmissionSystem {
  constructor(private e: FightEngine) {}

  available(f: FighterState): string[] {
    const e = this.e;
    if (e.mode === 'ground' && e.ground) {
      const role = e.ground.top === f.side ? 'top' : 'bottom';
      return SUBS_FROM[role][e.ground.pos] ?? [];
    }
    if (e.mode === 'clinch') return ['guillotine'];
    if (e.mode === 'stand' && f.subScramble > e.time) return ['guillotine'];
    return [];
  }

  attempt(f: FighterState, index: number): boolean {
    const e = this.e;
    const list = this.available(f);
    if (!list.length) return false;
    if (f.down || (f.action && f.action.kind !== 'defense' && f.action.kind !== 'recover')) return false;
    const subId = list[Math.min(index, list.length - 1)];
    const def = SUBMISSIONS[subId];
    const o = e.f[f.side === 0 ? 1 : 0];
    const A = f.data.attributes;
    const D = o.data.attributes;
    let key = 'stand:clinch';
    if (e.mode === 'ground' && e.ground) key = `${e.ground.top === f.side ? 'top' : 'bottom'}:${e.ground.pos}`;
    else if (e.mode === 'stand') key = 'stand:sprawl';
    let start = def.baseStart + (A.submissions - D.submissionDefense) * 0.3 + (SUB_POSITION_BONUS[key] ?? 0);
    start += (1 - staminaFrac(o)) * 14 + (isRocked(o) ? 12 : 0) + Math.min(12, (o.daze / 100) * 20);
    if (o.guard !== 'none') start -= 12;
    if (e.cfg.fighters[f.side].signatureTechniques.includes(subId)) start += 6;
    start = clamp(start, 8, 65);
    e.stamina.spend(f, def.stamina);
    const resume = e.mode === 'ground' && e.ground ? { ...e.ground } : null;
    e.sub = {
      attacker: f.side, subId, progress: start, t: 0,
      prompts: [e.rng.pick(KEYS), e.rng.pick(KEYS)], promptT: [0, 0], lockout: [0, 0],
      from: e.mode === 'ground' ? 'ground' : 'stand', resume,
    };
    if (e.mode === 'clinch') e.clinch = null;
    e.mode = 'sub';
    e.ground = null;
    for (const x of e.f) {
      x.action = null;
      x.buffered = null;
      x.subScramble = 0;
    }
    if (!resume) {
      // standing guillotine: pulled to the mat with the attacker underneath
      e.sub.resume = { top: o.side, pos: 'fullGuard', t: 0, lastAction: e.roundTime };
    }
    e.stats.addSubAttempt(f.side);
    e.emit({ type: 'subAttempt', side: f.side, subId });
    return true;
  }

  /** Called with the pressed direction (if any) of each fighter this tick. */
  update(dt: number, keys: [SubKey | undefined, SubKey | undefined]) {
    const e = this.e;
    const s = e.sub;
    if (!s) return;
    const def = SUBMISSIONS[s.subId];
    const att = e.f[s.attacker];
    const dfn = e.f[s.attacker === 0 ? 1 : 0];
    const A = att.data.attributes;
    const D = dfn.data.attributes;
    s.t += dt;
    const before = s.progress;
    // passive drift: skill vs skill, loosening over time
    const drift = (A.submissions * def.power * fatigueFactor(att) - D.submissionDefense * fatigueFactor(dfn)) * 0.045 - 1.8 - Math.max(0, s.t - 8) * 1.3;
    s.progress += drift * dt;
    for (const side of [0, 1] as Side[]) {
      s.lockout[side] = Math.max(0, s.lockout[side] - dt);
      s.promptT[side] += dt;
      const k = keys[side];
      if (!k || s.lockout[side] > 0) continue;
      const isAtt = side === s.attacker;
      const f = e.f[side];
      if (k === s.prompts[side]) {
        const push = isAtt ? (1.5 + A.submissions * 0.07) * def.power * fatigueFactor(f) : (3 + D.submissionDefense * 0.065) * fatigueFactor(f);
        s.progress += isAtt ? push : -push;
        s.prompts[side] = e.rng.pick(KEYS.filter((x) => x !== s.prompts[side]));
        s.promptT[side] = 0;
      } else {
        s.lockout[side] = 0.35;
        s.progress += isAtt ? -1 : 1;
      }
    }
    e.stamina.spend(att, 2.6 * dt);
    e.stamina.spend(dfn, 3.4 * dt);
    if (before < 75 && s.progress >= 75) e.emit({ type: 'subTight', side: s.attacker, subId: s.subId });
    if (s.progress >= 100) {
      const choke = def.kind === 'choke';
      const out = choke && e.rng.chance(0.15);
      e.finish(s.attacker, 'SUB', def.name + (out ? ' (Technical)' : ''));
      return;
    }
    if (s.progress <= 0) this.escape();
  }

  private escape() {
    const e = this.e;
    const s = e.sub!;
    const att = s.attacker;
    const dfnSide = (att === 0 ? 1 : 0) as Side;
    e.sub = null;
    e.stats.noteSubEscape(dfnSide);
    e.emit({ type: 'subEscape', side: dfnSide, subId: s.subId });
    const r = s.resume;
    if (!r) {
      e.grappling.standUp('disengage', dfnSide);
      return;
    }
    // Where do we end up? Failed attacks usually cost position.
    let top: Side = r.top;
    let pos: GroundPosition = r.pos;
    const attTop = r.top === att;
    if (s.subId === 'armbar' && attTop) {
      top = dfnSide;
      pos = 'fullGuard';
    } else if (s.subId === 'rnc') {
      top = dfnSide;
      pos = 'fullGuard';
    } else if (!attTop && (s.subId === 'triangle' || s.subId === 'armbar')) {
      pos = 'halfGuard';
    } else if (!attTop && (s.subId === 'kimura' || s.subId === 'guillotine')) {
      pos = s.from === 'stand' ? 'fullGuard' : 'sideControl';
    } else if (attTop && pos === 'mount') pos = 'halfGuard';
    else if (attTop && pos === 'sideControl') pos = 'halfGuard';
    e.mode = 'ground';
    e.ground = { top, pos, t: 0, lastAction: e.roundTime };
    for (const f of e.f) f.action = { kind: 'recover', t: 0, dur: 0.4, label: 'scramble' };
    e.movement.update(0, [e.lastCmds[0], e.lastCmds[1]]);
  }

  /** Round ended during a submission: nothing is locked in. */
  cancel() {
    const e = this.e;
    e.sub = null;
  }
}

export type { SubmissionState };

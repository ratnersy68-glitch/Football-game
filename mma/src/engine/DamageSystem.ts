import { clamp } from '../core/math';
import type { StrikeDef } from '../data';
import type { FightEngine } from './FightEngine';
import { isDown, isRocked, koThreshold, leadLegKey, powerMult } from './FighterState';
import { TUNING } from './tuning';
import type { FighterState } from './types';

export interface HitInfo {
  dmg: number;
  counter: '' | 'timed' | 'whiff';
  flush: boolean;
  blocked: boolean;
  /** Multiplier for "walked into it" (slipping into a hook, ducking into a knee). */
  punish: number;
}

/**
 * Location damage. Head damage feeds the short-term *daze* meter which decides rocks, knockdowns and
 * KOs; accumulated head damage raises the daze floor and lowers the KO threshold. Body damage eats
 * stamina and the gas tank. Leg damage slows movement, weakens kicks and can end the fight.
 */
export class DamageSystem {
  constructor(private e: FightEngine) {}

  threshold(f: FighterState) {
    return koThreshold(f, TUNING);
  }

  applyHit(a: FighterState, d: FighterState, s: StrikeDef, h: HitInfo) {
    const e = this.e;
    const dm = d.data.attributes;
    const dmg = h.dmg;
    d.hitFlash = 1;
    d.hitTarget = s.target;
    d.lastHitT = e.time;
    d.hitDir = Math.sign(d.pos.x - a.pos.x) || 1;

    // The referee watches a hurt fighter who isn't answering back.
    const hurt = isRocked(d) || isDown(d) || (e.mode === 'ground' && e.ground?.top === a.side && d.daze > this.threshold(d) * 0.3);
    if (hurt) d.unanswered += dmg * (d.guard !== 'none' ? 0.45 : 1) * (isDown(d) ? 1.35 : 1) * (e.mode === 'ground' ? 1.15 : 1);
    a.unanswered *= 0.55;

    if (s.target === 'head') {
      d.head += dmg;
      d.swelling += dmg * 0.045;
      const chinF = 1.36 - dm.chin * 0.0062;
      const powerDaze = Math.pow(powerMult(a) / 1.05, 1.1);
      let daze = 0.62 * dmg * s.daze * chinF * powerDaze * (1 + d.head / 220);
      if (h.counter === 'timed') daze *= 1.45;
      else if (h.counter === 'whiff') daze *= 1.25;
      if (h.flush) daze *= 1.35;
      if (h.blocked) daze *= s.arc === 'headKick' ? 0.4 : 0.25;
      daze *= h.punish;
      if (e.mode === 'ground') daze *= 0.45;
      d.daze += daze;
      // Cuts
      if (!h.blocked && e.rng.chance(s.cutRisk * (dmg / 6) * 0.45)) {
        const add = e.rng.range(6, 16) * (s.kind === 'elbow' ? 1.4 : 1);
        d.cut = Math.min(100, d.cut + add);
        e.emit({ type: 'cut', side: d.side, severity: d.cut });
      } else if (d.cut > 0 && !h.blocked) d.cut = Math.min(100, d.cut + dmg * 0.18);
      if (!h.blocked) this.checkHead(a, d, s, daze);
      if (d.cut > 85 && !h.blocked && e.rng.chance(0.005) && !e.result) {
        e.finish(a.side, 'TKO', 'Doctor Stoppage (Cut)');
      }
    } else if (s.target === 'body') {
      d.body += dmg;
      e.stamina.spend(d, dmg * (h.blocked ? 0.25 : 0.7));
      d.tank = Math.max(35, d.tank - dmg * (h.blocked ? 0.03 : 0.14));
      if (!h.blocked && dmg > 5.5 && d.body > 38 && e.mode !== 'ground') {
        const liver = this.isLiverShot(a, d, s);
        const p = 0.22 * ((d.body - 34) / 150) * (dmg / 8) * (liver ? 1.6 : 1) * (1.2 - dm.chin * 0.004);
        if (e.rng.chance(clamp(p, 0, 0.45))) this.knockdown(a, d, s, true, 'body');
      }
      if (Math.floor((d.body - dmg) / 30) < Math.floor(d.body / 30)) e.emit({ type: 'bodyHurt', side: d.side, level: d.body });
    } else {
      const key = leadLegKey(d);
      d[key] += dmg;
      const leg = d[key];
      if (Math.floor((leg - dmg) / 25) < Math.floor(leg / 25) && leg >= 25) e.emit({ type: 'legHurt', side: d.side, level: leg });
      if (!h.blocked && leg > 72 && dmg > 4.5 && e.mode === 'stand' && !isDown(d)) {
        if (e.rng.chance(clamp((leg - 68) / 120, 0, 0.4))) this.knockdown(a, d, s, false, 'leg');
      }
      if (leg >= 108 + dm.chin * 0.05 && !e.result) e.finish(a.side, 'TKO', 'Leg Kicks');
    }
    if (!e.result) this.refCheck(a, d, s);
  }

  private isLiverShot(a: FighterState, d: FighterState, s: StrikeDef) {
    const open = a.stance !== d.stance;
    if (s.id === 'leadBodyHook' || s.id === 'clinchBodyPunch') return !open && a.stance === 'orthodox';
    if (s.id === 'rearBodyKick' || s.id === 'spinningBackKick' || s.id === 'leadKnee') return open || s.id === 'spinningBackKick';
    return false;
  }

  private checkHead(a: FighterState, d: FighterState, s: StrikeDef, hitDaze: number) {
    const e = this.e;
    const T = this.threshold(d);
    const onGround = e.mode === 'ground' || e.mode === 'sub';
    if (d.daze >= T || hitDaze >= T * TUNING.spikeKO) {
      if (hitDaze >= 8 || isDown(d) || hitDaze >= T * TUNING.spikeKO) {
        e.finish(a.side, 'KO', onGround ? (s.kind === 'elbow' ? 'Elbows' : 'Punches') : s.name);
        return;
      }
      if (onGround) {
        d.rockedT = Math.max(d.rockedT, 4);
        d.unanswered += 8;
        return;
      }
      this.knockdown(a, d, s, true, 'head');
      return;
    }
    if (!onGround && !isDown(d) && ((d.daze >= T * TUNING.knockdownAt && hitDaze >= 7) || hitDaze >= T * TUNING.spikeKnockdown)) {
      this.knockdown(a, d, s, d.daze >= T * 0.86 || hitDaze >= T * 0.36, 'head');
      return;
    }
    if (d.daze >= T * TUNING.rockedAt) {
      const was = isRocked(d);
      d.rockedT = Math.max(d.rockedT, 1.8 + (d.daze / T) * 4.2);
      if (!was) e.emit({ type: 'rocked', side: d.side });
    }
  }

  knockdown(a: FighterState, d: FighterState, s: StrikeDef, heavy: boolean, kind: 'head' | 'body' | 'leg') {
    const e = this.e;
    if (d.down || e.result) return;
    if (e.mode === 'clinch') e.grappling.breakClinch(-1, 'strike');
    const rec = d.data.attributes.recovery;
    const dur = heavy ? e.rng.range(2.4, 3.4) - rec * 0.006 : e.rng.range(1.0, 1.6) - rec * 0.004;
    d.down = { t: 0, dur, heavy };
    d.action = null;
    d.buffered = null;
    d.knockdowns++;
    if (kind === 'head') d.rockedT = Math.max(d.rockedT, heavy ? 7 : 4.5);
    else d.rockedT = Math.max(d.rockedT, 2.5);
    d.unanswered = Math.max(d.unanswered, 6);
    e.emit({ type: 'knockdown', side: d.side, heavy, by: s.name, kind });
  }

  /** Referee stoppage when a hurt fighter keeps absorbing damage without intelligently defending. */
  private refCheck(a: FighterState, d: FighterState, s: StrikeDef) {
    const e = this.e;
    const limit = TUNING.refBase + d.data.attributes.chin * TUNING.refChin;
    if (d.unanswered > limit && (isRocked(d) || isDown(d) || e.mode === 'ground')) {
      let detail = 'Punches';
      if (e.mode === 'ground') detail = s.kind === 'elbow' ? 'Elbows' : 'Ground and Pound';
      else if (s.kind === 'kick') detail = s.target === 'body' ? 'Body Kick' : 'Kicks';
      else if (s.kind === 'knee') detail = 'Knees';
      else if (s.kind === 'elbow') detail = 'Elbows';
      else if (s.target === 'body') detail = 'Body Shots';
      e.finish(a.side, 'TKO', detail);
    }
  }

  update(dt: number) {
    const e = this.e;
    for (const f of e.f) {
      const a = f.data.attributes;
      const floor = f.head * TUNING.dazeFloorFromHead;
      if (f.daze > floor) {
        let rate = TUNING.dazeDecayBase + a.recovery * TUNING.dazeDecayRecovery;
        if (f.down) rate *= 0.8;
        if (e.time - f.lastHitT < 1.2) rate *= 0.35;
        f.daze = Math.max(floor, f.daze - rate * dt);
      }
      if (f.rockedT > 0) {
        f.rockedT -= dt * (0.7 + a.recovery * 0.006);
        if (f.rockedT <= 0 && f.daze >= this.threshold(f) * TUNING.rockedAt) f.rockedT = 0.8;
        if (f.rockedT < 0) f.rockedT = 0;
      }
      f.unanswered *= Math.exp(-0.45 * dt);
      f.hitFlash = Math.max(0, f.hitFlash - dt * 4);
    }
  }

  betweenRounds(f: FighterState) {
    const a = f.data.attributes;
    f.daze = f.head * TUNING.dazeFloorFromHead * 0.7;
    f.rockedT = 0;
    f.down = null;
    f.unanswered = 0;
    f.legL *= 0.9;
    f.legR *= 0.9;
    f.body *= 0.92;
    f.head *= 0.97 - a.recovery * 0.0002;
    f.cut = Math.max(0, f.cut - 10); // cutman work
  }
}

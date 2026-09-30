import type { FightEngine } from '../engine/FightEngine';
import type { FightEvent, Side } from '../engine/types';
import { STRIKES } from '../data';

/**
 * Builds a picture of the opponent's habits from what is *visible* during the fight: strikes thrown
 * (and in what order), guard usage, pressure, retreating after combinations, takedown defence.
 */
export class PlayerModel {
  strikeCounts: Record<string, number> = {};
  totalStrikes = 0;
  bigrams: Record<string, Record<string, number>> = {};
  private lastStrike: { id: string; t: number } | null = null;
  guardHigh = 0;
  guardLow = 0;
  observed = 0;
  forward = 0;
  backward = 0;
  combosThrown = 0;
  retreatAfterCombo = 0;
  private pendingComboCheck = -1;
  tdAgainstAttempts = 0; // our takedowns on them
  tdAgainstSuccess = 0;
  tdByAttempts = 0; // their takedowns on us
  feintsSeen = 0;
  feintReactions = 0;
  private feintWatch = -1;
  headStrikes = 0;
  legKicks = 0;
  kicks = 0;

  constructor(private e: FightEngine, private me: Side) {
    e.bus.on((ev) => this.onEvent(ev));
  }

  private get them(): Side {
    return this.me === 0 ? 1 : 0;
  }

  private onEvent(ev: FightEvent) {
    const t = this.e.time;
    if (ev.type === 'strikeThrown' && ev.side === this.them) {
      const s = STRIKES[ev.id];
      this.strikeCounts[ev.id] = (this.strikeCounts[ev.id] ?? 0) + 1;
      this.totalStrikes++;
      if (s.target === 'head') this.headStrikes++;
      if (s.kind === 'kick') this.kicks++;
      if (s.target === 'leg') this.legKicks++;
      if (this.lastStrike && t - this.lastStrike.t < 1.3) {
        const row = (this.bigrams[this.lastStrike.id] ??= {});
        row[ev.id] = (row[ev.id] ?? 0) + 1;
        if (!this.pendingComboCheck || this.pendingComboCheck < 0) this.pendingComboCheck = t + 0.9;
      }
      this.lastStrike = { id: ev.id, t };
    }
    if (ev.type === 'takedownAttempt') {
      if (ev.side === this.me) this.tdAgainstAttempts++;
      else this.tdByAttempts++;
    }
    if (ev.type === 'takedown' && ev.side === this.me) this.tdAgainstSuccess++;
    if (ev.type === 'feint' && ev.side === this.me) {
      this.feintsSeen++;
      this.feintWatch = t + 0.45;
    }
  }

  /** Sample visible state every tick. */
  observe(dt: number) {
    const e = this.e;
    if (e.mode !== 'stand') return;
    const them = e.f[this.them];
    const me = e.f[this.me];
    this.observed += dt;
    if (them.guard === 'high') this.guardHigh += dt;
    if (them.guard === 'low') this.guardLow += dt;
    const dx = me.pos.x - them.pos.x;
    const dz = me.pos.z - them.pos.z;
    const d = Math.hypot(dx, dz) || 1;
    const fwd = (them.vel.x * dx + them.vel.z * dz) / d;
    if (fwd > 0.4) this.forward += dt;
    if (fwd < -0.4) this.backward += dt;
    if (this.pendingComboCheck > 0 && e.time > this.pendingComboCheck) {
      this.combosThrown++;
      if (fwd < -0.3) this.retreatAfterCombo++;
      this.pendingComboCheck = -1;
    }
    if (this.feintWatch > 0) {
      const act = them.action;
      if (them.guard !== 'none' || act?.kind === 'defense' || (act?.kind === 'strike' && act.t < 0.1)) {
        this.feintReactions++;
        this.feintWatch = -1;
      } else if (e.time > this.feintWatch) this.feintWatch = -1;
    }
  }

  // ---- queries (all smoothed toward neutral priors so a few samples don't overreact)
  rate(id: string) {
    return (this.strikeCounts[id] ?? 0) / (this.totalStrikes + 6);
  }
  get jabRate() {
    return ((this.strikeCounts['jab'] ?? 0) + (this.strikeCounts['bodyJab'] ?? 0)) / (this.totalStrikes + 6);
  }
  get highGuardRate() {
    return this.guardHigh / (this.observed + 10);
  }
  get lowGuardRate() {
    return this.guardLow / (this.observed + 10);
  }
  get pressureRate() {
    return this.forward / (this.observed + 10);
  }
  get retreatRate() {
    return (this.retreatAfterCombo + 0.5) / (this.combosThrown + 2);
  }
  get tdDefenseWeakness() {
    // >0.5 means our takedowns land more often than a neutral prior
    return (this.tdAgainstSuccess + 1) / (this.tdAgainstAttempts + 2);
  }
  get feintBite() {
    return (this.feintReactions + 1) / (this.feintsSeen + 3);
  }
  get kickRate() {
    return (this.kicks + 1) / (this.totalStrikes + 6);
  }
  get legKickRate() {
    return (this.legKicks + 0.5) / (this.totalStrikes + 6);
  }
  get headRate() {
    return (this.headStrikes + 3) / (this.totalStrikes + 6);
  }

  /** Most likely follow-up to `prev`, if the pattern is established. */
  predictNext(prev: string): { id: string; p: number; n: number } | null {
    const row = this.bigrams[prev];
    if (!row) return null;
    let best = '';
    let bn = 0;
    let tot = 0;
    for (const [k, v] of Object.entries(row)) {
      tot += v;
      if (v > bn) {
        bn = v;
        best = k;
      }
    }
    return best ? { id: best, p: bn / (tot + 1), n: bn } : null;
  }

  /** Human-readable reads for the corner / debug overlay. */
  reads(): string[] {
    const out: string[] = [];
    if (this.totalStrikes > 12 && this.jabRate > 0.34) out.push('Leans on the jab — slip and counter over it');
    if (this.observed > 20 && this.highGuardRate > 0.35) out.push('Shells up high — go to the body and legs');
    if (this.observed > 20 && this.pressureRate > 0.35) out.push('Walks forward — counter and time takedowns on the entry');
    if (this.combosThrown > 4 && this.retreatRate > 0.55) out.push('Backs straight up after combinations — follow him');
    if (this.tdAgainstAttempts >= 2 && this.tdDefenseWeakness > 0.55) out.push('Struggling with takedowns — keep shooting');
    if (this.totalStrikes > 12 && this.legKickRate > 0.3) out.push('Loves the leg kick — check it or catch it');
    for (const [prev, row] of Object.entries(this.bigrams)) {
      const pr = this.predictNext(prev);
      if (pr && pr.n >= 4 && pr.p > 0.55) {
        out.push(`${STRIKES[prev].name} is usually followed by ${STRIKES[pr.id].name}`);
        break;
      }
      void row;
    }
    return out;
  }
}

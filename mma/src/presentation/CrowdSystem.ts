import type { FightEngine } from '../engine/FightEngine';
import type { FightEvent } from '../engine/types';

export type CrowdCue = 'cheer' | 'roar' | 'ooh' | 'boo' | 'gasp';

/**
 * Crowd excitement model. Big moments spike excitement; stalling draws boos; late-round exchanges
 * and the final ten seconds lift the building.
 */
export class CrowdSystem {
  excitement = 0.2;
  cues: CrowdCue[] = [];
  private lastAction = 0;
  private booed = -99;

  constructor(private e: FightEngine) {
    e.bus.on((ev) => this.onEvent(ev));
  }

  private bump(v: number, cue?: CrowdCue) {
    this.excitement = Math.min(1, this.excitement + v);
    if (cue) this.cues.push(cue);
  }

  private onEvent(ev: FightEvent) {
    const e = this.e;
    const late = e.clock < 30;
    switch (ev.type) {
      case 'strikeLanded':
        this.lastAction = e.time;
        if (ev.big) this.bump((ev.dmg / 40) * (late ? 1.5 : 1), ev.dmg > 9 ? 'ooh' : undefined);
        else this.bump(0.01);
        break;
      case 'rocked': this.bump(0.35, 'roar'); break;
      case 'knockdown': this.bump(0.6, 'roar'); break;
      case 'takedown': this.lastAction = e.time; this.bump(0.12, 'cheer'); break;
      case 'subAttempt': this.bump(0.3, 'gasp'); break;
      case 'subTight': this.bump(0.3, 'roar'); break;
      case 'subEscape': this.bump(0.25, 'cheer'); break;
      case 'positionChange': this.lastAction = e.time; this.bump(ev.kind === 'sweep' ? 0.2 : 0.08, ev.kind === 'sweep' ? 'cheer' : undefined); break;
      case 'tenSeconds': this.bump(0.25, 'cheer'); break;
      case 'roundStart': this.bump(0.2, 'cheer'); this.lastAction = e.time; break;
      case 'roundEnd': this.bump(0.15, 'cheer'); break;
      case 'standup': if (ev.reason === 'ref') this.bump(0.05, 'cheer'); break;
      case 'stall': this.bump(0, 'boo'); break;
      case 'fightEnd': this.bump(1, 'roar'); break;
    }
  }

  update(dt: number) {
    const e = this.e;
    this.excitement = Math.max(0.12, this.excitement - dt * 0.07 * (0.5 + this.excitement));
    if (e.status === 'fighting' && e.time - this.lastAction > 22 && e.time - this.booed > 20) {
      this.booed = e.time;
      this.cues.push('boo');
    }
    if (e.status === 'fighting' && e.clock < 10) this.excitement = Math.max(this.excitement, 0.55);
  }

  takeCues(): CrowdCue[] {
    const c = this.cues;
    this.cues = [];
    return c;
  }
}

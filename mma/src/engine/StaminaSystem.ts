import type { FightEngine } from './FightEngine';
import { TUNING } from './tuning';
import type { FighterState } from './types';

/**
 * Stamina = the current gas (0-100); tank = the ceiling it can recover to. Every point spent also
 * wears the tank down a little (more for poor cardio), which is why cardio matters across rounds.
 */
export class StaminaSystem {
  private tiredWarned: [number, number] = [0, 0];
  constructor(private e: FightEngine) {}

  spend(f: FighterState, amount: number) {
    if (amount <= 0) return;
    const a = f.data.attributes;
    const weightMult = 1 + (f.data.weightLbs - 170) / 900;
    const amt = amount * weightMult * (1.3 - a.cardio * 0.004);
    f.stamina = Math.max(0, f.stamina - amt);
    f.tank = Math.max(35, f.tank - amt * TUNING.tankDrain * (1.55 - a.cardio / 100));
  }

  update(dt: number) {
    const e = this.e;
    for (const f of e.f) {
      const a = f.data.attributes;
      let activity = 1;
      const act = f.action;
      if (act) activity = act.kind === 'defense' ? 0.55 : act.kind === 'strike' ? 0.25 : act.kind === 'stun' || act.kind === 'recover' ? 0.35 : 0;
      else if (Math.hypot(f.vel.x, f.vel.z) > 0.6) activity = 0.7;
      if (f.guard !== 'none') activity *= 0.88;
      let drain = 0;
      if (e.mode === 'clinch') {
        activity *= 0.3;
        drain = e.clinch && e.clinch.pinned === f.side ? 1.1 : 0.6;
      } else if (e.mode === 'ground' && e.ground) {
        const top = e.ground.top === f.side;
        activity *= top ? 0.55 : 0.25;
        drain = top ? 0.12 : 0.3;
      } else if (e.mode === 'sub') {
        activity = 0;
      }
      if (f.down) activity = 0.6;
      const bodyFactor = Math.max(0.35, 1 - f.body / 170);
      const regen = TUNING.regenBase * (0.05 + a.cardio * 0.0115) * bodyFactor * activity;
      f.stamina = Math.min(f.tank, f.stamina + regen * dt);
      if (drain > 0) this.spend(f, drain * dt * (1.3 - a.cardio / 200));
      if (f.stamina < 22 && e.roundTime - this.tiredWarned[f.side] > 40) {
        this.tiredWarned[f.side] = e.roundTime;
        e.emit({ type: 'tired', side: f.side });
      }
    }
  }

  betweenRounds(f: FighterState) {
    const a = f.data.attributes;
    f.tank = Math.min(100, f.tank + 4 + a.recovery * 0.06 + a.cardio * 0.04);
    f.stamina = Math.min(f.tank, f.stamina + 40 + a.recovery * 0.35);
    this.tiredWarned = [-99, -99];
  }
}

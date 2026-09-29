/**
 * Personnel & effective ratings: who is on the field and how good they are right now
 * (fatigue, scheme fit, coaching, home field, momentum). Pure helpers used by the game engine.
 */
import { DEF_SCHEMES, GAME_CONFIG } from '../../data';

const RATING_SPREAD = GAME_CONFIG.ratingSpread;
const RATING_PIVOT = 77;
import type { Player, Position, Side } from '../../models/types';
import { clamp } from '../../core/util';
import { schemeFit } from '../playerRatings';
import type { GameSetup } from './types';

export interface SideContext {
  side: Side;
  setup: GameSetup['home'];
  /** Available (healthy, not knocked out this game) players per position, in depth-chart order. */
  avail: Record<Position, Player[]>;
  fitBonus: Map<string, number>;
  /** Flat rating-point bonus from coaching quality. */
  offCoachBonus: number;
  defCoachBonus: number;
}

const ALL_POS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K', 'P'];

export function buildSideContext(side: Side, setup: GameSetup): SideContext {
  const t = setup[side];
  const avail = {} as Record<Position, Player[]>;
  const fitBonus = new Map<string, number>();
  for (const pos of ALL_POS) {
    const ids = t.state.depthChart[pos] ?? [];
    const list = ids.map((id) => setup.players[id]).filter((p): p is Player => !!p && !p.injury);
    // Guarantee someone plays every position even if the depth chart is thin.
    if (list.length === 0) {
      const fallback = ids.map((id) => setup.players[id]).filter((p): p is Player => !!p);
      avail[pos] = fallback;
    } else avail[pos] = list;
    for (const p of avail[pos]) {
      const fit = schemeFit(p, t.state.offScheme, t.state.defScheme);
      fitBonus.set(p.id, (fit - 0.8) * 6); // -4.8 .. +1.2 rating points
    }
  }
  const hc = t.coaches.HC?.ratings;
  const oc = t.coaches.OC?.ratings;
  const dc = t.coaches.DC?.ratings;
  const offCoachBonus = ((oc?.offense ?? 70) - 70) * 0.06 + ((hc?.offense ?? 70) - 70) * 0.03 + ((hc?.motivation ?? 70) - 70) * 0.02;
  const defCoachBonus = ((dc?.defense ?? 70) - 70) * 0.06 + ((hc?.defense ?? 70) - 70) * 0.03 + ((hc?.motivation ?? 70) - 70) * 0.02;
  return { side, setup: t, avail, fitBonus, offCoachBonus, defCoachBonus };
}

export class FatigueTracker {
  private f = new Map<string, number>();
  get(id: string): number {
    return this.f.get(id) ?? 0;
  }
  /** Players on the field tire; everyone else recovers. */
  update(onField: Set<string>, roster: Player[], cost: (p: Player) => number): void {
    for (const p of roster) {
      const cur = this.f.get(p.id) ?? 0;
      if (onField.has(p.id)) this.f.set(p.id, clamp(cur + cost(p), 0, 100));
      else if (cur > 0) this.f.set(p.id, Math.max(0, cur - 5));
    }
  }
}

export const FATIGUE_COST: Record<Position, number> = { QB: 0.6, RB: 4.5, WR: 2.6, TE: 2.2, OL: 1.0, DL: 4.2, LB: 2.6, CB: 2.0, S: 2.0, K: 0, P: 0 };

/** Pick n players at a position, rotating tired starters out for fresher backups. */
export function pickRotation(list: Player[], n: number, fatigue: FatigueTracker, bench: number): Player[] {
  const starters = list.slice(0, n);
  const reserves = list.slice(n, n + bench);
  const out: Player[] = [];
  for (const s of starters) {
    const f = fatigue.get(s.id);
    if (f > 62) {
      const idx = reserves.findIndex((r) => fatigue.get(r.id) < 30 && r.overall >= s.overall - 14);
      if (idx >= 0) {
        out.push(reserves[idx]);
        reserves.splice(idx, 1);
        continue;
      }
    }
    out.push(s);
  }
  // Thin depth chart: fill from anywhere at the position.
  if (out.length < n) {
    for (const p of list) {
      if (out.length >= n) break;
      if (!out.includes(p)) out.push(p);
    }
  }
  return out;
}

export interface DefFront {
  DL: number;
  LB: number;
  CB: number;
  S: number;
  name: string;
}

export function defensiveFront(ctx: SideContext, offWR: number, goalLine: boolean): DefFront {
  const base = DEF_SCHEMES[ctx.setup.state.defScheme]?.personnel ?? { DL: 4, LB: 3, CB: 2, S: 2 };
  let { DL, LB, CB, S } = base;
  if (goalLine) {
    // Heavy front near the goal line.
    const extra = CB - 2;
    CB = 2;
    LB += extra;
  } else if (offWR >= 4 && LB > 1) {
    LB -= 1;
    CB += 1;
  } else if (offWR <= 2 && CB > 2) {
    CB -= 1;
    LB += 1;
  }
  const name = CB >= 4 ? 'Dime' : CB === 3 ? 'Nickel' : goalLine ? 'Goal Line' : `${DL}-${LB}`;
  return { DL, LB, CB, S, name };
}

/** Effective value of an attribute for this snap. */
export function eff(p: Player | undefined, attr: string, ctx: SideContext, fatigue: FatigueTracker, bonus: number): number {
  if (!p) return 45;
  const raw = p.attributes[attr] ?? p.overall;
  // Compress talent gaps so ratings matter without making results deterministic (tunable in gameConfig).
  const base = RATING_PIVOT + (raw - RATING_PIVOT) * RATING_SPREAD;
  const fatiguePenalty = fatigue.get(p.id) * 0.07; // up to -7 points when exhausted
  return base - fatiguePenalty + (ctx.fitBonus.get(p.id) ?? 0) + bonus;
}

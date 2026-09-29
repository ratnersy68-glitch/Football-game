import { POSITION_ORDER } from '../data';
import type { DepthChart, Player, Position, TeamState } from '../models/types';

export function emptyDepthChart(): DepthChart {
  return Object.fromEntries(POSITION_ORDER.map((p) => [p, [] as string[]])) as unknown as DepthChart;
}

/** Best-available ordering at every position (injured players pushed to the bottom). CPU teams use this weekly. */
export function autoDepthChart(roster: Player[]): DepthChart {
  const dc = emptyDepthChart();
  for (const pos of POSITION_ORDER) {
    dc[pos] = roster
      .filter((p) => p.position === pos)
      .sort((a, b) => {
        const ia = a.injury ? 1 : 0;
        const ib = b.injury ? 1 : 0;
        if (ia !== ib) return ia - ib;
        return b.overall - a.overall || b.year - a.year;
      })
      .map((p) => p.id);
  }
  return dc;
}

/**
 * Keep the user's manual order but drop players no longer on the roster and append any new ones.
 * Never reorders what the user set.
 */
export function reconcileDepthChart(dc: DepthChart, roster: Player[]): DepthChart {
  const out = emptyDepthChart();
  const byId = new Map(roster.map((p) => [p.id, p]));
  for (const pos of POSITION_ORDER) {
    const kept = (dc[pos] ?? []).filter((id) => byId.get(id)?.position === pos);
    const extra = roster
      .filter((p) => p.position === pos && !kept.includes(p.id))
      .sort((a, b) => b.overall - a.overall)
      .map((p) => p.id);
    out[pos] = [...kept, ...extra];
  }
  return out;
}

/** Top n healthy players at a position in depth-chart order. Falls back to injured players only if nobody else exists. */
export function healthyStarters(team: TeamState, pos: Position, n: number, players: Record<string, Player>): Player[] {
  const ids = team.depthChart[pos] ?? [];
  const healthy = ids.map((id) => players[id]).filter((p) => p && !p.injury);
  if (healthy.length >= n) return healthy.slice(0, n);
  const hurt = ids.map((id) => players[id]).filter((p) => p && p.injury);
  return [...healthy, ...hurt].slice(0, n);
}

export function moveInDepthChart(dc: DepthChart, pos: Position, fromIndex: number, toIndex: number): DepthChart {
  const list = [...dc[pos]];
  if (fromIndex < 0 || fromIndex >= list.length || toIndex < 0 || toIndex >= list.length) return dc;
  const [item] = list.splice(fromIndex, 1);
  list.splice(toIndex, 0, item);
  return { ...dc, [pos]: list };
}

/** How many players at each position are "starters" in the base depth chart view. */
export const STARTER_COUNTS: Record<Position, number> = { QB: 1, RB: 1, WR: 3, TE: 1, OL: 5, DL: 4, LB: 3, CB: 2, S: 2, K: 1, P: 1 };

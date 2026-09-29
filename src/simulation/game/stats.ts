import type { GamePlayerLine, Side, StatLine, TeamGameStats } from '../../models/types';

export function emptyTeamGameStats(): TeamGameStats {
  return {
    score: 0,
    firstDowns: 0,
    totalYards: 0,
    passYards: 0,
    rushYards: 0,
    passAtt: 0,
    passComp: 0,
    rushAtt: 0,
    turnovers: 0,
    sacks: 0,
    sackYards: 0,
    penalties: 0,
    penaltyYards: 0,
    thirdDownAtt: 0,
    thirdDownConv: 0,
    fourthDownAtt: 0,
    fourthDownConv: 0,
    redZoneAtt: 0,
    redZoneTD: 0,
    timeOfPossession: 0,
    scoreByPeriod: [0, 0, 0, 0],
  };
}

const MAX_KEYS = new Set(['passLong', 'rushLong', 'recLong', 'fgLong', 'puntLong']);

export function addStat(line: StatLine, key: keyof StatLine, value: number): void {
  if (!value && value !== 0) return;
  if (MAX_KEYS.has(key)) {
    line[key] = Math.max(line[key] ?? 0, value);
  } else {
    line[key] = (line[key] ?? 0) + value;
  }
}

/** Merge a stat line into an accumulator (season / career). */
export function mergeStatLine(into: StatLine, from: StatLine): void {
  for (const k of Object.keys(from) as (keyof StatLine)[]) {
    const v = from[k];
    if (typeof v !== 'number') continue;
    addStat(into, k, v);
  }
}

/** Accumulates player and team stats for one game. */
export class GameStats {
  players = new Map<string, GamePlayerLine>();
  team: Record<Side, TeamGameStats> = { home: emptyTeamGameStats(), away: emptyTeamGameStats() };

  constructor(private teamIdOf: (playerId: string) => string) {}

  p(playerId: string | undefined): GamePlayerLine | null {
    if (!playerId) return null;
    let line = this.players.get(playerId);
    if (!line) {
      line = { playerId, teamId: this.teamIdOf(playerId) };
      this.players.set(playerId, line);
    }
    return line;
  }

  add(playerId: string | undefined, key: keyof StatLine, value: number): void {
    const line = this.p(playerId);
    if (line) addStat(line, key, value);
  }

  lines(): GamePlayerLine[] {
    const out: GamePlayerLine[] = [];
    for (const line of this.players.values()) {
      // Drop empty lines to keep saves small.
      const keys = Object.keys(line).filter((k) => k !== 'playerId' && k !== 'teamId');
      if (keys.length) out.push(line);
    }
    return out;
  }
}

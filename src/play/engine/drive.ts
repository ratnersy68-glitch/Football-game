/**
 * Drive state: downs, distance, line of scrimmage, clock, score and the player's stats — plus the
 * coach's play caller and the defensive coordinator AI.
 */
import { Rng } from '../../core/rng';
import { PLAYS, type DefCall, type PlayDef } from './playbook';
import type { PlayOutcome, SimSettings } from './types';

export interface DriveStats {
  att: number;
  comp: number;
  passYds: number;
  passTD: number;
  int: number;
  sacks: number;
  rushAtt: number;
  rushYds: number;
  rushTD: number;
  rec: number;
  recYds: number;
  recTD: number;
  longest: number;
}

export function emptyDriveStats(): DriveStats {
  return { att: 0, comp: 0, passYds: 0, passTD: 0, int: 0, sacks: 0, rushAtt: 0, rushYds: 0, rushTD: 0, rec: 0, recYds: 0, recTD: 0, longest: 0 };
}

export interface ResultSummary {
  headline: string;
  detail: string;
  firstDown: boolean;
  touchdown: boolean;
  driveOver: boolean;
  gained: number;
}

/** Make probability for a field goal of `distance` yards. */
export function fieldGoalChance(distance: number): number {
  return Math.max(0.05, Math.min(0.97, 1 / (1 + Math.exp((distance - 49) / 4.5))));
}

export class Drive {
  los = 25;
  spotY = 53.33 / 2;
  down = 1;
  distance = 10;
  quarter = 1;
  clock: number;
  score = { us: 0, them: 0 };
  plays = 0;
  over = false;
  /** Overtime: no game clock, possessions from the opponent's 25. */
  ot = false;
  reason = '';
  stats: DriveStats = emptyDriveStats();
  log: string[] = [];
  /** Offensive tendencies the defensive coordinator watches (smarter at higher difficulty). */
  tendency = { deep: 0, quick: 0, medium: 0, run: 0 };
  private recent: string[] = [];

  /** Scoreboard abbreviations (offense first). */
  abbr = { us: 'OSU', them: 'MICH' };

  constructor(
    public settings: SimSettings,
    abbr?: { us: string; them: string },
  ) {
    this.clock = settings.quarterMinutes * 60;
    if (abbr) this.abbr = abbr;
  }

  get goalToGo(): boolean {
    return this.los + this.distance >= 100;
  }

  downLabel(): string {
    if (this.down > 4) return 'Turnover on downs';
    const ord = ['', '1st', '2nd', '3rd', '4th'][this.down];
    return `${ord} & ${this.goalToGo ? 'Goal' : this.distance}`;
  }

  spotLabel(ours = this.abbr.us, theirs = this.abbr.them): string {
    const x = Math.round(this.los);
    if (x === 50) return '50';
    return x < 50 ? `${ours} ${x}` : `${theirs} ${100 - x}`;
  }

  /** Coach picks the play from down, distance and field position. */
  coachCall(rng: Rng): PlayDef {
    const d = this.distance;
    const want: PlayDef['depth'][] =
      d <= 3 ? ['run', 'run', 'quick', 'run', 'medium'] : d >= 10 ? ['medium', 'deep', 'run', 'medium', 'quick'] : ['run', 'quick', 'medium', 'run', 'deep'];
    if (this.los >= 88) want.push('quick', 'run');
    const depth = rng.pick(want);
    let pool = PLAYS.filter((p) => p.depth === depth && !this.recent.includes(p.id));
    if (!pool.length) pool = PLAYS.filter((p) => !this.recent.includes(p.id));
    const play = rng.pick(pool);
    this.recent = [play.id, ...this.recent].slice(0, 2);
    return play;
  }

  /** Defensive call: situational, and on higher difficulty it adapts to what you keep doing. */
  defenseCall(rng: Rng): DefCall {
    const w: Record<DefCall, number> = { cover1: 3, cover2: 3, cover3: 4, cover0: 1 };
    if (this.down === 3 && this.distance >= 8) {
      w.cover2 += 2;
      w.cover3 += 2;
      w.cover0 += 1;
    }
    if (this.distance <= 3) {
      w.cover1 += 2;
      w.cover0 += 2;
    }
    if (this.los >= 85) {
      w.cover1 += 2;
      w.cover0 += 1;
    }
    if (this.settings.difficulty >= 2) {
      const t = this.tendency;
      const total = t.deep + t.quick + t.medium + t.run || 1;
      w.cover2 += (t.deep / total) * 5;
      w.cover3 += (t.deep / total) * 3;
      w.cover1 += (t.quick / total) * 4;
      w.cover0 += ((t.quick + t.run) / total) * (this.settings.difficulty - 1) * 2;
      w.cover1 += (t.run / total) * 3; // load the box against a running team
    }
    return rng.weightedKey(w);
  }

  noteCall(play: PlayDef) {
    this.tendency[play.depth]++;
  }

  /** Apply a finished play to the drive. */
  apply(o: PlayOutcome, userId: string): ResultSummary {
    this.plays++;
    const before = this.los;
    let gained = Math.round(o.spotX - before);
    let firstDown = false;
    let touchdown = false;
    let headline = '';
    let detail = o.text;
    // The user's stats: passing as the passer, rushing as a runner, receiving as the catcher.
    if (o.passer === userId) {
      if (o.kind !== 'sack') this.stats.att++;
      if (o.completion) {
        this.stats.comp++;
        this.stats.passYds += o.passYards;
        this.stats.longest = Math.max(this.stats.longest, o.passYards);
      }
      if (o.kind === 'interception') this.stats.int++;
    }
    if (o.kind === 'sack') {
      if (o.carrier === userId) this.stats.sacks++;
    } else if (o.completion && o.carrier === userId) {
      this.stats.rec++;
      this.stats.recYds += o.passYards;
      this.stats.longest = Math.max(this.stats.longest, o.passYards);
    } else if (!o.passer && o.carrier === userId && o.kind !== 'incomplete') {
      this.stats.rushAtt++;
      this.stats.rushYds += o.rushYards;
      this.stats.longest = Math.max(this.stats.longest, o.rushYards);
    }
    // Clock: live time always counts; the clock runs between plays unless it stopped.
    const clockStops = o.kind === 'incomplete' || o.kind === 'out_of_bounds' || o.kind === 'touchdown' || o.kind === 'interception';
    const halfBefore = this.quarter <= 2;
    this.runClock(o.duration + (clockStops ? 0 : 25 * (this.settings.quarterMinutes / 15)));
    const halftime = halfBefore && this.quarter >= 3;

    switch (o.kind) {
      case 'touchdown':
        touchdown = true;
        gained = 100 - before;
        this.score.us += 7; // automatic PAT in Milestone 1
        if (o.completion && o.passer === userId) this.stats.passTD++;
        if (o.completion && o.carrier === userId) this.stats.recTD++;
        if (!o.completion && o.carrier === userId) this.stats.rushTD++;
        headline = 'TOUCHDOWN!';
        this.finish('Touchdown');
        break;
      case 'interception':
        headline = 'INTERCEPTED';
        this.finish('Interception');
        break;
      case 'safety':
        headline = 'SAFETY';
        this.score.them += 2;
        this.finish('Safety');
        break;
      case 'incomplete':
        headline = 'INCOMPLETE';
        gained = 0;
        this.nextDown(0);
        break;
      default: {
        this.los = Math.max(1, Math.min(99, o.spotX));
        this.spotY = Math.max(20, Math.min(33.3, o.spotY));
        if (gained >= this.distance) {
          firstDown = true;
          this.down = 1;
          this.distance = Math.min(10, 100 - Math.round(this.los));
          headline = 'FIRST DOWN';
        } else {
          headline = o.kind === 'sack' ? 'SACK' : gained > 0 ? `GAIN OF ${gained}` : gained === 0 ? 'NO GAIN' : `LOSS OF ${-gained}`;
          this.nextDown(gained);
        }
      }
    }
    if (!this.over && this.quarter === 4 && this.clock <= 0 && !this.ot) this.finish('End of game');
    else if (!this.over && halftime) this.finish('End of half');
    this.los = Math.round(this.los);
    this.log.push(`${headline} — ${detail}`);
    if (o.kind === 'incomplete') detail = o.text;
    return { headline, detail, firstDown, touchdown, driveOver: this.over, gained };
  }

  private nextDown(gained: number) {
    this.down++;
    this.distance -= gained;
    if (this.down > 4) {
      this.finish('Turnover on downs');
    }
  }

  private finish(reason: string) {
    this.over = true;
    this.reason = reason;
  }

  /** 4th-down field goal (kicker resolved by distance; not playable in Milestone 1). */
  kickFieldGoal(rng: Rng): { good: boolean; distance: number } {
    const distance = 100 - this.los + 17;
    const good = rng.chance(fieldGoalChance(distance));
    if (good) this.score.us += 3;
    this.finish(good ? `Field goal good (${distance} yds)` : `Field goal missed (${distance} yds)`);
    return { good, distance };
  }

  punt(): void {
    this.finish('Punt');
  }

  /** Run the game clock (live play time, runoff or a simulated possession), rolling quarters over. */
  runClock(seconds: number): void {
    if (this.ot) return;
    this.clock -= seconds;
    while (this.clock <= 0 && this.quarter < 4) {
      this.quarter++;
      this.log.push(`End of quarter ${this.quarter - 1}.`);
      this.clock += this.settings.quarterMinutes * 60;
      if (this.quarter === 3 || this.clock <= 0) this.clock = this.settings.quarterMinutes * 60; // halftime resets
    }
    if (this.clock < 0) this.clock = 0;
  }

  get gameOver(): boolean {
    return !this.ot && this.quarter === 4 && this.clock <= 0;
  }

  /** Reset for a new drive (score, clock and stats carry over). */
  newDrive(los = 25): void {
    this.los = los;
    this.spotY = 53.33 / 2;
    this.down = 1;
    this.distance = Math.min(10, 100 - los);
    this.over = false;
    this.reason = '';
    this.plays = 0;
    if (this.quarter === 4 && this.clock <= 0 && !this.ot) {
      this.quarter = 1;
      this.clock = this.settings.quarterMinutes * 60;
    }
  }
}

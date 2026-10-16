/** Applying session/event results to the profile: coins, XP, medals, records, tournaments, sponsors. */
import type { Profile } from './save';
import { stageOf } from './save';
import { POINTS, SPONSORS, TOURNAMENTS, type Medal } from '../data/career';
import { ITEM_BY_ID, type Slot } from '../data/equipment';
import type { GameResult } from '../game/Game';
import type { TrickResult } from '../physics/tricks';

export interface SessionStats {
  distance: number; topSpeed: number; maxAir: number; tricks: number; crashes: number;
  trailsDone: number[]; ridden: number[]; achievements: string[]; bestTrick: TrickResult | null; bestCombo: number; trickTotal: number;
}

export interface RewardSummary { coins: number; xp: number; messages: string[]; stageUp: string | null }

function sponsorMult(p: Profile, kind: 'race' | 'trick' | 'other'): number {
  let m = 1;
  for (const id of p.sponsors) {
    const s = SPONSORS.find((x) => x.id === id);
    if (!s) continue;
    m += s.bonus.all + (kind === 'race' ? s.bonus.race : kind === 'trick' ? s.bonus.trick : 0);
  }
  return m;
}

const MEDAL_RANK: Record<Medal, number> = { bronze: 1, silver: 2, gold: 3 };

export function applySession(p: Profile, resortId: string, s: SessionStats, stagesNames: readonly { name: string }[]): RewardSummary {
  const before = stageOf(p);
  const msgs: string[] = [];
  p.stats.distance += s.distance;
  p.stats.topSpeed = Math.max(p.stats.topSpeed, s.topSpeed);
  p.stats.maxAir = Math.max(p.stats.maxAir, s.maxAir);
  p.stats.tricks += s.tricks;
  p.stats.crashes += s.crashes;
  const newTrails = s.trailsDone.filter((t) => !(p.trailsDone[resortId] ?? []).includes(t));
  p.trailsDone[resortId] = [...new Set([...(p.trailsDone[resortId] ?? []), ...s.trailsDone])];
  p.ridden[resortId] = [...new Set([...(p.ridden[resortId] ?? []), ...s.ridden])];
  p.stats.runs += newTrails.length;
  for (const a of s.achievements) if (!p.achievements.includes(a)) { p.achievements.push(a); msgs.push('Achievement unlocked'); }
  if (s.bestTrick && (!p.bestTrick || s.bestTrick.score > p.bestTrick.score)) { p.bestTrick = { name: s.bestTrick.name, score: s.bestTrick.score }; msgs.push(`New best trick: ${s.bestTrick.name}`); }
  p.bestCombo = Math.max(p.bestCombo, s.bestCombo);
  const coins = Math.round((s.distance / 100 + s.trickTotal / 120 + newTrails.length * 60) * sponsorMult(p, 'trick'));
  const xp = Math.round(s.distance / 40 + s.trickTotal / 60 + newTrails.length * 120);
  p.coins += coins; p.xp += xp;
  checkSponsors(p, msgs);
  const after = stageOf(p);
  return { coins, xp, messages: msgs, stageUp: after > before ? stagesNames[after].name : null };
}

export function applyResult(p: Profile, resortId: string, r: GameResult, stagesNames: readonly { name: string }[]): RewardSummary {
  const before = stageOf(p);
  const msgs: string[] = [];
  const kind = r.kind === 'race' ? 'race' : r.kind === 'park' ? 'trick' : 'other';
  let coins = Math.round(r.coins * sponsorMult(p, kind));
  let xp = r.xp;
  // medals count once per event (upgrades count the difference)
  if (r.eventId) {
    const prev = p.events[r.eventId];
    const prevRank = prev?.medal ? MEDAL_RANK[prev.medal] : 0;
    const nowRank = r.medal ? MEDAL_RANK[r.medal] : 0;
    if (nowRank > prevRank) {
      if (prev?.medal) p.medals[prev.medal]--;
      if (r.medal) { p.medals[r.medal]++; msgs.push(`${r.medal[0].toUpperCase()}${r.medal.slice(1)} medal earned!`); }
    } else if (prev) { coins = Math.round(coins * 0.5); xp = Math.round(xp * 0.5); }
    const better = !prev || nowRank > prevRank || (r.kind === 'race' || (r.kind === 'challenge' && r.valueLabel.includes(':')) ? r.value < prev.value : r.value > prev.value);
    p.events[r.eventId] = { medal: nowRank >= prevRank ? r.medal : prev!.medal, value: better ? r.value : prev!.value };
  } else if (r.medal && r.kind === 'race' && !r.tournament) {
    // quick races award half rewards and no career medals
    coins = Math.round(coins * 0.6); xp = Math.round(xp * 0.6);
  }
  if (r.kind === 'race') {
    p.stats.races++;
    if (r.medal === 'gold') { if (!p.achievements.includes('gold')) p.achievements.push('gold'); }
    const me = r.race?.find((x) => x.isPlayer);
    if (me && me.time !== null && r.recordKey) {
      const prev = p.records[r.recordKey];
      if (!prev || me.time < prev.time) p.records[r.recordKey] = { time: me.time, level: r.level ?? 0, date: Date.now() };
    }
  }
  if (r.trickBest && (!p.bestTrick || r.trickBest.score > p.bestTrick.score)) p.bestTrick = { name: r.trickBest.name, score: r.trickBest.score };
  if (r.bestCombo) p.bestCombo = Math.max(p.bestCombo, r.bestCombo);
  // tournament standings
  if (r.tournament && r.race) {
    const t = TOURNAMENTS.find((x) => x.id === r.tournament!.id)!;
    const st = p.tournaments[t.id] ?? { race: 0, points: {}, done: false };
    r.race.forEach((row) => {
      const pts = row.time === null ? 0 : POINTS[row.rank - 1] ?? 20;
      const name = row.isPlayer ? '__you' : row.name;
      st.points[name] = (st.points[name] ?? 0) + pts;
    });
    st.race = r.tournament.index + 1;
    if (st.race >= t.races.length) {
      st.done = true;
      const table = Object.entries(st.points).sort((a, b) => b[1] - a[1]);
      st.place = table.findIndex(([n]) => n === '__you') + 1;
      if (st.place <= 3) {
        const medal: Medal = st.place === 1 ? 'gold' : st.place === 2 ? 'silver' : 'bronze';
        p.medals[medal]++;
        const prize = Math.round(t.prize * (st.place === 1 ? 1 : st.place === 2 ? 0.6 : 0.4));
        coins += prize; xp += prize;
        msgs.push(`${t.name}: ${st.place === 1 ? 'CHAMPION' : `${st.place}${st.place === 2 ? 'nd' : 'rd'} overall`} — ${prize.toLocaleString()} Peak Coins prize`);
        if (st.place === 1 && !p.achievements.includes('tourney')) p.achievements.push('tourney');
      } else msgs.push(`${t.name} finished ${st.place}th overall`);
    }
    p.tournaments[t.id] = st;
  }
  p.coins += coins; p.xp += xp;
  checkSponsors(p, msgs);
  const after = stageOf(p);
  if (after === 7 && !p.achievements.includes('legend')) p.achievements.push('legend');
  void resortId;
  return { coins, xp, messages: msgs, stageUp: after > before ? stagesNames[after].name : null };
}

/** Sponsors approach automatically when requirements are met; their gift item is added. */
export function checkSponsors(p: Profile, msgs: string[]) {
  const st = stageOf(p);
  const eligible: Record<string, boolean> = {
    nordline: st >= 1,
    drift: (p.bestTrick?.score ?? 0) >= 3000,
    apex: p.medals.gold >= 3,
    coldfront: st >= 3,
    vertigo: st >= 5,
  };
  for (const s of SPONSORS) {
    if (p.sponsors.includes(s.id) || !eligible[s.id]) continue;
    p.sponsors.push(s.id);
    msgs.push(`Sponsor signed: ${s.name}!${s.gift ? ` Gift: ${ITEM_BY_ID.get(s.gift)?.name}` : ''}`);
    if (s.gift && !p.owned.includes(s.gift)) p.owned.push(s.gift);
  }
}

export function buy(p: Profile, id: string): string | null {
  const it = ITEM_BY_ID.get(id);
  if (!it) return 'Unknown item';
  if (p.owned.includes(id)) return null;
  if ((it.unlockStage ?? 0) > stageOf(p)) return 'Locked — reach a higher career stage';
  if (p.coins < it.price) return 'Not enough Peak Coins';
  p.coins -= it.price;
  p.owned.push(id);
  return null;
}

export function equip(p: Profile, id: string) {
  const it = ITEM_BY_ID.get(id);
  if (!it || !p.owned.includes(id)) return;
  p.equipped[it.slot as Slot] = id;
  if (it.slot === 'snowboard') p.board = 'snowboard';
  if (it.slot === 'skis') p.board = 'ski';
}

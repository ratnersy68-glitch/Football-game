/**
 * Bowl Bucks economy, purchases, unlocks, achievements, gear drops and team themes.
 * Everything lives on Dynasty.locker and is saved with the dynasty.
 * Cosmetic only: nothing here touches ratings or gameplay.
 */
import type { Dynasty, GameRecord } from '../dynasty/types';
import type { GameResult } from '../game/GameSession';
import type { PlayerData } from '../game/types';
import { RNG } from '../game/rng';
import { getTeam, isLcps } from '../data/teams';
import { CATALOG, STARTER_ITEMS, itemById, isPurchasable, LEGACY_ITEM_MAP, LEGACY_UNMAPPED } from './catalog';
import { autoGear } from './look';
import type { EquipmentItem, GameRewards, Locker, PlayerGear, Rarity, ThemeId } from './types';
import { RARITIES } from './types';

export const START_BB = 300;

export function newLocker(): Locker {
  return {
    bb: START_BB, lifetimeBB: START_BB, owned: [...STARTER_ITEMS], favorites: [], achievements: {}, drops: [],
    theme: 'none', themesUnlocked: ['none', 'blackout', 'whiteout'], rivalryWins: 0, gamesPlayed: 0, newItems: [],
    gearSchema: GEAR_SCHEMA, rewardedGames: [],
  };
}

/** Gear schema: 1 = invented helmet catalog, 2 = exact supplied helmets + shoulder pads. */
export const GEAR_SCHEMA = 2;
const LEGACY_NAMES: Record<string, string> = { 'helm-classic': 'Classic Shell', 'helm-retro': 'Retro Shell', 'helm-oldschool': 'Old School Shell', 'helm-speed': 'Speed Shell' };

export const needsGearMigration = (d: Dynasty) => !!d.locker && (d.locker.gearSchema ?? 1) < GEAR_SCHEMA;

/**
 * v1 → v2: map earlier invented helmets to the exact supplied models only where there is a clear correspondence,
 * keep the rest as legacy records (not sold, not presented as one of the eight products), give everyone issued pads.
 * Balance, season, stats and rosters are untouched.
 */
export function migrateGear(d: Dynasty) {
  const L = d.locker!;
  const mapId = (id: string) => LEGACY_ITEM_MAP[id] ?? id;
  L.legacy = L.legacy ?? [];
  for (const id of L.owned) if (LEGACY_UNMAPPED.includes(id) && !L.legacy.some((x) => x.id === id)) L.legacy.push({ id, name: LEGACY_NAMES[id] ?? id, note: 'Retired invented helmet from an older save. No exact equivalent; kept as a record.' });
  L.owned = [...new Set(L.owned.filter((id) => !LEGACY_UNMAPPED.includes(id)).map(mapId))];
  L.favorites = [...new Set(L.favorites.filter((id) => !LEGACY_UNMAPPED.includes(id)).map(mapId))];
  L.newItems = L.newItems.filter((id) => !LEGACY_UNMAPPED.includes(id)).map(mapId);
  for (const dr of L.drops) dr.item = mapId(dr.item);
  for (const prog of Object.values(d.programs)) for (const p of prog.roster) {
    const g = p.gear;
    if (!g) continue;
    if (g.helmet === 'helm-threepeat' || g.helmet === 'helm-goat') { g.finish = LEGACY_ITEM_MAP[g.helmet]; g.helmet = 'helm-standard'; }
    else if (g.helmet && LEGACY_ITEM_MAP[g.helmet]) g.helmet = LEGACY_ITEM_MAP[g.helmet];
    else if (g.helmet && !itemById(g.helmet)) g.helmet = 'helm-standard';
    if (!g.pads) g.pads = 'pads-standard';
  }
  L.gearSchema = GEAR_SCHEMA;
}

/** Migration-safe access: creates the locker and starter fits for older saves. */
export function ensureLocker(d: Dynasty): Locker {
  if (!d.locker) {
    d.locker = newLocker();
  }
  const L = d.locker;
  if ((L.gearSchema ?? 1) < GEAR_SCHEMA) migrateGear(d);
  L.beaten = L.beaten ?? [];
  L.rewardedGames = L.rewardedGames ?? [];
  for (const id of STARTER_ITEMS) if (!L.owned.includes(id)) L.owned.push(id);
  for (const p of d.programs[d.userTeam].roster) ensurePlayerGear(d, p);
  return L;
}

export const owns = (d: Dynasty, id?: string) => !!id && !!d.locker?.owned.includes(id);

/** User players only wear owned gear; new players (freshmen) get an owned-only fit. */
export function ensurePlayerGear(d: Dynasty, p: PlayerData) {
  if (!p.gear) p.gear = autoGear(p, (i) => owns(d, i.id));
}

/** Can the item be bought right now? */
export function itemStatus(d: Dynasty, item: EquipmentItem): 'owned' | 'available' | 'locked' {
  if (owns(d, item.id)) return 'owned';
  if (!item.unlock) return 'available';
  if (item.unlock.kind === 'beat') {
    if (item.collection === d.userTeam || d.locker?.beaten?.includes(item.unlock.team)) return 'available';
  }
  return 'locked';
}

export function equippedCount(d: Dynasty, id: string): number {
  let n = 0;
  for (const p of d.programs[d.userTeam].roster) {
    const g = p.gear;
    if (!g) continue;
    if (Object.values(g).some((v) => v === id || (Array.isArray(v) && v.includes(id)))) n++;
  }
  return n;
}

export type BuyResult = { ok: true } | { ok: false; need: number; reason: string };

export function buyItem(d: Dynasty, id: string): BuyResult {
  const L = ensureLocker(d);
  const item = itemById(id);
  if (!item) return { ok: false, need: 0, reason: 'Unknown item' };
  const st = itemStatus(d, item);
  if (st === 'owned') return { ok: false, need: 0, reason: 'Already owned' };
  if (st === 'locked') return { ok: false, need: 0, reason: item.unlock?.text ?? 'Locked' };
  if (L.bb < item.price) return { ok: false, need: item.price - L.bb, reason: 'NOT ENOUGH BOWL BUCKS' };
  L.bb -= item.price;
  L.owned.push(id);
  L.newItems.push(id);
  return { ok: true };
}

function grant(d: Dynasty, id: string, out?: string[]) {
  const L = d.locker!;
  if (!itemById(id) || L.owned.includes(id)) return;
  L.owned.push(id);
  L.newItems.push(id);
  out?.push(id);
}

export function toggleFavorite(d: Dynasty, id: string) {
  const L = ensureLocker(d);
  L.favorites = L.favorites.includes(id) ? L.favorites.filter((x) => x !== id) : [...L.favorites, id];
}

// ---------------------------------------------------------------- achievements

export interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  bb: number;
  unlock?: string; // item id
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first-win', name: 'FIRST W', desc: 'Win your first game.', bb: 100 },
  { id: 'air-it-out', name: 'AIR IT OUT', desc: 'Throw for 400 yards in one game.', bb: 300, unlock: 'gloves-airraid' },
  { id: 'ground-pound', name: 'GROUND & POUND', desc: 'A player rushes for 200 yards in one game.', bb: 250 },
  { id: 'shutdown', name: 'SHUTDOWN', desc: 'Pitch a shutout.', bb: 200 },
  { id: 'half-century', name: 'HALF CENTURY', desc: 'Score 50+ points in a game.', bb: 200 },
  { id: 'comeback-kids', name: 'COMEBACK KIDS', desc: 'Win after trailing by 14+.', bb: 250 },
  { id: 'ot-thriller', name: 'OT THRILLER', desc: 'Win in overtime.', bb: 150 },
  { id: 'pick-six', name: 'PICK SIX', desc: 'Score a defensive touchdown.', bb: 150 },
  { id: 'house-call', name: 'HOUSE CALL', desc: 'Return a kick for a touchdown.', bb: 200 },
  { id: 'giant-killer', name: 'GIANT KILLER', desc: 'Beat a top-3 team while ranked 8 spots lower.', bb: 300 },
  { id: 'rivalry-king', name: 'RIVALRY KING', desc: 'Win 5 rivalry games.', bb: 500, unlock: 'visor-rivalry' },
  { id: 'ten-wins', name: 'DOUBLE DIGITS', desc: 'Win 10 games in a season.', bb: 400 },
  { id: 'thousand-yards', name: '1,000 YARD CLUB', desc: 'A player rushes for 1,000 yards in a season.', bb: 400, unlock: 'gloves-1000' },
  { id: 'air-raid', name: 'AIR RAID', desc: 'Throw for 3,000 yards in a season.', bb: 500, unlock: 'sleeve-airraid' },
  { id: 'lockdown', name: 'LOCKDOWN', desc: '10 team interceptions in a season.', bb: 400, unlock: 'visor-lockdown' },
  { id: 'perfect-season', name: 'PERFECT SEASON', desc: 'Finish a season undefeated.', bb: 1500, unlock: 'cleats-perfect' },
  { id: 'champions', name: 'CHAMPIONS', desc: 'Win the LCPS Bowl.', bb: 1000, unlock: 'cleats-champgold' },
  { id: 'collector', name: 'COLLECTOR', desc: 'Own 40 pieces of gear.', bb: 300 },
  { id: 'drip-check', name: 'DRIP CHECK', desc: 'Dress one player in 3+ legendary items.', bb: 250 },
];

function award(d: Dynasty, id: string, r: GameRewards, week: number) {
  const L = d.locker!;
  if (L.achievements[id]) return;
  const a = ACHIEVEMENTS.find((x) => x.id === id);
  if (!a) return;
  L.achievements[id] = { year: d.year, week };
  L.bb += a.bb;
  L.lifetimeBB += a.bb;
  r.achievements.push({ id, name: a.name, bb: a.bb, unlock: a.unlock });
  r.total += a.bb;
  if (a.unlock) grant(d, a.unlock, r.unlocked);
}

/** Checks collection/style achievements (call after purchases or gear edits). */
export function checkPassiveAchievements(d: Dynasty): GameRewards['achievements'] {
  const r: GameRewards = { lines: [], total: 0, achievements: [], unlocked: [], simmed: false };
  const L = ensureLocker(d);
  if (L.owned.length >= 40) award(d, 'collector', r, d.week);
  for (const p of d.programs[d.userTeam].roster) {
    const ids = gearIds(p.gear);
    if (ids.filter((id) => itemById(id)?.rarity === 'legendary').length >= 3) { award(d, 'drip-check', r, d.week); break; }
  }
  return r.achievements;
}

export function gearIds(g?: PlayerGear): string[] {
  if (!g) return [];
  const out: string[] = [];
  for (const v of Object.values(g)) {
    if (typeof v === 'string' && itemById(v)) out.push(v);
    if (Array.isArray(v)) out.push(...v);
  }
  return out;
}

// ---------------------------------------------------------------- rewards

const fmt = (n: number) => n.toLocaleString('en-US');

/**
 * Computes and applies Bowl Bucks for a user game. Simulated games pay only the
 * participation/win/rivalry/playoff portion (no stat bonuses, achievements or drops).
 */
export const rewardKey = (d: Dynasty, g: GameRecord) => `${d.year}:${g.id}`;

export function gameRewards(d: Dynasty, g: GameRecord, r: GameResult, ctx: { simmed: boolean; preRankUs: number; preRankThem: number }): GameRewards {
  const L = ensureLocker(d);
  const us = g.home === d.userTeam ? 'home' : 'away';
  const them = us === 'home' ? 'away' : 'home';
  const ourScore = us === 'home' ? r.homeScore : r.awayScore;
  const theirScore = us === 'home' ? r.awayScore : r.homeScore;
  const won = ourScore > theirScore;
  const out: GameRewards = { lines: [], total: 0, achievements: [], unlocked: [], drop: null, simmed: ctx.simmed };
  // Pay each completed game exactly once (reloads / revisiting results never pay again).
  const key = rewardKey(d, g);
  if (L.rewardedGames!.includes(key)) { out.alreadyPaid = true; return out; }
  L.rewardedGames!.push(key);
  const line = (label: string, bb: number) => { out.lines.push({ label, bb }); out.total += bb; };
  const opp = g.home === d.userTeam ? g.away : g.home;
  const playoff = g.week > 10;
  const championship = g.round === 'LCPS Bowl';
  const upset = won && isLcps(opp) && ctx.preRankThem + 4 <= ctx.preRankUs;
  line('GAME PLAYED', 50);
  if (won) line('WIN', 200);
  if (won && g.rivalry) line('RIVALRY WIN', 300);
  if (won && playoff && !championship) line('PLAYOFF WIN', 400);
  if (won && championship) line('CHAMPIONSHIP WIN', 1000);
  if (upset) line('UPSET WIN', 250);
  const ourIds = new Set(d.programs[d.userTeam].roster.map((p) => p.id));
  const our = Object.entries(r.stats).filter(([id]) => ourIds.has(id)).map(([, s]) => s);
  const sum = (f: (s: (typeof our)[number]) => number) => our.reduce((a, s) => a + f(s), 0);
  const passYds = sum((s) => s.passYds);
  const passTD = sum((s) => s.passTD);
  const rushYds = sum((s) => s.rushYds);
  const rushTD = sum((s) => s.rushTD);
  const comeback = won && r.biggestLead[them] >= 14;
  if (!ctx.simmed) {
    if (won && theirScore === 0) line('SHUTOUT', 150);
    if (passYds >= 300) line(`${fmt(passYds)} PASSING YARDS`, 100);
    if (rushYds >= 200) line(`${fmt(rushYds)} RUSHING YARDS`, 100);
    if (passTD >= 3) line(`${passTD} PASSING TD`, 75);
    if (rushTD >= 3) line(`${rushTD} RUSHING TD`, 75);
    const ourScoring = r.scoring.filter((x) => x.team === us);
    const pickSixes = our.reduce((a, s) => a + (s.ints > 0 ? Math.min(s.ints, s.retTD) : 0), 0);
    const fumbleTDs = ourScoring.filter((x) => /fumble recovered in the end zone/i.test(x.desc)).length;
    const returnTDs = sum((s) => s.retTD) - pickSixes;
    if (pickSixes + fumbleTDs > 0) line('DEFENSIVE TD', 100);
    if (returnTDs > 0) line('KICK RETURN TD', 150);
    if (comeback) line('COMEBACK WIN', 150);
    if (won && r.ot) line('OVERTIME WIN', 150);
    // Player of the game (best performer on either team is on ours)
    const score = (s: (typeof our)[number]) => s.passYds * 0.04 + s.passTD * 4 + s.rushYds * 0.1 + s.rushTD * 6 + s.recYds * 0.1 + s.recTD * 6 + s.tackles + s.sacks * 4 + s.ints * 6;
    let best = { id: '', v: -1 };
    for (const [id, s] of Object.entries(r.stats)) { const v = score(s); if (v > best.v) best = { id, v }; }
    if (ourIds.has(best.id)) {
      const p = d.programs[d.userTeam].roster.find((x) => x.id === best.id)!;
      line(`PLAYER OF THE GAME — ${p.first[0]}. ${p.last}`, 100);
    }
  } else {
    out.lines.push({ label: 'SIMULATED GAME — stat bonuses only when you play it', bb: 0 });
  }
  L.bb += out.total;
  L.lifetimeBB += out.total;
  L.gamesPlayed++;
  if (won && g.rivalry) L.rivalryWins++;
  // Beat a school → their collection becomes available
  if (won && isLcps(opp) && !L.beaten!.includes(opp)) {
    L.beaten!.push(opp);
    out.unlockedCollection = getTeam(opp).shortName;
  }
  if (!ctx.simmed) {
    // Achievements
    const wk = g.week;
    if (won) award(d, 'first-win', out, wk);
    if (passYds >= 400) award(d, 'air-it-out', out, wk);
    if (our.some((s) => s.rushYds >= 200)) award(d, 'ground-pound', out, wk);
    if (won && theirScore === 0) award(d, 'shutdown', out, wk);
    if (ourScore >= 50) award(d, 'half-century', out, wk);
    if (comeback) award(d, 'comeback-kids', out, wk);
    if (won && r.ot) award(d, 'ot-thriller', out, wk);
    if (out.lines.some((l) => l.label === 'DEFENSIVE TD')) award(d, 'pick-six', out, wk);
    if (out.lines.some((l) => l.label === 'KICK RETURN TD')) award(d, 'house-call', out, wk);
    if (won && ctx.preRankThem <= 3 && ctx.preRankUs - ctx.preRankThem >= 8) award(d, 'giant-killer', out, wk);
  }
  if (L.rivalryWins >= 5) award(d, 'rivalry-king', out, g.week);
  // Season-long checks (cheap; evaluated every game)
  seasonAchievements(d, out, g.week);
  // Theme unlocks
  if (playoff && !L.themesUnlocked.includes('playoff')) L.themesUnlocked.push('playoff');
  if (g.week >= 6 && !L.themesUnlocked.includes('pinkout')) L.themesUnlocked.push('pinkout'); // October
  // Gear drop after big wins (rare)
  if (won && !ctx.simmed) {
    const big = championship || g.rivalry || playoff || upset || theirScore === 0 || ourScore - theirScore >= 21;
    const rng = new RNG((d.year * 1000 + g.week) * 31 + ourScore * 7 + theirScore);
    if (championship || (big && rng.chance(0.22))) out.drop = rollDrop(d, rng, championship ? 2 : playoff ? 1 : 0, g.week);
  }
  return out;
}

function seasonAchievements(d: Dynasty, out: GameRewards, week: number) {
  const roster = d.programs[d.userTeam].roster;
  if (roster.some((p) => p.season.rushYds >= 1000)) award(d, 'thousand-yards', out, week);
  if (roster.reduce((a, p) => a + p.season.passYds, 0) >= 3000) award(d, 'air-raid', out, week);
  if (roster.reduce((a, p) => a + p.season.ints, 0) >= 10) award(d, 'lockdown', out, week);
  const mine = d.schedule.filter((g) => g.played && (g.home === d.userTeam || g.away === d.userTeam));
  const wins = mine.filter((g) => (g.home === d.userTeam ? g.homeScore! > g.awayScore! : g.awayScore! > g.homeScore!)).length;
  if (wins >= 10) award(d, 'ten-wins', out, week);
}

/** Called once the season ends (championships, perfect seasons, championship collection, themes). */
export function seasonEndRewards(d: Dynasty): GameRewards {
  const out: GameRewards = { lines: [], total: 0, achievements: [], unlocked: [], simmed: false };
  const L = ensureLocker(d);
  const sk = `season:${d.year}`;
  if (L.rewardedGames!.includes(sk)) { out.alreadyPaid = true; return out; }
  L.rewardedGames!.push(sk);
  const prog = d.programs[d.userTeam];
  const last = prog.history[prog.history.length - 1];
  if (last?.champion) {
    award(d, 'champions', out, 16);
    if (!L.themesUnlocked.includes('champgold')) L.themesUnlocked.push('champgold');
  }
  if (last && last.losses === 0 && last.wins >= 10) award(d, 'perfect-season', out, 16);
  const titles = prog.championships.length;
  for (const it of CATALOG) {
    if (it.unlock?.kind === 'titles' && titles >= it.unlock.count) grant(d, it.id, out.unlocked);
    if (it.unlock?.kind === 'threepeat') {
      const ys = prog.championships;
      if (ys.some((y) => ys.includes(y - 1) && ys.includes(y - 2))) grant(d, it.id, out.unlocked);
    }
  }
  return out;
}

// ---------------------------------------------------------------- gear drops

const DROP_WEIGHTS: Record<number, number[]> = { 0: [55, 30, 12, 3], 1: [40, 35, 18, 7], 2: [0, 30, 45, 25] };

export function rollDrop(d: Dynasty, rng: RNG, tier: number, week: number): { item: string; rarity: Rarity } | null {
  const L = d.locker!;
  const rarity = rng.weighted(RARITIES, DROP_WEIGHTS[tier]);
  const pool = CATALOG.filter((i) => !L.owned.includes(i.id) && (isPurchasable(i) ? !i.unlock || i.collection === d.userTeam : i.unlock?.kind === 'drop'));
  let list = pool.filter((i) => i.rarity === rarity);
  if (!list.length) list = pool;
  if (!list.length) return null;
  // Drop-exclusive legendaries are extra rare
  const item = rng.weighted(list, list.map((i) => (i.unlock?.kind === 'drop' ? 0.6 : 1)));
  grant(d, item.id);
  L.drops.push({ item: item.id, rarity: item.rarity, year: d.year, week });
  return { item: item.id, rarity: item.rarity };
}

// ---------------------------------------------------------------- featured rotation

export function featuredItems(d: Dynasty, n = 6): EquipmentItem[] {
  const rng = new RNG(d.year * 97 + d.week * 13 + (d.phase === 'playoffs' ? 500 : 0));
  const pool = CATALOG.filter((i) => itemStatus(d, i) === 'available' && i.price > 0);
  const byR = (r: Rarity) => rng.shuffle(pool.filter((i) => i.rarity === r));
  const picks = [...byR('legendary').slice(0, 1), ...byR('epic').slice(0, 2), ...byR('rare').slice(0, 2), ...byR('common').slice(0, 1)];
  return picks.slice(0, n);
}

// ---------------------------------------------------------------- fits

/** Randomize a player's fit using only owned gear. */
export function randomizeFit(d: Dynasty, p: PlayerData, seed = Date.now()) {
  p.gear = autoGear(p, (i) => owns(d, i.id), seed % 100000);
}

/** Team drip: re-dress the whole roster with owned gear, respecting positions and styles. */
export function teamDrip(d: Dynasty, seed = Date.now()) {
  for (const p of d.programs[d.userTeam].roster) randomizeFit(d, p, seed + p.number);
}

export function setTheme(d: Dynasty, t: ThemeId): boolean {
  const L = ensureLocker(d);
  if (!L.themesUnlocked.includes(t)) return false;
  L.theme = t;
  return true;
}

export const THEME_PRICE: Partial<Record<ThemeId, number>> = { throwback: 800 };

export function buyTheme(d: Dynasty, t: ThemeId): BuyResult {
  const L = ensureLocker(d);
  const price = THEME_PRICE[t];
  if (price == null) return { ok: false, need: 0, reason: 'Unlocked through play' };
  if (L.themesUnlocked.includes(t)) return { ok: false, need: 0, reason: 'Owned' };
  if (L.bb < price) return { ok: false, need: price - L.bb, reason: 'NOT ENOUGH BOWL BUCKS' };
  L.bb -= price;
  L.themesUnlocked.push(t);
  return { ok: true };
}

export const fmtBB = (n: number) => `${fmt(n)} BB`;

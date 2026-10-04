import { describe, it, expect } from 'vitest';
import { createDynasty } from '../src/dynasty/Season';
import { CATALOG, itemById, STARTER_ITEMS } from '../src/gear/catalog';
import { buyItem, ensureLocker, gameRewards, itemStatus, owns, randomizeFit, rollDrop, seasonEndRewards, gearIds, START_BB } from '../src/gear/economy';
import { autoGear, resolveLook } from '../src/gear/look';
import { HELMETS } from '../src/gear/sprite';
import { getTeam } from '../src/data/teams';
import { serialize, deserialize } from '../src/save/storage';
import { emptyStats, type PlayerData } from '../src/game/types';
import type { GameResult } from '../src/game/GameSession';
import type { GameRecord } from '../src/dynasty/types';
import { RNG } from '../src/game/rng';

const result = (home: number, away: number, statsFor: Record<string, Partial<ReturnType<typeof emptyStats>>> = {}): GameResult => ({
  home: 'riverside', away: 'heritage', homeScore: home, awayScore: away, ot: 0,
  stats: Object.fromEntries(Object.entries(statsFor).map(([k, v]) => [k, { ...emptyStats(), ...v }])),
  totals: {} as never, scoring: [], qScores: { home: [], away: [] }, biggestLead: { home: 0, away: 0 }, leadChanges: 0,
});
const game = (extra: Partial<GameRecord> = {}): GameRecord => ({ id: 'g1', week: 3, home: 'riverside', away: 'heritage', district: false, rivalry: false, played: true, weather: 'clear', ...extra });

describe('catalog', () => {
  it('has unique ids, rarity price bands and every requested category', () => {
    expect(new Set(CATALOG.map((i) => i.id)).size).toBe(CATALOG.length);
    const band = { common: [100, 300], rare: [300, 700], epic: [700, 1500], legendary: [1500, 4000] } as const;
    for (const i of CATALOG) if (i.price > 0) {
      expect(i.price, i.id).toBeGreaterThanOrEqual(band[i.rarity][0]);
      expect(i.price, i.id).toBeLessThanOrEqual(band[i.rarity][1]);
    }
    for (const c of ['helmet', 'facemask', 'visor', 'mouthguard', 'gloves', 'sleeve', 'wristband', 'armband', 'handwarmer', 'towel', 'cleats', 'socks', 'spats', 'undershirt', 'legsleeve', 'accessory']) {
      expect(CATALOG.some((i) => i.category === c), c).toBe(true);
    }
    expect(CATALOG.filter((i) => i.category === 'visor').length).toBeGreaterThanOrEqual(16);
    // Every LCPS school has a collection
    expect(new Set(CATALOG.filter((i) => i.collection && i.collection !== 'championship').map((i) => i.collection)).size).toBe(17);
  });

  it('helmet models have visibly different silhouettes', () => {
    const shapes = Object.values(HELMETS).map((h) => h.join('|'));
    expect(new Set(shapes).size).toBe(shapes.length);
    const models = new Set(CATALOG.filter((i) => i.category === 'helmet').map((i) => i.style));
    for (const m of models) expect(HELMETS[m!], m).toBeDefined();
  });
});

describe('bowl bucks and the locker', () => {
  it('a new dynasty starts with BB, the starter kit, and owned-only fits', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    const L = ensureLocker(d);
    expect(L.bb).toBe(START_BB);
    for (const id of STARTER_ITEMS) expect(owns(d, id)).toBe(true);
    for (const p of d.programs.riverside.roster) for (const id of gearIds(p.gear)) expect(owns(d, id), id).toBe(true);
  });

  it('pays game rewards (played vs simulated) and caps simmed bonuses', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    const qb = d.programs.riverside.roster.find((p) => p.pos === 'QB')!;
    const before = d.locker!.bb;
    const r = gameRewards(d, game({ rivalry: true }), result(35, 0, { [qb.id]: { passYds: 320, passTD: 3 } }), { simmed: false, preRankUs: 12, preRankThem: 3 });
    const labels = r.lines.map((l) => l.label);
    expect(labels).toEqual(expect.arrayContaining(['GAME PLAYED', 'WIN', 'RIVALRY WIN', 'UPSET WIN', 'SHUTOUT', '3 PASSING TD']));
    expect(labels.some((l) => l.includes('PASSING YARDS'))).toBe(true);
    expect(d.locker!.bb).toBe(before + r.total);
    const before2 = d.locker!.bb;
    const sim = gameRewards(d, game({ id: 'g2' }), result(21, 14), { simmed: true, preRankUs: 5, preRankThem: 9 });
    expect(sim.total).toBe(250);
    expect(d.locker!.bb).toBe(before2 + 250);
    const loss = gameRewards(d, game({ id: 'g3' }), result(7, 28), { simmed: false, preRankUs: 5, preRankThem: 9 });
    expect(loss.total).toBeLessThanOrEqual(150);
  });

  it('economy: a typical win pays 250–700 BB so legendary gear takes several games', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    const r = gameRewards(d, game(), result(24, 17), { simmed: false, preRankUs: 8, preRankThem: 9 });
    expect(r.total).toBeGreaterThanOrEqual(250);
    expect(r.total).toBeLessThanOrEqual(700);
    const legendary = CATALOG.filter((i) => i.rarity === 'legendary' && i.price > 0).map((i) => i.price);
    expect(Math.min(...legendary)).toBeGreaterThan(r.total * 2);
  });

  it('buys, rejects when broke (reporting the shortfall), and never buys locked trophy gear', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    d.locker!.bb = 500;
    const r1 = buyItem(d, 'visor-darksmoke');
    expect(r1).toEqual({ ok: false, need: 300, reason: 'NOT ENOUGH BOWL BUCKS' });
    expect(buyItem(d, 'gloves-team').ok).toBe(true);
    expect(d.locker!.bb).toBe(100);
    expect(owns(d, 'gloves-team')).toBe(true);
    expect(itemStatus(d, itemById('gloves-team')!)).toBe('owned');
    d.locker!.bb = 99999;
    expect(buyItem(d, 'cleats-champgold').ok).toBe(false);
    expect(buyItem(d, 'riverside-gloves').ok).toBe(true); // own school collection is open
    expect(buyItem(d, 'stone-bridge-gloves').ok).toBe(false); // must beat Stone Bridge first
    d.locker!.beaten!.push('stone-bridge');
    expect(buyItem(d, 'stone-bridge-gloves').ok).toBe(true);
  });

  it('randomize fit only uses owned gear', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    d.locker!.bb = 99999;
    for (const id of ['visor-gold', 'gloves-flame', 'sleeve-white', 'cleats-goldrush']) buyItem(d, id);
    for (const p of d.programs.riverside.roster) {
      randomizeFit(d, p, 3);
      for (const id of gearIds(p.gear)) expect(owns(d, id), id).toBe(true);
    }
  });

  it('achievements unlock trophy gear; championships unlock the championship collection', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    const qb = d.programs.riverside.roster.find((p) => p.pos === 'QB')!;
    const r = gameRewards(d, game(), result(42, 10, { [qb.id]: { passYds: 410 } }), { simmed: false, preRankUs: 5, preRankThem: 6 });
    expect(r.achievements.map((a) => a.id)).toContain('air-it-out');
    expect(owns(d, 'gloves-airraid')).toBe(true);
    d.programs.riverside.championships = [2026];
    d.programs.riverside.history.push({ year: 2026, wins: 14, losses: 0, districtWins: 6, districtLosses: 0, pf: 400, pa: 100, finalRank: 1, playoff: 'Champion', champion: true });
    const s = seasonEndRewards(d);
    expect(owns(d, 'cleats-champgold')).toBe(true);
    expect(owns(d, 'gloves-championship')).toBe(true);
    expect(owns(d, 'cleats-perfect')).toBe(true);
    expect(s.achievements.map((a) => a.id)).toEqual(expect.arrayContaining(['champions', 'perfect-season']));
    expect(d.locker!.themesUnlocked).toContain('champgold');
  });

  it('gear drops grant an unowned item and are recorded', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    const n = d.locker!.owned.length;
    const drop = rollDrop(d, new RNG(1), 2, 4)!;
    expect(drop).toBeTruthy();
    expect(owns(d, drop.item)).toBe(true);
    expect(d.locker!.owned.length).toBe(n + 1);
    expect(d.locker!.drops.length).toBe(1);
  });

  it('gear and locker survive a save round-trip', () => {
    const d = createDynasty('riverside', 'T', 1, 5);
    d.locker!.bb = 5000;
    buyItem(d, 'visor-gold');
    const p = d.programs.riverside.roster[0];
    p.gear!.visor = 'visor-gold';
    d.locker!.favorites.push('visor-gold');
    d.locker!.theme = 'blackout';
    const back = deserialize<typeof d>(serialize(d));
    expect(back.locker).toEqual(d.locker);
    expect(back.programs.riverside.roster[0].gear).toEqual(p.gear);
  });
});

describe('looks', () => {
  const p = { id: 'x1', pos: 'WR', weight: 190, number: 1 } as PlayerData;
  it('helmet shells adapt to the school instead of the shop preview color', () => {
    const g = { helmet: 'helm-flex', facemask: 'mask-skill', shellColor: 'primary' as const };
    const riv = resolveLook(p, getTeam('riverside'), true, 'none', g);
    const bw = resolveLook(p, getTeam('briar-woods'), true, 'none', g);
    expect(riv.helmet.model).toBe('flex');
    expect(riv.helmet.shell).toBe(getTeam('riverside').colors.primary);
    expect(bw.helmet.shell).toBe(getTeam('briar-woods').colors.primary);
    const team = resolveLook(p, getTeam('riverside'), true, 'none', { gloves: 'gloves-team' });
    expect(team.arms.R.glove![0]).toBe(getTeam('riverside').colors.primary);
  });

  it('equipped gear changes the rendered look (visor, sleeves, spats, cleats)', () => {
    const t = getTeam('riverside');
    const base = resolveLook(p, t, true, 'none', { helmet: 'helm-standard', cleats: 'cleats-classic-black' });
    const drip = resolveLook(p, t, true, 'none', { helmet: 'helm-standard', visor: 'visor-darksmoke', gloves: 'gloves-pink', leftArm: ['sleeve-white'], spats: 'spats-white', cleats: 'cleats-goldrush' });
    expect(base.visor).toBeUndefined();
    expect(drip.visor).toEqual(['#3a3f4a']);
    expect(drip.arms.L.sleeve?.colors[0]).toBe('#f4f4f4');
    expect(drip.spats?.level).toBe(4);
    expect(drip.cleats.colors[0]).toBe('#e8b923');
  });

  it('team themes recolor accessories', () => {
    const t = getTeam('riverside');
    const g = { gloves: 'gloves-white', cleats: 'cleats-classic-white', socks: 'socks-white' };
    expect(resolveLook(p, t, true, 'blackout', g).arms.R.glove).toEqual(['#1b1b1f']);
    expect(resolveLook(p, t, true, 'champgold', g).cleats.colors[0]).toBe('#e8b923');
  });

  it('auto drip follows position tendencies (OL big masks, QB wrist coach/towel often)', () => {
    let olCage = 0;
    let qbTowel = 0;
    for (let i = 0; i < 60; i++) {
      const ol = autoGear({ id: `ol${i}`, pos: 'OL', weight: 290 } as PlayerData, () => true);
      if (['mask-ol', 'mask-cage', 'mask-dl'].includes(ol.facemask!)) olCage++;
      const qb = autoGear({ id: `qb${i}`, pos: 'QB', weight: 200 } as PlayerData, () => true);
      if (qb.towel) qbTowel++;
    }
    expect(olCage).toBeGreaterThan(50);
    expect(qbTowel).toBeGreaterThan(30);
  });
});

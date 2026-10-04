/**
 * Look resolution: PlayerGear + school colors + team theme → a concrete Look the sprite renderer draws.
 * Also generates believable automatic "drip" for AI players based on position and STYLE personality.
 */
import type { PlayerData, Position, TeamInfo } from '../game/types';
import { RNG } from '../game/rng';
import { CATALOG, C, itemById } from './catalog';
import type { ArmLook, EquipmentCategory, EquipmentItem, Look, PlayerGear, PlayerStyle, ThemeId } from './types';
import { shade, skinFor } from '../game/render/sprites';
import { buildFor } from './rig/spec';

export const THEMES: { id: ThemeId; name: string; desc: string }[] = [
  { id: 'none', name: 'INDIVIDUAL', desc: 'Every player wears his own fit.' },
  { id: 'blackout', name: 'BLACKOUT', desc: 'All accessories go black. Dark visors.' },
  { id: 'whiteout', name: 'WHITEOUT', desc: 'All accessories go white.' },
  { id: 'pinkout', name: 'PINK OUT', desc: 'Pink gloves, socks, bands and towels.' },
  { id: 'throwback', name: 'THROWBACK', desc: 'No visors or sleeves, striped socks, classic black cleats.' },
  { id: 'playoff', name: 'PLAYOFF MODE', desc: 'School secondary accents with gold cleat trim.' },
  { id: 'champgold', name: 'CHAMPIONSHIP GOLD', desc: 'Gold gloves, cleats, bands and masks.' },
];

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export function styleFor(p: PlayerData): PlayerStyle {
  if (p.style) return p.style as PlayerStyle;
  const r = new RNG(hash(p.id + 'style'));
  const w: Record<Position, number[]> = {
    // TRADITIONAL, CLEAN, FLASHY, OLD SCHOOL, SWAGGER
    QB: [3, 4, 2, 1, 1], RB: [1, 2, 4, 1, 3], WR: [1, 2, 5, 0.5, 4], TE: [3, 2, 2, 2, 1], OL: [4, 2, 1, 4, 0.5],
    DL: [3, 1, 2, 3, 2], LB: [3, 1, 2, 4, 2], CB: [1, 2, 5, 0.5, 4], S: [2, 2, 4, 1, 3], K: [4, 4, 1, 1, 0.5],
  };
  return r.weighted(['TRADITIONAL', 'CLEAN', 'FLASHY', 'OLD SCHOOL', 'SWAGGER'] as PlayerStyle[], w[p.pos]);
}

/** Auto-generate a fit from the allowed item pool. */
export function autoGear(p: PlayerData, allowed: (i: EquipmentItem) => boolean, seed = 0): PlayerGear {
  const rng = new RNG(hash(p.id) + seed * 7919);
  const style = styleFor(p);
  const pos = p.pos;
  const pool = (cat: EquipmentCategory, pred: (i: EquipmentItem) => boolean = () => true) => CATALOG.filter((i) => i.category === cat && allowed(i) && pred(i));
  const flashy = style === 'FLASHY' || style === 'SWAGGER';
  const old = style === 'OLD SCHOOL';
  const pickWeighted = (list: EquipmentItem[]) => {
    if (!list.length) return undefined;
    const w = list.map((i) => {
      const r = { common: 4, rare: 2.5, epic: 1.2, legendary: 0.4 }[i.rarity];
      return flashy ? (i.rarity === 'common' ? 1 : r * 1.4) : style === 'CLEAN' || style === 'TRADITIONAL' ? (i.rarity === 'common' ? r * 1.5 : r * 0.7) : r;
    });
    return rng.weighted(list, w).id;
  };
  const chance = (base: number) => rng.chance(Math.max(0, Math.min(1, base)));
  const g: PlayerGear = { stripe: !old || rng.chance(0.5), logo: true, gloveSide: 'both', leftArm: [], rightArm: [] };
  // Helmet, pads & mask (the four exact shop helmets / pads, or team-issued)
  const helmets = pool('helmet');
  const big = pos === 'OL' || pos === 'DL';
  const helmBias: Record<string, number> = big ? { zero2trench: 4, speedflex: 2, f7: 2, zero2: 1, standard: 3 } : old ? { standard: 6, speedflex: 1, f7: 1, zero2: 1, zero2trench: 0.2 } : { speedflex: 3, f7: 3, zero2: 2, zero2trench: 0.5, standard: 3 };
  g.helmet = helmets.length ? rng.weighted(helmets, helmets.map((i) => helmBias[i.style ?? 'standard'] ?? 1)).id : undefined;
  const pads = pool('pads');
  const padBias: Record<string, number> = big ? { battle: 3, elite: 2, twoinone: 1, xflex: 1, standard: 3 } : pos === 'QB' || pos === 'WR' || pos === 'CB' || pos === 'K' ? { xflex: 3, twoinone: 2, elite: 1, battle: 0.5, standard: 3 } : { battle: 2, elite: 2, xflex: 2, twoinone: 1, standard: 3 };
  g.pads = pads.length ? rng.weighted(pads, pads.map((i) => padBias[i.style ?? 'standard'] ?? 1)).id : undefined;
  g.finish = pickWeighted(pool('finish', (i) => (flashy ? true : i.style !== 'chrome')));
  if (!flashy || chance(0.6)) g.finish = pool('finish').find((i) => i.style === 'gloss')?.id ?? g.finish;
  const maskStyle: Record<Position, string[]> = {
    QB: ['qb', 'skill'], RB: ['rb', 'skill'], WR: ['skill', 'qb'], TE: ['lb', 'rb'], OL: ['cage', 'bigcage', 'dl'], DL: ['dl', 'cage', 'aggressive'],
    LB: ['lb', 'aggressive', 'rb'], CB: ['skill', 'qb'], S: ['skill', 'rb'], K: ['kicker', 'qb'],
  };
  const wantMask = old && (pos === 'K' || pos === 'QB' || pos === 'LB') ? ['oldschool', ...maskStyle[pos]] : maskStyle[pos];
  const masks = pool('facemask', (i) => !['#e8b923', '#c0c6cf'].includes(i.colors[0] ?? ''));
  g.facemask = wantMask.map((s) => masks.find((m) => m.style === s)).find(Boolean)?.id ?? masks[0]?.id;
  if (flashy && chance(0.12)) g.facemask = pickWeighted(pool('facemask', (i) => i.colors.length > 0)) ?? g.facemask;
  g.maskColor = 'default';
  // Visor
  const visorP: Record<Position, number> = { QB: 0.3, RB: 0.5, WR: 0.55, TE: 0.3, OL: 0.12, DL: 0.3, LB: 0.5, CB: 0.55, S: 0.5, K: 0.1 };
  if (chance(visorP[pos] + (flashy ? 0.3 : 0) - (old ? 0.4 : 0) - (style === 'TRADITIONAL' ? 0.15 : 0))) {
    const v = pool('visor', (i) => (flashy ? true : ['visor-clear', 'visor-lightsmoke', 'visor-darksmoke', 'visor-black'].includes(i.id) || i.rarity === 'common'));
    g.visor = pickWeighted(v);
  }
  // Mouthguard
  if (chance(0.85)) g.mouthguard = pickWeighted(pool('mouthguard', (i) => (style === 'SWAGGER' ? true : i.style !== 'lip' || chance(0.3))));
  // Gloves
  const gloveP: Record<Position, number> = { QB: 0.35, RB: 0.95, WR: 0.98, TE: 0.9, OL: 0.7, DL: 0.75, LB: 0.85, CB: 0.95, S: 0.9, K: 0.1 };
  if (chance(gloveP[pos])) {
    g.gloves = pickWeighted(pool('gloves', (i) => (flashy ? true : i.rarity === 'common' || i.colors.includes('primary') || chance(0.25))));
    if (pos === 'QB') g.gloveSide = chance(0.7) ? 'left' : 'both';
  }
  // Arms
  const sleeves = pool('sleeve', (i) => (pos === 'OL' || pos === 'DL' ? true : i.style !== 'padded'));
  const bands = pool('armband');
  const wrists = pool('wristband', (i) => i.style !== 'coach');
  const braces = pool('accessory', (i) => i.style === 'brace');
  const addArm = (side: 'leftArm' | 'rightArm', id?: string) => { if (id) g[side]!.push(id); };
  if (pos === 'QB') {
    if (chance(0.55)) addArm('rightArm', pickWeighted(sleeves.filter((s) => s.style !== 'padded')));
    if (chance(0.75)) addArm('leftArm', pool('wristband', (i) => i.style === 'coach')[0]?.id);
  } else if (pos === 'OL' || pos === 'DL') {
    if (chance(0.6)) { const b = pickWeighted(braces); addArm('leftArm', b); addArm('rightArm', b); }
    if (chance(0.3)) { const s = pickWeighted(sleeves); addArm('leftArm', s); addArm('rightArm', s); }
  } else {
    const sp = (pos === 'WR' || pos === 'CB' || pos === 'RB' || pos === 'S' ? 0.55 : 0.3) + (flashy ? 0.3 : 0) - (old ? 0.4 : 0);
    if (chance(sp)) {
      const s = pickWeighted(sleeves);
      const both = chance(flashy ? 0.6 : 0.35);
      if (both) { addArm('leftArm', s); addArm('rightArm', s); } else addArm(chance(0.5) ? 'leftArm' : 'rightArm', s);
    }
  }
  if (chance(pos === 'LB' ? 0.6 : 0.25)) { const b = pickWeighted(bands); addArm('leftArm', b); if (chance(0.6)) addArm('rightArm', b); }
  if (chance(0.45)) { const w = pickWeighted(wrists); addArm('leftArm', w); if (chance(0.7)) addArm('rightArm', w); }
  // Towel
  const towelP: Record<Position, number> = { QB: 0.75, RB: 0.4, WR: 0.45, TE: 0.25, OL: 0.25, DL: 0.25, LB: 0.25, CB: 0.35, S: 0.3, K: 0.3 };
  if (chance(towelP[pos] + (flashy ? 0.15 : 0))) {
    g.towel = pickWeighted(pool('towel'));
    g.towelPos = pos === 'QB' ? 'front' : pos === 'OL' ? 'back' : rng.pick(['front', 'left', 'right', 'back']);
  }
  // Legs
  const spP: Record<Position, number> = { QB: 0.4, RB: 0.65, WR: 0.6, TE: 0.4, OL: 0.6, DL: 0.5, LB: 0.5, CB: 0.6, S: 0.5, K: 0.3 };
  if (chance(spP[pos] + (flashy ? 0.2 : 0))) {
    g.spats = old ? pool('spats', (i) => i.id === 'tape-heavy' || i.id === 'tape-medium' || i.id === 'tape-low')[0]?.id : pickWeighted(pool('spats', (i) => (pos === 'OL' ? Number(i.style) <= 3 : flashy || Number(i.style) <= 2 || chance(0.3))));
  }
  if (flashy && chance(0.25)) g.legsleeve = pickWeighted(pool('legsleeve'));
  g.socks = pickWeighted(pool('socks', (i) => (flashy ? true : i.rarity === 'common')));
  const cleatPool = pool('cleats', (i) => {
    if (big) return ['high', 'classic', 'mid'].includes(i.style ?? '') || (flashy && chance(0.3));
    if (old) return ['classic', 'retro', 'high'].includes(i.style ?? '');
    return flashy ? true : i.rarity !== 'legendary';
  });
  g.cleats = pickWeighted(cleatPool) ?? pickWeighted(pool('cleats'));
  if (chance(0.25)) g.undershirt = pickWeighted(pool('undershirt'));
  if (old && (pos === 'LB' || pos === 'DL' || pos === 'S') && chance(0.6)) g.accessory = pool('accessory', (i) => i.style === 'neckroll')[0]?.id;
  else if ((style === 'SWAGGER' || pos === 'RB') && chance(0.35)) g.accessory = pool('accessory', (i) => i.style === 'eyeblack')[0]?.id;
  else if ((pos === 'RB' || pos === 'LB') && chance(0.15)) g.accessory = pool('accessory', (i) => i.style === 'backplate')[0]?.id;
  if (chance(0.12)) g.handwarmer = pickWeighted(pool('handwarmer'));
  return g;
}

/** Gear for players that don't have stored gear (CPU teams / exhibition): full catalog minus unlock-only. */
const autoCache = new Map<string, PlayerGear>();
export function gearFor(p: PlayerData, teamId?: string): PlayerGear {
  if (p.gear) return p.gear;
  const k = p.id;
  let g = autoCache.get(k);
  if (!g) {
    g = autoGear(p, (i) => !i.unlock || (i.unlock.kind === 'beat' && i.collection === teamId));
    autoCache.set(k, g);
    if (autoCache.size > 4000) autoCache.clear();
  }
  return g;
}

// ---------------------------------------------------------------- resolution

const TORSO: Record<Position, number> = { QB: 7, RB: 7, WR: 6, TE: 8, OL: 9, DL: 8, LB: 8, CB: 6, S: 7, K: 6 };

function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (s: number) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
  return `#${((1 << 24) | (ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).slice(1)}`;
}

const lookCache = new Map<string, Look>();

export function resolveLook(p: PlayerData, team: TeamInfo, home: boolean, theme: ThemeId = 'none', gearOverride?: PlayerGear): Look {
  const gear = gearOverride ?? gearFor(p, team.id);
  const key = `${p.id}|${team.id}|${home ? 1 : 0}|${theme}|${JSON.stringify(gear)}`;
  const hit = lookCache.get(key);
  if (hit) return hit;
  const tok = (c: string) => (c === 'primary' ? team.colors.primary : c === 'secondary' ? team.colors.secondary : c);
  const cols = (id?: string) => (itemById(id)?.colors ?? []).map(tok);
  const u = home ? team.uniforms.home : team.uniforms.away;
  // Theme recolor for accessories
  const T = (c: string[], role: 'acc' | 'cleat' | 'sock' | 'glove' | 'mask'): string[] => {
    switch (theme) {
      case 'blackout': return role === 'cleat' ? [C.black, C.black] : [C.black];
      case 'whiteout': return role === 'cleat' ? [C.white, C.white] : [C.white];
      case 'pinkout': return role === 'cleat' ? [c[0] ?? C.black, C.pink] : role === 'mask' ? c : [C.pink];
      case 'playoff': return role === 'cleat' ? [c[0] ?? C.black, C.gold] : role === 'mask' ? c : [team.colors.secondary];
      case 'champgold': return role === 'cleat' ? [C.gold, C.white] : [C.gold];
      case 'throwback': return role === 'cleat' ? [C.black, C.white] : role === 'sock' ? [C.white, team.colors.primary] : c;
      default: return c;
    }
  };
  const helmItem = itemById(gear.helmet) ?? itemById('helm-standard')!;
  const shellBase = gear.shellColor === 'white' ? C.white : gear.shellColor === 'black' ? C.black : gear.shellColor === 'secondary' ? team.colors.secondary : gear.shellColor === 'primary' ? team.colors.primary : team.helmetStyle.shell;
  const finish = itemById(gear.finish)?.style ?? 'gloss';
  let shell = shellBase;
  if (finish === 'goat') shell = '#e8b923';
  let shadeC = shade(shellBase, -0.18);
  let hi = shade(shellBase, 0.22);
  if (finish === 'matte') { shadeC = shade(shellBase, -0.1); hi = shellBase; }
  if (finish === 'metallic') { hi = shade(shellBase, 0.38); shadeC = shade(shellBase, -0.25); }
  if (finish === 'pearl') { shell = mix(shellBase, '#ffffff', 0.18); hi = '#ffffff'; shadeC = mix(shellBase, '#c9d1e6', 0.3); }
  if (finish === 'chrome') { shell = mix(shellBase, '#dfe6ef', 0.55); hi = '#ffffff'; shadeC = mix(shellBase, '#55606f', 0.5); }
  if (finish === 'goat') { hi = '#fff3b0'; shadeC = '#a8790f'; }
  const stripeC = finish === 'threepeat' ? '#e8b923' : helmItem.colors[0] ? tok(helmItem.colors[0]) : team.helmetStyle.stripe;
  const maskItem = itemById(gear.facemask) ?? itemById('mask-skill')!;
  let maskColor = maskItem.colors[0] ? tok(maskItem.colors[0]) : team.helmetStyle.facemask;
  const mc = gear.maskColor ?? 'default';
  if (mc === 'gray') maskColor = C.gray; else if (mc === 'white') maskColor = C.white; else if (mc === 'black') maskColor = C.black;
  else if (mc === 'primary') maskColor = team.colors.primary; else if (mc === 'secondary') maskColor = team.colors.secondary;
  if (theme === 'blackout') maskColor = C.black; else if (theme === 'whiteout') maskColor = C.white; else if (theme === 'champgold') maskColor = C.gold; else if (theme === 'throwback') maskColor = C.gray;
  let visor = gear.visor ? cols(gear.visor) : undefined;
  if (theme === 'blackout' && visor) visor = ['#3a3f4a'];
  if (theme === 'throwback') visor = undefined;
  const mgItem = itemById(gear.mouthguard);
  const arm = (ids: string[] = []): ArmLook => {
    const a: ArmLook = {};
    for (const id of ids) {
      const it = itemById(id);
      if (!it) continue;
      if (it.category === 'sleeve' && theme !== 'throwback') a.sleeve = { colors: T(cols(id), 'acc'), len: it.style === 'half' ? 'half' : 'full', padded: it.style === 'padded' };
      else if (it.category === 'armband') a.band = T(cols(id), 'acc');
      else if (it.category === 'wristband') { if (it.style === 'coach') a.wristCoach = true; else a.wrist = T(cols(id), 'acc'); }
      else if (it.category === 'accessory' && it.style === 'brace') a.brace = T(cols(id), 'acc')[0];
    }
    return a;
  };
  const arms = { L: arm(gear.leftArm), R: arm(gear.rightArm) };
  if (gear.gloves) {
    const gc = T(cols(gear.gloves), 'glove');
    const side = gear.gloveSide ?? 'both';
    if (side !== 'right') arms.L.glove = gc;
    if (side !== 'left') arms.R.glove = gc;
  }
  const acc = itemById(gear.accessory);
  const under = itemById(gear.undershirt);
  if (under?.style === 'long') {
    for (const s of [arms.L, arms.R]) if (!s.sleeve) s.sleeve = { colors: cols(gear.undershirt), len: 'full', padded: false };
  }
  const cleatItem = itemById(gear.cleats) ?? itemById('cleats-classic-black')!;
  const spatItem = itemById(gear.spats);
  const look: Look = {
    skin: skinFor(p.id),
    jersey: u.jersey,
    jerseyShade: shade(u.jersey, -0.16),
    numbers: u.numbers,
    pants: u.pants,
    pantsShade: shade(u.pants, -0.18),
    torso: TORSO[p.pos] + (p.weight > 270 ? 1 : 0),
    pads: itemById(gear.pads)?.style ?? 'standard',
    teamId: team.id,
    build: buildFor(p.pos ?? 'WR'),
    number: p.number,
    helmet: { model: helmItem.style ?? 'standard', shell, shade: shadeC, hi, stripe: gear.stripe === false ? undefined : stripeC, logo: gear.logo === false ? undefined : team.colors.secondary === shell ? team.colors.primary : team.colors.secondary, finish },
    mask: { style: maskItem.style ?? 'skill', color: maskColor },
    visor,
    mouthguard: mgItem ? { color: tok(mgItem.colors[0]), style: mgItem.style ?? 'standard', hang: mgItem.style === 'strapped' } : undefined,
    undershirt: under ? cols(gear.undershirt) : undefined,
    neckRoll: acc?.style === 'neckroll' ? tok(acc.colors[0]) : undefined,
    backPlate: acc?.style === 'backplate' ? tok(acc.colors[0]) : undefined,
    eyeBlack: acc?.style === 'eyeblack',
    arms,
    towel: gear.towel ? { pos: gear.towelPos ?? 'front', colors: T(cols(gear.towel), 'acc') } : undefined,
    handwarmer: gear.handwarmer ? T(cols(gear.handwarmer), 'acc') : undefined,
    legsleeve: gear.legsleeve ? T(cols(gear.legsleeve), 'acc') : undefined,
    socks: T(gear.socks ? cols(gear.socks) : [C.white], 'sock'),
    spats: spatItem ? { level: Number(spatItem.style ?? 1), colors: T(cols(gear.spats), 'acc') } : undefined,
    cleats: { colors: T(cleatItem.colors.map(tok), 'cleat'), style: theme === 'throwback' ? 'classic' : cleatItem.style ?? 'classic' },
  };
  lookCache.set(key, look);
  if (lookCache.size > 3000) lookCache.clear();
  return look;
}

/** Generic look for non-roster figures (bench, kick animations). */
export function genericLook(team: TeamInfo, home: boolean, seed: string, pos: Position = 'WR'): Look {
  const fake = { id: seed, pos, weight: 200 } as PlayerData;
  return resolveLook(fake, team, home, 'none');
}

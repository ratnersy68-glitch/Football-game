import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dynasty } from '../../dynasty/types';
import { getTeam, LCPS_TEAMS } from '../../data/teams';
import { CATALOG, CATEGORY_LABEL, RARITY_COLOR, itemById, inShop } from '../catalog';
import type { EquipmentCategory, EquipmentItem, Rarity, ThemeId } from '../types';
import { ACHIEVEMENTS, buyItem, buyTheme, ensureLocker, equippedCount, featuredItems, fmtBB, itemStatus, setTheme, THEME_PRICE, toggleFavorite, checkPassiveAchievements, gearIds } from '../economy';
import { THEMES } from '../look';
import { ItemThumb, PlayerPreview } from './Preview';
import { GearEditor } from './GearEditor';
import { Btn, TeamLogo } from '../../components/common';
import { Sound } from '../../game/audio/Sound';
import { drawGearedPlayer } from '../sprite';
import { genericLook, resolveLook } from '../look';
import type { PlayerData, Position } from '../../game/types';
import { ovr } from '../../game/players';
import { mannequinGear, ProductImage } from './Preview';

export function BBBadge({ bb, big }: { bb: number; big?: boolean }) {
  return <span className={`bb-badge ${big ? 'big' : ''}`}><span className="coin">🪙</span> {bb.toLocaleString('en-US')} BB</span>;
}

type Section = 'shop' | 'gear' | 'customize' | 'collection' | 'themes';
type ShopTab = 'FEATURED' | 'HELMETS' | 'SHOULDER PADS' | 'FINISHES' | 'FACEMASKS' | 'VISORS' | 'MOUTHGUARDS' | 'GLOVES' | 'ARMS' | 'CLEATS' | 'SOCKS' | 'SPATS / TAPE' | 'TOWELS' | 'UNDERSHIRTS' | 'LEG SLEEVES' | 'ACCESSORIES' | 'SCHOOL COLLECTIONS';
const TAB_CATS: Record<ShopTab, EquipmentCategory[]> = {
  FEATURED: [], HELMETS: ['helmet'], 'SHOULDER PADS': ['pads'], FINISHES: ['finish'], FACEMASKS: ['facemask'], VISORS: ['visor'], MOUTHGUARDS: ['mouthguard'], GLOVES: ['gloves'],
  ARMS: ['sleeve', 'wristband', 'armband', 'handwarmer'], CLEATS: ['cleats'], SOCKS: ['socks'], 'SPATS / TAPE': ['spats'], TOWELS: ['towel'],
  UNDERSHIRTS: ['undershirt'], 'LEG SLEEVES': ['legsleeve'], ACCESSORIES: ['accessory'], 'SCHOOL COLLECTIONS': [],
};
type Filter = 'ALL' | 'OWNED' | 'LOCKED' | 'FAVORITES' | Rarity;

const RARITY_ICON: Record<Rarity, string> = { common: '◆', rare: '⚡', epic: '🔥', legendary: '⭐' };

export function LockerScreen({ d, onChange, initial = 'shop', focusPlayer }: { d: Dynasty; onChange: () => void; initial?: Section; focusPlayer?: PlayerData }) {
  const L = ensureLocker(d);
  const [section, setSection] = useState<Section>(focusPlayer ? 'customize' : initial);
  const [, force] = useState(0);
  const changed = () => { force((x) => x + 1); onChange(); };
  useEffect(() => { if (L.newItems.length) { const t = setTimeout(() => { L.newItems = []; }, 4000); return () => clearTimeout(t); } }, []);
  return (
    <div className="locker">
      <div className="locker-head">
        <LockerRoom d={d} />
        <div className="locker-title">
          <div className="pixel locker-name">LCPS LOCKER</div>
          <div className="dim small">{getTeam(d.userTeam).shortName} {getTeam(d.userTeam).mascot} · earn Bowl Bucks by playing — gear is cosmetic only</div>
        </div>
        <BBBadge bb={L.bb} big />
      </div>
      <nav className="locker-nav">
        {([['shop', 'SHOP'], ['gear', 'MY GEAR'], ['customize', 'CUSTOMIZE PLAYER'], ['collection', 'COLLECTION'], ['themes', 'TEAM THEMES']] as [Section, string][]).map(([id, label]) => (
          <button key={id} className={`locker-tab pixel ${section === id ? 'on' : ''}`} onClick={() => { setSection(id); Sound.play('menu'); }}>{label}</button>
        ))}
      </nav>
      {section === 'shop' && <Shop d={d} onChange={changed} />}
      {section === 'gear' && <MyGear d={d} onChange={changed} />}
      {section === 'customize' && <CustomizePlayer d={d} onChange={changed} initial={focusPlayer} />}
      {section === 'collection' && <Collection d={d} />}
      {section === 'themes' && <Themes d={d} onChange={changed} />}
    </div>
  );
}

// ---------------------------------------------------------------- locker room scene

function LockerRoom({ d }: { d: Dynasty }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const team = getTeam(d.userTeam);
    const W = cv.width;
    const H = cv.height;
    let raf = 0;
    const t0 = performance.now();
    const mann = (id: string) => ({ id, pos: 'WR' as Position, weight: 200, number: 1 }) as PlayerData;
    const owned = d.locker!.owned;
    const pick = (cat: EquipmentCategory, fallback: string) => [...owned].reverse().find((id) => itemById(id)?.category === cat) ?? fallback;
    const showcase = { helmet: pick('helmet', 'helm-standard'), visor: pick('visor', ''), gloves: pick('gloves', ''), cleats: pick('cleats', 'cleats-classic-black'), sleeve: pick('sleeve', '') };
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      // Wall + floor
      ctx.fillStyle = '#2a2f45';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#5a4630';
      ctx.fillRect(0, H - 14, W, 14);
      for (let x = 0; x < W; x += 8) { ctx.fillStyle = (x / 8) % 2 ? '#4f3d29' : '#5a4630'; ctx.fillRect(x, H - 14, 8, 14); }
      // Lockers
      const lw = 30;
      for (let i = 0; i < Math.ceil(W / lw); i++) {
        const x = i * lw + 2;
        ctx.fillStyle = team.colors.primary;
        ctx.fillRect(x, 6, lw - 4, H - 22);
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(x + lw - 6, 6, 2, H - 22);
        for (let v = 0; v < 4; v++) { ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.fillRect(x + 6, 10 + v * 3, lw - 16, 1); }
        ctx.fillStyle = team.colors.secondary;
        ctx.fillRect(x + 4, 28, 3, 2);
        // Name plates
        ctx.fillStyle = '#d9d2bf';
        ctx.fillRect(x + 3, H - 30, lw - 10, 4);
      }
      // Bench
      ctx.fillStyle = '#8a6a43';
      ctx.fillRect(10, H - 22, W - 20, 4);
      ctx.fillStyle = '#5c4529';
      for (let x = 20; x < W - 20; x += 60) ctx.fillRect(x, H - 18, 3, 6);
      // Hanging jersey
      const jx = Math.round(W * 0.18);
      ctx.fillStyle = team.uniforms.home.jersey;
      ctx.fillRect(jx - 9, 14, 18, 16);
      ctx.fillRect(jx - 13, 14, 4, 7);
      ctx.fillRect(jx + 9, 14, 4, 7);
      ctx.fillStyle = team.uniforms.home.numbers;
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('1', jx - 3, 27);
      ctx.fillStyle = '#ccc';
      ctx.fillRect(jx - 1, 10, 2, 4);
      // Mannequin showcase (top items you own)
      const g = mannequinGear(itemById(showcase.helmet)!);
      g.helmet = showcase.helmet;
      if (showcase.visor) g.visor = showcase.visor;
      if (showcase.gloves) g.gloves = showcase.gloves;
      g.cleats = showcase.cleats;
      if (showcase.sleeve) g.rightArm = [showcase.sleeve];
      const look = resolveLook(mann('locker-mannequin'), team, true, d.locker!.theme, g);
      drawGearedPlayer(ctx, Math.round(W * 0.5), H - 12, look, 1, 'stand', 0, 3);
      // A teammate getting dressed
      const look2 = genericLook(team, true, 'locker-teammate', 'LB');
      drawGearedPlayer(ctx, Math.round(W * 0.78), H - 12, look2, -1, Math.floor(t * 1.2) % 4 === 0 ? 'celebrate' : 'stand', 0, 3);
      // Helmets on shelf
      ctx.fillStyle = '#3d2f1f';
      ctx.fillRect(Math.round(W * 0.3), 34, 60, 3);
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, W, 34);
      ctx.clip();
      for (let k = 0; k < 3; k++) {
        const hl = genericLook(team, true, `shelf-${k}`, 'WR');
        drawGearedPlayer(ctx, Math.round(W * 0.3) + 10 + k * 20, 34 + 20 * 3, hl, 1, 'stand', 0, 3);
      }
      ctx.restore();
      // Cleats on floor
      ctx.fillStyle = '#111';
      ctx.fillRect(Math.round(W * 0.88), H - 10, 8, 3);
      ctx.fillRect(Math.round(W * 0.88) + 10, H - 10, 8, 3);
      ctx.fillStyle = '#fff';
      ctx.fillRect(Math.round(W * 0.88) + 1, H - 9, 6, 1);
      // Light flicker
      ctx.fillStyle = `rgba(255,240,200,${0.05 + 0.02 * Math.sin(t * 3)})`;
      ctx.fillRect(0, 0, W, H);
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [d, d.locker?.owned.length, d.locker?.theme]);
  return <canvas ref={ref} width={420} height={110} className="locker-room" />;
}

// ---------------------------------------------------------------- shop

function Shop({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const [tab, setTab] = useState<ShopTab>('FEATURED');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [school, setSchool] = useState(d.userTeam);
  const [detail, setDetail] = useState<EquipmentItem | null>(null);
  const L = d.locker!;
  const featured = featuredItems(d);
  let items: EquipmentItem[] = tab === 'FEATURED' ? featured : tab === 'SCHOOL COLLECTIONS' ? CATALOG.filter((i) => i.collection === school) : CATALOG.filter((i) => inShop(i) && TAB_CATS[tab].includes(i.category) && (!i.collection || i.collection === 'championship'));
  items = items.filter((i) => {
    const st = itemStatus(d, i);
    if (filter === 'OWNED') return st === 'owned';
    if (filter === 'LOCKED') return st === 'locked';
    if (filter === 'FAVORITES') return L.favorites.includes(i.id);
    if (filter === 'ALL') return true;
    return i.rarity === filter;
  });
  // "So close" nudge
  const target = CATALOG.filter((i) => itemStatus(d, i) === 'available' && i.price > L.bb).sort((a, b) => a.price - b.price)[0];
  return (
    <div className="shop">
      <div className="shop-tabs">
        {(Object.keys(TAB_CATS) as ShopTab[]).map((t) => <button key={t} className={`shop-tab ${tab === t ? 'on' : ''}`} onClick={() => { setTab(t); Sound.play('menu'); }}>{t}</button>)}
      </div>
      <div className="shop-filters">
        {(['ALL', 'OWNED', 'LOCKED', 'common', 'rare', 'epic', 'legendary', 'FAVORITES'] as Filter[]).map((f) => (
          <button key={f} className={`chip ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)} style={['common', 'rare', 'epic', 'legendary'].includes(f) ? { color: filter === f ? undefined : RARITY_COLOR[f as Rarity] } : undefined}>{f === 'FAVORITES' ? '★ FAVORITES' : f.toUpperCase()}</button>
        ))}
        {target && <span className="nudge">Only <b>{fmtBB(target.price - L.bb)}</b> away from <b>{target.name}</b></span>}
      </div>
      {tab === 'FEATURED' && <div className="featured-head pixel">🔥 FRIDAY NIGHT DROPS <span className="dim tiny">rotates every week</span></div>}
      {tab === 'SCHOOL COLLECTIONS' && (
        <div className="school-pick">
          {LCPS_TEAMS.map((t) => {
            const open = t.id === d.userTeam || L.beaten?.includes(t.id);
            return (
              <button key={t.id} className={`tp-item ${school === t.id ? 'on' : ''}`} onClick={() => setSchool(t.id)} title={open ? `${t.shortName} collection` : `Beat ${t.shortName} to unlock`} style={{ ['--tc' as string]: t.colors.primary, opacity: open ? 1 : 0.45 }}>
                <TeamLogo team={t} size={26} /><span>{t.abbreviation}{open ? '' : ' 🔒'}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className={`item-grid ${tab === 'FEATURED' ? 'featured' : ''}`}>
        {items.map((it) => <ItemCard key={it.id} d={d} item={it} onOpen={() => setDetail(it)} onChange={onChange} big={tab === 'FEATURED'} />)}
        {items.length === 0 && <p className="dim">Nothing here with this filter.</p>}
      </div>
      {detail && <ItemDetail d={d} item={detail} onClose={() => setDetail(null)} onChange={onChange} />}
    </div>
  );
}

export function ItemCard({ d, item, onOpen, onChange, big }: { d: Dynasty; item: EquipmentItem; onOpen: () => void; onChange: () => void; big?: boolean }) {
  const team = getTeam(item.collection && item.collection !== 'championship' ? item.collection : d.userTeam);
  const st = itemStatus(d, item);
  const eq = st === 'owned' ? equippedCount(d, item.id) : 0;
  const [msg, setMsg] = useState<string | null>(null);
  const [hover, setHover] = useState(false);
  const L = d.locker!;
  const buy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const r = buyItem(d, item.id);
    if (r.ok) { Sound.play('touchdown'); setMsg('PURCHASED!'); checkPassiveAchievements(d); onChange(); }
    else { Sound.play('groan'); setMsg(r.need > 0 ? `NOT ENOUGH BOWL BUCKS — YOU NEED ${r.need.toLocaleString('en-US')} MORE BB` : r.reason); }
    setTimeout(() => setMsg(null), 2200);
  };
  const status = st === 'locked' ? 'LOCKED' : eq > 0 ? `EQUIPPED ×${eq}` : st === 'owned' ? 'OWNED' : 'AVAILABLE';
  return (
    <div className={`item-card r-${item.rarity} st-${st} ${big ? 'big' : ''} ${L.newItems.includes(item.id) ? 'is-new' : ''}`} onClick={onOpen} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ ['--rc' as string]: RARITY_COLOR[item.rarity] }}>
      <div className="ic-thumb"><ItemThumb item={item} team={team} size={big ? 170 : 130} animate={hover} /></div>
      <div className="ic-name pixel">{item.name.toUpperCase()}</div>
      <div className="ic-rarity pixel">{RARITY_ICON[item.rarity]} {item.rarity.toUpperCase()}</div>
      <div className={`ic-status pixel s-${st}`}>{status}</div>
      {st === 'available' && <button className={`ic-buy pixel ${L.bb >= item.price ? '' : 'poor'}`} onClick={buy}>{item.price > 0 ? `BUY · ${item.price.toLocaleString('en-US')} BB` : 'FREE'}</button>}
      {st === 'locked' && <div className="ic-lock small">🔒 {item.unlock?.text}</div>}
      {st === 'owned' && <div className="ic-owned small">✔ In your locker</div>}
      <button className={`ic-fav ${L.favorites.includes(item.id) ? 'on' : ''}`} onClick={(e) => { e.stopPropagation(); toggleFavorite(d, item.id); onChange(); }} title="Favorite">★</button>
      {L.newItems.includes(item.id) && <span className="ic-new pixel">NEW</span>}
      {msg && <div className="ic-msg pixel">{msg}</div>}
    </div>
  );
}

export function ItemDetail({ d, item, onClose, onChange }: { d: Dynasty; item: EquipmentItem; onClose: () => void; onChange: () => void }) {
  const team = getTeam(item.collection && item.collection !== 'championship' ? item.collection : d.userTeam);
  const [, f] = useState(0);
  const [msg, setMsg] = useState<string | null>(null);
  const [target, setTarget] = useState<string>('');
  const st = itemStatus(d, item);
  const roster = [...d.programs[d.userTeam].roster].sort((a, b) => a.pos.localeCompare(b.pos) || ovr(b) - ovr(a));
  const L = d.locker!;
  const buy = () => {
    const r = buyItem(d, item.id);
    if (r.ok) { Sound.play('touchdown'); setMsg('PURCHASED — now in MY GEAR'); checkPassiveAchievements(d); onChange(); f((x) => x + 1); }
    else setMsg(r.need > 0 ? `NOT ENOUGH BOWL BUCKS. YOU NEED ${r.need.toLocaleString('en-US')} MORE BB.` : r.reason);
  };
  const equipOn = (pid: string) => {
    const p = roster.find((x) => x.id === pid);
    if (!p || !p.gear) return;
    equipItem(p.gear, item);
    p.gear = { ...p.gear };
    Sound.play('catch');
    setMsg(`EQUIPPED ON ${p.first[0]}. ${p.last.toUpperCase()}`);
    checkPassiveAchievements(d);
    onChange();
    f((x) => x + 1);
  };
  const wears = (pid: string) => gearIds(roster.find((x) => x.id === pid)?.gear).includes(item.id);
  const unequipAll = () => {
    for (const p of roster) if (p.gear) { unequipItem(p.gear, item); p.gear = { ...p.gear }; }
    setMsg('UNEQUIPPED FROM ALL PLAYERS');
    onChange();
    f((x) => x + 1);
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  const fake = { id: 'detail-mannequin', pos: 'WR', weight: 200, number: 1 } as PlayerData;
  return (
    <div className="modal-back" onClick={onClose}>
      <div className={`item-detail panel r-${item.rarity}`} onClick={(e) => e.stopPropagation()} style={{ ['--rc' as string]: RARITY_COLOR[item.rarity] }}>
        <button className="close" onClick={onClose}>✕</button>
        <div className="id-left">
          {item.image ? <ProductImage item={item} width={420} height={280} /> : <ItemThumb item={item} team={team} size={260} animate />}
          {item.image && <div className="dim tiny">SHOP ART: SUPPLIED PRODUCT IMAGE · IN-GAME: LOW-RES {item.category === 'pads' ? 'SHOULDER PROFILE UNDER THE JERSEY' : 'SHELL IN YOUR SCHOOL COLORS'}</div>}
          <PlayerPreview p={fake} team={team} gear={mannequinGear(item)} scale={6} pose="run" />
        </div>
        <div className="id-right">
          <div className="ic-rarity pixel big">{RARITY_ICON[item.rarity]} {item.rarity.toUpperCase()}</div>
          <h2 className="pixel">{item.name.toUpperCase()}</h2>
          <div className="dim">{CATEGORY_LABEL[item.category]}{item.collection && item.collection !== 'championship' ? ` · ${getTeam(item.collection).shortName} Collection` : item.collection === 'championship' ? ' · Championship Collection' : ''}</div>
          <p>{item.desc}</p>
          <p className="dim small">Cosmetic only — no effect on ratings or gameplay. Buy once, wear it on any player.</p>
          {st === 'available' && <div className="id-buy"><Btn variant="gold" onClick={buy}>{item.price ? `BUY · ${item.price.toLocaleString('en-US')} BB` : 'CLAIM FREE'}</Btn><BBBadge bb={L.bb} /></div>}
          {st === 'locked' && <div className="id-lock">🔒 LOCKED — {item.unlock?.text}</div>}
          {st === 'owned' && (
            <div className="id-equip">
              <div className="pixel small gold">OWNED · EQUIPPED ON {equippedCount(d, item.id)} PLAYER(S)</div>
              <div className="id-eq-row">
                <select value={target} onChange={(e) => setTarget(e.target.value)}>
                  <option value="">Choose a player…</option>
                  {roster.map((p) => <option key={p.id} value={p.id}>{p.pos} · #{p.number} {p.first[0]}. {p.last}</option>)}
                </select>
                <Btn small disabled={!target} onClick={() => equipOn(target)}>EQUIP</Btn>
                {target && <span className={`id-eq-state pixel ${wears(target) ? 'on' : ''}`}>{wears(target) ? 'EQUIPPED ON THIS PLAYER' : 'NOT EQUIPPED ON THIS PLAYER'}</span>}
                <Btn small variant="ghost" onClick={unequipAll}>UNEQUIP</Btn>
              </div>
            </div>
          )}
          <div className="id-fav"><Btn small variant="ghost" onClick={() => { toggleFavorite(d, item.id); onChange(); f((x) => x + 1); }}>{L.favorites.includes(item.id) ? '★ FAVORITED' : '☆ FAVORITE'}</Btn></div>
          {msg && <div className="id-msg pixel">{msg}</div>}
        </div>
      </div>
    </div>
  );
}

export function equipItem(g: NonNullable<PlayerData['gear']>, item: EquipmentItem) {
  const arm = (side: 'leftArm' | 'rightArm') => { g[side] = [...(g[side] ?? []).filter((x) => itemById(x)?.category !== item.category), item.id]; };
  switch (item.category) {
    case 'sleeve': case 'armband': arm('leftArm'); arm('rightArm'); break;
    case 'wristband': arm('leftArm'); arm('rightArm'); break;
    case 'accessory': if (item.style === 'brace') { arm('leftArm'); arm('rightArm'); } else g.accessory = item.id; break;
    case 'legsleeve': g.legsleeve = item.id; break;
    default: (g as Record<string, unknown>)[item.category] = item.id;
  }
}

export function unequipItem(g: NonNullable<PlayerData['gear']>, item: EquipmentItem) {
  for (const k of Object.keys(g) as (keyof typeof g)[]) {
    const v = g[k];
    if (v === item.id && k === 'helmet') g.helmet = 'helm-standard';
    else if (v === item.id && k === 'pads') g.pads = 'pads-standard';
    else if (v === item.id && !['finish', 'facemask', 'socks', 'cleats'].includes(k)) (g as Record<string, unknown>)[k] = undefined;
    if (Array.isArray(v)) (g as Record<string, unknown>)[k] = v.filter((x) => x !== item.id);
  }
}

// ---------------------------------------------------------------- my gear

function MyGear({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const [detail, setDetail] = useState<EquipmentItem | null>(null);
  const [fav, setFav] = useState(false);
  const L = d.locker!;
  const owned = CATALOG.filter((i) => L.owned.includes(i.id) && (!fav || L.favorites.includes(i.id)));
  const groups = (Object.keys(CATEGORY_LABEL) as EquipmentCategory[]).map((c) => [c, owned.filter((i) => i.category === c)] as const).filter(([, l]) => l.length);
  return (
    <div className="my-gear">
      <div className="shop-filters">
        <span className="pixel small">{L.owned.length} / {CATALOG.length} ITEMS COLLECTED</span>
        <button className={`chip ${fav ? 'on' : ''}`} onClick={() => setFav((x) => !x)}>★ FAVORITES</button>
      </div>
      {groups.map(([cat, list]) => (
        <section key={cat} className="gear-group">
          <h4>{CATEGORY_LABEL[cat].toUpperCase()} · {list.length}</h4>
          <div className="item-grid">{list.map((it) => <ItemCard key={it.id} d={d} item={it} onOpen={() => setDetail(it)} onChange={onChange} />)}</div>
        </section>
      ))}
      {detail && <ItemDetail d={d} item={detail} onClose={() => setDetail(null)} onChange={onChange} />}
    </div>
  );
}

// ---------------------------------------------------------------- customize

function CustomizePlayer({ d, onChange, initial }: { d: Dynasty; onChange: () => void; initial?: PlayerData }) {
  const roster = useMemo(() => [...d.programs[d.userTeam].roster].sort((a, b) => ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'].indexOf(a.pos) - ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'].indexOf(b.pos) || ovr(b) - ovr(a)), [d]);
  const [sel, setSel] = useState<PlayerData>(initial ?? roster[0]);
  return (
    <div className="customize">
      <div className="cust-list">
        {roster.map((p) => (
          <button key={p.id} className={`cust-p ${sel.id === p.id ? 'on' : ''}`} onClick={() => setSel(p)}>
            <span className="pixel tiny">{p.pos}</span> #{p.number} {p.first[0]}. {p.last}
            <span className="dim tiny">{gearIds(p.gear).filter((id) => itemById(id)?.rarity === 'legendary').length ? '⭐' : ''}</span>
          </button>
        ))}
      </div>
      <GearEditor key={sel.id} d={d} player={sel} onChange={onChange} />
    </div>
  );
}

// ---------------------------------------------------------------- collection

function Collection({ d }: { d: Dynasty }) {
  const L = d.locker!;
  const team = getTeam(d.userTeam);
  const special = CATALOG.filter((i) => i.unlock && i.unlock.kind !== 'beat');
  const schools = LCPS_TEAMS.map((t) => {
    const items = CATALOG.filter((i) => i.collection === t.id);
    return { t, have: items.filter((i) => L.owned.includes(i.id)).length, total: items.length, open: t.id === d.userTeam || L.beaten?.includes(t.id) };
  });
  return (
    <div className="collection">
      <section className="panel coll-sec">
        <header className="panel-head"><h3>ACHIEVEMENTS · {Object.keys(L.achievements).length}/{ACHIEVEMENTS.length}</h3><span className="dim small">Lifetime earned: {fmtBB(L.lifetimeBB)}</span></header>
        <div className="panel-body ach-grid">
          {ACHIEVEMENTS.map((a) => {
            const got = L.achievements[a.id];
            return (
              <div key={a.id} className={`ach ${got ? 'got' : ''}`}>
                <div className="pixel small">{got ? '🏆' : '🔒'} {a.name}</div>
                <div className="small">{a.desc}</div>
                <div className="tiny gold pixel">+{a.bb} BB{a.unlock ? ` · UNLOCKS ${itemById(a.unlock)?.name.toUpperCase()}` : ''}</div>
                {got && <div className="tiny dim">Earned {got.year}, week {got.week}</div>}
              </div>
            );
          })}
        </div>
      </section>
      <section className="panel coll-sec">
        <header className="panel-head"><h3>TROPHY GEAR — CAN'T BE BOUGHT</h3></header>
        <div className="panel-body trophy-grid">
          {special.map((it) => (
            <div key={it.id} className={`trophy-item ${L.owned.includes(it.id) ? 'got' : ''}`}>
              <ItemThumb item={it} team={team} size={96} />
              <div className="pixel tiny">{it.name.toUpperCase()}</div>
              <div className="tiny dim">{L.owned.includes(it.id) ? 'UNLOCKED' : `🔒 ${it.unlock!.text}`}</div>
            </div>
          ))}
        </div>
      </section>
      <section className="panel coll-sec">
        <header className="panel-head"><h3>SCHOOL COLLECTIONS</h3><span className="dim small">Your school's collection is always in the shop. Beat a school to open theirs.</span></header>
        <div className="panel-body school-coll">
          {schools.map(({ t, have, total, open }) => (
            <div key={t.id} className={`sc-row ${open ? '' : 'locked'}`}>
              <TeamLogo team={t} size={22} /> <b>{t.shortName}</b> <span className="dim">{t.mascot}</span>
              <span className="sc-bar"><i style={{ width: `${(have / total) * 100}%`, background: t.colors.primary }} /></span>
              <span className="pixel tiny">{have}/{total}{open ? '' : ' 🔒'}</span>
            </div>
          ))}
        </div>
      </section>
      <section className="panel coll-sec">
        <header className="panel-head"><h3>GEAR DROPS · {L.drops.length}</h3></header>
        <div className="panel-body">
          {L.drops.length === 0 && <p className="dim">Big wins sometimes open a gear drop. Rivalry wins, upsets, shutouts and playoff wins all qualify.</p>}
          {[...L.drops].reverse().map((dr, i) => <div key={i} className="drop-row"><span className="pixel tiny" style={{ color: RARITY_COLOR[dr.rarity] }}>{dr.rarity.toUpperCase()}</span> {itemById(dr.item)?.name} <span className="dim tiny">{dr.year} · week {dr.week}</span></div>)}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------- team themes

function Themes({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const L = d.locker!;
  const team = getTeam(d.userTeam);
  const sample = [...d.programs[d.userTeam].roster].sort((a, b) => ovr(b) - ovr(a)).filter((p) => ['WR', 'RB', 'LB', 'CB'].includes(p.pos))[0];
  const [msg, setMsg] = useState<string | null>(null);
  const how: Partial<Record<ThemeId, string>> = { pinkout: 'Unlocks in October (week 6)', playoff: 'Make the playoffs', champgold: 'Win the LCPS Bowl', throwback: `${THEME_PRICE.throwback} BB` };
  return (
    <div className="themes">
      <p className="dim small">Team themes recolor compatible gear for every player on game day (gloves, sleeves, bands, socks, spats, cleats, masks). Each player keeps his own pieces.</p>
      <div className="theme-grid">
        {THEMES.map((t) => {
          const have = L.themesUnlocked.includes(t.id);
          return (
            <div key={t.id} className={`theme-card ${L.theme === t.id ? 'on' : ''} ${have ? '' : 'locked'}`}>
              {sample && <PlayerPreview p={sample} team={team} theme={t.id} scale={5} animate={false} />}
              <div className="pixel small">{t.name}</div>
              <div className="small dim">{t.desc}</div>
              {have ? (
                <Btn small variant={L.theme === t.id ? 'gold' : 'ghost'} onClick={() => { setTheme(d, t.id); Sound.play('select'); onChange(); }}>{L.theme === t.id ? 'ACTIVE' : 'SET THEME'}</Btn>
              ) : THEME_PRICE[t.id] ? (
                <Btn small onClick={() => { const r = buyTheme(d, t.id); setMsg(r.ok ? 'THEME UNLOCKED' : r.need ? `YOU NEED ${r.need} MORE BB` : r.reason); onChange(); }}>BUY · {THEME_PRICE[t.id]} BB</Btn>
              ) : <div className="tiny dim">🔒 {how[t.id]}</div>}
            </div>
          );
        })}
      </div>
      {msg && <div className="id-msg pixel">{msg}</div>}
    </div>
  );
}

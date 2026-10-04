import { useMemo, useState } from 'react';
import type { Dynasty } from '../../dynasty/types';
import type { PlayerData } from '../../game/types';
import type { Pose } from '../../game/render/sprites';
import { getTeam } from '../../data/teams';
import { CATALOG, CATEGORY_LABEL, RARITY_COLOR, itemById } from '../catalog';
import type { EquipmentCategory, EquipmentItem, GloveSide, MaskColor, PlayerGear, ShellColor, TowelPos } from '../types';
import { owns, randomizeFit, teamDrip, checkPassiveAchievements, ensurePlayerGear } from '../economy';
import { PlayerPreview, ItemThumb } from './Preview';
import { Btn } from '../../components/common';
import { Sound } from '../../game/audio/Sound';
import { fullName } from '../../game/players';

type SlotId = 'helmet' | 'finish' | 'facemask' | 'visor' | 'mouthguard' | 'leftArm' | 'rightArm' | 'gloves' | 'wrist' | 'towel' | 'undershirt' | 'handwarmer' | 'legs' | 'socks' | 'spats' | 'cleats' | 'accessory';

const SLOTS: { id: SlotId; label: string; cats: EquipmentCategory[]; side: 'left' | 'right' }[] = [
  { id: 'helmet', label: 'HELMET', cats: ['helmet'], side: 'left' },
  { id: 'finish', label: 'FINISH', cats: ['finish'], side: 'left' },
  { id: 'facemask', label: 'FACEMASK', cats: ['facemask'], side: 'left' },
  { id: 'visor', label: 'VISOR', cats: ['visor'], side: 'left' },
  { id: 'mouthguard', label: 'MOUTHGUARD', cats: ['mouthguard'], side: 'left' },
  { id: 'leftArm', label: 'LEFT ARM', cats: ['sleeve', 'armband', 'wristband', 'accessory'], side: 'left' },
  { id: 'gloves', label: 'GLOVES', cats: ['gloves'], side: 'left' },
  { id: 'wrist', label: 'WRIST', cats: ['wristband'], side: 'left' },
  { id: 'undershirt', label: 'UNDERSHIRT', cats: ['undershirt'], side: 'left' },
  { id: 'rightArm', label: 'RIGHT ARM', cats: ['sleeve', 'armband', 'wristband', 'accessory'], side: 'right' },
  { id: 'towel', label: 'TOWEL', cats: ['towel'], side: 'right' },
  { id: 'handwarmer', label: 'HAND WARMER', cats: ['handwarmer'], side: 'right' },
  { id: 'accessory', label: 'ACCESSORY', cats: ['accessory'], side: 'right' },
  { id: 'legs', label: 'LEGS', cats: ['legsleeve'], side: 'right' },
  { id: 'socks', label: 'SOCKS', cats: ['socks'], side: 'right' },
  { id: 'spats', label: 'SPATS / TAPE', cats: ['spats'], side: 'right' },
  { id: 'cleats', label: 'CLEATS', cats: ['cleats'], side: 'right' },
];

const field: Partial<Record<SlotId, keyof PlayerGear>> = {
  helmet: 'helmet', finish: 'finish', facemask: 'facemask', visor: 'visor', mouthguard: 'mouthguard', gloves: 'gloves',
  towel: 'towel', undershirt: 'undershirt', handwarmer: 'handwarmer', legs: 'legsleeve', socks: 'socks', spats: 'spats', cleats: 'cleats', accessory: 'accessory',
};
const NO_NONE: SlotId[] = ['helmet', 'finish', 'facemask', 'socks', 'cleats'];

function currentIds(g: PlayerGear, slot: SlotId): string[] {
  if (slot === 'leftArm') return g.leftArm ?? [];
  if (slot === 'rightArm') return g.rightArm ?? [];
  if (slot === 'wrist') {
    const w = [...(g.leftArm ?? []), ...(g.rightArm ?? [])].filter((id) => itemById(id)?.category === 'wristband');
    return [...new Set(w)];
  }
  const f = field[slot];
  const v = f ? g[f] : undefined;
  return typeof v === 'string' ? [v] : [];
}

export function GearEditor({ d, player, onChange, onClose, roster }: { d: Dynasty; player: PlayerData; onChange: () => void; onClose?: () => void; roster?: PlayerData[] }) {
  const team = getTeam(d.userTeam);
  const [p, setP] = useState(player);
  ensurePlayerGear(d, p);
  const [slot, setSlot] = useState<SlotId>('helmet');
  const [pose, setPose] = useState<Pose>('stand');
  const [, force] = useState(0);
  const g = p.gear!;
  const update = (fn: (g: PlayerGear) => void) => {
    fn(g);
    p.gear = { ...g };
    Sound.play('catch');
    checkPassiveAchievements(d);
    force((x) => x + 1);
    onChange();
  };
  const def = SLOTS.find((s) => s.id === slot)!;
  const options = useMemo(() => CATALOG.filter((i) => def.cats.includes(i.category) && owns(d, i.id) && (def.cats.includes('accessory') && (slot === 'leftArm' || slot === 'rightArm') ? i.category !== 'accessory' || i.style === 'brace' : true) && (slot === 'accessory' ? i.style !== 'brace' : true)), [def, d, slot, d.locker?.owned.length]);
  const cur = currentIds(g, slot);
  const choose = (it: EquipmentItem | null) => update((g) => {
    if (slot === 'leftArm' || slot === 'rightArm') {
      if (!it) { g[slot] = []; return; }
      const list = g[slot] ?? [];
      // Stack: one per sub-category (sleeve, band, wrist, brace); clicking again removes it.
      if (list.includes(it.id)) g[slot] = list.filter((x) => x !== it.id);
      else g[slot] = [...list.filter((x) => itemById(x)?.category !== it.category || (it.category === 'accessory' && itemById(x)?.style !== it.style)), it.id];
      return;
    }
    if (slot === 'wrist') {
      const strip = (l?: string[]) => (l ?? []).filter((x) => itemById(x)?.category !== 'wristband');
      g.leftArm = it ? [...strip(g.leftArm), it.id] : strip(g.leftArm);
      g.rightArm = it ? [...strip(g.rightArm), it.id] : strip(g.rightArm);
      return;
    }
    const f = field[slot]!;
    (g as Record<string, unknown>)[f] = it ? it.id : undefined;
  });
  const slotBtn = (s: (typeof SLOTS)[number]) => {
    const ids = currentIds(g, s.id);
    const names = ids.map((id) => itemById(id)?.name).filter(Boolean).join(' + ');
    return (
      <button key={s.id} className={`slot-btn ${slot === s.id ? 'on' : ''}`} onClick={() => { setSlot(s.id); Sound.play('menu'); }}>
        <span className="pixel tiny">{s.label}</span>
        <span className="slot-val">{names || <span className="dim">None</span>}</span>
      </button>
    );
  };
  return (
    <div className="gear-editor">
      <div className="ge-top">
        <div>
          <div className="pixel ge-name">{fullName(p).toUpperCase()}</div>
          <div className="dim small">#{p.number} · {p.pos} · Style: {p.style ?? 'auto'} · Cosmetic only — gear never changes ratings.</div>
        </div>
        <div className="ge-actions">
          {roster && (
            <select value={p.id} onChange={(e) => { const np = roster.find((x) => x.id === e.target.value); if (np) setP(np); }}>
              {roster.map((x) => <option key={x.id} value={x.id}>{x.pos} · #{x.number} {x.first[0]}. {x.last}</option>)}
            </select>
          )}
          <Btn small variant="ghost" onClick={() => { randomizeFit(d, p); p.gear = { ...p.gear! }; Sound.play('select'); force((x) => x + 1); onChange(); }}>🎲 RANDOMIZE FIT</Btn>
          <Btn small variant="ghost" onClick={() => { if (confirm('Re-dress the entire roster with your owned gear?')) { teamDrip(d); force((x) => x + 1); onChange(); } }}>TEAM DRIP</Btn>
          {onClose && <Btn small onClick={onClose}>DONE</Btn>}
        </div>
      </div>
      <div className="ge-body">
        <div className="ge-slots">{SLOTS.filter((s) => s.side === 'left').map(slotBtn)}</div>
        <div className="ge-stage">
          <PlayerPreview p={p} team={team} gear={g} theme={d.locker?.theme} scale={11} pose={pose} />
          <div className="seg small-seg">
            {(['stand', 'run', 'throw', 'celebrate', 'stance'] as Pose[]).map((x) => <button key={x} className={pose === x ? 'on' : ''} onClick={() => setPose(x)}>{x.toUpperCase()}</button>)}
          </div>
          {d.locker?.theme && d.locker.theme !== 'none' && <div className="dim tiny pixel">TEAM THEME ACTIVE: {d.locker.theme.toUpperCase()}</div>}
        </div>
        <div className="ge-slots">{SLOTS.filter((s) => s.side === 'right').map(slotBtn)}</div>
      </div>
      <div className="ge-options panel">
        <div className="ge-opt-head">
          <span className="pixel small gold">{def.label}</span>
          <span className="dim small">{def.cats.map((c) => CATEGORY_LABEL[c]).join(' · ')} — owned items only</span>
        </div>
        {slot === 'helmet' && (
          <div className="ge-extra">
            <span className="opt-label">SHELL</span>
            <div className="seg">{(['primary', 'secondary', 'white', 'black'] as ShellColor[]).map((c) => <button key={c} className={(g.shellColor ?? 'primary') === c ? 'on' : ''} onClick={() => update((g) => { g.shellColor = c; })}><i className="sw" style={{ background: c === 'primary' ? team.colors.primary : c === 'secondary' ? team.colors.secondary : c === 'white' ? '#f4f4f4' : '#1b1b1f' }} />{c === 'primary' ? 'TEAM PRIMARY' : c === 'secondary' ? 'TEAM SECONDARY' : c.toUpperCase()}</button>)}</div>
            <span className="opt-label">STRIPE / LOGO</span>
            <div className="seg">
              <button className={g.stripe !== false ? 'on' : ''} onClick={() => update((g) => { g.stripe = g.stripe === false; })}>STRIPE</button>
              <button className={g.logo !== false ? 'on' : ''} onClick={() => update((g) => { g.logo = g.logo === false; })}>{team.mascot.toUpperCase()} LOGO</button>
            </div>
          </div>
        )}
        {slot === 'facemask' && (
          <div className="ge-extra">
            <span className="opt-label">MASK COLOR</span>
            <div className="seg">{(['default', 'gray', 'white', 'black', 'primary', 'secondary'] as MaskColor[]).map((c) => <button key={c} className={(g.maskColor ?? 'default') === c ? 'on' : ''} onClick={() => update((g) => { g.maskColor = c; })}>{c.toUpperCase()}</button>)}</div>
          </div>
        )}
        {slot === 'gloves' && (
          <div className="ge-extra">
            <span className="opt-label">HANDS</span>
            <div className="seg">{(['both', 'left', 'right'] as GloveSide[]).map((c) => <button key={c} className={(g.gloveSide ?? 'both') === c ? 'on' : ''} onClick={() => update((g) => { g.gloveSide = c; })}>{c.toUpperCase()}</button>)}</div>
          </div>
        )}
        {slot === 'towel' && (
          <div className="ge-extra">
            <span className="opt-label">POSITION</span>
            <div className="seg">{(['front', 'left', 'right', 'back'] as TowelPos[]).map((c) => <button key={c} className={(g.towelPos ?? 'front') === c ? 'on' : ''} onClick={() => update((g) => { g.towelPos = c; })}>{c.toUpperCase()}</button>)}</div>
          </div>
        )}
        {(slot === 'leftArm' || slot === 'rightArm') && <p className="dim small">Stack one sleeve, one arm band, one wristband and one brace per arm. Click again to remove.</p>}
        <div className="ge-items">
          {!NO_NONE.includes(slot) && (
            <button className={`ge-item ${cur.length === 0 ? 'on' : ''}`} onClick={() => choose(null)}>
              <div className="ge-none pixel">NONE</div>
            </button>
          )}
          {options.map((it) => (
            <button key={it.id} className={`ge-item ${cur.includes(it.id) ? 'on' : ''}`} onClick={() => choose(it)} style={{ ['--rc' as string]: RARITY_COLOR[it.rarity] }}>
              <ItemThumb item={it} team={team} size={84} />
              <span className="ge-item-name">{it.name}</span>
              {d.locker?.favorites.includes(it.id) && <span className="fav-star">★</span>}
            </button>
          ))}
          {options.length === 0 && <p className="dim">You don't own anything for this slot yet. Visit the SHOP.</p>}
        </div>
      </div>
    </div>
  );
}

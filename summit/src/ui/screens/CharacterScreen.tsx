import { useMemo } from 'react';
import type { AppApi } from '../App';
import { Back, Coins, StatBar } from '../components/common';
import { CharacterPreview } from '../components/CharacterPreview';
import { HAIR_COLORS, ITEMS, SKIN_TONES, SLOT_LABEL, gearStats, lookFor, type Appearance, type Slot } from '../../data/equipment';
import { equip } from '../../state/progress';

const PALETTE = ['#c8322b', '#ff7a1a', '#f2c12e', '#b6f23a', '#2a8a4a', '#2b6cd8', '#1d2f55', '#6a2a8a', '#e85d8a', '#f2f2f2', '#6c727c', '#1a1a1a'];

export function CharacterScreen({ api }: { api: AppApi }) {
  const p = api.profile;
  const look = useMemo(() => lookFor(p.appearance, p.equipped), [p.appearance, p.equipped]);
  const stats = gearStats(p.equipped, p.board);
  const setApp = (patch: Partial<Appearance>) => api.update((pp) => { pp.appearance = { ...pp.appearance, ...patch }; });
  const slots: Slot[] = ['skis', 'snowboard', 'helmet', 'goggles', 'jacket', 'pants', 'gloves', 'boots', 'accessory'];
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>CHARACTER</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content">
        <div className="grid" style={{ gridTemplateColumns: 'minmax(300px, 420px) 1fr', alignItems: 'start' }}>
          <div className="col">
            <CharacterPreview look={look} board={p.board} />
            <div className="panel card col">
              <h3>Gear stats</h3>
              {(Object.keys(stats) as (keyof typeof stats)[]).map((k) => <StatBar key={k} label={k[0].toUpperCase() + k.slice(1)} value={stats[k]} />)}
            </div>
          </div>
          <div className="col">
            <div className="panel card col">
              <h3>Rider</h3>
              <label className="field">Name<input type="text" value={p.name} maxLength={18} onChange={(e) => api.update((pp) => { pp.name = e.target.value || 'Rider'; })} /></label>
              <div className="row wrap">
                <button className={`btn small ${p.board === 'ski' ? 'selected' : ''}`} onClick={() => api.update((pp) => { pp.board = 'ski'; })}>⛷ Skis</button>
                <button className={`btn small ${p.board === 'snowboard' ? 'selected' : ''}`} onClick={() => api.update((pp) => { pp.board = 'snowboard'; })}>🏂 Snowboard</button>
              </div>
              <div className="small muted">Skin tone</div>
              <div className="swatches">{SKIN_TONES.map((c) => <div key={c} className={`swatch ${p.appearance.skin === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setApp({ skin: c })} />)}</div>
              <div className="small muted">Hair</div>
              <div className="swatches">{HAIR_COLORS.map((c) => <div key={c} className={`swatch ${p.appearance.hair === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setApp({ hair: c })} />)}</div>
              <div className="row wrap">
                {(['short', 'long', 'ponytail', 'buzz'] as const).map((h) => <button key={h} className={`btn small ${p.appearance.hairStyle === h ? 'selected' : ''}`} onClick={() => setApp({ hairStyle: h })}>{h}</button>)}
                {(['clean', 'stubble', 'beard', 'freckles'] as const).map((f) => <button key={f} className={`btn small ${p.appearance.face === f ? 'selected' : ''}`} onClick={() => setApp({ face: f })}>{f}</button>)}
              </div>
              <label className="field">Build<input type="range" min={0} max={1} step={0.05} value={p.appearance.build} onChange={(e) => setApp({ build: Number(e.target.value) })} /></label>
              <label className="field">Height<input type="range" min={0.6} max={1.4} step={0.05} value={p.appearance.height} onChange={(e) => setApp({ height: Number(e.target.value) })} /></label>
              <div className="small muted">Custom colours (override gear colours)</div>
              {(['jacketColor', 'pantsColor', 'helmetColor'] as const).map((k) => (
                <div key={k} className="row wrap">
                  <span className="small" style={{ width: 70 }}>{k.replace('Color', '')}</span>
                  <div className="swatches">
                    <div className={`swatch ${!p.appearance[k] ? 'sel' : ''}`} title="Gear default" style={{ background: 'repeating-linear-gradient(45deg,#888,#888 4px,#555 4px,#555 8px)' }} onClick={() => setApp({ [k]: undefined })} />
                    {PALETTE.map((c) => <div key={c} className={`swatch ${p.appearance[k] === c ? 'sel' : ''}`} style={{ background: c }} onClick={() => setApp({ [k]: c })} />)}
                  </div>
                </div>
              ))}
            </div>
            <div className="panel card col">
              <h3>Equipped (owned items)</h3>
              {slots.map((slot) => (
                <label key={slot} className="field">{SLOT_LABEL[slot]}
                  <select value={p.equipped[slot]} onChange={(e) => api.update((pp) => { equip(pp, e.target.value); if (slot === 'skis') pp.board = 'ski'; if (slot === 'snowboard') pp.board = 'snowboard'; })}>
                    {ITEMS.filter((i) => i.slot === slot && p.owned.includes(i.id)).map((i) => <option key={i.id} value={i.id}>{i.name} — {i.brand}</option>)}
                  </select>
                </label>
              ))}
              <button className="btn" onClick={() => api.go('shop')}>Visit the shop →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

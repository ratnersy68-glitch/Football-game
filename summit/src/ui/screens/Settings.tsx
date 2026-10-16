import { useEffect, useState } from 'react';
import type { AppApi } from '../App';
import { Back, Coins } from '../components/common';
import { ACTION_LABEL, DEFAULT_BINDINGS, keyLabel, type Action } from '../../game/input';
import { newProfile } from '../../state/save';
import type { Quality } from '../../render/sceneSetup';

export function SettingsScreen({ api }: { api: AppApi }) {
  const p = api.profile;
  const s = p.settings;
  const [listen, setListen] = useState<Action | null>(null);
  const set = (fn: (st: typeof s) => void) => api.update((pp) => fn(pp.settings));
  useEffect(() => {
    if (!listen) return;
    const on = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code !== 'Escape') set((st) => { st.bindings = { ...st.bindings, [listen]: [e.code] }; });
      setListen(null);
    };
    window.addEventListener('keydown', on, { once: true });
    return () => window.removeEventListener('keydown', on);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listen]);
  const binding = (a: Action) => (s.bindings[a] ?? DEFAULT_BINDINGS[a]);
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>SETTINGS</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content grid cols-2" style={{ alignItems: 'start' }}>
        <div className="col">
          <div className="panel card col">
            <h3>Graphics</h3>
            <div className="row wrap">
              {(['low', 'medium', 'high', 'ultra'] as Quality[]).map((q) => <button key={q} className={`btn small ${s.quality === q ? 'selected' : ''}`} onClick={() => set((st) => { st.quality = q; })}>{q[0].toUpperCase() + q.slice(1)}</button>)}
            </div>
            <div className="small muted">Low: no shadows, reduced draw distance & LOD. Ultra: 4K shadows, longest draw distance.</div>
            <label className="row small"><input type="checkbox" checked={s.showFps} onChange={(e) => set((st) => { st.showFps = e.target.checked; })} /> Show FPS</label>
            <label className="field">Units<select value={s.units} onChange={(e) => set((st) => { st.units = e.target.value as 'kmh' | 'mph'; })}><option value="kmh">km/h</option><option value="mph">mph</option></select></label>
          </div>
          <div className="panel card col">
            <h3>Camera &amp; controls</h3>
            <label className="field">Steering sensitivity ({s.sensitivity.toFixed(2)})<input type="range" min={0.5} max={1.8} step={0.05} value={s.sensitivity} onChange={(e) => set((st) => { st.sensitivity = Number(e.target.value); })} /></label>
            <label className="field">Camera distance ({s.cameraDistance.toFixed(2)})<input type="range" min={0.7} max={1.6} step={0.05} value={s.cameraDistance} onChange={(e) => set((st) => { st.cameraDistance = Number(e.target.value); })} /></label>
            <label className="field">Field of view ({s.fov}°)<input type="range" min={50} max={80} step={1} value={s.fov} onChange={(e) => set((st) => { st.fov = Number(e.target.value); })} /></label>
            <label className="row small"><input type="checkbox" checked={s.cameraShake} onChange={(e) => set((st) => { st.cameraShake = e.target.checked; })} /> Speed &amp; landing camera shake</label>
            <div className="small muted">Gamepads are supported: left stick steer, A jump, B brake, RT tuck, LT carve, right stick spin/flip, bumpers cork tilt, X/Y grabs, Start pause, Back map.</div>
          </div>
          <div className="panel card col">
            <h3>Audio</h3>
            {(['master', 'sfx', 'amb'] as const).map((k) => (
              <label key={k} className="field">{k === 'master' ? 'Master' : k === 'sfx' ? 'Effects' : 'Ambience'} ({Math.round(s[k] * 100)}%)
                <input type="range" min={0} max={1} step={0.05} value={s[k]} onChange={(e) => set((st) => { st[k] = Number(e.target.value); })} />
              </label>
            ))}
          </div>
          <div className="panel card col">
            <h3>Profile</h3>
            <button className="btn warn" onClick={() => { if (confirm('Erase all progress, coins and gear?')) api.update((pp) => Object.assign(pp, newProfile())); }}>Reset career progress</button>
          </div>
        </div>
        <div className="panel card col">
          <div className="row"><h3 style={{ flex: 1, margin: 0 }}>Key bindings</h3><button className="btn small" onClick={() => set((st) => { st.bindings = {}; })}>Restore defaults</button></div>
          <div className="small muted">Click a key then press the new key (Esc cancels).</div>
          {(Object.keys(DEFAULT_BINDINGS) as Action[]).map((a) => (
            <div key={a} className="row small">
              <span style={{ flex: 1 }}>{ACTION_LABEL[a]}</span>
              <button className={`btn small ${listen === a ? 'selected' : ''}`} onClick={() => setListen(a)}>{listen === a ? 'Press a key…' : binding(a).map(keyLabel).join(' / ')}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

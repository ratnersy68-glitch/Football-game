import { useState } from 'react';
import type { AppApi } from '../App';
import { resortUnlocked } from '../App';
import { RESORTS, type ResortDef } from '../../data/resorts';
import { DIFFICULTIES, DIFFICULTY_INFO } from '../../world/types';
import { STAGES } from '../../data/career';
import { Back, Coins, DiffIcon, ResortArt } from '../components/common';
import { WEATHER_LABEL, type WeatherKind } from '../../render/sceneSetup';
import { DISCIPLINE_INFO } from '../../data/names';

const HOURS: [number, string][] = [[7.2, 'Sunrise'], [11, 'Midday'], [15, 'Afternoon'], [18.2, 'Sunset'], [21, 'Night skiing']];

export function ResortSelect({ api, mode }: { api: AppApi; mode: 'freeride' | 'mountains' }) {
  const p = api.profile;
  const [sel, setSel] = useState<ResortDef | null>(null);
  const [weather, setWeather] = useState<WeatherKind | 'random'>(p.settings.weather);
  const [hour, setHour] = useState(p.settings.hour);
  const [dyn, setDyn] = useState(p.settings.dynamicWeather);
  const start = (def: ResortDef) => {
    const kinds: WeatherKind[] = ['clear', 'light-snow', 'heavy-snow', 'overcast', 'fog', 'wind'];
    const w = weather === 'random' ? kinds[Math.floor(Math.random() * kinds.length)] : weather;
    api.update((pp) => { pp.settings.weather = weather; pp.settings.hour = hour; pp.settings.dynamicWeather = dyn; });
    api.launch({ resortIndex: def.index, mode: { kind: 'freeride' }, weather: w, hour, back: mode });
  };
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>{mode === 'freeride' ? 'FREE RIDE' : 'MOUNTAINS'}</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content">
        {sel ? (
          <ResortDetail def={sel} api={api} onBack={() => setSel(null)} onStart={() => start(sel)}
            weather={weather} setWeather={setWeather} hour={hour} setHour={setHour} dyn={dyn} setDyn={setDyn} />
        ) : (
          <div className="grid cols-3">
            {RESORTS.map((def) => {
              const open = resortUnlocked(p, def);
              const total = Object.values(def.trails).reduce((a, b) => a + (b ?? 0), 0);
              return (
                <div key={def.id} className={`panel resort-card ${open ? '' : 'locked'}`} onClick={() => setSel(def)} data-testid={`resort-${def.id}`}>
                  <ResortArt def={def} />
                  <div className="body">
                    <div className="row"><h3 style={{ margin: 0, flex: 1 }}>{def.name}</h3>{!open && <span className="tag">🔒 Locked</span>}</div>
                    <div className="muted small">{def.tagline}</div>
                    <Distribution def={def} />
                    <div className="small row wrap">
                      <span className="tag">{total} trails</span><span className="tag">{def.lifts.length} lifts</span>
                      <span className="tag">{def.parks.length} parks</span><span className="tag">{def.races.length} racecourses</span>
                      <span className="tag">{def.vertical} m vertical</span>
                    </div>
                    {!open && <div className="small muted" style={{ marginTop: 6 }}>Unlock: reach {STAGES[def.unlock.stage].name} with {def.unlock.medals} medals</div>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export function Distribution({ def }: { def: ResortDef }) {
  const total = Object.values(def.trails).reduce((a, b) => a + (b ?? 0), 0);
  return (
    <div>
      <div className="dist">
        {DIFFICULTIES.map((d) => (def.trails[d] ? <div key={d} title={`${DIFFICULTY_INFO[d].label}: ${def.trails[d]}`} style={{ width: `${((def.trails[d] ?? 0) / total) * 100}%`, background: d === 'black' ? '#333' : d === 'double' ? '#111' : d === 'triple' ? '#000' : DIFFICULTY_INFO[d].color, borderRight: '1px solid rgba(255,255,255,0.4)' }} /> : null))}
      </div>
      <div className="row wrap small" style={{ gap: 8 }}>
        {DIFFICULTIES.map((d) => (def.trails[d] ? <span key={d} className="row" style={{ gap: 4 }}><DiffIcon d={d} size={12} />{def.trails[d]}</span> : null))}
      </div>
    </div>
  );
}

function ResortDetail(props: {
  def: ResortDef; api: AppApi; onBack: () => void; onStart: () => void;
  weather: WeatherKind | 'random'; setWeather: (w: WeatherKind | 'random') => void; hour: number; setHour: (h: number) => void; dyn: boolean; setDyn: (b: boolean) => void;
}) {
  const { def, api } = props;
  const open = resortUnlocked(api.profile, def);
  const total = Object.values(def.trails).reduce((a, b) => a + (b ?? 0), 0);
  const done = (api.profile.trailsDone[def.id] ?? []).length;
  return (
    <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="panel" style={{ overflow: 'hidden' }}>
        <ResortArt def={def} height={260} />
        <div className="card col">
          <div className="row"><h2 style={{ margin: 0, flex: 1 }}>{def.name}</h2><Back onClick={props.onBack} label="All resorts" /></div>
          <div className="muted">{def.description}</div>
          <Distribution def={def} />
          <div className="small">Base {def.baseAlt} m · Summit {def.baseAlt + def.vertical} m · {def.vertical} m vertical</div>
          <div className="small">Lifts: {def.lifts.map((l) => `${l.name} (${l.type === 'surface' ? 'surface' : l.type})`).join(', ')}</div>
          <div className="small">Parks: {def.parks.length ? def.parks.join(', ') : 'none'} · Racecourses: {def.races.length ? def.races.map((r) => DISCIPLINE_INFO[r].label).join(', ') : 'none'}</div>
          <div className="small muted">Trails skied: {done} / {total}</div>
        </div>
      </div>
      <div className="panel card col">
        <h3>Conditions</h3>
        <label className="field">Weather
          <select value={props.weather} onChange={(e) => props.setWeather(e.target.value as WeatherKind | 'random')} data-testid="weather">
            <option value="random">Random</option>
            {(Object.keys(WEATHER_LABEL) as WeatherKind[]).map((w) => <option key={w} value={w}>{WEATHER_LABEL[w]}</option>)}
          </select>
        </label>
        <label className="field">Time of day
          <select value={props.hour} onChange={(e) => props.setHour(Number(e.target.value))}>
            {HOURS.map(([h, l]) => <option key={h} value={h}>{l}</option>)}
          </select>
        </label>
        <label className="row small"><input type="checkbox" checked={props.dyn} onChange={(e) => props.setDyn(e.target.checked)} /> Dynamic weather &amp; time of day</label>
        <label className="field">Equipment
          <select value={api.profile.board} onChange={(e) => api.update((p) => { p.board = e.target.value as 'ski' | 'snowboard'; })}>
            <option value="ski">Skis</option><option value="snowboard">Snowboard</option>
          </select>
        </label>
        <button className="btn primary" disabled={!open} onClick={props.onStart} data-testid="start-freeride">{open ? `Ride ${def.name}` : '🔒 Locked'}</button>
        {!open && <div className="small muted">Reach {STAGES[def.unlock.stage].name} with {def.unlock.medals} medals in Career mode to unlock.</div>}
        <div className="small muted">Tip: press <span className="keycap">M</span> in game for the trail map — pick any trail to ski it or fast-travel to lift tops you have ridden.</div>
      </div>
    </div>
  );
}

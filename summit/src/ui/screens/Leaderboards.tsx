import type { AppApi } from '../App';
import { RESORTS } from '../../data/resorts';
import { DISCIPLINE_INFO } from '../../data/names';
import { AI_LEVELS } from '../../ai/racerAI';
import { Back, Coins } from '../components/common';
import { formatTime } from '../../core/math';

export function Leaderboards({ api }: { api: AppApi }) {
  const p = api.profile;
  const kmh = (v: number) => (p.settings.units === 'mph' ? `${Math.round(v * 2.237)} mph` : `${Math.round(v * 3.6)} km/h`);
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>LEADERBOARDS</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content grid cols-2" style={{ alignItems: 'start' }}>
        <div className="panel card">
          <h3>Personal race records</h3>
          <table className="res">
            <thead><tr><th>Course</th><th>Board</th><th>Time</th><th>AI level</th></tr></thead>
            <tbody>
              {RESORTS.flatMap((r) => r.races.map((d, i) => {
                const rows = (['ski', 'snowboard'] as const).map((b) => ({ b, rec: p.records[`${r.id}:${i}:${b}`] })).filter((x) => x.rec);
                if (!rows.length) return [<tr key={`${r.id}${i}`}><td>{r.name} {DISCIPLINE_INFO[d].label}</td><td>—</td><td className="muted">no time</td><td /></tr>];
                return rows.map(({ b, rec }) => <tr key={`${r.id}${i}${b}`}><td>{r.name} {DISCIPLINE_INFO[d].label}</td><td>{b}</td><td>{formatTime(rec!.time)}</td><td>{AI_LEVELS[rec!.level]?.name}</td></tr>);
              }))}
            </tbody>
          </table>
        </div>
        <div className="col">
          <div className="panel card col">
            <h3>Freestyle</h3>
            <div>Best trick: {p.bestTrick ? `${p.bestTrick.name} — ${p.bestTrick.score.toLocaleString()} pts` : '—'}</div>
            <div>Best combo: {p.bestCombo.toLocaleString()} pts</div>
            <div>Tricks landed: {p.stats.tricks.toLocaleString()}</div>
            <div>Longest air: {p.stats.maxAir.toFixed(2)} s</div>
          </div>
          <div className="panel card col">
            <h3>Mountain stats</h3>
            <div>Distance skied: {(p.stats.distance / 1000).toFixed(1)} km</div>
            <div>Top speed: {kmh(p.stats.topSpeed)}</div>
            <div>Trails completed: {Object.values(p.trailsDone).reduce((a, b) => a + b.length, 0)} / 203</div>
            <div>Lifts ridden: {Object.values(p.ridden).reduce((a, b) => a + b.length, 0)} / 43</div>
            <div>Races entered: {p.stats.races} · Crashes: {p.stats.crashes}</div>
            <div>Medals: 🥇 {p.medals.gold} · 🥈 {p.medals.silver} · 🥉 {p.medals.bronze}</div>
          </div>
          <div className="panel card col">
            <h3>Trails by resort</h3>
            {RESORTS.map((r) => {
              const total = Object.values(r.trails).reduce((a, b) => a + (b ?? 0), 0);
              const done = (p.trailsDone[r.id] ?? []).length;
              return <div key={r.id} className="row small"><span style={{ width: 150 }}>{r.name}</span><div className="progress" style={{ flex: 1 }}><div style={{ width: `${(done / total) * 100}%` }} /></div><span>{done}/{total}</span></div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

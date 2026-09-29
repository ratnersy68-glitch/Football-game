import { useState } from 'react';
import { CONFERENCES, TEAM_BY_ID, UNIVERSE_TEAMS, rivalryBetween } from '../../data';
import { navigate } from '../../app/store';
import { TeamBadge } from '../components/common';

const FEATURED: [string, string][] = [
  ['michigan', 'ohio_state'],
  ['georgia', 'alabama'],
  ['oklahoma', 'texas'],
  ['auburn', 'alabama'],
  ['texas_am', 'texas'],
  ['iowa_state', 'iowa'],
  ['kansas_state', 'kansas'],
  ['usc', 'ucla'],
];

function TeamPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <select className="field-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ minWidth: 220 }}>
      {CONFERENCES.filter((c) => c.playable).map((c) => (
        <optgroup key={c.id} label={c.name}>
          {UNIVERSE_TEAMS.filter((t) => t.conference === c.id).map((t) => (
            <option key={t.id} value={t.id}>
              {t.school}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}

export function QuickSim() {
  const [away, setAway] = useState('michigan');
  const [home, setHome] = useState('ohio_state');
  const [seed, setSeed] = useState('');
  const play = (h: string, a: string) => {
    const s = seed.trim() ? Number(seed.trim()) || 1 : Math.floor(Math.random() * 1e9);
    navigate({ name: 'quickGame', homeId: h, awayId: a, seed: s });
  };
  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate({ name: 'menu' })}>
          ← Menu
        </button>
        <h1>Quick Sim</h1>
      </div>
      <div className="panel">
        <div className="row wrap" style={{ gap: 18, justifyContent: 'center' }}>
          <div className="col" style={{ alignItems: 'center' }}>
            <TeamBadge teamId={away} size={84} />
            <TeamPicker value={away} onChange={setAway} />
            <span className="muted">AWAY</span>
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 36 }} className="muted">
            @
          </div>
          <div className="col" style={{ alignItems: 'center' }}>
            <TeamBadge teamId={home} size={84} />
            <TeamPicker value={home} onChange={setHome} />
            <span className="muted">HOME</span>
          </div>
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 18 }}>
          <input className="field-input" placeholder="Seed (optional, e.g. 48291)" value={seed} onChange={(e) => setSeed(e.target.value.replace(/[^0-9]/g, ''))} style={{ width: 220 }} />
          <button className="btn primary" disabled={home === away} onClick={() => play(home, away)}>
            Kick Off
          </button>
        </div>
        <div className="muted center" style={{ fontSize: 12, marginTop: 8 }}>
          Same matchup + same seed = the exact same game, play for play.
        </div>
      </div>
      <h3 style={{ margin: '22px 0 10px' }} className="muted">
        Featured Rivalries
      </h3>
      <div className="grid cards">
        {FEATURED.map(([a, h]) => (
          <div key={a + h} className="school-card" onClick={() => play(h, a)}>
            <div className="row">
              <TeamBadge teamId={a} size={40} />
              <span className="muted">@</span>
              <TeamBadge teamId={h} size={40} />
              <div className="grow">
                <div style={{ fontFamily: 'var(--display)', fontSize: 16, textTransform: 'uppercase' }}>
                  {TEAM_BY_ID[a].school} @ {TEAM_BY_ID[h].school}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>
                  {rivalryBetween(a, h)?.name}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

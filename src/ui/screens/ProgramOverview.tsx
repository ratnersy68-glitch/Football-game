import { useMemo, useState } from 'react';
import { CONFERENCE_BY_ID, DEF_SCHEMES, OFF_SCHEMES, TEAM_BY_ID, rivalsOf } from '../../data';
import { autosave, navigate, setState, toast } from '../../app/store';
import { createDynasty } from '../../simulation/seasonEngine';
import type { DefScheme, OffScheme } from '../../models/types';
import { previewWorld } from '../preview';
import { Meter, Stars, TeamBadge, prestigeStars, textOn } from '../components/common';
import { programRating } from './TeamSelect';
import { classLabel } from '../../simulation/playerRatings';

export function ProgramOverview({ teamId, seed }: { teamId: string; seed: number }) {
  const t = TEAM_BY_ID[teamId];
  const preview = useMemo(() => previewWorld(seed), [seed]);
  const r = preview.ratings[teamId];
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [off, setOff] = useState<OffScheme>(t.offense);
  const [def, setDef] = useState<DefScheme>(t.defense);
  const [busy, setBusy] = useState(false);
  const rivals = rivalsOf(teamId).slice(0, 4);
  const state = preview.world.teams[teamId];
  const topPlayers = state.rosterIds
    .map((id) => preview.world.players[id])
    .sort((a, b) => b.overall - a.overall)
    .slice(0, 5);

  const start = async () => {
    setBusy(true);
    // Let the button state paint before the (fast but synchronous) world build.
    await new Promise((res) => setTimeout(res, 20));
    try {
      const d = createDynasty({ teamId, coachFirstName: first || 'Chris', coachLastName: last || 'Taylor', offScheme: off, defScheme: def, seed });
      setState({ dynasty: d, slotId: null, slotName: null });
      await autosave();
      navigate({ name: 'hub', tab: 'home' });
    } catch (e) {
      toast(`Failed to create dynasty: ${(e as Error).message}`);
      setBusy(false);
    }
  };

  const rows: [string, number][] = [
    ['Roster', r.overall],
    ['Offense', r.offense],
    ['Defense', r.defense],
    ['Recruiting', t.recruitingPower],
    ['NIL', t.nilStrength],
    ['Facilities', t.facilities],
    ['Fan Support', t.fanSupport],
    ['Academics', t.academicPrestige],
  ];

  return (
    <div className="page">
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate({ name: 'teamSelect', seed, conference: t.conference })}>
          ← Programs
        </button>
      </div>
      <div className="hero" style={{ background: `linear-gradient(120deg, ${t.primaryColor} 0%, ${t.primaryColor}cc 45%, #0b0f18 100%)`, color: textOn(t.primaryColor) }}>
        <div className="row" style={{ gap: 24 }}>
          <TeamBadge teamId={teamId} size={120} />
          <div>
            <div className="sub">
              {CONFERENCE_BY_ID[t.conference].name} · {t.city}, {t.state}
            </div>
            <div className="big">{t.school}</div>
            <div className="sub">{t.nickname}</div>
          </div>
          <div className="spacer" />
          <div className="center">
            <div className="sub" style={{ fontSize: 14 }}>
              Program
            </div>
            <div className="big" style={{ fontSize: 72 }}>
              {programRating(t, r.overall)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginTop: 18 }}>
        <div className="panel">
          <h3>Program Profile</h3>
          <div className="kv">
            <div className="k">Prestige</div>
            <div>
              <Stars n={prestigeStars(t.prestige)} /> <span className="muted">({t.prestige})</span>
            </div>
            <div className="k">Stadium</div>
            <div>
              {t.stadium} <span className="muted">· {t.capacity.toLocaleString()}</span>
            </div>
            <div className="k">Key Rivals</div>
            <div>{rivals.length ? rivals.map((x) => `${x.rival.school} (${x.rivalry.name})`).join(', ') : '—'}</div>
            <div className="k">Identity</div>
            <div>
              {OFF_SCHEMES[t.offense].name} offense · {DEF_SCHEMES[t.defense].name} defense
            </div>
            <div className="k">Pipeline</div>
            <div>{t.recruitingStates.join(', ')}</div>
            <div className="k">Job Security</div>
            <div>N/A — new hire</div>
          </div>
        </div>
        <div className="panel">
          <h3>Ratings</h3>
          <div className="col" style={{ gap: 8 }}>
            {rows.map(([k, v]) => (
              <div key={k} className="row" style={{ gap: 10 }}>
                <div style={{ width: 90 }} className="muted">
                  {k}
                </div>
                <div className="grow">
                  <Meter v={v} />
                </div>
                <div style={{ width: 28, fontFamily: 'var(--display)', fontSize: 16 }} className="right">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Top Players</h3>
          <table className="data">
            <tbody>
              {topPlayers.map((p) => (
                <tr key={p.id}>
                  <td>{p.position}</td>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="muted">{classLabel(p)}</td>
                  <td className="num">
                    <b>{p.overall}</b>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 18 }}>
        <h3>Your Head Coach</h3>
        <div className="row wrap" style={{ alignItems: 'flex-end' }}>
          <div className="col" style={{ gap: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>
              FIRST NAME
            </span>
            <input className="field-input" value={first} placeholder="Chris" onChange={(e) => setFirst(e.target.value)} maxLength={20} />
          </div>
          <div className="col" style={{ gap: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>
              LAST NAME
            </span>
            <input className="field-input" value={last} placeholder="Taylor" onChange={(e) => setLast(e.target.value)} maxLength={24} />
          </div>
          <div className="col" style={{ gap: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>
              OFFENSE
            </span>
            <select className="field-input" value={off} onChange={(e) => setOff(e.target.value as OffScheme)}>
              {Object.entries(OFF_SCHEMES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="col" style={{ gap: 4 }}>
            <span className="muted" style={{ fontSize: 11 }}>
              DEFENSE
            </span>
            <select className="field-input" value={def} onChange={(e) => setDef(e.target.value as DefScheme)}>
              {Object.entries(DEF_SCHEMES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
          <div className="spacer" />
          <button className="btn primary" style={{ fontSize: 18, padding: '12px 26px' }} onClick={start} disabled={busy}>
            {busy ? 'Building world…' : 'Become Head Coach'}
          </button>
        </div>
        <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          Schemes affect play calling and how well your current players fit. The program's traditional identity is preselected.
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { ATTRIBUTE_LABELS, POSITIONS, POSITION_ORDER, TEAM_BY_ID, archetypeName } from '../../data';
import { useStore } from '../../app/store';
import type { Player, Position, StatLine } from '../../models/types';
import { classLabel, schemeFit } from '../../simulation/playerRatings';
import { formatHeight } from '../../core/util';
import { Ovr, Stars } from '../components/common';

function statSummary(p: Player, s: StatLine): string {
  const n = (v?: number) => v ?? 0;
  const parts: string[] = [];
  if (n(s.passAtt)) parts.push(`${n(s.passComp)}/${n(s.passAtt)}, ${n(s.passYds)} yds, ${n(s.passTD)} TD, ${n(s.passInt)} INT`);
  if (n(s.rushAtt) && (p.position === 'RB' || p.position === 'QB' || n(s.rushAtt) > 3)) parts.push(`${n(s.rushAtt)} car, ${n(s.rushYds)} yds, ${n(s.rushTD)} TD`);
  if (n(s.rec)) parts.push(`${n(s.rec)} rec, ${n(s.recYds)} yds, ${n(s.recTD)} TD`);
  if (n(s.tackles) || n(s.sacks) || n(s.defInt)) parts.push(`${n(s.tackles)} tkl, ${n(s.tfl)} TFL, ${n(s.sacks)} sck, ${n(s.defInt)} INT`);
  if (n(s.fga) || n(s.xpa)) parts.push(`FG ${n(s.fgm)}/${n(s.fga)}, XP ${n(s.xpm)}/${n(s.xpa)}`);
  if (n(s.punts)) parts.push(`${n(s.punts)} punts, ${(n(s.puntYds) / n(s.punts)).toFixed(1)} avg`);
  return parts.join(' · ') || '—';
}

export function PlayerModal({ player: p, onClose }: { player: Player; onClose: () => void }) {
  const { dynasty: d } = useStore();
  const team = TEAM_BY_ID[p.teamId];
  const ts = d?.teams[p.teamId];
  const fit = ts ? schemeFit(p, ts.offScheme, ts.defScheme) : 0.8;
  const attrs = Object.keys(POSITIONS[p.position].weights);
  const color = (v: number) => (v >= 88 ? '#3ddc84' : v >= 78 ? '#5fb4ff' : v >= 68 ? '#f1d36b' : '#ff7a7a');
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="player-head" style={{ background: `linear-gradient(110deg, ${team.primaryColor}, #131927 70%)` }}>
          <div className="num">{p.jersey}</div>
          <div className="grow">
            <div className="muted" style={{ color: 'rgba(255,255,255,.75)' }}>
              {p.position} · {archetypeName(p.position, p.archetype)} · {classLabel(p)}
            </div>
            <div className="pname">
              {p.firstName} {p.lastName}
            </div>
            <div style={{ color: 'rgba(255,255,255,.8)', fontSize: 13 }}>
              {formatHeight(p.height)} · {p.weight} lbs · {p.hometown}, {p.state} · <Stars n={p.stars} />
            </div>
          </div>
          <div className="center">
            <div className="muted" style={{ fontSize: 11 }}>
              OVR
            </div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 48 }}>{p.overall}</div>
          </div>
          <button className="btn small" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ padding: 20 }} className="col">
          {p.injury && (
            <div className="pill inj" style={{ alignSelf: 'flex-start' }}>
              INJURED: {p.injury.type} — out {p.injury.weeksRemaining} more week{p.injury.weeksRemaining === 1 ? '' : 's'}
            </div>
          )}
          <div className="row wrap" style={{ gap: 18 }}>
            <span className="muted">
              Potential: <b style={{ color: '#fff' }}>{p.potential >= 90 ? 'Elite' : p.potential >= 82 ? 'High' : p.potential >= 72 ? 'Solid' : 'Limited'}</b>
            </span>
            <span className="muted">
              Scheme fit: <b style={{ color: '#fff' }}>{fit >= 0.95 ? 'Ideal' : fit >= 0.8 ? 'Good' : fit >= 0.65 ? 'Fair' : 'Poor'}</b>
            </span>
          </div>
          <div className="attr-grid">
            {attrs.map((k) => (
              <div key={k} className="attr">
                <span>{ATTRIBUTE_LABELS[k] ?? k}</span>
                <b className="right">{p.attributes[k]}</b>
                <div className="bar">
                  <div style={{ width: `${p.attributes[k]}%`, background: color(p.attributes[k]) }} />
                </div>
              </div>
            ))}
          </div>
          <div>
            <h4 className="muted" style={{ marginBottom: 4 }}>
              Season Stats
            </h4>
            <div>
              {p.seasonStats.gp ? `${p.seasonStats.gp} GP · ` : ''}
              {statSummary(p, p.seasonStats)}
            </div>
          </div>
          <div>
            <h4 className="muted" style={{ marginBottom: 4 }}>
              Career
            </h4>
            <div>{statSummary(p, p.careerStats)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

type SortKey = 'pos' | 'ovr' | 'pot' | 'year' | 'name';

export function RosterPage() {
  const { dynasty: d } = useStore();
  const [pos, setPos] = useState<Position | 'ALL'>('ALL');
  const [sort, setSort] = useState<SortKey>('pos');
  const [sel, setSel] = useState<Player | null>(null);
  if (!d) return null;
  const team = d.teams[d.userTeamId];
  let players = team.rosterIds.map((id) => d.players[id]).filter(Boolean);
  if (pos !== 'ALL') players = players.filter((p) => p.position === pos);
  players.sort((a, b) => {
    switch (sort) {
      case 'ovr':
        return b.overall - a.overall;
      case 'pot':
        return b.potential - a.potential;
      case 'year':
        return b.year - a.year || b.overall - a.overall;
      case 'name':
        return a.lastName.localeCompare(b.lastName);
      default:
        return POSITION_ORDER.indexOf(a.position) - POSITION_ORDER.indexOf(b.position) || team.depthChart[a.position].indexOf(a.id) - team.depthChart[b.position].indexOf(b.id);
    }
  });
  const th = (k: SortKey, label: string, cls = '') => (
    <th className={`sortable ${cls}`} onClick={() => setSort(k)} style={sort === k ? { color: 'var(--accent)' } : undefined}>
      {label}
    </th>
  );
  return (
    <div className="col">
      <div className="row wrap" style={{ gap: 4 }}>
        {(['ALL', ...POSITION_ORDER] as const).map((p) => (
          <button key={p} className={`btn small ${pos === p ? 'active' : ''}`} onClick={() => setPos(p)}>
            {p}
          </button>
        ))}
        <span className="spacer" />
        <span className="muted">{team.rosterIds.length} scholarship players</span>
      </div>
      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="data">
          <thead>
            <tr>
              {th('pos', 'Pos')}
              <th>#</th>
              {th('name', 'Name')}
              {th('year', 'Class')}
              <th>Archetype</th>
              <th>Ht/Wt</th>
              <th>Hometown</th>
              <th>Stars</th>
              {th('ovr', 'OVR', 'num')}
              {th('pot', 'POT', 'num')}
              <th>Season</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
              <tr key={p.id} onClick={() => setSel(p)} style={{ cursor: 'pointer' }}>
                <td>
                  <b>{p.position}</b>
                </td>
                <td className="muted">{p.jersey}</td>
                <td>
                  {p.firstName} {p.lastName} {p.injury && <span className="pill inj">INJ {p.injury.weeksRemaining}w</span>}
                </td>
                <td>{classLabel(p)}</td>
                <td className="muted">{archetypeName(p.position, p.archetype)}</td>
                <td className="muted">
                  {formatHeight(p.height)} / {p.weight}
                </td>
                <td className="muted">
                  {p.hometown}, {p.state}
                </td>
                <td>
                  <Stars n={p.stars} />
                </td>
                <td className="num">
                  <Ovr v={p.overall} />
                </td>
                <td className="num muted">{p.potential >= 90 ? 'A' : p.potential >= 82 ? 'B' : p.potential >= 72 ? 'C' : 'D'}</td>
                <td className="muted" style={{ fontSize: 12 }}>
                  {statSummary(p, p.seasonStats)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sel && <PlayerModal player={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

import { useState } from 'react';
import { CONFERENCE_BY_ID, TEAM_BY_ID } from '../../data';
import { useStore } from '../../app/store';
import type { SeasonHistory } from '../../models/types';
import { TeamBadge } from '../components/common';
import { AwardsPanel } from './SeasonCards';

function SeasonDetail({ h }: { h: SeasonHistory }) {
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div className="panel">
          <h3>Final Top 25</h3>
          {h.finalTop25.map((e, i) => (
            <div key={e.teamId} className="row" style={{ padding: '2px 0', fontSize: 13 }}>
              <b style={{ width: 22 }}>{i + 1}</b>
              <TeamBadge teamId={e.teamId} size={18} />
              <span className="grow">{TEAM_BY_ID[e.teamId].school}</span>
              <span className="muted mono">
                {e.w}-{e.l}
              </span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Champions</h3>
          <div className="kv">
            <div className="k">National</div>
            <div>{h.champion ? `${TEAM_BY_ID[h.champion].school} (def. ${TEAM_BY_ID[h.runnerUp!]?.school} ${h.titleScore})` : '—'}</div>
            {Object.entries(h.conferenceChampions).map(([c, t]) => (
              <div key={c} style={{ display: 'contents' }}>
                <div className="k">{CONFERENCE_BY_ID[c]?.name}</div>
                <div>{TEAM_BY_ID[t].school}</div>
              </div>
            ))}
            <div className="k">Playoff field</div>
            <div style={{ fontSize: 12 }}>{h.cfpField.map((t, i) => `${i + 1}. ${TEAM_BY_ID[t].abbreviation}`).join('  ')}</div>
            <div className="k">#1 class</div>
            <div>{h.topClass ? TEAM_BY_ID[h.topClass].school : '—'}</div>
          </div>
        </div>
        <div className="panel">
          <h3>NFL Draft · first round</h3>
          {h.draft.filter((p) => p.round === 1).map((p) => (
            <div key={p.playerId} className="row" style={{ fontSize: 12.5, padding: '2px 0' }}>
              <span className="muted" style={{ width: 22 }}>
                {p.pick}
              </span>
              <TeamBadge teamId={p.teamId} size={16} />
              <span>
                {p.playerName} <span className="muted">{p.position}</span>
              </span>
            </div>
          ))}
          {!h.draft.length && <div className="muted">The draft happens when you advance to the offseason.</div>}
        </div>
      </div>
      <AwardsPanel awards={h.awards} />
    </div>
  );
}

export function HistoryPage() {
  const { dynasty: d } = useStore();
  const [sel, setSel] = useState<number | null>(null);
  if (!d) return null;
  const seasons = [...d.history].sort((a, b) => b.season - a.season);
  if (!seasons.length) return <div className="panel muted">Dynasty history is recorded when a season is complete (after the national championship).</div>;
  const selected = seasons.find((h) => h.season === sel);
  return (
    <div className="col" style={{ gap: 16 }}>
      <div className="panel" style={{ padding: 0, overflowX: 'auto' }}>
        <table className="data">
          <thead>
            <tr>
              <th>Season</th>
              <th>National Champion</th>
              <th>Heisman</th>
              <th>#1 Class</th>
              <th>Your Team</th>
              <th className="num">Record</th>
              <th className="num">Final</th>
              <th>Postseason</th>
            </tr>
          </thead>
          <tbody>
            {seasons.map((h) => {
              const heis = h.awards.find((a) => a.id === 'heisman');
              return (
                <tr key={h.season} onClick={() => setSel(h.season)} style={{ cursor: 'pointer' }} className={h.champion === h.user.teamId ? 'me' : ''}>
                  <td>
                    <b>{h.season}</b>
                  </td>
                  <td>
                    <span className="row" style={{ gap: 6 }}>
                      {h.champion && <TeamBadge teamId={h.champion} size={20} />}
                      {h.champion ? TEAM_BY_ID[h.champion].school : '—'}
                    </span>
                  </td>
                  <td>{heis ? `${heis.winnerName}, ${TEAM_BY_ID[heis.teamId].abbreviation}` : '—'}</td>
                  <td>{h.topClass ? TEAM_BY_ID[h.topClass].school : '—'}</td>
                  <td>{TEAM_BY_ID[h.user.teamId].school}</td>
                  <td className="num">
                    {h.user.w}-{h.user.l}
                  </td>
                  <td className="num">{h.user.finalRank ? `#${h.user.finalRank}` : 'NR'}</td>
                  <td>{h.user.postseason}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {selected ? <SeasonDetail h={selected} /> : <div className="muted">Select a season for the full record.</div>}
    </div>
  );
}

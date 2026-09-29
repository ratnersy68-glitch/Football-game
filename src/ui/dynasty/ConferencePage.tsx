import { useState } from 'react';
import { CONFERENCES, TEAM_BY_ID } from '../../data';
import { useStore } from '../../app/store';
import { conferenceStandings } from '../../simulation/standings';
import { currentRank } from '../../simulation/rankingEngine';
import { TeamBadge } from '../components/common';

export function ConferencePage() {
  const { dynasty: d } = useStore();
  const [conf, setConf] = useState(d ? TEAM_BY_ID[d.userTeamId].conference : 'big_ten');
  if (!d) return null;
  const confs = CONFERENCES.filter((c) => c.playable);
  const rows = conferenceStandings(d, conf);
  const cfg = confs.find((c) => c.id === conf)!;
  return (
    <div>
      <div className="tabs">
        {confs.map((c) => (
          <button key={c.id} className={`tab ${c.id === conf ? 'active' : ''}`} onClick={() => setConf(c.id)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="panel" style={{ padding: 0 }}>
        <table className="data">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th className="num">Conf</th>
              <th className="num">Overall</th>
              <th className="num">PF</th>
              <th className="num">PA</th>
              <th className="num">Streak</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const rank = currentRank(d, r.teamId);
              return (
                <tr key={r.teamId} className={r.teamId === d.userTeamId ? 'me' : ''}>
                  <td className="muted" style={{ borderLeft: i < cfg.championshipGame.participants ? '3px solid var(--accent)' : undefined }}>
                    {i + 1}
                  </td>
                  <td>
                    <span className="row" style={{ gap: 8 }}>
                      <TeamBadge teamId={r.teamId} size={24} />
                      {rank ? <span className="muted">#{rank}</span> : null}
                      {TEAM_BY_ID[r.teamId].school}
                    </span>
                  </td>
                  <td className="num">
                    <b>
                      {r.confW}-{r.confL}
                    </b>
                  </td>
                  <td className="num">
                    {r.w}-{r.l}
                  </td>
                  <td className="num">{r.pf}</td>
                  <td className="num">{r.pa}</td>
                  <td className="num">{r.streak === 0 ? '—' : r.streak > 0 ? `W${r.streak}` : `L${-r.streak}`}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="muted" style={{ padding: 12, fontSize: 12 }}>
          Top {cfg.championshipGame.participants} (highlighted) would meet in the {cfg.name} Championship. Tiebreakers: conference win %, head-to-head, overall win %, point differential, power rating.
        </div>
      </div>
    </div>
  );
}

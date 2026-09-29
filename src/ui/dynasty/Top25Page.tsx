import { useState } from 'react';
import { CONFERENCE_BY_ID, TEAM_BY_ID } from '../../data';
import { useStore } from '../../app/store';
import { TeamBadge } from '../components/common';

export function Top25Page() {
  const { dynasty: d } = useStore();
  const weeks = d?.rankings.filter((r) => r.season === d.season) ?? [];
  const [idx, setIdx] = useState(weeks.length - 1);
  if (!d || !weeks.length) return null;
  const i = Math.min(Math.max(0, idx), weeks.length - 1);
  const week = weeks[i];
  return (
    <div className="panel" style={{ padding: 0 }}>
      <div className="row" style={{ padding: 14, borderBottom: '1px solid var(--line)' }}>
        <h2>Top 25</h2>
        <span className="muted">{week.week === 0 ? 'Preseason' : `After Week ${week.week}`}</span>
        <span className="spacer" />
        <button className="btn small" disabled={i === 0} onClick={() => setIdx(i - 1)}>
          ◀
        </button>
        <select className="field-input" value={i} onChange={(e) => setIdx(Number(e.target.value))}>
          {weeks.map((w, k) => (
            <option key={k} value={k}>
              {w.week === 0 ? 'Preseason' : `Week ${w.week}`}
            </option>
          ))}
        </select>
        <button className="btn small" disabled={i === weeks.length - 1} onClick={() => setIdx(i + 1)}>
          ▶
        </button>
      </div>
      {week.poll.map((e) => {
        const move = e.previousRank ? e.previousRank - e.rank : 0;
        const t = TEAM_BY_ID[e.teamId];
        return (
          <div key={e.teamId} className={`rank-row ${e.teamId === d.userTeamId ? 'me' : ''}`}>
            <div className="rk">{e.rank}</div>
            <div>
              {week.week === 0 ? null : !e.previousRank ? (
                <span className="move-up">NEW</span>
              ) : move > 0 ? (
                <span className="move-up">▲{move}</span>
              ) : move < 0 ? (
                <span className="move-down">▼{-move}</span>
              ) : (
                <span className="muted">—</span>
              )}
            </div>
            <TeamBadge teamId={e.teamId} size={34} />
            <div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, textTransform: 'uppercase' }}>{t.school}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {CONFERENCE_BY_ID[t.conference].name}
              </div>
            </div>
            <div className="mono" style={{ fontFamily: 'var(--display)', fontSize: 18 }}>
              {e.w}-{e.l}
            </div>
            <div className="muted mono" style={{ fontSize: 12 }}>
              {e.score}
            </div>
          </div>
        );
      })}
      <div className="muted" style={{ padding: 12, fontSize: 12 }}>
        Poll blends a power rating with record, strength of schedule, quality wins and bad losses. Only Big Ten, SEC and Big 12 programs are ranked in this build.
      </div>
    </div>
  );
}

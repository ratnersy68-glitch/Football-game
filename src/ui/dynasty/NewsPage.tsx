import { useState } from 'react';
import { useStore } from '../../app/store';
import { TeamBadge } from '../components/common';

export function NewsPage() {
  const { dynasty: d } = useStore();
  const [mine, setMine] = useState(false);
  if (!d) return null;
  const items = [...d.news]
    .filter((n) => !mine || n.teamIds.includes(d.userTeamId))
    .sort((a, b) => b.season - a.season || b.week - a.week || b.importance - a.importance)
    .slice(0, 250);
  return (
    <div className="panel">
      <div className="row" style={{ marginBottom: 8 }}>
        <h2>College Football Today</h2>
        <span className="spacer" />
        <button className={`btn small ${!mine ? 'active' : ''}`} onClick={() => setMine(false)}>
          All
        </button>
        <button className={`btn small ${mine ? 'active' : ''}`} onClick={() => setMine(true)}>
          My Program
        </button>
      </div>
      {items.map((n) => (
        <div key={n.id} className="news-item">
          <TeamBadge teamId={n.teamIds[0]} size={32} />
          <div className="grow">
            <div className="when">
              {n.season} · {n.week === 0 ? 'Preseason' : `Week ${n.week}`}
            </div>
            <div className="hl">{n.headline}</div>
          </div>
          <span className={`news-tag ${n.type}`}>{n.type}</span>
        </div>
      ))}
      {!items.length && <div className="muted">No news yet.</div>}
    </div>
  );
}

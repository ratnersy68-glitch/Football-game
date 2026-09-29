import { DEF_SCHEMES, OFF_SCHEMES, TEAM_BY_ID } from '../../data';
import { useStore } from '../../app/store';
import { Meter } from '../components/common';

export function CoachPage() {
  const { dynasty: d } = useStore();
  if (!d) return null;
  const c = d.coaches[d.userCoachId];
  const team = d.teams[d.userTeamId];
  const staff = (['OC', 'DC'] as const).map((r) => d.coaches[team.coachIds[r]]).filter(Boolean);
  const rows = Object.entries(c.ratings) as [string, number][];
  const pct = c.careerWins + c.careerLosses ? ((100 * c.careerWins) / (c.careerWins + c.careerLosses)).toFixed(1) : '0.0';
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
      <div className="panel">
        <h3>Head Coach</h3>
        <div style={{ fontFamily: 'var(--display)', fontSize: 34, textTransform: 'uppercase' }}>
          {c.firstName} {c.lastName}
        </div>
        <div className="muted">
          {TEAM_BY_ID[d.userTeamId].school} · Age {c.age} · {c.contractYears}-year contract
        </div>
        <div className="stat-grid" style={{ marginTop: 14 }}>
          <div className="stat">
            <div className="k">Career</div>
            <div className="v">
              {c.careerWins}-{c.careerLosses}
            </div>
          </div>
          <div className="stat">
            <div className="k">Win %</div>
            <div className="v">{pct}</div>
          </div>
          <div className="stat">
            <div className="k">Reputation</div>
            <div className="v">{c.reputation}</div>
          </div>
        </div>
        <div className="kv" style={{ marginTop: 14 }}>
          <div className="k">Offense</div>
          <div>{OFF_SCHEMES[team.offScheme].name}</div>
          <div className="k">Defense</div>
          <div>{DEF_SCHEMES[team.defScheme].name}</div>
          <div className="k">National titles</div>
          <div>{c.natTitles ?? 0}</div>
          <div className="k">Conf titles</div>
          <div>{c.confTitles ?? 0}</div>
          <div className="k">Playoff trips</div>
          <div>{c.playoffApps ?? 0}</div>
          <div className="k">Bowl/playoff record</div>
          <div>
            {c.bowlWins ?? 0}-{c.bowlLosses ?? 0}
          </div>
          <div className="k">NFL draft picks</div>
          <div>{c.draftPicks ?? 0}</div>
          <div className="k">Heisman winners</div>
          <div>{c.heismans ?? 0}</div>
          <div className="k">Top-5 classes</div>
          <div>{c.top5Classes ?? 0}</div>
          <div className="k">Coach of the Year</div>
          <div>{c.coyAwards ?? 0}</div>
        </div>
        {(c.seasons ?? []).length > 0 && (
          <table className="data" style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>Season</th>
                <th>Team</th>
                <th className="num">W-L</th>
                <th className="num">Rank</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {[...(c.seasons ?? [])].reverse().map((s) => (
                <tr key={s.season}>
                  <td>{s.season}</td>
                  <td>{TEAM_BY_ID[s.teamId].school}</td>
                  <td className="num">
                    {s.w}-{s.l}
                  </td>
                  <td className="num">{s.finalRank ? `#${s.finalRank}` : 'NR'}</td>
                  <td>{s.result}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="panel">
        <h3>Coach Ratings</h3>
        {rows.map(([k, v]) => (
          <div key={k} className="row" style={{ marginBottom: 6 }}>
            <span style={{ width: 130, textTransform: 'capitalize' }} className="muted">
              {k.replace(/([A-Z])/g, ' $1')}
            </span>
            <div className="grow">
              <Meter v={v} />
            </div>
            <b style={{ width: 26 }} className="right">
              {v}
            </b>
          </div>
        ))}
      </div>
      <div className="panel">
        <h3>Coordinators</h3>
        {staff.map((s) => (
          <div key={s.id} style={{ padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
            <div>
              <b>{s.role}</b> {s.firstName} {s.lastName} <span className="muted">· age {s.age}</span>
            </div>
            <div className="muted" style={{ fontSize: 12 }}>
              Offense {s.ratings.offense} · Defense {s.ratings.defense} · Development {s.ratings.development} · Recruiting {s.ratings.recruiting}
            </div>
          </div>
        ))}
        <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
          Coordinator quality feeds directly into the game engine (unit performance bonus). Hiring and firing arrives with the coaching carousel.
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CONFERENCE_BY_ID, TEAM_BY_ID, RIVALRIES } from '../../data';
import { autosave, bump, navigate, useStore } from '../../app/store';
import { completeWeek, simulateGameFully, userGame } from '../../simulation/seasonEngine';
import { currentRank, winProbability } from '../../simulation/rankingEngine';
import { conferenceStandings } from '../../simulation/standings';
import { teamRatings } from '../../simulation/teamRatings';
import { TeamBadge, textOn } from '../components/common';
import type { Dynasty, Game } from '../../models/types';
import { BoxScoreModal } from './SchedulePage';
import { NoGameCard, OffseasonCard, SeasonCompleteCard } from './SeasonCards';

function projection(rank: number): string {
  if (!rank) return 'Outside the playoff picture';
  if (rank <= 4) return `In — projected top-4 seed (#${rank})`;
  if (rank <= 12) return `In the field (#${rank})`;
  if (rank <= 18) return 'On the bubble';
  return 'Needs a strong finish';
}

function NextGameCard({ d, g, onResult }: { d: Dynasty; g: Game; onResult: (g: Game) => void }) {
  const isHome = g.homeId === d.userTeamId;
  const oppId = isHome ? g.awayId : g.homeId;
  const opp = TEAM_BY_ID[oppId];
  const me = TEAM_BY_ID[d.userTeamId];
  const orec = d.teams[oppId].record;
  const myRank = currentRank(d, d.userTeamId);
  const oppRank = currentRank(d, oppId);
  const wp = winProbability(d, g.homeId, g.awayId, !!g.neutralSite);
  const myWp = isHome ? wp : 1 - wp;
  const rivalry = g.rivalryId ? RIVALRIES.find((r) => r.id === g.rivalryId) : undefined;
  const myR = teamRatings(d.teams[d.userTeamId], d.players);
  const oppR = teamRatings(d.teams[oppId], d.players);
  const [busy, setBusy] = useState(false);

  const sim = async () => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 10));
    simulateGameFully(d, g);
    completeWeek(d);
    bump();
    await autosave();
    setBusy(false);
    onResult(g);
  };

  const side = (id: string, rank: number, right: boolean) => {
    const t = TEAM_BY_ID[id];
    const r = d.teams[id].record;
    return (
      <div className={`team-side ${right ? 'right' : ''}`}>
        {!right && <TeamBadge teamId={id} size={72} />}
        <div>
          <div className="muted" style={{ fontSize: 12 }}>
            {rank ? `#${rank}` : 'Unranked'} · {r.w}-{r.l}
          </div>
          <div className="tname">{t.school}</div>
          <div className="muted" style={{ fontSize: 12 }}>
            {t.nickname}
          </div>
        </div>
        {right && <TeamBadge teamId={id} size={72} />}
      </div>
    );
  };

  return (
    <div className="next-game">
      <div style={{ padding: '10px 22px', background: `linear-gradient(90deg, ${me.primaryColor}, ${opp.primaryColor})`, color: textOn(me.primaryColor), fontFamily: 'var(--display)', letterSpacing: '.08em' }}>
        {g.postseason ? (
          <>
            {g.postseason.name.toUpperCase()}
            {g.postseason.homeSeed && g.postseason.kind === 'cfp' ? ` · #${g.postseason.awaySeed} VS #${g.postseason.homeSeed} SEED` : ''}
          </>
        ) : (
          <>
            NEXT GAME · WEEK {g.week} {rivalry ? `· ${rivalry.name.toUpperCase()}` : ''} {g.conferenceGame ? '· CONFERENCE' : '· NON-CONFERENCE'}
          </>
        )}
      </div>
      <div className="band">
        {side(g.awayId, g.awayId === d.userTeamId ? myRank : oppRank, false)}
        <div className="vs center">
          {g.neutralSite ? 'vs' : '@'}
          <div className="muted" style={{ fontSize: 12, fontFamily: 'var(--body)' }}>
            {g.neutralSite ?? `${TEAM_BY_ID[g.homeId].stadium}`}
          </div>
        </div>
        {side(g.homeId, g.homeId === d.userTeamId ? myRank : oppRank, true)}
      </div>
      <div className="foot">
        <span className="muted">
          Win probability <b style={{ color: '#fff' }}>{Math.round(myWp * 100)}%</b>
        </span>
        <span className="muted">
          Ratings: You {myR.overall} (OFF {myR.offense} / DEF {myR.defense}) · {opp.abbreviation} {oppR.overall} (OFF {oppR.offense} / DEF {oppR.defense})
        </span>
        <span className="muted">Opp. record {orec.w}-{orec.l}</span>
        <div className="spacer" />
        <button className="btn" onClick={sim} disabled={busy}>
          {busy ? 'Simulating…' : 'Sim Game'}
        </button>
        <button className="btn primary" onClick={() => navigate({ name: 'game', gameId: g.id })} disabled={busy}>
          ▶ {g.postseason ? 'Play Game' : `Play Week ${g.week}`}
        </button>
      </div>
    </div>
  );
}

export function HomePage() {
  const { dynasty: d } = useStore();
  const [box, setBox] = useState<Game | null>(null);
  if (!d) return null;
  const inSeason = d.phase === 'regular' || d.phase === 'ccg' || d.phase === 'postseason';
  const g = inSeason ? userGame(d) : undefined;
  const rank = currentRank(d, d.userTeamId);
  const rec = d.teams[d.userTeamId].record;
  const conf = TEAM_BY_ID[d.userTeamId].conference;
  const standings = conferenceStandings(d, conf).slice(0, 8);
  const poll = d.rankings[d.rankings.length - 1]?.poll.slice(0, 10) ?? [];
  const headlines = [...d.news]
    .filter((n) => n.season === d.season)
    .sort((a, b) => b.week - a.week || b.importance - a.importance)
    .slice(0, 7);
  const recent = d.schedule
    .filter((x) => x.played && (x.homeId === d.userTeamId || x.awayId === d.userTeamId))
    .slice(-4)
    .reverse();

  return (
    <div className="col" style={{ gap: 18 }}>
      {inSeason && g && <NextGameCard key={g.id} d={d} g={g} onResult={setBox} />}
      {box && <BoxScoreModal game={box} onClose={() => setBox(null)} />}
      {inSeason && !g && <NoGameCard d={d} />}
      {d.phase === 'seasonComplete' && <SeasonCompleteCard d={d} />}
      {d.phase === 'offseason' && <OffseasonCard d={d} />}

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="panel">
          <h3>Season Snapshot</h3>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="stat">
              <div className="k">Overall</div>
              <div className="v">
                {rec.w}-{rec.l}
              </div>
            </div>
            <div className="stat">
              <div className="k">Conference</div>
              <div className="v">
                {rec.confW}-{rec.confL}
              </div>
            </div>
            <div className="stat">
              <div className="k">National Rank</div>
              <div className="v">{rank ? `#${rank}` : 'NR'}</div>
            </div>
            <div className="stat">
              <div className="k">Streak</div>
              <div className="v">{rec.streak === 0 ? '—' : rec.streak > 0 ? `W${rec.streak}` : `L${-rec.streak}`}</div>
            </div>
          </div>
          <div style={{ marginTop: 10 }} className="muted">
            Playoff projection: <b style={{ color: '#fff' }}>{projection(rank)}</b>
          </div>
          {recent.length > 0 && (
            <div style={{ marginTop: 12 }}>
              {recent.map((x) => {
                const home = x.homeId === d.userTeamId;
                const my = home ? x.result!.homeScore : x.result!.awayScore;
                const their = home ? x.result!.awayScore : x.result!.homeScore;
                const opp = home ? x.awayId : x.homeId;
                return (
                  <div key={x.id} className="row" style={{ padding: '4px 0' }}>
                    <span className={`pill ${my > their ? 'w' : 'l'}`}>{my > their ? 'W' : 'L'}</span>
                    <span className="muted">Wk {x.week}</span>
                    <span>
                      {home ? 'vs' : '@'} {TEAM_BY_ID[opp].school}
                    </span>
                    <span className="spacer" />
                    <b className="mono">
                      {my}-{their}
                    </b>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="panel">
          <h3>College Football Today</h3>
          {headlines.map((n) => (
            <div key={n.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--line)', fontSize: 13.5 }}>
              <span className="muted" style={{ fontSize: 11 }}>
                {n.week === 0 ? 'PRESEASON' : `WK ${n.week}`}
              </span>{' '}
              {n.headline}
            </div>
          ))}
          <button className="btn small ghost" style={{ marginTop: 8 }} onClick={() => navigate({ name: 'hub', tab: 'news' })}>
            All news →
          </button>
        </div>
        <div className="panel">
          <h3>Top 10</h3>
          {poll.map((e) => (
            <div key={e.teamId} className="row" style={{ padding: '4px 0', background: e.teamId === d.userTeamId ? 'rgba(255,204,51,.08)' : undefined }}>
              <b style={{ width: 24, fontFamily: 'var(--display)' }}>{e.rank}</b>
              <TeamBadge teamId={e.teamId} size={22} />
              <span>{TEAM_BY_ID[e.teamId].school}</span>
              <span className="spacer" />
              <span className="muted mono">
                {e.w}-{e.l}
              </span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>{CONFERENCE_BY_ID[conf].name} Standings</h3>
          <table className="data">
            <thead>
              <tr>
                <th>Team</th>
                <th className="num">Conf</th>
                <th className="num">Overall</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.teamId} className={s.teamId === d.userTeamId ? 'me' : ''}>
                  <td>{TEAM_BY_ID[s.teamId].school}</td>
                  <td className="num">
                    {s.confW}-{s.confL}
                  </td>
                  <td className="num">
                    {s.w}-{s.l}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { RIVALRIES, SCHEDULE_RULES, TEAM_BY_ID } from '../../data';
import { useStore } from '../../app/store';
import type { Game } from '../../models/types';
import { TeamBadge } from '../components/common';
import { FullBoxScore } from '../game/BoxScore';
import { weatherLabel } from '../../simulation/game/weather';

export function BoxScoreModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const { dynasty: d } = useStore();
  if (!d || !game.result) return null;
  const r = game.result;
  const home = TEAM_BY_ID[game.homeId];
  const away = TEAM_BY_ID[game.awayId];
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" style={{ width: 'min(1000px, 100%)' }} onClick={(e) => e.stopPropagation()}>
        <div className="player-head">
          <TeamBadge teamId={away.id} size={50} />
          <div style={{ fontFamily: 'var(--display)', fontSize: 40 }}>{r.awayScore}</div>
          <div className="muted" style={{ fontFamily: 'var(--display)' }}>
            FINAL{r.overtimePeriods ? ` / ${r.overtimePeriods > 1 ? r.overtimePeriods : ''}OT` : ''}
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 40 }}>{r.homeScore}</div>
          <TeamBadge teamId={home.id} size={50} />
          <div className="grow muted" style={{ fontSize: 12 }}>
            Week {game.week} · {game.neutralSite ?? home.stadium} · {weatherLabel(r.weather)}
          </div>
          <button className="btn small" onClick={onClose}>
            Close
          </button>
        </div>
        <div style={{ padding: 20 }}>
          <FullBoxScore result={r} homeId={game.homeId} awayId={game.awayId} players={d.players} />
        </div>
      </div>
    </div>
  );
}

export function SchedulePage() {
  const { dynasty: d } = useStore();
  const [box, setBox] = useState<Game | null>(null);
  if (!d) return null;
  const mine = d.schedule.filter((g) => g.season === d.season && (g.homeId === d.userTeamId || g.awayId === d.userTeamId));
  const weeks = Array.from({ length: SCHEDULE_RULES.regularSeasonWeeks }, (_, i) => i + 1);
  return (
    <div className="panel" style={{ padding: 0 }}>
      {weeks.map((w) => {
        const g = mine.find((x) => x.week === w);
        const current = d.phase === 'regular' && w === d.week;
        if (!g)
          return (
            <div key={w} className={`sched-row ${current ? 'current' : ''}`}>
              <div className="wk">WEEK {w}</div>
              <div />
              <div className="opp muted">BYE</div>
              <div />
              <div />
            </div>
          );
        const home = g.homeId === d.userTeamId;
        const opp = home ? g.awayId : g.homeId;
        const rivalry = g.rivalryId ? RIVALRIES.find((r) => r.id === g.rivalryId) : undefined;
        const lastPoll = d.rankings[d.rankings.length - 1];
        const oppRank = g.played ? (home ? g.awayRank : g.homeRank) : lastPoll?.poll.find((e) => e.teamId === opp)?.rank;
        let result: React.ReactNode = <span className="muted">{current ? 'NEXT' : ''}</span>;
        if (g.played && g.result) {
          const my = home ? g.result.homeScore : g.result.awayScore;
          const their = home ? g.result.awayScore : g.result.homeScore;
          result = (
            <span className="row" style={{ gap: 8 }}>
              <span className={`pill ${my > their ? 'w' : 'l'}`}>{my > their ? 'W' : 'L'}</span>
              <b className="mono">
                {my}-{their}
                {g.result.overtimePeriods ? ' (OT)' : ''}
              </b>
            </span>
          );
        }
        return (
          <div key={w} className={`sched-row ${current ? 'current' : ''}`}>
            <div className="wk">WEEK {w}</div>
            <TeamBadge teamId={opp} size={36} />
            <div>
              <div className="opp">
                <span className="muted" style={{ fontSize: 14 }}>
                  {g.neutralSite ? 'vs' : home ? 'vs' : '@'}{' '}
                </span>
                {oppRank ? <span className="muted">#{oppRank} </span> : null}
                {TEAM_BY_ID[opp].school}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {g.neutralSite ? `Neutral · ${g.neutralSite}` : home ? TEAM_BY_ID[d.userTeamId].stadium : TEAM_BY_ID[opp].stadium}
                {g.conferenceGame ? ' · Conference' : ''}
                {rivalry ? ` · ${rivalry.name}` : ''}
              </div>
            </div>
            <div>{result}</div>
            <div className="right">
              {g.played && (
                <button className="btn small" onClick={() => setBox(g)}>
                  Box Score
                </button>
              )}
              {!g.played && <span className="muted">{d.teams[opp].record.w}-{d.teams[opp].record.l}</span>}
            </div>
          </div>
        );
      })}
      {box && <BoxScoreModal game={box} onClose={() => setBox(null)} />}
    </div>
  );
}

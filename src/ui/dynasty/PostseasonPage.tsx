import { useState } from 'react';
import { PLAYOFF_CONFIG, TEAM_BY_ID, type BracketRef } from '../../data';
import { useStore } from '../../app/store';
import type { Dynasty, Game } from '../../models/types';
import { postseasonGames, winnerOf } from '../../simulation/postseasonEngine';
import { TeamBadge } from '../components/common';
import { BoxScoreModal } from './SchedulePage';
import { AwardsPanel } from './SeasonCards';

function TeamLine({ d, teamId, seed, score, won, placeholder }: { d: Dynasty; teamId?: string; seed?: number; score?: number; won?: boolean; placeholder?: string }) {
  const me = teamId === d.userTeamId;
  return (
    <div className="row" style={{ gap: 8, padding: '5px 8px', background: me ? 'rgba(255,204,51,.1)' : undefined, opacity: won === false ? 0.5 : 1 }}>
      <span className="muted mono" style={{ width: 18, fontSize: 12 }}>
        {seed ?? ''}
      </span>
      {teamId ? <TeamBadge teamId={teamId} size={22} /> : <span style={{ width: 22 }} />}
      <span className="grow" style={{ fontWeight: won ? 700 : 400, fontSize: 13 }}>
        {teamId ? TEAM_BY_ID[teamId].school : <span className="muted">{placeholder}</span>}
      </span>
      {score !== undefined && <b className="mono">{score}</b>}
    </div>
  );
}

function refLabel(ref: BracketRef): string {
  return typeof ref === 'number' ? `#${ref} seed` : `Winner ${ref}`;
}

function MatchCard({ d, game, a, b, title, onOpen }: { d: Dynasty; game?: Game; a: BracketRef; b: BracketRef; title: string; onOpen: (g: Game) => void }) {
  const seedTeam = (ref: BracketRef) => (typeof ref === 'number' ? d.postseason?.cfpSeeds.find((s) => s.seed === ref) : undefined);
  const w = game ? winnerOf(game) : undefined;
  const top = game ? { teamId: game.awayId, seed: game.postseason?.awaySeed, score: game.result?.awayScore } : { teamId: seedTeam(a)?.teamId, seed: typeof a === 'number' ? a : undefined };
  const bot = game ? { teamId: game.homeId, seed: game.postseason?.homeSeed, score: game.result?.homeScore } : { teamId: seedTeam(b)?.teamId, seed: typeof b === 'number' ? b : undefined };
  return (
    <div className="panel" style={{ padding: 0, cursor: game?.played ? 'pointer' : 'default', overflow: 'hidden' }} onClick={() => game?.played && onOpen(game)}>
      <div className="muted" style={{ fontSize: 10.5, padding: '4px 8px', background: 'var(--bg2)', textTransform: 'uppercase', letterSpacing: '.06em' }}>{title}</div>
      <TeamLine d={d} {...top} won={w ? w === top.teamId : undefined} placeholder={refLabel(a)} />
      <TeamLine d={d} {...bot} won={w ? w === bot.teamId : undefined} placeholder={refLabel(b)} />
    </div>
  );
}

export function PostseasonPage() {
  const { dynasty: d } = useStore();
  const [box, setBox] = useState<Game | null>(null);
  if (!d) return null;
  const ps = d.postseason;
  const games = postseasonGames(d);
  const ccgs = games.filter((g) => g.postseason?.kind === 'ccg');
  const bowls = games.filter((g) => g.postseason?.kind === 'bowl');
  if (!ps && !ccgs.length) {
    return (
      <div className="panel">
        <h2>{PLAYOFF_CONFIG.name}</h2>
        <p className="muted">
          The {PLAYOFF_CONFIG.teamCount}-team field is selected after championship week: the {PLAYOFF_CONFIG.selection.autoBidConferenceChampions} highest-ranked conference champions plus the highest-ranked remaining teams. The top {PLAYOFF_CONFIG.byes} seeds get first-round byes; first-round games are played on the higher seed's campus.
        </p>
        <p className="muted">Check back after week {d.week <= 14 ? 14 : d.week}.</p>
      </div>
    );
  }
  return (
    <div className="col" style={{ gap: 16 }}>
      {ps?.champion && (
        <div className="panel row" style={{ gap: 14 }}>
          <TeamBadge teamId={ps.champion} size={60} />
          <div>
            <div className="muted">{d.season} NATIONAL CHAMPIONS</div>
            <div style={{ fontFamily: 'var(--display)', fontSize: 30, textTransform: 'uppercase' }}>{TEAM_BY_ID[ps.champion].school}</div>
          </div>
        </div>
      )}
      {ps && (
        <div className="panel">
          <h3>{PLAYOFF_CONFIG.name} Bracket</h3>
          <div className="grid" style={{ gridTemplateColumns: `repeat(${PLAYOFF_CONFIG.rounds.length}, minmax(200px, 1fr))`, overflowX: 'auto', alignItems: 'center' }}>
            {PLAYOFF_CONFIG.rounds.map((r) => (
              <div key={r.id} className="col" style={{ gap: 10, justifyContent: 'space-around', height: '100%' }}>
                <div style={{ fontFamily: 'var(--display)', textTransform: 'uppercase', fontSize: 14 }} className="accent">
                  {r.name}
                </div>
                {r.games.map(([a, b], i) => {
                  const slot = `${r.id}-${i + 1}`;
                  const game = games.find((g) => g.postseason?.slot === slot);
                  const title = r.bowls?.[i] ?? (r.site === 'higherSeedHome' ? 'Campus site' : r.neutralSite ?? '');
                  return <MatchCard key={slot} d={d} game={game} a={a} b={b} title={title} onOpen={setBox} />;
                })}
              </div>
            ))}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Seeds: {ps.cfpSeeds.map((s) => `${s.seed}. ${TEAM_BY_ID[s.teamId].abbreviation}${s.autoBid ? '*' : ''}`).join('  ')} — * conference champion (auto-bid). Format is configured in data/playoffConfig.json.
          </div>
        </div>
      )}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="panel">
          <h3>Conference Championships</h3>
          <div className="col" style={{ gap: 8 }}>
            {ccgs.map((g) => (
              <MatchCard key={g.id} d={d} game={g} a={2} b={1} title={`${g.postseason!.name} · ${g.neutralSite ?? ''}`} onOpen={setBox} />
            ))}
          </div>
        </div>
        <div className="panel">
          <h3>Bowl Games</h3>
          {!bowls.length && <div className="muted">Bowl matchups are set after championship week.</div>}
          {bowls.map((g) => {
            const w = winnerOf(g);
            const mine = g.homeId === d.userTeamId || g.awayId === d.userTeamId;
            return (
              <div key={g.id} className="row" style={{ padding: '6px 0', borderBottom: '1px solid var(--line)', background: mine ? 'rgba(255,204,51,.08)' : undefined, cursor: g.played ? 'pointer' : 'default' }} onClick={() => g.played && setBox(g)}>
                <span style={{ width: 130, fontSize: 12 }} className="muted">
                  {g.postseason!.name}
                </span>
                <TeamBadge teamId={g.awayId} size={20} />
                <span style={{ fontWeight: w === g.awayId ? 700 : 400 }}>{TEAM_BY_ID[g.awayId].abbreviation}</span>
                <span className="mono">{g.result?.awayScore ?? ''}</span>
                <span className="muted">vs</span>
                <TeamBadge teamId={g.homeId} size={20} />
                <span style={{ fontWeight: w === g.homeId ? 700 : 400 }}>{TEAM_BY_ID[g.homeId].abbreviation}</span>
                <span className="mono">{g.result?.homeScore ?? ''}</span>
              </div>
            );
          })}
        </div>
      </div>
      {ps && ps.awards.length > 0 && <AwardsPanel awards={ps.awards} />}
      {box && <BoxScoreModal game={box} onClose={() => setBox(null)} />}
    </div>
  );
}

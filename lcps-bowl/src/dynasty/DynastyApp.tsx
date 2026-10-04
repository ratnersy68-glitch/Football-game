import { useEffect, useMemo, useState } from 'react';
import type { Dynasty, GameRecord } from './types';
import {
  createDynasty, gameSetup, applyResult, simulateRemaining, finishWeek, simulateGame, userGame, currentGames,
  seasonLabel, userRecordLine, runOffseason, seriesFor,
} from './Season';
import { LCPS_TEAMS, getTeam, programExpectation, rivalryName, isLcps } from '../data/teams';
import { listSaves, loadSlot, saveSlot, lastSlot, deleteSlot, SLOTS, type Slot } from '../save/storage';
import { getSettings, useSettings } from '../save/settings';
import { TeamLogo, Btn, Stars, RatingBar } from '../components/common';
import { GameScreen } from '../screens/GameScreen';
import type { GameResult, GameSession } from '../game/GameSession';
import { buildStory } from './Stories';
import { teamRatings } from './Development';
import { recordOf } from './Standings';
import { rankOf } from './Rankings';
import { weatherLabel } from '../screens/GameScreen';
import { RosterPage, SchedulePage, StandingsPage, RankingsPage, PlayoffPage, TeamPage, PlayersPage, CoachingPage, RecruitingPage, ProgramPage, StatsPage, NewsPage, SeasonEndView, OffseasonView } from './DynastyPages';
import { RecordBookView } from '../screens/RecordBook';
import { StadiumBackdrop } from '../screens/MainMenu';
import { Sound } from '../game/audio/Sound';
import { LockerScreen, BBBadge } from '../gear/ui/Locker';
import { RewardsPanel, DropReveal } from '../gear/ui/Rewards';
import { GameDayFit } from '../gear/ui/GameDayFit';
import { ensureLocker } from '../gear/economy';

type View =
  | { id: 'slots' }
  | { id: 'teamSelect'; slot: Slot }
  | { id: 'coach'; slot: Slot; team: string }
  | { id: 'home' }
  | { id: 'game'; game: GameRecord }
  | { id: 'gameday'; game: GameRecord }
  | { id: 'weekResults'; games: GameRecord[]; user?: GameRecord }
  | { id: 'loading'; text: string };

export type Tab = 'locker' | 'home' | 'roster' | 'schedule' | 'standings' | 'rankings' | 'playoffs' | 'team' | 'players' | 'coaching' | 'recruiting' | 'program' | 'stats' | 'records' | 'news';

export const TABS: [Tab, string][] = [
  ['home', 'HOME'], ['locker', '🪙 LOCKER'], ['roster', 'ROSTER'], ['schedule', 'SCHEDULE'], ['standings', 'STANDINGS'], ['playoffs', 'PLAYOFF PICTURE'],
  ['rankings', 'RANKINGS'], ['team', 'TEAM'], ['players', 'PLAYERS'], ['coaching', 'COACHING'], ['recruiting', 'RECRUITING'],
  ['program', 'PROGRAM'], ['stats', 'STATS'], ['records', 'RECORDS'], ['news', 'NEWS'],
];

export async function autosave(d: Dynasty) {
  const r = userRecordLine(d);
  await saveSlot(d.slot, d, {
    team: d.userTeam, teamName: `${getTeam(d.userTeam).shortName} ${getTeam(d.userTeam).mascot}`, coach: d.coachName,
    year: d.year, week: seasonLabel(d), record: `${r.w}–${r.l}`, championships: d.programs[d.userTeam].championships.length, bb: d.locker?.bb ?? 0,
  });
}

export function DynastyApp({ mode, onExit }: { mode: 'new' | 'continue' | 'play' | 'locker'; onExit: () => void }) {
  const [d, setD] = useState<Dynasty | null>(null);
  const [view, setView] = useState<View>(mode === 'new' ? { id: 'slots' } : { id: 'loading', text: 'Loading dynasty…' });
  const [tab, setTab] = useState<Tab>(mode === 'locker' ? 'locker' : 'home');
  const [, force] = useState(0);
  const [progress, setProgress] = useState<{ done: number; total: number; label: string } | null>(null);
  const refresh = () => force((x) => x + 1);

  useEffect(() => {
    if (mode === 'new') return;
    const slot = lastSlot() ?? listSaves().find((s) => s.exists)?.slot;
    if (!slot) { setView({ id: 'slots' }); return; }
    loadSlot<Dynasty>(slot).then((loaded) => {
      if (loaded) { loaded.slot = slot; ensureLocker(loaded); setD(loaded); setView({ id: 'home' }); }
      else setView({ id: 'slots' });
    });
  }, [mode]);

  const startNew = (slot: Slot, team: string, coach: string, format: 'standard' | 'expanded') => {
    const nd = createDynasty(team, coach, slot, undefined, format);
    setD(nd);
    void autosave(nd);
    setView({ id: 'home' });
    setTab('home');
  };

  const finishUserWeek = async (dd: Dynasty, userG?: GameRecord) => {
    const s = getSettings();
    const games = currentGames(dd);
    setView({ id: 'loading', text: 'Around the county…' });
    await simulateRemaining(dd, s.quarterLen, (done, total, label) => setProgress({ done, total, label }));
    setProgress(null);
    finishWeek(dd);
    await autosave(dd);
    setD({ ...dd } as Dynasty);
    setView({ id: 'weekResults', games, user: userG });
  };

  const onGameDone = async (g: GameRecord, result: GameResult | null, session: GameSession) => {
    if (!d) return;
    if (!result) { setView({ id: 'home' }); return; }
    applyResult(d, g, result, session, undefined, true);
    await finishUserWeek(d, g);
  };

  const simUserGame = async () => {
    if (!d) return;
    const g = userGame(d);
    if (g && !g.played) {
      setView({ id: 'loading', text: 'Simulating your game…' });
      await new Promise((r) => setTimeout(r, 30));
      const { result, session } = simulateGame(d, g, getSettings().quarterLen);
      applyResult(d, g, result, session);
    }
    await finishUserWeek(d, g);
  };

  if (view.id === 'slots') return <SlotPicker mode={mode} onBack={onExit} onPick={(slot, exists) => {
    if (mode === 'new' || !exists) setView({ id: 'teamSelect', slot });
    else loadSlot<Dynasty>(slot).then((l) => { if (l) { l.slot = slot; ensureLocker(l); setD(l); setView({ id: 'home' }); } });
  }} />;
  if (view.id === 'teamSelect') return <TeamSelect onBack={() => setView({ id: 'slots' })} onPick={(team) => setView({ id: 'coach', slot: view.slot, team })} />;
  if (view.id === 'coach') return <CoachSetup team={view.team} onBack={() => setView({ id: 'teamSelect', slot: view.slot })} onStart={(name, fmt) => startNew(view.slot, view.team, name, fmt)} />;
  if (view.id === 'loading' || !d) {
    return (
      <div className="screen loading-screen">
        <StadiumBackdrop dim={0.7} />
        <div className="loading-card">
          <div className="pixel">{view.id === 'loading' ? view.text : 'Loading…'}</div>
          {progress && <>
            <div className="progress"><i style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} /></div>
            <div className="dim small">{progress.label}</div>
          </>}
        </div>
      </div>
    );
  }
  if (view.id === 'game') {
    const s = getSettings();
    const { config, atmo, intro } = gameSetup(d, view.game, { difficulty: s.difficulty, quarterLen: s.quarterLen, simDefense: s.simDefense, userPlays: true });
    return <GameScreen config={config} atmosphere={atmo} intro={intro} story={(sess) => buildStory(sess, { playoffRound: view.game.round, championship: view.game.round === 'LCPS Bowl' })} onExit={(r, sess) => onGameDone(view.game, r, sess)} />;
  }
  if (view.id === 'gameday') return <GameDayFit d={d} g={view.game} onBack={() => setView({ id: 'home' })} onChange={() => { refresh(); void autosave(d); }} onKickoff={() => setView({ id: 'game', game: view.game })} />;
  if (view.id === 'weekResults') return <WeekResults d={d} games={view.games} user={view.user} onDone={() => { setView({ id: 'home' }); setTab('home'); }} onLocker={() => { setView({ id: 'home' }); setTab('locker'); }} />;

  return (
    <div className="screen dyn-screen">
      <DynastyHeader d={d} onExit={async () => { await autosave(d); onExit(); }} />
      <nav className="dyn-tabs">
        {TABS.map(([t, label]) => <button key={t} className={`dyn-tab ${tab === t ? 'on' : ''}`} onClick={() => { Sound.play('menu'); setTab(t); }}>{label}</button>)}
      </nav>
      <main className="dyn-main">
        {d.phase === 'season_end' && tab === 'home' ? (
          <SeasonEndView d={d} onContinue={() => { runOffseason(d); void autosave(d); refresh(); setD({ ...d }); }} />
        ) : d.offseasonPending && d.lastOffseason && tab === 'home' ? (
          <OffseasonView d={d} onContinue={() => { d.offseasonPending = false; void autosave(d); refresh(); }} onChange={() => { refresh(); void autosave(d); }} />
        ) : tab === 'home' ? (
          <Home d={d} onPlay={(g) => setView({ id: 'gameday', game: g })} onSim={simUserGame} onSimWeek={() => finishUserWeek(d)} goTab={setTab} />
        ) : tab === 'locker' ? <LockerScreen d={d} onChange={() => { refresh(); void autosave(d); }} />
          : tab === 'roster' ? <RosterPage d={d} onChange={() => { refresh(); void autosave(d); }} />
          : tab === 'schedule' ? <SchedulePage d={d} />
          : tab === 'standings' ? <StandingsPage d={d} />
          : tab === 'rankings' ? <RankingsPage d={d} />
          : tab === 'playoffs' ? <PlayoffPage d={d} />
          : tab === 'team' ? <TeamPage d={d} />
          : tab === 'players' ? <PlayersPage d={d} onChange={() => { refresh(); void autosave(d); }} />
          : tab === 'coaching' ? <CoachingPage d={d} />
          : tab === 'recruiting' ? <RecruitingPage d={d} onChange={() => { refresh(); void autosave(d); }} />
          : tab === 'program' ? <ProgramPage d={d} />
          : tab === 'stats' ? <StatsPage d={d} />
          : tab === 'records' ? <RecordBookView d={d} />
          : <NewsPage d={d} />}
      </main>
    </div>
  );
}

function DynastyHeader({ d, onExit }: { d: Dynasty; onExit: () => void }) {
  const t = getTeam(d.userTeam);
  const prog = d.programs[d.userTeam];
  const r = userRecordLine(d);
  return (
    <header className="dyn-header" style={{ background: `linear-gradient(100deg, ${t.colors.primary} 0%, ${t.colors.primary} 45%, ${t.colors.secondary} 140%)` }}>
      <TeamLogo team={t} size={64} />
      <div className="dh-title">
        <div className="pixel dh-name">{t.shortName.toUpperCase()} {t.mascot.toUpperCase()}</div>
        <div className="dh-sub">{d.year} SEASON · {seasonLabel(d)} · Coach {d.coachName}</div>
      </div>
      <div className="dh-stats">
        <div><span>RECORD</span><b>{r.w}–{r.l}</b></div>
        <div><span>DISTRICT</span><b>{r.dw}–{r.dl}</b></div>
        <div><span>RANKING</span><b>#{r.rank}</b></div>
        <div><span>PRESTIGE</span><b><Stars n={prog.prestige} /></b></div>
        <div><span>PROGRAM PTS</span><b>{prog.points}</b></div>
        <div><span>BOWL BUCKS</span><b><BBBadge bb={d.locker?.bb ?? 0} /></b></div>
      </div>
      <Btn small variant="ghost" onClick={onExit}>SAVE & EXIT</Btn>
    </header>
  );
}

function Home({ d, onPlay, onSim, onSimWeek, goTab }: { d: Dynasty; onPlay: (g: GameRecord) => void; onSim: () => void; onSimWeek: () => void; goTab: (t: Tab) => void }) {
  const g = userGame(d);
  const user = d.userTeam;
  const t = getTeam(user);
  const ratings = teamRatings(d.programs[user].roster);
  const order = d.rankings[d.rankings.length - 1]?.order ?? [];
  const news = [...d.news].reverse().slice(0, 7);
  const injured = d.programs[user].roster.filter((p) => p.injury && p.injury.weeks > 0);
  const upgrades = d.programs[user].roster.filter((p) => p.pendingUpgrades > 0).length;
  return (
    <div className="home-grid">
      <section className="panel next-game">
        {g ? <NextGameCard d={d} g={g} onPlay={() => onPlay(g)} onSim={onSim} /> : (
          <div className="ng-empty">
            <div className="pixel">{d.phase === 'playoffs' ? 'SEASON OVER FOR YOUR TEAM' : 'NO GAME THIS WEEK'}</div>
            <p className="dim">{d.phase === 'playoffs' ? 'The playoffs continue around Loudoun County.' : 'Bye week.'}</p>
            <Btn variant="gold" onClick={onSimWeek}>SIM {d.phase === 'playoffs' ? 'ROUND' : 'WEEK'} ▸</Btn>
          </div>
        )}
      </section>
      <section className="panel">
        <header className="panel-head"><h3>THIS WEEK</h3></header>
        <div className="panel-body">
          {d.events.length === 0 && <p className="dim">Quiet week at practice.</p>}
          {d.events.map((e) => <div key={e.id} className={`event event-${e.kind}`}>{e.text}</div>)}
          {upgrades > 0 && <div className="event event-improve clickable" onClick={() => goTab('players')}>⬆ {upgrades} player{upgrades > 1 ? 's have' : ' has'} upgrade points to spend → PLAYERS</div>}
          {injured.length > 0 && <div className="event event-injury clickable" onClick={() => goTab('roster')}>✚ Injured: {injured.map((p) => `${p.first[0]}. ${p.last} (${p.pos}, ${p.injury!.weeks} wk)`).join(', ')}</div>}
        </div>
      </section>
      <section className="panel">
        <header className="panel-head"><h3>TEAM</h3><span className="dim small">{programExpectation(t)}</span></header>
        <div className="panel-body">
          <RatingBar label="OFFENSE" value={ratings.off} />
          <RatingBar label="DEFENSE" value={ratings.def} />
          <RatingBar label="SPECIAL TEAMS" value={ratings.st} />
          <RatingBar label="OVERALL" value={ratings.ovr} />
        </div>
      </section>
      <section className="panel">
        <header className="panel-head"><h3>LCPS TOP 10</h3><button className="link" onClick={() => goTab('rankings')}>ALL ▸</button></header>
        <div className="panel-body">
          <ol className="top10">
            {order.slice(0, 10).map((id) => (
              <li key={id} className={id === user ? 'me' : ''}><TeamLogo team={getTeam(id)} size={18} /> {getTeam(id).shortName} <span className="dim">{recordOf(d, id)}</span></li>
            ))}
          </ol>
        </div>
      </section>
      <section className="panel span2">
        <header className="panel-head"><h3>LOUDOUN GRIDIRON GAZETTE</h3><button className="link" onClick={() => goTab('news')}>ALL NEWS ▸</button></header>
        <div className="panel-body news-list">
          {news.map((n, i) => (
            <div key={i} className={`news-item news-${n.kind}`}>
              <div className="news-head">{n.headline}</div>
              {n.body && <div className="news-body">{n.body}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function NextGameCard({ d, g, onPlay, onSim }: { d: Dynasty; g: GameRecord; onPlay: () => void; onSim: () => void }) {
  const home = getTeam(g.home);
  const away = getTeam(g.away);
  const us = d.userTeam;
  const opp = g.home === us ? g.away : g.home;
  const ser = seriesFor(d, us, opp);
  const usWins = ser ? (ser.a === us ? ser.aWins : ser.bWins) : 0;
  const themWins = ser ? (ser.a === us ? ser.bWins : ser.aWins) : 0;
  const label = g.round ? g.round.toUpperCase() : `WEEK ${g.week}`;
  return (
    <div className="ng">
      <div className="ng-top">
        <span className="pixel ng-label">NEXT GAME · {label}</span>
        {g.rivalry && <span className="tag tag-rival pixel">{rivalryName(g.home, g.away) === 'Rivalry Game' ? 'RIVALRY GAME' : `RIVALRY · ${rivalryName(g.home, g.away).toUpperCase()}`}</span>}
        {g.round === 'LCPS Bowl' && <span className="tag tag-gold pixel">CHAMPIONSHIP</span>}
      </div>
      <div className="ng-teams">
        <div className="ng-team">
          <TeamLogo team={away} size={84} />
          <div className="pixel">{away.shortName.toUpperCase()}</div>
          <div className="dim small">{away.mascot}{isLcps(away.id) ? ` · ${recordOf(d, away.id)} · #${rankOf(d, away.id)}` : ' · Non-LCPS'}</div>
        </div>
        <div className="ng-at pixel">{g.neutral ? 'VS' : '@'}</div>
        <div className="ng-team">
          <TeamLogo team={home} size={84} />
          <div className="pixel">{home.shortName.toUpperCase()}</div>
          <div className="dim small">{home.mascot}{isLcps(home.id) ? ` · ${recordOf(d, home.id)} · #${rankOf(d, home.id)}` : ' · Non-LCPS'}</div>
        </div>
      </div>
      <div className="ng-meta">
        {g.round === 'LCPS Bowl' ? 'Saturday' : 'Friday'} — 7:00 PM · {g.neutral ? 'Neutral site' : home.stadium} · {weatherLabel(g.weather)}
      </div>
      {ser && <div className="ng-meta gold">Series since {d.startYear}: {getTeam(us).shortName} {usWins}, {getTeam(opp).shortName} {themWins}</div>}
      <div className="ng-buttons">
        <Btn variant="gold" onClick={onPlay}>▶ PLAY GAME</Btn>
        <Btn variant="ghost" onClick={onSim}>SIM GAME</Btn>
      </div>
    </div>
  );
}

function WeekResults({ d, games, user, onDone, onLocker }: { d: Dynasty; games: GameRecord[]; user?: GameRecord; onDone: () => void; onLocker: () => void }) {
  const rewards = user && d.lastRewards ? d.lastRewards : null;
  const [dropOpen, setDropOpen] = useState(!!rewards?.drop);
  const ug = user ? d.schedule.find((g) => g.id === user.id) ?? user : undefined;
  const won = ug && ug.played ? (ug.home === d.userTeam ? ug.homeScore! > ug.awayScore! : ug.awayScore! > ug.homeScore!) : null;
  useEffect(() => { if (won) Sound.play('touchdown'); }, [won]);
  return (
    <div className="screen setup-screen">
      <header className="screen-head"><span /><h2 className="pixel">AROUND LOUDOUN COUNTY</h2><span /></header>
      <div className="week-results">
        {rewards && <RewardsPanel d={d} r={rewards} onLocker={onLocker} />}
        {rewards?.drop && dropOpen && <DropReveal d={d} drop={rewards.drop} onDone={() => setDropOpen(false)} />}
        {ug && ug.story && (
          <div className="newspaper big-news">
            <div className="np-mast">THE LOUDOUN GRIDIRON GAZETTE · {d.year}</div>
            <div className="np-head">{ug.story.headline}</div>
            {ug.story.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
        <div className="scores-grid">
          {games.map((g0) => {
            const g = d.schedule.find((x) => x.id === g0.id) ?? g0;
            const hw = (g.homeScore ?? 0) > (g.awayScore ?? 0);
            return (
              <div key={g.id} className={`score-card ${g.home === d.userTeam || g.away === d.userTeam ? 'me' : ''}`}>
                {g.round && <div className="pixel tiny gold">{g.round.toUpperCase()}</div>}
                {g.rivalry && <div className="pixel tiny rival">RIVALRY</div>}
                <div className={`sc-row ${!hw ? 'win' : ''}`}><TeamLogo team={getTeam(g.away)} size={20} /> {getTeam(g.away).shortName}<b>{g.awayScore}</b></div>
                <div className={`sc-row ${hw ? 'win' : ''}`}><TeamLogo team={getTeam(g.home)} size={20} /> {getTeam(g.home).shortName}<b>{g.homeScore}</b></div>
                {g.ot ? <div className="dim tiny">OT</div> : null}
              </div>
            );
          })}
        </div>
        <div className="setup-go"><Btn variant="gold" onClick={onDone}>CONTINUE ▸</Btn></div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- new dynasty flow

function SlotPicker({ mode, onPick, onBack }: { mode: string; onPick: (slot: Slot, exists: boolean) => void; onBack: () => void }) {
  const [saves, setSaves] = useState(listSaves());
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">{mode === 'new' ? 'NEW DYNASTY — CHOOSE A SLOT' : 'LOAD DYNASTY'}</h2>
        <span />
      </header>
      <div className="slots">
        {SLOTS.map((slot) => {
          const s = saves.find((x) => x.slot === slot)!;
          const team = s.team && isLcps(s.team) ? getTeam(s.team) : null;
          return (
            <div key={slot} className="slot-card panel">
              <div className="pixel slot-n">SLOT {slot}</div>
              {s.exists && team ? (
                <>
                  <TeamLogo team={team} size={64} />
                  <div className="pixel">{s.teamName}</div>
                  <div className="dim">Coach {s.coach} · {s.year} · {s.week}</div>
                  <div>Record {s.record} · {s.championships ?? 0} title{s.championships === 1 ? '' : 's'}</div>
                  <div className="dim small">Saved {s.savedAt ? new Date(s.savedAt).toLocaleString() : ''}</div>
                  <div className="slot-actions">
                    {mode !== 'new' && <Btn onClick={() => onPick(slot, true)}>LOAD</Btn>}
                    {mode === 'new' && <Btn variant="danger" onClick={() => { if (confirm(`Overwrite slot ${slot}?`)) onPick(slot, false); }}>OVERWRITE</Btn>}
                    <Btn variant="ghost" small onClick={async () => { if (confirm('Delete this dynasty?')) { await deleteSlot(slot); setSaves(listSaves()); } }}>DELETE</Btn>
                  </div>
                </>
              ) : (
                <>
                  <div className="empty-slot pixel">EMPTY</div>
                  <Btn variant="gold" onClick={() => onPick(slot, false)}>START HERE</Btn>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TeamSelect({ onPick, onBack }: { onPick: (team: string) => void; onBack: () => void }) {
  const [sort, setSort] = useState<'name' | 'prestige' | 'rebuild'>('name');
  const teams = useMemo(() => {
    const list = [...LCPS_TEAMS];
    if (sort === 'prestige') list.sort((a, b) => b.prestige - a.prestige || b.offenseRating - a.offenseRating);
    if (sort === 'rebuild') list.sort((a, b) => a.prestige - b.prestige || a.offenseRating - b.offenseRating);
    return list;
  }, [sort]);
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">CHOOSE YOUR SCHOOL</h2>
        <div className="seg">
          {(['name', 'prestige', 'rebuild'] as const).map((s) => <button key={s} className={sort === s ? 'on' : ''} onClick={() => setSort(s)}>{s === 'name' ? 'A–Z' : s === 'prestige' ? 'TOP PROGRAMS' : 'REBUILDS'}</button>)}
        </div>
      </header>
      <div className="team-cards">
        {teams.map((t) => (
          <button key={t.id} className="team-card" onClick={() => { Sound.play('select'); onPick(t.id); }} style={{ ['--tc' as string]: t.colors.primary, ['--tc2' as string]: t.colors.secondary }}>
            <div className="tc-top">
              <TeamLogo team={t} size={64} />
              <div>
                <div className="pixel tc-school">{t.shortName.toUpperCase()}</div>
                <div className="tc-mascot">{t.mascot}</div>
                <div className="dim small">{t.city} · {t.district} District</div>
              </div>
            </div>
            <RatingBar label="OFFENSE" value={t.offenseRating} />
            <RatingBar label="DEFENSE" value={t.defenseRating} />
            <RatingBar label="SPECIAL TEAMS" value={t.specialTeamsRating} />
            <div className="kv"><span>PRESTIGE</span><Stars n={t.prestige} /></div>
            <div className={`expect pixel exp-${programExpectation(t).split(' ')[0].toLowerCase()}`}>{programExpectation(t).toUpperCase()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function CoachSetup({ team, onStart, onBack }: { team: string; onStart: (name: string, fmt: 'standard' | 'expanded') => void; onBack: () => void }) {
  const t = getTeam(team);
  const settings = useSettings();
  const [name, setName] = useState('');
  const [fmt, setFmt] = useState<'standard' | 'expanded'>(settings.playoffFormat);
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">TAKE OVER {t.shortName.toUpperCase()}</h2>
        <span />
      </header>
      <div className="coach-setup panel">
        <div className="cs-hero" style={{ background: `linear-gradient(120deg, ${t.colors.primary}, ${t.colors.secondary})` }}>
          <TeamLogo team={t} size={110} />
          <div>
            <div className="pixel">{t.school.toUpperCase()}</div>
            <div className="cs-mascot">{t.mascot}</div>
            <div>{t.history}</div>
          </div>
        </div>
        <div className="panel-body">
          <label className="field">
            <span className="opt-label">HEAD COACH NAME</span>
            <input autoFocus value={name} maxLength={24} placeholder="Your name" onChange={(e) => setName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && name.trim()) onStart(name.trim(), fmt); }} />
          </label>
          <div className="opt">
            <span className="opt-label">PLAYOFF FORMAT</span>
            <div className="seg">
              <button className={fmt === 'standard' ? 'on' : ''} onClick={() => setFmt('standard')}>8 TEAMS (TOP 4 PER REGION)</button>
              <button className={fmt === 'expanded' ? 'on' : ''} onClick={() => setFmt('expanded')}>12 TEAMS (TOP 6 PER REGION)</button>
            </div>
          </div>
          <p className="dim small">Expectation: <b>{programExpectation(t)}</b>. Region: {t.district === 'Catoctin' || t.district === 'Dulles' ? 'Region 4C (north)' : 'Region 5D/6 (south)'}. Your first season kicks off in late August 2026.</p>
          <div className="setup-go"><Btn variant="gold" disabled={!name.trim()} onClick={() => onStart(name.trim(), fmt)}>BEGIN DYNASTY ▸</Btn></div>
        </div>
      </div>
    </div>
  );
}

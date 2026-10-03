import { useEffect, useMemo, useRef, useState } from 'react';
import { GameSession, type GameConfig, type GameResult } from '../game/GameSession';
import { Renderer, VIEW_W, VIEW_H, type Atmosphere } from '../game/render/Renderer';
import { InputState } from '../game/input/Input';
import { Sound, type SoundName } from '../game/audio/Sound';
import { clockText, downText, yardLineText, other, type Side } from '../game/Rules';
import { OFFENSE_PLAYS, PLAY_CATEGORIES, DEF_FORMATIONS, COVERAGES, COVERAGE_DESC, type PlayCategory, type DefFormationId, type Coverage } from '../game/Plays';
import { fgDistance, fgProbability } from '../game/Coach';
import { TeamLogo, PlayDiagram, Btn } from '../components/common';
import { BoxScore } from '../components/BoxScore';
import { getSettings } from '../save/settings';

export interface IntroInfo {
  title: string; // e.g. FRIDAY NIGHT
  kickoff: string; // 7:00 PM
  stadium: string;
  tags: string[]; // RIVALRY GAME, REGION SEMIFINAL...
  homeRecord?: string;
  awayRecord?: string;
  series?: string;
  pa?: string; // PA announcement line
}

interface Props {
  config: GameConfig;
  atmosphere: Atmosphere;
  intro: IntroInfo;
  onExit: (result: GameResult | null, session: GameSession) => void;
  story?: (s: GameSession) => { headline: string; body: string[] } | null;
}

export function GameScreen({ config, atmosphere, intro, onExit, story }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const session = useMemo(() => new GameSession(config), [config]);
  const renderer = useMemo(() => new Renderer(atmosphere), [atmosphere]);
  const input = useMemo(() => new InputState(), []);
  const [, setTick] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [paused, setPaused] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const pausedRef = useRef(false);
  const introRef = useRef(true);
  pausedRef.current = paused;
  introRef.current = showIntro;

  // Main loop
  useEffect(() => {
    input.attach();
    Sound.startCrowd(atmosphere.championship ? 0.6 : atmosphere.playoff || atmosphere.rivalry ? 0.5 : 0.32);
    const ctx = canvasRef.current!.getContext('2d')!;
    let last = performance.now();
    let acc = 0;
    let raf = 0;
    let uiAcc = 0;
    let lastEvents = 0;
    let lastPhase = '';
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      let dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const ui = input.takeUi();
      if (ui.includes('pause') && !introRef.current) setPaused((p) => !p);
      if (introRef.current) {
        if (ui.includes('continue') || ui.includes('snap')) { setShowIntro(false); session.start(); Sound.play('whistle'); }
        renderer.draw(ctx, session, dt);
        input.clearEdges();
        return;
      }
      if (pausedRef.current) { input.clearEdges(); renderer.draw(ctx, session, 0); return; }
      handleUi(ui);
      // Speed up auto-simulated defensive snaps a little
      if (session.phase === 'live' && session.sim && session.sim.setup.userTeam == null) dt *= 2.2;
      acc += dt;
      const step = 1 / 60;
      let first = true;
      while (acc >= step) {
        const ci = first ? input.control() : { ...input.control(), juke: 0 as const, spin: false, dive: false, throwTo: null, throwAway: false, switchPlayer: false, action: false, give: false };
        session.update(step, ci);
        acc -= step;
        first = false;
      }
      // Sounds & celebrations
      for (const sname of session.soundQueue) Sound.play(sname as SoundName);
      session.soundQueue = [];
      if (session.events.length !== lastEvents) {
        for (const e of session.events.slice(lastEvents)) {
          if (e.type === 'touchdown' || e.type === 'kick_return_td') renderer.celebrate(e.team ? session.team(e.team).info.colors.primary : '#fff', true);
          if (e.type === 'field_goal') renderer.celebrate('#ffd84a');
        }
        lastEvents = session.events.length;
      }
      if (session.phase !== lastPhase) {
        lastPhase = session.phase;
        if (session.phase === 'final') {
          const us = config.userSide;
          if (us && session.g.score[us] > session.g.score[other(us)]) { renderer.launchFireworks(); renderer.celebrate(session.team(us).info.colors.primary, true); Sound.play('touchdown'); }
          setTick((t) => t + 1);
        }
      }
      if (session.phase === 'final' && Math.random() < 0.02 && config.userSide && session.g.score[config.userSide] > session.g.score[other(config.userSide)]) renderer.launchFireworks();
      renderer.draw(ctx, session, dt);
      uiAcc += dt;
      if (uiAcc > 0.08) { uiAcc = 0; setTick((t) => t + 1); }
    };
    const handleUi = (ui: string[]) => {
      const us = config.userSide;
      const ph = session.phase;
      for (const a of ui) {
        if (ph === 'presnap' && session.sim) {
          const role = session.sim.setup.userTeam;
          if (a === 'snap' && (role === 'O' || (session.sim.setup.kind === 'kickoff' && role === 'D'))) session.snap();
          if ((a === 'switch' || a === 'prevPlayer') && role === 'D' && session.sim.setup.kind === 'scrimmage') {
            session.userDefPick = session.sim.cycleUserDefender(a === 'switch' ? 1 : -1);
          }
        }
        if (ph === 'live' && session.sim?.setup.kind === 'punt' && a === 'snap') session.sim.userWantsFair = true;
        if ((ph === 'post' || ph === 'break' || ph === 'kick_anim') && (a === 'continue' || a === 'snap')) session.skip();
        if (ph === 'kick_meter' && a === 'kick') session.kickPress();
        if (a === 'timeout' && us && (ph === 'playcall' || ph === 'presnap') && session.g.phase === 'scrimmage') {
          session.callTimeout(us);
        }
      }
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      input.detach();
      Sound.stopCrowd();
    };
  }, [session, renderer, input, atmosphere, config]);

  const g = session.g;
  const home = config.home.info;
  const away = config.away.info;
  const us = config.userSide;
  const role = session.userRoleNext();

  const simToEnd = () => {
    setPaused(false);
    session.simulateToEnd();
    setTick((t) => t + 1);
  };

  return (
    <div className="game-root">
      <div className="game-wrap">
        <canvas ref={canvasRef} width={VIEW_W} height={VIEW_H} className="game-canvas" />
        {!showIntro && <Scoreboard s={session} />}
        <Banners s={session} />
        {showIntro && <IntroOverlay s={session} intro={intro} />}
        {!showIntro && !paused && session.phase === 'playcall' && us && (
          g.phase === 'kickoff' ? <KickoffCall s={session} /> : role === 'O' ? <OffenseCall s={session} /> : <DefenseCall s={session} />
        )}
        {!showIntro && !paused && session.phase === 'pat_choice' && <PatChoice s={session} />}
        {!showIntro && !paused && session.phase === 'kick_meter' && <KickMeterView s={session} />}
        {!showIntro && !paused && (session.phase === 'presnap' || session.phase === 'live') && <Hints s={session} />}
        {!showIntro && session.phase === 'break' && <BreakOverlay s={session} />}
        {session.phase === 'final' && <FinalOverlay s={session} story={story?.(session) ?? null} onDone={() => onExit(session.result(), session)} />}
        {paused && session.phase !== 'final' && (
          <div className="overlay center-overlay">
            <div className="modal">
              <h2 className="pixel">PAUSED</h2>
              <div className="modal-buttons">
                <Btn onClick={() => setPaused(false)}>RESUME</Btn>
                <Btn variant="ghost" onClick={() => setShowHelp((h) => !h)}>CONTROLS</Btn>
                <Btn variant="ghost" onClick={simToEnd}>SIM TO END</Btn>
                <Btn variant="danger" onClick={() => onExit(null, session)}>QUIT GAME</Btn>
              </div>
              {showHelp && <ControlsHelp />}
            </div>
          </div>
        )}
      </div>
      <div className="game-footer">
        <span>{away.shortName} @ {home.shortName}</span>
        <span className="dim">ESC pause · ENTER continue · T timeout</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- HUD pieces

function Scoreboard({ s }: { s: GameSession }) {
  const g = s.g;
  const home = s.cfg.home.info;
  const away = s.cfg.away.info;
  const poss: Side | null = g.phase === 'kickoff' ? null : g.possession;
  const q = g.quarter <= 4 ? ['1ST', '2ND', '3RD', '4TH'][g.quarter - 1] : g.quarter === 5 ? 'OT' : `${g.quarter - 4}OT`;
  const off = s.team(g.possession).info;
  const def = s.team(other(g.possession)).info;
  const TO = ({ n }: { n: number }) => <span className="to-dots">{[0, 1, 2].map((i) => <i key={i} className={i < n ? 'on' : ''} />)}</span>;
  return (
    <div className="scoreboard">
      <div className="sb-team" style={{ background: away.colors.primary }}>
        <TeamLogo team={away} size={22} />
        <span className="sb-abbr">{away.abbreviation}</span>
        <span className="sb-score">{g.score.away}</span>
        {poss === 'away' && <span className="sb-poss">◀</span>}
        <TO n={g.timeouts.away} />
      </div>
      <div className="sb-team" style={{ background: home.colors.primary }}>
        <TeamLogo team={home} size={22} />
        <span className="sb-abbr">{home.abbreviation}</span>
        <span className="sb-score">{g.score.home}</span>
        {poss === 'home' && <span className="sb-poss">◀</span>}
        <TO n={g.timeouts.home} />
      </div>
      <div className="sb-clock">
        <span>{q}</span>
        <span className="sb-time">{g.ot ? '--:--' : clockText(g.clock)}</span>
      </div>
      <div className="sb-down">
        {g.phase === 'kickoff' ? <span>KICKOFF</span> : g.phase === 'pat' ? <span>TRY</span> : (
          <>
            <span>{downText(g)}</span>
            <span className="dim">BALL ON {yardLineText(g.ballOn, off.abbreviation, def.abbreviation)}</span>
          </>
        )}
        {g.mercy && <span className="mercy">RUNNING CLOCK</span>}
      </div>
    </div>
  );
}

function Banners({ s }: { s: GameSession }) {
  if (!s.banners.length) return null;
  const b = s.banners[s.banners.length - 1];
  return (
    <div className={`banner ${b.big ? 'banner-big' : ''}`} style={b.color ? { ['--bcol' as string]: b.color } : undefined}>
      <div className="banner-text">{b.text}</div>
      {b.sub && <div className="banner-sub">{b.sub}</div>}
    </div>
  );
}

function IntroOverlay({ s, intro }: { s: GameSession; intro: IntroInfo }) {
  const home = s.cfg.home.info;
  const away = s.cfg.away.info;
  return (
    <div className="overlay intro">
      <div className="intro-card">
        <div className="intro-title pixel">{intro.title}</div>
        {intro.tags.map((t) => <div key={t} className="intro-tag pixel">{t}</div>)}
        <div className="intro-teams">
          <div className="intro-team">
            <TeamLogo team={away} size={88} />
            <div className="pixel name">{away.shortName.toUpperCase()}</div>
            <div className="mascot">{away.mascot}{intro.awayRecord ? ` · ${intro.awayRecord}` : ''}</div>
          </div>
          <div className="intro-vs pixel">@</div>
          <div className="intro-team">
            <TeamLogo team={home} size={88} />
            <div className="pixel name">{home.shortName.toUpperCase()}</div>
            <div className="mascot">{home.mascot}{intro.homeRecord ? ` · ${intro.homeRecord}` : ''}</div>
          </div>
        </div>
        <div className="intro-meta">{intro.kickoff} · {intro.stadium}</div>
        <div className="intro-meta">{weatherLabel(s.cfg.weather)} · {s.cfg.difficulty} · {Math.round(s.cfg.quarterLen / 60)}-MIN QUARTERS</div>
        {intro.series && <div className="intro-meta gold">{intro.series}</div>}
        {intro.pa && <div className="intro-pa">“{intro.pa}”</div>}
        <div className="press pixel blink">PRESS ENTER TO KICK OFF</div>
      </div>
    </div>
  );
}

export function weatherLabel(w: string) {
  return { clear: 'CLEAR SKIES', cold: 'COLD — 34°F', rain: 'RAIN', snow: 'SNOW', wind: 'WINDY' }[w] ?? w.toUpperCase();
}

function Hints({ s }: { s: GameSession }) {
  const sim = s.sim;
  if (!sim) return null;
  const role = sim.setup.userTeam;
  let text = '';
  if (!sim.snapped) {
    if (sim.setup.kind === 'kickoff') text = role === 'D' ? 'RECEIVING — SPACE TO START · ARROWS MOVE · SHIFT SPRINT' : 'KICKING OFF…';
    else if (role === 'O') {
      const p = sim.setup.offPlay!;
      text = p.kind === 'pass' ? 'SPACE SNAP · 1-5 THROW · T THROW AWAY · WASD SCRAMBLE' : p.kind === 'option' ? 'SPACE SNAP · 1 = GIVE TO RB · OR KEEP IT' : p.kind === 'punt' ? 'SPACE TO PUNT' : 'SPACE SNAP · WASD RUN · SHIFT SPRINT · Q/E JUKE · F SPIN';
    } else if (role === 'D') text = 'TAB SWITCH DEFENDER · WASD MOVE · SPACE DIVE/JUMP';
    else text = 'AUTO DEFENSE…';
  } else if (role === 'O' && sim.carrier === sim.user && !(sim.user?.idx === sim.qbIdx && !sim.pastLos && sim.setup.offPlay?.kind === 'pass')) {
    text = 'SHIFT SPRINT · Q/E JUKE · F SPIN · SPACE DIVE';
  } else if (role === 'O' && sim.setup.offPlay?.kind === 'pass' && !sim.passThrown) {
    text = 'PRESS 1-5 TO THROW · T THROW AWAY';
  } else if (sim.setup.kind === 'punt' && role === 'D' && sim.ball.state === 'air') text = 'SPACE = FAIR CATCH';
  else if (role === 'D') text = 'TAB SWITCH · SPACE DIVE · GET TO THE BALL';
  if (!text) return null;
  return <div className="hint pixel">{text}</div>;
}

// ---------------------------------------------------------------- play calling

function situation(s: GameSession) {
  const g = s.g;
  const off = s.team(g.possession).info;
  const def = s.team(other(g.possession)).info;
  if (g.phase === 'pat') return 'TWO-POINT TRY · BALL ON THE 3';
  return `${downText(g)} · BALL ON ${yardLineText(g.ballOn, off.abbreviation, def.abbreviation)} · ${g.ot ? 'OT' : `Q${g.quarter} ${clockText(g.clock)}`}`;
}

function useKeys(handler: (e: KeyboardEvent) => void, deps: unknown[]) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (!e.repeat) handler(e); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function OffenseCall({ s }: { s: GameSession }) {
  const g = s.g;
  const twoPt = g.phase === 'pat';
  const fourth = g.down === 4 && !twoPt;
  const [cat, setCat] = useState<PlayCategory>(fourth ? 'SPECIAL' : 'RUN');
  const [page, setPage] = useState(0);
  const [hurry, setHurry] = useState(false);
  const cats = PLAY_CATEGORIES;
  let plays = OFFENSE_PLAYS.filter((p) => p.cat === cat);
  if (twoPt) plays = plays.filter((p) => !['punt', 'fg', 'kneel', 'spike'].includes(p.id));
  if (g.ot) plays = plays.filter((p) => p.id !== 'punt' && p.id !== 'kneel');
  const pages = Math.max(1, Math.ceil(plays.length / 4));
  const shown = plays.slice((page % pages) * 4, (page % pages) * 4 + 4);
  const fgD = fgDistance(g.ballOn);
  const fgP = fgProbability(fgD, s.depth[g.possession], s.cfg.weather);
  const pick = (id: string) => { Sound.play('select'); s.userCallOffense(id, hurry); };
  useKeys((e) => {
    const i = cats.indexOf(cat);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') { setCat(cats[(i + 1) % cats.length]); setPage(0); Sound.play('menu'); }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') { setCat(cats[(i + cats.length - 1) % cats.length]); setPage(0); Sound.play('menu'); }
    if (e.code === 'KeyR' || e.code === 'ArrowDown') { setPage((p) => p + 1); Sound.play('menu'); }
    if (e.code === 'KeyH') setHurry((h) => !h);
    const n = Number(e.key);
    if (n >= 1 && n <= shown.length) pick(shown[n - 1].id);
  }, [cat, page, hurry, shown.map((p) => p.id).join()]);
  return (
    <div className="overlay playcall">
      <div className="pc-head">
        <span className="pixel">{twoPt ? 'TWO-POINT PLAY' : 'OFFENSE'}</span>
        <span className="pc-sit">{situation(s)}</span>
        <span className="pc-tools">
          {!twoPt && <label className={`chip ${hurry ? 'on' : ''}`} onClick={() => setHurry((h) => !h)}>H · HURRY-UP</label>}
          {!twoPt && s.userSide && <label className="chip" onClick={() => s.callTimeout(s.userSide!)}>T · TIMEOUT ({g.timeouts[s.userSide]})</label>}
        </span>
      </div>
      <div className="pc-tabs">
        {cats.map((c) => (
          <button key={c} className={`pc-tab ${c === cat ? 'on' : ''}`} onClick={() => { setCat(c); setPage(0); }}>{c}</button>
        ))}
      </div>
      <div className="pc-cards">
        {shown.map((p, i) => {
          const disabled = (p.id === 'fg' && fgD > 62);
          return (
            <button key={p.id} className="pc-card" disabled={disabled} onClick={() => pick(p.id)}>
              <span className="pc-key pixel">{i + 1}</span>
              <span className="pc-name pixel">{p.name.toUpperCase()}</span>
              <PlayDiagram play={p} />
              <span className="pc-desc">{p.id === 'fg' ? `${fgD} yards · ${Math.round(fgP * 100)}% for your kicker` : p.desc}</span>
            </button>
          );
        })}
        {pages > 1 && <button className="pc-more" onClick={() => setPage((p) => p + 1)}>MORE ▸<br /><small>R</small></button>}
      </div>
      <div className="pc-foot dim">← → CATEGORY · 1-4 CALL PLAY · R MORE PLAYS</div>
    </div>
  );
}

function DefenseCall({ s }: { s: GameSession }) {
  const g = s.g;
  const [form, setForm] = useState<DefFormationId>(g.toGo >= 8 && g.down >= 3 ? 'Nickel' : g.ballOn >= 95 ? 'Goal Line' : '4-3');
  const [cov, setCov] = useState<Coverage>('Cover 3');
  const go = () => { Sound.play('select'); s.userCallDefense({ formation: form, coverage: cov }); };
  const auto = () => {
    Sound.play('select');
    s.userCallDefense({ formation: g.toGo >= 8 && g.down >= 3 ? 'Nickel' : g.ballOn >= 95 ? 'Goal Line' : '4-3', coverage: (['Cover 3', 'Cover 2', 'Man', 'Cover 4'] as Coverage[])[Math.floor(Math.random() * 4)] });
  };
  useKeys((e) => {
    const n = Number(e.key);
    if (n >= 1 && n <= 5) setForm(DEF_FORMATIONS[n - 1]);
    const ci = COVERAGES.indexOf(cov);
    if (e.code === 'ArrowRight' || e.code === 'KeyD') setCov(COVERAGES[(ci + 1) % COVERAGES.length]);
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') setCov(COVERAGES[(ci + COVERAGES.length - 1) % COVERAGES.length]);
    if (e.code === 'Enter' || e.code === 'Space') go();
  }, [form, cov]);
  return (
    <div className="overlay playcall">
      <div className="pc-head">
        <span className="pixel">DEFENSE</span>
        <span className="pc-sit">{situation(s)}</span>
        <span className="pc-tools">
          {s.userSide && g.phase === 'scrimmage' && <label className="chip" onClick={() => s.callTimeout(s.userSide!)}>T · TIMEOUT ({g.timeouts[s.userSide]})</label>}
        </span>
      </div>
      <div className="def-row">
        <span className="def-label">FORMATION</span>
        {DEF_FORMATIONS.map((f, i) => (
          <button key={f} className={`def-btn ${f === form ? 'on' : ''}`} onClick={() => setForm(f)}><small>{i + 1}</small> {f}</button>
        ))}
      </div>
      <div className="def-row">
        <span className="def-label">COVERAGE</span>
        {COVERAGES.map((c) => (
          <button key={c} className={`def-btn ${c === cov ? 'on' : ''}`} onClick={() => setCov(c)}>{c}</button>
        ))}
      </div>
      <div className="def-desc">{COVERAGE_DESC[cov]}</div>
      <div className="def-go">
        <Btn variant="ghost" onClick={auto}>AUTO CALL</Btn>
        <Btn variant="gold" onClick={go}>BREAK HUDDLE ▸</Btn>
      </div>
      <div className="pc-foot dim">1-5 FORMATION · ← → COVERAGE · ENTER CONFIRM · PRE-SNAP: TAB PICKS YOUR DEFENDER</div>
    </div>
  );
}

function KickoffCall({ s }: { s: GameSession }) {
  const lead = s.userSide ? s.g.score[s.userSide] - s.g.score[other(s.userSide)] : 0;
  useKeys((e) => {
    if (e.key === '1') s.userKickoff(false);
    if (e.key === '2') s.userKickoff(true);
  }, []);
  return (
    <div className="overlay center-overlay">
      <div className="modal">
        <h2 className="pixel">{s.g.kickFrom === 20 ? 'FREE KICK' : 'KICKOFF'}</h2>
        <div className="modal-buttons">
          <Btn variant="gold" onClick={() => s.userKickoff(false)}>1 · KICK DEEP</Btn>
          <Btn variant={lead < 0 && s.g.quarter >= 4 ? 'gold' : 'ghost'} onClick={() => s.userKickoff(true)}>2 · ONSIDE KICK</Btn>
        </div>
      </div>
    </div>
  );
}

function PatChoice({ s }: { s: GameSession }) {
  useKeys((e) => {
    if (e.key === '1') s.userPat('kick');
    if (e.key === '2') s.userPat('two');
  }, []);
  return (
    <div className="overlay center-overlay">
      <div className="modal">
        <h2 className="pixel">TRY AFTER TOUCHDOWN</h2>
        <div className="modal-buttons">
          <Btn variant="gold" onClick={() => s.userPat('kick')}>1 · KICK EXTRA POINT</Btn>
          <Btn variant="ghost" onClick={() => s.userPat('two')}>2 · GO FOR TWO</Btn>
        </div>
      </div>
    </div>
  );
}

function KickMeterView({ s }: { s: GameSession }) {
  const k = s.kick;
  if (!k) return null;
  return (
    <div className="overlay kick-meter">
      <div className="km-title pixel">{k.kind === 'xp' ? 'EXTRA POINT' : `${k.distance}-YARD FIELD GOAL`}</div>
      <div className="km-aim">
        <div className="km-zone" />
        <div className="km-needle" style={{ left: `${50 + k.aim * 48}%` }} />
      </div>
      <div className="km-power">
        <div className="km-power-fill" style={{ width: `${(k.stage === 'aim' ? 0 : k.power) * 100}%` }} />
        <div className="km-need" style={{ left: `${Math.min(100, (k.distance / (32 + (s.depth[s.g.possession].K[0]?.attrs.kpow ?? 50) * 0.3)) * 100)}%` }} />
      </div>
      <div className="km-help pixel">{k.stage === 'aim' ? 'SPACE — LOCK AIM' : 'SPACE — LOCK POWER (PASS THE LINE)'}</div>
    </div>
  );
}

function BreakOverlay({ s }: { s: GameSession }) {
  const g = s.g;
  return (
    <div className="overlay center-overlay soft">
      <div className="modal">
        <h2 className="pixel">{s.breakText || 'END OF QUARTER'}</h2>
        <div className="mini-score">
          <span>{s.cfg.away.info.shortName} {g.score.away}</span>
          <span>{s.cfg.home.info.shortName} {g.score.home}</span>
        </div>
        <div className="dim">PRESS ENTER</div>
      </div>
    </div>
  );
}

function FinalOverlay({ s, onDone, story }: { s: GameSession; onDone: () => void; story: { headline: string; body: string[] } | null }) {
  const g = s.g;
  const home = s.cfg.home.info;
  const away = s.cfg.away.info;
  const us = s.cfg.userSide;
  const won = us ? g.score[us] > g.score[other(us)] : null;
  useKeys((e) => { if (e.code === 'Enter') onDone(); }, []);
  return (
    <div className="overlay final">
      <div className="final-card">
        <div className={`final-result pixel ${won ? 'win' : won === false ? 'loss' : ''}`}>{won == null ? 'FINAL' : won ? 'VICTORY!' : 'DEFEAT'}</div>
        <div className="final-score">
          <div><TeamLogo team={away} size={56} /><div className="pixel">{away.abbreviation}</div><div className="big pixel">{g.score.away}</div></div>
          <div className="pixel dim">FINAL{g.ot ? ` / ${g.ot.period > 1 ? g.ot.period : ''}OT` : ''}</div>
          <div><TeamLogo team={home} size={56} /><div className="pixel">{home.abbreviation}</div><div className="big pixel">{g.score.home}</div></div>
        </div>
        {story && (
          <div className="newspaper">
            <div className="np-mast">THE LOUDOUN GRIDIRON GAZETTE</div>
            <div className="np-head">{story.headline}</div>
            {story.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        )}
        <BoxScore s={s} compact />
        <div className="final-actions">
          <Btn variant="gold" onClick={onDone}>CONTINUE ▸</Btn>
        </div>
      </div>
    </div>
  );
}

export function ControlsHelp() {
  const rows: [string, string][] = [
    ['WASD / ARROWS', 'Move'], ['SHIFT', 'Sprint (uses stamina)'], ['SPACE', 'Snap · Dive · Jump for the ball'],
    ['1 – 5', 'Throw to receiver (icon colors: green open, red covered)'], ['T', 'Throw away (live) / Timeout (huddle)'],
    ['Q / E or double-tap W/S', 'Juke up / down'], ['F', 'Spin move'], ['TAB / C', 'Switch defender'],
    ['H', 'Hurry-up offense'], ['ENTER', 'Continue'], ['ESC / P', 'Pause'],
  ];
  return (
    <table className="controls">
      <tbody>{rows.map(([k, v]) => <tr key={k}><td className="pixel">{k}</td><td>{v}</td></tr>)}</tbody>
    </table>
  );
}

void getSettings;

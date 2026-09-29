/**
 * Game viewer. The engine (GameSimulation) produces PlayEvents; this screen animates them on the canvas,
 * keeps the broadcast scorebug in sync, and exposes the head coach's controls. It never alters outcomes.
 */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { autosave, bump, navigate, updateSettings, useStore } from '../../app/store';
import type { CoachingSettings, GameResult, Player, Side, TeamInfo } from '../../models/types';
import { GameSimulation } from '../../simulation/game/gameEngine';
import type { FourthDownChoice, PendingDecision, PlayEvent } from '../../simulation/game/types';
import { weatherLabel } from '../../simulation/game/weather';
import { applyGameResult, buildGameSetup, completeWeek, userSideOf } from '../../simulation/seasonEngine';
import { buildExhibition, DEFAULT_COACHING, gameSetupFor } from '../../simulation/world';
import { formatClock, ordinal } from '../../core/util';
import { sample, type PlayAnimation } from '../../visualization/animation';
import { buildAnimation, SNAP_TIME } from '../../visualization/playAnimator';
import { FieldRenderer } from '../../visualization/fieldRenderer';
import { FullBoxScore, TeamBox, passerRating } from './BoxScore';
import { CoachingControls } from '../dynasty/GamePlanPage';
import { TeamBadge, textOn } from '../components/common';

interface Board {
  quarter: number;
  clock: number;
  possession: Side;
  down: number;
  distance: number;
  ballOn: number;
  score: { home: number; away: number };
  timeouts: { home: number; away: number };
  label?: string;
}

type AutoMode = 'watch' | 'fast';

const BANNER_KINDS = new Set(['TOUCHDOWN', 'INTERCEPTION', 'FUMBLE', 'FIELD GOAL', 'SAFETY', 'TURNOVER ON DOWNS', 'NO GOOD', 'BLOCKED', 'OVERTIME', 'HALFTIME', 'ONSIDE RECOVERED', 'TWO-POINT GOOD']);

function downLabel(b: Board, info: Record<Side, TeamInfo>): { dd: string; spot: string } {
  if (b.label) return { dd: b.label, spot: '' };
  const goal = b.ballOn + b.distance >= 100;
  const dd = b.down >= 1 && b.down <= 4 ? `${ordinal(b.down)} & ${goal ? 'Goal' : b.distance}` : '—';
  const off = info[b.possession];
  const def = info[b.possession === 'home' ? 'away' : 'home'];
  const spot = b.ballOn === 50 ? 'MIDFIELD' : b.ballOn < 50 ? `${off.abbreviation} ${b.ballOn}` : `${def.abbreviation} ${100 - b.ballOn}`;
  return { dd, spot };
}

function boardBefore(ev: PlayEvent, prev: Board): Board {
  let label: string | undefined;
  if (ev.kind === 'kickoff' || ev.kind === 'onside_kick') label = 'KICKOFF';
  if (ev.kind === 'free_kick') label = 'FREE KICK';
  if (ev.kind === 'extra_point') label = 'EXTRA POINT';
  if (ev.kind === 'two_point') label = '2-PT TRY';
  return { quarter: ev.quarter, clock: ev.clockBefore, possession: ev.offense, down: ev.down, distance: ev.distance, ballOn: ev.ballOn, score: prev.score, timeouts: ev.timeout ? prev.timeouts : prev.timeouts, label };
}

function boardAfter(ev: PlayEvent): Board {
  return {
    quarter: ev.quarterAfter,
    clock: ev.clockAfter,
    possession: ev.possessionAfter,
    down: ev.downAfter,
    distance: ev.distanceAfter,
    ballOn: ev.ballOnAfter,
    score: ev.scoreAfter,
    timeouts: ev.timeoutsAfter,
    label: ev.final ? 'FINAL' : ev.score?.type === 'TD' ? 'PAT' : undefined,
  };
}

function quarterLabel(q: number, final: boolean, ot: boolean): string {
  if (final) return ot ? 'FINAL/OT' : 'FINAL';
  if (q <= 4) return `${ordinal(q)} QTR`;
  return q === 5 ? 'OT' : `${q - 4}OT`;
}

function Scorebug({ board, info, ranks, final, clock, playClock }: { board: Board; info: Record<Side, TeamInfo>; ranks: Record<Side, number>; final: boolean; clock: number; playClock: number | null }) {
  const { dd, spot } = downLabel(board, info);
  const team = (side: Side) => {
    const t = info[side];
    return (
      <div className="sb-team" style={{ background: t.primaryColor, color: textOn(t.primaryColor) }}>
        {ranks[side] ? <span className="rk">{ranks[side]}</span> : null}
        <span className="ab">{t.abbreviation}</span>
        <span className="sc">{board.score[side]}</span>
        {!final && board.possession === side && <span className="poss" />}
        <span className="tos">
          {[0, 1, 2].map((i) => (
            <i key={i} className={i < board.timeouts[side] ? '' : 'used'} />
          ))}
        </span>
      </div>
    );
  };
  return (
    <div className="scorebug">
      {team('away')}
      {team('home')}
      <div className="sb-mid">
        <div className="q">{quarterLabel(board.quarter, final, board.quarter > 4)}</div>
        <div className="clk">{final ? '' : board.quarter > 4 ? '—' : formatClock(clock)}</div>
      </div>
      {!final && (
        <div className="sb-dd">
          <div className="dd">{dd}</div>
          <div className="spot">{spot}</div>
          {playClock !== null && <div className="pc">:{String(playClock).padStart(2, '0')}</div>}
        </div>
      )}
    </div>
  );
}

export interface GameViewProps {
  engine: GameSimulation;
  players: Record<string, Player>;
  userSide?: Side;
  onSettingsChange?: (s: CoachingSettings) => void;
  onGameOver: (result: GameResult) => void;
  onExit: () => void;
  exitLabel: string;
  finalActions: ReactNode;
  headerNote?: string;
  allowPickSide?: boolean;
}

export function GameView({ engine, players, userSide: initialUserSide, onSettingsChange, onGameOver, onExit, exitLabel, finalActions, headerNote, allowPickSide }: GameViewProps) {
  const { settings } = useStore();
  const info: Record<Side, TeamInfo> = { home: engine.setup.home.info, away: engine.setup.away.info };
  const ranks = { home: 0, away: 0 };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [userSide, setUserSide] = useState<Side | undefined>(initialUserSide);
  const [events, setEvents] = useState<PlayEvent[]>([]);
  const [board, setBoard] = useState<Board>(() => {
    const s = engine.situation;
    return { quarter: s.quarter, clock: s.clock, possession: s.possession, down: 1, distance: 10, ballOn: 25, score: s.score, timeouts: s.timeouts, label: 'KICKOFF' };
  });
  const [clockDisp, setClockDisp] = useState(board.clock);
  const [playClock, setPlayClock] = useState<number | null>(null);
  const [lower, setLower] = useState<{ call?: string; text: string } | null>({ text: `${info.away.school} at ${info.home.school} · ${engine.setup.neutralSite ?? info.home.stadium} · ${weatherLabel(engine.weather)}` });
  const [banner, setBanner] = useState<{ text: string; color: string; key: number } | null>(null);
  const [paused, setPaused] = useState(false);
  const [mode, setMode] = useState<AutoMode>('watch');
  const [speed, setSpeed] = useState(settings.speed);
  const [pending, setPending] = useState<PendingDecision | null>(null);
  const [final, setFinal] = useState(false);
  const [showFinal, setShowFinal] = useState(false);
  const [sideTab, setSideTab] = useState<'pbp' | 'box' | 'coach'>('pbp');
  const [camera, setCamera] = useState(settings.camera);
  const [coachSettings, setCoachSettings] = useState<CoachingSettings>(userSide ? engine.setup[userSide].settings : { ...DEFAULT_COACHING });
  const [, setTick] = useState(0);

  const c = useRef({
    anim: null as PlayAnimation | null,
    ev: null as PlayEvent | null,
    t: 0,
    hold: 0,
    gap: 0.6,
    fired: new Set<string>(),
    renderer: null as FieldRenderer | null,
    board,
    lastBoardAfter: board,
    lastTs: 0,
    fastAcc: 0,
    clockAcc: 0,
    reported: false,
  });
  // Live values for the rAF loop.
  const live = useRef({ paused, mode, speed, pending, final, promptOn: settings.fourthDownPrompts, userSide });
  live.current = { paused, mode, speed, pending, final, promptOn: settings.fourthDownPrompts, userSide };

  const showBanner = useCallback(
    (ev: PlayEvent) => {
      if (!ev.highlight || !BANNER_KINDS.has(ev.highlight)) return;
      const side = ev.score?.team ?? (ev.turnover ? (ev.possessionAfter as Side) : ev.offense);
      const t = info[side] ?? info.home;
      setBanner({ text: ev.highlight, color: ev.highlight === 'NO GOOD' ? '#ff5a5f' : t.primaryColor === '#000000' ? '#ffcc33' : t.primaryColor, key: ev.index });
    },
    [info],
  );

  const reportIfFinal = useCallback(() => {
    if (engine.isFinal && !c.current.reported) {
      c.current.reported = true;
      setFinal(true);
      onGameOver(engine.result());
      setTimeout(() => setShowFinal(true), 1200);
    }
  }, [engine, onGameOver]);

  const finishCurrent = useCallback(() => {
    const cur = c.current;
    const ev = cur.ev;
    if (!ev) return;
    const after = boardAfter(ev);
    cur.board = after;
    cur.lastBoardAfter = after;
    setBoard(after);
    setClockDisp(after.clock);
    setPlayClock(null);
    setEvents((list) => [...list, ev]);
    setLower({ call: ev.conceptName ? `${ev.conceptName}${ev.formation ? ` · ${ev.formation.replace(/_/g, ' ')}` : ''}` : undefined, text: ev.text });
    if (live.current.mode === 'watch') showBanner(ev);
    cur.ev = null;
    cur.gap = ev.highlight === 'TOUCHDOWN' || ev.highlight === 'HALFTIME' ? 2.2 : ev.kind === 'period_end' ? 1.4 : 0.7;
    reportIfFinal();
  }, [showBanner, reportIfFinal]);

  const beginEvent = useCallback((ev: PlayEvent) => {
    const cur = c.current;
    cur.ev = ev;
    cur.t = 0;
    cur.fired = new Set();
    const anim = buildAnimation(ev, players);
    if (anim) cur.anim = anim;
    cur.hold = anim ? anim.duration : 1.2;
    const b = boardBefore(ev, cur.lastBoardAfter);
    cur.board = b;
    setBoard(b);
    setClockDisp(ev.clockBefore);
    if (ev.timeout) setLower({ call: 'TIMEOUT', text: `Timeout, ${info[ev.timeout].school}.` });
    else if (ev.conceptName) setLower({ call: 'PRE-SNAP', text: `${info[ev.offense].abbreviation} — ${ev.formation?.replace(/_/g, ' ')} · ${ev.defense ? `${info[ev.offense === 'home' ? 'away' : 'home'].abbreviation} ${ev.defense.front}${ev.defense.blitz ? ', showing blitz' : ''}` : ''}` });
  }, [players, info]);

  /** Advance the engine by one play (respecting the user's 4th-down prompt). */
  const stepEngine = useCallback(
    (choice?: FourthDownChoice): PlayEvent | null => {
      if (engine.isFinal) return null;
      if (!choice && live.current.promptOn && live.current.userSide) {
        const dec = engine.pendingDecision();
        if (dec) {
          setPending(dec);
          return null;
        }
      }
      return engine.step(choice ? { fourthDown: choice } : {});
    },
    [engine],
  );

  // Main animation loop.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const renderer = new FieldRenderer(canvas, info.home, info.away);
    renderer.mode = camera;
    renderer.snapCamera(board.possession === 'home' ? 25 : 75);
    c.current.renderer = renderer;
    let raf = 0;
    const frame = (ts: number) => {
      const cur = c.current;
      const dt = cur.lastTs ? Math.min(0.1, (ts - cur.lastTs) / 1000) : 0.016;
      cur.lastTs = ts;
      const L = live.current;
      if (!L.paused && !L.pending && !(L.final && !cur.ev)) {
        if (L.mode === 'fast') {
          if (cur.ev) finishCurrent();
          cur.fastAcc += dt * L.speed;
          while (cur.fastAcc >= 0.09) {
            cur.fastAcc -= 0.09;
            const ev = stepEngine();
            if (!ev) break;
            beginEvent(ev);
            finishCurrent();
            if (engine.isFinal) break;
          }
        } else if (cur.ev) {
          cur.t += dt * L.speed;
          const anim = cur.anim;
          if (anim && cur.ev.kind !== 'period_end') {
            for (const m of anim.markers) {
              const key = `${m.kind}${m.t}`;
              if (cur.t >= m.t && !cur.fired.has(key)) {
                cur.fired.add(key);
                if ((m.kind === 'touchdown' || m.kind === 'interception') && cur.ev.highlight) showBanner(cur.ev);
              }
            }
            // Game clock runs from snap to whistle.
            const ev = cur.ev;
            const span = Math.max(0.5, anim.duration - SNAP_TIME - 0.9);
            const k = Math.max(0, Math.min(1, (cur.t - SNAP_TIME) / span));
            cur.clockAcc += dt;
            if (cur.clockAcc > 0.08) {
              cur.clockAcc = 0;
              setClockDisp(ev.clockBefore - (ev.clockBefore - ev.clockAfter) * k);
              setPlayClock(cur.t < SNAP_TIME && ev.down > 0 ? Math.max(1, Math.ceil(6 + (SNAP_TIME - cur.t) * 6)) : null);
            }
          }
          if (cur.t >= cur.hold) finishCurrent();
        } else {
          cur.gap -= dt * Math.max(1, L.speed);
          if (cur.gap <= 0) {
            const ev = stepEngine();
            if (ev) beginEvent(ev);
            else reportIfFinal();
          }
        }
      }
      // Render.
      const anim = cur.anim;
      const t = anim ? Math.min(cur.ev ? cur.t : anim.duration, anim.duration) : 0;
      let camX = renderer.camX;
      let carrier: string | undefined;
      if (anim && L.mode === 'watch') {
        const ball = sample(anim.ball, t);
        camX = ball.x;
      } else {
        const b = cur.board;
        const dir = cur.ev?.direction ?? 1;
        camX = dir === 1 ? b.ballOn : 100 - b.ballOn;
      }
      renderer.setCamera(camX, !!anim?.wide && L.mode === 'watch', dt);
      renderer.render(L.mode === 'watch' ? anim : null, t, SNAP_TIME, carrier);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (c.current.renderer) c.current.renderer.mode = camera;
  }, [camera]);

  // Canvas sizing.
  useEffect(() => {
    const wrap = wrapRef.current!;
    const canvas = canvasRef.current!;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(320, Math.floor(wrap.clientWidth * dpr));
      canvas.height = Math.max(240, Math.floor(wrap.clientHeight * dpr));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (!banner) return;
    const id = setTimeout(() => setBanner(null), 1700);
    return () => clearTimeout(id);
  }, [banner]);

  const decide = (choice: FourthDownChoice) => {
    setPending(null);
    const ev = stepEngine(choice);
    if (ev) {
      if (mode === 'fast') {
        beginEvent(ev);
        finishCurrent();
      } else beginEvent(ev);
    }
  };

  /** Sim instantly until a condition holds (CPU staff makes all decisions). */
  const simUntil = (stop: (ev: PlayEvent) => boolean) => {
    const cur = c.current;
    setPending(null);
    if (cur.ev) finishCurrent();
    const batch: PlayEvent[] = [];
    let last: PlayEvent | null = null;
    let guard = 0;
    while (!engine.isFinal && guard++ < 1000) {
      const ev = engine.step();
      if (!ev) break;
      batch.push(ev);
      last = ev;
      if (stop(ev)) break;
    }
    if (last) {
      const after = boardAfter(last);
      cur.board = after;
      cur.lastBoardAfter = after;
      cur.anim = buildAnimation(last, players);
      cur.ev = null;
      cur.gap = 1.2;
      setBoard(after);
      setClockDisp(after.clock);
      setEvents((list) => [...list, ...batch]);
      setLower({ text: last.text });
      if (cur.renderer) cur.renderer.snapCamera(last.direction === 1 ? last.ballOnAfter : 100 - last.ballOnAfter);
    }
    reportIfFinal();
  };

  const sit = engine.situation;
  const toNextPossession = () => simUntil((ev) => ev.final === true || ev.kind === 'kickoff' || ev.kind === 'free_kick' || ev.kind === 'onside_kick' || (ev.kind !== 'extra_point' && ev.kind !== 'two_point' && ev.possessionAfter !== ev.offense && !ev.score) || (ev.kind === 'period_end' && ev.highlight === 'HALFTIME'));
  const toHalf = () => simUntil((ev) => ev.kind === 'period_end' && ev.quarter === 2);
  const toFourth = () => simUntil((ev) => ev.kind === 'period_end' && ev.quarter === 3);
  const toEnd = () => simUntil(() => false);

  const changeSettings = (s: CoachingSettings) => {
    setCoachSettings(s);
    if (userSide) engine.setSettings(userSide, s);
    onSettingsChange?.(s);
  };

  const pickSide = (side: Side | undefined) => {
    for (const sd of ['home', 'away'] as Side[]) engine.setup[sd].isUser = sd === side;
    engine.setup.promptFourthDown = true;
    setUserSide(side);
    if (side) setCoachSettings(engine.setup[side].settings);
    setTick((x) => x + 1);
  };

  const result = sideTab === 'box' || showFinal ? engine.result() : null;
  const reversed = [...events].reverse();
  const lastScore = board.score;
  const winner: Side = lastScore.home >= lastScore.away ? 'home' : 'away';

  return (
    <div className="game-screen">
      <div className="game-main">
        <div className="canvas-wrap" ref={wrapRef}>
          <canvas ref={canvasRef} />
          <div className="top-info">
            <div>
              {info.away.school} @ {info.home.school}
              {headerNote ? ` · ${headerNote}` : ''}
            </div>
            <div>{weatherLabel(engine.weather)}</div>
          </div>
          {banner && (
            <div key={banner.key} className="highlight-banner" style={{ color: '#fff', WebkitTextStroke: `2px ${banner.color}` }}>
              {banner.text}
            </div>
          )}
          {lower && (
            <div className="lower-third">
              <div>
                {lower.call && <div className="call">{lower.call}</div>}
                {lower.text}
              </div>
            </div>
          )}
          <Scorebug board={board} info={info} ranks={ranks} final={final && !c.current.ev} clock={clockDisp} playClock={playClock} />
          {pending && (
            <div className="decision">
              <div className="box">
                <div className="muted">DECISION TIME</div>
                <h2>
                  4th &amp; {pending.ballOn + pending.distance >= 100 ? 'Goal' : pending.distance}
                </h2>
                <div className="muted" style={{ marginBottom: 14 }}>
                  {pending.ballOn < 50 ? `Own ${pending.ballOn}` : pending.ballOn === 50 ? 'Midfield' : `Opponent ${100 - pending.ballOn}`} · Score {board.score[pending.side]}-{board.score[pending.side === 'home' ? 'away' : 'home']} · Q{board.quarter > 4 ? 'OT' : board.quarter} {board.quarter <= 4 ? formatClock(board.clock) : ''}
                </div>
                <div className="row" style={{ justifyContent: 'center' }}>
                  <button className="btn primary" onClick={() => decide('go')}>
                    Go For It
                  </button>
                  {pending.fieldGoalDistance <= 65 && (
                    <button className="btn" onClick={() => decide('field_goal')}>
                      Field Goal ({pending.fieldGoalDistance} yds)
                    </button>
                  )}
                  {pending.canPunt && (
                    <button className="btn" onClick={() => decide('punt')}>
                      Punt
                    </button>
                  )}
                </div>
                <div className="muted" style={{ marginTop: 12, fontSize: 12 }}>
                  Staff recommends: <b style={{ color: '#fff' }}>{pending.recommendation === 'go' ? 'GO FOR IT' : pending.recommendation === 'field_goal' ? 'FIELD GOAL' : 'PUNT'}</b>
                </div>
              </div>
            </div>
          )}
          {showFinal && result && (
            <div className="final-overlay">
              <div className="final-card panel">
                <div className="center muted" style={{ letterSpacing: '.3em' }}>
                  FINAL{result.overtimePeriods ? ` · ${result.overtimePeriods > 1 ? result.overtimePeriods : ''}OT` : ''}
                </div>
                <div className="final-score">
                  <div className="row" style={{ justifyContent: 'flex-end' }}>
                    <div className="t right" style={{ opacity: winner === 'away' ? 1 : 0.55 }}>
                      {info.away.school}
                    </div>
                    <TeamBadge teamId={info.away.id} size={56} />
                  </div>
                  <div className="s">
                    {result.awayScore} – {result.homeScore}
                  </div>
                  <div className="row">
                    <TeamBadge teamId={info.home.id} size={56} />
                    <div className="t" style={{ opacity: winner === 'home' ? 1 : 0.55 }}>
                      {info.home.school}
                    </div>
                  </div>
                </div>
                <TopPerformers result={result} players={players} />
                <div className="row" style={{ justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                  <button className="btn" onClick={() => setShowFinal(false)}>
                    View Field / Box Score
                  </button>
                  {finalActions}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="controls">
          <button className={`btn small ${mode === 'watch' && !paused ? 'active' : ''}`} onClick={() => { setMode('watch'); setPaused(false); }} disabled={final}>
            ▶ Watch
          </button>
          <button className="btn small" onClick={() => setPaused((p) => !p)} disabled={final}>
            {paused ? 'Resume' : '❚❚ Pause'}
          </button>
          <button className={`btn small ${mode === 'fast' ? 'active' : ''}`} onClick={() => { setMode('fast'); setPaused(false); }} disabled={final}>
            ⏩ Fast Sim
          </button>
          <span className="muted" style={{ margin: '0 4px' }}>|</span>
          <button className="btn small" onClick={toNextPossession} disabled={final}>
            Next Possession
          </button>
          <button className="btn small" onClick={toHalf} disabled={final || sit.quarter > 2}>
            To Halftime
          </button>
          <button className="btn small" onClick={toFourth} disabled={final || sit.quarter > 3}>
            To 4th Qtr
          </button>
          <button className="btn small" onClick={toEnd} disabled={final}>
            Sim To End
          </button>
          <span className="spacer" />
          <span className="muted">Speed</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button key={s} className={`btn small ${speed === s ? 'active' : ''}`} onClick={() => { setSpeed(s); updateSettings({ speed: s }); }}>
              {s}x
            </button>
          ))}
          <button className="btn small" onClick={() => { const m = camera === 'broadcast' ? 'overhead' : 'broadcast'; setCamera(m); updateSettings({ camera: m }); }}>
            {camera === 'broadcast' ? 'All-22 Cam' : 'Broadcast Cam'}
          </button>
          {final ? (
            <button className="btn small primary" onClick={() => setShowFinal(true)}>
              Final Screen
            </button>
          ) : (
            <button className="btn small" onClick={onExit}>
              {exitLabel}
            </button>
          )}
        </div>
      </div>
      <div className="game-side">
        <div className="tabs">
          <button className={`tab ${sideTab === 'pbp' ? 'active' : ''}`} onClick={() => setSideTab('pbp')}>
            Play-by-Play
          </button>
          <button className={`tab ${sideTab === 'box' ? 'active' : ''}`} onClick={() => setSideTab('box')}>
            Box Score
          </button>
          <button className={`tab ${sideTab === 'coach' ? 'active' : ''}`} onClick={() => setSideTab('coach')}>
            Coaching
          </button>
        </div>
        <div className="side-scroll">
          {sideTab === 'pbp' &&
            reversed.map((ev) => {
              const cls = ev.score ? 'score' : ev.turnover && ev.turnover !== 'downs' ? 'turnover' : '';
              const offAbbr = info[ev.offense].abbreviation;
              const sitText =
                ev.kind === 'period_end'
                  ? ''
                  : ev.down >= 1 && ev.down <= 4
                    ? `${ordinal(ev.down)} & ${ev.ballOn + ev.distance >= 100 ? 'Goal' : ev.distance} · ${ev.ballOn < 50 ? `${offAbbr} ${ev.ballOn}` : ev.ballOn === 50 ? '50' : `${info[ev.offense === 'home' ? 'away' : 'home'].abbreviation} ${100 - ev.ballOn}`}`
                    : offAbbr;
              return (
                <div key={ev.index} className={`pbp-item ${cls}`}>
                  <div className="sit">
                    {ev.quarter <= 4 ? `Q${ev.quarter} ${formatClock(ev.clockBefore)}` : `OT${ev.quarter - 4}`} {sitText && `· ${sitText}`}
                    {ev.userCall ? ' · YOUR CALL' : ''}
                  </div>
                  {ev.text}
                  {ev.injury && (
                    <div className="bad" style={{ fontSize: 11.5, marginTop: 2 }}>
                      INJURY: {players[ev.injury.playerId]?.firstName} {players[ev.injury.playerId]?.lastName} ({ev.injury.type})
                    </div>
                  )}
                  {ev.score && (
                    <div className="accent" style={{ fontSize: 11.5, marginTop: 2 }}>
                      {info.away.abbreviation} {ev.scoreAfter.away} – {info.home.abbreviation} {ev.scoreAfter.home}
                    </div>
                  )}
                </div>
              );
            })}
          {sideTab === 'pbp' && !events.length && <div className="muted">Kickoff is coming up…</div>}
          {sideTab === 'box' && result && (
            <div className="col">
              <FullBoxScoreCompact result={result} homeId={info.home.id} awayId={info.away.id} players={players} />
            </div>
          )}
          {sideTab === 'coach' && (
            <div>
              {allowPickSide && (
                <div className="coach-panel" style={{ marginBottom: 10 }}>
                  <label>Coach a team</label>
                  <div className="seg">
                    <button className={!userSide ? 'on' : ''} onClick={() => pickSide(undefined)}>
                      Watch only
                    </button>
                    <button className={userSide === 'away' ? 'on' : ''} onClick={() => pickSide('away')}>
                      {info.away.abbreviation}
                    </button>
                    <button className={userSide === 'home' ? 'on' : ''} onClick={() => pickSide('home')}>
                      {info.home.abbreviation}
                    </button>
                  </div>
                </div>
              )}
              {userSide ? (
                <>
                  <div className="muted" style={{ fontSize: 12 }}>
                    Sideline adjustments for {info[userSide].school} apply from the next snap. 4th-down prompts: {settings.fourthDownPrompts ? 'ON' : 'OFF'}{' '}
                    <button className="btn small ghost" onClick={() => updateSettings({ fourthDownPrompts: !settings.fourthDownPrompts })}>
                      toggle
                    </button>
                  </div>
                  <CoachingControls value={coachSettings} onChange={changeSettings} />
                </>
              ) : (
                <div className="muted">You are watching this game. {allowPickSide ? 'Pick a side above to coach it.' : ''}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FullBoxScoreCompact({ result, homeId, awayId, players }: { result: GameResult; homeId: string; awayId: string; players: Record<string, Player> }) {
  return (
    <>
      <TeamBox teamId={awayId} lines={result.playerLines} players={players} />
      <TeamBox teamId={homeId} lines={result.playerLines} players={players} />
      <details>
        <summary className="muted" style={{ cursor: 'pointer' }}>
          Team stats & scoring
        </summary>
        <FullBoxScore result={result} homeId={homeId} awayId={awayId} players={players} />
      </details>
    </>
  );
}

function TopPerformers({ result, players }: { result: GameResult; players: Record<string, Player> }) {
  const lines = result.playerLines;
  const best = (score: (l: (typeof lines)[number]) => number) => [...lines].sort((a, b) => score(b) - score(a))[0];
  const passer = best((l) => (l.passYds ?? 0) + (l.passTD ?? 0) * 20);
  const rusher = best((l) => (l.rushYds ?? 0) + (l.rushTD ?? 0) * 20);
  const receiver = best((l) => (l.recYds ?? 0) + (l.recTD ?? 0) * 20);
  const defender = best((l) => (l.tackles ?? 0) + (l.sacks ?? 0) * 3 + (l.defInt ?? 0) * 4 + (l.forcedFum ?? 0) * 3);
  const row = (label: string, l: (typeof lines)[number] | undefined, text: string) => {
    if (!l) return null;
    const p = players[l.playerId];
    return (
      <div className="row" style={{ padding: '5px 0', borderBottom: '1px solid var(--line)' }}>
        <span className="muted" style={{ width: 80, fontSize: 12 }}>
          {label}
        </span>
        <TeamBadge teamId={l.teamId} size={22} />
        <b>
          {p?.firstName} {p?.lastName}
        </b>
        <span className="spacer" />
        <span className="mono">{text}</span>
      </div>
    );
  };
  return (
    <div>
      <h4 className="muted" style={{ marginBottom: 6 }}>
        Top Performers
      </h4>
      {passer?.passAtt ? row('Passing', passer, `${passer.passComp}/${passer.passAtt}, ${passer.passYds} yds, ${passer.passTD ?? 0} TD, ${passer.passInt ?? 0} INT · ${passerRating(passer).toFixed(1)} RTG`) : null}
      {rusher?.rushAtt ? row('Rushing', rusher, `${rusher.rushAtt} car, ${rusher.rushYds} yds, ${rusher.rushTD ?? 0} TD`) : null}
      {receiver?.rec ? row('Receiving', receiver, `${receiver.rec} rec, ${receiver.recYds} yds, ${receiver.recTD ?? 0} TD`) : null}
      {defender ? row('Defense', defender, `${defender.tackles ?? 0} tkl, ${defender.sacks ?? 0} sck, ${defender.defInt ?? 0} INT`) : null}
    </div>
  );
}

/** A dynasty game: result is recorded into the season when it ends. */
export function DynastyGame({ gameId }: { gameId: string }) {
  const { dynasty: d, settings } = useStore();
  const game = d?.schedule.find((g) => g.id === gameId);
  const engine = useMemo(() => (d && game && !game.played ? new GameSimulation(buildGameSetup(d, game, { promptFourthDown: settings.fourthDownPrompts })) : null), [d, game]); // eslint-disable-line react-hooks/exhaustive-deps
  const [recorded, setRecorded] = useState(false);
  if (!d || !game) return <div className="page">Game not found.</div>;
  if (!engine) {
    return (
      <div className="page">
        <p>This game has already been played.</p>
        <button className="btn" onClick={() => navigate({ name: 'hub', tab: 'schedule' })}>
          Back to Schedule
        </button>
      </div>
    );
  }
  const record = (result: GameResult) => {
    if (game.played) return;
    applyGameResult(d, game, result);
    completeWeek(d); // the rest of the week's games are simulated, rankings & news update
    bump();
    autosave();
    setRecorded(true);
  };
  const exit = () => {
    if (engine.isFinal) return navigate({ name: 'hub', tab: 'home' });
    if (!confirm('Leave the stadium? The rest of the game will be simulated instantly.')) return;
    engine.simulateToEnd();
    record(engine.result());
    navigate({ name: 'hub', tab: 'home' });
  };
  const side = userSideOf(d, game);
  return (
    <GameView
      engine={engine}
      players={d.players}
      userSide={side}
      onSettingsChange={(s) => {
        d.coachingSettings = s;
      }}
      onGameOver={record}
      onExit={exit}
      exitLabel="Sim & Exit"
      headerNote={`Week ${game.week}${game.homeRank || game.awayRank ? '' : ''}`}
      finalActions={
        <button className="btn primary" disabled={!recorded && !game.played} onClick={() => navigate({ name: 'hub', tab: 'home' })}>
          Return to Dynasty →
        </button>
      }
    />
  );
}

/** Exhibition from the main menu. Same teams + seed always replay the same game. */
export function QuickGame({ homeId, awayId, seed }: { homeId: string; awayId: string; seed: number }) {
  const engine = useMemo(() => {
    const world = buildExhibition(homeId, awayId, seed);
    return { engine: new GameSimulation(gameSetupFor(world, homeId, awayId, { seed, promptFourthDown: true })), players: world.players };
  }, [homeId, awayId, seed]);
  return (
    <GameView
      engine={engine.engine}
      players={engine.players}
      allowPickSide
      onGameOver={() => {}}
      onExit={() => navigate({ name: 'quickSim' })}
      exitLabel="Exit"
      headerNote={`Seed ${seed}`}
      finalActions={
        <>
          <button className="btn" onClick={() => navigate({ name: 'quickGame', homeId, awayId, seed: seed + 1 })}>
            Rematch (new seed)
          </button>
          <button className="btn primary" onClick={() => navigate({ name: 'quickSim' })}>
            Back to Quick Sim
          </button>
        </>
      }
    />
  );
}


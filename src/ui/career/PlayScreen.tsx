/**
 * The playable 3D game screen: canvas + HUD overlays. All game logic lives in GameController; this
 * component only renders the snapshot and forwards button clicks.
 */
import { useEffect, useRef, useState } from 'react';
import { navigate } from '../../app/store';
import { loadPlayer } from '../../career/player';
import { GameController, fmtClock, type Snapshot } from '../../play/controller';
import { BUTTON_ORDER, FORMATIONS, PLAYS, routePreview, type PlayDef } from '../../play/engine/playbook';
import { ICON_COLORS } from '../../play/render/scene';
import { DIFFICULTY_NAMES, loadPlaySettings } from '../../play/settings';

export function PlayScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctrl = useRef<GameController | null>(null);
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [player] = useState(loadPlayer);
  const [settings] = useState(loadPlaySettings);

  useEffect(() => {
    if (!player || !player.firstName) {
      navigate({ name: 'createPlayer', step: 0 });
      return;
    }
    const canvas = canvasRef.current!;
    let c: GameController;
    try {
      c = new GameController(canvas, player, settings);
    } catch (e) {
      setError(`Could not start the 3D game: ${(e as Error).message}. Your browser needs WebGL.`);
      return;
    }
    ctrl.current = c;
    (window as unknown as { __game?: GameController }).__game = c; // for automated playtests
    const resize = () => c.renderer.resize(canvas.clientWidth, canvas.clientHeight);
    resize();
    window.addEventListener('resize', resize);
    const unsub = c.subscribe(setSnap);
    c.start();
    return () => {
      unsub();
      window.removeEventListener('resize', resize);
      c.dispose();
      ctrl.current = null;
      delete (window as unknown as { __game?: GameController }).__game;
    };
  }, [player, settings]);

  // Keyboard shortcuts for the menus (play call, result, 4th down, drive over, controls).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const c = ctrl.current;
      if (!c) return;
      if (e.code === 'F1' || e.code === 'Slash') {
        e.preventDefault();
        setShowControls((v) => !v);
      }
      if (c.stage === 'call' && !c.paused) {
        const idx = e.code.startsWith('Digit') ? (Number(e.code.slice(5)) + 9) % 10 : -1;
        if (idx >= 0 && idx < PLAYS.length) c.callPlay(PLAYS[idx].id);
        if (e.code === 'Enter') c.callPlay(c.snapshot().suggested);
      } else if (c.stage === 'result' && e.code === 'Enter') c.advance();
      else if (c.stage === 'over' && e.code === 'Enter') c.newDrive();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const c = ctrl.current;
  const s = snap;

  return (
    <div className="play-screen">
      <canvas ref={canvasRef} className="play-canvas" />
      {error && (
        <div className="overlay center-card">
          <h2>3D unavailable</h2>
          <p>{error}</p>
          <button className="btn primary" onClick={() => navigate({ name: 'career' })}>
            Back
          </button>
        </div>
      )}
      {s && c && (
        <>
          <Scorebug s={s} />
          <div className="hud-top-right">
            <button className="btn small" onClick={() => c.cycleCamera()} title="Tab">
              🎥 {s.camera}
            </button>
            <button className="btn small" onClick={() => c.toggleRoutes()} title="V">
              Routes: {s.showRoutes ? 'On' : 'Off'}
            </button>
            <button className="btn small" onClick={() => setShowControls((v) => !v)} title="F1">
              Controls
            </button>
            <button className="btn small" onClick={() => c.setPaused(!s.paused)} title="Esc">
              {s.paused ? 'Resume' : 'Pause'}
            </button>
          </div>
          <div className="banners">
            {s.banners.map((b) => (
              <div key={b.id} className={`banner ${b.kind}`}>
                {b.text}
              </div>
            ))}
          </div>

          {(s.stage === 'presnap' || s.stage === 'live') && <PlayerHud s={s} />}

          {s.stage === 'presnap' && !s.paused && (
            <div className="presnap-hint">
              <div className="play-tag">
                {s.playName} <span className="muted">· Play clock</span> <b className={s.playClock < 6 ? 'bad' : ''}>{Math.ceil(s.playClock)}</b>
              </div>
              <div>
                <kbd>Space</kbd> snap · then hold <kbd>1</kbd>–<kbd>5</kbd> to throw (release to let it go) · <kbd>Q</kbd> lob
              </div>
              <button className="btn primary" onClick={() => c.snap()}>
                Snap
              </button>
            </div>
          )}

          {s.stage === 'call' && <PlayCall s={s} onPick={(id) => c.callPlay(id)} onQuit={() => navigate({ name: 'career' })} />}

          {s.stage === 'result' && s.result && (
            <div className="overlay result-card">
              <div className={`result-head ${s.result.touchdown ? 'big' : s.result.firstDown ? 'good' : ''}`}>{s.result.headline}</div>
              <div className="muted">{s.result.detail}</div>
              <div className="row" style={{ justifyContent: 'center', gap: 18 }}>
                <span>
                  Play: <b>{s.playName}</b>
                </span>
                {s.defName && (
                  <span>
                    Defense: <b>{s.defName}</b>
                  </span>
                )}
              </div>
              <div className="next-down">{s.stage === 'result' && !s.result.driveOver ? `Next: ${s.downLabel} at ${s.spotLabel}` : 'Drive over'}</div>
              <button className="btn primary" onClick={() => c.advance()}>
                Continue <kbd>Space</kbd>
              </button>
            </div>
          )}

          {s.stage === 'fourth' && (
            <div className="overlay result-card">
              <div className="result-head">4th Down</div>
              <div className="muted">
                {s.downLabel} at {s.spotLabel}
              </div>
              <div className="row" style={{ justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <button className="btn primary" onClick={() => c.fourthDown('go')}>
                  Go For It
                </button>
                <button className="btn" onClick={() => c.fourthDown('fg')} disabled={s.fgDistance > 62}>
                  Field Goal ({s.fgDistance} yds · {Math.round(s.fgChance * 100)}%)
                </button>
                <button className="btn" onClick={() => c.fourthDown('punt')}>
                  Punt
                </button>
              </div>
              <div className="muted tiny">Kicks are resolved by the kicker in Milestone 1.</div>
            </div>
          )}

          {s.stage === 'over' && <DriveOver s={s} c={c} />}

          {s.paused && (
            <div className="overlay result-card">
              <div className="result-head">Paused</div>
              <div className="muted">
                Difficulty: {DIFFICULTY_NAMES[settings.difficulty]} · {settings.quarterMinutes}-minute quarters
              </div>
              <div className="col" style={{ alignItems: 'stretch' }}>
                <button className="btn primary" onClick={() => c.setPaused(false)}>
                  Resume
                </button>
                <button className="btn" onClick={() => setShowControls(true)}>
                  Controls
                </button>
                <button className="btn" onClick={() => c.cycleCamera()}>
                  Camera: {s.camera}
                </button>
                <button className="btn" onClick={() => navigate({ name: 'career' })}>
                  Quit to Career Menu
                </button>
              </div>
            </div>
          )}
          {showControls && <ControlsHelp onClose={() => setShowControls(false)} gamepad={s.gamepad} />}
        </>
      )}
    </div>
  );
}

function Scorebug({ s }: { s: Snapshot }) {
  return (
    <div className="scorebug">
      <div className="sb-team osu">
        <span className="sb-name">OSU</span>
        <span className="sb-score">{s.score.us}</span>
      </div>
      <div className="sb-team mich">
        <span className="sb-name">MICH</span>
        <span className="sb-score">{s.score.them}</span>
      </div>
      <div className="sb-clock">
        <span>Q{s.quarter}</span>
        <b>{fmtClock(s.clock)}</b>
      </div>
      <div className="sb-down">
        <b>{s.downLabel}</b>
        <span>{s.spotLabel}</span>
      </div>
      {s.stage === 'presnap' && <div className="sb-play">:{String(Math.ceil(s.playClock)).padStart(2, '0')}</div>}
    </div>
  );
}

function PlayerHud({ s }: { s: Snapshot }) {
  const ch = s.charging;
  const label = ch ? (s.lobHeld ? 'LOB' : ch.power < 0.35 ? 'TOUCH' : ch.power < 0.75 ? 'FIRM' : 'BULLET') : '';
  return (
    <div className="player-hud">
      <div className="ph-name">{s.controlledLabel}</div>
      <div className="meter stamina" title="Stamina">
        <i style={{ width: `${s.stamina}%` }} />
        <span>STAMINA</span>
      </div>
      {s.controlledIsQB && (
        <div className={`meter throw ${ch ? 'on' : ''}`} title="Throw power">
          <i style={{ width: `${(ch?.power ?? 0) * 100}%`, background: ch ? ICON_COLORS[ch.slot] : undefined }} />
          <span>{ch ? `${label} → ${BUTTON_ORDER.indexOf(ch.slot) + 1}` : 'HOLD 1–5 TO THROW'}</span>
        </div>
      )}
      {!s.controlledIsQB && s.stage === 'live' && (
        <div className="moves-hint">
          <kbd>J</kbd>/<kbd>L</kbd> juke <kbd>K</kbd> spin <kbd>I</kbd> stiff arm <kbd>H</kbd> hurdle <kbd>F</kbd> dive
        </div>
      )}
    </div>
  );
}

function PlayArt({ play }: { play: PlayDef }) {
  const los = 10;
  const mid = 26.665;
  const pts = routePreview(play, los, mid);
  // field window: x from 2 to 32 yards (vertical in the diagram), y 0..53.33 (horizontal)
  const W = 160;
  const H = 110;
  const sx = (y: number) => (y / 53.33) * W;
  const sy = (x: number) => H - ((x - 3) / 28) * H;
  const f = FORMATIONS[play.formation];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="play-art" aria-hidden>
      <line x1={0} x2={W} y1={sy(los)} y2={sy(los)} stroke="#4a8cff" strokeWidth={1} opacity={0.7} />
      {[-2.6, -1.3, 0, 1.3, 2.6].map((d) => (
        <rect key={d} x={sx(mid + d) - 2.2} y={sy(los - 0.7) - 2.2} width={4.4} height={4.4} fill="#ccd" />
      ))}
      <circle cx={sx(mid)} cy={sy(f.shotgun ? los - 5 : los - 1.3)} r={2.6} fill="#ffcc33" />
      {pts.map((r) => {
        const path = [r.start, ...r.pts].map((p) => ({ x: Math.min(30, p.x), y: p.y }));
        const d = path.map((p, i) => `${i ? 'L' : 'M'}${sx(p.y).toFixed(1)},${sy(p.x).toFixed(1)}`).join(' ');
        return (
          <g key={r.slot}>
            {!r.block && <path d={d} fill="none" stroke={ICON_COLORS[r.slot]} strokeWidth={1.8} markerEnd="url(#arrow)" />}
            <circle cx={sx(r.start.y)} cy={sy(r.start.x)} r={3.2} fill={ICON_COLORS[r.slot]} />
            <text x={sx(r.start.y)} y={sy(r.start.x) + 2.2} fontSize={5} textAnchor="middle" fill="#fff" fontWeight={700}>
              {BUTTON_ORDER.indexOf(r.slot) + 1}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function PlayCall({ s, onPick, onQuit }: { s: Snapshot; onPick: (id: string) => void; onQuit: () => void }) {
  return (
    <div className="overlay playcall">
      <div className="pc-head">
        <div>
          <h2>Play Call</h2>
          <div className="muted">
            {s.downLabel} at {s.spotLabel} · Q{s.quarter} {fmtClock(s.clock)}
          </div>
        </div>
        <div className="spacer" />
        <button className="btn primary" onClick={() => onPick(s.suggested)}>
          ★ Coach's Call: {PLAYS.find((p) => p.id === s.suggested)?.name} <kbd>Enter</kbd>
        </button>
        <button className="btn ghost" onClick={onQuit}>
          Quit
        </button>
      </div>
      <div className="pc-grid">
        {PLAYS.map((p, i) => (
          <button key={p.id} className={`pc-card ${p.id === s.suggested ? 'suggested' : ''}`} onClick={() => onPick(p.id)}>
            <div className="pc-top">
              <kbd>{(i + 1) % 10}</kbd>
              <b>{p.name}</b>
              {p.id === s.suggested && <span className="accent">★</span>}
            </div>
            <PlayArt play={p} />
            <div className="muted tiny">
              {FORMATIONS[p.formation].name} · {p.depth}
              {p.playAction ? ' · play action' : ''}
            </div>
          </button>
        ))}
      </div>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />
          </marker>
        </defs>
      </svg>
    </div>
  );
}

function DriveOver({ s, c }: { s: Snapshot; c: GameController }) {
  const st = s.stats;
  return (
    <div className="overlay result-card wide">
      <div className="result-head">Drive Over — {s.overReason}</div>
      <div className="row" style={{ justifyContent: 'center', gap: 24 }}>
        <div className="big-score">
          OSU {s.score.us} <span className="muted">—</span> MICH {s.score.them}
        </div>
      </div>
      <div className="stat-line">
        <div>
          <b>
            {st.comp}/{st.att}
          </b>
          <span>Comp/Att</span>
        </div>
        <div>
          <b>{st.passYds}</b>
          <span>Pass Yds</span>
        </div>
        <div>
          <b>{st.passTD}</b>
          <span>Pass TD</span>
        </div>
        <div>
          <b>{st.int}</b>
          <span>INT</span>
        </div>
        <div>
          <b>{st.rushYds}</b>
          <span>Rush Yds</span>
        </div>
        <div>
          <b>{st.sacks}</b>
          <span>Sacked</span>
        </div>
        <div>
          <b>{st.longest}</b>
          <span>Long</span>
        </div>
      </div>
      <div className="drive-log">
        {s.log.slice(-10).map((l, i) => (
          <div key={i}>{l}</div>
        ))}
      </div>
      <div className="row" style={{ justifyContent: 'center', gap: 10 }}>
        <button className="btn primary" onClick={() => c.newDrive()}>
          Next Drive (from the 25) <kbd>Enter</kbd>
        </button>
        <button className="btn" onClick={() => c.newDrive(true)}>
          Restart Game
        </button>
        <button className="btn" onClick={() => navigate({ name: 'createPlayer', step: 5 })}>
          Change Gear
        </button>
        <button className="btn ghost" onClick={() => navigate({ name: 'career' })}>
          Career Menu
        </button>
      </div>
    </div>
  );
}

function ControlsHelp({ onClose, gamepad }: { onClose: () => void; gamepad: boolean }) {
  const rows: [string, string, string][] = [
    ['Move', 'W A S D / Arrows', 'Left stick / D-pad'],
    ['Sprint', 'Shift', 'RT'],
    ['Snap', 'Space', 'A (pre-snap)'],
    ['Throw to receiver 1–5', 'Hold 1–5, release to throw', 'A B X Y RB (hold, release)'],
    ['Touch vs bullet', 'Tap = touch · hold = bullet', 'Same'],
    ['Lob', 'Hold Q while releasing', 'Hold LB'],
    ['Throw it away', 'T', '—'],
    ['Juke left / right', 'J / L', 'Right stick ← / →'],
    ['Spin', 'K', 'Right stick ↓'],
    ['Stiff arm', 'I', 'Right stick ↑'],
    ['Hurdle', 'H', 'R3'],
    ['Dive', 'F', 'LT'],
    ['QB slide', 'G', 'L3'],
    ['Camera', 'Tab · mouse wheel zoom · [ ] height · + / −', 'Back'],
    ['Route art', 'V', '—'],
    ['Pause', 'Esc / P', 'Start'],
    ['Pick play', '1–0 · Enter = coach’s call', 'Click'],
  ];
  return (
    <div className="overlay controls" onClick={onClose}>
      <div className="panel" onClick={(e) => e.stopPropagation()}>
        <div className="row">
          <h2>Controls</h2>
          <div className="spacer" />
          <span className="muted tiny">{gamepad ? '🎮 Gamepad connected' : 'Connect a gamepad any time'}</span>
          <button className="btn small" onClick={onClose}>
            Close
          </button>
        </div>
        <table className="controls-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Keyboard</th>
              <th>Gamepad</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r[0]}>
                <td>{r[0]}</td>
                <td>{r[1]}</td>
                <td>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="muted tiny">After a catch you control the receiver. Receiver icons turn green when open (read assist).</div>
      </div>
    </div>
  );
}

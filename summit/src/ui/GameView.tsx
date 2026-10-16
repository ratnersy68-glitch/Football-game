import { Fragment, useEffect, useRef, useState } from 'react';
import type { AppApi, Launch } from './App';
import { Game, type GameResult, type HudState } from '../game/Game';
import { HUD } from './hud/HUD';
import { TrailMap } from './hud/TrailMap';
import { applyResult, applySession, type RewardSummary } from '../state/progress';
import { STAGES, MEDAL_COLOR, TOURNAMENTS } from '../data/career';
import { RESORTS } from '../data/resorts';
import { formatTime } from '../core/math';
import { ACTION_LABEL, DEFAULT_BINDINGS, keyLabel, type Action } from '../game/input';
import { CAM_LABEL, CAM_MODES } from '../game/camera';

const TIPS = [
  'Hold Shift while turning to carve clean arcs that keep your speed.',
  'Hold Space to load your pop, release at the lip for bigger air.',
  'Hold a tilt arrow while spinning to throw a cork. Double corks need big air!',
  'Grab longer for more points — and let go before you land.',
  'Land tricks within 2.6 seconds of each other to stack the combo multiplier.',
  'Powder slows you down; groomed corduroy is fastest; ice has little grip.',
  'Press M for the trail map. Click a trail and “Ski this trail” to go straight there.',
  'Ride a lift once to unlock fast travel to its top station.',
  'Racing: missed gates add a time penalty. Brake (S) before tight gates.',
  'Press V for an instant replay of your last 20 seconds — save the best ones!',
];

export function GameView({ api, launch }: { api: AppApi; launch: Launch }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const [loading, setLoading] = useState<{ stage: string; f: number } | null>({ stage: 'Starting', f: 0 });
  const [error, setError] = useState<string | null>(null);
  const [hud, setHud] = useState<HudState | null>(null);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [scoreOpen, setScoreOpen] = useState(false);
  const [replayOpen, setReplayOpen] = useState(false);
  const [result, setResult] = useState<{ r: GameResult; reward: RewardSummary } | null>(null);
  const [, force] = useState(0);
  const settled = useRef(false);
  const tip = useRef(TIPS[Math.floor(Math.random() * TIPS.length)]);
  const p = api.profile;

  useEffect(() => {
    const g = new Game(canvasRef.current!, {
      resortIndex: launch.resortIndex, mode: JSON.parse(JSON.stringify(launch.mode)), profile: p, quality: p.settings.quality,
      weather: launch.weather ?? 'clear', hour: launch.hour ?? 11, dynamicWeather: p.settings.dynamicWeather && launch.mode.kind === 'freeride',
      startTrail: launch.startTrail,
    }, {
      onHud: (h) => setHud(h),
      onEnd: (r) => {
        const s = g.sessionSummary();
        let reward: RewardSummary = { coins: 0, xp: 0, messages: [], stageUp: null };
        api.update((pp) => {
          const a = applySession(pp, RESORTS[launch.resortIndex].id, s, STAGES);
          const b = applyResult(pp, RESORTS[launch.resortIndex].id, r, STAGES);
          reward = { coins: a.coins + b.coins, xp: a.xp + b.xp, messages: [...a.messages, ...b.messages], stageUp: b.stageUp ?? a.stageUp };
        });
        settled.current = true;
        setTimeout(() => setResult({ r, reward }), 0);
        g.setPaused(true);
      },
      onPause: (b) => setPaused(b),
      onMap: (b) => setMapOpen(b),
      onScoreboard: (b) => setScoreOpen(b),
      onReplay: (b) => setReplayOpen(b),
      onStats: () => {},
    });
    gameRef.current = g;
    const onResize = () => g.resize();
    window.addEventListener('resize', onResize);
    const unlockAudio = () => g.audio.start();
    window.addEventListener('keydown', unlockAudio, { once: true });
    window.addEventListener('pointerdown', unlockAudio, { once: true });
    g.load((stage, f) => setLoading({ stage, f })).then(() => {
      if (g.disposed) return;
      setLoading(null);
      g.start();
      g.audio.start();
      if (launch.replay) g.openReplay(0, launch.replay);
    }).catch((e) => { console.error(e); setError(String(e?.message ?? e)); });
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('keydown', unlockAudio);
      window.removeEventListener('pointerdown', unlockAudio);
      g.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refresh replay UI ~10x/s
  useEffect(() => {
    if (!replayOpen) return;
    const t = setInterval(() => force((n) => n + 1), 100);
    return () => clearInterval(t);
  }, [replayOpen]);
  // Tab-held scoreboard closes on release
  useEffect(() => {
    if (!scoreOpen) return;
    const up = (e: KeyboardEvent) => { if (e.code === 'Tab') setScoreOpen(false); };
    window.addEventListener('keyup', up);
    return () => window.removeEventListener('keyup', up);
  }, [scoreOpen]);
  // M closes the map
  useEffect(() => {
    if (!mapOpen) return;
    const k = (e: KeyboardEvent) => { if (e.code === 'KeyM' || e.code === 'Escape') closeMap(); };
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  });

  const g = gameRef.current;
  const closeMap = () => { setMapOpen(false); g?.input.consume(); g?.setPaused(false); };
  const exit = () => {
    if (g && !settled.current && g.resort) {
      const s = g.sessionSummary();
      api.update((pp) => { applySession(pp, RESORTS[launch.resortIndex].id, s, STAGES); });
      settled.current = true;
    }
    if (result?.r.tournament) { api.go('racing'); return; }
    api.go(launch.back);
  };
  const retry = () => api.launch({ ...launch, replay: undefined, nonce: Math.random() });
  const nextTournamentRace = () => {
    const t = result?.r.tournament;
    if (!t) return;
    const tour = TOURNAMENTS.find((x) => x.id === t.id)!;
    const idx = t.index + 1;
    if (idx >= tour.races.length) { api.go('racing'); return; }
    const race = tour.races[idx];
    const r = RESORTS.find((x) => x.id === race.resortId)!;
    api.launch({ resortIndex: r.index, mode: { kind: 'race', course: race.course, level: tour.level, title: `${tour.name} — Race ${idx + 1}/${tour.races.length}`, tournament: { id: tour.id, index: idx } }, back: 'racing', weather: 'clear', hour: 11 });
  };

  const rep = g?.replayInfo();
  return (
    <div className="game-root">
      <canvas ref={canvasRef} className="gl" data-testid="game-canvas" />
      {loading && (
        <div className="loading bg-mountains screen">
          <h1 className="logo" style={{ fontSize: 48, position: 'relative', zIndex: 2 }}>{RESORTS[launch.resortIndex].name}</h1>
          <div style={{ position: 'relative', zIndex: 2 }} className="col">
            <div className="bar"><div style={{ width: `${Math.round(loading.f * 100)}%` }} /></div>
            <div className="muted" data-testid="loading-stage">{loading.stage}…</div>
          </div>
          <div className="tip" style={{ position: 'relative', zIndex: 2 }}>💡 {tip.current}</div>
          {error && <div className="panel card" style={{ position: 'relative', zIndex: 2, color: 'var(--bad)' }}>Failed to load: {error} <button className="btn small" onClick={() => api.go(launch.back)}>Back</button></div>}
        </div>
      )}
      {hud && !loading && !replayOpen && !result && <HUD h={hud} units={p.settings.units} showFps={p.settings.showFps} mapCanvas={g?.mapCanvas ?? null} view={g?.mapView ?? null} onPause={() => g?.setPaused(true)} />}
      {mapOpen && g && <TrailMap game={g} onClose={closeMap} />}
      {scoreOpen && g && hud && <Scoreboard game={g} hud={hud} />}
      {paused && !mapOpen && !result && g && (
        <div className="overlay">
          <div className="panel modal">
            <h2>Paused</h2>
            <div className="grid" style={{ gridTemplateColumns: 'minmax(260px, 320px) 1fr', gap: 22 }}>
              <div className="pause-list">
                <button className="btn primary" onClick={() => g.setPaused(false)} data-testid="resume">Resume</button>
                {launch.mode.kind === 'freeride' && <button className="btn" onClick={() => { setMapOpen(true); }}>Trail map</button>}
                <button className="btn" onClick={() => { g.setPaused(false); g.openReplay(20); }}>Instant replay (last 20 s)</button>
                <button className="btn" onClick={() => { const i = CAM_MODES.indexOf(g.cam.mode); g.cam.mode = CAM_MODES[(i + 1) % CAM_MODES.length]; g.cam.snap(); force((n) => n + 1); }}>Camera: {CAM_LABEL[g.cam.mode]}</button>
                {launch.mode.kind !== 'freeride' && <button className="btn" onClick={retry}>Restart</button>}
                {(launch.mode.kind === 'park' || launch.mode.kind === 'challenge') && <button className="btn" onClick={() => g.endEarly()}>End &amp; score now</button>}
                {launch.mode.kind === 'race' && <button className="btn" onClick={() => g.forfeitRace()}>Abandon race (DNF)</button>}
                <button className="btn warn" onClick={exit} data-testid="quit">Quit to menu</button>
              </div>
              <div className="col">
                <div className="small muted">Controls</div>
                <div className="controls-help">
                  {(Object.keys(DEFAULT_BINDINGS) as Action[]).map((a) => (
                    <Fragment key={a}><span><span className="keycap">{(p.settings.bindings[a] ?? DEFAULT_BINDINGS[a]).map(keyLabel).join('/')}</span></span><span className="small">{ACTION_LABEL[a]}</span></Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {replayOpen && g && rep && (
        <>
          <div className="replay-tag chip">● REPLAY {rep.recent.length ? `— ${rep.recent[rep.recent.length - 1]}` : ''}</div>
          <div className="replay-bar panel">
            <button className="btn small" onClick={() => g.replayToggle()}>{rep.playing ? '❚❚' : '▶'}</button>
            <button className="btn small" onClick={() => g.replayRestart()}>⟲</button>
            <input type="range" min={0} max={1000} value={Math.round((rep.t / Math.max(0.01, rep.len)) * 1000)} onChange={(e) => g.replaySeek(Number(e.target.value) / 1000)} />
            <span className="small" style={{ width: 90 }}>{formatTime(rep.t)} / {formatTime(rep.len)}</span>
            {[0.25, 0.5, 1].map((s) => <button key={s} className={`btn small ${rep.speed === s ? 'selected' : ''}`} onClick={() => g.replaySpeed(s)}>{s}×</button>)}
            <button className="btn small" onClick={() => g.cycleReplayCam()}>📷 {rep.cam}</button>
            <button className="btn small" onClick={async () => { await g.replaySave(`${RESORTS[launch.resortIndex].name} run`); g.showToast('Replay saved'); force((n) => n + 1); }}>💾 Save</button>
            <button className="btn small primary" onClick={() => { if (launch.replay) api.go(launch.back); else g.closeReplay(); }}>{launch.replay ? 'Exit' : 'Back to game'}</button>
          </div>
        </>
      )}
      {result && g && (
        <div className="overlay">
          <div className="panel modal col" style={{ minWidth: 520 }} data-testid="results">
            <div className="row">
              <div className="results-medal" style={{ color: result.r.medal ? MEDAL_COLOR[result.r.medal] : '#9fb2c8' }}>{result.r.medal ? '●' : '○'}</div>
              <div className="col" style={{ gap: 2 }}>
                <h2 style={{ margin: 0 }}>{result.r.title}</h2>
                <div style={{ fontSize: 30, fontWeight: 800 }}>{result.r.valueLabel}</div>
                <div className="muted">{result.r.medal ? `${result.r.medal.toUpperCase()} MEDAL` : 'No medal this time'}</div>
              </div>
            </div>
            {result.r.lines.map((l) => <div key={l}>{l}</div>)}
            {result.r.race && (
              <table className="res">
                <thead><tr><th>#</th><th>Racer</th><th>Time</th><th>Missed</th></tr></thead>
                <tbody>{result.r.race.map((r) => <tr key={r.bib} className={r.isPlayer ? 'you' : ''}><td>{r.rank || '—'}</td><td>{r.name} <span className="muted small">{r.country}</span></td><td>{r.time !== null ? formatTime(r.time) : 'DNF'}</td><td>{r.missed}</td></tr>)}</tbody>
              </table>
            )}
            <div className="row wrap"><span className="chip coins">+{result.reward.coins.toLocaleString()}</span><span className="chip">+{result.reward.xp.toLocaleString()} XP</span>{result.reward.stageUp && <span className="chip">⬆ Career stage: {result.reward.stageUp}</span>}</div>
            {result.reward.messages.map((m) => <div key={m} className="small">🎉 {m}</div>)}
            <div className="row wrap">
              {result.r.tournament && TOURNAMENTS.find((t) => t.id === result.r.tournament!.id)!.races.length > result.r.tournament.index + 1
                ? <button className="btn primary" onClick={nextTournamentRace}>Next race →</button>
                : <button className="btn primary" onClick={exit} data-testid="continue">Continue</button>}
              {!result.r.tournament && <button className="btn" onClick={retry}>Retry</button>}
              <button className="btn" onClick={() => { setResult(null); g.setPaused(false); g.ended = true; g.openReplay(result.r.kind === 'race' ? Math.min(140, (result.r.value || 60) + 4) : 40); }}>Watch replay</button>
            </div>
          </div>
        </div>
      )}
      {replayOpen === false && result === null && g?.ended && !paused && !loading && (
        <div className="overlay"><div className="panel modal col"><h2>Run complete</h2><button className="btn primary" onClick={exit}>Continue</button></div></div>
      )}
    </div>
  );
}

function Scoreboard({ game, hud }: { game: Game; hud: HudState }) {
  const s = game.sessionSummary();
  const R = game.resort;
  const total = R.trails.filter((t) => t.kind === 'trail').length;
  return (
    <div className="overlay" style={{ pointerEvents: 'none' }}>
      <div className="panel modal col" style={{ minWidth: 460 }}>
        <h2>{R.def.name} — session</h2>
        <div>{hud.objective}</div>
        <div className="grid cols-2" style={{ gap: 6 }}>
          <div>Trick score: <strong>{Math.round(s.trickTotal).toLocaleString()}</strong></div>
          <div>Best trick: {s.bestTrick ? `${s.bestTrick.name} (${s.bestTrick.score.toLocaleString()})` : '—'}</div>
          <div>Best combo: {s.bestCombo.toLocaleString()}</div>
          <div>Top speed: {Math.round(s.topSpeed * 3.6)} km/h</div>
          <div>Longest air: {s.maxAir.toFixed(2)} s</div>
          <div>Distance: {(s.distance / 1000).toFixed(2)} km</div>
          <div>Trails skied: {s.trailsDone.length}/{total}</div>
          <div>Lifts ridden: {s.ridden.length}/{R.lifts.length}</div>
          <div>Crashes: {s.crashes}</div>
        </div>
        {game.race && (
          <table className="res"><tbody>{game.race.standings().map((r, i) => <tr key={r.id} className={r.isPlayer ? 'you' : ''}><td>{i + 1}</td><td>{r.name}</td><td>Gate {Math.min(r.next, game.race!.course.gates.length)}</td><td>{r.finish !== null ? formatTime(game.race!.totalTime(r) ?? r.finish) : ''}</td></tr>)}</tbody></table>
        )}
      </div>
    </div>
  );
}

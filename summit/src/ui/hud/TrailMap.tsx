import { useEffect, useMemo, useRef, useState } from 'react';
import type { Game } from '../../game/Game';
import { drawRelief, drawTrails, fromMap, mapView, toMap } from '../../render/mapRender';
import { DIFFICULTY_INFO, type Trail } from '../../world/types';
import { DiffIcon } from '../components/common';
import { formatTime } from '../../core/math';

export function TrailMap({ game, onClose }: { game: Game; onClose: () => void }) {
  const R = game.resort;
  const ref = useRef<HTMLCanvasElement>(null);
  const [sel, setSel] = useState<Trail | null>(null);
  const [hover, setHover] = useState<Trail | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const size = 1000;
  const view = useMemo(() => mapView(R, size, size), [R]);
  const base = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const x = c.getContext('2d')!;
    x.fillStyle = '#dfe9f3'; x.fillRect(0, 0, size, size);
    drawRelief(x, R, view);
    return c;
  }, [R, view]);
  useEffect(() => {
    const c = ref.current!;
    const x = c.getContext('2d')!;
    x.drawImage(base, 0, 0);
    drawTrails(x, R, view, { highlight: (hover ?? sel)?.id, labels: true, thick: 1.1 });
    // parks + race labels
    const p = toMap(view, game.player.pos.x, game.player.pos.z);
    x.fillStyle = '#ff3b30'; x.strokeStyle = '#fff'; x.lineWidth = 3;
    x.beginPath(); x.arc(p.x, p.y, 8, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = '#111'; x.font = 'bold 13px sans-serif'; x.fillText('YOU', p.x + 11, p.y + 4);
  }, [base, R, view, hover, sel, game]);
  const pick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * size, py = ((e.clientY - r.top) / r.height) * size;
    const w = fromMap(view, px, py);
    let best: Trail | null = null, bd = 30 / view.scale;
    for (const t of R.trails) for (let i = 0; i < t.pts.length; i += 2) {
      const d = Math.hypot(t.pts[i].x - w.x, t.pts[i].z - w.z);
      if (d < bd) { bd = d; best = t; }
    }
    return best;
  };
  const list = R.trails.filter((t) => filter === 'all' || (filter === 'park' ? t.kind === 'park' || t.kind === 'pipe' : filter === 'race' ? t.kind === 'race' : t.kind === 'trail' && t.difficulty === filter));
  const show = hover ?? sel;
  const done = game.trailsDone;
  return (
    <div className="overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="map-layout">
        <canvas ref={ref} width={size} height={size} onMouseMove={(e) => setHover(pick(e))} onMouseLeave={() => setHover(null)} onClick={(e) => setSel(pick(e))} data-testid="trail-map" />
        <div className="map-side panel card">
          <div className="row"><h2 style={{ margin: 0, flex: 1 }}>{R.def.name}</h2><button className="btn small" onClick={onClose}>Close (M)</button></div>
          {show ? (
            <div className="col">
              <div className="row"><DiffIcon d={show.kind === 'trail' ? show.difficulty : show.kind} size={18} /><strong>{show.name}</strong></div>
              <div className="small muted">{show.kind === 'trail' ? DIFFICULTY_INFO[show.difficulty].label : show.kind === 'race' ? 'Racecourse' : 'Terrain park'} · {show.landmark}</div>
              <div className="small">Length {Math.round(show.length)} m · Vertical {Math.round(show.vertical)} m · Width {Math.round(show.width)} m</div>
              <div className="small">Average {(Math.atan(show.avgGrade) * 57.3).toFixed(0)}° · Steepest pitch {(Math.atan(show.maxPitch) * 57.3).toFixed(0)}°</div>
              <div className="small">{[show.groomed && 'Groomed', show.moguls && 'Moguls', show.glade && 'Tree glades', show.chute && 'Narrow chute', show.cliffs.length && `${show.cliffs.length} cliff drops`, show.icy > 0.3 && 'Icy sections', !show.groomed && !show.moguls && 'Ungroomed / powder'].filter(Boolean).join(' · ')}</div>
              {done.has(show.id) && <div className="small">✅ Skied{game.challengeTimes[show.id] ? ` — best ${formatTime(game.challengeTimes[show.id])}` : ''}</div>}
              {sel && <button className="btn primary" onClick={() => { game.skiTrail(sel.id); onClose(); }} data-testid="ski-trail">Ski this trail</button>}
            </div>
          ) : <div className="small muted">Hover or click a trail for details. Pick one and “Ski this trail” to start at its top.</div>}
          <div className="row wrap">
            {['all', 'green', 'blue', 'black', 'double', 'triple', 'park', 'race'].map((f) => <button key={f} className={`btn small ${filter === f ? 'selected' : ''}`} onClick={() => setFilter(f)}>{f}</button>)}
          </div>
          <div className="trail-list col" style={{ gap: 2 }}>
            {list.map((t) => (
              <button key={t.id} className={`btn ${sel?.id === t.id ? 'selected' : ''}`} onMouseEnter={() => setHover(t)} onMouseLeave={() => setHover(null)} onClick={() => setSel(t)}>
                <DiffIcon d={t.kind === 'trail' ? t.difficulty : t.kind} size={12} /> <span style={{ flex: 1 }}>{t.name}</span>{done.has(t.id) && '✅'}
              </button>
            ))}
          </div>
          <h3 style={{ margin: '8px 0 0' }}>Lifts — fast travel</h3>
          <div className="small muted">Travel to the top of any lift you have ridden this visit or before.</div>
          <button className="btn small" onClick={() => { game.travelToBase(); onClose(); }}>🏠 Resort base</button>
          {R.lifts.map((l, i) => {
            const ok = game.ridden.has(i);
            return <button key={l.id} className="btn small" disabled={!ok} onClick={() => { game.travelToLift(i); onClose(); }}>🚡 {l.name} {ok ? '' : '(ride it first)'}<span className="muted"> · {l.capacityLabel}, {Math.round(l.length)} m</span></button>;
          })}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import type { HudState } from '../../game/Game';
import type { MapView } from '../../render/mapRender';
import { DiffIcon } from '../components/common';

export function HUD({ h, units, showFps, mapCanvas, view, onPause }: { h: HudState; units: 'kmh' | 'mph'; showFps: boolean; mapCanvas: HTMLCanvasElement | null; view: MapView | null; onPause: () => void }) {
  const speed = units === 'mph' ? h.speed * 2.237 : h.speed * 3.6;
  return (
    <div className="hud" data-testid="hud">
      <div className="tl">
        {h.trail && (
          <div className="box trail-name" data-testid="hud-trail">
            {h.diffColor && <DiffIcon d={h.diffColor} size={16} />}
            <span>{h.trail}</span>
            {h.difficulty && <span className="small muted" style={{ fontWeight: 500 }}>{h.difficulty}</span>}
          </div>
        )}
        <div className="box small" style={{ fontWeight: 500 }}>{h.surface} · {h.conditions}</div>
        <div className="box small" style={{ fontWeight: 500 }}>{h.weather}</div>
        {h.runTimer && <div className="box small">⏱ {h.runTimer}</div>}
      </div>
      <div className="tc">
        {h.timer && <div className={`box timer ${h.timerWarn ? 'warn' : ''}`} data-testid="hud-timer">{h.timer}</div>}
        <div className="box objective">{h.objective}</div>
        {h.race && (
          <div className="box standings">
            <div><span>Position</span><strong>{h.race.pos}/{h.race.of}</strong></div>
            <div><span>Gate</span><span>{h.race.gate}/{h.race.gates}{h.race.missed ? ` · missed ${h.race.missed}` : ''}</span></div>
            {h.race.split && <div><span>{h.race.split}</span></div>}
            <div style={{ height: 6 }} />
            {h.race.standings.map((s, i) => <div key={s.name} className={s.you ? 'you' : ''}><span>{i + 1}. {s.name} <span className="muted">{s.country}</span></span><span>{s.gap}</span></div>)}
          </div>
        )}
      </div>
      <div className="tr">
        <div className="box"><div className="score" data-testid="hud-score">{h.score.toLocaleString()}</div>
          {h.comboPot > 0 && <div className="combo">+{h.comboPot.toLocaleString()} × {h.comboMult}</div>}
        </div>
        <div className="box small" style={{ fontWeight: 500 }}>📷 {h.camera}</div>
      </div>
      <div className="feed">
        {h.feed.slice(-5).map((f) => (
          <div key={f.id} className={`item ${f.kind}`}>
            {f.text}{f.score > 0 && <span className="pts">+{f.score.toLocaleString()}</span>}
            {f.sub && <div className="sub">{f.sub}</div>}
          </div>
        ))}
      </div>
      {h.race?.countdown !== null && h.race?.countdown !== undefined && h.race.countdown > 0 && h.race.countdown <= 3 && <div className="countdown">{h.race.countdown}</div>}
      {h.toast && <div className="toast box">{h.toast}</div>}
      {h.prompt && <div className="prompt box">{h.prompt}</div>}
      <div className="bl box">
        <div className="speed" data-testid="hud-speed">{Math.round(speed)}<small>{units === 'mph' ? 'mph' : 'km/h'}</small></div>
        <div className="small" style={{ fontWeight: 500 }}>Alt {h.altitude.toLocaleString()} m{h.riding ? ` · 🚡 ${h.riding}` : ''}</div>
      </div>
      <div className="br"><MiniMap h={h} mapCanvas={mapCanvas} view={view} /></div>
      <button className="btn small pausebtn" onClick={onPause} title="Pause (Esc)">❚❚</button>
      {showFps && <div className="fps">{h.fps} FPS</div>}
    </div>
  );
}

function MiniMap({ h, mapCanvas, view }: { h: HudState; mapCanvas: HTMLCanvasElement | null; view: MapView | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || !mapCanvas || !view) return;
    const x = c.getContext('2d')!;
    const S = c.width;
    const range = 420; // metres across
    const px = (h.px - view.x0) * view.scale, py = (h.pz - view.z0) * view.scale;
    const src = range * view.scale;
    x.save();
    x.fillStyle = '#dfe9f3'; x.fillRect(0, 0, S, S);
    // rotate so travel direction points up
    x.translate(S / 2, S / 2);
    x.rotate(Math.PI + h.heading);
    x.drawImage(mapCanvas, px - src / 2, py - src / 2, src, src, -S / 2, -S / 2, S, S);
    const k = S / range;
    for (const r of h.racers) {
      if (r.you) continue;
      x.fillStyle = '#d8282a';
      x.beginPath(); x.arc((r.x - h.px) * k, (r.z - h.pz) * k, 4, 0, Math.PI * 2); x.fill();
    }
    x.restore();
    x.fillStyle = '#ff3b30'; x.strokeStyle = '#fff'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(S / 2, S / 2 - 9); x.lineTo(S / 2 + 6, S / 2 + 7); x.lineTo(S / 2 - 6, S / 2 + 7); x.closePath(); x.fill(); x.stroke();
  }, [h, mapCanvas, view]);
  return <canvas ref={ref} width={190} height={190} className="minimap" />;
}

import { useEffect, useMemo, useRef } from 'react';
import { GameSession } from '../game/GameSession';
import { Renderer, VIEW_W, VIEW_H } from '../game/render/Renderer';
import { LCPS_TEAMS } from '../data/teams';
import { generateRoster } from '../game/players';
import { RNG } from '../game/rng';
import { Btn } from '../components/common';
import { Sound } from '../game/audio/Sound';

/** Attract mode: a real CPU-vs-CPU game plays under the menu on a Friday night. */
export function StadiumBackdrop({ dim = 0.45 }: { dim?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const rng = new RNG();
    const mkSession = () => {
      const [a, b] = rng.shuffle([...LCPS_TEAMS]).slice(0, 2);
      const s = new GameSession({
        home: { info: a, roster: generateRoster(a.offenseRating, a.defenseRating, a.specialTeamsRating, rng) },
        away: { info: b, roster: generateRoster(b.offenseRating, b.defenseRating, b.specialTeamsRating, rng) },
        userSide: null, difficulty: 'VARSITY', quarterLen: 300, weather: 'clear', timeOfDay: 'night', seed: rng.int(0, 1e9),
      });
      s.start();
      return s;
    };
    let s = mkSession();
    let r = new Renderer({ timeOfDay: 'night', weather: 'clear', crowd: 0.9, rivalry: false, playoff: false, championship: false });
    s.soundQueue = [];
    const ctx = ref.current!.getContext('2d')!;
    let last = performance.now();
    let raf = 0;
    let acc = 0;
    let plays = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      acc += dt;
      while (acc > 1 / 60) {
        s.update(1 / 60);
        acc -= 1 / 60;
        if (s.phase === 'post' && s.phaseT > 1.2) { s.skip(); plays++; }
      }
      s.soundQueue = [];
      if (s.isOver || plays > 60) {
        s = mkSession();
        r = new Renderer({ timeOfDay: 'night', weather: 'clear', crowd: 0.9, rivalry: false, playoff: false, championship: false });
        plays = 0;
      }
      r.draw(ctx, s, dt);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="backdrop">
      <canvas ref={ref} width={VIEW_W} height={VIEW_H} />
      <div className="backdrop-dim" style={{ background: `rgba(4,6,18,${dim})` }} />
    </div>
  );
}

export function MainMenu({ hasSave, bb, onNav }: { hasSave: boolean; bb?: number | null; onNav: (to: 'play' | 'continue' | 'new' | 'exhibition' | 'settings' | 'teams' | 'records' | 'locker' | 'anim') => void }) {
  const items = useMemo(() => [
    { id: 'play' as const, label: 'PLAY', primary: true },
    { id: 'continue' as const, label: 'CONTINUE DYNASTY', disabled: !hasSave },
    { id: 'locker' as const, label: '🪙 LOCKER', disabled: !hasSave },
    { id: 'new' as const, label: 'NEW DYNASTY' },
    { id: 'exhibition' as const, label: 'EXHIBITION' },
    { id: 'settings' as const, label: 'SETTINGS' },
    { id: 'teams' as const, label: 'TEAM DATABASE' },
  ], [hasSave]);
  return (
    <div className="screen menu-screen">
      <StadiumBackdrop dim={0.42} />
      {bb != null && <div className="menu-bb"><span className="bb-badge big"><span className="coin">🪙</span> {bb.toLocaleString('en-US')} BB</span></div>}
      <div className="menu-content">
        <div className="title-block">
          <div className="title-kicker pixel">LOUDOUN COUNTY PUBLIC SCHOOLS</div>
          <h1 className="title pixel">LCPS<br />BOWL</h1>
          <div className="subtitle">Friday Nights. Loudoun County. One Champion.</div>
        </div>
        <nav className="menu-list">
          {items.map((it) => (
            <button
              key={it.id}
              className={`menu-item pixel ${it.primary ? 'primary' : ''}`}
              disabled={it.disabled}
              onMouseEnter={() => Sound.play('menu')}
              onClick={() => { Sound.play('select'); onNav(it.id); }}
            >
              {it.label}
            </button>
          ))}
        </nav>
        <div className="menu-foot">
          <span>A personal, non-commercial fan project. Players are fictional.</span>
          <Btn small variant="ghost" onClick={() => onNav('records')}>RECORD BOOK</Btn>
          <Btn small variant="ghost" onClick={() => onNav('anim')}>ANIMATION LAB</Btn>
        </div>
      </div>
    </div>
  );
}

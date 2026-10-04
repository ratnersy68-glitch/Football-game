/**
 * Development preview of the full animation schedule: every action, frame, build and direction,
 * with any helmet/pad pair and the techpack demo palette or a real school. Shows events and anchors.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ACTIONS, BUILDS, CELL, DIRS, ORIGIN, frameAt, type ActionId, type Build, type Dir } from '../gear/rig/spec';
import { drawRig } from '../gear/rig/draw';
import { demoLook } from '../gear/rig/demo';
import { resolveLook } from '../gear/look';
import { LCPS_TEAMS, getTeam } from '../data/teams';
import { Btn } from '../components/common';
import type { PlayerData } from '../game/types';
import type { Look } from '../gear/types';

const HELMS = ['helm-standard', 'speedflex', 'f7', 'vicis-zero2', 'vicis-zero2-trench'];
const PADS = ['pads-standard', 'x-flex-pads', 'vicis-elite-pads', 'battle-pads', '2-in-1-pads'];
const MODEL: Record<string, string> = { 'helm-standard': 'standard', speedflex: 'speedflex', f7: 'f7', 'vicis-zero2': 'zero2', 'vicis-zero2-trench': 'zero2trench' };
const PADM: Record<string, string> = { 'pads-standard': 'standard', 'x-flex-pads': 'xflex', 'vicis-elite-pads': 'elite', 'battle-pads': 'battle', '2-in-1-pads': 'twoinone' };

function useLook(team: string, helmet: string, pads: string, build: Build): Look {
  return useMemo(() => {
    if (team === 'demo') return demoLook(MODEL[helmet], PADM[pads]);
    const pos = build === 'skill' ? 'WR' : build === 'hybrid' ? 'LB' : 'OL';
    const p = { id: `lab-${team}-${pos}`, pos, weight: 220, number: 7 } as PlayerData;
    return resolveLook(p, getTeam(team), true, 'none', { helmet, pads, facemask: 'mask-skill', socks: 'socks-team', cleats: 'cleats-classic-black', gloves: 'gloves-team', leftArm: ['sleeve-white'], rightArm: ['band-black'], towel: 'towel-white', towelPos: 'front', visor: 'visor-darksmoke' });
  }, [team, helmet, pads, build]);
}

function Cell({ look, build, dir, action, frame, scale, anchors }: { look: Look; build: Build; dir: Dir; action: ActionId; frame: number; scale: number; anchors: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.clearRect(0, 0, CELL * scale, CELL * scale);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(Math.round((ORIGIN.x - 6) * scale), (ORIGIN.y) * scale, 12 * scale, scale);
    const fr = drawRig(ctx, ORIGIN.x * scale, ORIGIN.y * scale, look, build, dir, action, frame, { scale, number: 7, presnap: false });
    if (anchors) {
      const dot = (p: { x: number; y: number } | null, c: string) => { if (!p) return; ctx.fillStyle = c; ctx.fillRect(Math.round(p.x * scale) - 1, Math.round(p.y * scale) - 1, 3, 3); };
      const a = fr.anchors;
      for (const k of ['shoulderL', 'elbowL', 'wristL', 'hipL', 'ankleL'] as const) dot(a[k], '#00e5ff');
      for (const k of ['shoulderR', 'elbowR', 'wristR', 'hipR', 'ankleR'] as const) dot(a[k], '#ff2bd6');
      dot(a.head, '#ffe600');
      if (a.ball) { ctx.fillStyle = '#6b3a1e'; ctx.fillRect(Math.round(a.ball.x * scale - scale * 1.5), Math.round(a.ball.y * scale - scale), scale * 3, scale * 2); }
    } else if (fr.anchors.ball) {
      ctx.fillStyle = '#6b3a1e';
      ctx.fillRect(Math.round(fr.anchors.ball.x * scale - scale * 1.5), Math.round(fr.anchors.ball.y * scale - scale), scale * 3, scale * 2);
    }
  }, [look, build, dir, action, frame, scale, anchors]);
  return <canvas ref={ref} width={CELL * scale} height={CELL * scale} className="lab-cell" />;
}

function Live({ look, build, dir, action, scale }: { look: Look; build: Build; dir: Dir; action: ActionId; scale: number }) {
  const [t, setT] = useState(0);
  useEffect(() => { let raf = 0; const t0 = performance.now(); const f = () => { setT((performance.now() - t0) / 1000); raf = requestAnimationFrame(f); }; raf = requestAnimationFrame(f); return () => cancelAnimationFrame(raf); }, [action]);
  const a = ACTIONS.find((x) => x.id === action)!;
  const { frame } = frameAt(a, a.loop === false ? t % (a.frames / a.fps + 0.6) : t);
  return <Cell look={look} build={build} dir={dir} action={action} frame={frame} scale={scale} anchors={false} />;
}

export function AnimationLab({ onBack }: { onBack: () => void }) {
  const [build, setBuild] = useState<Build>('hybrid');
  const [dir, setDir] = useState<Dir>('right');
  const [team, setTeam] = useState('demo');
  const [helmet, setHelmet] = useState('helm-standard');
  const [pads, setPads] = useState('pads-standard');
  const [scale, setScale] = useState(3);
  const [anchors, setAnchors] = useState(false);
  const [only, setOnly] = useState<ActionId | 'all'>('all');
  const look = useLook(team, helmet, pads, build);
  const list = only === 'all' ? ACTIONS : ACTIONS.filter((a) => a.id === only);
  return (
    <div className="screen lab-screen">
      <div className="lab-bar">
        <Btn small variant="ghost" onClick={onBack}>◂ BACK</Btn>
        <b className="pixel">ANIMATION LAB</b>
        <select value={build} onChange={(e) => setBuild(e.target.value as Build)}>{BUILDS.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={dir} onChange={(e) => setDir(e.target.value as Dir)}>{DIRS.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={team} onChange={(e) => setTeam(e.target.value)}><option value="demo">techpack demo</option>{LCPS_TEAMS.map((t) => <option key={t.id} value={t.id}>{t.shortName}</option>)}</select>
        <select value={helmet} onChange={(e) => setHelmet(e.target.value)}>{HELMS.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={pads} onChange={(e) => setPads(e.target.value)}>{PADS.map((b) => <option key={b}>{b}</option>)}</select>
        <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>{[1, 2, 3, 4, 6, 8].map((b) => <option key={b} value={b}>{b}×</option>)}</select>
        <select value={only} onChange={(e) => setOnly(e.target.value as ActionId | 'all')}><option value="all">all actions</option>{ACTIONS.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
        <label><input type="checkbox" checked={anchors} onChange={(e) => setAnchors(e.target.checked)} /> anchors</label>
      </div>
      <div className="lab-rows">
        {list.map((a) => (
          <div key={a.id} className="lab-row" data-action={a.id}>
            <div className="lab-meta"><b>{a.label}</b><span>{a.frames}f · {a.fps}fps · {a.loop === true ? 'loop' : Array.isArray(a.loop) ? `loop ${a.loop[0]}–${a.loop[1]}` : `→ ${a.next}`}</span><span className="dim">{Object.entries(a.events).map(([k, v]) => `${k}@${v}`).join(' ')}</span></div>
            <Live look={look} build={build} dir={dir} action={a.id} scale={scale} />
            {Array.from({ length: a.frames }, (_, i) => (
              <div key={i} className="lab-frame"><Cell look={look} build={build} dir={dir} action={a.id} frame={i} scale={scale} anchors={anchors} /><span>{i} {a.keys[i]}{Object.entries(a.events).filter(([, f]) => f === i).map(([k]) => ` ◆${k}`).join('')}</span></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

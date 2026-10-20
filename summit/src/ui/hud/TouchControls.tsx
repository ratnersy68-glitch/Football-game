import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import type { Input, Action } from '../../game/input';

const GRABS = ['Mute', 'Safety', 'Japan', 'Tail', 'Method', 'Nose', 'Truck Driver', 'Stalefish'];
// grab index as read by the skier: 1–4 plain, 5–8 shifted
const GRAB_CODE = [2, 1, 4, 3, 6, 5, 8, 7];

/** Drag stick: reports a normalised offset in [-1, 1]² while a finger holds it. */
function Stick({ className, label, onMove }: { className: string; label: string; onMove: (x: number, y: number) => void }) {
  const base = useRef<HTMLDivElement>(null);
  const [knob, setKnob] = useState<[number, number]>([0, 0]);
  const id = useRef<number | null>(null);
  const move = (e: RPointerEvent) => {
    if (id.current !== e.pointerId || !base.current) return;
    const r = base.current.getBoundingClientRect();
    const R = r.width / 2;
    let x = (e.clientX - r.left - R) / R, y = (e.clientY - r.top - R) / R;
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    setKnob([x, y]);
    onMove(x, y);
  };
  const end = (e: RPointerEvent) => {
    if (id.current !== e.pointerId) return;
    id.current = null;
    setKnob([0, 0]);
    onMove(0, 0);
  };
  return (
    <div ref={base} className={`tc-stick ${className}`}
      onPointerDown={(e) => { id.current = e.pointerId; e.currentTarget.setPointerCapture(e.pointerId); move(e); }}
      onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <div className="tc-knob" style={{ transform: `translate(${knob[0] * 50}%, ${knob[1] * 50}%)` }} />
      <span className="tc-stick-label">{label}</span>
    </div>
  );
}

/** Button that is "held" while any finger is on it. */
function Hold({ className, label, onChange }: { className: string; label: string; onChange: (down: boolean) => void }) {
  const [down, setDown] = useState(false);
  const set = (b: boolean) => { setDown(b); onChange(b); };
  return (
    <div className={`tc-btn ${className} ${down ? 'on' : ''}`}
      onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); set(true); }}
      onPointerUp={() => set(false)} onPointerCancel={() => set(false)}>{label}</div>
  );
}

/** On-screen controls for phones and tablets. */
export function TouchControls({ input, onPause }: { input: Input; onPause: () => void }) {
  const t = input.touch;
  const grabIdx = useRef(0);
  const [grabName, setGrabName] = useState(GRABS[0]);
  // never leave a control stuck on when the controls unmount (pause, map, results)
  useEffect(() => () => { Object.assign(t, { steer: 0, tuck: false, brake: false, carve: false, jump: false, spin: 0, flip: 0, tilt: 0, grab: 0 }); }, [t]);
  const tap = (a: Action) => (e: RPointerEvent) => { e.preventDefault(); input.tap(a); };
  return (
    <div className="touch-controls" onContextMenu={(e) => e.preventDefault()}>
      <div className="tc-top">
        <button className="tc-small" onPointerDown={tap('interact')}>LIFT</button>
        <button className="tc-small" onPointerDown={tap('reset')}>RESET</button>
        <button className="tc-small" onPointerDown={tap('map')}>MAP</button>
        <button className="tc-small" onPointerDown={tap('camera')}>CAM</button>
        <button className="tc-small" onPointerDown={tap('replay')}>REPLAY</button>
        <button className="tc-small" onPointerDown={(e) => { e.preventDefault(); onPause(); }}>❚❚</button>
      </div>
      <Stick className="tc-move" label="STEER · ↑ TUCK · ↓ BRAKE" onMove={(x, y) => {
        const dz = (v: number) => (Math.abs(v) < 0.12 ? 0 : (v - Math.sign(v) * 0.12) / 0.88);
        t.steer = dz(x);
        t.tuck = y < -0.45;
        t.brake = y > 0.45;
      }} />
      <Stick className="tc-trick" label="TRICKS: ↔ SPIN · ↕ FLIP" onMove={(x, y) => {
        t.spin = x > 0.35 ? 1 : x < -0.35 ? -1 : 0;
        t.flip = y < -0.35 ? 1 : y > 0.35 ? -1 : 0;
      }} />
      <Hold className="tc-jump" label="JUMP" onChange={(b) => { t.jump = b; }} />
      <Hold className="tc-carve" label="CARVE" onChange={(b) => { t.carve = b; }} />
      <Hold className="tc-grab" label={`GRAB\n${grabName}`} onChange={(b) => {
        t.grab = b ? GRAB_CODE[grabIdx.current] : 0;
        if (!b) { grabIdx.current = (grabIdx.current + 1) % GRABS.length; setGrabName(GRABS[grabIdx.current]); }
      }} />
      <Hold className="tc-cork" label="CORK" onChange={(b) => { t.tilt = b ? 1 : 0; }} />
      <div className="tc-rotate">↻ Turn your phone sideways for the best view</div>
    </div>
  );
}

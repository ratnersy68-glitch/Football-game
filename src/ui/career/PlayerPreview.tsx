/**
 * Live 3D preview of the created player (turntable). Rebuilds the model whenever the look changes, so
 * every appearance and gear choice is visible immediately. Drag to rotate; presets zoom to the helmet,
 * hands and cleats.
 */
import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerAvatar, type PlayerLook } from '../../play/render/playerModel';

export type PreviewFocus = 'full' | 'helmet' | 'hands' | 'cleats';
const FOCUS: Record<PreviewFocus, { y: number; dist: number; label: string }> = {
  full: { y: 1.0, dist: 5.2, label: 'Full Body' },
  helmet: { y: 1.95, dist: 1.25, label: 'Helmet' },
  hands: { y: 1.25, dist: 2.2, label: 'Arms & Hands' },
  cleats: { y: 0.35, dist: 1.9, label: 'Socks & Cleats' },
};

export function PlayerPreview({ look, focus: focusProp, height = 420 }: { look: PlayerLook; focus?: PreviewFocus; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctx = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    holder: THREE.Group;
    avatar?: PlayerAvatar;
    yaw: number;
    auto: boolean;
    focus: PreviewFocus;
    cur: { y: number; dist: number };
  } | null>(null);
  const [focus, setFocus] = useState<PreviewFocus>(focusProp ?? 'full');
  const [glError, setGlError] = useState(false);

  useEffect(() => {
    if (focusProp) setFocus(focusProp);
  }, [focusProp]);

  // One-time scene setup
  useEffect(() => {
    const canvas = canvasRef.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch {
      setGlError(true);
      return;
    }
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    scene.add(new THREE.HemisphereLight('#e8f1ff', '#35402a', 1.2));
    const key = new THREE.DirectionalLight('#fff3e0', 2.4);
    key.position.set(3, 5, 2);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight('#9fc6ff', 1.4);
    rim.position.set(-3, 3, -3);
    scene.add(rim);
    // Turf podium
    const pod = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.2, 0.12, 40), new THREE.MeshStandardMaterial({ color: '#2f7a2c', roughness: 0.9 }));
    pod.position.y = -0.06;
    pod.receiveShadow = true;
    scene.add(pod);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.02, 6, 60).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffcc33' }));
    scene.add(ring);
    const holder = new THREE.Group();
    scene.add(holder);
    ctx.current = { renderer, scene, camera, holder, yaw: 0.5, auto: true, focus: 'full', cur: { ...FOCUS.full } };

    let raf = 0;
    let last = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const c = ctx.current!;
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== Math.floor(w * renderer.getPixelRatio()) || canvas.height !== Math.floor(h * renderer.getPixelRatio())) {
        renderer.setSize(w, h, false);
        camera.aspect = w / Math.max(1, h);
        camera.updateProjectionMatrix();
      }
      if (c.auto) c.yaw += dt * 0.5;
      const f = FOCUS[c.focus];
      c.cur.y += (f.y - c.cur.y) * Math.min(1, dt * 6);
      c.cur.dist += (f.dist - c.cur.dist) * Math.min(1, dt * 6);
      if (c.avatar) {
        c.avatar.update({ x: 0, y: 0, facing: c.yaw, vx: 0, vy: 0, pose: 'idle', poseT: 0, hasBall: false, lineman: false }, dt);
        // idle breathing
        c.avatar.rig.torso.rotation.z = Math.sin(now / 700) * 0.02;
      }
      camera.position.set(c.cur.dist, c.cur.y + 0.1 + c.cur.dist * 0.04, c.cur.dist * 0.12);
      camera.lookAt(0, c.cur.y, 0);
      renderer.render(scene, camera);
    };
    loop();

    // Drag to rotate
    let dragging = false;
    let px = 0;
    const down = (e: PointerEvent) => {
      dragging = true;
      px = e.clientX;
      ctx.current!.auto = false;
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      ctx.current!.yaw -= (e.clientX - px) * 0.012;
      px = e.clientX;
    };
    const up = () => (dragging = false);
    canvas.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      renderer.dispose();
      ctx.current = null;
    };
  }, []);

  // Rebuild the player when the look changes
  const lookKey = JSON.stringify(look);
  useEffect(() => {
    const c = ctx.current;
    if (!c) return;
    if (c.avatar) c.holder.remove(c.avatar.root);
    const av = new PlayerAvatar(look);
    av.root.traverse((o) => (o.castShadow = true));
    c.holder.add(av.root);
    c.avatar = av;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookKey]);

  useEffect(() => {
    if (ctx.current) ctx.current.focus = focus;
  }, [focus]);

  return (
    <div className="preview">
      {glError ? (
        <div className="preview-fallback">3D preview needs WebGL, which isn't available in this browser.</div>
      ) : (
        <canvas ref={canvasRef} style={{ width: '100%', height }} aria-label="3D player preview" />
      )}
      <div className="preview-bar">
        {(Object.keys(FOCUS) as PreviewFocus[]).map((k) => (
          <button key={k} className={`btn small ${focus === k ? 'active' : ''}`} onClick={() => setFocus(k)}>
            {FOCUS[k].label}
          </button>
        ))}
        <button
          className="btn small"
          onClick={() => {
            if (ctx.current) ctx.current.auto = !ctx.current.auto;
          }}
        >
          Spin
        </button>
      </div>
      <div className="preview-hint muted">Drag to rotate</div>
    </div>
  );
}

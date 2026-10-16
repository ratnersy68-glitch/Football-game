import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Character, IDLE_POSE } from '../../render/character';
import type { Look } from '../../data/equipment';

/** Small turntable render of the rider with the current loadout. */
export function CharacterPreview({ look, board }: { look: Look; board: 'ski' | 'snowboard' }) {
  const host = useRef<HTMLDivElement>(null);
  const charRef = useRef<Character | null>(null);
  const boardRef = useRef(board);
  boardRef.current = board;
  useEffect(() => {
    const el = host.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    cam.position.set(0, 1.25, 4.4);
    cam.lookAt(0, 0.85, 0);
    scene.add(new THREE.HemisphereLight(0xdfefff, 0x445566, 1.2));
    const sun = new THREE.DirectionalLight(0xffffff, 2.2);
    sun.position.set(2, 4, 3);
    scene.add(sun);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 40), new THREE.MeshStandardMaterial({ color: 0xf2f6fb, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);
    const ch = new Character(look);
    charRef.current = ch;
    scene.add(ch.root);
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const w = el.clientWidth, h = el.clientHeight;
      if (renderer.domElement.width !== Math.floor(w * renderer.getPixelRatio())) { renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); }
      const t = (performance.now() - t0) / 1000;
      const c = charRef.current!;
      c.root.rotation.y = t * 0.6;
      c.update({ ...IDLE_POSE, board: boardRef.current, crouch: 0.25 + Math.sin(t * 1.5) * 0.05 }, 1 / 60);
      renderer.render(scene, cam);
    };
    loop();
    return () => { cancelAnimationFrame(raf); ch.dispose(); renderer.dispose(); el.removeChild(renderer.domElement); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { charRef.current?.setLook(look); }, [look]);
  return <div ref={host} className="preview-3d" />;
}

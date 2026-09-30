/** 2D skeleton used by the fighter renderer. Local coordinates in metres: x forward, y up. */
export interface P2 {
  x: number;
  y: number;
}

export interface Skeleton {
  head: P2;
  neck: P2;
  hip: P2;
  lElbow: P2; // lead arm
  lHand: P2;
  rElbow: P2; // rear arm
  rHand: P2;
  lKnee: P2; // lead leg
  lFoot: P2;
  rKnee: P2; // rear leg
  rFoot: P2;
}

export const JOINTS: (keyof Skeleton)[] = ['head', 'neck', 'hip', 'lElbow', 'lHand', 'rElbow', 'rHand', 'lKnee', 'lFoot', 'rKnee', 'rFoot'];

export const p = (x: number, y: number): P2 => ({ x, y });

/** Two-bone IK: returns the middle joint for a limb from a to target c with lengths l1,l2. bend = +1/-1 picks the side. */
export function ik(a: P2, c: P2, l1: number, l2: number, bend: number): { mid: P2; end: P2 } {
  let dx = c.x - a.x;
  let dy = c.y - a.y;
  let d = Math.hypot(dx, dy);
  const max = l1 + l2 - 1e-3;
  let end = c;
  if (d > max) {
    dx *= max / d;
    dy *= max / d;
    d = max;
    end = { x: a.x + dx, y: a.y + dy };
  }
  d = Math.max(d, 1e-3);
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const ang = Math.atan2(dy, dx) + bend * Math.acos(Math.max(-1, Math.min(1, cosA)));
  return { mid: { x: a.x + Math.cos(ang) * l1, y: a.y + Math.sin(ang) * l1 }, end };
}

export function lerpSkel(a: Skeleton, b: Skeleton, t: number): Skeleton {
  const out = {} as Skeleton;
  for (const j of JOINTS) out[j] = { x: a[j].x + (b[j].x - a[j].x) * t, y: a[j].y + (b[j].y - a[j].y) * t };
  return out;
}

export function cloneSkel(a: Skeleton): Skeleton {
  const out = {} as Skeleton;
  for (const j of JOINTS) out[j] = { ...a[j] };
  return out;
}

type Arr = [number, number];
const S = (o: Record<keyof Skeleton, Arr>): Skeleton => {
  const out = {} as Skeleton;
  for (const j of JOINTS) out[j] = { x: o[j][0], y: o[j][1] };
  return out;
};

/**
 * Hand-authored ground poses in a shared frame anchored at the bottom fighter's hips.
 * +x points toward the top fighter's hips (the bottom fighter's head is at -x). Units are metres for a 1.8 m fighter.
 */
export const GROUND: Record<string, { bottom: Skeleton; top: Skeleton; topFirst?: boolean }> = {
  fullGuard: {
    bottom: S({ head: [-0.86, 0.13], neck: [-0.7, 0.15], hip: [0, 0.14], lElbow: [-0.55, 0.36], lHand: [-0.3, 0.52], rElbow: [-0.6, 0.3], rHand: [-0.38, 0.46], lKnee: [0.22, 0.52], lFoot: [0.62, 0.48], rKnee: [0.26, 0.46], rFoot: [0.66, 0.42] }),
    top: S({ head: [-0.1, 1.02], neck: [0.02, 0.92], hip: [0.42, 0.55], lElbow: [-0.12, 0.66], lHand: [-0.32, 0.38], rElbow: [0.02, 0.62], rHand: [-0.22, 0.42], lKnee: [0.22, 0.06], lFoot: [0.72, 0.05], rKnee: [0.3, 0.06], rFoot: [0.8, 0.05] }),
  },
  halfGuard: {
    bottom: S({ head: [-0.86, 0.13], neck: [-0.7, 0.15], hip: [0, 0.14], lElbow: [-0.5, 0.3], lHand: [-0.3, 0.45], rElbow: [-0.62, 0.28], rHand: [-0.45, 0.4], lKnee: [0.26, 0.46], lFoot: [0.48, 0.12], rKnee: [0.42, 0.14], rFoot: [0.86, 0.05] }),
    top: S({ head: [-0.36, 0.74], neck: [-0.22, 0.7], hip: [0.3, 0.46], lElbow: [-0.45, 0.45], lHand: [-0.6, 0.25], rElbow: [-0.1, 0.5], rHand: [-0.35, 0.36], lKnee: [0.1, 0.06], lFoot: [0.62, 0.05], rKnee: [0.36, 0.06], rFoot: [0.86, 0.05] }),
  },
  sideControl: {
    bottom: S({ head: [-0.86, 0.13], neck: [-0.7, 0.15], hip: [0, 0.14], lElbow: [-0.62, 0.3], lHand: [-0.5, 0.45], rElbow: [-0.45, 0.24], rHand: [-0.3, 0.34], lKnee: [0.42, 0.34], lFoot: [0.78, 0.05], rKnee: [0.45, 0.14], rFoot: [0.88, 0.05] }),
    top: S({ head: [-0.66, 0.5], neck: [-0.5, 0.48], hip: [0.02, 0.44], lElbow: [-0.72, 0.28], lHand: [-0.85, 0.22], rElbow: [-0.3, 0.3], rHand: [-0.1, 0.3], lKnee: [0.2, 0.06], lFoot: [0.55, 0.05], rKnee: [0.3, 0.06], rFoot: [0.68, 0.05] }),
  },
  mount: {
    bottom: S({ head: [-0.86, 0.13], neck: [-0.7, 0.15], hip: [0, 0.14], lElbow: [-0.58, 0.38], lHand: [-0.46, 0.58], rElbow: [-0.62, 0.34], rHand: [-0.54, 0.54], lKnee: [0.4, 0.3], lFoot: [0.74, 0.05], rKnee: [0.42, 0.16], rFoot: [0.86, 0.05] }),
    top: S({ head: [-0.1, 0.98], neck: [-0.04, 0.86], hip: [0.04, 0.36], lElbow: [-0.24, 0.66], lHand: [-0.32, 0.82], rElbow: [-0.1, 0.62], rHand: [-0.22, 0.86], lKnee: [-0.14, 0.1], lFoot: [0.22, 0.05], rKnee: [0.24, 0.12], rFoot: [0.5, 0.05] }),
  },
  backControl: {
    bottom: S({ head: [0.3, 0.82], neck: [0.24, 0.68], hip: [0.12, 0.18], lElbow: [0.46, 0.5], lHand: [0.36, 0.72], rElbow: [0.4, 0.45], rHand: [0.3, 0.66], lKnee: [0.56, 0.36], lFoot: [0.92, 0.05], rKnee: [0.6, 0.3], rFoot: [0.98, 0.05] }),
    top: S({ head: [0.1, 0.9], neck: [0.02, 0.74], hip: [-0.18, 0.2], lElbow: [0.18, 0.62], lHand: [0.34, 0.76], rElbow: [0.24, 0.58], rHand: [0.3, 0.7], lKnee: [0.24, 0.38], lFoot: [0.52, 0.22], rKnee: [0.3, 0.32], rFoot: [0.5, 0.14] }),
    topFirst: true,
  },
  turtle: {
    bottom: S({ head: [-0.46, 0.34], neck: [-0.3, 0.42], hip: [0.1, 0.5], lElbow: [-0.2, 0.08], lHand: [-0.42, 0.08], rElbow: [-0.26, 0.1], rHand: [-0.48, 0.08], lKnee: [0.05, 0.05], lFoot: [0.46, 0.05], rKnee: [0.15, 0.05], rFoot: [0.52, 0.05] }),
    top: S({ head: [-0.16, 1.02], neck: [-0.04, 0.9], hip: [0.36, 0.58], lElbow: [0.02, 0.6], lHand: [0.0, 0.48], rElbow: [0.12, 0.58], rHand: [0.12, 0.45], lKnee: [0.28, 0.06], lFoot: [0.78, 0.05], rKnee: [0.4, 0.06], rFoot: [0.86, 0.05] }),
  },
};

/** Submission-specific pose overrides applied on top of a ground pose (attacker = top or bottom). */
export const SUB_POSES: Record<string, (attTop: boolean) => { bottom?: Partial<Record<keyof Skeleton, Arr>>; top?: Partial<Record<keyof Skeleton, Arr>>; base: string }> = {
  rnc: () => ({ base: 'backControl', top: { lHand: [0.3, 0.72], rHand: [0.26, 0.76], lElbow: [0.36, 0.6], rElbow: [0.16, 0.66] } }),
  guillotine: (attTop) => attTop
    ? { base: 'turtle', top: { lHand: [-0.36, 0.4], rHand: [-0.3, 0.46], lElbow: [-0.1, 0.62], rElbow: [-0.05, 0.6] } }
    : { base: 'fullGuard', top: { head: [-0.36, 0.56], neck: [-0.2, 0.66] }, bottom: { lHand: [-0.36, 0.62], rHand: [-0.3, 0.56], lElbow: [-0.55, 0.52], rElbow: [-0.5, 0.46] } },
  triangle: () => ({ base: 'fullGuard', top: { head: [-0.22, 0.72], neck: [-0.08, 0.76] }, bottom: { lKnee: [-0.02, 0.86], lFoot: [-0.46, 0.96], rKnee: [0.08, 0.8], rFoot: [-0.38, 0.88] } }),
  armbar: (attTop) => attTop
    ? { base: 'mount', top: { hip: [-0.1, 0.18], neck: [0.46, 0.16], head: [0.62, 0.14], lKnee: [-0.36, 0.42], lFoot: [-0.7, 0.3], rKnee: [-0.3, 0.36], rFoot: [-0.64, 0.24], lHand: [-0.3, 0.56], rHand: [-0.24, 0.52], lElbow: [0.1, 0.36], rElbow: [0.14, 0.3] }, bottom: { lHand: [-0.3, 0.6], lElbow: [-0.5, 0.42] } }
    : { base: 'fullGuard', bottom: { lKnee: [0.06, 0.74], lFoot: [-0.12, 1.12], rKnee: [0.2, 0.6], rFoot: [0.1, 1.02], lHand: [-0.1, 0.62], rHand: [-0.18, 0.58] }, top: { lHand: [-0.1, 0.66], lElbow: [-0.02, 0.8] } },
  kimura: (attTop) => attTop
    ? { base: 'sideControl', top: { lHand: [-0.52, 0.56], rHand: [-0.46, 0.5], lElbow: [-0.36, 0.64], rElbow: [-0.24, 0.52] }, bottom: { lHand: [-0.5, 0.58], lElbow: [-0.62, 0.4] } }
    : { base: 'fullGuard', bottom: { lHand: [-0.2, 0.7], rHand: [-0.1, 0.62], lElbow: [-0.45, 0.6], rElbow: [-0.4, 0.5] }, top: { lHand: [-0.2, 0.62], lElbow: [-0.05, 0.72] } },
  armTriangle: () => ({ base: 'sideControl', top: { head: [-0.74, 0.34], neck: [-0.56, 0.38], lHand: [-0.86, 0.3], rHand: [-0.8, 0.24], lElbow: [-0.76, 0.46], rElbow: [-0.62, 0.3] } }),
};

export function applyOverride(s: Skeleton, o: Partial<Record<keyof Skeleton, Arr>> | undefined): Skeleton {
  if (!o) return s;
  const out = cloneSkel(s);
  for (const [k, v] of Object.entries(o) as [keyof Skeleton, Arr][]) out[k] = { x: v[0], y: v[1] };
  return out;
}

export const LYING: Skeleton = S({ head: [-0.9, 0.1], neck: [-0.74, 0.12], hip: [0, 0.12], lElbow: [-0.7, 0.05], lHand: [-0.95, 0.05], rElbow: [-0.45, 0.06], rHand: [-0.3, 0.05], lKnee: [0.4, 0.3], lFoot: [0.7, 0.05], rKnee: [0.45, 0.12], rFoot: [0.9, 0.05] });

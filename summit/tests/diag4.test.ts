import { it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort, steepestWindow } from '../src/world/resortBuilder';
import { PITCH_BANDS } from '../src/world/types';

it('diag4', () => {
  const def = RESORTS[+(process.env.R ?? 6)];
  const dbg = { shaped: new Map<number, number[]>() };
  const r = buildResort(def, undefined, dbg);
  for (const tr of r.trails.filter(t => t.kind === 'trail')) {
    const b = PITCH_BANDS[tr.difficulty];
    const sh = dbg.shaped.get(tr.id)!;
    const shapedPitch = steepestWindow(sh, tr.s, 60).g;
    const ok = tr.maxPitch >= b.min && tr.maxPitch <= b.max;
    let worst = 0, wi = 0;
    for (let i = 0; i < sh.length; i++) { const d = Math.abs(sh[i] - tr.prof[i]); if (d > worst) { worst = d; wi = i; } }
    const w = steepestWindow(tr.prof, tr.s, 60);
    const p = tr.pts[w.i];
    const owners = new Set<number>();
    for (let k = w.i; k < Math.min(tr.pts.length, w.i + 10); k++) owners.add(r.terrain.trailAt(tr.pts[k].x, tr.pts[k].z).id);
    console.log(`${ok ? ' ' : '!'} ${tr.id} ${tr.difficulty.padEnd(6)} shapedPitch ${shapedPitch.toFixed(2)} final ${tr.maxPitch.toFixed(2)} [${b.min}-${b.max}] maxdev ${worst.toFixed(1)}@${wi}/${sh.length} steep@${w.i} xz ${p.x.toFixed(0)},${p.z.toFixed(0)} owners ${[...owners].join(',')}`);
  }
});

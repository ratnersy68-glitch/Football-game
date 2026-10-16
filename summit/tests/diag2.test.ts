import { it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort, steepestWindow } from '../src/world/resortBuilder';
import { PITCH_BANDS } from '../src/world/types';

it('diag2', () => {
  const def = RESORTS[+(process.env.R ?? 0)];
  const r = buildResort(def);
  for (const tr of r.trails.filter((x) => x.kind === 'trail')) {
    const b = PITCH_BANDS[tr.difficulty];
    if (tr.maxPitch >= b.min && tr.maxPitch <= b.max) continue;
    const w = steepestWindow(tr.prof, tr.s, 60);
    const p = tr.pts[w.i];
    const others: string[] = [];
    for (let k = w.i; k < Math.min(tr.pts.length, w.i + 12); k++) {
      const q = tr.pts[k];
      const t = r.terrain.trailAt(q.x, q.z);
      others.push(`${t.id}:${t.w.toFixed(2)}`);
    }
    console.log(tr.name, tr.difficulty, 'pitch', tr.maxPitch.toFixed(2), 'at i', w.i, '/', tr.pts.length, 'xz', p.x.toFixed(0), p.z.toFixed(0), 'zBase', r.zBase, 'base', JSON.stringify(r.base), 'id', tr.id, others.join(' '));
    console.log(tr.prof.slice(Math.max(0, w.i - 4), w.i + 14).map((v) => v.toFixed(1)).join(' '));
    console.log(r.lifts.map((l) => `${l.name} b(${l.bottom.x.toFixed(0)},${l.bottom.z.toFixed(0)}) t(${l.top.x.toFixed(0)},${l.top.z.toFixed(0)})`).join(' | '));
  }
});

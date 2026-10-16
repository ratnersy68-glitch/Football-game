import { it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort } from '../src/world/resortBuilder';

it('diag3', () => {
  const def = RESORTS[+(process.env.R ?? 7)];
  const dbg = { shaped: new Map<number, number[]>() };
  const r = buildResort(def, undefined, dbg);
  for (const tr of r.trails.slice(0, +(process.env.N ?? 6))) {
    const sh = dbg.shaped.get(tr.id)!;
    let worst = 0, wi = 0;
    for (let i = 0; i < sh.length; i++) { const d = Math.abs(sh[i] - tr.prof[i]); if (d > worst) { worst = d; wi = i; } }
    const p = tr.pts[wi];
    const ta = r.terrain.trailAt(p.x, p.z);
    console.log(tr.id, tr.name, tr.kind, 'worst dev', worst.toFixed(1), 'at', wi, '/', sh.length, 'xz', p.x.toFixed(0), p.z.toFixed(0), 'owner', ta.id, ta.w.toFixed(2), 'shaped', sh.slice(Math.max(0,wi-3), wi+4).map(v=>v.toFixed(0)).join(','), 'final', tr.prof.slice(Math.max(0,wi-3), wi+4).map(v=>v.toFixed(0)).join(','));
  }
  console.log('base', JSON.stringify(r.base), 'zBase', r.zBase, r.lifts.map(l => `${l.name} b(${l.bottom.x.toFixed(0)},${l.bottom.z.toFixed(0)}) t(${l.top.x.toFixed(0)},${l.top.z.toFixed(0)})`).join(' | '));
});

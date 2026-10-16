import { it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort } from '../src/world/resortBuilder';
import { PITCH_BANDS } from '../src/world/types';

it('diag5', () => {
  const def = RESORTS[+(process.env.R ?? 6)];
  const dbg = { shaped: new Map<number, number[]>(), raw: new Map<number, number[]>() };
  const r = buildResort(def, undefined, dbg as any);
  for (const tr of r.trails.filter(t => t.kind === 'trail')) {
    const raw = (dbg as any).raw.get(tr.id) as number[];
    const sh = dbg.shaped.get(tr.id)!;
    const n = raw.length;
    const b = PITCH_BANDS[tr.difficulty];
    let maxdev = 0; for (let i = 0; i < n; i++) maxdev = Math.max(maxdev, Math.abs(raw[i] - sh[i]));
    console.log(tr.id, tr.difficulty.padEnd(6), 'len', tr.length.toFixed(0), 'rawAvg', ((raw[0] - raw[n-1]) / tr.length).toFixed(2), 'gmax', (b.max*0.93).toFixed(2), 'maxdev', maxdev.toFixed(1), 'start', tr.pts[0].x.toFixed(0), tr.pts[0].z.toFixed(0), 'end', tr.pts[n-1].x.toFixed(0), tr.pts[n-1].z.toFixed(0));
  }
});

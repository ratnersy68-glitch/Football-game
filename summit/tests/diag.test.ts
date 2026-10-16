import { it } from 'vitest';
import { RESORTS } from '../src/data/resorts';
import { buildResort } from '../src/world/resortBuilder';
import { PITCH_BANDS } from '../src/world/types';

it('diag', () => {
  const which = process.env.R ? [RESORTS[+process.env.R]] : RESORTS;
  for (const def of which) {
    const r = buildResort(def);
    const t = r.trails.filter((x) => x.kind === 'trail');
    let bad = 0;
    const lines: string[] = [];
    for (const tr of t) {
      const b = PITCH_BANDS[tr.difficulty];
      const ok = tr.maxPitch >= b.min && tr.maxPitch <= b.max;
      if (!ok) bad++;
      lines.push(`${ok ? ' ' : '!'} ${tr.difficulty.padEnd(7)} ${tr.name.padEnd(26)} len ${tr.length.toFixed(0).padStart(5)} vert ${tr.vertical.toFixed(0).padStart(5)} avg ${tr.avgGrade.toFixed(2)} pitch ${tr.maxPitch.toFixed(2)} [${b.min}-${b.max}]`);
    }
    console.log(`${def.name}: ${r.genMs.toFixed(0)}ms trails ${t.length} bad ${bad} lifts ${r.lifts.length} parks ${r.parks.length} courses ${r.courses.length} trees ${r.treeCount} rocks ${r.rockCount} features ${r.terrain.features.list.length} rails ${r.rails.length}\n` + lines.join('\n'));
    for (const c of r.courses) console.log(`  course ${c.name} ${c.discipline} gates ${c.gates.length} len ${r.trails[c.trailId].length.toFixed(0)} avg ${r.trails[c.trailId].avgGrade.toFixed(2)} pitch ${r.trails[c.trailId].maxPitch.toFixed(2)}`);
    for (const p of r.parks) console.log(`  park ${p.name} ${p.style} feats ${p.featureIds.length} rails ${p.railIds.length} len ${r.trails[p.trailId].length.toFixed(0)} avg ${r.trails[p.trailId].avgGrade.toFixed(2)}`);
  }
});

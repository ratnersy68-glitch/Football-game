import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { readFileSync, existsSync } from 'node:fs';
import { GEAR_ASSETS, LOGO_ASSETS } from '../src/assets/registry';
import { LCPS_TEAMS } from '../src/data/teams';
import manifest from '../src/data/logo-manifest.json';

const sha = (p: string) => createHash('sha256').update(readFileSync(p)).digest('hex');
const sums = Object.fromEntries(readFileSync('docs/correction-pack/SHA256SUMS.txt', 'utf8').trim().split('\n').map((l) => { const [h, f] = l.split(/\s+/); return [f.replace(/^\.\//, ''), h]; }));

describe('supplied correction-pack assets', () => {
  it('maps the eight exact gear items to their supplied files (pads use the (1) versions) with identical bytes', () => {
    const want: Record<string, string> = {
      speedflex: '25C53D5B-3475-4BED-B326-2FB03A0A5B5C.jpeg', f7: '3A6EFFAB-8FD9-42AD-9E99-162ADC973A56.jpeg',
      'vicis-zero2': '94A2F4DE-7730-423A-ABBB-C8CAB722B78D.jpeg', 'vicis-zero2-trench': '0A2D9EEB-F7B5-4504-8F92-1EBF914501F9.jpeg',
      'x-flex-pads': '16961CB2-D683-4D8C-9AEE-5D01AF1D0307(1).jpeg', 'vicis-elite-pads': 'EB908341-A1CF-42CD-969F-D48411E0B595(1).jpeg',
      'battle-pads': '08D2B271-8C9B-48C7-BEF3-28256D1519C6(1).jpeg', '2-in-1-pads': '738AF0EB-3B68-4A96-8C89-3CC9D191C8E4(1).jpeg',
    };
    expect(GEAR_ASSETS).toHaveLength(8);
    for (const g of GEAR_ASSETS) {
      expect(g.source, g.itemId).toBe(`gear/${want[g.itemId]}`);
      expect(sums[g.source], g.source).toBe(g.sha256);
      expect(sha(`public/${g.path}`), g.path).toBe(g.sha256);
    }
    expect(new Set(GEAR_ASSETS.map((g) => g.sha256)).size).toBe(8);
  });

  it('every LCPS team maps to its own supplied logo with identical bytes', () => {
    expect(LOGO_ASSETS).toHaveLength(17);
    for (const t of LCPS_TEAMS) {
      const a = LOGO_ASSETS.find((l) => l.teamId === t.id)!;
      expect(a, t.id).toBeTruthy();
      expect(t.logo).toBe(a.path);
      expect(existsSync(`public/${a.path}`)).toBe(true);
      expect(sha(`public/${a.path}`), t.id).toBe(sums[a.source]);
      expect(manifest.find((m) => m.id === t.id)?.localFile).toBe(a.source);
      expect(t.mascot, t.id).toBe(manifest.find((m) => m.id === t.id)?.mascot);
    }
    expect(new Set(LOGO_ASSETS.map((l) => l.sha256)).size).toBe(17);
    expect(LCPS_TEAMS.find((t) => t.id === 'loudoun-county')!.mascot).toBe('Captains');
  });
});

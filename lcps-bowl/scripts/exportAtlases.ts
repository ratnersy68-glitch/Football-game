// Exports the rig as transparent PNG atlases + JSON manifest (techpack export contract).
//   npx tsx scripts/exportAtlases.ts            → public/assets/sprites/
// Atlases: {build}_{dir}_body.png and item layers {itemId}_{build}_{dir}_helmet.png / _pads.png.
// One animation per row (row order = manifest.actions), six cells per row, unused cells transparent.
import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { ACTIONS, BUILDS, CELL, DIRS, ORIGIN } from '../src/gear/rig/spec';
import { rasterize, type Anchors } from '../src/gear/rig/raster';
import { demoLook } from '../src/gear/rig/demo';
import { CATALOG } from '../src/gear/catalog';

const OUT = process.argv[2] ?? 'public/assets/sprites';
mkdirSync(OUT, { recursive: true });
const COLS = 6;

const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function png(w: number, h: number, rgba: Uint8Array) {
  const chunk = (type: string, data: Buffer) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const anchorsOut: Record<string, Record<string, Anchors[]>> = {};
function atlas(file: string, render: (action: string, f: number) => { px: Uint8ClampedArray; anchors: Anchors }, keepAnchors?: string) {
  const W = COLS * CELL, H = ACTIONS.length * CELL;
  const img = new Uint8Array(W * H * 4);
  ACTIONS.forEach((a, row) => {
    for (let f = 0; f < a.frames; f++) {
      const fr = render(a.id, f);
      for (let y = 0; y < CELL; y++) img.set(fr.px.subarray(y * CELL * 4, (y + 1) * CELL * 4), ((row * CELL + y) * W + f * CELL) * 4);
      if (keepAnchors) ((anchorsOut[keepAnchors] ??= {})[a.id] ??= []).push(fr.anchors);
    }
  });
  writeFileSync(`${OUT}/${file}`, png(W, H, img));
  return file;
}

const files: string[] = [];
const base = demoLook('standard', 'standard', { visor: undefined });
for (const b of BUILDS) for (const d of DIRS) {
  files.push(atlas(`${b}_${d}_body.png`, (a, f) => rasterize(base, b, d, a as never, f, { layer: 'body', number: 7 }), `${b}_${d}`));
  for (const it of CATALOG.filter((i) => i.category === 'helmet' && !i.unlock)) {
    const look = demoLook(it.style!, 'standard', { visor: undefined });
    files.push(atlas(`${it.id}_${b}_${d}_helmet.png`, (a, f) => rasterize(look, b, d, a as never, f, { layer: 'helmet' })));
  }
  for (const it of CATALOG.filter((i) => i.category === 'pads')) {
    const look = demoLook('standard', it.style!);
    files.push(atlas(`${it.id}_${b}_${d}_pads.png`, (a, f) => rasterize(look, b, d, a as never, f, { layer: 'pads' })));
  }
}
// Neutral front / side / back previews for all three builds
const prev = new Uint8Array(3 * 3 * CELL * CELL * 4);
BUILDS.forEach((b, r) => (['toward', 'right', 'away'] as const).forEach((d, c) => {
  const fr = rasterize(demoLook(), b, d, 'idle', 0, { number: 7 });
  for (let y = 0; y < CELL; y++) prev.set(fr.px.subarray(y * CELL * 4, (y + 1) * CELL * 4), ((r * CELL + y) * 3 * CELL + c * CELL) * 4);
}));
writeFileSync(`${OUT}/neutral_previews.png`, png(3 * CELL, 3 * CELL, prev));

const manifest = {
  cell: { w: CELL, h: CELL }, origin: ORIGIN, columns: COLS, layout: 'one animation per row, frames left to right, unused cells transparent',
  depth: ['far limbs', 'body / pad silhouette', 'jersey / pants', 'near limbs / accessories', 'helmet', 'facemask / visor'],
  ball: 'independent sprite; attach to anchorsByFrame[].ball while possessed',
  builds: BUILDS, directions: DIRS,
  actions: ACTIONS.map((a, row) => ({ animationId: a.id, label: a.label, row, frameIndices: Array.from({ length: a.frames }, (_, i) => i), fps: a.fps, loop: a.loop, nextState: a.next, events: a.events, keys: a.keys })),
  anchorsByFrame: anchorsOut,
  files,
};
writeFileSync(`${OUT}/manifest.json`, JSON.stringify(manifest));
console.log(`wrote ${files.length + 1} PNG atlases + manifest.json to ${OUT}`);

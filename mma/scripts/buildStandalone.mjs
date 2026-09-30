// Builds ONE self-contained HTML file (JS + CSS inlined) that runs by double-clicking it — no server needed.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const res = await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  write: false,
  outdir: 'dist-standalone',
  loader: { '.css': 'css' },
});
const js = res.outputFiles.find((f) => f.path.endsWith('.js')).text;
const css = res.outputFiles.find((f) => f.path.endsWith('.css'))?.text ?? '';
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Octagon Fight Night</title>
<style>${css}</style>
</head>
<body>
<div id="app"></div>
<script>${js.replace(/<\/script/gi, '<\\/script')}</script>
</body>
</html>
`;
mkdirSync('dist-standalone', { recursive: true });
writeFileSync('dist-standalone/octagon-fight-night.html', html);
console.log(`dist-standalone/octagon-fight-night.html  ${(html.length / 1024).toFixed(0)} KB`);

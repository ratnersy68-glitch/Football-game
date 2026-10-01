// Builds ONE self-contained HTML file (JS + CSS inlined) that runs by double-clicking it — no server needed.
import { build } from 'esbuild';
import { mkdirSync, writeFileSync } from 'node:fs';

const res = await build({
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  charset: 'ascii',
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
<script>window.__OCT_SOURCE__ = null;</script>
<script>${js.replace(/<\/script/gi, '<\\/script')}</script>
<script>window.__OCT_SOURCE__ = document.documentElement.outerHTML;</script>
</body>
</html>
`;
mkdirSync('dist-standalone', { recursive: true });
writeFileSync('dist-standalone/octagon-fight-night.html', html);
console.log(`dist-standalone/octagon-fight-night.html  ${(html.length / 1024).toFixed(0)} KB`);

// Embed assets for Google Sites (served from the public GitHub repo through jsDelivr) + the paste-in file.
mkdirSync('embed', { recursive: true });
writeFileSync('embed/octagon.js', js);
writeFileSync('embed/octagon.css', css);
writeFileSync('embed/octagon-fight-night-google-sites.html', html);
const sha = process.argv[2];
if (sha) {
  const base = `https://cdn.jsdelivr.net/gh/ratnersy68-glitch/Football-game@${sha}/mma/embed`;
  const snippet = `<link rel="stylesheet" href="${base}/octagon.css">
<style>html,body{margin:0;height:100%;background:#07070a}</style>
<div id="app"></div>
<script src="${base}/octagon.js" charset="utf-8"></script>
<script>window.__OCT_SOURCE__=document.documentElement.outerHTML;</script>
`;
  writeFileSync('embed/EMBED_CODE.html', snippet);
  console.log(snippet);
}

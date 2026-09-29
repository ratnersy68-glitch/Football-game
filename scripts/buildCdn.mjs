/**
 * Builds stable-named game files into embed/ (committed) so they can be served from the public repo via
 * jsDelivr. The copy-paste embed snippet is written to embed/EMBED_CODE.html.
 * Run: npm run build:cdn  → commit + push → node scripts/buildCdn.mjs --snippet <commitSha>
 */
import { writeFileSync, mkdirSync, readdirSync, copyFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const shaArg = process.argv.indexOf('--snippet');
if (shaArg === -1) {
  execSync('npx vite build', { stdio: 'inherit' });
  mkdirSync('embed', { recursive: true });
  for (const f of readdirSync('dist/assets')) {
    if (f.endsWith('.js')) copyFileSync(`dist/assets/${f}`, 'embed/saturday26.js');
    if (f.endsWith('.css')) copyFileSync(`dist/assets/${f}`, 'embed/saturday26.css');
  }
  console.log('embed/saturday26.js + embed/saturday26.css written.');
} else {
  const sha = process.argv[shaArg + 1];
  const base = `https://cdn.jsdelivr.net/gh/ratnersy68-glitch/Football-game@${sha}/embed`;
  const snippet = `<link rel="stylesheet" href="${base}/saturday26.css">
<style>html,body{margin:0;min-height:100%;background:#07090e}</style>
<div id="root"></div>
<script type="module" src="${base}/saturday26.js"></script>
<script>window.__S26_SOURCE__=document.documentElement.outerHTML;</script>
`;
  writeFileSync('embed/EMBED_CODE.html', snippet);
  console.log(snippet);
}

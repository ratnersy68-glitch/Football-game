// Inlines the production build (dist/) into one self-contained HTML file for pasting into
// Google Sites (Insert → Embed → Embed code) or hosting anywhere as a single page.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const dist = 'dist';
let html = readFileSync(join(dist, 'index.html'), 'utf8');
html = html.replace(/<script type="module" crossorigin src="\.\/([^"]+)"><\/script>/g, (_, f) =>
  `<script type="module">${readFileSync(join(dist, f), 'utf8').replace(/<\/script/gi, '<\\/script')}</script>`);
html = html.replace(/<link rel="stylesheet" crossorigin href="\.\/([^"]+)">/g, (_, f) =>
  `<style>${readFileSync(join(dist, f), 'utf8')}</style>`);
if (/src="\.\/|href="\.\/assets/.test(html)) throw new Error('unresolved asset reference left in HTML');
mkdirSync('google-site', { recursive: true });
writeFileSync('google-site/summit.html', html);
console.log(`google-site/summit.html  ${(html.length / 1024).toFixed(0)} kB`);

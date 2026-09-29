/**
 * Builds ONE self-contained HTML file (JS + CSS inlined) for pasting into an "embed code" box
 * such as Google Sites. Run: npm run build:embed  →  dist-embed/saturday26-embed.html
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

execSync('npx vite build', { stdio: 'inherit' });
let html = readFileSync('dist/index.html', 'utf8');
const assets = readdirSync('dist/assets');
const js = assets.filter((f) => f.endsWith('.js'));
const css = assets.filter((f) => f.endsWith('.css'));
// Drop the external tags, then inline.
html = html.replace(/<script[^>]*src="[^"]*assets\/[^"]+\.js"[^>]*><\/script>/g, '');
html = html.replace(/<link[^>]*href="[^"]*assets\/[^"]+\.css"[^>]*>/g, '');
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '');
const styles = css.map((f) => `<style>${readFileSync(`dist/assets/${f}`, 'utf8')}</style>`).join('\n');
const escapeScript = (s) => s.replace(/<\/script/gi, '<\\/script');
const scripts = js.map((f) => `<script type="module">${escapeScript(readFileSync(`dist/assets/${f}`, 'utf8'))}</script>`).join('\n');
// Make the page fill its embed frame, and keep a copy of itself for "open in new tab".
const fill = `<style>html,body,#root{min-height:100%;}body{margin:0}</style>`;
const selfCopy = `<script>window.__S26_SOURCE__ = document.documentElement.outerHTML;</script>`;
html = html.replace('</head>', () => `${fill}\n${styles}\n</head>`);
html = html.replace('<div id="root"></div>', () => `<div id="root"></div>\n${scripts}\n${selfCopy}`);
mkdirSync('dist-embed', { recursive: true });
writeFileSync('dist-embed/saturday26-embed.html', html);
console.log(`dist-embed/saturday26-embed.html  ${(html.length / 1024).toFixed(0)} KB`);

/**
 * Baseball (DIAMOND '26) embed build for Google Sites.
 *   node scripts/buildBaseballEmbed.mjs            → embed/diamond26.js, .css, and a single-file embed/diamond26.html
 *   (commit + push)
 *   node scripts/buildBaseballEmbed.mjs --snippet <commitSha>  → embed/BASEBALL_EMBED_CODE.html (short snippet)
 */
import { writeFileSync, mkdirSync, readdirSync, readFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { build } from 'vite';

const repo = 'ratnersy68-glitch/Football-game';
const fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap">';
const shell = `<style>html,body{margin:0;height:100%;background:#07101f;overflow:hidden}#bb-status{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#cfd6e6;font:16px system-ui,sans-serif;padding:20px;line-height:1.5;z-index:5}#bb-fs{position:fixed;right:8px;bottom:8px;z-index:50;background:rgba(0,0,0,.55);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:6px;font:16px system-ui;padding:4px 9px;cursor:pointer}</style>
<div id="game-root"><div id="canvas-wrap"></div><div id="ui"></div></div>
<div id="bb-status">Loading DIAMOND '26… (click the game once it appears so it gets your keyboard)</div>
<button id="bb-fs" title="Full screen">⛶</button>`;
const fsScript = `document.getElementById('bb-fs').onclick=function(){var d=document.documentElement;if(document.fullscreenElement){document.exitFullscreen();}else if(d.requestFullscreen){d.requestFullscreen().catch(function(){window.open(location.href,'_blank');});}};
new MutationObserver(function(_, o){ if (document.querySelector('#canvas-wrap canvas')) { var s=document.getElementById('bb-status'); if (s) s.remove(); o.disconnect(); } }).observe(document.getElementById('canvas-wrap'), { childList: true });`;

const shaArg = process.argv.indexOf('--snippet');
if (shaArg === -1) {
  await build({
    configFile: false,
    root: process.cwd(),
    base: './',
    logLevel: 'warn',
    build: {
      outDir: 'dist-baseball',
      emptyOutDir: true,
      chunkSizeWarningLimit: 4000,
      rollupOptions: { input: resolve('baseball.html'), output: { inlineDynamicImports: true } },
    },
  });
  mkdirSync('embed', { recursive: true });
  let js = '', css = '';
  for (const f of readdirSync('dist-baseball/assets')) {
    if (f.endsWith('.js')) { copyFileSync(`dist-baseball/assets/${f}`, 'embed/diamond26.js'); js = readFileSync(`dist-baseball/assets/${f}`, 'utf8'); }
    if (f.endsWith('.css')) { copyFileSync(`dist-baseball/assets/${f}`, 'embed/diamond26.css'); css = readFileSync(`dist-baseball/assets/${f}`, 'utf8'); }
  }
  const single = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${fonts}<style>${css}</style></head><body>${shell}
<script>${fsScript}</script>
<script type="module">${js.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
  writeFileSync('embed/diamond26.html', single);
  console.log(`embed/diamond26.js (${(js.length / 1024).toFixed(0)} KB), embed/diamond26.css, embed/diamond26.html (${(single.length / 1024).toFixed(0)} KB) written.`);
} else {
  const sha = process.argv[shaArg + 1];
  const snippet = `${fonts}
${shell}
<script>
${fsScript}
(function () {
  var bases = [
    'https://cdn.jsdelivr.net/gh/${repo}@${sha}/embed/',
    'https://cdn.statically.io/gh/${repo}/${sha}/embed/',
    'https://rawcdn.githack.com/${repo}/${sha}/embed/'
  ];
  function say(m) { var el = document.getElementById('bb-status'); if (el) el.innerHTML = m; }
  window.addEventListener('error', function (e) { say('The game hit an error while starting:<br><code>' + (e.message || e) + '</code>'); });
  function attempt(i) {
    if (i >= bases.length) { say('Could not download the game files from any CDN.<br>Use the single-file version (embed/diamond26.html) instead.'); return; }
    if (i > 0) say('Loading DIAMOND \\'26… (trying mirror ' + (i + 1) + ')');
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = bases[i] + 'diamond26.css';
    css.onerror = function () { css.remove(); attempt(i + 1); };
    css.onload = function () {
      var js = document.createElement('script');
      js.type = 'module';
      js.src = bases[i] + 'diamond26.js';
      js.onerror = function () { js.remove(); css.remove(); attempt(i + 1); };
      document.body.appendChild(js);
    };
    document.head.appendChild(css);
  }
  attempt(0);
})();
</script>
`;
  writeFileSync('embed/BASEBALL_EMBED_CODE.html', snippet);
  console.log(snippet);
}

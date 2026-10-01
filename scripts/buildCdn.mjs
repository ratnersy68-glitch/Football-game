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
  const repo = 'ratnersy68-glitch/Football-game';
  // Three mirrors of the same commit: if one CDN is blocked or slow, the next is tried. Any load or
  // startup error is printed on screen instead of leaving a blank page.
  const snippet = `<style>html,body{margin:0;min-height:100%;background:#07090e}#s26-status{color:#cfd6e6;font:16px system-ui,sans-serif;text-align:center;padding:60px 20px;line-height:1.5}</style>
<div id="root"><div id="s26-status">Loading SATURDAY 26…</div></div>
<script>
(function () {
  window.__S26_SOURCE__ = document.documentElement.outerHTML;
  var bases = [
    'https://cdn.jsdelivr.net/gh/${repo}@${sha}/embed/',
    'https://cdn.statically.io/gh/${repo}/${sha}/embed/',
    'https://rawcdn.githack.com/${repo}/${sha}/embed/'
  ];
  function say(msg) { var el = document.getElementById('s26-status'); if (el) el.innerHTML = msg; }
  window.addEventListener('error', function (e) { say('The game hit an error while starting:<br><code>' + (e.message || e) + '</code>'); });
  window.addEventListener('unhandledrejection', function (e) { say('The game hit an error while starting:<br><code>' + ((e.reason && e.reason.message) || e.reason) + '</code>'); });
  function attempt(i) {
    if (i >= bases.length) {
      say('Could not download the game files from any CDN.<br>Your network (a school or work filter?) may block them.<br>Use the single-file version (embed/saturday26-code.txt) instead.');
      return;
    }
    if (i > 0) say('Loading SATURDAY 26… (trying mirror ' + (i + 1) + ')');
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = bases[i] + 'saturday26.css';
    css.onerror = function () { css.remove(); attempt(i + 1); };
    css.onload = function () {
      var js = document.createElement('script');
      js.type = 'module';
      js.src = bases[i] + 'saturday26.js';
      js.onerror = function () { js.remove(); css.remove(); attempt(i + 1); };
      document.body.appendChild(js);
    };
    document.head.appendChild(css);
  }
  attempt(0);
})();
</script>
`;
  writeFileSync('embed/EMBED_CODE.html', snippet);
  console.log(snippet);
}

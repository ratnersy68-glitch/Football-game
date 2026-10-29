// Cinematic rank reveal. A five-second sequence:
//  0–1s  fade to black, marble surfaces, an icy beam sweeps the screen
//  1–2s  metallic fragments drift toward the centre, a glowing ring draws itself
//  2–3s  fragments converge and the emblem assembles, lit from behind
//  3–4s  the emblem rotates, locks into place and emits a pulse
//  4–5s  rank title + progress toward the next rank
// The same system runs a shorter variant for milestones and PRs. Skippable; honours reduced motion.
import { RANKS } from '../engine/rank.js';
import { emblemSVG } from './emblems.js';
import { haptic, sound } from './feedback.js';
import { esc } from '../util.js';
import { store } from '../store.js';

const queue = [];
let running = false;

export function reducedMotion() {
  const m = store.state.prefs?.motion;
  if (m === 'reduced') return true;
  if (m === 'full') return false;
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Queue a reveal. Returns a promise that resolves when the user dismisses it. */
export function reveal(opts) {
  return new Promise((resolve) => {
    queue.push({ ...opts, resolve });
    if (!running) next();
  });
}

function next() {
  const item = queue.shift();
  if (!item) { running = false; return; }
  running = true;
  play(item).then(() => { item.resolve(); setTimeout(next, 250); });
}

function play(o) {
  return new Promise((resolve) => {
    const isRank = o.type === 'rank';
    const r = RANKS[o.rankIdx ?? 0] || RANKS[0];
    const reduce = reducedMotion();
    const el = document.createElement('div');
    el.className = `reveal ${isRank ? '' : 'milestone'}`;
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', o.title || r.name);
    const art = o.art || (isRank || o.rankIdx != null ? emblemSVG(o.rankIdx ?? 0) : '');
    el.innerHTML = `
      <div class="marble-layer"></div>
      <canvas></canvas>
      <button class="skip" data-r="skip">SKIP</button>
      <div class="stage">
        <div class="emblem-holder" style="${isRank ? '' : 'width:min(44vw,190px);height:min(44vw,190px)'}">${art}<div class="pulse"></div></div>
        <div class="title"><h1>${esc(o.title || r.name.toUpperCase())}</h1><p>${esc(o.subtitle || 'STRENGTH RANK ACHIEVED')}</p></div>
        ${o.progress ? `<div class="next"><div class="bar"><i style="width:0%"></i></div><small><span>${esc(o.progress.from || '')}</span><span>${esc(o.progress.label || '')}</span></small></div>` : ''}
        <div class="continue"><button class="btn" data-r="close">${esc(o.cta || 'Continue')}</button></div>
      </div>`;
    document.body.appendChild(el);
    document.documentElement.style.overflow = 'hidden';

    const $ = (s) => el.querySelector(s);
    const canvas = $('canvas'); const ctx = canvas.getContext('2d');
    const holder = $('.emblem-holder');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let W = 0; let H = 0;
    const size = () => { W = canvas.clientWidth; H = canvas.clientHeight; canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size();
    window.addEventListener('resize', size);

    const timers = [];
    const at = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));
    let raf = 0; let done = false;
    const t0 = performance.now();
    const dur = isRank ? 5000 : 2600;
    const scaleT = isRank ? 1 : 0.5;

    const metals = [r.c1, r.c2, '#B9E8FF', '#FFFFFF', '#78CFFF'];
    const N = isRank ? 90 : 36;
    const frags = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2; const d = 0.65 + Math.random() * 0.6;
      return { a, d, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 4, s: 4 + Math.random() * 10, c: metals[(Math.random() * metals.length) | 0], delay: Math.random() * 0.35 };
    });
    const ease = (t) => 1 - Math.pow(1 - Math.max(0, Math.min(1, t)), 3);

    function frame(now) {
      const t = (now - t0) / 1000 / scaleT;
      ctx.clearRect(0, 0, W, H);
      const hb = holder.getBoundingClientRect(); const cb = canvas.getBoundingClientRect();
      const cx = hb.left - cb.left + hb.width / 2; const cy = hb.top - cb.top + hb.height / 2;
      const R = hb.width * 0.48;
      // beam 0.2–1.4s
      if (t > 0.15 && t < 1.6) {
        const p = ease((t - 0.15) / 1.2);
        const x = -W * 0.2 + p * W * 1.4;
        const g = ctx.createLinearGradient(x - 160, 0, x + 160, 0);
        g.addColorStop(0, 'rgba(120,207,255,0)'); g.addColorStop(0.5, 'rgba(185,232,255,.85)'); g.addColorStop(1, 'rgba(120,207,255,0)');
        ctx.save(); ctx.translate(x, cy); ctx.rotate(-0.14); ctx.fillStyle = g; ctx.fillRect(-160, -1.5, 320, 3);
        ctx.globalAlpha = 0.25; ctx.fillRect(-160, -40, 320, 80); ctx.restore();
      }
      // light rays behind the emblem 2–5s
      if (t > 2) {
        const a = Math.min(1, (t - 2) / 0.8) * (isRank ? 0.5 : 0.35);
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.12);
        for (let i = 0; i < 14; i++) {
          ctx.rotate((Math.PI * 2) / 14);
          const g = ctx.createLinearGradient(0, 0, R * 2.6, 0);
          g.addColorStop(0, `rgba(185,232,255,${a})`); g.addColorStop(1, 'rgba(185,232,255,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * 2.6, -R * 0.12); ctx.lineTo(R * 2.6, R * 0.12); ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      // ring 1–2s
      if (t > 0.9) {
        const p = ease((t - 0.9) / 1.0);
        ctx.save(); ctx.strokeStyle = 'rgba(120,207,255,.9)'; ctx.lineWidth = 2; ctx.shadowColor = '#78CFFF'; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
        ctx.globalAlpha = 0.35; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, R * 1.38, Math.PI / 2, Math.PI / 2 + p * Math.PI * 2); ctx.stroke();
        ctx.restore();
      }
      // fragments 1–2.8s
      if (t > 0.9 && t < 3.1) {
        for (const f of frags) {
          const p = ease((t - 1 - f.delay) / 1.7);
          if (t - 1 - f.delay < 0) continue;
          const dist = (1 - p) * f.d * Math.max(W, H) * 0.6 + p * R * 0.15;
          const x = cx + Math.cos(f.a) * dist; const y = cy + Math.sin(f.a) * dist;
          ctx.save(); ctx.translate(x, y); ctx.rotate(f.rot + f.vr * t); ctx.globalAlpha = Math.min(1, (t - 1) * 2) * (1 - Math.max(0, (t - 2.6) / 0.5));
          ctx.fillStyle = f.c; ctx.shadowColor = '#78CFFF'; ctx.shadowBlur = 6;
          ctx.beginPath(); ctx.moveTo(0, -f.s); ctx.lineTo(f.s * 0.8, f.s * 0.6); ctx.lineTo(-f.s * 0.7, f.s * 0.5); ctx.closePath(); ctx.fill(); ctx.restore();
        }
      }
      if (!done) raf = requestAnimationFrame(frame);
    }

    function finishState() {
      $('.marble-layer').classList.add('on');
      $('.emblem-holder').classList.add('on');
      $('.title').classList.add('on');
      const nx = $('.next'); if (nx) { nx.classList.add('on'); nx.querySelector('i').style.width = `${Math.round((o.progress.pct || 0) * 100)}%`; }
      $('.continue').classList.add('on');
      $('.skip').style.display = 'none';
    }

    if (reduce) {
      finishState();
    } else {
      raf = requestAnimationFrame(frame);
      sound('whoosh');
      at(300 * scaleT, () => $('.marble-layer').classList.add('on'));
      at(1000 * scaleT, () => { sound('assemble'); haptic('tap'); });
      at(2200 * scaleT, () => $('.emblem-holder').classList.add('on'));
      at(3200 * scaleT, () => { const h = $('.emblem-holder'); h.classList.add('lock'); $('.pulse').classList.add('go'); sound('lock'); haptic(isRank ? 'rank' : 'success'); });
      at(4000 * scaleT, () => { $('.title').classList.add('on'); sound('reveal'); });
      at(4500 * scaleT, () => { const nx = $('.next'); if (nx) { nx.classList.add('on'); requestAnimationFrame(() => { nx.querySelector('i').style.width = `${Math.round((o.progress.pct || 0) * 100)}%`; }); } });
      at(dur, () => { $('.continue').classList.add('on'); $('.skip').style.display = 'none'; });
    }

    function close() {
      done = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
      window.removeEventListener('resize', size);
      el.style.transition = 'opacity .45s ease'; el.style.opacity = '0';
      setTimeout(() => { el.remove(); document.documentElement.style.overflow = ''; resolve(); }, reduce ? 0 : 450);
    }
    el.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-r]');
      if (!b) return;
      if (b.dataset.r === 'skip') { timers.forEach(clearTimeout); finishState(); }
      if (b.dataset.r === 'close') close();
    });
    el.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') close(); });
    setTimeout(() => $('[data-r="skip"]').focus?.(), 50);
  });
}

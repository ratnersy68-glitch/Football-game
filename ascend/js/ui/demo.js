// Exercise demonstrations: thumbnails and a full-screen-capable player that opens over any
// screen (including a live workout) without re-rendering or interrupting it.
//
// Sources, in order of preference:
//  1. A video the user attached to the exercise (file stored on-device, or a link they trust)
//  2. The bundled public-domain photo sequence (real person, start ↔ finish), clearly labelled
//     as a photo sequence because no licensed video is bundled
//  3. Written instructions, labelled "demonstration unavailable"
import { store, update } from '../store.js';
import * as db from '../db.js';
import { getExercise, PATTERNS, EQUIPMENT } from '../data/exercises.js';
import { demoFor, MEDIA_CREDIT, MEDIA_SOURCE_URL } from '../data/media.js';
import { formFor } from '../data/form.js';
import { icon } from './icons.js';
import { reducedMotion } from './reveal.js';
import { haptic } from './feedback.js';
import { esc, cap, uid } from '../util.js';

const MAX_VIDEO_MB = 250;
const blobUrls = new Map(); // videoId → object URL, kept for the session so reopening is instant

const play = '<span class="demo-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5z"/></svg></span>';

export function hasDemo(exId) {
  return !!(store.state.videos?.[exId] || demoFor(exId));
}

/** Small tappable thumbnail with an ice-blue play button. */
export function demoThumb(exId, { size = 'sm', label = '', tag = 'button' } = {}) {
  const ex = getExercise(exId, store.state.customExercises);
  const d = demoFor(exId);
  const own = store.state.videos?.[exId];
  const inner = d
    ? `<img src="${d.thumb}" alt="" loading="lazy" decoding="async" width="280" height="187">`
    : `<span class="demo-initials">${esc((ex?.name || '?').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase())}</span>`;
  const attrs = tag === 'button' ? ` data-action="demo-open" data-ex="${esc(exId)}" aria-label="Watch ${esc(ex?.name || 'exercise')} demonstration"` : ' aria-hidden="true"';
  return `<${tag} class="demo-thumb ${size} ${d || own ? '' : 'none'}"${attrs}>${inner}${play}${own ? '<span class="demo-badge">VIDEO</span>' : ''}${label ? `<span class="demo-label">${label}</span>` : ''}</${tag}>`;
}

function youtubeId(url) {
  const m = String(url).match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function steps(ex) {
  const cues = ex?.cues || [];
  return {
    how: cues.filter((c) => !/^(weight entered|log )/i.test(c)),
    notes: cues.filter((c) => /^(weight entered|log )/i.test(c)),
  };
}

let root = null;
let current = null;

function stageHtml(exId) {
  const own = store.state.videos?.[exId];
  const d = demoFor(exId);
  if (own?.kind === 'url') {
    const yt = youtubeId(own.url);
    if (yt) {
      return { kind: 'video', label: 'Your video · link', html: `<iframe class="demo-media" src="https://www.youtube-nocookie.com/embed/${yt}?autoplay=1&mute=1&loop=1&playlist=${yt}&playsinline=1&controls=1&modestbranding=1&rel=0" title="Exercise demonstration" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>` };
    }
    return { kind: 'video', label: 'Your video · link', html: `<video class="demo-media" src="${esc(own.url)}" muted loop playsinline autoplay preload="metadata"></video>` };
  }
  if (own?.kind === 'file') {
    return { kind: 'video', label: 'Your video', html: '<video class="demo-media" muted loop playsinline autoplay preload="auto" data-own="1"></video>' };
  }
  if (d) {
    return { kind: 'photos', label: 'No video · photo sequence', html: `<div class="demo-seq ${reducedMotion() ? 'slow' : ''}">
      <img src="${d.frames[0]}" alt="Start position" decoding="async"><img class="b" src="${d.frames[1]}" alt="Finish position" decoding="async">
      <span class="demo-phase a">START</span><span class="demo-phase b">FINISH</span></div>` };
  }
  const ex = getExercise(exId, store.state.customExercises);
  return { kind: 'none', label: 'Demonstration unavailable', html: `<div class="demo-none marble"><div class="demo-none-ico">${icon('train')}</div><div class="h3">${esc(ex?.name || '')}</div><p class="small muted">No demonstration is bundled for this exact variation. Follow the steps below, or add a video you trust.</p></div>` };
}

function infoHtml(exId) {
  const st = store.state;
  const ex = getExercise(exId, st.customExercises);
  const f = formFor(exId);
  const { how, notes } = steps(ex);
  const own = st.videos?.[exId];
  const d = demoFor(exId);
  const list = (arr, cls = '') => `<ol class="demo-list ${cls}">${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
  return `
    <div class="demo-name">${esc((ex?.name || '').toUpperCase())}</div>
    <div class="demo-muscles">
      <div><span class="eyebrow">Primary muscles</span><p>${esc(cap((ex?.muscles || []).join(', ')) || '—')}</p></div>
      <div><span class="eyebrow">Secondary muscles</span><p>${esc(cap((ex?.secondary || []).join(', ')) || '—')}</p></div>
      <div><span class="eyebrow">Equipment</span><p>${esc(ex?.needs?.length ? ex.needs.map((n) => EQUIPMENT.find((e) => e.id === n)?.label).join(', ') : 'None')}</p></div>
      <div><span class="eyebrow">Pattern</span><p>${esc(PATTERNS[ex?.pattern] || '—')}</p></div>
    </div>
    ${how.length ? `<div class="eyebrow mt-24">How to perform</div>${list(how)}` : ''}
    ${f ? `<div class="eyebrow mt-24">Common mistakes</div>${list(f.mistakes, 'x')}<div class="eyebrow mt-24">Form tips</div>${list(f.tips, 'tick')}` : ''}
    ${notes.length ? `<p class="tiny faint mt-16">${esc(notes.join(' '))}</p>` : ''}
    <div class="demo-own">
      <div class="row between"><div><div class="h3">${own ? 'Your demonstration video' : 'Add a demonstration video'}</div>
        <div class="tiny faint">${own ? (own.kind === 'file' ? `${esc(own.name || 'Video file')} · stored on this device` : esc(own.url)) : 'Attach a clip from your camera roll or paste a link to a demo you trust. It plays here, muted and looping.'}</div></div></div>
      <div class="row wrap mt-16">
        <button class="btn xs ghost" data-d="file">${icon('upload', 'sm')} ${own?.kind === 'file' ? 'Replace file' : 'Choose video file'}</button>
        <button class="btn xs ghost" data-d="link">${icon('edit', 'sm')} ${own?.kind === 'url' ? 'Change link' : 'Paste link'}</button>
        ${own ? `<button class="btn xs danger" data-d="remove">${icon('trash', 'sm')} Remove</button>` : ''}
      </div>
      <div class="demo-link hide"><input id="demo-url" class="input mt-16" type="url" inputmode="url" placeholder="https://… (.mp4, .webm, .mov or YouTube)" autocomplete="off"><div class="row mt-8"><button class="btn xs primary" data-d="link-save">Save link</button><button class="btn xs ghost" data-d="link-cancel">Cancel</button></div></div>
      <input type="file" accept="video/*" class="hide" data-d-file>
    </div>
    ${d ? `<p class="tiny faint mt-16">${esc(MEDIA_CREDIT)} · <a href="${MEDIA_SOURCE_URL}" target="_blank" rel="noopener">source</a>. No licensed video is bundled with ASCEND, so built-in demonstrations are real-person photo sequences of the start and finish positions.</p>` : ''}`;
}

async function attachOwnVideo(exId) {
  const own = store.state.videos?.[exId];
  const v = root?.querySelector('video[data-own]');
  if (!v || own?.kind !== 'file') return;
  let url = blobUrls.get(own.id);
  if (!url) {
    const rec = await db.getVideo(own.id);
    if (!rec?.blob) { v.replaceWith(Object.assign(document.createElement('p'), { className: 'small muted demo-missing', textContent: 'This video file is no longer stored on this device. Choose it again below.' })); return; }
    url = URL.createObjectURL(rec.blob);
    blobUrls.set(own.id, url);
  }
  v.src = url;
  v.play().catch(() => { /* autoplay blocked until a tap; controls handle it */ });
}

function render() {
  if (!root || !current) return;
  const s = stageHtml(current);
  root.querySelector('.demo-stage').innerHTML = s.html;
  root.querySelector('.demo-stage').dataset.kind = s.kind;
  root.querySelector('.demo-chip').textContent = s.label.toUpperCase();
  root.querySelector('.demo-chip').className = `demo-chip ${s.kind}`;
  root.querySelector('.demo-info').innerHTML = infoHtml(current);
  root.querySelector('[data-d="pause"]').classList.toggle('hide', s.kind === 'none' || /iframe/.test(s.html));
  root.querySelector('[data-d="fs"]').classList.toggle('hide', s.kind === 'none');
  setPaused(false);
  attachOwnVideo(current);
}

function setPaused(p) {
  if (!root) return;
  root.classList.toggle('paused', p);
  const v = root.querySelector('video');
  if (v) { if (p) v.pause(); else v.play().catch(() => {}); }
  const b = root.querySelector('[data-d="pause"]');
  if (b) { b.innerHTML = icon(p ? 'play' : 'pause', 'sm'); b.setAttribute('aria-label', p ? 'Play' : 'Pause'); }
}

function toggleFullscreen() {
  const stage = root.querySelector('.demo-stage');
  const v = stage.querySelector('video');
  const doc = document;
  if (doc.fullscreenElement || doc.webkitFullscreenElement) { (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc); return; }
  if (root.classList.contains('pseudo-fs')) { root.classList.remove('pseudo-fs'); return; }
  const req = stage.requestFullscreen || stage.webkitRequestFullscreen;
  if (req) { req.call(stage).catch?.(() => root.classList.add('pseudo-fs')); return; }
  if (v?.webkitEnterFullscreen) { v.webkitEnterFullscreen(); return; } // iPhone Safari: native video player
  root.classList.add('pseudo-fs'); // photo sequences on iPhone: fill the screen inside the app
}

export function closeDemo() {
  if (!root) return;
  const el = root; root = null; current = null;
  document.removeEventListener('keydown', onKey);
  el.querySelectorAll('video').forEach((v) => v.pause());
  el.classList.add('closing');
  setTimeout(() => el.remove(), reducedMotion() ? 0 : 260);
}

function onKey(e) { if (e.key === 'Escape') closeDemo(); }

export function openDemo(exId) {
  if (root) closeDemo();
  current = exId;
  haptic('tap');
  root = document.createElement('div');
  root.className = 'demo';
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.setAttribute('aria-label', `${getExercise(exId, store.state.customExercises)?.name || 'Exercise'} demonstration`);
  root.innerHTML = `<div class="demo-scrim" data-d="close"></div>
    <div class="demo-panel">
      <div class="demo-top"><span class="demo-chip"></span><div class="row" style="gap:6px"><button class="icon-btn sm" data-d="pause" aria-label="Pause"></button><button class="icon-btn sm" data-d="fs" aria-label="Full screen"><svg class="icon sm" viewBox="0 0 24 24"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button><button class="icon-btn sm" data-d="close" aria-label="Close demonstration">${icon('x', 'sm')}</button></div></div>
      <div class="demo-stage"></div>
      <div class="demo-info"></div>
    </div>`;
  document.body.appendChild(root);
  document.addEventListener('keydown', onKey);
  root.addEventListener('click', onClick);
  root.addEventListener('change', onChange);
  render();
  setTimeout(() => root?.querySelector('[data-d="close"].icon-btn')?.focus({ preventScroll: true }), 50);
}

async function onClick(e) {
  const b = e.target.closest('[data-d]');
  if (!b || !root) return;
  const exId = current;
  switch (b.dataset.d) {
    case 'close': closeDemo(); break;
    case 'pause': setPaused(!root.classList.contains('paused')); break;
    case 'fs': toggleFullscreen(); break;
    case 'file': root.querySelector('[data-d-file]').click(); break;
    case 'link': root.querySelector('.demo-link').classList.remove('hide'); root.querySelector('#demo-url').value = store.state.videos?.[exId]?.url || ''; root.querySelector('#demo-url').focus(); break;
    case 'link-cancel': root.querySelector('.demo-link').classList.add('hide'); break;
    case 'link-save': {
      const raw = root.querySelector('#demo-url').value.trim();
      let ok = false; try { const u = new URL(raw); ok = u.protocol === 'https:' || u.protocol === 'http:'; } catch { ok = false; }
      if (!ok) { root.querySelector('#demo-url').classList.add('invalid'); return; }
      await removeOwn(exId);
      update((s) => { s.videos[exId] = { kind: 'url', url: raw, addedAt: new Date().toISOString() }; });
      render();
      break;
    }
    case 'remove': await removeOwn(exId); update((s) => { delete s.videos[exId]; }); render(); break;
    default: break;
  }
}

async function removeOwn(exId) {
  const own = store.state.videos?.[exId];
  if (own?.kind === 'file') {
    await db.deleteVideo(own.id);
    const u = blobUrls.get(own.id); if (u) { URL.revokeObjectURL(u); blobUrls.delete(own.id); }
  }
}

async function onChange(e) {
  if (!e.target.matches('[data-d-file]')) return;
  const f = e.target.files?.[0];
  const exId = current;
  if (!f || !root) return;
  const info = root.querySelector('.demo-own .tiny');
  if (!f.type.startsWith('video/')) { info.textContent = 'That file isn\'t a video. Choose an .mp4, .mov or .webm file.'; return; }
  if (f.size > MAX_VIDEO_MB * 1024 * 1024) { info.textContent = `That video is over ${MAX_VIDEO_MB} MB. Trim it to a few reps and try again.`; return; }
  info.textContent = 'Saving…';
  try {
    await removeOwn(exId);
    const id = uid('v');
    await db.putVideo({ id, exId, blob: f, type: f.type, addedAt: new Date().toISOString() });
    update((s) => { s.videos[exId] = { kind: 'file', id, name: f.name, size: f.size, addedAt: new Date().toISOString() }; });
    if (current === exId) render();
  } catch {
    info.textContent = 'Couldn\'t store that video on this device — storage may be full.';
  }
}

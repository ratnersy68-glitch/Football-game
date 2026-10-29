// Small reusable view helpers that return HTML strings.
import { esc } from '../util.js';
import { icon } from './icons.js';

export function ring(pct, { size = 180, stroke = 12, center = '', track = 'var(--surface-2)', cls = '' } = {}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(1, pct || 0)));
  return `<div class="ring ${cls}" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}">
      <defs><linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--accent-soft)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient></defs>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${track}" stroke-width="${stroke}" fill="none"/>
      <circle class="ring-fg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="url(#ringGrad)" stroke-width="${stroke}" fill="none"
        stroke-linecap="round" stroke-dasharray="${c.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" data-off="${off.toFixed(2)}"/>
    </svg>
    <div class="ring-center">${center}</div>
  </div>`;
}

export const bar = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${Math.round(Math.max(0, Math.min(1, pct || 0)) * 1000) / 10}%"></i></div>`;

export function seg(options, value, action, { full = false, attr = '' } = {}) {
  return `<div class="seg ${full ? 'full' : ''}" role="tablist">${options.map((o) => {
    const v = typeof o === 'object' ? o.id : o; const l = typeof o === 'object' ? o.label : o;
    return `<button role="tab" class="${String(v) === String(value) ? 'on' : ''}" data-action="${action}" data-value="${esc(v)}" ${attr}>${esc(l)}</button>`;
  }).join('')}</div>`;
}

export const toggle = (on, action, attrs = '') => `<button class="toggle ${on ? 'on' : ''}" role="switch" aria-checked="${!!on}" data-action="${action}" ${attrs}></button>`;

export function empty(ic, title, body = '', cta = '') {
  return `<div class="empty">${icon(ic)}<div class="h3" style="color:var(--text)">${esc(title)}</div>${body ? `<p class="small mt-8">${body}</p>` : ''}${cta ? `<div class="mt-16">${cta}</div>` : ''}</div>`;
}

export function sheetFrame(title, body, { sub = '', close = true } = {}) {
  return `<div class="grab"></div><div class="sheet-head"><div><div class="h2">${esc(title)}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${close ? `<button class="icon-btn sm" data-action="sheet-close" aria-label="Close">${icon('x', 'sm')}</button>` : ''}</div>${body}`;
}

export function stepper(value, action, attrs = '', display = value) {
  return `<div class="stepper"><button class="icon-btn" data-action="${action}" data-delta="-1" ${attrs} aria-label="Decrease">${icon('minus')}</button>
    <div class="val num">${display}</div><button class="icon-btn" data-action="${action}" data-delta="1" ${attrs} aria-label="Increase">${icon('plus')}</button></div>`;
}

export function option(label, sub, on, action, attrs = '') {
  return `<button class="option ${on ? 'on' : ''}" data-action="${action}" ${attrs}><div class="grow"><div class="h3">${label}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div><span class="check"></span></button>`;
}

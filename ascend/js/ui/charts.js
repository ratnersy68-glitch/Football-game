// Lightweight interactive SVG charts (no dependencies). Tooltips follow the pointer.
import { esc, fmtDate } from '../util.js';

const W = 640; const H = 260; const PAD = { l: 62, r: 16, t: 18, b: 36 };

function niceTicks(min, max, n = 4) {
  if (min === max) { min -= 1; max += 1; }
  const span = max - min;
  const step0 = span / n;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= step0) || step0;
  const lo = Math.floor(min / step) * step; const hi = Math.ceil(max / step) * step;
  const out = []; for (let v = lo; v <= hi + step / 2; v += step) out.push(+v.toFixed(6));
  return out;
}

/**
 * series: [{x: Date, y: number}] ; opts: fmtY(v) → label, tip(pt) → label, goal (y), height
 */
export function lineChart(series, { fmtY = (v) => Math.round(v), tip, goal, height = H, area = true } = {}) {
  if (!series.length) return '';
  const h = height;
  const xs = series.map((p) => +p.x); const ys = series.map((p) => p.y);
  if (goal != null) ys.push(goal);
  let x0 = Math.min(...xs); let x1 = Math.max(...xs);
  if (x0 === x1) { x0 -= 86400000 * 3; x1 += 86400000 * 3; }
  const pad = (Math.max(...ys) - Math.min(...ys)) * 0.12 || Math.max(...ys) * 0.1 || 1;
  const ticks = niceTicks(Math.min(...ys) - pad, Math.max(...ys) + pad);
  const y0 = ticks[0]; const y1 = ticks[ticks.length - 1];
  const sx = (x) => PAD.l + ((x - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);
  const sy = (y) => PAD.t + (1 - (y - y0) / (y1 - y0)) * (h - PAD.t - PAD.b);
  const P = series.map((p) => [sx(+p.x), sy(p.y)]);
  const d = P.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const areaD = `${d} L${P[P.length - 1][0].toFixed(1)} ${h - PAD.b} L${P[0][0].toFixed(1)} ${h - PAD.b} Z`;
  const grid = ticks.map((t) => `<line class="grid-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${sy(t)}" y2="${sy(t)}"/><text class="axis-label" x="${PAD.l - 8}" y="${sy(t) + 3}" text-anchor="end">${esc(fmtY(t))}</text>`).join('');
  const nx = Math.min(4, series.length);
  const xl = Array.from({ length: nx }, (_, i) => { const x = x0 + ((x1 - x0) * i) / Math.max(1, nx - 1); return `<text class="axis-label" x="${sx(x)}" y="${h - 8}" text-anchor="${i === 0 ? 'start' : i === nx - 1 ? 'end' : 'middle'}">${esc(fmtDate(x))}</text>`; }).join('');
  const dots = series.length <= 40 ? P.map((p) => `<circle class="pt" cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.2"/>`).join('') : '';
  const goalLine = goal != null ? `<line class="goal-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${sy(goal)}" y2="${sy(goal)}"/><text class="axis-label" x="${W - PAD.r}" y="${sy(goal) - 5}" text-anchor="end">Target</text>` : '';
  const data = series.map((p, i) => [+(P[i][0] / W).toFixed(4), +(P[i][1] / h).toFixed(4), tip ? tip(p) : `${fmtY(p.y)} · ${fmtDate(p.x)}`]);
  return `<div class="chart-wrap" data-chart='${esc(JSON.stringify(data))}'>
    <svg class="chart" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="aspect-ratio:${W}/${h}">
      <defs><linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".22"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
      ${grid}${xl}${goalLine}${area ? `<path class="area" d="${areaD}"/>` : ''}<path class="line" d="${d}"/>${dots}
      <line class="cursor" x1="0" x2="0" y1="${PAD.t}" y2="${h - PAD.b}" style="display:none"/>
    </svg></div>`;
}

/** series: [{x: Date|label, y, hit?, label?}] */
export function barChart(series, { fmtY = (v) => Math.round(v), tip, height = 230, target } = {}) {
  if (!series.length) return '';
  const h = height;
  const max = Math.max(...series.map((p) => p.y), target || 0, 1);
  const ticks = niceTicks(0, max, 3);
  const y1 = ticks[ticks.length - 1];
  const sy = (y) => PAD.t + (1 - y / y1) * (h - PAD.t - PAD.b);
  const bw = (W - PAD.l - PAD.r) / series.length;
  const grid = ticks.map((t) => `<line class="grid-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${sy(t)}" y2="${sy(t)}"/><text class="axis-label" x="${PAD.l - 8}" y="${sy(t) + 3}" text-anchor="end">${esc(fmtY(t))}</text>`).join('');
  const bars = series.map((p, i) => {
    const x = PAD.l + i * bw + bw * 0.18; const w = Math.max(2, bw * 0.64);
    const y = sy(p.y); const hh = Math.max(p.y > 0 ? 2 : 0, h - PAD.b - y);
    return `<rect class="bar-r ${p.hit ? 'hit' : ''}" x="${x.toFixed(1)}" y="${(h - PAD.b - hh).toFixed(1)}" width="${w.toFixed(1)}" height="${hh.toFixed(1)}" rx="${Math.min(5, w / 2).toFixed(1)}"/>`;
  }).join('');
  const every = Math.ceil(series.length / 6);
  const xl = series.map((p, i) => (i % every === 0 ? `<text class="axis-label" x="${(PAD.l + i * bw + bw / 2).toFixed(1)}" y="${h - 8}" text-anchor="middle">${esc(p.label || fmtDate(p.x))}</text>` : '')).join('');
  const tl = target ? `<line class="goal-line" x1="${PAD.l}" x2="${W - PAD.r}" y1="${sy(target)}" y2="${sy(target)}"/>` : '';
  const data = series.map((p, i) => [+((PAD.l + i * bw + bw / 2) / W).toFixed(4), +(sy(p.y) / h).toFixed(4), tip ? tip(p) : `${fmtY(p.y)}`]);
  return `<div class="chart-wrap" data-chart='${esc(JSON.stringify(data))}'>
    <svg class="chart" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" style="aspect-ratio:${W}/${h}">${grid}${tl}${bars}${xl}
    <line class="cursor" x1="0" x2="0" y1="${PAD.t}" y2="${h - PAD.b}" style="display:none"/></svg></div>`;
}

/** Attach pointer tooltips to every chart inside root. */
export function mountCharts(root) {
  root.querySelectorAll('.chart-wrap[data-chart]').forEach((wrap) => {
    if (wrap._mounted) return; wrap._mounted = true;
    let data; try { data = JSON.parse(wrap.dataset.chart); } catch { return; }
    const svg = wrap.querySelector('svg'); const cursor = svg.querySelector('.cursor');
    const tipEl = document.createElement('div'); tipEl.className = 'chart-tip'; tipEl.style.display = 'none'; wrap.appendChild(tipEl);
    const move = (ev) => {
      const r = wrap.getBoundingClientRect();
      const fx = (ev.clientX - r.left) / r.width;
      let best = data[0]; for (const d of data) if (Math.abs(d[0] - fx) < Math.abs(best[0] - fx)) best = d;
      tipEl.style.display = 'block'; tipEl.textContent = best[2];
      tipEl.style.left = `${Math.min(Math.max(best[0] * r.width, 50), r.width - 50)}px`; tipEl.style.top = `${best[1] * r.height}px`;
      const vb = svg.viewBox.baseVal; cursor.setAttribute('x1', best[0] * vb.width); cursor.setAttribute('x2', best[0] * vb.width); cursor.style.display = '';
    };
    const leave = () => { tipEl.style.display = 'none'; cursor.style.display = 'none'; };
    wrap.addEventListener('pointermove', move); wrap.addEventListener('pointerdown', move); wrap.addEventListener('pointerleave', leave);
  });
}

import { app, register } from '../app.js';
import { icon } from '../ui/icons.js';
import { bar } from '../ui/components.js';
import { emblem } from '../ui/emblems.js';
import { reveal } from '../ui/reveal.js';
import { displayRank, RANKS, WEIGHTS, YOUTH_WEIGHTS, PLACEMENT_WORKOUTS } from '../engine/rank.js';
import { LEVEL_LABELS, MAX_SESSION_GAIN, MAX_E1RM_REPS } from '../engine/strength.js';
import { getExercise } from '../data/exercises.js';
import { esc, fmtWeight, fmtDate } from '../util.js';

function patternRow(p, unit, custom) {
  const max = p.bands[4] * 1.15;
  const ticks = p.bands.map((b) => `<span class="tick" style="left:${(b / max) * 100}%"></span>`).join('');
  const fill = Math.min(1, p.ratio / max);
  const ex = p.exId ? getExercise(p.exId, custom) : null;
  return `<div class="pattern-row">
    <div><div class="h3">${esc(p.label)}</div><div class="tiny faint">${esc(p.ref)}</div></div>
    <div><div class="pattern-bands"><span class="fill" style="width:${fill * 100}%"></span>${ticks}</div>
      <div class="tiny faint mt-8">${p.trained ? `${esc(LEVEL_LABELS[p.level] || 'Developing')} · ${p.ratio.toFixed(2)}× BW · ≈${fmtWeight(p.eqKg, unit)}${ex && ex.id !== { squat: 'squat', deadlift: 'deadlift', bench: 'bench', ohp: 'ohp', pull: 'bb_row' }[p.id] ? ` via ${esc(ex.name)}` : ''}${p.capped ? ' · <span class="accent">verifying jump</span>' : ''}` : (p.feasible ? 'Not logged yet' : 'Not available with your equipment')}</div></div>
    <b class="num" style="text-align:right">${p.trained ? Math.round(p.score) : '—'}</b>
  </div>`;
}

function render() {
  const st = app.state;
  const dr = displayRank(st);
  const unit = st.profile.unit;
  const toNext = dr.next ? Math.max(0, dr.next.min - dr.rawScore) : 0;
  const hist = [...(st.rank.history || [])].reverse();
  const ladder = RANKS.slice(1).map((r, i) => {
    const idx = i + 1;
    return `<div class="rung ${idx <= dr.idx ? 'got' : ''} ${idx === dr.idx ? 'cur' : ''}">${emblem(idx)}<span>${esc(r.name)}</span><small>${r.min}+</small></div>`;
  }).join('');
  const w = dr.youth ? YOUTH_WEIGHTS : WEIGHTS;
  return `
    <div class="topbar"><span class="title">RANK</span><button class="icon-btn" data-action="rank-replay" aria-label="Replay rank reveal">${icon('play', 'sm')}</button></div>
    <div class="card marble rank-hero">
      <div class="eyebrow">${dr.youth ? 'Development rank' : 'Strength rank'}</div>
      ${emblem(dr.idx, { glow: true, float: true })}
      <div class="rank-name">${esc(dr.rank.name)}</div>
      ${dr.placed ? `<div class="muted">ASCEND score <b class="num" style="color:var(--text)">${dr.score.toFixed(1)}</b></div>` : `<div class="muted">Complete ${PLACEMENT_WORKOUTS} placement workouts to be ranked</div>`}
      <div style="max-width:380px;margin:18px auto 0">${bar(dr.progress, 'thick')}
        <div class="row between tiny mt-8 faint" style="font-weight:650;letter-spacing:.08em">${dr.placed
          ? (dr.next ? `<span>${esc(dr.rank.name.toUpperCase())}</span><span>${toNext.toFixed(1)} PTS TO ${esc(dr.next.name.toUpperCase())}</span>` : '<span>THE SUMMIT</span>')
          : `<span>PLACEMENT</span><span>${PLACEMENT_WORKOUTS - dr.placementLeft} / ${PLACEMENT_WORKOUTS}</span>`}</div></div>
    </div>

    <div class="desk-2 mt-16">
      <div class="stack" style="margin-top:0">
        <div class="card"><div class="eyebrow">Score breakdown</div>
          ${dr.components.map((c) => `<div class="mt-16"><div class="row between small"><span><b>${esc(c.label)}</b> <span class="faint">× ${c.weight}</span></span><span class="num">${c.value.toFixed(0)} <span class="faint">→ ${(c.value * c.weight).toFixed(1)}</span></span></div><div class="mt-8">${bar(c.value / 100)}</div></div>`).join('')}
          <p class="tiny faint mt-16">${dr.youth ? 'Under 18: ranked on consistency, personal improvement and technique milestones — never on adult strength standards.' : `Consistency counts workout days vs. your plan (${dr.consistency.done}/${dr.consistency.expected} recently) and is capped at 100%: extra sessions don't add score.`}</p>
        </div>
        ${dr.youth ? `<div class="card"><div class="eyebrow">Technique milestones</div>${dr.technique.list.map((m) => `<div class="row small" style="padding:7px 0;border-bottom:1px solid var(--line)"><span style="color:${m.done ? 'var(--accent-ink)' : 'var(--text-3)'}">${icon(m.done ? 'check' : 'minus', 'sm')}</span><span class="${m.done ? '' : 'muted'}">${esc(m.label)}</span></div>`).join('')}</div>`
          : `<div class="card"><div class="row between"><div class="eyebrow">Movement patterns</div><span class="tiny faint">score / 100</span></div>
          <div class="mt-8">${Object.values(dr.strength.patterns).map((p) => patternRow(p, unit, st.customExercises)).join('')}</div>
          <p class="tiny faint mt-8">Ticks mark Beginner · Novice · Intermediate · Advanced · Elite bands (${esc(st.profile.sexStandard === 'neutral' ? 'blended' : st.profile.sexStandard)} standards). Coverage ${dr.strength.trainedCount}/${dr.strength.feasibleCount} patterns.</p>
          ${dr.strength.flagged.length ? `<div class="banner mt-16">${icon('info')}<span>${dr.strength.flagged.length} entr${dr.strength.flagged.length === 1 ? 'y was' : 'ies were'} ignored as physically implausible. Check for typos in your history.</span></div>` : ''}</div>`}
      </div>
      <div class="stack" style="margin-top:0">
        <div class="card"><div class="eyebrow">The ladder</div><div class="ladder mt-16">${ladder}</div></div>
        <div class="card"><div class="eyebrow">Rank history</div>
          ${hist.length ? hist.map((h) => `<div class="list-row"><div style="width:40px;height:40px">${emblem(h.idx)}</div><div class="grow"><div class="h3">${esc(RANKS[h.idx].name)}</div><div class="small muted">${fmtDate(h.date, { month: 'long', day: 'numeric', year: 'numeric' })}</div></div><span class="small faint num">${h.score.toFixed(1)}</span></div>`).join('') : '<p class="small faint mt-8">Your promotions will be recorded here.</p>'}</div>
      </div>
    </div>

    <div class="card mt-16"><div class="eyebrow">How your rank is calculated</div>
      <p class="small muted mt-8">ASCEND ranks are a fictional, motivational ladder based only on what you log. They are <b>not</b> a scientifically validated strength classification, and they don't compare you to other people.</p>
      <details class="explain"><summary>1 · Estimated one-rep max</summary><div class="small muted mt-8">Each working set is converted to an estimated 1RM with the average of two widely used formulas:</div>
        <div class="formula mt-8">Epley    = w × (1 + r / 30)\nBrzycki  = w × 36 / (37 − r)\ne1RM     = (Epley + Brzycki) / 2\nr        = reps + reps in reserve (RIR = 10 − RPE)</div>
        <p class="small muted mt-8">Sets above ${MAX_E1RM_REPS} effective reps are excluded — the formulas become unreliable, so piling on high-rep "junk" sets can't raise your rank. Warm-ups never count.</p></details>
      <details class="explain"><summary>2 · Movement patterns</summary><p class="small muted mt-8">Rank-eligible exercises map to five patterns (squat, hinge, press, overhead, pull) using a fixed conversion factor to a reference lift — e.g. dumbbell bench press is scaled to a barbell-bench equivalent. Body-weight exercises include your body weight. Your best result per pattern from the last 180 days counts.</p></details>
      <details class="explain"><summary>3 · Relative strength</summary><p class="small muted mt-8">Each pattern's e1RM ÷ body weight is placed on approximate community strength-standard bands (Beginner → Elite) and mapped to 0–100. Strength = average of trained patterns × (0.6 + 0.4 × coverage), so training every pattern available to you matters.</p></details>
      <details class="explain"><summary>4 · Anti-inflation rules</summary><p class="small muted mt-8">• A single session can raise a pattern's verified strength by at most ${Math.round(MAX_SESSION_GAIN * 100)}%. Bigger jumps are confirmed by later sessions.<br>• Entries beyond plausible human limits are ignored and flagged.<br>• ${PLACEMENT_WORKOUTS} placement workouts are required before your first rank.<br>• Volume never adds score.</p></details>
      <details class="explain"><summary>5 · Final score</summary><div class="formula mt-8">${dr.youth ? `Score = ${YOUTH_WEIGHTS.consistency} × Consistency + ${YOUTH_WEIGHTS.improvement} × Improvement + ${YOUTH_WEIGHTS.technique} × Technique` : `Score = ${w.strength} × Strength + ${w.consistency} × Consistency + ${w.improvement} × Improvement`}\nImprovement: avg verified e1RM gain over 12 weeks (8% = 100)</div>
        <p class="small muted mt-8">Thresholds: ${RANKS.slice(1).map((r) => `${r.name} ${r.min}`).join(' · ')}. Ranks are earned — once reached, a rank is kept even through time off.</p></details>
    </div>`;
}

register('rank', { render, actions: {
  'rank-replay': () => {
    const dr = displayRank(app.state);
    reveal({ type: 'rank', rankIdx: dr.idx, title: dr.rank.name.toUpperCase(), subtitle: dr.idx ? (dr.youth ? 'DEVELOPMENT RANK' : 'STRENGTH RANK') : 'PLACEMENT IN PROGRESS',
      progress: dr.next ? { pct: dr.progress, from: dr.rank.name.toUpperCase(), label: `${Math.round(dr.progress * 100)}% TO ${dr.next.name.toUpperCase()}` } : null });
  },
} });

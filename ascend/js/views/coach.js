import { app, register, go, update, renderNow, toast, confirmSheet } from '../app.js';
import { icon } from '../ui/icons.js';
import { toggle } from '../ui/components.js';
import { avatarSVG } from '../ui/avatars.js';
import { reveal } from '../ui/reveal.js';
import { mountChat, refreshStatus, lastStatus } from '../ui/chat.js';
import { speak, stopSpeaking, canSpeak, systemVoices } from '../ui/voice.js';
import { PRESETS, SLIDERS, NAMES, PRESENTATIONS, VOICES, AVATARS, DEFAULT_COACH, presetById } from '../data/coaches.js';
import { esc, uid, relDay } from '../util.js';

const ai = () => app.state.aiCoach;
const STEPS = ['intro', 'personality', 'custom', 'identity', 'privacy'];

function draft() {
  if (!app.ui.cs) {
    const cur = ai().profile || DEFAULT_COACH;
    app.ui.cs = { step: 0, d: JSON.parse(JSON.stringify(cur)), customName: NAMES.includes(cur.name) ? '' : cur.name, consent: ai().prefs.consent };
  }
  return app.ui.cs;
}
const steps = () => STEPS.filter((s) => s !== 'custom' || draft().d.preset === 'custom');

function intensity(n) { return `<span class="intensity" aria-label="Intensity ${n} of 10">${Array.from({ length: 10 }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</span>`; }

function setupStep() {
  const cs = draft(); const d = cs.d;
  const list = steps(); const step = list[cs.step];
  if (step === 'intro') {
    return `<div class="card marble center" style="padding:44px 20px 32px;overflow:hidden">
      <div style="width:120px;height:120px;margin:0 auto">${avatarSVG('emblem', { size: 120 })}</div>
      <div class="eyebrow mt-24">AI Coach · powered by Google Gemini</div>
      <h1 class="h-display mt-8" style="font-size:clamp(32px,9vw,46px)">BUILD YOUR COACH</h1>
      <p class="muted mt-16">Your goals. Your personality. Your coach.</p>
      <div class="col mt-32" style="max-width:360px;margin-left:auto;margin-right:auto">
        <button class="btn primary hero block" data-action="cs-next"><span class="glint"></span>Begin</button>
        <button class="btn ghost block" data-action="cs-skip">Skip — use the default coach</button>
      </div></div>`;
  }
  let body = '';
  if (step === 'personality') {
    body = `<h1 class="ob-q">Choose your coach's personality</h1><div class="col mt-16">${PRESETS.map((p) => `<button class="persona-card ${d.preset === p.id ? 'on' : ''}" data-action="cs-preset" data-v="${p.id}">
      <div class="row between"><b class="h3">${esc(p.name.toUpperCase())}</b>${p.intensity ? `<span class="row" style="gap:8px"><span class="tiny faint">${p.intensity}/10</span>${intensity(p.intensity)}</span>` : '<span class="tag accent">Your rules</span>'}</div>
      <span class="small muted">${esc(p.blurb)}</span><q>${esc(p.example)}</q></button>`).join('')}</div>
      <p class="tiny faint mt-16">Even the strictest coach never encourages unsafe training, humiliation or ignoring pain.</p>`;
  } else if (step === 'custom') {
    body = `<h1 class="ob-q">Describe your ideal coach</h1>
      <textarea id="cs-desc" class="input mt-16" maxlength="400" placeholder="e.g. Straight-talking like a pro coach, with a dry sense of humour. Push me on consistency." data-input="cs-desc">${esc(d.description || '')}</textarea>
      ${SLIDERS.map((s) => `<div class="slider-row"><div class="row between"><span class="label">${s.label}</span><b class="num" id="sl-${s.id}">${d.sliders[s.id]}</b></div>
        <input type="range" min="1" max="10" step="1" value="${d.sliders[s.id]}" data-input="cs-slider" data-k="${s.id}" aria-label="${s.label}">
        <div class="row between tiny faint"><span>${s.lo}</span><span>${s.hi}</span></div></div>`).join('')}`;
  } else if (step === 'identity') {
    body = `<h1 class="ob-q">Coach identity</h1>
      <div class="label mt-16">Name</div><div class="chips mt-8">${NAMES.map((n) => `<button class="chip ${d.name === n && !cs.customName ? 'on' : ''}" data-action="cs-name" data-v="${n}">${n}</button>`).join('')}</div>
      <input class="input mt-8" id="cs-custom-name" maxlength="24" placeholder="Or type a custom name" value="${esc(cs.customName)}" data-input="cs-custom-name">
      <div class="label mt-24">Presentation</div><div class="seg full mt-8">${PRESENTATIONS.map((p) => `<button class="${d.presentation === p.id ? 'on' : ''}" data-action="cs-set" data-k="presentation" data-v="${p.id}">${p.label}</button>`).join('')}</div>
      <div class="label mt-24">Voice style</div><div class="col mt-8">${VOICES.map((v) => `<div class="row" style="gap:8px"><button class="option grow ${d.voice === v.id ? 'on' : ''}" data-action="cs-set" data-k="voice" data-v="${v.id}" style="padding:12px 14px"><div class="grow h3" style="font-size:14px">${v.label}</div><span class="check"></span></button>${canSpeak() ? `<button class="icon-btn" data-action="cs-preview" data-v="${v.id}" aria-label="Preview ${v.label}">${icon('play', 'sm')}</button>` : ''}</div>`).join('')}</div>
      <p class="tiny faint mt-8">${canSpeak() ? 'Spoken replies use your device’s built-in voices, shaped by this style. Gemini itself only writes text.' : 'This browser has no speech voices, so the coach will reply in text.'}</p>
      <div class="label mt-24">Avatar</div><div class="avatar-pick mt-8">${AVATARS.map((a) => `<button class="${d.avatar === a.id ? 'on' : ''}" data-action="cs-set" data-k="avatar" data-v="${a.id}" aria-label="${a.label}">${avatarSVG(a.id, { size: 64, glow: false })}</button>`).join('')}</div>`;
  } else if (step === 'privacy') {
    body = `<h1 class="ob-q">How your coach works</h1>
      <div class="card flat mt-16 stack">
        <p>Coach ${esc(cs.customName || d.name)} is powered by <b>Google Gemini</b>. To answer you, ASCEND sends Google:</p>
        <ul class="small" style="margin:0;padding-left:18px;line-height:1.6"><li>your message and the recent conversation</li><li>coach memories you’ve chosen to save</li><li>the relevant parts of your training data: profile basics (age, body weight, experience), goals, rank, plan, recent frequency and the history of the exercises you ask about</li></ul>
        <p class="small muted">Nothing is sent until you press send. Your full workout history stays on this device. You can delete the conversation and memories at any time in Coach settings.</p>
      </div>
      <button class="option mt-16 ${cs.consent ? 'on' : ''}" data-action="cs-consent"><div class="grow h3" style="font-size:14px">I understand and want to enable the AI coach</div><span class="check"></span></button>`;
  }
  const last = cs.step === list.length - 1;
  return `<div class="ob" style="min-height:auto;padding:0">
    <div class="row between" style="margin-bottom:14px"><button class="back" data-action="cs-back">${icon('back')} Back</button><span class="brand">BUILD YOUR COACH</span><span style="width:60px"></span></div>
    <div class="ob-progress">${list.slice(1).map((_, i) => `<i class="${i < cs.step ? 'on' : ''}"></i>`).join('')}</div>
    <div class="ob-body">${body}</div>
    <div class="ob-actions"><button class="btn primary block grow ${last ? 'hero' : ''}" data-action="${last ? 'cs-finish' : 'cs-next'}">${last ? '<span class="glint"></span>Meet your coach' : 'Continue'}</button></div></div>`;
}

async function finishSetup(skip = false) {
  const cs = draft();
  const d = skip ? JSON.parse(JSON.stringify(DEFAULT_COACH)) : cs.d;
  if (!skip && cs.customName.trim()) d.name = cs.customName.trim().slice(0, 24);
  if (d.preset !== 'custom') d.sliders = { ...presetById(d.preset).sliders };
  const firstTime = !ai().setupDone;
  update((s) => { s.aiCoach.profile = d; s.aiCoach.setupDone = true; if (!skip) s.aiCoach.prefs.consent = !!cs.consent; });
  app.ui.cs = null;
  if (!skip) {
    const p = presetById(d.preset);
    await reveal({ type: 'coach', art: avatarSVG(d.avatar, { size: 220 }), title: 'YOUR COACH IS READY.', subtitle: `COACH ${d.name.toUpperCase()}`, lines: [d.preset === 'custom' ? 'CUSTOM COACH' : p.short.toUpperCase()], cta: 'Start talking' });
  }
  if (!firstTime) toast('Coach updated');
  renderNow();
}

// ---------- chat page ----------
function renderCoach() {
  if (!ai().setupDone) return setupStep();
  return '<div class="coach-page" id="coach-chat"></div>';
}

// ---------- settings ----------
function renderSettings() {
  const a = ai(); const c = a.profile || DEFAULT_COACH; const p = presetById(c.preset);
  const st = lastStatus();
  const voices = systemVoices();
  const row = (label, sub, ctrl) => `<div class="list-row"><div class="grow"><div class="h3">${label}</div>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${ctrl}</div>`;
  return `<div class="topbar"><button class="back" data-action="cs-go-chat">${icon('back')} Coach</button><span class="title">COACH SETTINGS</span><span style="width:40px"></span></div>
    <div class="card row" style="gap:14px"><div style="width:64px;height:64px">${avatarSVG(c.avatar, { size: 64 })}</div><div class="grow"><div class="h2">Coach ${esc(c.name)}</div><div class="small muted">${esc(c.preset === 'custom' ? 'Custom coach' : p.name)} · ${esc(VOICES.find((v) => v.id === c.voice)?.label || '')}</div></div><button class="btn xs ghost" data-action="cs-rebuild">Change</button></div>
    <p class="tiny faint mt-8">Changing your coach keeps your workouts, goals, conversation and memories.</p>

    <div class="section-title"><span class="h2">Voice</span></div>
    <div class="card" style="padding:2px 16px">
      ${canSpeak() ? row('Speak replies aloud', 'Uses your device’s speech voices', toggle(a.prefs.speak, 'cs-pref', 'data-k="speak"')) : row('Spoken replies', 'Not supported in this browser — text chat works normally.', '')}
      ${canSpeak() && voices.length ? row('Device voice', '', `<select class="input" style="width:170px;height:40px" data-change="cs-sysvoice"><option value="">Auto (match coach)</option>${voices.map((v) => `<option value="${esc(v.voiceURI)}" ${a.prefs.systemVoice === v.voiceURI ? 'selected' : ''}>${esc(v.name)}</option>`).join('')}</select>`) : ''}
      ${canSpeak() ? row('Test voice', '', `<button class="btn xs ghost" data-action="cs-test-voice">${icon('play', 'sm')} Play</button>`) : ''}
    </div>

    <div class="section-title"><span class="h2">Proactive coaching</span></div>
    <div class="card" style="padding:2px 16px">
      ${row('Coach check-ins', 'Short messages after real events: a planned workout day, a PR, a missed session, a hard session. At most two a day.', toggle(a.prefs.nudges, 'cs-pref', 'data-k="nudges"'))}
      ${row('Device notifications', 'Also show check-ins as notifications when ASCEND is in the background (where supported).', toggle(a.prefs.notify, 'cs-notify'))}
    </div>

    <div class="section-title"><span class="h2">Coach memory</span><button class="btn xs ghost" data-action="cs-mem-add">${icon('plus', 'sm')} Add</button></div>
    <div class="card" style="padding:2px 16px">${a.memories.length ? a.memories.map((m) => `<div class="mem-row"><textarea rows="2" maxlength="300" data-change="cs-mem-edit" data-id="${m.id}" aria-label="Memory">${esc(m.text)}</textarea><button class="icon-btn sm" data-action="cs-mem-del" data-id="${m.id}" aria-label="Delete memory">${icon('trash', 'sm')}</button></div>`).join('') : '<p class="small faint" style="padding:14px 0">No memories yet. Tap “Remember” on any message, or add one here (e.g. “Left shoulder gets cranky with wide-grip bench”).</p>'}</div>
    <p class="tiny faint mt-8">Your coach only remembers what’s listed here, plus an automatic summary of older conversation${a.summary ? ` (${a.summary.length} characters, <button class="accent bold" data-action="cs-sum-del">delete summary</button>)` : ''}. Your saved goals and schedule are always read from ASCEND directly.</p>

    <div class="section-title"><span class="h2">Conversation</span></div>
    <div class="card" style="padding:2px 16px">${row(`${a.messages.length} messages`, a.messages.length ? `Last ${relDay(a.messages[a.messages.length - 1].ts)}` : 'Empty', `<button class="btn xs danger" data-action="cs-clear" ${a.messages.length ? '' : 'disabled'}>Clear</button>`)}</div>

    <div class="section-title"><span class="h2">Privacy & server</span></div>
    <div class="card stack">
      <p class="small">When you message your coach, your message, recent conversation, saved memories and the relevant parts of your training data are sent to Google’s Gemini API through the ASCEND server. The API key stays on the server and is never sent to your device.</p>
      <div class="row between"><span class="small">AI coach enabled</span>${toggle(a.prefs.consent, 'cs-pref', 'data-k="consent"')}</div>
      <div class="row between small"><span class="muted">Server status</span><b>${!st ? 'Checking…' : !st.reachable ? 'No server (static copy)' : st.configured ? `Connected · ${esc(st.model)}` : 'Running — no API key'}</b></div>
      ${st?.accessCodeRequired ? `<div class="field"><label for="cs-code">Access code</label><input id="cs-code" class="input" type="password" autocomplete="off" value="${esc(a.prefs.accessCode)}" data-change="cs-code"></div>` : ''}
      <button class="btn danger block" data-action="cs-reset">Delete coach, conversation & memories</button>
    </div>`;
}

let chatInstance = null;
register('coach', {
  render: renderCoach,
  mount(root) {
    chatInstance?.destroy();
    chatInstance = null;
    const el = root.querySelector('#coach-chat');
    if (el) chatInstance = mountChat(el, { mode: 'page', onSettings: () => go('coach', 'coach-settings') });
  },
  actions: {
    'cs-next': () => { const cs = draft(); cs.step = Math.min(steps().length - 1, cs.step + 1); renderNow(); window.scrollTo(0, 0); },
    'cs-back': () => { const cs = draft(); if (cs.step === 0) return; cs.step -= 1; renderNow(); },
    'cs-skip': () => finishSetup(true),
    'cs-finish': () => finishSetup(false),
    'cs-preset': (el) => { const d = draft().d; d.preset = el.dataset.v; d.sliders = { ...presetById(el.dataset.v).sliders }; const y = window.scrollY; renderNow(); window.scrollTo(0, y); },
    'cs-set': (el) => { draft().d[el.dataset.k] = el.dataset.v; const y = window.scrollY; renderNow(); window.scrollTo(0, y); },
    'cs-name': (el) => { const cs = draft(); cs.d.name = el.dataset.v; cs.customName = ''; const y = window.scrollY; renderNow(); window.scrollTo(0, y); },
    'cs-preview': (el) => { const d = draft().d; speak(presetById(d.preset).example, { ...d, voice: el.dataset.v }); },
    'cs-consent': () => { const cs = draft(); cs.consent = !cs.consent; renderNow(); },
  },
  inputs: {
    'cs-desc': (el) => { draft().d.description = el.value; },
    'cs-slider': (el) => { draft().d.sliders[el.dataset.k] = Number(el.value); const b = document.getElementById(`sl-${el.dataset.k}`); if (b) b.textContent = el.value; },
    'cs-custom-name': (el) => { draft().customName = el.value; },
  },
});

register('coach-settings', {
  tab: 'coach', render: renderSettings,
  mount() { if (!lastStatus()) refreshStatus().then(() => { if (app.route.view === 'coach-settings') renderNow(); }); },
  actions: {
    'cs-go-chat': () => go('coach'),
    'cs-rebuild': () => { app.ui.cs = null; draft().step = 1; update((s) => { s.aiCoach.setupDone = false; }); go('coach'); },
    'cs-pref': (el) => update((s) => { s.aiCoach.prefs[el.dataset.k] = !s.aiCoach.prefs[el.dataset.k]; if (el.dataset.k === 'speak' && !s.aiCoach.prefs.speak) stopSpeaking(); }),
    'cs-notify': async () => {
      const on = !ai().prefs.notify;
      if (on && 'Notification' in window && Notification.permission === 'default') { try { await Notification.requestPermission(); } catch { /* ignore */ } }
      if (on && (!('Notification' in window) || Notification.permission !== 'granted')) { toast('Notifications aren’t allowed in this browser'); return; }
      update((s) => { s.aiCoach.prefs.notify = on; });
    },
    'cs-test-voice': () => { const c = ai().profile || DEFAULT_COACH; speak(`I'm Coach ${c.name}. ${presetById(c.preset).example}`, c, { voiceURI: ai().prefs.systemVoice }); },
    'cs-mem-add': () => update((s) => { s.aiCoach.memories.unshift({ id: uid('mem'), text: 'New memory — tap to edit', createdAt: new Date().toISOString() }); }),
    'cs-mem-del': (el) => update((s) => { s.aiCoach.memories = s.aiCoach.memories.filter((m) => m.id !== el.dataset.id); }),
    'cs-sum-del': () => update((s) => { s.aiCoach.summary = ''; }),
    'cs-clear': async () => {
      if (!(await confirmSheet({ title: 'Clear conversation?', body: 'All messages and the conversation summary are deleted from this device. Saved memories are kept.', ok: 'Clear', danger: true }))) return;
      update((s) => { s.aiCoach.messages = []; s.aiCoach.summary = ''; s.aiCoach.summarizedCount = 0; s.aiCoach.unread = 0; });
      toast('Conversation cleared');
    },
    'cs-reset': async () => {
      if (!(await confirmSheet({ title: 'Delete your coach?', body: 'Removes the coach setup, conversation, summary and memories. Your workouts and goals are untouched.', ok: 'Delete', danger: true }))) return;
      update((s) => { s.aiCoach = { ...s.aiCoach, setupDone: false, profile: null, messages: [], summary: '', summarizedCount: 0, memories: [], unread: 0, prefs: { ...s.aiCoach.prefs, consent: false } }; });
      app.ui.cs = null; go('coach');
    },
  },
  inputs: {
    'cs-sysvoice': (el) => update((s) => { s.aiCoach.prefs.systemVoice = el.value; }),
    'cs-mem-edit': (el) => update((s) => { const m = s.aiCoach.memories.find((x) => x.id === el.dataset.id); if (m) { const t = el.value.trim(); if (t) m.text = t.slice(0, 300); else s.aiCoach.memories = s.aiCoach.memories.filter((x) => x.id !== m.id); } }),
    'cs-code': (el) => { update((s) => { s.aiCoach.prefs.accessCode = el.value.trim(); }); },
  },
});


// AI coach chat. One conversation, shown full-page on the Coach tab or as an overlay during a
// workout. Manages its own DOM (no app re-renders) so drafts, focus and workout state are untouched.
import { store, update } from '../store.js';
import { coachStatus, coachRequest, ERROR_TEXT } from '../coachApi.js';
import { buildCoachContext, mentionedExercises } from '../engine/coachContext.js';
import { isYouth } from '../engine/rank.js';
import { getExercise } from '../data/exercises.js';
import { presetById, DEFAULT_COACH } from '../data/coaches.js';
import { avatarSVG } from './avatars.js';
import { icon } from './icons.js';
import { hasDemo, openDemo } from './demo.js';
import { haptic } from './feedback.js';
import { canListen, canSpeak, listen, stopListening, speak, stopSpeaking } from './voice.js';
import { esc, uid } from '../util.js';

const RECENT = 16;          // messages sent verbatim
const SUMMARIZE_AT = 40;    // unsummarized messages before older ones are condensed

export const STARTERS = ['What should I train today?', 'How can I improve my bench?', 'Should I increase my weight?', 'Am I making progress?', 'How close am I to my goal?', 'What should I work on next?'];
const WORKOUT_STARTERS = ['How long should I rest?', 'Can I substitute this exercise?', 'Should I increase my weight?', 'How do I improve my form?'];

const ai = () => store.state.aiCoach;
const coach = () => ai().profile || DEFAULT_COACH;
const save = (fn) => update(fn, { silent: true, immediate: true });

let status = null; // cached server status for the session
export async function refreshStatus(force = false) {
  if (!status || force) status = await coachStatus();
  return status;
}
export const lastStatus = () => status;

const speakerIcon = (on) => `<svg class="icon sm" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9z"/>${on ? '<path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11"/>' : '<path d="m17 9 4 6M21 9l-4 6"/>'}</svg>`;

/** Minimal safe formatting for coach replies: paragraphs, "- " bullets, **bold**. */
export function formatReply(text) {
  const lines = esc(text).split(/\n/);
  let html = ''; let inList = false;
  for (const raw of lines) {
    const l = raw.trim();
    const b = l.match(/^[-*•]\s+(.*)/);
    if (b) { if (!inList) { html += '<ul>'; inList = true; } html += `<li>${b[1]}</li>`; continue; }
    if (inList) { html += '</ul>'; inList = false; }
    if (l) html += `<p>${l}</p>`;
  }
  if (inList) html += '</ul>';
  return html.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
}

function statusBanner(st) {
  if (!st) return '<div class="chat-banner">Connecting to your coach…</div>';
  if (st.offline) return `<div class="chat-banner warn">${icon('info', 'sm')}<span>${ERROR_TEXT.offline}</span></div>`;
  if (!st.reachable) {
    return `<div class="chat-banner warn">${icon('info', 'sm')}<div><b>AI coach unavailable on this copy</b><p>${ERROR_TEXT.no_server} Run ASCEND with its server (<code>node ascend/server/server.mjs</code>) or deploy it with the API functions — see <code>ascend/README.md</code>. Workout tracking and the rules-based coach on the Goals tab still work.</p></div></div>`;
  }
  if (!st.configured) {
    return `<div class="chat-banner warn">${icon('info', 'sm')}<div><b>Developer setup needed</b><p>The server is running but has no Gemini API key, so the AI coach is off (no fake answers are shown).</p>
      <ol><li>Create an API key in Google AI Studio.</li><li>Put <code>GEMINI_API_KEY=your-key</code> in <code>ascend/.env.local</code> (local) or your host's environment-variable settings (deployed).</li><li>Restart the server, then reopen this tab.</li></ol></div></div>`;
  }
  if (st.accessCodeRequired && !ai().prefs.accessCode) return `<div class="chat-banner">${icon('lock', 'sm')}<span>This server needs an access code. Add it in Coach settings.</span></div>`;
  return '';
}

function msgHtml(m) {
  const c = coach();
  const time = new Date(m.ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (m.role === 'user') {
    return `<div class="msg user ${m.status === 'error' ? 'err' : ''}" data-id="${m.id}">
      ${m.focusExId ? `<div class="msg-ctx">re: ${esc(getExercise(m.focusExId, store.state.customExercises)?.name || '')}</div>` : ''}
      <div class="bubble">${esc(m.text).replace(/\n/g, '<br>')}</div>
      <div class="msg-meta">${m.status === 'error' ? `<span class="msg-err">${esc(m.error || 'Not sent')}</span><button data-c="retry" data-id="${m.id}">${icon('refresh', 'sm')} Retry</button>` : `<span>${time}</span>`}<button data-c="remember" data-id="${m.id}">Remember</button></div>
    </div>`;
  }
  const demos = (m.demos || []).filter((id) => hasDemo(id));
  return `<div class="msg coach ${m.kind === 'nudge' ? 'nudge' : ''}" data-id="${m.id}">
    <div class="msg-avatar">${avatarSVG(c.avatar, { size: 28, glow: false })}</div>
    <div class="msg-body">
      ${m.kind === 'nudge' ? `<div class="msg-ctx">${esc(c.name)} · check-in</div>` : ''}
      <div class="bubble">${formatReply(m.text)}</div>
      ${demos.length ? `<div class="msg-demos">${demos.map((id) => `<button data-c="demo" data-ex="${id}"><span class="dp"></span>${esc(getExercise(id, store.state.customExercises)?.name || '')}</button>`).join('')}</div>` : ''}
      <div class="msg-meta"><span>${time}</span>${canSpeak() ? `<button data-c="say" data-id="${m.id}">${icon('play', 'sm')} Listen</button>` : ''}<button data-c="remember" data-id="${m.id}">Remember</button></div>
    </div></div>`;
}

/**
 * Mount a chat into `el`.
 * @param {{mode:'page'|'overlay', focusExId?:string, onClose?:Function, onSettings?:Function}} opts
 */
export function mountChat(el, opts = {}) {
  const mode = opts.mode || 'page';
  let busy = false;
  let destroyed = false;
  const c = coach();
  const p = presetById(c.preset);
  const focusEx = opts.focusExId ? getExercise(opts.focusExId, store.state.customExercises) : null;
  el.innerHTML = `<div class="chat ${mode}">
    <div class="chat-head">
      <div class="chat-av">${avatarSVG(c.avatar, { size: 44 })}<span class="ring"></span></div>
      <div class="grow"><div class="h3">Coach ${esc(c.name)}</div><div class="chat-persona"><i></i>${esc(c.preset === 'custom' ? 'Custom coach' : p.short)} · Gemini AI</div></div>
      <button class="icon-btn sm hide" data-c="stop" aria-label="Stop speaking">${icon('pause', 'sm')}</button>
      ${canSpeak() ? `<button class="icon-btn sm ${ai().prefs.speak ? 'on' : ''}" data-c="speak-toggle" aria-label="Speak replies" aria-pressed="${!!ai().prefs.speak}" title="Speak replies">${speakerIcon(ai().prefs.speak)}</button>` : ''}
      ${mode === 'page' ? `<button class="icon-btn sm" data-c="settings" aria-label="Coach settings">${icon('settings', 'sm')}</button>` : `<button class="icon-btn sm" data-c="close" aria-label="Back to workout">${icon('x', 'sm')}</button>`}
    </div>
    ${focusEx ? `<div class="chat-focus"><span>Asking about <b>${esc(focusEx.name)}</b> · your sets stay logged</span>${hasDemo(focusEx.id) ? `<button data-c="demo" data-ex="${focusEx.id}"><span class="dp"></span>Watch demonstration</button>` : ''}</div>` : ''}
    <div class="chat-banner-slot"></div>
    <div class="chat-log" role="log" aria-live="polite"></div>
    <div class="chat-typing hide" aria-label="Coach is typing"><span></span><span></span><span></span></div>
    <div class="chat-starters"></div>
    <div class="chat-consent hide"></div>
    <form class="chat-compose" autocomplete="off">
      ${canListen() ? `<button type="button" class="icon-btn mic" data-c="mic" aria-label="Speak your message"><svg class="icon" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>` : ''}
      <textarea id="chat-input-${mode}" rows="1" maxlength="2000" placeholder="Message Coach ${esc(c.name)}…" aria-label="Message your coach"></textarea>
      <button type="submit" class="icon-btn send" aria-label="Send"><svg class="icon" viewBox="0 0 24 24"><path d="M5 12h13M13 6l6 6-6 6"/></svg></button>
    </form>
  </div>`;
  const $ = (s) => el.querySelector(s);
  const log = $('.chat-log');
  const input = $('textarea');
  input.value = store.state.aiCoach.draft || '';

  function renderLog(scroll = true) {
    const msgs = ai().messages;
    log.innerHTML = msgs.length ? msgs.map(msgHtml).join('') : `<div class="chat-empty">${avatarSVG(c.avatar, { size: 64 })}<p>Ask Coach ${esc(c.name)} anything about your training. Answers use your saved ASCEND data.</p></div>`;
    renderStarters();
    if (scroll) requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
  }
  function renderStarters() {
    const list = focusEx ? WORKOUT_STARTERS : STARTERS;
    const show = focusEx || ai().messages.filter((m) => m.role === 'user').length < 3;
    $('.chat-starters').innerHTML = show ? list.map((s) => `<button data-c="starter">${esc(s)}</button>`).join('') : '';
  }
  function renderConsent() {
    const need = !ai().prefs.consent;
    const box = $('.chat-consent');
    box.classList.toggle('hide', !need);
    if (need) {
      box.innerHTML = `<p><b>Before your first message:</b> your messages, recent conversation, saved coach memories and the relevant parts of your ASCEND data (profile basics, goals, rank, plan and the exercise history your question is about) are sent to Google's Gemini API to generate replies. Nothing is sent until you press send.</p><button class="btn xs primary" data-c="consent">I understand — enable the AI coach</button>`;
    }
  }
  function setBusy(b) {
    busy = b;
    $('.chat-typing').classList.toggle('hide', !b);
    $('.send').disabled = b;
    if (b) requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
  }
  function setVoiceState(s) { $('.chat-av').dataset.state = s || ''; $('[data-c="stop"]').classList.toggle('hide', s !== 'speaking'); }

  async function request(userId) {
    if (busy) return;
    const st = store.state;
    const msgs = ai().messages;
    const idx = msgs.findIndex((m) => m.id === userId);
    if (idx < 0) return;
    const um = msgs[idx];
    setBusy(true);
    save((s) => { const m = s.aiCoach.messages.find((x) => x.id === userId); m.status = 'pending'; delete m.error; });
    renderLog();
    const history = msgs.slice(ai().summarizedCount, idx + 1)
      .filter((m) => m.status !== 'error' || m.id === userId)
      .slice(-RECENT)
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
    const ctx = buildCoachContext(st, { question: um.text, focusExId: um.focusExId || null });
    try {
      const data = await coachRequest({
        task: 'chat', messages: history, coach: coach(), context: ctx.text,
        summary: ai().summary, memories: ai().memories.map((m) => m.text), youth: isYouth(st),
      });
      const reply = { id: uid('m'), role: 'model', text: data.text, ts: new Date().toISOString(), demos: [...new Set([...mentionedExercises(st, data.text), ...(um.focusExId ? [um.focusExId] : [])])].slice(0, 3) };
      save((s) => { const m = s.aiCoach.messages.find((x) => x.id === userId); m.status = 'ok'; s.aiCoach.messages.push(reply); });
      haptic('tap');
      if (ai().prefs.speak) speak(reply.text, coach(), { voiceURI: ai().prefs.systemVoice, onStart: () => setVoiceState('speaking'), onEnd: () => setVoiceState('') });
      maybeSummarize();
    } catch (e) {
      save((s) => { const m = s.aiCoach.messages.find((x) => x.id === userId); m.status = 'error'; m.error = e.message; m.code = e.code; });
      if (['no_server', 'missing_key', 'invalid_key', 'access_denied'].includes(e.code)) { status = null; refreshStatus(true).then(showStatus); }
    } finally {
      setBusy(false);
      if (!destroyed) renderLog();
    }
  }

  async function send(text) {
    text = (text || '').trim();
    if (!text || busy) return;
    if (!ai().prefs.consent) { renderConsent(); $('.chat-consent').scrollIntoView({ block: 'nearest' }); return; }
    const m = { id: uid('m'), role: 'user', text: text.slice(0, 2000), ts: new Date().toISOString(), status: 'pending', focusExId: opts.focusExId || null };
    save((s) => { s.aiCoach.messages.push(m); s.aiCoach.draft = ''; });
    input.value = ''; autoGrow();
    renderLog();
    await request(m.id);
  }

  async function maybeSummarize() {
    const a = ai();
    const pending = a.messages.length - a.summarizedCount;
    if (pending <= SUMMARIZE_AT) return;
    const end = a.messages.length - RECENT;
    const chunk = a.messages.slice(a.summarizedCount, end).filter((m) => m.status !== 'error').map((m) => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
    if (!chunk.length) return;
    try {
      const data = await coachRequest({ task: 'summarize', messages: chunk, coach: coach(), summary: a.summary, memories: [], context: '' });
      save((s) => { s.aiCoach.summary = data.text.slice(0, 2400); s.aiCoach.summarizedCount = end; });
    } catch { /* keep sending recent messages; try again after the next reply */ }
  }

  function showStatus(st) {
    if (destroyed) return;
    $('.chat-banner-slot').innerHTML = statusBanner(st);
    const ok = st?.reachable && st.configured;
    input.disabled = !ok; $('.send').disabled = !ok || busy;
    $('[data-c="mic"]')?.toggleAttribute('disabled', !ok);
    if (ok && !ai().messages.length && ai().prefs.consent && !busy) greet();
  }

  async function greet() {
    setBusy(true);
    try {
      const data = await coachRequest({ task: 'greeting', messages: [], coach: coach(), context: buildCoachContext(store.state, {}).text, summary: '', memories: ai().memories.map((m) => m.text), youth: isYouth(store.state) });
      save((s) => { if (!s.aiCoach.messages.length) s.aiCoach.messages.push({ id: uid('m'), role: 'model', text: data.text, ts: new Date().toISOString(), demos: [] }); });
      if (ai().prefs.speak) speak(data.text, coach(), { voiceURI: ai().prefs.systemVoice, onStart: () => setVoiceState('speaking'), onEnd: () => setVoiceState('') });
    } catch (e) {
      $('.chat-banner-slot').innerHTML = `<div class="chat-banner warn">${icon('info', 'sm')}<span>${esc(e.message)}</span></div>`;
    } finally { setBusy(false); renderLog(); }
  }

  function autoGrow() { input.style.height = 'auto'; input.style.height = `${Math.min(140, input.scrollHeight)}px`; }

  function rememberEditor(id) {
    const m = ai().messages.find((x) => x.id === id);
    if (!m) return;
    el.querySelector('.mem-edit')?.remove();
    const box = document.createElement('div');
    box.className = 'mem-edit';
    box.innerHTML = `<div class="label">Save to coach memory</div><textarea maxlength="300" rows="3">${esc(m.text.slice(0, 300))}</textarea><div class="row mt-8"><button class="btn xs primary" data-c="mem-save">Save memory</button><button class="btn xs ghost" data-c="mem-cancel">Cancel</button></div><p class="tiny faint mt-8">Memories are shared with your coach in every conversation. Review or delete them in Coach settings.</p>`;
    el.querySelector(`.msg[data-id="${id}"]`).appendChild(box);
    box.querySelector('textarea').focus();
  }

  el.addEventListener('click', (e) => {
    const b = e.target.closest('[data-c]');
    if (!b) return;
    switch (b.dataset.c) {
      case 'starter': send(b.textContent); break;
      case 'retry': if (!busy) request(b.dataset.id); break;
      case 'demo': openDemo(b.dataset.ex); break;
      case 'say': { const m = ai().messages.find((x) => x.id === b.dataset.id); if (m) speak(m.text, coach(), { voiceURI: ai().prefs.systemVoice, onStart: () => setVoiceState('speaking'), onEnd: () => setVoiceState('') }); break; }
      case 'stop': stopSpeaking(); setVoiceState(''); break;
      case 'speak-toggle': {
        save((s) => { s.aiCoach.prefs.speak = !s.aiCoach.prefs.speak; });
        const on = ai().prefs.speak;
        if (!on) { stopSpeaking(); setVoiceState(''); }
        b.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.innerHTML = speakerIcon(on);
        break;
      }
      case 'settings': opts.onSettings?.(); break;
      case 'close': destroy(); opts.onClose?.(); break;
      case 'consent': save((s) => { s.aiCoach.prefs.consent = true; }); renderConsent(); showStatus(status); input.focus(); break;
      case 'remember': rememberEditor(b.dataset.id); break;
      case 'mem-cancel': b.closest('.mem-edit').remove(); break;
      case 'mem-save': {
        const t = b.closest('.mem-edit').querySelector('textarea').value.trim();
        if (t) save((s) => { s.aiCoach.memories.push({ id: uid('mem'), text: t.slice(0, 300), createdAt: new Date().toISOString() }); });
        b.closest('.mem-edit').innerHTML = '<p class="small accent">Saved to coach memory.</p>';
        break;
      }
      case 'mic': {
        if (b.classList.contains('live')) { stopListening(); break; }
        stopSpeaking();
        b.classList.add('live'); setVoiceState('listening');
        listen({
          onText: (t) => { input.value = t; autoGrow(); },
          onEnd: (final) => { b.classList.remove('live'); setVoiceState(''); if (final) send(final); },
          onError: (err) => { b.classList.remove('live'); setVoiceState(''); if (err === 'not-allowed') $('.chat-banner-slot').innerHTML = `<div class="chat-banner">${icon('info', 'sm')}<span>Microphone access was blocked. Allow it in your browser settings, or type instead.</span></div>`; },
        });
        break;
      }
      default: break;
    }
  });
  $('.chat-compose').addEventListener('submit', (e) => { e.preventDefault(); send(input.value); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); } });
  input.addEventListener('input', () => { autoGrow(); store.state.aiCoach.draft = input.value; });

  function destroy() { destroyed = true; stopListening(); }

  renderLog();
  renderConsent();
  showStatus(status);
  refreshStatus(true).then(showStatus);
  if (ai().unread) save((s) => { s.aiCoach.unread = 0; });
  return { destroy, send, el };
}

// ---------- overlay (Ask Coach during a workout) ----------
let overlay = null;
export function openCoachOverlay({ focusExId } = {}) {
  closeCoachOverlay();
  overlay = document.createElement('div');
  overlay.className = 'coach-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Ask your coach');
  overlay.innerHTML = '<div class="coach-overlay-scrim"></div><div class="coach-overlay-panel"></div>';
  document.body.appendChild(overlay);
  overlay.querySelector('.coach-overlay-scrim').addEventListener('click', closeCoachOverlay);
  mountChat(overlay.querySelector('.coach-overlay-panel'), { mode: 'overlay', focusExId, onClose: closeCoachOverlay });
  const onKey = (e) => { if (e.key === 'Escape' && !document.querySelector('.demo')) closeCoachOverlay(); };
  document.addEventListener('keydown', onKey);
  overlay._onKey = onKey;
  setTimeout(() => overlay?.querySelector('textarea:not([disabled])')?.focus({ preventScroll: true }), 80);
}
export function closeCoachOverlay() {
  if (!overlay) return;
  const o = overlay; overlay = null;
  document.removeEventListener('keydown', o._onKey);
  stopListening();
  o.classList.add('closing');
  setTimeout(() => o.remove(), 220);
}

import { fmtClock } from '../core/math';
import { countryCode, POSITION_NAMES, recordString, SUBMISSIONS } from '../data';
import type { FightEngine } from '../engine/FightEngine';
import type { FighterState } from '../engine/types';
import type { InputManager } from '../input/InputManager';
import { keyName, type Logical } from '../input/Bindings';
import { h } from './dom';
import type { Settings } from './Settings';

const ARROW: Record<string, string> = { up: '↑', down: '↓', left: '←', right: '→' };

/** Broadcast scorebug + fight HUD (DOM overlay on top of the canvas). */
export class Hud {
  el: HTMLElement;
  private rows: Array<{ nm: HTMLElement; stam: HTMLElement; dmg: HTMLElement[] }> = [];
  private clockRd: HTMLElement;
  private clockTm: HTMLElement;
  private pos: HTMLElement;
  private ticker: HTMLElement;
  private big: HTMLElement;
  private bigTimer = 0;
  private hints: HTMLElement;
  private prompt: HTMLElement;
  private sub: HTMLElement;
  private subName: HTMLElement;
  private subRole: HTMLElement;
  private needle: HTMLElement;
  private subKey: HTMLElement;
  private lastHintCtx = '';

  constructor(private e: FightEngine, private settings: Settings, private input: InputManager, eventLabel: string) {
    const names = h('div', { class: 'sb-names' });
    for (const f of e.f) {
      const nm = h('div', { class: 'nm' }, f.last, f.side === 0 ? h('span', { class: 'you' }, 'YOU') : null);
      const dmg = [h('i', { title: 'Head' }), h('i', { title: 'Body' }), h('i', { title: 'Legs' })];
      const stam = h('div');
      names.append(
        h('div', { class: 'sb-row' }, h('div', { style: `background:${f.side === 0 ? 'var(--red)' : 'var(--blue)'};height:100%` }), h('div', { class: 'cc' }, countryCode(f.data.country)), nm, h('div', { class: 'dmg' }, ...dmg)),
        h('div', { class: 'sb-stam' }, stam),
      );
      this.rows.push({ nm, stam, dmg });
    }
    this.clockRd = h('div', { class: 'rd' }, 'R1');
    this.clockTm = h('div', { class: 'tm' }, '5:00');
    this.pos = h('div', { class: 'posbanner' });
    this.ticker = h('div', { class: 'ticker' });
    this.big = h('div', { class: 'bigtext' });
    this.hints = h('div', { class: 'hints' });
    this.prompt = h('div', { class: 'prompt' });
    this.subName = h('div', { class: 'sn' });
    this.subRole = h('div', { class: 'role' });
    this.needle = h('div', { class: 'needle' });
    this.subKey = h('div', { class: 'key' });
    this.sub = h('div', { class: 'subbox' }, this.subRole, this.subName, h('div', { class: 'meter' }, this.needle), h('div', { class: 'ends' }, h('span', null, 'ESCAPE'), h('span', null, 'TAP')), this.subKey, h('div', { class: 'role' }, 'press the direction shown — wrong keys lock you out'));
    const [a, b] = e.f;
    this.el = h(
      'div', { class: 'hud' },
      h('div', { class: 'scorebug' }, names, h('div', { class: 'sb-clock' }, this.clockRd, this.clockTm)),
      h('div', { class: 'eventtag' }, h('b', null, eventLabel), `${recordString(a.data.record)} · ${recordString(b.data.record)}`),
      this.pos, this.ticker, this.big, this.hints, this.prompt, this.sub,
    );
    if (settings.hud === 'minimal') for (const r of this.rows) r.dmg.forEach((d) => (d.style.display = 'none'));
  }

  bigText(t: string, ms = 1200) {
    this.big.textContent = t;
    this.big.classList.add('on');
    this.bigTimer = ms / 1000;
  }

  line(text: string, color: boolean) {
    const ln = h('div', { class: 'ln' + (color ? ' color' : '') }, text);
    this.ticker.append(h('div', null, ln));
    while (this.ticker.children.length > 2) this.ticker.firstChild?.remove();
    setTimeout(() => (ln.style.opacity = '0'), 4200);
  }

  private key(l: Logical) {
    const k = this.input.keys[l]?.[0];
    return k ? keyName(k) : '—';
  }

  update(dt: number) {
    const e = this.e;
    this.clockRd.textContent = `R${e.round} of ${e.cfg.rounds}`;
    this.clockTm.textContent = fmtClock(e.clock);
    e.f.forEach((f, i) => {
      const r = this.rows[i];
      r.stam.style.width = `${Math.max(0, f.stamina)}%`;
      r.stam.style.background = f.stamina < 25 ? 'var(--bad)' : f.stamina < 50 ? 'var(--warn)' : '#e9e9ee';
      const lvl = [f.head / 1.6 + f.daze * 0.6, f.body * 1.2, Math.max(f.legL, f.legR)];
      r.dmg.forEach((d, j) => (d.style.background = lvl[j] > 70 ? 'var(--bad)' : lvl[j] > 35 ? 'var(--warn)' : 'var(--good)'));
    });
    // position banner
    let pos = '';
    if (e.mode === 'ground' && e.ground) pos = `${POSITION_NAMES[e.ground.pos]} · ${e.f[e.ground.top].last} on top`;
    else if (e.mode === 'clinch' && e.clinch) pos = e.clinch.pinned !== -1 ? `Clinch · ${e.f[e.clinch.pinned].last} against the cage` : 'Clinch';
    else if (e.mode === 'sub' && e.sub) pos = `${SUBMISSIONS[e.sub.subId].name} · ${e.f[e.sub.attacker].last}`;
    this.pos.textContent = pos;
    this.pos.classList.toggle('on', !!pos);

    if (this.bigTimer > 0) {
      this.bigTimer -= dt;
      if (this.bigTimer <= 0) this.big.classList.remove('on');
    }

    // submission scramble
    if (e.mode === 'sub' && e.sub) {
      const s = e.sub;
      this.sub.style.display = 'block';
      const attacking = s.attacker === 0;
      this.subRole.textContent = attacking ? 'You are attacking — finish it!' : 'You are defending — escape!';
      this.subName.textContent = SUBMISSIONS[s.subId].name;
      this.needle.style.left = `calc(${Math.max(0, Math.min(100, s.progress))}% - 2px)`;
      this.subKey.textContent = ARROW[s.prompts[0]];
      this.subKey.classList.toggle('lock', s.lockout[0] > 0);
    } else this.sub.style.display = 'none';

    // prompts
    const me = e.f[0];
    const ctx = e.context(0);
    let prompt = '';
    if (ctx === 'down') prompt = `Tap ${this.key('getup')} to get up!`;
    else if (ctx === 'standingOverDowned') prompt = `Strike or ${this.key('takedown')} to follow up on the ground — or back off`;
    else if (me.subScramble > e.time && e.mode === 'stand') prompt = `${this.key('submission')}: Guillotine!`;
    this.prompt.textContent = prompt;
    this.prompt.style.display = prompt ? 'block' : 'none';
    this.updateHints(ctx, me);
  }

  private updateHints(ctx: string, me: FighterState) {
    if (!this.settings.hints) {
      this.hints.style.display = 'none';
      return;
    }
    const key = ctx + (this.e.ground?.pos ?? '');
    if (key === this.lastHintCtx) return;
    this.lastHintCtx = key;
    const k = (l: Logical) => `<span class="kbd">${this.key(l)}</span>`;
    let html = '';
    switch (ctx) {
      case 'stand':
        html = `${k('jab')}${k('cross')}${k('leadHook')}${k('rearHook')} punches · ${k('leadKick')}${k('rearKick')} kicks · hold ${k('modBody')} body / ${k('modHigh')} head kicks / ${k('modSpecial')} specials<br>${k('blockHigh')} block · ${k('blockLow')} check/sprawl · ${k('slip')} slip ${k('duck')} duck ${k('pull')} pull ${k('sidestep')} side-step · ${k('feint')} feint<br>${k('clinch')} clinch · ${k('takedown')} takedown (${k('modBody')}+${k('takedown')} single leg)`;
        break;
      case 'clinch':
        html = `CLINCH — ${k('jab')}${k('cross')} short punches · ${k('leadHook')}${k('rearHook')} elbows · ${k('leadKick')}${k('rearKick')} knees (${k('modHigh')} to the head)<br>${k('transition')} pummel / pin to cage · ${k('takedown')} trip · ${k('getup')} break · ${k('blockLow')} defend takedown`;
        break;
      case 'groundTop':
        html = `TOP — ${k('jab')}${k('cross')} punches · ${k('leadHook')}${k('rearHook')} elbows · ${k('transition')} advance position (${k('modHigh')}+${k('transition')} take the back)<br>${k('submission')} submission (${k('modBody')}/${k('modSpecial')} alternatives) · ${k('getup')} stand up · ${k('blockLow')} hold him down`;
        break;
      case 'groundBottom':
        html = `BOTTOM — ${k('transition')} sweep / escape · ${k('getup')} work to feet (easier near the cage) · ${k('submission')} submission from guard<br>${k('blockHigh')} cover up · ${k('blockLow')} frame against passes · ${k('jab')} ${k('leadHook')} strikes from the bottom`;
        break;
      case 'subAttack':
      case 'subDefend':
        html = 'SUBMISSION — press the arrow shown (WASD / arrows / D-pad). Stamina and skill decide how hard each input pushes.';
        break;
      default:
        html = '';
    }
    void me;
    this.hints.innerHTML = html;
    this.hints.style.display = html ? 'block' : 'none';
  }
}

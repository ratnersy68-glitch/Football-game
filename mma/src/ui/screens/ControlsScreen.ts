import { BINDING_INFO, keyName, PAD_BUTTON_NAMES, type Logical } from '../../input/Bindings';
import { resolveStrike, STRIKES, type StrikeButton } from '../../data';
import type { App, Screen } from '../App';
import { clear, h } from '../dom';

/** Keyboard + gamepad bindings (click to rebind) and a full strike reference. */
export class ControlsScreen implements Screen {
  el: HTMLElement;
  private body: HTMLElement;
  private capturing: string | null = null;

  constructor(private app: App, private onBack: () => void) {
    this.body = h('div', { class: 'scroll', style: 'flex:1' });
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn small', onclick: () => { app.input.cancelCapture(); onBack(); } }, '‹ Back'), h('h1', null, 'Controls'),
        h('span', { class: 'sub' }, app.input.padConnected ? 'Gamepad connected' : 'Keyboard · connect a gamepad any time'),
        h('div', { class: 'spacer' }),
        h('button', { class: 'btn small', onclick: () => { app.input.resetDefaults(); this.render(); } }, 'Reset to defaults')),
      this.body,
    );
    this.render();
  }

  private render() {
    clear(this.body);
    const inp = this.app.input;
    const groups = ['Movement', 'Striking', 'Modifiers', 'Defense', 'Grappling', 'Other'] as const;
    const wrap = h('div', { class: 'ctl' });
    for (const g of groups) {
      const box = h('div', { class: 'ctl-group' }, h('h3', null, g));
      for (const b of BINDING_INFO.filter((x) => x.group === g)) {
        const kId = `k:${b.id}`;
        const pId = `p:${b.id}`;
        const keys = inp.keys[b.id] ?? [];
        const pads = inp.pad[b.id] ?? [];
        const kBtn = h('button', { class: 'bind' + (this.capturing === kId ? ' cap' : ''), onclick: () => this.captureKey(b.id) },
          this.capturing === kId ? 'Press a key… (Esc = cancel)' : keys.length ? keys.map(keyName).join(' / ') : '—');
        const pBtn = h('button', { class: 'bind' + (this.capturing === pId ? ' cap' : ''), onclick: () => this.capturePad(b.id) },
          this.capturing === pId ? 'Press a pad button…' : b.id === 'up' || b.id === 'down' || b.id === 'left' || b.id === 'right' ? 'Left stick' : pads.length ? pads.map((x) => PAD_BUTTON_NAMES[x] ?? `B${x}`).join(' / ') : '—');
        box.append(h('div', { class: 'ctl-row' }, h('span', null, b.label), kBtn, pBtn, b.help ? h('div', { class: 'help' }, b.help) : null));
      }
      wrap.append(box);
    }
    const pad = h('div', { class: 'ctl-group' }, h('h3', null, 'Gamepad sticks'),
      h('div', { class: 'ctl-row' }, h('span', null, 'Left stick'), h('span', null, 'Move / scramble direction'), h('span')),
      h('div', { class: 'ctl-row' }, h('span', null, 'Right stick ← →'), h('span', null, 'Slip (with block held: side step)'), h('span')),
      h('div', { class: 'ctl-row' }, h('span', null, 'Right stick ↓ / ↑'), h('span', null, 'Duck / pull back'), h('span')),
      h('div', { class: 'ctl-row' }, h('span', null, 'Block + Body mod'), h('span', null, 'Low block (also the Low Block binding)'), h('span')),
    );
    wrap.append(pad);
    this.body.append(wrap);

    // strike reference generated from the actual resolver
    const btns: Array<[StrikeButton, string]> = [['jab', 'Jab'], ['cross', 'Cross'], ['leadHook', 'Lead Hook'], ['rearHook', 'Rear Hook'], ['leadKick', 'Lead Kick'], ['rearKick', 'Rear Kick']];
    const mods: Array<[string, { body: boolean; special: boolean; high: boolean }, boolean]> = [
      ['—', { body: false, special: false, high: false }, false],
      ['Body', { body: true, special: false, high: false }, false],
      ['High', { body: false, special: false, high: true }, false],
      ['Special', { body: false, special: true, high: false }, false],
      ['Special (close)', { body: false, special: true, high: false }, true],
      ['Special + High', { body: false, special: true, high: true }, false],
    ];
    const table = h('table', null, h('tr', null, h('th', null, 'Standing'), ...mods.map((m) => h('th', null, m[0]))));
    for (const [b, label] of btns) table.append(h('tr', null, h('td', null, label), ...mods.map(([, m, close]) => h('td', null, STRIKES[resolveStrike('stand', b, m, close)].name))));
    this.body.append(h('div', { class: 'combo-ref' }, h('h3', { style: 'font-family:var(--heavy);letter-spacing:3px;color:var(--red)' }, 'STRIKE REFERENCE'), table,
      h('p', { style: 'color:var(--muted);max-width:900px;line-height:1.6' },
        'Combinations: press the next strike during the recovery of the previous one — faster fighters chain sooner. Recognised combos include 1-2, 1-2-hook, jab–leg kick, cross–hook–cross, jab–body cross, hook–head kick and more. ',
        'Landing while your opponent is winding up is a timed counter (the most dangerous shot in the game); landing right after they miss is a whiff counter. ',
        'Press Takedown while a kick is in the air to catch it. Hold Low Block as they shoot to sprawl. After a good sprawl, press Submission for a guillotine.')));
  }

  private captureKey(id: Logical) {
    const inp = this.app.input;
    this.capturing = `k:${id}`;
    this.render();
    inp.captureKey((code) => {
      this.capturing = null;
      if (code !== 'Escape' || id === 'pause') {
        // remove this key from any other action, then bind it here
        for (const k of Object.keys(inp.keys) as Logical[]) inp.keys[k] = inp.keys[k].filter((c) => c !== code);
        inp.keys[id] = [code];
        inp.save();
      }
      this.render();
    });
  }

  private capturePad(id: Logical) {
    if (id === 'up' || id === 'down' || id === 'left' || id === 'right') return;
    const inp = this.app.input;
    this.capturing = `p:${id}`;
    this.render();
    inp.capturePad((btn) => {
      this.capturing = null;
      for (const k of Object.keys(inp.pad) as Logical[]) inp.pad[k] = (inp.pad[k] ?? []).filter((b) => b !== btn);
      inp.pad[id] = [btn];
      inp.save();
      this.render();
    });
  }

  tick() {
    if (!this.capturing && this.app.input.pressed('pause')) this.onBack();
  }
}

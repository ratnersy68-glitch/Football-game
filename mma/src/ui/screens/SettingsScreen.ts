import type { App, Screen } from '../App';
import { clear, h } from '../dom';
import { CLOCK_OPTIONS, DEFAULT_SETTINGS } from '../Settings';

export class SettingsScreen implements Screen {
  el: HTMLElement;
  private body: HTMLElement;
  constructor(private app: App, private onBack: () => void) {
    this.body = h('div', { style: 'padding:20px 30px;max-width:760px' });
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn small', onclick: onBack }, '‹ Back'), h('h1', null, 'Settings')),
      h('div', { class: 'scroll', style: 'flex:1' }, this.body));
    this.render();
  }

  private render() {
    const s = this.app.settings;
    clear(this.body);
    const toggle = (label: string, val: boolean, set: (v: boolean) => void, desc = '') => h('div', { class: 'setting' }, h('div', { class: 'lab' }, label),
      h('div', { class: 'seg' }, h('button', { class: 'btn' + (val ? ' sel' : ''), onclick: () => { set(true); this.save(); } }, 'On'), h('button', { class: 'btn' + (!val ? ' sel' : ''), onclick: () => { set(false); this.save(); } }, 'Off')),
      h('span', { style: 'color:var(--muted);font-size:14px' }, desc));
    this.body.append(
      toggle('Sound', s.audio, (v) => (s.audio = v), 'Synthesized crowd, impacts, horn'),
      h('div', { class: 'setting' }, h('div', { class: 'lab' }, 'Volume'), h('input', { type: 'range', min: '0', max: '1', step: '0.05', value: String(s.volume), oninput: (ev: Event) => { s.volume = Number((ev.target as HTMLInputElement).value); this.save(false); } })),
      toggle('Commentary', s.commentary, (v) => (s.commentary = v), 'Text commentary ticker during fights'),
      toggle('Control hints', s.hints, (v) => (s.hints = v), 'Context-sensitive key hints in the corner'),
      toggle('Camera shake', s.shake, (v) => (s.shake = v), 'Subtle shake on heavy impacts'),
      h('div', { class: 'setting' }, h('div', { class: 'lab' }, 'HUD'), h('div', { class: 'seg' },
        h('button', { class: 'btn' + (s.hud === 'full' ? ' sel' : ''), onclick: () => { s.hud = 'full'; this.save(); } }, 'Full'),
        h('button', { class: 'btn' + (s.hud === 'minimal' ? ' sel' : ''), onclick: () => { s.hud = 'minimal'; this.save(); } }, 'Broadcast')),
        h('span', { style: 'color:var(--muted);font-size:14px' }, 'Broadcast hides the head/body/leg damage lights')),
      h('div', { class: 'setting' }, h('div', { class: 'lab' }, 'Default round clock'), h('select', { class: 'btn', onchange: (ev: Event) => { s.clockSpeed = Number((ev.target as HTMLSelectElement).value); this.save(); } },
        ...CLOCK_OPTIONS.map((c) => h('option', { value: String(c.speed), selected: c.speed === s.clockSpeed }, c.label))),
        h('span', { style: 'color:var(--muted);font-size:14px' }, 'Fights always show a 5:00 clock; this sets how fast it runs')),
      h('div', { style: 'margin-top:20px' }, h('button', { class: 'btn', onclick: () => { Object.assign(s, DEFAULT_SETTINGS); this.save(); } }, 'Restore defaults')),
    );
  }

  private save(rerender = true) {
    this.app.saveSettings();
    if (rerender) this.render();
  }

  tick() {
    if (this.app.input.pressed('pause')) this.onBack();
  }
}

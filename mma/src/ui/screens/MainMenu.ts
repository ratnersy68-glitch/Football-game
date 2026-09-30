import { FIGHTERS } from '../../data';
import type { UIManager, Screen } from '../UIManager';
import { h } from '../dom';

export interface MenuActions {
  quick(): void;
  main(): void;
  tournament(): void;
  controls(): void;
  settings(): void;
}

export class MainMenu implements Screen {
  el: HTMLElement;
  constructor(private app: UIManager, a: MenuActions) {
    const item = (label: string, desc: string, fn: () => void) => h('button', { class: 'btn menu-item', onclick: fn }, label, h('small', null, desc));
    const men = FIGHTERS.filter((f) => f.gender === 'M').length;
    const women = FIGHTERS.length - men;
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'menu' },
        h('div', { class: 'left' },
          h('h1', { class: 'brand' }, 'OCTAGON', h('br'), h('span', null, 'FIGHT NIGHT')),
          h('div', { class: 'tag' }, 'Tactical MMA · Real-time · Personal edition'),
          h('div', { class: 'menu-list' },
            item('Quick Fight', 'Pick two fighters, difficulty, arena and rounds', a.quick),
            item('Main Event', 'Full broadcast: tale of the tape, walkouts, five rounds', a.main),
            item('Tournament', '8 or 16 fighter single-elimination bracket', a.tournament),
            item('Controls', 'Keyboard & gamepad bindings — all rebindable', a.controls),
            item('Settings', 'Audio, HUD, camera, commentary, round clock', a.settings),
          ),
          h('div', { class: 'note' }, `${FIGHTERS.length} fighters (${men} men, ${women} women) across 11 divisions. Career / Championship mode is planned; the game modes above are the complete set in this build.`),
        ),
        h('div', { class: 'right' }),
      ),
    );
    void this.app;
  }
}

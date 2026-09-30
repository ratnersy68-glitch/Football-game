import { ARCHETYPES, countryCode, fighterAge, heightString, recordString, WEIGHT_CLASS_BY_ID, type FighterData } from '../../data';
import type { FightSetup } from '../../modes/types';
import { ARENA_BY_ID } from '../../data';
import type { UIManager, Screen } from '../UIManager';
import { h } from '../dom';

/** Broadcast-style Tale of the Tape. */
export class TaleOfTape implements Screen {
  el: HTMLElement;
  private t = 0;
  constructor(private app: UIManager, setup: FightSetup, private onDone: () => void) {
    const [a, b] = setup.fighters;
    const arena = ARENA_BY_ID[setup.arenaId];
    const adv = (x: number, y: number, higherBetter = true): [string, string] => (x === y ? ['', ''] : (x > y) === higherBetter ? ['adv', ''] : ['', 'adv']);
    const row = (label: string, x: string, y: string, cls: [string, string] = ['', ''], i = 0) =>
      h('div', { class: 'row', style: `animation-delay:${0.15 + i * 0.08}s` }, h('div', { class: cls[0] }, x), h('div', { class: 'lab' }, label), h('div', { class: cls[1] }, y));
    const wa = setup.context === 'tournament' ? WEIGHT_CLASS_BY_ID[a.weightClass].name : `${a.weightLbs} lbs`;
    const wb = setup.context === 'tournament' ? WEIGHT_CLASS_BY_ID[b.weightClass].name : `${b.weightLbs} lbs`;
    const catchweight = a.weightClass !== b.weightClass;
    const name = (f: FighterData, side: 'l' | 'r') => h('div', { class: `nm ${side}` }, h('small', null, f.nickname ? `“${f.nickname}”` : countryCode(f.country)), f.name);
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'tott' },
        h('div', { class: 'title' }, 'TALE OF THE TAPE'),
        h('div', { class: 'event' }, `${setup.title ?? 'Fight Night'} · ${arena?.name ?? ''} · ${setup.rounds} rounds${catchweight ? ' · Catchweight superfight' : ''}`),
        h('div', { class: 'names' }, name(a, 'l'), h('div', { class: 'vs' }, 'VS'), name(b, 'r')),
        h('div', { class: 'tape' },
          row('Record', recordString(a.record), recordString(b.record), adv(a.record.w - a.record.l, b.record.w - b.record.l), 0),
          row('Country', a.country, b.country, ['', ''], 1),
          row('Age', String(fighterAge(a)), String(fighterAge(b)), adv(fighterAge(a), fighterAge(b), false), 2),
          row('Height', heightString(a.heightIn), heightString(b.heightIn), adv(a.heightIn, b.heightIn), 3),
          row('Weight', wa, wb, catchweight ? adv(a.weightLbs, b.weightLbs) : ['', ''], 4),
          row('Reach', `${a.reachIn}"`, `${b.reachIn}"`, adv(a.reachIn, b.reachIn), 5),
          row('Stance', a.stance, b.stance, ['', ''], 6),
          row('Style', ARCHETYPES[a.archetype].name, ARCHETYPES[b.archetype].name, ['', ''], 7),
        ),
        h('div', { class: 'continue' }, 'PRESS ANY KEY OR CLICK TO CONTINUE'),
      ),
    );
    this.el.addEventListener('click', () => this.done());
  }
  private doneCalled = false;
  private done() {
    if (this.doneCalled) return;
    this.doneCalled = true;
    this.onDone();
  }
  tick(dt: number) {
    this.t += dt;
    if (this.t > 0.6 && this.app.input.anyPressed()) this.done();
  }
}

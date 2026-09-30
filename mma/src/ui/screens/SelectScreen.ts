import { DIFFICULTY_LIST, type DifficultyId } from '../../ai/Difficulty';
import { ARCHETYPES, ARENAS, FIGHTERS, recordString, WEIGHT_CLASSES, type FighterData, type WeightClassId } from '../../data';
import type { FightSetup } from '../../modes/types';
import type { App, Screen } from '../App';
import { clear, h } from '../dom';
import { fighterCard } from '../components';
import { CLOCK_OPTIONS } from '../Settings';

export interface SelectOptions {
  mode: 'quick' | 'main';
  onBack(): void;
  onFight(setup: FightSetup): void;
  initial?: Partial<FightSetup>;
}

/** Fighter selection: player (red, left) vs AI (blue, right), plus fight options. */
export class SelectScreen implements Screen {
  el: HTMLElement;
  private player: FighterData | null = null;
  private opp: FighterData | null = null;
  private slot: 'p' | 'o' = 'p';
  private division: WeightClassId = 'LW';
  private difficulty: DifficultyId = 'normal';
  private arenaId = 'vegas';
  private rounds = 3;
  private clockSpeed: number;
  private body: HTMLElement;
  private opts: HTMLElement;

  constructor(private app: App, private o: SelectOptions) {
    this.clockSpeed = app.settings.clockSpeed;
    if (o.mode === 'main') {
      this.rounds = 5;
      this.arenaId = 'garden';
    }
    const init = o.initial;
    if (init?.fighters) {
      this.player = init.fighters[0];
      this.opp = init.fighters[1];
      this.division = init.fighters[0].weightClass;
      this.slot = 'o';
    }
    if (init?.difficulty) this.difficulty = init.difficulty;
    if (init?.arenaId) this.arenaId = init.arenaId;
    if (init?.rounds && o.mode === 'quick') this.rounds = init.rounds;
    if (init?.clockSpeed) this.clockSpeed = init.clockSpeed;
    this.body = h('div', { class: 'select-body' });
    this.opts = h('div', { class: 'options' });
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'topbar' },
        h('button', { class: 'btn small', onclick: o.onBack }, '‹ Back'),
        h('h1', null, o.mode === 'main' ? 'Main Event' : 'Quick Fight'),
        h('span', { class: 'sub' }, 'Select fighters'),
      ),
      this.body,
      this.opts,
    );
    this.render();
  }

  private pick(f: FighterData) {
    if (this.slot === 'p') {
      this.player = f;
      if (this.opp && (this.opp.gender !== f.gender || this.opp.id === f.id)) this.opp = null;
      this.slot = 'o';
    } else {
      if (this.player && f.id === this.player.id) return;
      this.opp = f;
    }
    this.render();
  }

  private randomOpponent() {
    const pool = FIGHTERS.filter((f) => f.weightClass === this.division && f.id !== this.player?.id && (!this.player || f.gender === this.player.gender));
    if (!pool.length) return;
    this.opp = pool[Math.floor(Math.random() * pool.length)];
    this.render();
  }

  private render() {
    clear(this.body);
    const roster = h('div', { class: 'roster' });
    const tabs = h('div', { class: 'tabs' });
    for (const wc of WEIGHT_CLASSES) {
      tabs.append(h('button', { class: 'tab' + (wc.id === this.division ? ' on' : ''), onclick: () => { this.division = wc.id; this.render(); } }, wc.name));
    }
    const grid = h('div', { class: 'grid' });
    const list = FIGHTERS.filter((f) => f.weightClass === this.division);
    for (const f of list) {
      const blocked = this.slot === 'o' && this.player && (f.gender !== this.player.gender || f.id === this.player.id);
      const cls = 'tile' + (this.player?.id === f.id ? ' p' : '') + (this.opp?.id === f.id ? ' o' : '') + (blocked ? ' dis' : '');
      grid.append(h('button', { class: cls, onclick: () => this.pick(f) },
        h('div', { class: 'tn' }, f.name, f.legend ? h('span', { class: 'legend-badge' }, 'LEGEND') : null),
        h('div', { class: 'tm' }, `${recordString(f.record)} · ${ARCHETYPES[f.archetype].name}`)));
    }
    roster.append(tabs, h('div', { style: 'padding:6px 16px;color:var(--muted);font-size:13px;letter-spacing:1px' },
      this.slot === 'p' ? 'Choose YOUR fighter (red corner)' : 'Choose the AI OPPONENT (blue corner) — cross-division superfights are allowed; weight differences matter'), grid);
    this.body.append(
      fighterCard(this.player, 'red', 'You', this.slot === 'p', () => { this.slot = 'p'; this.render(); }),
      roster,
      fighterCard(this.opp, 'blue', 'AI', this.slot === 'o', () => { this.slot = 'o'; this.render(); }),
    );
    this.renderOptions();
  }

  private renderOptions() {
    clear(this.opts);
    const seg = <T,>(items: Array<[T, string]>, cur: T, set: (v: T) => void) =>
      h('div', { class: 'seg' }, ...items.map(([v, l]) => h('button', { class: 'btn' + (v === cur ? ' sel' : ''), onclick: () => { set(v); this.renderOptions(); } }, l)));
    const diff = DIFFICULTY_LIST.find((d) => d.id === this.difficulty)!;
    this.opts.append(
      h('div', { class: 'opt' }, h('label', null, 'AI Difficulty'), seg(DIFFICULTY_LIST.map((d) => [d.id, d.name] as [DifficultyId, string]), this.difficulty, (v) => (this.difficulty = v)), h('div', { class: 'diffblurb' }, diff.blurb)),
      h('div', { class: 'opt' }, h('label', null, 'Arena'), h('select', { class: 'btn', onchange: (ev: Event) => { this.arenaId = (ev.target as HTMLSelectElement).value; } },
        ...ARENAS.map((a) => h('option', { value: a.id, selected: a.id === this.arenaId }, `${a.name} — ${a.city}`)))),
      this.o.mode === 'quick'
        ? h('div', { class: 'opt' }, h('label', null, 'Rounds'), seg<number>([[3, '3 Rounds'], [5, '5 Rounds']], this.rounds, (v) => (this.rounds = v)))
        : h('div', { class: 'opt' }, h('label', null, 'Rounds'), h('div', { style: 'padding:7px 0' }, '5 × 5:00 Championship')),
      h('div', { class: 'opt' }, h('label', null, 'Round clock'), h('select', { class: 'btn', onchange: (ev: Event) => { this.clockSpeed = Number((ev.target as HTMLSelectElement).value); } },
        ...CLOCK_OPTIONS.map((c) => h('option', { value: String(c.speed), selected: c.speed === this.clockSpeed }, c.label)))),
      h('div', { class: 'spacer' }),
      h('button', { class: 'btn', disabled: !this.player, onclick: () => this.randomOpponent() }, 'Random Opponent'),
      h('button', { class: 'btn primary', disabled: !(this.player && this.opp), onclick: () => this.go() }, 'Fight ›'),
    );
  }

  private go() {
    if (!this.player || !this.opp) return;
    this.o.onFight({
      fighters: [this.player, this.opp], difficulty: this.difficulty, arenaId: this.arenaId, rounds: this.rounds,
      clockSpeed: this.clockSpeed, context: this.o.mode === 'main' ? 'main' : 'quick',
      title: this.o.mode === 'main' ? 'Main Event' : undefined,
    });
  }

  tick() {
    if (this.app.input.pressed('pause')) this.o.onBack();
  }
}

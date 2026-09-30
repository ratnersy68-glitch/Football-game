import { DIFFICULTY_LIST, type DifficultyId } from '../../ai/Difficulty';
import { fmtClock } from '../../core/math';
import { ARCHETYPES, ARENAS, FIGHTER_BY_ID, recordString, WEIGHT_CLASSES } from '../../data';
import {
  advance, createTournament, divisionLabel, divisionPool, isFinal, loadTournament, playerAlive, playerMatch, roundName,
  saveTournament, simulateOthers, type TournamentDivision, type TournamentState,
} from '../../modes/Tournament';
import type { App, Screen } from '../App';
import { clear, h } from '../dom';
import { fighterCard } from '../components';
import { CLOCK_OPTIONS } from '../Settings';

export class TournamentSetup implements Screen {
  el: HTMLElement;
  private size: 8 | 16 = 8;
  private division: TournamentDivision = 'LW';
  private playerId: string | null = null;
  private difficulty: DifficultyId = 'normal';
  private arenaId = 'vegas';
  private clockSpeed: number;
  private body: HTMLElement;

  constructor(private app: App, private onBack: () => void, private onStart: (s: TournamentState) => void) {
    this.clockSpeed = app.settings.clockSpeed;
    this.body = h('div', { class: 'select-body', style: 'grid-template-columns:330px 1fr' });
    const saved = loadTournament();
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn small', onclick: onBack }, '‹ Back'), h('h1', null, 'Tournament'), h('span', { class: 'sub' }, 'Single elimination'),
        h('div', { class: 'spacer' }),
        saved ? h('button', { class: 'btn primary', onclick: () => onStart(saved) }, `Continue: ${FIGHTER_BY_ID[saved.playerId].name} · ${divisionLabel(saved.division)}`) : null),
      this.body,
    );
    this.render();
  }

  private divisions(): TournamentDivision[] {
    const list: TournamentDivision[] = WEIGHT_CLASSES.filter((w) => divisionPool(w.id).length >= this.size).map((w) => w.id);
    list.push('OPEN_M');
    if (divisionPool('OPEN_F').length >= this.size) list.push('OPEN_F');
    return list;
  }

  private render() {
    clear(this.body);
    if (!this.divisions().includes(this.division)) this.division = this.divisions()[0];
    const pool = divisionPool(this.division);
    if (this.playerId && !pool.some((f) => f.id === this.playerId)) this.playerId = null;
    const player = this.playerId ? FIGHTER_BY_ID[this.playerId] : null;
    const seg = <T,>(items: Array<[T, string]>, cur: T, set: (v: T) => void) =>
      h('div', { class: 'seg' }, ...items.map(([v, l]) => h('button', { class: 'btn' + (v === cur ? ' sel' : ''), onclick: () => { set(v); this.render(); } }, l)));
    const grid = h('div', { class: 'grid' }, ...pool.map((f) => h('button', { class: 'tile' + (f.id === this.playerId ? ' p' : ''), onclick: () => { this.playerId = f.id; this.render(); } },
      h('div', { class: 'tn' }, f.name), h('div', { class: 'tm' }, `${recordString(f.record)} · ${ARCHETYPES[f.archetype].name}`))));
    const right = h('div', { class: 'roster' },
      h('div', { class: 'options', style: 'border-top:none;border-bottom:1px solid var(--line)' },
        h('div', { class: 'opt' }, h('label', null, 'Bracket size'), seg<8 | 16>([[8, '8 fighters'], [16, '16 fighters']], this.size, (v) => (this.size = v))),
        h('div', { class: 'opt' }, h('label', null, 'Division'), h('select', { class: 'btn', onchange: (ev: Event) => { this.division = (ev.target as HTMLSelectElement).value as TournamentDivision; this.render(); } },
          ...this.divisions().map((d) => h('option', { value: d, selected: d === this.division }, `${divisionLabel(d)} (${divisionPool(d).length})`)))),
        h('div', { class: 'opt' }, h('label', null, 'AI Difficulty'), seg(DIFFICULTY_LIST.map((d) => [d.id, d.name] as [DifficultyId, string]), this.difficulty, (v) => (this.difficulty = v))),
        h('div', { class: 'opt' }, h('label', null, 'Arena'), h('select', { class: 'btn', onchange: (ev: Event) => (this.arenaId = (ev.target as HTMLSelectElement).value) }, ...ARENAS.map((a) => h('option', { value: a.id, selected: a.id === this.arenaId }, a.name)))),
        h('div', { class: 'opt' }, h('label', null, 'Round clock'), h('select', { class: 'btn', onchange: (ev: Event) => (this.clockSpeed = Number((ev.target as HTMLSelectElement).value)) }, ...CLOCK_OPTIONS.map((c) => h('option', { value: String(c.speed), selected: c.speed === this.clockSpeed }, c.label)))),
      ),
      h('div', { style: 'padding:8px 16px;color:var(--muted);font-size:13px' }, `Pick your fighter. The field is the top ${this.size - 1} other fighters by overall rating, seeded 1–${this.size}. Early rounds are 3 rounds; the final is 5.`),
      grid,
      h('div', { class: 'options' }, h('div', { class: 'spacer' }),
        h('button', { class: 'btn primary', disabled: !player, onclick: () => this.start() }, 'Create Bracket ›')),
    );
    this.body.append(fighterCard(player, 'red', 'You', true, () => {}), right);
  }

  private start() {
    if (!this.playerId) return;
    const s = createTournament({ size: this.size, division: this.division, playerId: this.playerId, difficulty: this.difficulty, arenaId: this.arenaId, clockSpeed: this.clockSpeed });
    saveTournament(s);
    this.onStart(s);
  }

  tick() {
    if (this.app.input.pressed('pause')) this.onBack();
  }
}

export class BracketScreen implements Screen {
  el: HTMLElement;
  private body: HTMLElement;
  private bar: HTMLElement;

  constructor(private app: App, private state: TournamentState, private actions: { fight: (s: TournamentState) => void; menu: () => void }) {
    this.body = h('div', { class: 'bracket' });
    this.bar = h('div', { class: 'options' });
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'topbar' }, h('button', { class: 'btn small', onclick: actions.menu }, '‹ Menu'), h('h1', null, 'Tournament'), h('span', { class: 'sub' }, `${divisionLabel(state.division)} · ${state.size} fighters`)),
      this.body, this.bar,
    );
    this.render();
  }

  private render() {
    const s = this.state;
    clear(this.body);
    clear(this.bar);
    const pm = playerMatch(s);
    s.bracket.forEach((round, r) => {
      const col = h('div', { class: 'bround' }, h('h3', null, roundName(s, r)));
      for (const m of round) {
        const box = h('div', { class: 'bm' + (m === pm ? ' next' : '') });
        for (const id of [m.a, m.b]) {
          const f = id ? FIGHTER_BY_ID[id] : null;
          const cls = 'bf' + (m.winner && id === m.winner ? ' w' : m.winner ? ' l' : '') + (id === s.playerId ? ' me' : '');
          box.append(h('div', { class: cls }, h('span', null, f ? `${s.seeds[f.id] ? `(${s.seeds[f.id]}) ` : ''}${f.name}` : 'TBD'), h('span', null, f ? recordString(f.record).split(' ')[0] : '')));
        }
        if (m.winner) box.append(h('div', { class: 'res' }, `${FIGHTER_BY_ID[m.winner].name.split(' ').slice(-1)[0]} · ${m.method}${m.detail && m.method !== 'DEC' ? ` (${m.detail})` : m.detail ? ` · ${m.detail}` : ''} · R${m.round} ${fmtClock(m.time ?? 0)}`));
        col.append(box);
      }
      this.body.append(col);
    });
    if (s.champion) {
      const champ = FIGHTER_BY_ID[s.champion];
      this.body.append(h('div', { class: 'bround' }, h('h3', null, 'Champion'), h('div', { class: 'bm next', style: 'padding:16px;text-align:center' },
        h('div', { style: 'font-family:var(--heavy);font-size:22px;text-transform:uppercase' }, champ.name),
        h('div', { style: 'color:var(--gold);letter-spacing:3px;margin-top:6px' }, s.champion === s.playerId ? 'YOU WON THE TOURNAMENT!' : 'TOURNAMENT CHAMPION'))));
      this.bar.append(h('div', { class: 'spacer' }), h('button', { class: 'btn primary', onclick: () => { saveTournament(null); this.actions.menu(); } }, 'Finish Tournament'));
      return;
    }
    const alive = playerAlive(s);
    this.bar.append(h('div', { style: 'color:var(--muted);font-size:15px' }, alive
      ? `${roundName(s, s.round)}${isFinal(s) ? ' — 5 rounds for the title' : ''}. ${pm ? 'Your bout is highlighted.' : ''}`
      : 'You have been eliminated. You can watch the rest of the bracket play out.'));
    this.bar.append(h('div', { class: 'spacer' }));
    this.bar.append(h('button', { class: 'btn', onclick: () => { saveTournament(null); this.actions.menu(); } }, 'Abandon'));
    if (pm) {
      this.bar.append(h('button', { class: 'btn primary', onclick: () => this.actions.fight(s) }, 'Fight Your Bout ›'));
    } else {
      this.bar.append(h('button', { class: 'btn primary', onclick: () => this.simRound() }, alive ? 'Simulate Round' : 'Simulate Next Round'));
    }
  }

  private simRound() {
    simulateOthers(this.state);
    advance(this.state);
    saveTournament(this.state);
    this.render();
  }

  /** After the player's bout: simulate the rest of that round and move on. */
  completeRound() {
    simulateOthers(this.state);
    advance(this.state);
    saveTournament(this.state);
    this.render();
  }

  tick() {
    void this.app;
  }
}

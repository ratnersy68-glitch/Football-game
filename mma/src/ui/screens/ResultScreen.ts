import { fmtClock } from '../../core/math';
import type { FightSession } from '../../modes/FightSession';
import type { Highlight } from '../../presentation/ReplayRecorder';
import { Renderer } from '../../render/Renderer';
import { ARENA_BY_ID } from '../../data';
import type { App, Screen } from '../App';
import { clear, h } from '../dom';
import { roundStatsTable } from './statsView';

export interface ResultActions {
  primary: { label: string; fn: () => void };
  secondary?: { label: string; fn: () => void };
  menu: () => void;
  menuLabel?: string;
}

/** WINNER / method / round / time, scorecards, fight stats (totals + per round) and highlight replays. */
export class ResultScreen implements Screen {
  el: HTMLElement;
  private replayCanvas: HTMLCanvasElement;
  private replayRenderer: Renderer;
  private playing: Highlight | null = null;
  private frameIdx = 0;
  private frameAcc = 0;
  private replayTitle: HTMLElement;
  private time = 0;

  constructor(private app: App, readonly session: FightSession, actions: ResultActions) {
    const e = session.engine;
    const r = e.result!;
    const [a, b] = e.f;
    const win = r.winner === null ? null : e.f[r.winner];
    const lose = r.winner === null ? null : e.f[r.winner === 0 ? 1 : 0];
    const methodLabel = r.method === 'DEC' ? 'DECISION' : r.method === 'SUB' ? 'SUBMISSION' : r.method === 'DRAW' ? 'DRAW' : r.method;
    const detail = r.method === 'DEC' ? r.detail : r.detail;
    const statsBox = h('div');
    const tabs = h('div', { class: 'seg' });
    const showStats = (i: number) => {
      clear(statsBox);
      statsBox.append(roundStatsTable(e, i));
      [...tabs.children].forEach((c, j) => c.classList.toggle('sel', j === i + 1));
    };
    tabs.append(h('button', { class: 'btn small', onclick: () => showStats(-1) }, 'Totals'));
    e.stats.rounds.forEach((_, i) => tabs.append(h('button', { class: 'btn small', onclick: () => showStats(i) }, `R${i + 1}`)));

    this.replayCanvas = h('canvas');
    this.replayTitle = h('div', { class: 'rtitle' }, 'Select a highlight');
    this.replayRenderer = new Renderer(this.replayCanvas, ARENA_BY_ID[session.setup.arenaId], session.setup.fighters);
    this.replayRenderer.playerSide = -1;
    const hls = [...session.replay.highlights].sort((x, y) => x.round - y.round || x.frames[0].t - y.frames[0].t);
    const hlList = h('div', { class: 'hl-list' }, ...hls.map((hl) => h('button', { class: 'hl', onclick: () => this.play(hl) }, h('small', null, `R${hl.round} · ${hl.clock} · ${hl.kind.toUpperCase()}`), hl.title)));

    const cards = r.scorecards.filter((c) => c.rounds.length > 0);
    this.el = h('div', { class: 'screen' },
      h('div', { class: 'result' },
        h('div', { class: 'inner' },
          h('div', { class: 'winner-lab' }, win ? 'WINNER' : 'RESULT'),
          h('div', { class: 'winner-name', style: win ? `color:${win.side === 0 ? '#ff4d55' : '#6f97ff'}` : '' }, win ? win.name : 'DRAW'),
          win && lose ? h('div', { class: 'def' }, 'def.') : h('div', { class: 'def' }, `${a.name} vs ${b.name}`),
          lose ? h('div', { class: 'loser-name' }, lose.name) : null,
          h('div', { class: 'method' },
            h('div', null, h('small', null, 'METHOD'), h('b', null, methodLabel), h('div', { class: 'detail' }, detail)),
            h('div', null, h('small', null, 'ROUND'), h('b', null, String(r.round))),
            h('div', null, h('small', null, 'TIME'), h('b', null, fmtClock(r.time))),
          ),
          cards.length ? h('div', { class: 'section-h' }, r.method === 'DEC' || r.method === 'DRAW' ? 'Official Scorecards' : 'Scorecards at the time of the stoppage') : null,
          cards.length ? h('div', { class: 'cards' }, ...cards.map((c) => h('div', { class: 'sc' }, h('h4', null, c.judge),
            h('table', null,
              h('tr', null, h('td'), h('td', { style: 'color:#ff5a5f' }, a.last), h('td', { style: 'color:#7ea2ff' }, b.last)),
              ...c.rounds.map((s, i) => h('tr', null, h('td', { style: 'color:var(--muted)' }, `R${i + 1}`), h('td', null, String(s[0])), h('td', null, String(s[1])))),
              h('tr', { class: 'tot' }, h('td', null, 'Total'), h('td', null, String(c.total[0])), h('td', null, String(c.total[1]))),
            )))) : null,
          h('div', { class: 'section-h' }, 'Fight Statistics', tabs),
          statsBox,
          h('div', { class: 'section-h' }, 'Highlights & Replay'),
          hls.length ? hlList : h('div', { style: 'color:var(--muted)' }, 'No highlight moments were recorded in this fight.'),
          h('div', { class: 'replay' }, this.replayCanvas, h('div', { class: 'rtag' }, 'REPLAY'), this.replayTitle),
          h('div', { class: 'btns', style: 'display:flex;gap:10px;margin-top:26px;justify-content:center' },
            h('button', { class: 'btn primary', onclick: actions.primary.fn }, actions.primary.label),
            actions.secondary ? h('button', { class: 'btn', onclick: actions.secondary.fn }, actions.secondary.label) : null,
            h('button', { class: 'btn', onclick: actions.menu }, actions.menuLabel ?? 'Main Menu'),
          ),
        ),
      ),
    );
    showStats(-1);
    const finish = hls.find((x) => x.kind === 'finish') ?? hls.find((x) => x.kind === 'knockdown') ?? hls[0];
    if (finish) this.play(finish);
  }

  private play(hl: Highlight) {
    this.playing = hl;
    this.frameIdx = 0;
    this.frameAcc = 0;
    this.replayRenderer.fighters.reset();
    this.replayTitle.textContent = `R${hl.round} ${hl.clock} — ${hl.title}`;
    const f0 = hl.frames[0];
    const c = this.replayCanvas;
    this.replayRenderer.camera.snapTo(f0, c.clientWidth || 900, c.clientHeight || 450);
  }

  tick(dt: number) {
    this.time += dt;
    const hl = this.playing;
    if (!hl) return;
    // slow motion around the key moment
    const near = Math.abs(this.frameIdx - hl.keyIndex) < 50;
    this.frameAcc += dt * 60 * (near ? 0.45 : 1);
    while (this.frameAcc >= 1) {
      this.frameAcc -= 1;
      this.frameIdx++;
      if (this.frameIdx >= hl.frames.length) this.frameIdx = 0;
    }
    const f = hl.frames[this.frameIdx];
    if (this.frameIdx === hl.keyIndex && hl.kind !== 'takedown') this.replayRenderer.camera.kick(0.5);
    this.replayRenderer.render(f, 1 / 60, this.time, 0.6);
    void this.app;
  }
}

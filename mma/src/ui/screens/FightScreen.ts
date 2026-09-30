import { FightSession } from '../../modes/FightSession';
import type { FightSetup } from '../../modes/types';
import type { UIManager, Screen } from '../UIManager';
import { cornerAdvice } from '../CornerAdvice';
import { h } from '../dom';
import { Hud } from '../Hud';
import { roundStatsTable } from './statsView';

/** The fight itself: canvas + HUD, pause menu, between-round corner, and hand-off to the result screen. */
export class FightScreen implements Screen {
  el: HTMLElement;
  session: FightSession;
  private hud: Hud;
  private overlay: HTMLElement | null = null;
  private roundOverlayShown = 0;
  private ended = false;

  constructor(private app: UIManager, readonly setup: FightSetup, private onEnd: (s: FightSession) => void, private onQuit: () => void) {
    const canvas = h('canvas');
    this.el = h('div', { class: 'fight' }, canvas);
    const label = setup.title ?? (setup.context === 'main' ? 'Main Event' : setup.context === 'tournament' ? 'Tournament' : 'Quick Fight');
    let hud!: Hud;
    this.session = new FightSession(setup, canvas, app.input, app.settings, {
      bigText: (t, ms) => hud.bigText(t, ms),
      commentary: (t, c) => hud.line(t, c),
    });
    hud = new Hud(this.session.engine, app.settings, app.input, label);
    (window as any).__fight = this.session; // debug / automated tests
    this.hud = hud;
    this.el.append(hud.el);
  }

  enter() {
    requestAnimationFrame(() => this.session.start());
  }

  tick(dt: number) {
    const s = this.session;
    const e = s.engine;
    const inp = this.app.input;
    if (inp.pressed('pause') && !this.ended) {
      if (this.overlay && s.paused) this.closeOverlay();
      else if (!this.overlay) this.pauseMenu();
    }
    s.frame(dt);
    this.hud.update(dt);
    if (e.status === 'betweenRounds' && this.roundOverlayShown !== e.round) {
      this.roundOverlayShown = e.round;
      this.betweenRounds();
    }
    if (this.overlay && e.status === 'betweenRounds' && (inp.pressed('blockHigh') || inp.pressed('jab'))) {
      // quick continue from keyboard/pad
      this.closeOverlay();
      e.startNextRound();
    }
    if (e.status === 'finished' && s.finishedFor > 3.4 && !this.ended) {
      this.ended = true;
      this.onEnd(s);
    }
  }

  private closeOverlay() {
    this.overlay?.remove();
    this.overlay = null;
    this.session.paused = false;
  }

  private pauseMenu() {
    this.session.paused = true;
    const card = h('div', { class: 'card' },
      h('h2', null, 'Paused'),
      h('div', { style: 'color:var(--muted)' }, 'The fight clock is stopped.'),
      h('div', { class: 'btns' },
        h('button', { class: 'btn primary', onclick: () => this.closeOverlay() }, 'Resume'),
        h('button', { class: 'btn', onclick: () => { this.closeOverlay(); this.session.engine.status = 'finished'; this.ended = true; this.onQuit(); } }, 'Quit to Menu'),
      ),
    );
    this.overlay = h('div', { class: 'overlay' }, card);
    this.el.append(this.overlay);
  }

  private betweenRounds() {
    const e = this.session.engine;
    const adv = cornerAdvice(e, 0);
    const card = h('div', { class: 'card', style: 'width:min(640px,94vw)' },
      h('h2', null, `End of Round ${e.round}`),
      roundStatsTable(e, e.round - 1),
      h('div', { class: 'advice' }, h('b', null, 'YOUR CORNER'), adv.verdict, h('ul', { style: 'margin:6px 0 0 18px;padding:0' }, ...adv.tips.map((t) => h('li', null, t)))),
      h('div', { class: 'btns' },
        h('button', { class: 'btn primary', onclick: () => { this.closeOverlay(); e.startNextRound(); } }, `Round ${e.round + 1}`),
        h('span', { style: 'color:var(--muted);font-size:13px;align-self:center' }, 'or press Block / Jab'),
      ),
    );
    this.overlay = h('div', { class: 'overlay' }, card);
    this.el.append(this.overlay);
  }
}

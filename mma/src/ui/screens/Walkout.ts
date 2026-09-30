import { countryCode, recordString, ARENA_BY_ID } from '../../data';
import { FightEngine } from '../../engine/FightEngine';
import type { FightSetup } from '../../modes/types';
import { snapshot } from '../../presentation/Snapshot';
import { Renderer } from '../../render/Renderer';
import { audio } from '../../audio/AudioSystem';
import type { App, Screen } from '../App';
import { clear, h } from '../dom';

/**
 * Main-event presentation: event intro card, both walkouts (challenger first), then the referee's
 * final instructions. Rendered in the real arena with the real fighter models.
 */
export class Walkout implements Screen {
  el: HTMLElement;
  private stage = 0;
  private t = 0;
  private renderer: Renderer;
  private engine: FightEngine;
  private overlay: HTMLElement;
  private time = 0;
  private stages: Array<{ dur: number; render: () => HTMLElement }>;

  constructor(private app: App, private setup: FightSetup, private onDone: () => void) {
    const canvas = h('canvas');
    this.overlay = h('div');
    this.el = h('div', { class: 'walkout' }, canvas, this.overlay, h('div', { class: 'skip' }, 'CLICK / ANY KEY TO SKIP'));
    this.engine = new FightEngine({ fighters: setup.fighters, rounds: setup.rounds, roundSeconds: 300, clockSpeed: 1, seed: 1, arenaId: setup.arenaId });
    this.renderer = new Renderer(canvas, ARENA_BY_ID[setup.arenaId], setup.fighters);
    this.renderer.playerSide = -1;
    const [a, b] = setup.fighters;
    const arena = ARENA_BY_ID[setup.arenaId];
    const lower = (k: string, n: string, d: string) => h('div', { class: 'lower3' }, h('div', { class: 'k' }, k), h('div', { class: 'n' }, n), h('div', { class: 'd' }, d));
    this.stages = [
      { dur: 3.2, render: () => lower(arena.city.toUpperCase(), setup.title ?? 'MAIN EVENT', `${arena.name} · ${setup.rounds} rounds · ${arena.capacity.toLocaleString()} in attendance`) },
      { dur: 3.6, render: () => lower('FIGHTING OUT OF THE BLUE CORNER', b.name, `${b.nickname ? `“${b.nickname}” · ` : ''}${recordString(b.record)} · ${countryCode(b.country)} · ${b.weightLbs} lbs`) },
      { dur: 3.6, render: () => lower('FIGHTING OUT OF THE RED CORNER', a.name, `${a.nickname ? `“${a.nickname}” · ` : ''}${recordString(a.record)} · ${countryCode(a.country)} · ${a.weightLbs} lbs`) },
      { dur: 3.0, render: () => lower('REFEREE', 'Final instructions', 'Protect yourselves at all times. Obey my commands. Touch gloves — let’s go!') },
    ];
    this.el.addEventListener('click', () => this.finish());
    this.showStage();
  }

  private showStage() {
    clear(this.overlay);
    const s = this.stages[this.stage];
    if (s) this.overlay.append(s.render());
    audio.cue('cheer');
  }

  private done = false;
  private finish() {
    if (this.done) return;
    this.done = true;
    this.onDone();
  }

  tick(dt: number) {
    this.t += dt;
    this.time += dt;
    if (this.app.input.anyPressed() && this.time > 0.4) return this.finish();
    const [a, b] = this.engine.f;
    // stage the fighters: the announced fighter walks to centre, the other waits in the corner
    const walk = Math.min(1, this.t / 2.2);
    if (this.stage === 1) {
      b.pos = { x: 4.0 - 2.4 * walk, z: 1.2 - 1.2 * walk };
      a.pos = { x: -3.6, z: 0 };
      b.vel = { x: -1, z: 0 };
    } else if (this.stage === 2) {
      a.pos = { x: -4.0 + 2.4 * walk, z: 1.2 - 1.2 * walk };
      b.pos = { x: 1.6, z: 0 };
      a.vel = { x: 1, z: 0 };
    } else if (this.stage === 3) {
      a.pos = { x: -0.8, z: 0 };
      b.pos = { x: 0.8, z: 0 };
    } else {
      a.pos = { x: -3.6, z: 0 };
      b.pos = { x: 3.6, z: 0 };
    }
    if (walk >= 1) {
      a.vel = { x: 0, z: 0 };
      b.vel = { x: 0, z: 0 };
    }
    a.facing = Math.atan2(b.pos.z - a.pos.z, b.pos.x - a.pos.x);
    b.facing = Math.atan2(a.pos.z - b.pos.z, a.pos.x - b.pos.x);
    this.renderer.render(snapshot(this.engine), dt, this.time, 0.55);
    audio.crowd(0.6, true);
    const s = this.stages[this.stage];
    if (this.t >= s.dur) {
      this.stage++;
      this.t = 0;
      if (this.stage >= this.stages.length) return this.finish();
      this.showStage();
    }
    void this.setup;
  }
}

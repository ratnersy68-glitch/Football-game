import { audio } from '../audio/AudioSystem';
import { InputManager } from '../input/InputManager';
import { clear } from './dom';
import { loadSettings, saveSettings, type Settings } from './Settings';

export interface Screen {
  el: HTMLElement;
  enter?(): void;
  leave?(): void;
  tick?(dt: number): void;
}

/** Owns the root element, shared services and the single requestAnimationFrame loop. */
export class UIManager {
  readonly input = new InputManager();
  settings: Settings = loadSettings();
  private current: Screen | null = null;
  private last = performance.now();

  constructor(readonly root: HTMLElement) {
    audio.setEnabled(this.settings.audio, this.settings.volume);
    const unlock = () => {
      audio.init();
      audio.setEnabled(this.settings.audio, this.settings.volume);
      audio.resume();
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('keydown', unlock);
    requestAnimationFrame(this.frame);
  }

  saveSettings() {
    saveSettings(this.settings);
    audio.setEnabled(this.settings.audio, this.settings.volume);
  }

  show(s: Screen) {
    this.current?.leave?.();
    clear(this.root);
    this.current = s;
    this.root.append(s.el);
    s.enter?.();
  }

  private frame = (ts: number) => {
    const dt = Math.min(0.1, (ts - this.last) / 1000);
    this.last = ts;
    this.input.poll();
    try {
      this.current?.tick?.(dt);
    } catch (err) {
      console.error(err);
    }
    requestAnimationFrame(this.frame);
  };
}

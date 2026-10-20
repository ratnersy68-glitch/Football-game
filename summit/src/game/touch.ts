/** Touch-device detection and the on-screen control labels used in hints. */

function detect(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    if (/[?&]touch\b/.test(window.location.search)) return true;
    return window.matchMedia('(pointer: coarse)').matches || (navigator.maxTouchPoints > 0 && !window.matchMedia('(pointer: fine)').matches);
  } catch { return false; }
}

export const IS_TOUCH = detect();

/** What to call each control in on-screen hints. */
export const HINT = IS_TOUCH
  ? { lift: 'LIFT', reset: 'RESET', fast: 'stick ↑', map: 'MAP', replay: 'REPLAY' }
  : { lift: 'F', reset: 'R', fast: 'W', map: 'M', replay: 'V' };

/** Analog state written by the on-screen controls and merged into Input.read(). */
export interface TouchState {
  steer: number; tuck: boolean; brake: boolean; carve: boolean; jump: boolean;
  spin: number; flip: number; tilt: number; grab: number;
}

export function emptyTouch(): TouchState {
  return { steer: 0, tuck: false, brake: false, carve: false, jump: false, spin: 0, flip: 0, tilt: 0, grab: 0 };
}

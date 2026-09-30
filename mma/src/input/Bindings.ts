/** Logical inputs. Everything the player can do maps to one of these; keys/buttons map onto them. */
export type Logical =
  | 'up' | 'down' | 'left' | 'right'
  | 'jab' | 'cross' | 'leadHook' | 'rearHook' | 'leadKick' | 'rearKick'
  | 'modBody' | 'modSpecial' | 'modHigh' | 'padUpper'
  | 'blockHigh' | 'blockLow' | 'slip' | 'duck' | 'pull' | 'sidestep'
  | 'clinch' | 'takedown' | 'transition' | 'submission' | 'getup' | 'feint' | 'switchStance' | 'pause';

export interface BindingInfo {
  id: Logical;
  label: string;
  group: 'Movement' | 'Striking' | 'Modifiers' | 'Defense' | 'Grappling' | 'Other';
  help: string;
}

export const BINDING_INFO: BindingInfo[] = [
  { id: 'up', label: 'Move Up', group: 'Movement', help: 'Also: pick the ↑ prompt in submission scrambles' },
  { id: 'down', label: 'Move Down', group: 'Movement', help: '' },
  { id: 'left', label: 'Move Left', group: 'Movement', help: '' },
  { id: 'right', label: 'Move Right', group: 'Movement', help: '' },
  { id: 'jab', label: 'Jab', group: 'Striking', help: 'Clinch: short punch · Ground: punch' },
  { id: 'cross', label: 'Cross', group: 'Striking', help: 'Clinch: short punch · Ground: punch' },
  { id: 'leadHook', label: 'Lead Hook', group: 'Striking', help: 'Clinch/ground: elbow' },
  { id: 'rearHook', label: 'Rear Hook', group: 'Striking', help: 'Clinch/ground: elbow' },
  { id: 'leadKick', label: 'Lead Kick', group: 'Striking', help: 'Inside leg kick · Clinch: knee' },
  { id: 'rearKick', label: 'Rear Kick', group: 'Striking', help: 'Leg kick · Clinch: knee' },
  { id: 'modBody', label: 'Body Modifier', group: 'Modifiers', help: 'Punches/kicks go to the body' },
  { id: 'modSpecial', label: 'Special Modifier', group: 'Modifiers', help: 'Uppercuts, overhand, spinning backfist, front kick, calf kick, knees up close' },
  { id: 'modHigh', label: 'High Modifier', group: 'Modifiers', help: 'Kicks go to the head · with Special: spinning back kick, flying knee, superman punch' },
  { id: 'padUpper', label: 'Pad: Hook / High', group: 'Modifiers', help: 'Gamepad only: turns jab/cross into hooks and kicks into head kicks' },
  { id: 'blockHigh', label: 'High Block', group: 'Defense', help: 'Hold. With Body modifier = low block. Ground: cover up' },
  { id: 'blockLow', label: 'Low Block / Check / Sprawl', group: 'Defense', help: 'Hold. Checks leg kicks, sprawls on shots, frames on the ground' },
  { id: 'slip', label: 'Slip', group: 'Defense', help: 'Slips straight punches (direction from left/right)' },
  { id: 'duck', label: 'Duck', group: 'Defense', help: 'Under hooks and head kicks — but uppercuts and knees punish it' },
  { id: 'pull', label: 'Pull Back', group: 'Defense', help: 'Lean/step out of range' },
  { id: 'sidestep', label: 'Side Step', group: 'Defense', help: 'Quick lateral step to steal an angle' },
  { id: 'clinch', label: 'Clinch', group: 'Grappling', help: 'Tie up at close range' },
  { id: 'takedown', label: 'Takedown', group: 'Grappling', help: 'Double leg · Body mod: single leg · Clinch: trip/cage takedown · Press during a kick to catch it' },
  { id: 'transition', label: 'Transition', group: 'Grappling', help: 'Ground: pass/advance or sweep/escape · High mod: take the back · Clinch: pummel/pin to cage' },
  { id: 'submission', label: 'Submission', group: 'Grappling', help: 'Body/Special modifiers pick alternative holds. After sprawling: guillotine' },
  { id: 'getup', label: 'Get Up / Break', group: 'Grappling', help: 'Stand up, break the clinch, or hurry up after a knockdown (tap)' },
  { id: 'feint', label: 'Feint', group: 'Other', help: 'Fake the strike you would throw with the current modifiers (defaults to cross)' },
  { id: 'switchStance', label: 'Switch Stance', group: 'Other', help: 'Protect a damaged lead leg' },
  { id: 'pause', label: 'Pause', group: 'Other', help: '' },
];

export type KeyBindings = Record<Logical, string[]>;
export type PadBindings = Partial<Record<Logical, number[]>>;

export const DEFAULT_KEYS: KeyBindings = {
  up: ['KeyW', 'ArrowUp'], down: ['KeyS', 'ArrowDown'], left: ['KeyA', 'ArrowLeft'], right: ['KeyD', 'ArrowRight'],
  jab: ['KeyJ'], cross: ['KeyK'], leadHook: ['KeyU'], rearHook: ['KeyI'], leadKick: ['KeyN'], rearKick: ['KeyM'],
  modBody: ['KeyE'], modSpecial: ['KeyQ'], modHigh: ['ShiftLeft', 'ShiftRight'], padUpper: [],
  blockHigh: ['Space'], blockLow: ['KeyC'], slip: ['KeyL'], duck: ['KeyO'], pull: ['Semicolon'], sidestep: ['KeyF'],
  clinch: ['KeyG'], takedown: ['KeyT'], transition: ['KeyR'], submission: ['KeyY'], getup: ['KeyX'],
  feint: ['KeyV'], switchStance: ['KeyZ'], pause: ['Escape', 'KeyP'],
};

/** Standard-mapping gamepad buttons. Sticks are handled separately (left = move, right = head movement). */
export const DEFAULT_PAD: PadBindings = {
  jab: [2], cross: [3], leadKick: [0], rearKick: [1],
  modBody: [4], padUpper: [5], modSpecial: [6], blockHigh: [7],
  transition: [12], getup: [13], clinch: [14], takedown: [15],
  submission: [11], feint: [10], switchStance: [8], pause: [9],
  up: [], down: [], left: [], right: [],
};

export const PAD_BUTTON_NAMES = ['A', 'B', 'X', 'Y', 'LB', 'RB', 'LT', 'RT', 'Back', 'Start', 'L3', 'R3', 'D-Up', 'D-Down', 'D-Left', 'D-Right', 'Home'];

export function keyName(code: string): string {
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  const map: Record<string, string> = {
    Space: 'Space', ShiftLeft: 'L-Shift', ShiftRight: 'R-Shift', Semicolon: ';', Escape: 'Esc', ArrowUp: '↑', ArrowDown: '↓',
    ArrowLeft: '←', ArrowRight: '→', Comma: ',', Period: '.', Slash: '/', Quote: "'", BracketLeft: '[', BracketRight: ']',
    Enter: 'Enter', Tab: 'Tab', Backspace: 'Bksp', ControlLeft: 'L-Ctrl', AltLeft: 'L-Alt',
  };
  return map[code] ?? code;
}

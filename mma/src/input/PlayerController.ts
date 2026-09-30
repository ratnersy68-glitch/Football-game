import { resolveStrike, type StrikeButton } from '../data';
import type { FightEngine } from '../engine/FightEngine';
import { emptyCommand, type Command, type Side } from '../engine/types';
import type { InputManager } from './InputManager';

/** Turns player input into engine Commands, resolving context-sensitive strikes and grappling. */
export class PlayerController {
  constructor(private e: FightEngine, readonly side: Side, private input: InputManager) {}

  update(): Command {
    const e = this.e;
    const inp = this.input;
    const cmd = emptyCommand();
    const ctx = e.context(this.side);
    const mv = inp.moveVector();
    // Screen right = +x, screen up = -z (camera looks from +z).
    cmd.move = { x: mv.x, z: mv.y };

    if (ctx === 'subAttack' || ctx === 'subDefend') {
      cmd.move = { x: 0, z: 0 };
      if (inp.dirPressed) cmd.subKey = inp.dirPressed;
      return cmd;
    }
    const body = inp.held('modBody');
    const special = inp.held('modSpecial');
    const upper = inp.held('padUpper');
    const high = inp.held('modHigh');

    // Guard
    if (inp.held('blockLow') || (inp.held('blockHigh') && body)) cmd.guard = 'low';
    else if (inp.held('blockHigh')) cmd.guard = 'high';

    if (ctx === 'down') {
      if (inp.pressed('getup')) cmd.actions.push({ type: 'getup' });
      return cmd;
    }

    const strikeCtx = ctx === 'clinch' ? 'clinch' : ctx === 'groundTop' ? 'groundTop' : ctx === 'groundBottom' ? 'groundBottom' : 'stand';
    const close = e.distance() < 0.95;
    const buttons: StrikeButton[] = ['jab', 'cross', 'leadHook', 'rearHook', 'leadKick', 'rearKick'];
    for (let btn of buttons) {
      if (!inp.pressed(btn)) continue;
      let hi = high;
      if (upper) {
        // gamepad RB: jab/cross become hooks, kicks go high
        if (btn === 'jab') btn = 'leadHook';
        else if (btn === 'cross') btn = 'rearHook';
        else hi = true;
      }
      const id = resolveStrike(strikeCtx, btn, { body, special, high: hi }, close);
      cmd.actions.push({ type: 'strike', id });
    }
    if (inp.pressed('feint') && ctx === 'stand') {
      const btn: StrikeButton = special || body ? 'rearKick' : 'cross';
      cmd.actions.push({ type: 'feint', id: resolveStrike('stand', btn, { body, special: false, high }, false) });
    }

    // Head movement (keys or right stick)
    const dir = mv.x < -0.3 ? -1 : mv.x > 0.3 ? 1 : 1;
    const flick = inp.rightStickFlick;
    if (inp.pressed('slip') || flick === 'left' || flick === 'right') {
      const d = flick === 'left' ? -1 : flick === 'right' ? 1 : dir;
      const move = inp.held('blockHigh') && flick ? 'sidestep' : 'slip';
      cmd.actions.push({ type: 'defend', move, dir: d });
    }
    if (inp.pressed('duck') || flick === 'down') cmd.actions.push({ type: 'defend', move: 'duck', dir });
    if (inp.pressed('pull') || flick === 'up') cmd.actions.push({ type: 'defend', move: 'pull', dir });
    if (inp.pressed('sidestep')) cmd.actions.push({ type: 'defend', move: 'sidestep', dir: mv.y < -0.3 ? -1 : mv.y > 0.3 ? 1 : dir });

    // Grappling
    if (inp.pressed('clinch')) cmd.actions.push({ type: 'clinch' });
    if (inp.pressed('takedown')) cmd.actions.push({ type: 'takedown', variant: body ? 'single' : special ? 'trip' : 'double' });
    if (inp.pressed('transition')) cmd.actions.push({ type: 'transition', alt: high || upper });
    if (inp.pressed('submission')) cmd.actions.push({ type: 'submission', index: body ? 1 : special ? 2 : 0 });
    if (inp.pressed('getup')) cmd.actions.push({ type: 'getup' });
    if (inp.pressed('switchStance')) cmd.actions.push({ type: 'switchStance' });
    return cmd;
  }
}

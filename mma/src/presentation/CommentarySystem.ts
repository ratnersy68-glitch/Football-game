import { POSITION_NAMES, STRIKES, SUBMISSIONS } from '../data';
import type { FightEngine } from '../engine/FightEngine';
import { cageDistance } from '../engine/Octagon';
import type { FightEvent, Side } from '../engine/types';
import type { Rng } from '../core/rng';

export interface CommentaryLine {
  text: string;
  t: number;
  priority: number;
  voice: 'pbp' | 'color';
}

type Vars = Record<string, string>;

const L: Record<string, string[]> = {
  bigPunch: ['Huge {strike} from {a}!', 'What a {strike}! {a} lands flush!', '{a} cracks him with the {strike}!', 'Big shot! {strike} lands for {a}!', 'Oh, {d} felt that {strike}!'],
  bigKick: ['Thudding {strike} from {a}!', '{a} lands the {strike} — you could hear that one in the rafters!', 'Big {strike}! {a} is committing to those kicks.'],
  counter: ['Beautiful counter from {a}!', '{a} times it perfectly — counter {strike}!', 'Right on the button! {a} catches him coming in.', 'Textbook counter from {a}.', '{d} walked right into that {strike}.'],
  combo: ['Nice combination from {a} — {combo}.', '{a} strings it together: {combo}!', 'Crisp {combo} from {a}.', 'That {combo} was sharp.'],
  flush: ['Flush! Right on the chin!', 'That landed clean!', 'Right down the pipe!'],
  bodyShot: ['{a} goes downstairs.', 'Great body work from {a}.', 'That body shot will add up.', '{a} digging to the body.'],
  legKick: ['{a} chopping at the lead leg.', 'Another kick to the leg of {d}.', 'Those leg kicks are adding up.', '{a} goes back to the leg.'],
  checked: ['{d} checks it!', 'Checked! {a} might have hurt his own shin there.', 'Nice check from {d}.'],
  slipped: ['{d} slips it nicely.', 'Great head movement from {d}.', '{d} makes him miss.', 'Just a whiff — {d} is reading it.'],
  rocked: ['{d} is hurt!', "He's badly hurt!", '{d} is wobbled!', "{d}'s legs are gone!", '{d} is in serious trouble!'],
  knockdown: ['DOWN GOES {d}!', '{a} DROPS HIM!', 'KNOCKDOWN! {a} puts {d} on the canvas!', '{d} IS DOWN!'],
  flashKd: ['Flash knockdown — {d} pops right back up.', 'He touched down! {d} is back up but that counts.'],
  bodyKd: ['{d} folds from the body shot!', 'Right to the liver — {d} crumbles!'],
  legKd: ['The leg gives out! {d} goes down!', "{d}'s leg buckles under him!"],
  pounce: ['{a} jumps on him!', '{a} follows him to the mat!', 'And {a} dives in for the finish!'],
  recovered: ['{d} is back on his feet.', 'He survives the knockdown!', '{d} recovers — tough, tough man.'],
  tdAttempt: ['{a} shoots for the takedown!', 'Level change from {a}!', '{a} dives on a {variant}!', "{a} wants this on the mat."],
  kickCaught: ['{a} catches the kick!', 'Caught it! {a} has the leg!'],
  takedown: ['{a} gets him down!', 'Beautiful takedown from {a}!', "{a} dumps him to the mat — he's in {pos}.", 'And {a} completes the {variant}!', 'Takedown {a}!'],
  tdDefended: ['{d} stuffs it!', 'Great sprawl from {d}!', '{d} defends the takedown.', 'No dice — {d} keeps it standing.'],
  clinch: ['{a} ties him up.', 'They clinch up.', '{a} closes the distance and grabs the clinch.'],
  cagePin: ['{a} pins him against the cage.', '{a} walks him to the fence.', 'Grinding against the cage now.'],
  clinchBreak: ['They break apart.', '{a} creates separation.', 'Back to the centre.'],
  refBreak: ['The referee separates them.', "Referee's had enough of that — break!"],
  pass: ['{a} passes to {pos}.', 'Smooth transition — {a} is now in {pos}.', '{a} advances to {pos}.'],
  mount: ['{a} takes the mount! This is dangerous!', 'Full mount for {a}!'],
  back: ['{a} takes the back!', "{a} is on the back — he'll be hunting the choke.", 'Back control for {a}!'],
  sweep: ['What a sweep from {a}!', 'Reversal! {a} ends up on top!', '{a} turns it around!'],
  escape: ['{a} works back to {pos}.', 'Good escape from {a}.', '{a} recovers {pos}.'],
  standupGetup: ['{a} gets back to his feet.', 'Great wall-walk from {a}, back up.', '{a} scrambles up.'],
  standupRef: ['Referee stands them up.', "The ref's seen enough inactivity — stand them up."],
  standupDisengage: ['{a} lets him back up.', '{a} stands up out of it.'],
  subAttempt: ['{a} is going for a {sub}!', '{sub}! {a} is hunting the finish!', '{a} locks up a {sub}!', 'He has a {sub} attempt!'],
  subTight: ['That looks tight!', "It's deep! {d} is in trouble!", '{d} might have to tap!'],
  subEscape: ['{d} escapes!', 'He survives the {sub}!', 'Great defence from {d} — he pops out.'],
  cut: ['{d} is cut.', "There's blood — {d} has a cut.", 'That opened up a cut on {d}.'],
  legHurt: ['That leg is becoming a major problem for {d}.', "{d} is limping — those kicks are doing damage.", "{d} can barely put weight on that leg."],
  bodyHurt: ['The body shots are slowing {d} down.', "{d} is feeling those shots to the body."],
  tired: ['{d} looks exhausted.', "{d}'s mouth is open — he's tired.", 'Cardio is becoming a factor for {d}.'],
  switchStance: ['{a} switches stances.', '{a} flips to {stance}.'],
  tenSeconds: ['Ten seconds remaining!', 'Ten seconds left in the round!', 'Here come the final ten seconds!'],
  roundStart: ['Round {round} is underway.', "Here we go, round {round}.", 'Round {round} — touch gloves and fight.'],
  roundEndClose: ['That round could go either way.', 'Close round — tough to score.'],
  roundEnd: ["That's the end of round {round}.", 'There goes the horn — end of round {round}.'],
  stall: ['The crowd is getting restless.', 'Not much happening here.'],
  center: ['{a} is controlling the centre of the Octagon.', '{a} owns the centre, {d} circling on the outside.', '{d} keeps getting backed up to the fence.'],
  volume: ['{a} has out-landed {d} {x} to {y}.', 'The output favours {a}: {x} significant strikes to {y}.'],
  feint: ['Nice feint from {a}.', '{a} showing feints, drawing reactions.'],
};

function feminise(t: string) {
  return t
    .replace(/\bHe's\b/g, "She's").replace(/\bhe's\b/g, "she's").replace(/\bHe\b/g, 'She').replace(/\bhe\b/g, 'she')
    .replace(/\bhim\b/g, 'her').replace(/\bhis\b/g, 'her').replace(/\bHis\b/g, 'Her').replace(/tough man/g, 'tough woman');
}

/** Dynamic text commentary with anti-repetition. */
export class CommentarySystem {
  lines: CommentaryLine[] = [];
  private recent: string[] = [];
  private catCooldown: Record<string, number> = {};
  private lastColor = 0;
  private lastPos = '';
  private pending: CommentaryLine[] = [];

  constructor(private e: FightEngine, private rng: Rng) {
    e.bus.on((ev) => this.onEvent(ev));
  }

  private say(cat: string, v: Vars, priority = 1, cooldown = 0, voice: 'pbp' | 'color' = 'pbp') {
    const e = this.e;
    if (cooldown && (this.catCooldown[cat] ?? -99) > e.time) return;
    if (cooldown) this.catCooldown[cat] = e.time + cooldown;
    const pool = L[cat];
    if (!pool) return;
    const fresh = pool.filter((l) => !this.recent.includes(l));
    const tpl = this.rng.pick(fresh.length ? fresh : pool);
    this.recent.push(tpl);
    if (this.recent.length > 30) this.recent.shift();
    let text = tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
    if (e.f[0].data.gender === 'F') text = feminise(text);
    this.pending.push({ text, t: e.time, priority, voice });
  }

  /** Lines emitted since the last call (highest priority first). */
  take(): CommentaryLine[] {
    const p = this.pending.sort((a, b) => b.priority - a.priority);
    this.pending = [];
    // don't flood: keep at most 2 per tick
    const out = p.slice(0, 2);
    this.lines.push(...out);
    if (this.lines.length > 200) this.lines.splice(0, this.lines.length - 200);
    return out;
  }

  private names(att: Side): Vars {
    const e = this.e;
    return { a: e.f[att].last, d: e.f[att === 0 ? 1 : 0].last };
  }

  private onEvent(ev: FightEvent) {
    const e = this.e;
    switch (ev.type) {
      case 'strikeLanded': {
        const s = STRIKES[ev.id];
        const v = { ...this.names(ev.side), strike: s.name.toLowerCase(), combo: ev.combo ?? '' };
        if (ev.counter === 'timed' && ev.dmg >= 5) this.say('counter', v, 3, 2);
        else if (ev.big && ev.dmg >= 7.5) this.say(s.kind === 'kick' || s.kind === 'knee' ? 'bigKick' : 'bigPunch', v, 3, 1.5);
        else if (ev.combo && ev.combo.split(',').length >= 1 && this.rng.chance(0.5)) this.say('combo', v, 2, 4);
        else if (ev.flush) this.say('flush', v, 2, 4);
        else if (s.target === 'body' && ev.dmg > 5) this.say('bodyShot', v, 1, 8);
        else if (s.target === 'leg' && ev.dmg > 4.5) this.say('legKick', v, 1, 9);
        break;
      }
      case 'strikeBlocked':
        if (ev.checked) this.say('checked', this.names(ev.side), 1, 10);
        break;
      case 'strikeMissed':
        if (ev.evaded === 'slip' || ev.evaded === 'duck') this.say('slipped', this.names(ev.side), 1, 10);
        break;
      case 'feint':
        this.say('feint', this.names(ev.side), 0, 25, 'color');
        break;
      case 'rocked':
        this.say('rocked', this.names(ev.side === 0 ? 1 : 0), 4, 3);
        break;
      case 'knockdown': {
        const v = this.names(ev.side === 0 ? 1 : 0);
        v.d = v.d.toUpperCase();
        v.a = v.a.toUpperCase();
        this.say('knockdown', v, 5);
        if (ev.kind === 'body') this.say('bodyKd', this.names(ev.side === 0 ? 1 : 0), 4);
        else if (ev.kind === 'leg') this.say('legKd', this.names(ev.side === 0 ? 1 : 0), 4);
        else if (!ev.heavy) this.say('flashKd', this.names(ev.side === 0 ? 1 : 0), 3);
        break;
      }
      case 'pounce': this.say('pounce', this.names(ev.side), 4); break;
      case 'recoveredFromKnockdown': this.say('recovered', this.names(ev.side === 0 ? 1 : 0), 2); break;
      case 'kickCaught': this.say('kickCaught', this.names(ev.side), 3); break;
      case 'takedownAttempt': this.say('tdAttempt', { ...this.names(ev.side), variant: ev.variant === 'double' ? 'double leg' : ev.variant === 'single' ? 'single leg' : ev.variant === 'trip' ? 'trip' : 'takedown against the cage' }, 2, 3); break;
      case 'takedown': this.say('takedown', { ...this.names(ev.side), pos: POSITION_NAMES[ev.pos].toLowerCase(), variant: ev.variant === 'double' ? 'double leg' : ev.variant === 'single' ? 'single leg' : ev.variant === 'trip' ? 'trip' : 'cage takedown' }, 3); break;
      case 'takedownDefended': this.say('tdDefended', this.names(ev.side === 0 ? 1 : 0), 2, 2); break;
      case 'clinchAttempt': if (ev.success) this.say('clinch', this.names(ev.side), 1, 6); break;
      case 'cagePin': this.say('cagePin', this.names(ev.side), 1, 10); break;
      case 'clinchBroken': this.say(ev.reason === 'ref' ? 'refBreak' : 'clinchBreak', this.names(ev.side === -1 ? 0 : ev.side), 1, 5); break;
      case 'positionChange': {
        const v = { ...this.names(ev.side), pos: POSITION_NAMES[ev.to as keyof typeof POSITION_NAMES]?.toLowerCase() ?? ev.to };
        if (ev.kind === 'sweep') this.say('sweep', v, 3);
        else if (ev.kind === 'escape') this.say('escape', v, 2, 3);
        else if (ev.to === 'mount') this.say('mount', v, 3);
        else if (ev.to === 'backControl') this.say('back', v, 3);
        else this.say('pass', v, 2, 2);
        break;
      }
      case 'standup':
        if (ev.reason === 'ref') this.say('standupRef', {}, 2);
        else if (ev.side !== -1) this.say(ev.reason === 'getup' ? 'standupGetup' : 'standupDisengage', this.names(ev.side), 2);
        break;
      case 'subAttempt': this.say('subAttempt', { ...this.names(ev.side), sub: SUBMISSIONS[ev.subId].name.toLowerCase() }, 4); break;
      case 'subTight': this.say('subTight', this.names(ev.side), 4); break;
      case 'subEscape': this.say('subEscape', { ...this.names(ev.side === 0 ? 1 : 0), sub: SUBMISSIONS[ev.subId].name.toLowerCase() }, 3); break;
      case 'cut': this.say('cut', this.names(ev.side === 0 ? 1 : 0), 2, 30, 'color'); break;
      case 'legHurt': if (ev.level >= 50) this.say('legHurt', this.names(ev.side === 0 ? 1 : 0), 2, 25, 'color'); break;
      case 'bodyHurt': if (ev.level >= 45) this.say('bodyHurt', this.names(ev.side === 0 ? 1 : 0), 2, 25, 'color'); break;
      case 'tired': this.say('tired', this.names(ev.side === 0 ? 1 : 0), 1, 30, 'color'); break;
      case 'switchStance': this.say('switchStance', { ...this.names(ev.side), stance: e.f[ev.side].stance }, 0, 20); break;
      case 'tenSeconds': this.say('tenSeconds', {}, 3); break;
      case 'roundStart': this.say('roundStart', { round: String(ev.round) }, 2); break;
      case 'roundEnd': {
        const close = ev.scores.some((s) => s[0] > s[1]) && ev.scores.some((s) => s[1] > s[0]);
        this.say(close ? 'roundEndClose' : 'roundEnd', { round: String(ev.round) }, 2);
        break;
      }
      case 'stall': this.say('stall', {}, 0, 20, 'color'); break;
    }
  }

  /** Periodic colour commentary (called every frame). */
  update() {
    const e = this.e;
    if (e.status !== 'fighting' || e.time - this.lastColor < 11) return;
    this.lastColor = e.time;
    const r = e.stats.rounds[e.round - 1];
    if (!r) return;
    if (e.mode === 'ground' && e.ground) {
      const key = e.ground.top + e.ground.pos;
      if (key !== this.lastPos) {
        this.lastPos = key;
        return;
      }
    }
    if (e.mode === 'stand') {
      const c0 = cageDistance(e.f[0].pos);
      const c1 = cageDistance(e.f[1].pos);
      if (Math.abs(c0 - c1) > 1.5 && this.rng.chance(0.6)) {
        const centre: Side = c0 > c1 ? 0 : 1;
        this.say('center', this.names(centre), 0, 25, 'color');
        return;
      }
    }
    const t0 = e.stats.totals(0).sigLanded;
    const t1 = e.stats.totals(1).sigLanded;
    if (Math.abs(t0 - t1) >= 10 && this.rng.chance(0.5)) {
      const lead: Side = t0 > t1 ? 0 : 1;
      this.say('volume', { ...this.names(lead), x: String(Math.max(t0, t1)), y: String(Math.min(t0, t1)) }, 0, 40, 'color');
    }
  }
}

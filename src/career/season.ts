/**
 * Player career: one college season lived week by week. Pure logic (no DOM) so it runs in tests.
 *
 * Each week is a calendar of 7 days × 3 slots (morning / afternoon / evening). Fixed team events
 * (class, practice, walkthrough, game day) come from the week template; free slots are filled by the
 * player or by plans made on the phone with friends, family, coaches and the academic advisor.
 * Every activity moves four meters — energy, morale, grades, coach trust — and training earns XP that
 * permanently raises the player's ratings. Grades below the eligibility line keep him out of games;
 * low coach trust costs him the first quarter.
 */
import actJson from './data/activities.json';
import { Rng } from '../core/rng';
import { TEAMS, TEAM_BY_ID } from '../data';
import { generateSchedule } from '../simulation/scheduleGenerator';
import { teammates } from '../play/engine/roster';
import { emptyDriveStats, type DriveStats } from '../play/engine/drive';
import { simGame } from '../play/engine/possession';
import { buildMatch } from '../play/engine/roster';
import { playerOverall, posDef, ratings, type CreatedPlayer } from './player';

// ───────────── data ─────────────

export type XpTag = 'power' | 'speed' | 'skill' | 'mind';
export interface ActivityDef {
  name: string;
  icon: string;
  fixed?: boolean;
  effects: Partial<Record<Meter, number>>;
  xp?: Partial<Record<XpTag, number>>;
  partner?: string;
  skip?: { name: string; effects: Partial<Record<Meter, number>> };
}
export const ACT = actJson as unknown as {
  slots: string[];
  days: string[];
  template: Record<'game' | 'bye', (string | null)[][]>;
  activities: Record<string, ActivityDef>;
  freeChoices: string[];
  invites: Record<string, string[]>;
  declines: string[];
  theirDeclines: string[];
  theirAccepts: string[];
  chatter: Record<string, string[]>;
};

export type Meter = 'energy' | 'morale' | 'grades' | 'trust';
export const ELIGIBLE_GRADES = 40;
export const BENCH_TRUST = 35;

const XP_ATTRS: Record<XpTag, string[]> = {
  power: ['strength', 'breakTackle', 'stiffArm', 'blocking', 'throwPower', 'breakSack'],
  speed: ['speed', 'acceleration', 'agility', 'stamina'],
  skill: ['shortAccuracy', 'mediumAccuracy', 'deepAccuracy', 'throwOnRun', 'catching', 'routeRunning', 'release', 'contested', 'carry', 'juke', 'spin'],
  mind: ['awareness', 'underPressure', 'playAction'],
};

// ───────────── state ─────────────

export type ContactRole = 'family' | 'coach' | 'advisor' | 'gym' | 'study' | 'social' | 'chill';

export interface Contact {
  id: string;
  name: string;
  /** Short label under the name ("Mom", "WR Coach", "Teammate · LB #44"). */
  label: string;
  role: ContactRole;
  /** Relationship 0–100. */
  rel: number;
  avatar: string;
  color: string;
}

export interface Invite {
  activity: string;
  day: number;
  slot: number;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

export interface Message {
  id: number;
  contact: string;
  /** true = sent by the player. */
  mine: boolean;
  text: string;
  /** Absolute day index (week * 7 + day) for ordering. */
  at: number;
  invite?: Invite;
  read: boolean;
}

export interface CareerGame {
  week: number;
  opponentId: string;
  home: boolean;
  conference: boolean;
  neutral?: string;
  played: boolean;
  result?: { us: number; them: number; stats: DriveStats; simmed: boolean; played: boolean };
}

export interface PlanEntry {
  activity: string;
  with?: string;
}

export interface DayLog {
  week: number;
  day: number;
  slot: number;
  text: string;
  tone: 'good' | 'bad' | 'info';
}

export interface CareerState {
  version: 1;
  seed: number;
  season: number;
  player: CreatedPlayer;
  schedule: CareerGame[];
  /** Calendar week number (1-based, matches the schedule). */
  week: number;
  day: number;
  slot: number;
  meters: Record<Meter, number>;
  contacts: Contact[];
  messages: Message[];
  /** Planned free slots for the current week, keyed `${day}-${slot}`. */
  plans: Record<string, PlanEntry>;
  log: DayLog[];
  seasonStats: DriveStats;
  nextMsgId: number;
  over: boolean;
  /** Rating gains this season, for the summary. */
  gains: Record<string, number>;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
export const LAST_WEEK = 14;

// ───────────── creation ─────────────

export function newCareer(player: CreatedPlayer, seed = Date.now() % 1_000_000): CareerState {
  const season = 2026;
  const teamId = player.teamId;
  const games = generateSchedule(season, seed, TEAMS).filter((g) => g.homeId === teamId || g.awayId === teamId);
  const schedule: CareerGame[] = games
    .sort((a, b) => a.week - b.week)
    .map((g) => ({
      week: g.week,
      opponentId: g.homeId === teamId ? g.awayId : g.homeId,
      home: g.homeId === teamId && !g.neutralSite,
      conference: g.conferenceGame,
      neutral: g.neutralSite,
      played: false,
    }));
  const rng = new Rng(seed);
  const mates = teammates(teamId).filter((m) => m.position !== positionGroup(player));
  const pick = (pos: string) => mates.find((m) => m.position === pos) ?? mates[rng.int(0, mates.length - 1)];
  const coachTitle = `${player.position} Coach`;
  const team = TEAM_BY_ID[teamId];
  const surnames = ['Harris', 'Moore', 'Bennett', 'Reyes', 'Coleman', 'Brooks', 'Hayes', 'Price', 'Sanders', 'Ward'];
  const firsts = ['Tyler', 'Marcus', 'Jaylen', 'Chris', 'Devin', 'Aaron', 'Isaiah', 'Caleb', 'Malik', 'Ethan'];
  const contacts: Contact[] = [
    { id: 'mom', name: 'Mom', label: 'Family', role: 'family', rel: 85, avatar: '❤️', color: '#e85d75' },
    { id: 'coach', name: `Coach ${rng.pick(surnames)}`, label: `${team?.school ?? ''} ${coachTitle}`, role: 'coach', rel: 50, avatar: '🧢', color: team?.primaryColor ?? '#555' },
    { id: 'advisor', name: `Dr. ${rng.pick(surnames)}`, label: 'Academic Advisor', role: 'advisor', rel: 50, avatar: '🎓', color: '#4a7bd0' },
  ];
  const mate = (pos: string, role: ContactRole, avatar: string) => {
    const m = pick(pos);
    if (!m || contacts.some((c) => c.id === m.id)) return;
    contacts.push({ id: m.id, name: `${m.first} ${m.last}`, label: `Teammate · ${m.position} #${m.number}`, role, rel: 45 + rng.int(0, 15), avatar, color: '#3a7d44' });
  };
  mate('OL', 'gym', '💪');
  mate('LB', 'social', '😎');
  mate('CB', 'chill', '🎮');
  contacts.push({ id: 'roomie', name: `${rng.pick(firsts)} ${rng.pick(surnames)}`, label: 'Roommate', role: 'social', rel: 60, avatar: '🏠', color: '#9b59b6' });
  contacts.push({ id: 'classmate', name: `${rng.pick(['Maya', 'Sofia', 'Ava', 'Jordan', 'Riley', 'Nia'])} ${rng.pick(surnames)}`, label: 'Classmate', role: 'study', rel: 40, avatar: '📚', color: '#d09a2a' });

  const c: CareerState = {
    version: 1,
    seed,
    season,
    player: { ...player, progress: { ...(player.progress ?? {}) } },
    schedule,
    week: 1,
    day: 0,
    slot: 0,
    meters: { energy: 85, morale: 70, grades: 72, trust: 50 },
    contacts,
    messages: [],
    plans: {},
    log: [],
    seasonStats: emptyDriveStats(),
    nextMsgId: 1,
    over: false,
    gains: {},
  };
  const coachName = contacts[1].name;
  receive(c, 'coach', `Welcome to ${team?.school ?? 'the program'}. Practice is every afternoon, Monday through Thursday. Earn my trust there and you'll earn snaps on Saturday. — ${coachName}`);
  receive(c, 'advisor', `Hi ${player.firstName}! Reminder: you need to keep your grades up (above ${ELIGIBLE_GRADES}) to stay eligible. Text me if you want a tutor.`);
  receive(c, 'mom', `So proud of you!! Call me after your first practice ❤️`);
  startDay(c);
  return c;
}

function positionGroup(p: CreatedPlayer): string {
  return p.position;
}

// ───────────── calendar ─────────────

export function gameThisWeek(c: CareerState, week = c.week): CareerGame | undefined {
  return c.schedule.find((g) => g.week === week);
}

/** The fixed activity in a slot from the week template (null = free time). */
export function fixedAt(c: CareerState, day: number, slot: number): string | null {
  const t = ACT.template[gameThisWeek(c) ? 'game' : 'bye'];
  return t[day]?.[slot] ?? null;
}

export function planKey(day: number, slot: number): string {
  return `${day}-${slot}`;
}

export function absDay(c: CareerState, day = c.day): number {
  return c.week * 7 + day;
}

/** What is scheduled in a slot: fixed event, a plan, or nothing. */
export function scheduledAt(c: CareerState, day: number, slot: number): { activity: string | null; with?: string; fixed: boolean } {
  const f = fixedAt(c, day, slot);
  if (f) return { activity: f, fixed: true };
  const p = c.plans[planKey(day, slot)];
  return p ? { activity: p.activity, with: p.with, fixed: false } : { activity: null, fixed: false };
}

export function isEligible(c: CareerState): boolean {
  return c.meters.grades >= ELIGIBLE_GRADES;
}

export function record(c: CareerState): { w: number; l: number } {
  let w = 0;
  let l = 0;
  for (const g of c.schedule) {
    if (!g.result) continue;
    if (g.result.us > g.result.them) w++;
    else l++;
  }
  return { w, l };
}

// ───────────── phone ─────────────

function rngFor(c: CareerState, salt: string | number): Rng {
  return new Rng(`${c.seed}:${c.week}:${c.day}:${c.slot}:${salt}`);
}

export function receive(c: CareerState, contact: string, text: string, invite?: Omit<Invite, 'status'>): Message {
  const m: Message = { id: c.nextMsgId++, contact, mine: false, text, at: absDay(c), read: false, invite: invite ? { ...invite, status: 'pending' } : undefined };
  c.messages.push(m);
  return m;
}

function send(c: CareerState, contact: string, text: string): Message {
  const m: Message = { id: c.nextMsgId++, contact, mine: true, text, at: absDay(c), read: true };
  c.messages.push(m);
  return m;
}

export function unreadCount(c: CareerState): number {
  return c.messages.filter((m) => !m.read && !m.mine).length;
}

export function markRead(c: CareerState, contact: string): void {
  for (const m of c.messages) if (m.contact === contact) m.read = true;
}

/** Free slots still ahead of the clock this week. */
export function openSlots(c: CareerState): { day: number; slot: number }[] {
  const out: { day: number; slot: number }[] = [];
  for (let d = c.day; d < 7; d++) {
    for (let s = d === c.day ? c.slot : 0; s < 3; s++) {
      if (!fixedAt(c, d, s) && !c.plans[planKey(d, s)]) out.push({ day: d, slot: s });
    }
  }
  return out;
}

/** Accept or decline an invite from a contact. */
export function answerInvite(c: CareerState, msgId: number, accept: boolean): string {
  const m = c.messages.find((x) => x.id === msgId);
  if (!m?.invite || m.invite.status !== 'pending') return 'That invite is no longer open.';
  const { day, slot, activity } = m.invite;
  const contact = c.contacts.find((x) => x.id === m.contact)!;
  if (accept) {
    if (scheduledAt(c, day, slot).activity) {
      m.invite.status = 'declined';
      send(c, contact.id, "Ah I already have something then, sorry!");
      return 'You already have something planned then.';
    }
    m.invite.status = 'accepted';
    c.plans[planKey(day, slot)] = { activity, with: contact.id };
    send(c, contact.id, pickText(rngFor(c, msgId), ['I\'m in 👊', 'Bet, see you there', 'Yeah let\'s do it', 'Count me in']));
    contact.rel = clamp(contact.rel + 3, 0, 100);
    return `Planned: ${ACT.activities[activity].name} with ${contact.name}, ${ACT.days[day]} ${ACT.slots[slot].toLowerCase()}.`;
  }
  m.invite.status = 'declined';
  send(c, contact.id, pickText(rngFor(c, msgId + 1), ACT.declines));
  contact.rel = clamp(contact.rel - 2, 0, 100);
  return `You told ${contact.name} no.`;
}

/** Text a contact asking them to join an activity in a free slot. They may say yes or no. */
export function proposePlan(c: CareerState, contactId: string, activity: string, day: number, slot: number): { ok: boolean; text: string } {
  const contact = c.contacts.find((x) => x.id === contactId);
  const def = ACT.activities[activity];
  if (!contact || !def) return { ok: false, text: 'Unknown plan.' };
  if (scheduledAt(c, day, slot).activity) return { ok: false, text: 'You already have something then.' };
  if (day < c.day || (day === c.day && slot < c.slot)) return { ok: false, text: 'That time has passed.' };
  const when = `${day === c.day ? 'today' : ACT.days[day]} ${ACT.slots[slot].toLowerCase()}`;
  send(c, contactId, `Wanna do ${def.name.toLowerCase()} ${when}?`);
  const rng = rngFor(c, `p${contactId}${activity}${day}${slot}`);
  const likes = def.partner === contact.role || (contact.role === 'family' && activity === 'hangout') || (contact.role === 'coach' && (activity === 'film' || activity === 'drills')) || (contact.role === 'advisor' && (activity === 'tutor' || activity === 'study'));
  const p = clamp((likes ? 0.6 : 0.2) + (contact.rel - 50) / 120, 0.05, 0.95);
  if (rng.chance(p)) {
    c.plans[planKey(day, slot)] = { activity, with: contactId };
    receive(c, contactId, contact.role === 'coach' ? 'Good. See you then.' : contact.role === 'advisor' ? 'Great — I\'ll set it up.' : pickText(rng, ACT.theirAccepts));
    markRead(c, contactId);
    contact.rel = clamp(contact.rel + 2, 0, 100);
    return { ok: true, text: `${contact.name} is in: ${def.name}, ${when}.` };
  }
  receive(c, contactId, pickText(rng, ACT.theirDeclines));
  markRead(c, contactId);
  return { ok: false, text: `${contact.name} can't make it.` };
}

function pickText(rng: Rng, list: string[]): string {
  return list[rng.int(0, list.length - 1)];
}

/** Morning messages: invites for today's/tomorrow's free time and the occasional check-in. */
function morningMessages(c: CareerState) {
  const rng = rngFor(c, 'morning');
  // Expire stale invites.
  for (const m of c.messages) {
    const inv = m.invite;
    if (inv && inv.status === 'pending' && (inv.day < c.day || (inv.day === c.day && inv.slot < c.slot))) inv.status = 'expired';
  }
  const open = openSlots(c).filter((s) => s.day <= c.day + 1);
  const nInv = Math.min(open.length, rng.int(1, 2));
  for (let i = 0; i < nInv; i++) {
    const slot = open[rng.int(0, open.length - 1)];
    // Advisor steps in when grades slip; the coach pushes film before games.
    let contact: Contact;
    let activity: string;
    if (c.meters.grades < 58 && rng.chance(0.6)) {
      contact = c.contacts.find((x) => x.role === 'advisor')!;
      activity = 'tutor';
    } else if (c.meters.trust < 45 && rng.chance(0.35)) {
      contact = c.contacts.find((x) => x.role === 'coach')!;
      activity = 'film';
    } else {
      const social = c.contacts.filter((x) => ['gym', 'study', 'social', 'chill'].includes(x.role));
      contact = social[rng.int(0, social.length - 1)];
      const opts = Object.keys(ACT.invites).filter((a) => ACT.activities[a].partner === contact.role);
      activity = opts[rng.int(0, opts.length - 1)];
      if (activity === 'party' && slot.slot !== 2) activity = 'hangout';
    }
    const exists = c.messages.some((m) => m.invite && m.invite.status === 'pending' && m.invite.day === slot.day && m.invite.slot === slot.slot);
    if (exists) continue;
    const when = slot.day === c.day ? (slot.slot === 2 ? 'tonight' : `this ${ACT.slots[slot.slot].toLowerCase()}`) : `tomorrow ${ACT.slots[slot.slot].toLowerCase()}`;
    const base = pickText(rng, ACT.invites[activity]);
    receive(c, contact.id, `${base} (${when})`, { activity, day: slot.day, slot: slot.slot });
  }
  if (rng.chance(0.35)) {
    const k = c.contacts[rng.int(0, c.contacts.length - 1)];
    const lines = ACT.chatter[k.role === 'advisor' ? 'study' : k.role];
    if (lines) receive(c, k.id, pickText(rng, lines));
  }
}

function startDay(c: CareerState) {
  morningMessages(c);
}

// ───────────── doing things ─────────────

export interface SlotResult {
  text: string;
  tone: 'good' | 'bad' | 'info';
  deltas: Partial<Record<Meter, number>>;
  gains: Record<string, number>;
}

function applyEffects(c: CareerState, eff: Partial<Record<Meter, number>>, mult = 1): Partial<Record<Meter, number>> {
  const out: Partial<Record<Meter, number>> = {};
  for (const [k, v] of Object.entries(eff) as [Meter, number][]) {
    const before = c.meters[k];
    c.meters[k] = clamp(before + v * mult, 0, 100);
    out[k] = Math.round((c.meters[k] - before) * 10) / 10;
  }
  return out;
}

/** Training XP → permanent rating progress, split over the position's attributes for each tag. */
function train(c: CareerState, xp: Partial<Record<XpTag, number>>, mult: number): Record<string, number> {
  const p = c.player;
  const attrs = posDef(p).attributes.map((a) => a.id);
  const cur = ratings(p);
  const gains: Record<string, number> = {};
  p.progress ??= {};
  for (const [tag, pts] of Object.entries(xp) as [XpTag, number][]) {
    const list = XP_ATTRS[tag].filter((a) => attrs.includes(a));
    if (!list.length) continue;
    for (const a of list) {
      const growth = clamp((99 - cur[a]) / 30, 0.1, 1.2);
      const g = (pts / Math.max(list.length, 4)) * 0.016 * growth * mult;
      p.progress[a] = (p.progress[a] ?? 0) + g;
      gains[a] = (gains[a] ?? 0) + g;
      c.gains[a] = (c.gains[a] ?? 0) + g;
    }
  }
  return gains;
}

/** Morale and energy scale how much a session is worth. */
function workMult(c: CareerState): number {
  const e = c.meters.energy < 20 ? 0.45 : c.meters.energy < 40 ? 0.75 : 1;
  const m = 0.75 + c.meters.morale / 250;
  return e * m;
}

/**
 * Resolve the current slot. `choice`: for fixed events 'attend' | 'skip'; for free time an activity id
 * (or undefined to use the plan / rest). Game day is resolved through `finishGame`.
 */
export function doSlot(c: CareerState, choice?: string): SlotResult {
  const sch = scheduledAt(c, c.day, c.slot);
  let activity = sch.activity;
  let withId = sch.with;
  let skipped = false;
  if (sch.fixed) {
    if (activity === 'game') return { text: 'Game day — play or sim the game.', tone: 'info', deltas: {}, gains: {} };
    skipped = choice === 'skip' && !!ACT.activities[activity!].skip;
  } else if (choice && ACT.activities[choice]) {
    if (choice !== activity) withId = undefined; // changed plans
    if (sch.with && choice !== activity) {
      const k = c.contacts.find((x) => x.id === sch.with);
      if (k) {
        k.rel = clamp(k.rel - 6, 0, 100);
        receive(c, k.id, 'wow you just bailed on me?? 😒');
      }
    }
    activity = choice;
  }
  if (!activity) activity = 'rest';
  const def = ACT.activities[activity];
  const mult = workMult(c);
  let deltas: Partial<Record<Meter, number>>;
  let gains: Record<string, number> = {};
  let text: string;
  let tone: SlotResult['tone'] = 'info';
  if (skipped) {
    deltas = applyEffects(c, def.skip!.effects);
    text = `${def.skip!.name}.`;
    tone = 'bad';
    if (activity === 'practice') receive(c, 'coach', 'Where were you today? That can\'t happen.');
  } else {
    deltas = applyEffects(c, def.effects);
    if (def.xp) gains = train(c, def.xp, mult * (withId ? 1.1 : 1));
    const partner = withId ? c.contacts.find((x) => x.id === withId) : undefined;
    if (partner) {
      partner.rel = clamp(partner.rel + 4, 0, 100);
      const extra = applyEffects(c, { morale: 3 });
      deltas.morale = (deltas.morale ?? 0) + (extra.morale ?? 0);
    }
    text = `${def.icon} ${def.name}${partner ? ` with ${partner.name}` : ''}.`;
    const top = Object.entries(gains).sort((a, b) => b[1] - a[1])[0];
    if (top && top[1] > 0.05) text += ` +${top[1].toFixed(1)} ${labelOf(c, top[0])}.`;
    if (c.meters.energy < 15 && def.effects.energy && def.effects.energy < 0) {
      text += ' You are running on empty.';
      tone = 'bad';
    } else tone = gains && Object.keys(gains).length ? 'good' : 'info';
  }
  c.log.push({ week: c.week, day: c.day, slot: c.slot, text, tone });
  advanceClock(c);
  return { text, tone, deltas, gains };
}

function labelOf(c: CareerState, attr: string): string {
  return posDef(c.player).attributes.find((a) => a.id === attr)?.label ?? attr;
}

function advanceClock(c: CareerState) {
  c.slot++;
  if (c.slot < 3) return;
  // Overnight: sleep, coursework piles up, moods settle.
  c.slot = 0;
  applyEffects(c, { energy: 14, grades: -1.6 });
  c.meters.morale += (62 - c.meters.morale) * 0.08;
  c.meters.trust += (50 - c.meters.trust) * 0.03;
  c.day++;
  if (c.day >= 7) {
    c.day = 0;
    c.week++;
    c.plans = {};
    // Weekly checks
    if (c.meters.grades < ELIGIBLE_GRADES + 8) receive(c, 'advisor', `Your grades are at ${Math.round(c.meters.grades)}. Under ${ELIGIBLE_GRADES} and you can't play. Please come see a tutor.`);
    if (c.week > LAST_WEEK || c.schedule.every((g) => g.played)) {
      c.over = true;
      return;
    }
  }
  startDay(c);
}

// ───────────── games ─────────────

/** The game to play right now (current slot is game day), if any. */
export function pendingGame(c: CareerState): CareerGame | undefined {
  if (scheduledAt(c, c.day, c.slot).activity !== 'game') return undefined;
  const g = gameThisWeek(c);
  return g && !g.played ? g : undefined;
}

export function benchedFirstQuarter(c: CareerState): boolean {
  return c.meters.trust < BENCH_TRUST;
}

/** Record a played (or simulated) game and move past game day. */
export function finishGame(c: CareerState, res: { us: number; them: number; stats: DriveStats; simmed: boolean }): SlotResult {
  const g = pendingGame(c);
  if (!g) return { text: 'No game right now.', tone: 'info', deltas: {}, gains: {} };
  const played = isEligible(c);
  g.played = true;
  g.result = { ...res, played };
  const st = res.stats;
  const tot = c.seasonStats;
  for (const k of Object.keys(tot) as (keyof DriveStats)[]) tot[k] = k === 'longest' ? Math.max(tot[k], st[k]) : tot[k] + st[k];
  const won = res.us > res.them;
  const opp = TEAM_BY_ID[g.opponentId];
  // Performance → trust; result → morale; games are exhausting.
  const prod = st.passYds / 25 + st.passTD * 4 - st.int * 4 + (st.rushYds + st.recYds) / 10 + (st.rushTD + st.recTD) * 5 + st.rec * 0.5;
  const deltas = applyEffects(c, { energy: -30, morale: won ? 10 : -6, trust: played ? clamp(prod * 0.6 - 2, -6, 12) + (won ? 2 : 0) : -2 });
  const gains = played ? train(c, { skill: 10, mind: 12 }, workMult(c)) : {};
  const text = `${won ? 'WIN' : 'LOSS'} ${res.us}-${res.them} ${g.home ? 'vs' : 'at'} ${opp?.school ?? g.opponentId}.${played ? '' : ' (You were ineligible.)'}`;
  c.log.push({ week: c.week, day: c.day, slot: c.slot, text, tone: won ? 'good' : 'bad' });
  receive(c, 'mom', won ? 'WE WON!!! So proud of you 🎉' : 'Tough one baby. Keep your head up ❤️');
  if (played) receive(c, 'coach', prod > 8 ? 'Big-time performance. That\'s what we need every week.' : prod > 3 ? 'Solid. Let\'s clean up the details in film.' : 'We need more from you. Back to work Monday.');
  advanceClock(c);
  return { text, tone: won ? 'good' : 'bad', deltas, gains };
}

/** Simulate the current game (or because the player is ineligible). */
export function simCurrentGame(c: CareerState): SlotResult {
  const g = pendingGame(c);
  if (!g) return { text: 'No game right now.', tone: 'info', deltas: {}, gains: {} };
  const m = buildMatch(c.player, g.opponentId, 26);
  const rng = new Rng(`${c.seed}:game:${g.week}`);
  const involvement = !isEligible(c) ? 0 : benchedFirstQuarter(c) ? 0.7 : 1;
  const r = simGame(m.units.us, m.units.them, rng, c.player.position, playerOverall(c.player), involvement, 15, TEAM_BY_ID[c.player.teamId]?.school, TEAM_BY_ID[g.opponentId]?.school);
  return finishGame(c, { us: r.us, them: r.them, stats: r.stats, simmed: true });
}

// ───────────── persistence ─────────────

const KEY = 'saturday26.career';

export function saveCareer(c: CareerState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(c));
  } catch {
    /* storage unavailable */
  }
}

export function loadCareer(): CareerState | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CareerState) : null;
  } catch {
    return null;
  }
}

export function clearCareer(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* storage unavailable */
  }
}

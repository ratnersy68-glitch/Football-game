/**
 * Hud: broadcast-style overlay — scorebug, linescore, batter/pitcher cards, pitch selector,
 * meters, timing feedback, banners (NEXT BATTER / HOME RUN / STRIKEOUT / PITCHING CHANGE /
 * END OF INNING / FINAL), toasts and the replay UI. Each region only re-renders on change.
 */
import type { Player } from '../core/types';
import { PITCHES, PITCH_KEYS } from '../data/pitchTypes';
import { playerById } from '../managers/TeamManager';
import type { GameEngine } from '../engine/GameEngine';
import { battingTeam, currentBatter, currentPitcher, fatigue, fieldingTeam } from '../engine/GameState';
import { avgString, ipString, seasonBatting, seasonPitching } from '../engine/StatsManager';
import { throwMeterZone } from '../engine/FieldingEngine';
import { onBase } from '../engine/BaseRunningEngine';
import { BASE_NAMES } from '../engine/Field';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export interface HudExtras {
  throwHold: { base: number; t: number } | null;
  throwFill: number;
  swingPreview: 'normal' | 'power' | 'contact';
  runnerSel: number | null;
  replayAvailable: boolean;
}

export class Hud {
  el: HTMLElement;
  private regions = new Map<string, { el: HTMLElement; html: string }>();
  private bannerTimer = 0;
  private toastTimer = 0;
  private feedbackTimer = 0;
  private lower3Timer = 0;

  constructor(root: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'hud';
    root.appendChild(this.el);
    for (const r of ['bug', 'linescore', 'batter', 'pitcher', 'pitchinfo', 'pitchpanel', 'meter', 'feedback', 'banner', 'lower3', 'toast', 'hint', 'runners', 'throwhint', 'replay']) {
      const d = document.createElement('div');
      d.dataset.r = r;
      this.el.appendChild(d);
      this.regions.set(r, { el: d, html: '' });
    }
  }

  destroy() {
    this.el.remove();
  }

  private set(r: string, html: string) {
    const reg = this.regions.get(r)!;
    if (reg.html !== html) {
      reg.html = html;
      reg.el.innerHTML = html;
    }
  }

  // ---------------------------------------------------------------- transient

  banner(title: string, sub = '', cls = '', dur = 2.2, extraHtml = '') {
    this.set('banner', `<div class="banner"><div class="big ${cls}">${esc(title)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}${extraHtml}</div>`);
    this.bannerTimer = dur;
  }

  homeRun(name: string, ev: number, la: number, dist: number) {
    this.banner('HOME RUN', name, 'gold', 4.2, `<div class="stats3"><div>${ev.toFixed(1)}<small>MPH EXIT VELO</small></div><div>${Math.round(la)}°<small>LAUNCH ANGLE</small></div><div>${Math.round(dist)}<small>FEET</small></div></div>`);
  }

  toast(text: string, sub = '', dur = 2.6) {
    this.set('toast', `<div class="toast">${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>`);
    this.toastTimer = dur;
  }

  feedback(label: string, timing: string, contact: boolean, ev?: number, la?: number) {
    const cls = label.replace(/[^A-Z-]/g, '');
    this.set('feedback', `<div class="feedback"><div class="t">${esc(timing)}</div><div class="c-${cls}">${esc(label)}</div>${contact && ev ? `<div class="ev">${ev.toFixed(1)} mph · ${Math.round(la ?? 0)}°</div>` : ''}</div>`);
    this.feedbackTimer = 1.6;
  }

  batterCard(e: GameEngine, p: Player) {
    const sb = seasonBatting(p);
    const line = e.stats.b(p.id);
    const bt = battingTeam(e.state);
    const entry = bt.lineup.find((l) => l.player.id === p.id);
    const today = line.PA ? `${line.H}-${line.AB}${line.HR ? `, ${line.HR} HR` : ''}${line.RBI ? `, ${line.RBI} RBI` : ''}${line.BB ? `, ${line.BB} BB` : ''}` : 'First at-bat';
    this.set('lower3', `<div class="lower3" style="border-top:3px solid ${bt.team.colors.primary}"><div class="num" style="background:${bt.team.colors.primary}">${p.number}</div>
      <div class="info"><div class="nm">${esc(p.name.toUpperCase())}</div><div class="ps">${entry?.pos ?? p.pos} · Bats ${p.bats} · ${esc(today)}</div></div>
      <div class="st"><div>${sb.avg}<small>AVG</small></div><div>${sb.hr}<small>HR</small></div><div>${sb.rbi}<small>RBI</small></div></div></div>`);
    this.lower3Timer = 3.2;
  }

  pitcherCard(e: GameEngine, p: Player) {
    const sp = seasonPitching(p);
    const ft = fieldingTeam(e.state);
    this.set('lower3', `<div class="lower3" style="border-top:3px solid ${ft.team.colors.primary}"><div class="num" style="background:${ft.team.colors.primary}">${p.number}</div>
      <div class="info"><div class="nm">${esc(p.name.toUpperCase())}</div><div class="ps">PITCHING CHANGE · ${p.throws}HP · ${p.pitcher!.pitches.map((c) => PITCHES[c].short).join(' ')}</div></div>
      <div class="st"><div>${sp.era}<small>ERA</small></div><div>${sp.w}-${sp.l}<small>W-L</small></div><div>${sp.so}<small>SO</small></div><div>${sp.whip}<small>WHIP</small></div></div></div>`);
    this.lower3Timer = 3.5;
  }

  tick(dt: number) {
    if (this.bannerTimer > 0 && (this.bannerTimer -= dt) <= 0) this.set('banner', '');
    if (this.toastTimer > 0 && (this.toastTimer -= dt) <= 0) this.set('toast', '');
    if (this.feedbackTimer > 0 && (this.feedbackTimer -= dt) <= 0) this.set('feedback', '');
    if (this.lower3Timer > 0 && (this.lower3Timer -= dt) <= 0) this.set('lower3', '');
  }

  clearTransient() {
    for (const r of ['banner', 'toast', 'feedback', 'lower3']) this.set(r, '');
  }

  // ---------------------------------------------------------------- persistent

  update(e: GameEngine, x: HudExtras) {
    const s = e.state;
    const away = s.away, home = s.home;
    const bt = battingTeam(s);
    const bases = s.bases.map((b) => !!b);
    const live = e.phase === 'live' && e.play;
    // While a play is live, show runners where they actually are.
    let liveBases = bases;
    if (live) {
      liveBases = [false, false, false];
      for (const r of e.play!.activeRunners()) if (onBase(r)) { const b = Math.round(r.p / 90); if (b >= 1 && b <= 3) liveBases[b - 1] = true; }
    }
    const outs = live ? Math.min(3, s.outs + e.play!.outs.length) : s.outs;
    const row = (t: typeof away, batting: boolean) => `<div class="trow ${batting ? 'bat' : ''}"><div class="chip" style="background:${t.team.colors.primary}"></div><div class="ab">${t.team.id}</div><div class="sc">${t.runs}</div></div>`;
    this.set('bug', `<div class="bug"><div class="teams">${row(away, bt === away)}${row(home, bt === home)}</div>
      <div class="mid"><div class="inn"><span class="arr">${s.half === 'top' ? '▲' : '▼'}</span>${s.inning}</div>
        <div class="diamond"><i style="left:15px;top:1px" class="${liveBases[1] ? 'on' : ''}"></i><i style="left:2px;top:14px" class="${liveBases[2] ? 'on' : ''}"></i><i style="left:28px;top:14px" class="${liveBases[0] ? 'on' : ''}"></i></div></div>
      <div class="count"><div>${s.balls}-${s.strikes}</div><div class="outs">${[0, 1, 2].map((i) => `<i class="${i < outs ? 'on' : ''}"></i>`).join('')}</div></div></div>`);

    // Linescore
    const n = Math.max(s.settings.innings, away.linescore.length, home.linescore.length, s.inning);
    const cell = (t: typeof away, i: number, top: boolean) => {
      const v = t.linescore[i];
      const cur = s.inning === i + 1 && (s.half === 'top') === top && !s.over;
      return `<td class="${cur ? 'cur' : ''}">${v === undefined ? (cur ? 0 : '') : v}</td>`;
    };
    this.set('linescore', `<div class="linescore"><table><tr><th></th>${Array.from({ length: n }, (_, i) => `<th>${i + 1}</th>`).join('')}<th>R</th><th>H</th><th>E</th></tr>
      <tr><td class="t">${away.team.id}</td>${Array.from({ length: n }, (_, i) => cell(away, i, true)).join('')}<td class="rhe">${away.runs}</td><td class="rhe">${away.hits}</td><td class="rhe">${away.errors}</td></tr>
      <tr><td class="t">${home.team.id}</td>${Array.from({ length: n }, (_, i) => cell(home, i, false)).join('')}<td class="rhe">${home.runs}</td><td class="rhe">${home.hits}</td><td class="rhe">${home.errors}</td></tr></table></div>`);

    // Batter / pitcher cards
    const batter = currentBatter(s);
    const pitcher = currentPitcher(s);
    const bl = e.stats.b(batter.id);
    const sb = seasonBatting(batter);
    const entry = bt.lineup.find((l) => l.player.id === batter.id);
    this.set('batter', `<div class="card left" style="border-top-color:${bt.team.colors.primary}"><div class="nm">${esc(batter.name)} <span style="font-size:15px;color:var(--muted)">#${batter.number}</span></div>
      <div class="sub">${entry?.pos ?? batter.pos} · Bats ${batter.bats} · ${bl.PA ? `${bl.H}-${bl.AB} today` : 'first PA'}</div>
      <div class="stats">AVG<b>${sb.avg}</b> HR<b>${sb.hr}</b> RBI<b>${sb.rbi}</b></div></div>`);
    const ft = fieldingTeam(s);
    const pl = e.stats.p(pitcher.id);
    const fat = Math.min(1, fatigue(ft));
    const pc = ft.pitchCounts.get(pitcher.id) ?? 0;
    this.set('pitcher', `<div class="card right" style="border-top-color:${ft.team.colors.primary}"><div class="nm">${esc(pitcher.name)} <span style="font-size:15px;color:var(--muted)">#${pitcher.number}</span></div>
      <div class="sub">${pitcher.throws}HP · ${ipString(pl.outs)} IP · ${pl.SO} K · ${pl.BB} BB · ${pl.ER} ER</div>
      <div class="stats">PITCHES<b>${pc}</b></div><div class="stam"><i style="width:${(1 - fat) * 100}%;background:${fat > 0.85 ? 'var(--bad)' : fat > 0.6 ? '#ffb347' : 'var(--good)'}"></i></div></div>`);

    // Last pitch info
    if (e.flight && (e.phase === 'pitch' || e.phase === 'postpitch' || e.phase === 'live')) {
      const callCls = e.lastCall === 'BALL' ? 'ball' : e.lastCall === 'STRIKE' ? 'strike' : '';
      const showCall = e.phase === 'postpitch';
      this.set('pitchinfo', `<div class="pitchinfo">${showCall ? `<div class="call ${callCls}">${e.lastCall}</div>` : ''}${Math.round(e.flight.mph)} MPH<small>${e.pitchDone || e.phase === 'live' || e.userSidePitching() ? PITCHES[e.flight.code].name : '&nbsp;'}</small></div>`);
    } else if (e.phase === 'prepitch' || e.phase === 'atbat_intro') this.set('pitchinfo', '');

    // Pitch selection (user pitching)
    const userPitching = e.userSidePitching();
    if (userPitching && (e.phase === 'prepitch' || e.phase === 'windup')) {
      const up = e.userPitch;
      const pr = pitcher.pitcher!;
      this.set('pitchpanel', `<div class="pitchpanel">${pr.pitches.map((c, i) => {
        const sh = PITCHES[c];
        return `<div class="pt ${c === up.code ? 'sel' : ''}"><span class="key">${PITCH_KEYS[i]}</span><span class="dot" style="background:${sh.color}"></span>${sh.name}<span class="mph">${Math.round(pr.velocity * sh.speed)}</span></div>`;
      }).join('')}<div class="hint">${up.stage === 'select' || up.stage === 'aim' ? 'Pick a pitch · aim with the mouse · SPACE to start the meter' : up.stage === 'meter' ? 'SPACE when the needle hits the gold line' : ''}</div></div>`);
      if (up.stage === 'meter' || up.stage === 'locked') {
        const w = 360;
        const zl = (up.zoneCenter - up.zoneHalf) / 1.15 * w, zw = (up.zoneHalf * 2) / 1.15 * w;
        const v = (up.locked ?? up.meter) / 1.15 * w;
        this.set('meter', `<div class="meter-label">PITCH METER</div><div class="meter"><div class="zone" style="left:${zl - 30}px;width:${zw + 60}px;opacity:.45"></div><div class="zone perfect" style="left:${zl}px;width:${zw}px"></div><div class="needle" style="left:${v}px"></div></div>`);
      } else this.set('meter', '');
    } else {
      this.set('pitchpanel', '');
      if (!x.throwHold) this.set('meter', '');
    }

    // Throw meter (user defense)
    if (e.phase === 'live' && e.play && e.userSidePitching()) {
      const play = e.play;
      const f = play.controlled;
      if (x.throwHold && f) {
        const z = throwMeterZone(f);
        const w = 360;
        const v = Math.min(1.2, x.throwHold.t / x.throwFill);
        this.set('meter', `<div class="meter-label">THROW TO ${BASE_NAMES[x.throwHold.base]} — release in the green</div><div class="meter"><div class="zone" style="left:${(z.start / 1.2) * w}px;width:${((z.end - z.start) / 1.2) * w}px"></div><div class="needle" style="left:${(v / 1.2) * w}px"></div></div>`);
      }
      if (f && f.hasBall) {
        const forced = new Set<number>();
        for (const r of play.activeRunners()) if (play.isForced(r) && r.lastTouched < r.startBase + 1) forced.add(r.startBase + 1);
        this.set('throwhint', `<div class="throwhint">THROW: ${[1, 2, 3, 4].map((b) => `<span class="${forced.has(b) ? 'force' : ''}"><b>${b}</b>${['', '1B', '2B', '3B', 'HOME'][b]}</span>`).join(' ')} · or run it in with WASD</div>`);
      } else if (f) this.set('throwhint', `<div class="throwhint">You control the <b>${f.pos}</b> · WASD move · SHIFT sprint · SPACE dive/leap</div>`);
      else this.set('throwhint', '');
    } else this.set('throwhint', '');

    // Runners (user offense)
    if (e.userSideBatting() && (s.bases.some(Boolean) || (live && e.play!.activeRunners().length))) {
      const list: string[] = [];
      if (live) {
        for (const r of e.play!.activeRunners()) {
          const sel = x.runnerSel === null || (x.runnerSel === 0 ? r.isBatter : r.startBase === x.runnerSel);
          list.push(`<div class="${sel && x.runnerSel !== null ? 'sel' : ''}">${r.isBatter ? 'BR' : BASE_NAMES[r.startBase]} ${esc(r.player.name)} → ${BASE_NAMES[Math.min(4, Math.round(r.goal / 90))]}</div>`);
        }
      } else {
        s.bases.forEach((b, i) => { if (b) list.push(`<div class="${x.runnerSel === i + 1 ? 'sel' : ''}">${i + 1}: ${esc(b.player.name)} <span style="color:var(--muted)">SPD ${b.player.ratings.speed}</span></div>`); });
      }
      this.set('runners', `<div class="runners">${list.join('')}<div style="color:var(--muted);margin-top:4px">${x.runnerSel === null ? 'ALL runners' : x.runnerSel === 0 ? 'Batter-runner' : 'Runner on ' + BASE_NAMES[x.runnerSel]} · <b>Q</b> go/steal · <b>E</b> back · <b>1-3</b>/<b>4</b> select · <b>0</b> all</div></div>`);
    } else this.set('runners', '');

    // Context hint
    this.set('hint', `<div class="hint-bar">${this.hint(e, x)}</div>`);
    this.set('replay', x.replayAvailable ? `<div class="replay-prompt">R — REPLAY</div>` : '');
  }

  private hint(e: GameEngine, x: HudExtras): string {
    const k = (s: string) => `<kbd>${s}</kbd>`;
    if (e.phase === 'final') return `${k('ESC')} menu`;
    if (e.phase === 'live') {
      if (e.userSidePitching()) return `${k('WASD')} move ${k('SHIFT')} sprint ${k('SPACE')} dive/leap · hold ${k('1')}${k('2')}${k('3')}${k('4')} to throw`;
      if (e.userSideBatting()) return `${k('Q')} advance ${k('E')} retreat ${k('1-3')} pick runner ${k('4')} batter-runner ${k('0')} all`;
      return '';
    }
    if (['atbat_intro', 'postplay', 'half_end', 'postpitch'].includes(e.phase)) return `${k('SPACE')} continue · ${k('ESC')} pause${x.replayAvailable ? ' · ' + k('R') + ' replay' : ''}`;
    if (e.userSideBatting()) return `Mouse/arrows: PCI · ${k('SPACE')} swing · ${k('SHIFT')}+${k('SPACE')} power · ${k('CTRL')}+${k('SPACE')} contact · ${k('Q')} steal · ${k('ESC')} pause <span style="color:var(--accent)">(${x.swingPreview})</span>`;
    if (e.userSidePitching()) return `${k('A')}${k('S')}${k('D')}${k('F')}${k('G')} pitch · mouse aim · ${k('SPACE')} meter · ${k('ESC')} pause`;
    return `${k('ESC')} pause`;
  }

  replayUi(t: number, d: number, paused: boolean, speed: number) {
    this.set('banner', '');
    this.set('replay', `<div class="replay-tag">REPLAY</div><div class="replay-ui"><span>${paused ? '❚❚' : '▶'} ${speed < 1 ? speed + 'x' : ''}</span><div class="tl"><i style="width:${(Math.min(1, t / Math.max(0.01, d)) * 100).toFixed(1)}%"></i></div>
      <span>${'<kbd>SPACE</kbd> play/pause <kbd>Z</kbd> slow-mo <kbd>←</kbd><kbd>→</kbd> scrub <kbd>drag</kbd>/<kbd>A</kbd><kbd>D</kbd> rotate <kbd>W</kbd><kbd>S</kbd>/wheel zoom <kbd>R</kbd>/<kbd>ESC</kbd> exit'}</span></div>`);
  }

  hideGameplayRegions(hide: boolean) {
    for (const r of ['batter', 'pitcher', 'pitchinfo', 'pitchpanel', 'meter', 'hint', 'runners', 'throwhint', 'lower3', 'feedback']) {
      this.regions.get(r)!.el.style.display = hide ? 'none' : '';
    }
  }
}

export { playerById, avgString };

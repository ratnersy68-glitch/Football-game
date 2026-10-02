/** Pause menu and modal screens: box score, lineup & substitutions, bullpen, controls, settings. */
import type { Position, UserPrefs } from '../core/types';
import { PITCHES } from '../data/pitchTypes';
import type { GameEngine } from '../engine/GameEngine';
import { fatigue, pitchBudget } from '../engine/GameState';
import { avgString, ipString } from '../engine/StatsManager';
import { playerById, hitters } from '../managers/TeamManager';
import { canPlay } from '../managers/RosterManager';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export class Modals {
  root: HTMLElement;
  current: HTMLElement | null = null;
  onClose: (() => void) | null = null;

  constructor(root: HTMLElement) {
    this.root = root;
  }

  get open() { return !!this.current; }

  close() {
    if (this.current) { this.current.remove(); this.current = null; }
    const cb = this.onClose;
    this.onClose = null;
    cb?.();
  }

  show(html: string, onClose?: () => void): HTMLElement {
    if (this.current) this.current.remove();
    const m = document.createElement('div');
    m.className = 'modal';
    m.innerHTML = `<div class="modal-box">${html}</div>`;
    m.addEventListener('mousedown', (e) => { if (e.target === m) this.close(); });
    this.root.appendChild(m);
    this.current = m;
    this.onClose = onClose ?? null;
    m.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => this.close()));
    return m;
  }

  // ---------------------------------------------------------------- pause

  pause(actions: Record<string, () => void>, inGame: boolean) {
    const items: [string, string][] = inGame
      ? [['resume', 'Resume'], ['lineup', 'Lineup'], ['bullpen', 'Bullpen'], ['stats', 'Game Stats'], ['controls', 'Controls'], ['settings', 'Settings'], ['simhalf', 'Simulate Half-Inning'], ['simend', 'Simulate to End'], ['restart', 'Restart Game'], ['quit', 'Quit to Menu']]
      : [['resume', 'Close']];
    const m = this.show(`<h2>PAUSED</h2><div class="pause-menu">${items.map(([k, l]) => `<button class="btn ${k === 'resume' ? 'primary' : ''}" data-k="${k}">${l}</button>`).join('')}</div>`, actions.resume);
    m.querySelectorAll<HTMLElement>('[data-k]').forEach((b) => b.addEventListener('click', () => {
      const k = b.dataset.k!;
      if (k === 'resume') { this.close(); return; }
      actions[k]?.();
    }));
  }

  // ---------------------------------------------------------------- box score

  boxScore(e: GameEngine, onBack?: () => void) {
    const s = e.state;
    const bat = (side: 'away' | 'home') => {
      const ids = e.stats.batOrder[side];
      const rows = ids.map((id) => {
        const p = playerById(id);
        const l = e.stats.b(id);
        const entry = s[side].lineup.find((x) => x.player.id === id);
        return `<tr><td>${esc(p.name)} <span style="color:var(--muted)">${entry?.pos ?? (s[side].removed.has(id) ? '—' : p.pos)}</span></td><td class="r">${l.AB}</td><td class="r">${l.R}</td><td class="r">${l.H}</td><td class="r">${l.D}</td><td class="r">${l.T}</td><td class="r">${l.HR}</td><td class="r">${l.RBI}</td><td class="r">${l.BB}</td><td class="r">${l.SO}</td><td class="r">${avgString(l.H, l.AB)}</td></tr>`;
      }).join('');
      return `<table class="tbl"><tr><th>${s[side].team.name} batting</th><th class="r">AB</th><th class="r">R</th><th class="r">H</th><th class="r">2B</th><th class="r">3B</th><th class="r">HR</th><th class="r">RBI</th><th class="r">BB</th><th class="r">SO</th><th class="r">AVG</th></tr>${rows}</table>`;
    };
    const pit = (side: 'away' | 'home') => {
      const rows = e.stats.pitchOrder[side].map((id) => {
        const p = playerById(id);
        const l = e.stats.p(id);
        return `<tr><td>${esc(p.name)}${l.dec ? ` <b style="color:var(--accent)">(${l.dec})</b>` : ''}</td><td class="r">${ipString(l.outs)}</td><td class="r">${l.H}</td><td class="r">${l.R}</td><td class="r">${l.ER}</td><td class="r">${l.BB}</td><td class="r">${l.SO}</td><td class="r">${l.HR}</td><td class="r">${l.pitches}</td></tr>`;
      }).join('');
      return `<table class="tbl"><tr><th>${s[side].team.name} pitching</th><th class="r">IP</th><th class="r">H</th><th class="r">R</th><th class="r">ER</th><th class="r">BB</th><th class="r">SO</th><th class="r">HR</th><th class="r">PC</th></tr>${rows}</table>`;
    };
    const n = Math.max(s.settings.innings, s.away.linescore.length, s.home.linescore.length);
    const line = (side: 'away' | 'home') => `<tr><td><b>${s[side].team.id}</b></td>${Array.from({ length: n }, (_, i) => `<td class="r">${s[side].linescore[i] ?? ''}</td>`).join('')}<td class="r"><b>${s[side].runs}</b></td><td class="r">${s[side].hits}</td><td class="r">${s[side].errors}</td></tr>`;
    const m = this.show(`<h2>BOX SCORE</h2>
      <table class="tbl" style="width:auto;margin-bottom:12px"><tr><th></th>${Array.from({ length: n }, (_, i) => `<th class="r">${i + 1}</th>`).join('')}<th class="r">R</th><th class="r">H</th><th class="r">E</th></tr>${line('away')}${line('home')}</table>
      <div class="box-grid"><div>${bat('away')}${pit('away')}</div><div>${bat('home')}${pit('home')}</div></div>
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);
    m.querySelector('[data-back]')!.addEventListener('click', () => (onBack ? onBack() : this.close()));
  }

  // ---------------------------------------------------------------- lineup / subs

  lineup(e: GameEngine, side: 'home' | 'away', onBack: () => void) {
    const t = e.state[side];
    const used = new Set(t.lineup.map((l) => l.player.id));
    const bench = hitters(t.team).filter((p) => !used.has(p.id) && !t.removed.has(p.id));
    const onBaseIds = new Set(e.state.bases.filter(Boolean).map((b) => b!.player.id));
    const POS: Position[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
    const batting = e.state.half === 'top' ? side === 'away' : side === 'home';
    const rows = t.lineup.map((l, i) => {
      const cur = batting && t.battingIdx === i;
      const tag = cur ? ' <b style="color:var(--accent)">AT BAT</b>' : onBaseIds.has(l.player.id) ? ' <b style="color:#6be38f">ON BASE</b>' : '';
      const line = e.stats.b(l.player.id);
      return `<tr><td class="num">${i + 1}</td><td>${esc(l.player.name)}${tag}</td>
        <td><select data-pos="${i}">${POS.map((p) => `<option ${p === l.pos ? 'selected' : ''}>${p}</option>`).join('')}</select>${canPlay(l.player, l.pos) ? '' : ' <span class="warn">⚠</span>'}</td>
        <td class="r">${line.H}-${line.AB}</td>
        <td><select data-sub="${i}"><option value="">— substitute —</option>${bench.map((b) => `<option value="${b.id}">${esc(b.name)} (${b.pos}${b.secondary.length ? '/' + b.secondary.join('/') : ''})</option>`).join('')}</select></td></tr>`;
    }).join('');
    const live = e.phase === 'live' || e.phase === 'windup' || e.phase === 'pitch';
    const m = this.show(`<h2>${esc(t.team.name.toUpperCase())} LINEUP</h2>
      <div class="stars" style="margin-bottom:8px">Substitute the batter at the plate for a <b>pinch hitter</b>, a player on base for a <b>pinch runner</b>, or anyone for a <b>defensive replacement</b>. Changing positions swaps with whoever holds that spot. Replaced players can't return.</div>
      <table class="tbl"><tr><th>#</th><th>Player</th><th>Pos</th><th class="r">Today</th><th>Substitute</th></tr>${rows}</table>
      ${live ? '<div class="warn" style="margin-top:8px">Changes apply between pitches.</div>' : ''}
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);
    m.querySelectorAll<HTMLSelectElement>('[data-sub]').forEach((sel) => sel.addEventListener('change', () => {
      if (!sel.value) return;
      const i = Number(sel.dataset.sub);
      e.substitute(side, i, sel.value);
      this.lineup(e, side, onBack);
    }));
    m.querySelectorAll<HTMLSelectElement>('[data-pos]').forEach((sel) => sel.addEventListener('change', () => {
      const i = Number(sel.dataset.pos);
      const other = t.lineup.findIndex((l, j) => j !== i && l.pos === sel.value);
      if (other >= 0) e.swapPositions(side, i, other);
      else t.lineup[i].pos = sel.value as Position;
      this.lineup(e, side, onBack);
    }));
    m.querySelector('[data-back]')!.addEventListener('click', onBack);
  }

  // ---------------------------------------------------------------- bullpen

  bullpen(e: GameEngine, side: 'home' | 'away', onBack: () => void) {
    const t = e.state[side];
    const cur = t.pitcher;
    const pc = t.pitchCounts.get(cur.id) ?? 0;
    const fat = fatigue(t);
    const arms = t.team.roster.filter((p) => p.pitcher && p.id !== cur.id && !t.removed.has(p.id) && !t.pitchersUsed.includes(p));
    const fielding = e.state.half === 'top' ? side === 'home' : side === 'away';
    const rows = arms.map((p) => {
      const pr = p.pitcher!;
      const w = t.warmup.get(p.id) ?? (pr.role === 'SP' ? 0 : 0);
      const warming = t.warming === p.id;
      return `<tr><td>${esc(p.name)}</td><td>${pr.role}</td><td>${p.throws}HP</td><td class="r">${pr.velocity}</td><td class="r">${pr.control}</td><td class="r">${pr.break}</td><td style="color:var(--muted)">${pr.pitches.map((c) => PITCHES[c].short).join(' ')}</td>
        <td style="width:110px"><div class="stam"><i style="width:${Math.round(w * 100)}%;background:${w >= 1 ? 'var(--good)' : '#ffb347'}"></i></div><span style="font-size:11px;color:var(--muted)">${w >= 1 ? 'READY' : warming ? 'warming ' + Math.round(w * 100) + '%' : Math.round(w * 100) + '%'}</span></td>
        <td><button class="btn small" data-warm="${p.id}">${warming ? 'Sit' : 'Warm up'}</button> <button class="btn small ${w >= 1 ? 'primary' : ''}" data-in="${p.id}" ${fielding ? '' : 'disabled'}>Bring in</button></td></tr>`;
    }).join('');
    const m = this.show(`<h2>BULLPEN</h2>
      <div class="stars">On the mound: <b>${esc(cur.name)}</b> — ${pc} pitches (budget ~${Math.round(pitchBudget(cur))}) · fatigue ${Math.round(Math.min(1.5, fat) * 100)}%</div>
      <div class="stars" style="margin-bottom:8px">Relievers warm up with every pitch thrown. A pitcher brought in before he's ready is less effective.</div>
      <table class="tbl"><tr><th>Pitcher</th><th>Role</th><th></th><th class="r">VEL</th><th class="r">CTL</th><th class="r">BRK</th><th>Pitches</th><th>Warm</th><th></th></tr>${rows}</table>
      <div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);
    m.querySelectorAll<HTMLElement>('[data-warm]').forEach((b) => b.addEventListener('click', () => {
      const id = b.dataset.warm!;
      e.warmUp(side, t.warming === id ? null : id);
      if (!t.warmup.has(id)) t.warmup.set(id, 0);
      this.bullpen(e, side, onBack);
    }));
    m.querySelectorAll<HTMLElement>('[data-in]').forEach((b) => b.addEventListener('click', () => {
      e.bringInPitcher(side, b.dataset.in!);
      onBack();
    }));
    m.querySelector('[data-back]')!.addEventListener('click', onBack);
  }

  // ---------------------------------------------------------------- controls / settings

  controls(onBack?: () => void) {
    const k = (a: string, b: string) => `<div class="k"><span>${a}</span><span>${b.split(' ').map((x) => `<kbd>${x}</kbd>`).join(' ')}</span></div>`;
    const m = this.show(`<h2>CONTROLS</h2><div class="controls-grid">
      <div><h3>BATTING</h3>${k('Move PCI', 'Mouse')}${k('Move PCI (keys / pad)', 'Arrows')}${k('Normal swing', 'SPACE')}${k('Power swing', 'SHIFT+SPACE')}${k('Contact swing', 'CTRL+SPACE')}${k('Contact swing (alt)', 'ALT+SPACE')}${k('Swing / power swing', 'L-Click R-Click')}${k('Steal (before the pitch)', 'Q')}</div>
      <div><h3>PITCHING</h3>${k('Select pitch', 'A S D F G H')}${k('Aim', 'Mouse')}${k('Start meter', 'SPACE')}${k('Stop meter at the gold line', 'SPACE')}</div>
      <div><h3>FIELDING</h3>${k('Move (camera-relative)', 'W A S D')}${k('Sprint', 'SHIFT')}${k('Dive / leap at the wall', 'SPACE')}${k('Throw to 1st / 2nd / 3rd / home', '1 2 3 4')}${k('Throw strength', 'hold, release in green')}</div>
      <div><h3>BASERUNNING</h3>${k('Advance runners', 'Q')}${k('Retreat runners', 'E')}${k('Select runner on 1st/2nd/3rd', '1 2 3')}${k('Select batter-runner', '4')}${k('Select all runners', '0')}</div>
      <div><h3>GAME</h3>${k('Pause menu', 'ESC')}${k('Instant replay', 'R')}${k('Skip / continue', 'SPACE ENTER')}</div>
      <div><h3>REPLAY</h3>${k('Play / pause', 'SPACE')}${k('Slow motion', 'Z')}${k('Scrub', '← →')}${k('Rotate camera', 'A D drag')}${k('Zoom', 'W S wheel')}</div>
      <div><h3>GAMEPAD</h3>${k('PCI / move', 'L-stick')}${k('Swing / dive / meter', 'A')}${k('Power / contact', 'RT LT')}${k('Pitches', 'X Y B ↑ ↓')}${k('Throw to bases', 'D-pad')}${k('Advance / retreat', 'RB LB')}</div>
    </div><div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);
    m.querySelector('[data-back]')!.addEventListener('click', () => (onBack ? onBack() : this.close()));
  }

  settings(p: UserPrefs, onChange: (p: UserPrefs) => void, onBack?: () => void) {
    const row = (label: string, ctl: string) => `<div class="settings-row"><span>${label}</span>${ctl}</div>`;
    const tog = (k: keyof UserPrefs) => `<button class="btn small ${p[k] ? 'sel' : ''}" data-t="${k}">${p[k] ? 'ON' : 'OFF'}</button>`;
    const m = this.show(`<h2>SETTINGS</h2><div style="min-width:440px">
      ${row('Pitch speed (when batting)', `<select data-s="pitchSpeed"><option value="auto" ${p.pitchSpeed === 'auto' ? 'selected' : ''}>By difficulty</option><option value="slow" ${p.pitchSpeed === 'slow' ? 'selected' : ''}>Slower</option><option value="real" ${p.pitchSpeed === 'real' ? 'selected' : ''}>Real speed</option></select>`)}
      ${row('Fielding assist (auto-route until you move)', tog('fieldingAssist'))}
      ${row('Baserunning assist (runners make their own reads)', tog('runningAssist'))}
      ${row('Show strike zone', tog('showStrikeZone'))}
      ${row('Camera shake', tog('cameraShake'))}
      ${row('Master volume', `<input type="range" min="0" max="1" step="0.05" value="${p.volume}" data-r="volume"/>`)}
      ${row('Crowd volume', `<input type="range" min="0" max="1" step="0.05" value="${p.crowdVolume}" data-r="crowdVolume"/>`)}
    </div><div style="margin-top:14px;text-align:right"><button class="btn" data-back>Back</button></div>`);
    m.querySelectorAll<HTMLElement>('[data-t]').forEach((b) => b.addEventListener('click', () => {
      const key = b.dataset.t as keyof UserPrefs;
      (p as unknown as Record<string, unknown>)[key] = !p[key];
      onChange(p);
      this.settings(p, onChange, onBack);
    }));
    m.querySelectorAll<HTMLSelectElement>('[data-s]').forEach((s) => s.addEventListener('change', () => { (p as unknown as Record<string, unknown>)[s.dataset.s!] = s.value; onChange(p); }));
    m.querySelectorAll<HTMLInputElement>('[data-r]').forEach((s) => s.addEventListener('input', () => { (p as unknown as Record<string, unknown>)[s.dataset.r!] = Number(s.value); onChange(p); }));
    m.querySelector('[data-back]')!.addEventListener('click', () => (onBack ? onBack() : this.close()));
  }
}

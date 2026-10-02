/**
 * MenuScreens: HOME → SELECT TEAM → SELECT OPPONENT → STADIUM & CONDITIONS → LINEUP → DIFFICULTY → PLAY.
 */
import type { Conditions, Difficulty, GameSettings, LineupSlot, Player, Position, Team } from '../core/types';
import { DIFFICULTIES } from '../core/types';
import { STADIUMS, STADIUM_BY_ID, wallDistance } from '../data/stadiums';
import { PITCHES } from '../data/pitchTypes';
import { TEAMS, TEAM_BY_ID, defaultSetup, hitters, playerById, starters, teamAttributes } from '../managers/TeamManager';
import { canPlay } from '../managers/RosterManager';
import { seasonBatting, seasonPitching } from '../engine/StatsManager';

export interface MenuCallbacks {
  onStart: (s: GameSettings) => void;
  onPreview: (stadiumId: string, cond: Conditions, homeId: string, awayId: string) => void;
  openControls: () => void;
  openSettings: () => void;
  click: () => void;
}

interface Setup {
  user: string | null;
  opp: string | null;
  userHome: boolean;
  stadiumId: string | null;
  cond: Conditions;
  lineup: LineupSlot[];
  sp: string;
  difficulty: Difficulty;
  innings: number;
  ghost: boolean;
}

const POSITIONS: Position[] = ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'];
const STEPS = ['Team', 'Opponent', 'Ballpark', 'Lineup', 'Difficulty'];
const DIFF_TEXT: Record<Difficulty, string> = {
  ROOKIE: 'Big PCI, generous timing, slower pitches. CPU pitchers leave lots of mistakes over the plate and CPU hitters chase.',
  MINORS: 'Forgiving timing and PCI. CPU pitchers miss spots often; hitters are easy to fool.',
  VETERAN: 'A fair fight. CPU sequences pitches sensibly and makes the occasional mistake.',
  'ALL-STAR': 'Real-speed pitches. CPU hitters recognize spin well and CPU pitchers hit their spots.',
  'HALL OF FAME': 'Tight timing windows and a smaller PCI. CPU pitchers nibble and change speeds intelligently.',
  LEGEND: 'Elite AI: rarely misses locations, rarely chases, punishes every mistake.',
};

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

export function rateClass(v: number) {
  return v >= 75 ? 'hi' : v >= 55 ? 'mid' : 'lo';
}

export function teamCardStyle(t: Team) {
  return `background: linear-gradient(135deg, ${t.colors.primary}, ${shade(t.colors.primary, -0.35)}); color: #fff;`;
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(v + (amt < 0 ? v * amt : (255 - v) * amt))));
  const r = f((n >> 16) & 255), g = f((n >> 8) & 255), b = f(n & 255);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export class MenuScreens {
  root: HTMLElement;
  cb: MenuCallbacks;
  s: Setup = {
    user: null, opp: null, userHome: true, stadiumId: null,
    cond: { time: 'Night', weather: 'Clear', temperature: 72, windMph: 6, windDir: 0 },
    lineup: [], sp: '', difficulty: 'VETERAN', innings: 9, ghost: true,
  };
  private detailTeam: string | null = null;

  constructor(root: HTMLElement, cb: MenuCallbacks) {
    this.root = root;
    this.cb = cb;
  }

  private mount(html: string): HTMLElement {
    this.root.innerHTML = html;
    const el = this.root.firstElementChild as HTMLElement;
    el.querySelectorAll('button, .team-card, .park, .diff').forEach((b) => b.addEventListener('click', () => this.cb.click()));
    return el;
  }

  private head(title: string, step: number) {
    return `<div class="screen-head"><h1>${title}</h1><div class="steps">${STEPS.map((s, i) => `<span class="${i === step ? 'on' : ''}">${i + 1} ${s}</span>`).join('')}</div></div>`;
  }

  hide() {
    this.root.innerHTML = '';
  }

  showHome() {
    const el = this.mount(`<div class="screen home">
      <div class="logo">DIAM<span class="ball"></span>ND<br/>'26<small>BASEBALL</small></div>
      <div class="home-menu">
        <button class="btn primary" data-a="play">Play Ball</button>
        <button class="btn" data-a="controls">Controls</button>
        <button class="btn" data-a="settings">Settings</button>
      </div>
      <div class="home-foot">Personal, non-commercial project · all 30 clubs · rosters editable in src/baseball/data/rosters</div>
    </div>`);
    el.querySelector('[data-a=play]')!.addEventListener('click', () => this.showTeams('user'));
    el.querySelector('[data-a=controls]')!.addEventListener('click', () => this.cb.openControls());
    el.querySelector('[data-a=settings]')!.addEventListener('click', () => this.cb.openSettings());
  }

  // ---------------------------------------------------------------- teams

  private teamGrid(kind: 'user' | 'opp'): string {
    const sel = kind === 'user' ? this.s.user : this.s.opp;
    const league = (lg: 'AL' | 'NL') => `<div class="league"><h2>${lg === 'AL' ? 'AMERICAN LEAGUE' : 'NATIONAL LEAGUE'}</h2>${(['East', 'Central', 'West'] as const)
      .map((d) => `<div class="division"><h3>${lg} ${d}</h3><div class="team-row">${TEAMS.filter((t) => t.league === lg && t.division === d)
        .map((t) => {
          const a = teamAttributes(t);
          const dis = kind === 'opp' && t.id === this.s.user;
          return `<div class="team-card ${t.id === sel ? 'sel' : ''} ${dis ? 'disabled' : ''}" data-id="${t.id}" style="${teamCardStyle(t)}">
            <div class="ovr">${a.overall}</div><div class="abbr">${t.id}</div><div class="nm">${esc(t.city)} ${esc(t.name)}</div>
            <div class="minibars">${[a.power, a.contact, a.speed, a.defense, a.starting, a.bullpen].map((v) => `<div><i style="width:${v}%"></i></div>`).join('')}</div>
            <div class="stripe" style="background:${t.colors.secondary}"></div></div>`;
        }).join('')}</div></div>`).join('')}</div>`;
    return `<div class="leagues">${league('AL')}${league('NL')}</div>`;
  }

  private teamDetail(id: string | null): string {
    if (!id) return `<div class="team-detail"><div class="stars">Select a club to see its strengths. Bars on each card: POW · CON · SPD · DEF · SP · BP</div></div>`;
    const t = TEAM_BY_ID[id];
    const a = teamAttributes(t);
    const attr = (k: string, v: number) => `<div class="attr"><span>${k}</span><div class="bar"><i style="width:${v}%"></i></div><b>${v}</b></div>`;
    const lineup = defaultSetup(t).lineup.map((s) => playerById(s.playerId));
    const topBats = [...lineup].sort((x, y) => (y.ratings.powerR + y.ratings.contactR) - (x.ratings.powerR + x.ratings.contactR)).slice(0, 4);
    const sps = starters(t).slice(0, 3);
    return `<div class="team-detail">
      <div><div style="font-family:var(--display);font-size:28px">${esc(t.city)} ${esc(t.name)}</div>
        <div class="stars">${esc(STADIUM_BY_ID[t.stadiumId].name)} · ${t.league} ${t.division}</div>
        <div style="font-family:var(--display);font-size:46px;color:var(--accent)">${a.overall} <span style="font-size:16px;color:var(--muted)">OVR</span></div></div>
      <div>${attr('Power', a.power)}${attr('Contact', a.contact)}${attr('Speed', a.speed)}${attr('Defense', a.defense)}${attr('Rotation', a.starting)}${attr('Bullpen', a.bullpen)}</div>
      <div class="stars"><b>Key bats:</b> ${topBats.map((p) => esc(p.name)).join(', ')}<br/><b>Rotation:</b> ${sps.map((p) => `${esc(p.name)} (${p.pitcher!.velocity})`).join(', ')}</div>
    </div>`;
  }

  showTeams(kind: 'user' | 'opp') {
    this.detailTeam = kind === 'user' ? this.s.user : this.s.opp;
    const el = this.mount(`<div class="screen">${this.head(kind === 'user' ? 'Select your team' : 'Select opponent', kind === 'user' ? 0 : 1)}
      <div class="screen-body">${this.teamGrid(kind)}<div id="detail">${this.teamDetail(this.detailTeam)}</div></div>
      <div class="screen-foot"><div class="grow">${kind === 'user' ? 'You control this team on the field. The CPU controls the opponent.' : 'The computer will manage and play this club.'}</div>
      ${kind === 'opp' ? '<button class="btn" data-a="random">Random</button>' : ''}<button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next" ${this.detailTeam ? '' : 'disabled'}>Next</button></div></div>`);
    el.querySelectorAll<HTMLElement>('.team-card').forEach((c) => c.addEventListener('click', () => {
      const id = c.dataset.id!;
      if (kind === 'user') this.s.user = id; else this.s.opp = id;
      el.querySelectorAll('.team-card').forEach((x) => x.classList.toggle('sel', x === c));
      el.querySelector('#detail')!.innerHTML = this.teamDetail(id);
      (el.querySelector('[data-a=next]') as HTMLButtonElement).disabled = false;
    }));
    el.querySelector('[data-a=back]')!.addEventListener('click', () => (kind === 'user' ? this.showHome() : this.showTeams('user')));
    el.querySelector('[data-a=random]')?.addEventListener('click', () => {
      const pool = TEAMS.filter((t) => t.id !== this.s.user);
      this.s.opp = pool[Math.floor(Math.random() * pool.length)].id;
      this.showTeams('opp');
    });
    el.querySelector('[data-a=next]')!.addEventListener('click', () => {
      if (kind === 'user') {
        if (this.s.opp === this.s.user) this.s.opp = null;
        this.resetLineup();
        this.showTeams('opp');
      } else {
        this.s.stadiumId = TEAM_BY_ID[this.s.userHome ? this.s.user! : this.s.opp!].stadiumId;
        this.showStadium();
      }
    });
  }

  private resetLineup() {
    const t = TEAM_BY_ID[this.s.user!];
    const d = defaultSetup(t, Math.floor(Math.random() * 5));
    this.s.lineup = d.lineup;
    this.s.sp = d.startingPitcherId;
  }

  // ---------------------------------------------------------------- stadium

  private parkSvg(id: string, size = 54) {
    const st = STADIUM_BY_ID[id];
    const pts: string[] = [];
    const sc = size / 460;
    for (let a = -45; a <= 45; a += 5) {
      const r = wallDistance(st, a) * sc;
      const x = size / 2 + Math.sin((a * Math.PI) / 180) * r;
      const y = size - 4 - Math.cos((a * Math.PI) / 180) * r;
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    const h = `${size / 2},${size - 4}`;
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><polygon points="${h} ${pts.join(' ')}" fill="#2f7a33" stroke="${st.wallColor === '#24533a' ? '#4caf50' : '#ffffff'}" stroke-width="1.2"/><polygon points="${h} ${size / 2 + 9},${size - 13} ${size / 2},${size - 22} ${size / 2 - 9},${size - 13}" fill="#b07a4a"/></svg>`;
  }

  showStadium() {
    const s = this.s;
    const home = TEAM_BY_ID[s.userHome ? s.user! : s.opp!];
    const away = TEAM_BY_ID[s.userHome ? s.opp! : s.user!];
    const segBtns = (name: string, opts: string[], cur: string) => `<div class="seg" data-g="${name}">${opts.map((o) => `<button class="btn ${o === cur ? 'sel' : ''}" data-v="${o}">${o}</button>`).join('')}</div>`;
    const el = this.mount(`<div class="screen">${this.head('Ballpark & conditions', 2)}
      <div class="screen-body">
        <div class="cond">
          <div><label>You are</label>${segBtns('side', ['Home', 'Away'], s.userHome ? 'Home' : 'Away')}</div>
          <div><label>Time</label>${segBtns('time', ['Day', 'Afternoon', 'Night'], s.cond.time)}</div>
          <div><label>Weather</label>${segBtns('weather', ['Clear', 'Cloudy', 'Light Rain'], s.cond.weather)}</div>
          <div><label>Temperature <b id="tv">${s.cond.temperature}°F</b></label><input type="range" min="40" max="100" value="${s.cond.temperature}" id="temp"/></div>
          <div><label>Wind <b id="wv">${s.cond.windMph} mph ${windName(s.cond.windDir)}</b></label><input type="range" min="0" max="20" value="${s.cond.windMph}" id="wind"/>
            <select id="wdir">${[0, 45, 90, 135, 180, 225, 270, 315].map((d) => `<option value="${d}" ${d === s.cond.windDir ? 'selected' : ''}>${windName(d)}</option>`).join('')}</select></div>
        </div>
        <div style="margin:4px 0 10px;color:var(--muted);font-size:13px">${esc(away.name)} at ${esc(home.name)} · choose any park (default: home team's). Dimensions really change how far a ball must carry.</div>
        <div class="park-grid">${STADIUMS.map((st) => `<div class="park ${st.id === s.stadiumId ? 'sel' : ''}" data-id="${st.id}">${this.parkSvg(st.id)}<div><div class="pn">${esc(st.name)}</div>
          <div class="pd">${st.dims[0]} · ${st.dims[2]} · ${st.dims[4]}${st.altitude > 3000 ? ' · ' + st.altitude + ' ft alt' : ''}</div>${st.feature ? `<div class="pd" style="color:#cbd6e6">${esc(st.feature)}</div>` : ''}</div></div>`).join('')}</div>
      </div>
      <div class="screen-foot"><div class="grow"></div><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next">Next</button></div></div>`);
    const preview = () => {
      const h = s.userHome ? s.user! : s.opp!;
      const a = s.userHome ? s.opp! : s.user!;
      this.cb.onPreview(s.stadiumId!, s.cond, h, a);
    };
    preview();
    el.querySelectorAll<HTMLElement>('.seg').forEach((g) => g.querySelectorAll<HTMLElement>('button').forEach((b) => b.addEventListener('click', () => {
      g.querySelectorAll('button').forEach((x) => x.classList.toggle('sel', x === b));
      const v = b.dataset.v!;
      const name = g.dataset.g;
      if (name === 'side') {
        s.userHome = v === 'Home';
        s.stadiumId = TEAM_BY_ID[s.userHome ? s.user! : s.opp!].stadiumId;
        this.showStadium();
        return;
      }
      if (name === 'time') s.cond.time = v as Conditions['time'];
      if (name === 'weather') s.cond.weather = v as Conditions['weather'];
      preview();
    })));
    const temp = el.querySelector<HTMLInputElement>('#temp')!;
    temp.addEventListener('input', () => { s.cond.temperature = Number(temp.value); el.querySelector('#tv')!.textContent = `${temp.value}°F`; });
    const wind = el.querySelector<HTMLInputElement>('#wind')!;
    const wdir = el.querySelector<HTMLSelectElement>('#wdir')!;
    const wupd = () => { s.cond.windMph = Number(wind.value); s.cond.windDir = Number(wdir.value); el.querySelector('#wv')!.textContent = `${wind.value} mph ${windName(s.cond.windDir)}`; };
    wind.addEventListener('input', wupd);
    wdir.addEventListener('change', wupd);
    el.querySelectorAll<HTMLElement>('.park').forEach((p) => p.addEventListener('click', () => {
      s.stadiumId = p.dataset.id!;
      el.querySelectorAll('.park').forEach((x) => x.classList.toggle('sel', x === p));
      preview();
    }));
    el.querySelector('[data-a=back]')!.addEventListener('click', () => this.showTeams('opp'));
    el.querySelector('[data-a=next]')!.addEventListener('click', () => this.showLineup());
  }

  // ---------------------------------------------------------------- lineup

  private lineupErrors(): string[] {
    const errs: string[] = [];
    const pos = this.s.lineup.map((l) => l.pos);
    for (const p of POSITIONS) if (!pos.includes(p)) errs.push(`No ${p}`);
    const dup = POSITIONS.filter((p) => pos.filter((x) => x === p).length > 1);
    if (dup.length) errs.push(`Duplicate: ${dup.join(', ')}`);
    return errs;
  }

  showLineup() {
    const s = this.s;
    const t = TEAM_BY_ID[s.user!];
    const ids = s.lineup.map((l) => l.playerId);
    const bench = hitters(t).filter((p) => !ids.includes(p.id));
    const r = (v: number) => `<span class="rate ${rateClass(v)}">${v}</span>`;
    const rows = s.lineup.map((slot, i) => {
      const p = playerById(slot.playerId);
      const ok = canPlay(p, slot.pos);
      const sb = seasonBatting(p);
      return `<tr>
        <td class="num">${i + 1}</td>
        <td><select data-slot="${i}" class="pl">${hitters(t).map((h) => `<option value="${h.id}" ${h.id === p.id ? 'selected' : ''} ${ids.includes(h.id) && h.id !== p.id ? 'disabled' : ''}>${esc(h.name)}</option>`).join('')}</select></td>
        <td><select data-slot="${i}" class="ps">${POSITIONS.map((q) => `<option ${q === slot.pos ? 'selected' : ''}>${q}</option>`).join('')}</select>${ok ? '' : ' <span class="warn" title="Out of position">⚠</span>'}</td>
        <td>${p.bats}</td><td class="r">${r(Math.round((p.ratings.contactR + p.ratings.contactL) / 2))}</td><td class="r">${r(Math.round((p.ratings.powerR + p.ratings.powerL) / 2))}</td><td class="r">${r(p.ratings.speed)}</td><td class="r">${r(p.ratings.fielding)}</td>
        <td class="r" style="color:var(--muted)">${sb.avg} / ${sb.hr}</td>
        <td><button class="btn small" data-up="${i}">▲</button> <button class="btn small" data-dn="${i}">▼</button></td></tr>`;
    }).join('');
    const sps = starters(t);
    const spRows = t.roster.filter((p) => p.pitcher).map((p) => {
      const pr = p.pitcher!;
      const sp = seasonPitching(p);
      return `<tr><td><input type="radio" name="sp" value="${p.id}" ${p.id === s.sp ? 'checked' : ''} ${pr.role !== 'SP' && !sps.length ? '' : ''}/></td><td>${esc(p.name)}</td><td>${pr.role}</td><td>${p.throws}HP</td>
        <td class="r">${pr.velocity}</td><td class="r">${r(pr.control)}</td><td class="r">${r(pr.break)}</td><td class="r">${r(pr.stamina)}</td><td style="color:var(--muted)">${pr.pitches.map((c) => PITCHES[c].short).join(' ')}</td><td class="r" style="color:var(--muted)">${sp.era}</td></tr>`;
    }).join('');
    const errs = this.lineupErrors();
    const el = this.mount(`<div class="screen">${this.head(`${esc(t.name)} lineup`, 3)}
      <div class="screen-body"><div class="lineup-wrap">
        <div class="panel"><h3>Batting order</h3>
          <table class="tbl"><tr><th>#</th><th>Player</th><th>Pos</th><th>B</th><th class="r">CON</th><th class="r">POW</th><th class="r">SPD</th><th class="r">FLD</th><th class="r">AVG/HR</th><th></th></tr>${rows}</table>
          <div class="warn" style="margin-top:8px">${errs.join(' · ')}</div>
          <h3 style="margin-top:14px">Bench</h3><div class="stars">${bench.map((p) => `${esc(p.name)} <span style="color:var(--muted)">${p.pos}${p.secondary.length ? '/' + p.secondary.join('/') : ''}</span>`).join(' · ') || '—'}</div>
        </div>
        <div class="panel"><h3>Starting pitcher</h3>
          <table class="tbl"><tr><th></th><th>Pitcher</th><th>Role</th><th></th><th class="r">VEL</th><th class="r">CTL</th><th class="r">BRK</th><th class="r">STA</th><th>Pitches</th><th class="r">ERA</th></tr>${spRows}</table>
        </div>
      </div></div>
      <div class="screen-foot"><div class="grow">Change a player or position with the dropdowns; reorder with ▲▼.</div><button class="btn" data-a="auto">Default lineup</button><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="next" ${errs.length ? 'disabled' : ''}>Next</button></div></div>`);
    el.querySelectorAll<HTMLSelectElement>('select.pl').forEach((sel) => sel.addEventListener('change', () => {
      const i = Number(sel.dataset.slot);
      const p = playerById(sel.value);
      s.lineup[i] = { playerId: p.id, pos: s.lineup[i].pos };
      this.showLineup();
    }));
    el.querySelectorAll<HTMLSelectElement>('select.ps').forEach((sel) => sel.addEventListener('change', () => {
      const i = Number(sel.dataset.slot);
      const np = sel.value as Position;
      // Swap positions with whoever had it.
      const other = s.lineup.findIndex((l, j) => j !== i && l.pos === np);
      if (other >= 0) s.lineup[other].pos = s.lineup[i].pos;
      s.lineup[i].pos = np;
      this.showLineup();
    }));
    el.querySelectorAll<HTMLElement>('[data-up]').forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.up); if (i > 0) [s.lineup[i - 1], s.lineup[i]] = [s.lineup[i], s.lineup[i - 1]]; this.showLineup(); }));
    el.querySelectorAll<HTMLElement>('[data-dn]').forEach((b) => b.addEventListener('click', () => { const i = Number(b.dataset.dn); if (i < 8) [s.lineup[i + 1], s.lineup[i]] = [s.lineup[i], s.lineup[i + 1]]; this.showLineup(); }));
    el.querySelectorAll<HTMLInputElement>('input[name=sp]').forEach((rb) => rb.addEventListener('change', () => { s.sp = rb.value; }));
    el.querySelector('[data-a=auto]')!.addEventListener('click', () => { this.resetLineup(); this.showLineup(); });
    el.querySelector('[data-a=back]')!.addEventListener('click', () => this.showStadium());
    el.querySelector('[data-a=next]')!.addEventListener('click', () => this.showDifficulty());
  }

  // ---------------------------------------------------------------- difficulty

  showDifficulty() {
    const s = this.s;
    const u = TEAM_BY_ID[s.user!], o = TEAM_BY_ID[s.opp!];
    const away = s.userHome ? o : u, home = s.userHome ? u : o;
    const el = this.mount(`<div class="screen">${this.head('Difficulty & game length', 4)}
      <div class="screen-body">
        <div class="matchup"><div class="tm" style="${teamCardStyle(away)}">${away.id}</div><div class="vs">at</div><div class="tm" style="${teamCardStyle(home)}">${home.id}</div>
          <div class="stars" style="margin-left:12px">${esc(STADIUM_BY_ID[s.stadiumId!].name)}<br/>${s.cond.time} · ${s.cond.weather} · ${s.cond.temperature}°F · wind ${s.cond.windMph} mph ${windName(s.cond.windDir)}</div></div>
        <div class="diff-grid">${DIFFICULTIES.map((d) => `<div class="diff ${d === s.difficulty ? 'sel' : ''}" data-d="${d}"><h4>${d}</h4><p>${DIFF_TEXT[d]}</p></div>`).join('')}</div>
        <div class="cond" style="margin-top:22px">
          <div><label>Innings</label><div class="seg" data-g="inn">${[1, 3, 6, 9].map((n) => `<button class="btn ${n === s.innings ? 'sel' : ''}" data-v="${n}">${n}</button>`).join('')}</div></div>
          <div><label>Extra innings</label><div class="seg" data-g="ghost"><button class="btn ${s.ghost ? 'sel' : ''}" data-v="1">Runner on 2nd</button><button class="btn ${!s.ghost ? 'sel' : ''}" data-v="0">Classic</button></div></div>
        </div>
      </div>
      <div class="screen-foot"><div class="grow"></div><button class="btn" data-a="back">Back</button><button class="btn primary" data-a="go" style="font-size:22px;padding:12px 36px">Play Ball!</button></div></div>`);
    el.querySelectorAll<HTMLElement>('.diff').forEach((d) => d.addEventListener('click', () => {
      s.difficulty = d.dataset.d as Difficulty;
      el.querySelectorAll('.diff').forEach((x) => x.classList.toggle('sel', x === d));
    }));
    el.querySelectorAll<HTMLElement>('[data-g=inn] button').forEach((b) => b.addEventListener('click', () => {
      s.innings = Number(b.dataset.v);
      el.querySelectorAll('[data-g=inn] button').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    el.querySelectorAll<HTMLElement>('[data-g=ghost] button').forEach((b) => b.addEventListener('click', () => {
      s.ghost = b.dataset.v === '1';
      el.querySelectorAll('[data-g=ghost] button').forEach((x) => x.classList.toggle('sel', x === b));
    }));
    el.querySelector('[data-a=back]')!.addEventListener('click', () => this.showLineup());
    el.querySelector('[data-a=go]')!.addEventListener('click', () => this.cb.onStart(this.buildSettings()));
  }

  buildSettings(): GameSettings {
    const s = this.s;
    const user = { teamId: s.user!, lineup: s.lineup.map((l) => ({ ...l })), startingPitcherId: s.sp };
    const oppTeam = TEAM_BY_ID[s.opp!];
    const opp = defaultSetup(oppTeam, Math.floor(Math.random() * 5));
    return {
      innings: s.innings,
      difficulty: s.difficulty,
      stadiumId: s.stadiumId!,
      conditions: { ...s.cond },
      home: s.userHome ? user : opp,
      away: s.userHome ? opp : user,
      userSide: s.userHome ? 'home' : 'away',
      ghostRunner: s.ghost,
    };
  }
}

export function windName(d: number): string {
  return ({ 0: 'out to CF', 45: 'out to RF', 90: 'L→R', 135: 'in from LF', 180: 'in from CF', 225: 'in from RF', 270: 'R→L', 315: 'out to LF' } as Record<number, string>)[d] ?? `${d}°`;
}

export type { Player };

import { useEffect, useMemo, useState } from 'react';
import type { Dynasty, GameRecord, UpgradeKey } from './types';
import { UPGRADES } from './types';
import { getTeam, LCPS_TEAMS, isLcps, programExpectation, rivalryName } from '../data/teams';
import { TeamLogo, Btn, Stars, RatingBar, Panel } from '../components/common';
import { computeStandings, sortStandings, recordOf, result as gameResult } from './Standings';
import { rankOf, rankingMovement, eloOf } from './Rankings';
import { seedRegion, CHAMPIONSHIP_SITE } from './Playoffs';
import { teamRatings, spendUpgrade, pipelineTalent, xpForLevel } from './Development';
import { buyUpgrade, upgradeCost } from './Season';
import { ovr, fullName, heightStr, POS_KEY_ATTRS, ATTR_LABEL, ROSTER_TEMPLATE, talentFromRating } from '../game/players';
import { GRADE_LABEL, POSITIONS, type PlayerData, type Position, type StatLine } from '../game/types';
import { useSettings, setSettings } from '../save/settings';
import { DIFFICULTIES } from '../game/types';
import { Sound } from '../game/audio/Sound';

// ---------------------------------------------------------------- roster

const POS_ORDER: Position[] = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S', 'K'];

export function depthOrdered(d: Dynasty, pos: Position): PlayerData[] {
  const prog = d.programs[d.userTeam];
  const list = prog.roster.filter((p) => p.pos === pos);
  const custom = prog.depthOrder?.[pos];
  if (custom?.length) {
    const rank = new Map(custom.map((id, i) => [id, i]));
    return list.sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999) || ovr(b) - ovr(a));
  }
  return list.sort((a, b) => ovr(b) - ovr(a));
}

function moveDepth(d: Dynasty, pos: Position, id: string, dir: -1 | 1) {
  const prog = d.programs[d.userTeam];
  const order = depthOrdered(d, pos).map((p) => p.id);
  const i = order.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= order.length) return;
  [order[i], order[j]] = [order[j], order[i]];
  prog.depthOrder = { ...(prog.depthOrder ?? {}), [pos]: order };
}

export function RosterPage({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const [pos, setPos] = useState<Position | 'ALL'>('ALL');
  const [sel, setSel] = useState<PlayerData | null>(null);
  const prog = d.programs[d.userTeam];
  const groups = pos === 'ALL' ? POS_ORDER : [pos];
  return (
    <div className="page">
      <div className="page-tools">
        <div className="seg">
          <button className={pos === 'ALL' ? 'on' : ''} onClick={() => setPos('ALL')}>ALL ({prog.roster.length})</button>
          {POS_ORDER.map((p) => <button key={p} className={pos === p ? 'on' : ''} onClick={() => setPos(p)}>{p}</button>)}
        </div>
        <span className="dim small">Order = depth chart. Use ▲▼ to promote/demote starters. Click a player for details.</span>
      </div>
      {groups.map((g) => {
        const list = depthOrdered(d, g);
        const starters = { QB: 1, RB: 1, WR: 3, TE: 1, OL: 5, DL: 4, LB: 3, CB: 2, S: 2, K: 1 }[g];
        return (
          <Panel key={g} title={`${g} · ${list.length}`}>
            <table className="data-table roster-table">
              <thead><tr><th>DEPTH</th><th>#</th><th>NAME</th><th>YR</th><th>HT/WT</th><th>OVR</th><th>POT</th>{POS_KEY_ATTRS[g].map((k) => <th key={k}>{ATTR_LABEL[k]}</th>)}<th>LVL</th><th>STATUS</th><th /></tr></thead>
              <tbody>
                {list.map((p, i) => (
                  <tr key={p.id} className={i < starters ? 'starter' : ''} onClick={() => setSel(p)}>
                    <td>{i < starters ? <span className="tag tag-gold tiny">STARTER</span> : <span className="dim">{i + 1}</span>}</td>
                    <td className="pixel">{p.number}</td>
                    <td><b>{fullName(p)}</b></td>
                    <td>{GRADE_LABEL[p.grade]}</td>
                    <td className="dim">{heightStr(p.height)} / {p.weight}</td>
                    <td><OvrBadge v={ovr(p)} /></td>
                    <td className="dim">{p.potential}</td>
                    {POS_KEY_ATTRS[g].map((k) => <td key={k}>{p.attrs[k]}</td>)}
                    <td>{p.level}{p.pendingUpgrades > 0 && <span className="up">▲{p.pendingUpgrades}</span>}</td>
                    <td>{p.injury && p.injury.weeks > 0 ? <span className="inj">{p.injury.type} · {p.injury.weeks}wk</span> : <span className="dim">Healthy</span>}</td>
                    <td className="depth-btns" onClick={(e) => e.stopPropagation()}>
                      <button disabled={i === 0} onClick={() => { moveDepth(d, g, p.id, -1); onChange(); }}>▲</button>
                      <button disabled={i === list.length - 1} onClick={() => { moveDepth(d, g, p.id, 1); onChange(); }}>▼</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        );
      })}
      {sel && <PlayerCard d={d} p={sel} onClose={() => setSel(null)} onChange={onChange} />}
    </div>
  );
}

export function OvrBadge({ v }: { v: number }) {
  const c = v >= 80 ? 'elite' : v >= 70 ? 'good' : v >= 60 ? 'avg' : 'low';
  return <span className={`ovr ovr-${c}`}>{v}</span>;
}

function statRows(s: StatLine, pos: Position): [string, string | number][] {
  const r: [string, string | number][] = [['GP', s.gp]];
  if (pos === 'QB' || s.passAtt) r.push(['CMP/ATT', `${s.passCmp}/${s.passAtt}`], ['PASS YDS', s.passYds], ['PASS TD', s.passTD], ['INT', s.passInt]);
  if (s.rushAtt) r.push(['RUSH', `${s.rushAtt}-${s.rushYds}`], ['RUSH TD', s.rushTD]);
  if (s.rec) r.push(['REC', `${s.rec}-${s.recYds}`], ['REC TD', s.recTD]);
  if (s.tackles || ['DL', 'LB', 'CB', 'S'].includes(pos)) r.push(['TKL', Math.round(s.tackles)], ['SACK', s.sacks], ['INT', s.ints], ['FF', s.ff], ['PD', s.pd]);
  if (pos === 'K') r.push(['FG', `${s.fgm}/${s.fga}`], ['LONG', s.fgLong], ['XP', `${s.xpm}/${s.xpa}`], ['PUNTS', s.punts]);
  if (s.retYds) r.push(['RET YDS', s.retYds]);
  return r;
}

export function PlayerCard({ d, p, onClose, onChange }: { d: Dynasty; p: PlayerData; onClose: () => void; onChange?: () => void }) {
  const [, f] = useState(0);
  const team = getTeam(d.userTeam);
  const mine = d.programs[d.userTeam].roster.includes(p);
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="player-card panel" onClick={(e) => e.stopPropagation()}>
        <div className="pc-hero" style={{ background: `linear-gradient(120deg, ${team.colors.primary}, ${team.colors.secondary})` }}>
          <div className="pc-num pixel">{p.number}</div>
          <div>
            <div className="pixel pc-pname">{p.first.toUpperCase()} {p.last.toUpperCase()}</div>
            <div>{p.pos} · {GRADE_LABEL[p.grade]} · {heightStr(p.height)}, {p.weight} lbs</div>
            <div className="small">Level {p.level} · XP {p.xp}/{xpForLevel(p.level)} · Morale {Math.round(p.morale)}</div>
          </div>
          <div className="pc-ovr"><OvrBadge v={ovr(p)} /><div className="small">POT {p.potential}</div></div>
          <button className="close" onClick={onClose}>✕</button>
        </div>
        <div className="pc-body">
          <div>
            <h4>ATTRIBUTES</h4>
            {(['spd', 'str', 'agi', 'acc', 'awr', 'sta'] as const).map((k) => <RatingBar key={k} label={ATTR_LABEL[k]} value={p.attrs[k]} />)}
            <h4>{p.pos} RATINGS</h4>
            {POS_KEY_ATTRS[p.pos].map((k) => (
              <div key={k} className="upg-row">
                <RatingBar label={ATTR_LABEL[k]} value={p.attrs[k]} />
                {mine && p.pendingUpgrades > 0 && <button className="up-btn" onClick={() => { spendUpgrade(p, k); Sound.play('catch'); f((x) => x + 1); onChange?.(); }}>+</button>}
              </div>
            ))}
            {mine && p.pendingUpgrades > 0 && <p className="gold small">{p.pendingUpgrades} upgrade point{p.pendingUpgrades > 1 ? 's' : ''} available{ovr(p) >= p.potential ? ' (at potential: smaller gains)' : ''}.</p>}
          </div>
          <div>
            <h4>{d.year} SEASON</h4>
            <table className="mini-stats"><tbody>{statRows(p.season, p.pos).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>
            <h4>CAREER</h4>
            <table className="mini-stats"><tbody>{statRows(p.career, p.pos).map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody></table>
            {p.history && p.history.length > 0 && (
              <>
                <h4>BY SEASON</h4>
                <table className="mini-stats"><tbody>{p.history.map((h) => <tr key={h.year}><td>{h.year} ({GRADE_LABEL[h.grade]})</td><td>OVR {h.ovr}</td></tr>)}</tbody></table>
              </>
            )}
            {p.injury && p.injury.weeks > 0 && <p className="inj">Injured: {p.injury.type} — {p.injury.weeks} week(s)</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- schedule

export function SchedulePage({ d }: { d: Dynasty }) {
  const games = d.schedule.filter((g) => g.home === d.userTeam || g.away === d.userTeam).sort((a, b) => a.week - b.week);
  const [open, setOpen] = useState<GameRecord | null>(null);
  return (
    <div className="page">
      <Panel title={`${d.year} SCHEDULE — ${getTeam(d.userTeam).shortName.toUpperCase()}`}>
        <div className="schedule-list">
          {games.map((g) => {
            const home = g.home === d.userTeam;
            const opp = getTeam(home ? g.away : g.home);
            const res = gameResult(g, d.userTeam);
            const us = home ? g.homeScore : g.awayScore;
            const them = home ? g.awayScore : g.homeScore;
            return (
              <div key={g.id} className={`sched-row ${g.played ? 'played' : ''}`} onClick={() => g.story && setOpen(g)}>
                <span className="pixel sched-week">{g.round ? g.round.toUpperCase() : `WEEK ${g.week}`}</span>
                <span className="sched-ha">{g.neutral ? 'vs' : home ? 'vs' : '@'}</span>
                <TeamLogo team={opp} size={28} />
                <span className="sched-opp"><b>{opp.shortName}</b> <span className="dim">{opp.mascot}</span></span>
                <span className="sched-tags">
                  {g.rivalry && <span className="tag tag-rival tiny">RIVALRY</span>}
                  {g.district && <span className="tag tiny">DISTRICT</span>}
                  {!isLcps(opp.id) && <span className="tag tiny">NON-LCPS</span>}
                </span>
                <span className={`sched-res ${res === 'W' ? 'win' : res === 'L' ? 'loss' : ''}`}>
                  {g.played ? `${res} ${us}–${them}${g.ot ? ' OT' : ''}` : isLcps(opp.id) ? `${recordOf(d, opp.id)} · #${rankOf(d, opp.id)}` : '—'}
                </span>
              </div>
            );
          })}
        </div>
      </Panel>
      {open && open.story && (
        <div className="modal-back" onClick={() => setOpen(null)}>
          <div className="newspaper big-news" onClick={(e) => e.stopPropagation()}>
            <div className="np-mast">THE LOUDOUN GRIDIRON GAZETTE · WEEK {open.week}</div>
            <div className="np-head">{open.story.headline}</div>
            {open.story.body.map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- standings / rankings

export function StandingsPage({ d }: { d: Dynasty }) {
  const [key, setKey] = useState('pct');
  const [dir, setDir] = useState<1 | -1>(-1);
  const [group, setGroup] = useState<'all' | 'district' | 'region'>('district');
  const rows = computeStandings(d);
  const sortBy = (k: string) => { if (k === key) setDir((x) => (x === -1 ? 1 : -1)); else { setKey(k); setDir(-1); } };
  const groups: [string, typeof rows][] = group === 'all' ? [['ALL LCPS', rows]]
    : group === 'district' ? ['Catoctin', 'Dulles', 'Potomac', 'Cedar Run'].map((x) => [`${x.toUpperCase()} DISTRICT`, rows.filter((r) => r.district === x)])
      : [['REGION 4C (CATOCTIN + DULLES)', rows.filter((r) => r.region === 'north')], ['REGION 5D / 6 (POTOMAC + INDEPENDENCE)', rows.filter((r) => r.region === 'south')]];
  const th = (k: string, label: string) => <th className="sortable" onClick={() => sortBy(k)}>{label}{key === k ? (dir === -1 ? ' ▼' : ' ▲') : ''}</th>;
  return (
    <div className="page">
      <div className="page-tools">
        <div className="seg">
          {(['district', 'region', 'all'] as const).map((g) => <button key={g} className={group === g ? 'on' : ''} onClick={() => setGroup(g)}>{g.toUpperCase()}</button>)}
        </div>
      </div>
      {groups.map(([name, list]) => (
        <Panel key={name} title={name}>
          <table className="data-table">
            <thead><tr><th>#</th>{th('team', 'TEAM')}{th('w', 'W')}{th('l', 'L')}{th('district', 'DIST')}{th('pf', 'PF')}{th('pa', 'PA')}{th('diff', 'DIFF')}<th>STREAK</th><th>LAST 5</th></tr></thead>
            <tbody>
              {sortStandings(list, key, dir).map((r, i) => (
                <tr key={r.team} className={r.team === d.userTeam ? 'me' : ''}>
                  <td className="dim">{i + 1}</td>
                  <td><span className="tcell"><TeamLogo team={getTeam(r.team)} size={20} /> {getTeam(r.team).shortName}</span></td>
                  <td><b>{r.w}</b></td><td>{r.l}</td><td>{r.dw}–{r.dl}</td><td>{r.pf}</td><td>{r.pa}</td>
                  <td className={r.pf - r.pa >= 0 ? 'win' : 'loss'}>{r.pf - r.pa > 0 ? '+' : ''}{r.pf - r.pa}</td>
                  <td>{r.streak || '—'}</td>
                  <td className="last5">{r.last5.map((x, k) => <i key={k} className={x === 'W' ? 'w' : 'l'}>{x}</i>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ))}
    </div>
  );
}

export function RankingsPage({ d }: { d: Dynasty }) {
  const order = d.rankings[d.rankings.length - 1]?.order ?? [];
  return (
    <div className="page">
      <Panel title={`LCPS POWER RANKINGS · ${d.year} · AFTER WEEK ${d.rankings[d.rankings.length - 1]?.week ?? 0}`} right={<span className="dim small">Record · strength of schedule · margin · quality wins</span>}>
        <table className="data-table rank-table">
          <thead><tr><th>RK</th><th>MOVE</th><th>TEAM</th><th>RECORD</th><th>POWER</th><th>PRESTIGE</th></tr></thead>
          <tbody>
            {order.map((id, i) => {
              const mv = rankingMovement(d, id);
              return (
                <tr key={id} className={`${id === d.userTeam ? 'me' : ''} ${i < 10 ? 'top10' : ''}`}>
                  <td className="pixel">{i + 1}</td>
                  <td className={mv > 0 ? 'win' : mv < 0 ? 'loss' : 'dim'}>{mv > 0 ? `▲${mv}` : mv < 0 ? `▼${-mv}` : '—'}</td>
                  <td><span className="tcell"><TeamLogo team={getTeam(id)} size={24} /> <b>{getTeam(id).shortName}</b> <span className="dim">{getTeam(id).mascot}</span></span></td>
                  <td>{recordOf(d, id)}</td>
                  <td>{Math.round(eloOf(d, id))}</td>
                  <td><Stars n={d.programs[id].prestige} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- playoffs

export function PlayoffPage({ d }: { d: Dynasty }) {
  const b = d.bracket;
  if (!b) {
    const n = d.playoffFormat === 'expanded' ? 6 : 4;
    return (
      <div className="page two-col">
        {(['north', 'south'] as const).map((r) => {
          const seeds = seedRegion(d, r, n + 2);
          return (
            <Panel key={r} title={`${r === 'north' ? 'REGION 4C' : 'REGION 5D / 6'} — PROJECTED SEEDS`}>
              <ol className="seed-list">
                {seeds.map((t, i) => (
                  <li key={t} className={`${i < n ? 'in' : 'bubble'} ${t === d.userTeam ? 'me' : ''}`}>
                    <span className="pixel">{i + 1}</span><TeamLogo team={getTeam(t)} size={22} /> {getTeam(t).shortName} <span className="dim">{recordOf(d, t)}</span>
                    {i >= n && <span className="tag tiny">ON THE BUBBLE</span>}
                  </li>
                ))}
              </ol>
            </Panel>
          );
        })}
        <p className="dim small span2">Top {n} in each region make the playoffs (seeded by record, then power rating). Regional champions meet in the LCPS Bowl at {CHAMPIONSHIP_SITE}.</p>
      </div>
    );
  }
  return <BracketView d={d} />;
}

export function BracketView({ d }: { d: Dynasty }) {
  const b = d.bracket!;
  const game = (id: string) => b.games.find((g) => g.id === id);
  const rec = (gid?: string) => (gid ? d.schedule.find((x) => x.id === gid) : undefined);
  const Slot = ({ id }: { id: string }) => {
    const g = game(id);
    if (!g) return null;
    const r = rec(g.gameId);
    const row = (team?: string, seed?: number, score?: number) => (
      <div className={`br-team ${team && g.winner === team ? 'win' : ''} ${team === d.userTeam ? 'me' : ''}`}>
        {team ? <><span className="br-seed">{seed}</span><TeamLogo team={getTeam(team)} size={18} /><span className="br-name">{getTeam(team).shortName}</span><b>{r?.played ? score : ''}</b></> : <span className="dim">TBD</span>}
      </div>
    );
    return (
      <div className={`br-game ${id === 'final' ? 'final' : ''}`}>
        {row(g.away, g.awaySeed, r?.awayScore)}
        {row(g.home, g.homeSeed, r?.homeScore)}
      </div>
    );
  };
  const regionCols = (region: 'north' | 'south') => {
    const rounds = b.rounds.length - 1;
    const cols = [];
    for (let r = 0; r < rounds; r++) {
      const ids = b.games.filter((g) => g.region === region && g.round === r).map((g) => g.id);
      cols.push(<div key={r} className="br-col"><div className="br-round pixel">{b.rounds[r].toUpperCase()}</div>{ids.map((id) => <Slot key={id} id={id} />)}</div>);
    }
    return cols;
  };
  return (
    <div className="page">
      <Panel title={`${b.year} LCPS PLAYOFFS`} right={b.champion ? <span className="gold pixel small">CHAMPION: {getTeam(b.champion).shortName.toUpperCase()}</span> : null}>
        <div className="bracket">
          <div className="br-region"><div className="br-rname pixel">REGION 4C</div><div className="br-cols">{regionCols('north')}</div></div>
          <div className="br-final">
            <div className="br-round pixel gold">LCPS BOWL</div>
            <Slot id="final" />
            <div className="dim tiny">{CHAMPIONSHIP_SITE}</div>
            {b.champion && <Trophy size={70} />}
          </div>
          <div className="br-region"><div className="br-rname pixel">REGION 5D / 6</div><div className="br-cols">{regionCols('south')}</div></div>
        </div>
      </Panel>
    </div>
  );
}

export function Trophy({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 20 24" shapeRendering="crispEdges" className="trophy">
      <rect x="4" y="1" width="12" height="2" fill="#ffe27a" />
      <rect x="3" y="3" width="14" height="6" fill="#f2b632" />
      <rect x="1" y="3" width="2" height="4" fill="#f2b632" /><rect x="17" y="3" width="2" height="4" fill="#f2b632" />
      <rect x="4" y="9" width="12" height="2" fill="#d9951d" />
      <rect x="6" y="11" width="8" height="2" fill="#f2b632" />
      <rect x="8" y="13" width="4" height="4" fill="#d9951d" />
      <rect x="5" y="17" width="10" height="2" fill="#f2b632" />
      <rect x="4" y="19" width="12" height="4" fill="#5b3a1a" />
      <rect x="6" y="20" width="8" height="2" fill="#ffe27a" />
      <rect x="6" y="4" width="2" height="4" fill="#fff4c2" />
    </svg>
  );
}

// ---------------------------------------------------------------- team / players / coaching / recruiting

export function TeamPage({ d }: { d: Dynasty }) {
  const t = getTeam(d.userTeam);
  const prog = d.programs[d.userTeam];
  const r = teamRatings(prog.roster);
  const st = computeStandings(d, true).find((x) => x.team === d.userTeam)!;
  const totals = prog.roster.reduce((a, p) => { a.pass += p.season.passYds; a.rush += p.season.rushYds; a.tkl += p.season.tackles; a.sacks += p.season.sacks; a.ints += p.season.ints; return a; }, { pass: 0, rush: 0, tkl: 0, sacks: 0, ints: 0 });
  return (
    <div className="page two-col">
      <Panel title="TEAM RATINGS">
        <RatingBar label="OFFENSE" value={r.off} />
        <RatingBar label="DEFENSE" value={r.def} />
        <RatingBar label="SPECIAL TEAMS" value={r.st} />
        <RatingBar label="OVERALL" value={r.ovr} />
        <div className="kv"><span>PRESTIGE</span><Stars n={prog.prestige} /></div>
        <div className="kv"><span>EXPECTATION</span><b>{programExpectation({ ...t, prestige: Math.round(prog.prestige) })}</b></div>
        <div className="kv"><span>STADIUM</span><span>{t.stadium}</span></div>
        <div className="kv"><span>COLORS</span><span className="swatches"><i style={{ background: t.colors.primary }} /><i style={{ background: t.colors.secondary }} />{t.colorNames}</span></div>
      </Panel>
      <Panel title={`${d.year} TEAM STATS`}>
        <div className="kv"><span>RECORD</span><b>{st.w}–{st.l}</b></div>
        <div className="kv"><span>POINTS FOR / AGAINST</span><b>{st.pf} / {st.pa}</b></div>
        <div className="kv"><span>PASSING YARDS</span><b>{totals.pass}</b></div>
        <div className="kv"><span>RUSHING YARDS</span><b>{totals.rush}</b></div>
        <div className="kv"><span>TACKLES</span><b>{Math.round(totals.tkl)}</b></div>
        <div className="kv"><span>SACKS / INT</span><b>{totals.sacks} / {totals.ints}</b></div>
      </Panel>
      <Panel title="FACILITIES" className="span2">
        <div className="fac-grid">
          {UPGRADES.map((u) => (
            <div key={u.key} className="fac">
              <div className="pixel small">{u.name.toUpperCase()}</div>
              <div className="fac-pips">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < (prog.facilities[u.key] ?? 0) ? 'on' : ''} />)}</div>
              <div className="dim small">{u.desc}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

export function PlayersPage({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const prog = d.programs[d.userTeam];
  const [sel, setSel] = useState<PlayerData | null>(null);
  const withUps = prog.roster.filter((p) => p.pendingUpgrades > 0).sort((a, b) => ovr(b) - ovr(a));
  const prospects = prog.roster.filter((p) => p.grade <= 10).sort((a, b) => b.potential - a.potential).slice(0, 8);
  const autoAll = () => {
    for (const p of withUps) {
      const keys = POS_KEY_ATTRS[p.pos];
      let guard = 20;
      while (p.pendingUpgrades > 0 && guard-- > 0) spendUpgrade(p, [...keys].sort((a, b) => p.attrs[a] - p.attrs[b])[0]);
    }
    onChange();
  };
  return (
    <div className="page two-col">
      <Panel title={`PLAYER DEVELOPMENT · ${withUps.length} WITH UPGRADES`} right={withUps.length ? <Btn small onClick={autoAll}>AUTO-SPEND ALL</Btn> : null}>
        {withUps.length === 0 && <p className="dim">No pending upgrades. Players earn XP from games, practice, performance and awards.</p>}
        {withUps.map((p) => (
          <div key={p.id} className="dev-row" onClick={() => setSel(p)}>
            <OvrBadge v={ovr(p)} /> <b>{fullName(p)}</b> <span className="dim">{p.pos} · {GRADE_LABEL[p.grade]}</span>
            <span className="up">▲ {p.pendingUpgrades}</span>
          </div>
        ))}
      </Panel>
      <Panel title="TOP PROSPECTS (FR / SO)">
        {prospects.map((p) => (
          <div key={p.id} className="dev-row" onClick={() => setSel(p)}>
            <OvrBadge v={ovr(p)} /> <b>{fullName(p)}</b> <span className="dim">{p.pos} · {GRADE_LABEL[p.grade]}</span>
            <span className="gold small">POT {p.potential}</span>
            <span className="xpbar"><i style={{ width: `${(p.xp / xpForLevel(p.level)) * 100}%` }} /></span>
          </div>
        ))}
      </Panel>
      <Panel title="ALL PLAYERS — XP" className="span2">
        <div className="xp-grid">
          {[...prog.roster].sort((a, b) => ovr(b) - ovr(a)).map((p) => (
            <div key={p.id} className="xp-item" onClick={() => setSel(p)}>
              <span className="pixel tiny">{p.pos}</span> {p.first[0]}. {p.last} <OvrBadge v={ovr(p)} />
              <span className="xpbar"><i style={{ width: `${(p.xp / xpForLevel(p.level)) * 100}%` }} /></span>
            </div>
          ))}
        </div>
      </Panel>
      {sel && <PlayerCard d={d} p={sel} onClose={() => setSel(null)} onChange={onChange} />}
    </div>
  );
}

export function CoachingPage({ d }: { d: Dynasty }) {
  const s = useSettings();
  const c = d.coach;
  return (
    <div className="page two-col">
      <Panel title={`COACH ${d.coachName.toUpperCase()}`}>
        <div className="kv"><span>CAREER RECORD</span><b>{c.wins}–{c.losses}</b></div>
        <div className="kv"><span>LCPS BOWL TITLES</span><b>{c.titles}</b></div>
        <div className="kv"><span>PLAYOFF WINS</span><b>{c.playoffWins}</b></div>
        <div className="kv"><span>SEASONS</span><b>{c.seasons}</b></div>
        <div className="kv"><span>COACH OF THE YEAR</span><b>{c.coyAwards}</b></div>
        <div className="kv"><span>STAFF LEVEL</span><b>{d.programs[d.userTeam].facilities.coaching} / 5</b></div>
      </Panel>
      <Panel title="GAME DAY SETTINGS">
        <div className="opt">
          <span className="opt-label">DIFFICULTY</span>
          <div className="seg">{DIFFICULTIES.map((x) => <button key={x} className={s.difficulty === x ? 'on' : ''} onClick={() => setSettings({ difficulty: x })}>{x}</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">QUARTER LENGTH (also used for simulated games)</span>
          <div className="seg">{[120, 180, 300, 480].map((q) => <button key={q} className={s.quarterLen === q ? 'on' : ''} onClick={() => setSettings({ quarterLen: q })}>{q / 60} MIN</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">DEFENSIVE SNAPS</span>
          <div className="seg">
            <button className={!s.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: false })}>PLAY THEM</button>
            <button className={s.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: true })}>AUTO-SIM</button>
          </div>
        </div>
        <p className="dim small">Your Coaching Staff and Film Room levels make your AI teammates smarter on Friday nights.</p>
      </Panel>
    </div>
  );
}

export function RecruitingPage({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const prog = d.programs[d.userTeam];
  const t = getTeam(d.userTeam);
  const pipe = pipelineTalent(prog, talentFromRating((t.offenseRating + t.defenseRating) / 2));
  const grads = prog.roster.filter((p) => p.grade === 12);
  const needs = (Object.keys(ROSTER_TEMPLATE) as Position[]).map((pos) => {
    const returning = prog.roster.filter((p) => p.pos === pos && p.grade < 12).length;
    return { pos, returning, need: Math.max(0, ROSTER_TEMPLATE[pos] - returning) };
  });
  const grade = pipe >= 63 ? 'A' : pipe >= 59 ? 'B' : pipe >= 55 ? 'C' : pipe >= 51 ? 'D' : 'F';
  return (
    <div className="page two-col">
      <Panel title="PROGRAM DEVELOPMENT">
        <p className="small">High schools don't recruit — they build. Your youth pipeline, facilities, prestige, recent success and community support decide how talented your incoming classes are.</p>
        <div className="kv"><span>PIPELINE GRADE</span><b className="pixel">{grade}</b></div>
        <div className="kv"><span>EXPECTED FRESHMAN TALENT</span><b>{Math.round(pipe - 9)}–{Math.round(pipe + 2)} OVR</b></div>
        <div className="kv"><span>PRESTIGE</span><Stars n={prog.prestige} /></div>
        <div className="kv"><span>RECENT CHAMPIONSHIPS</span><b>{prog.championships.length}</b></div>
        <div className="kv"><span>PROGRAM POINTS</span><b className="gold">{prog.points}</b></div>
        <h4>SENIORS GRADUATING ({grads.length})</h4>
        <p className="small dim">{grads.map((p) => `${p.first[0]}. ${p.last} (${p.pos}, ${ovr(p)})`).join(' · ') || 'None'}</p>
        <h4>ROSTER NEEDS NEXT YEAR</h4>
        <div className="needs">{needs.map((n) => <span key={n.pos} className={`need ${n.need > 0 ? 'hot' : ''}`}>{n.pos} {n.returning}/{ROSTER_TEMPLATE[n.pos]}</span>)}</div>
      </Panel>
      <Panel title="SPEND PROGRAM POINTS">
        {UPGRADES.map((u) => {
          const lvl = prog.facilities[u.key] ?? 0;
          const cost = upgradeCost(lvl);
          return (
            <div key={u.key} className="upgrade-row">
              <div>
                <div className="pixel small">{u.name.toUpperCase()}</div>
                <div className="dim small">{u.desc}</div>
                <div className="fac-pips">{[0, 1, 2, 3, 4].map((i) => <i key={i} className={i < lvl ? 'on' : ''} />)}</div>
              </div>
              <Btn small variant={prog.points >= cost && lvl < 5 ? 'gold' : 'ghost'} disabled={lvl >= 5 || prog.points < cost} onClick={() => { if (buyUpgrade(d, u.key as UpgradeKey)) { Sound.play('select'); onChange(); } }}>
                {lvl >= 5 ? 'MAXED' : `UPGRADE · ${cost}`}
              </Btn>
            </div>
          );
        })}
        <p className="dim small">Earn points by winning (+3), beating rivals (+2), upsets (+2), playoff wins (+5), titles (+15) and prestige each season.</p>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- program / stats / news

export function ProgramPage({ d }: { d: Dynasty }) {
  const prog = d.programs[d.userTeam];
  const t = getTeam(d.userTeam);
  const rivalries = Object.values(d.series).filter((s) => s.a === d.userTeam || s.b === d.userTeam).sort((a, b) => b.games.length - a.games.length);
  return (
    <div className="page two-col">
      <Panel title="CHAMPIONSHIP BANNERS" className="span2">
        <div className="banners">
          {prog.championships.length === 0 && <p className="dim">No LCPS Bowl titles yet. Hang the first banner.</p>}
          {prog.championships.map((y) => (
            <div key={y} className="banner-flag" style={{ background: t.colors.primary, color: t.colors.secondary }}>
              <div className="pixel tiny">LCPS BOWL</div><div className="pixel">{y}</div><div className="pixel tiny">CHAMPIONS</div>
            </div>
          ))}
          {prog.regionTitles.filter((y) => !prog.championships.includes(y)).map((y) => (
            <div key={`r${y}`} className="banner-flag region" style={{ background: t.colors.secondary, color: t.colors.primary }}>
              <div className="pixel tiny">REGION</div><div className="pixel">{y}</div><div className="pixel tiny">CHAMPS</div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="PROGRAM HISTORY">
        <table className="data-table">
          <thead><tr><th>YEAR</th><th>W–L</th><th>DIST</th><th>RANK</th><th>POSTSEASON</th></tr></thead>
          <tbody>
            {[...prog.history].reverse().map((h) => (
              <tr key={h.year} className={h.champion ? 'champ' : ''}><td>{h.year}</td><td>{h.wins}–{h.losses}</td><td>{h.districtWins}–{h.districtLosses}</td><td>#{h.finalRank}</td><td>{h.champion ? '🏆 CHAMPION' : h.playoff}</td></tr>
            ))}
            {prog.history.length === 0 && <tr><td colSpan={5} className="dim">First season in progress.</td></tr>}
          </tbody>
        </table>
        <p className="dim small">{t.history}</p>
      </Panel>
      <Panel title="RIVALRY & SERIES HISTORY">
        {rivalries.length === 0 && <p className="dim">Series records start with your first game.</p>}
        {rivalries.map((s) => {
          const opp = s.a === d.userTeam ? s.b : s.a;
          const us = s.a === d.userTeam ? s.aWins : s.bWins;
          const them = s.a === d.userTeam ? s.bWins : s.aWins;
          const isR = getTeam(d.userTeam).rivals.includes(opp) || getTeam(opp).rivals?.includes(d.userTeam);
          return (
            <div key={opp} className={`series-row ${isR ? 'rival' : ''}`}>
              <TeamLogo team={getTeam(opp)} size={22} /> <b>{getTeam(opp).shortName}</b>
              {isR && <span className="tag tag-rival tiny">{rivalryName(d.userTeam, opp).toUpperCase()}</span>}
              <span className="series-rec">{us}–{them}</span>
              <span className="dim tiny">{s.games.slice(-3).map((g) => `${g.year}: ${g.winner === d.userTeam ? 'W' : 'L'} ${g.score}`).join(' · ')}</span>
            </div>
          );
        })}
      </Panel>
      <Panel title="DISTINGUISHED ALUMNI" className="span2">
        {d.alumni.length === 0 ? <p className="dim">Your first senior class will graduate after this season.</p> : (
          <div className="alumni">{[...d.alumni].sort((a, b) => b.ovr - a.ovr).slice(0, 18).map((a, i) => <div key={i}><b>{a.name}</b> <span className="dim">{a.pos} · {a.years} · {a.ovr} OVR</span></div>)}</div>
        )}
      </Panel>
    </div>
  );
}

export function StatsPage({ d }: { d: Dynasty }) {
  const [scope, setScope] = useState<'team' | 'league'>('team');
  const players = useMemo(() => {
    const out: { p: PlayerData; team: string }[] = [];
    for (const t of LCPS_TEAMS) if (scope === 'league' || t.id === d.userTeam) for (const p of d.programs[t.id].roster) out.push({ p, team: t.id });
    return out;
  }, [d, scope]);
  const cats: [string, (s: StatLine) => number, (s: StatLine) => string][] = [
    ['PASSING', (s) => s.passYds, (s) => `${s.passCmp}/${s.passAtt} · ${s.passYds} yds · ${s.passTD} TD · ${s.passInt} INT · ${s.passAtt ? ((s.passCmp / s.passAtt) * 100).toFixed(0) : 0}%`],
    ['RUSHING', (s) => s.rushYds, (s) => `${s.rushAtt} car · ${s.rushYds} yds · ${s.rushTD} TD · ${s.rushAtt ? (s.rushYds / s.rushAtt).toFixed(1) : 0} avg`],
    ['RECEIVING', (s) => s.recYds, (s) => `${s.rec} rec · ${s.recYds} yds · ${s.recTD} TD`],
    ['TACKLES', (s) => s.tackles, (s) => `${Math.round(s.tackles)} tkl · ${s.sacks} sk · ${s.ff} FF`],
    ['SACKS', (s) => s.sacks, (s) => `${s.sacks} sacks`],
    ['INTERCEPTIONS', (s) => s.ints, (s) => `${s.ints} INT · ${s.pd} PD`],
    ['KICKING', (s) => s.fgm * 3 + s.xpm, (s) => `${s.fgm}/${s.fga} FG · long ${s.fgLong} · ${s.xpm}/${s.xpa} XP`],
  ];
  return (
    <div className="page">
      <div className="page-tools">
        <div className="seg">
          <button className={scope === 'team' ? 'on' : ''} onClick={() => setScope('team')}>{getTeam(d.userTeam).shortName.toUpperCase()}</button>
          <button className={scope === 'league' ? 'on' : ''} onClick={() => setScope('league')}>LCPS LEADERS</button>
        </div>
        <span className="dim small">{d.year} season stats</span>
      </div>
      <div className="stats-grid">
        {cats.map(([name, f, fmt]) => {
          const top = players.filter((x) => f(x.p.season) > 0).sort((a, b) => f(b.p.season) - f(a.p.season)).slice(0, scope === 'league' ? 10 : 5);
          return (
            <Panel key={name} title={name}>
              {top.length === 0 && <p className="dim small">No stats yet.</p>}
              <ol className="leader-list">
                {top.map(({ p, team }) => (
                  <li key={p.id} className={team === d.userTeam ? 'me' : ''}>
                    {scope === 'league' && <TeamLogo team={getTeam(team)} size={16} />} <b>{fullName(p)}</b> <span className="dim">{p.pos}</span>
                    <div className="small">{fmt(p.season)}</div>
                  </li>
                ))}
              </ol>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}

export function NewsPage({ d }: { d: Dynasty }) {
  const items = [...d.news].reverse();
  return (
    <div className="page">
      <Panel title="LOUDOUN GRIDIRON GAZETTE — ARCHIVE">
        <div className="news-list">
          {items.map((n, i) => (
            <div key={i} className={`news-item news-${n.kind}`}>
              <div className="dim tiny">{n.year} · {n.week === 0 ? 'PRESEASON' : n.week <= 10 ? `WEEK ${n.week}` : 'POSTSEASON'}</div>
              <div className="news-head">{n.headline}</div>
              {n.body && <div className="news-body">{n.body}</div>}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

// ---------------------------------------------------------------- season end / offseason

export function SeasonEndView({ d, onContinue }: { d: Dynasty; onContinue: () => void }) {
  const champ = d.champions[d.champions.length - 1];
  const aw = d.awards[d.awards.length - 1];
  const ct = getTeam(champ.team);
  const mine = champ.team === d.userTeam;
  const rec = recordOf(d, champ.team);
  useEffect(() => { if (mine) Sound.play('touchdown'); }, [mine]);
  return (
    <div className="season-end">
      <div className={`champ-card ${mine ? 'mine' : ''}`} style={{ background: `radial-gradient(ellipse at top, ${ct.colors.primary}, #050816 75%)` }}>
        {mine && <div className="confetti-css" />}
        <div className="pixel champ-kicker">{d.year} LCPS BOWL CHAMPIONS</div>
        <Trophy size={110} />
        <TeamLogo team={ct} size={96} />
        <div className="pixel champ-name">{ct.shortName.toUpperCase()} {ct.mascot.toUpperCase()}</div>
        <div className="pixel champ-rec">{rec}</div>
        <div className="dim">Defeated {getTeam(champ.runnerUp).shortName} {champ.score} · {CHAMPIONSHIP_SITE}</div>
        {mine && <div className="pixel gold champ-msg">YOUR PROGRAM IS CHAMPION OF LOUDOUN COUNTY!</div>}
      </div>
      <div className="two-col">
        <Panel title={`${d.year} LCPS AWARDS`}>
          {aw.winners.map((w) => (
            <div key={w.award} className={`award-row ${w.team === d.userTeam ? 'me' : ''}`}>
              <div className="pixel tiny gold">{w.award.toUpperCase()}</div>
              <div><TeamLogo team={getTeam(w.team)} size={18} /> <b>{w.name}</b> <span className="dim">{w.pos ? `${w.pos} · ` : ''}{getTeam(w.team).shortName}</span></div>
              <div className="small dim">{w.line}</div>
            </div>
          ))}
        </Panel>
        <Panel title="ALL-LCPS TEAMS">
          <h4>FIRST TEAM</h4>
          <div className="all-lcps">{aw.allFirst.map((w, i) => <div key={i} className={w.team === d.userTeam ? 'me' : ''}><span className="pixel tiny">{w.pos}</span> {w.name} <span className="dim">{getTeam(w.team).abbreviation}</span></div>)}</div>
          <h4>SECOND TEAM</h4>
          <div className="all-lcps">{aw.allSecond.map((w, i) => <div key={i} className={w.team === d.userTeam ? 'me' : ''}><span className="pixel tiny">{w.pos}</span> {w.name} <span className="dim">{getTeam(w.team).abbreviation}</span></div>)}</div>
        </Panel>
      </div>
      <div className="setup-go"><Btn variant="gold" onClick={onContinue}>BEGIN OFFSEASON ▸</Btn></div>
    </div>
  );
}

export function OffseasonView({ d, onContinue, onChange }: { d: Dynasty; onContinue: () => void; onChange: () => void }) {
  const r = d.lastOffseason!;
  const prog = d.programs[d.userTeam];
  return (
    <div className="page">
      <div className="offseason-head pixel">{r.year} → {d.year} OFFSEASON</div>
      <div className="two-col">
        <Panel title={`GRADUATION · ${r.graduated.length} SENIORS`}>
          <p className="dim small">Thank you, seniors. They played their final snaps for {getTeam(d.userTeam).shortName}.</p>
          <div className="alumni">{r.graduated.sort((a, b) => b.ovr - a.ovr).map((g, i) => <div key={i}><span className="pixel tiny">{g.pos}</span> {g.name} <span className="dim">{g.ovr} OVR</span></div>)}</div>
        </Panel>
        <Panel title="OFFSEASON DEVELOPMENT">
          {r.improved.length === 0 && <p className="dim">Modest gains across the roster.</p>}
          {r.improved.map((x, i) => <div key={i} className="dev-row"><span className="pixel tiny">{x.pos}</span> {x.name} <span className="win">{x.from} → {x.to}</span></div>)}
        </Panel>
        <Panel title={`INCOMING CLASS · ${r.freshmen.length} PLAYERS`}>
          <div className="alumni">{r.freshmen.map((f, i) => <div key={i}><span className="pixel tiny">{f.pos}</span> {f.name} <OvrBadge v={f.ovr} /> <span className="gold small">POT {f.pot}</span></div>)}</div>
        </Panel>
        <Panel title="PROGRAM">
          <div className="kv"><span>PRESTIGE</span><Stars n={prog.prestige} /></div>
          <div className="kv"><span>PROGRAM POINTS</span><b className="gold">{prog.points}</b></div>
          <p className="dim small">Spend points in RECRUITING before the season starts.</p>
          <RecruitingQuick d={d} onChange={onChange} />
        </Panel>
      </div>
      <div className="setup-go"><Btn variant="gold" onClick={onContinue}>START {d.year} SEASON ▸</Btn></div>
    </div>
  );
}

function RecruitingQuick({ d, onChange }: { d: Dynasty; onChange: () => void }) {
  const prog = d.programs[d.userTeam];
  return (
    <div className="quick-upg">
      {UPGRADES.map((u) => {
        const lvl = prog.facilities[u.key] ?? 0;
        const cost = upgradeCost(lvl);
        return (
          <button key={u.key} className="chip" disabled={lvl >= 5 || prog.points < cost} onClick={() => { if (buyUpgrade(d, u.key)) onChange(); }}>
            {u.name} L{lvl} · {lvl >= 5 ? 'MAX' : cost}
          </button>
        );
      })}
    </div>
  );
}

export { POSITIONS };

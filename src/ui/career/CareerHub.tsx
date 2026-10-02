/**
 * Career hub: the player's week. Calendar (7 days × morning/afternoon/evening), the current time slot
 * with its choices, the four meters, a phone with friends/coach/advisor/family, schedule, stats and
 * ratings. Every button changes the career state, which is saved after each action.
 */
import { useMemo, useState } from 'react';
import { navigate } from '../../app/store';
import { TEAM_BY_ID } from '../../data';
import { playerOverall, posDef, ratings, heightLabel, archetypeOf } from '../../career/player';
import {
  ACT,
  ELIGIBLE_GRADES,
  BENCH_TRUST,
  answerInvite,
  benchedFirstQuarter,
  doSlot,
  fixedAt,
  gameThisWeek,
  isEligible,
  loadCareer,
  markRead,
  openSlots,
  pendingGame,
  proposePlan,
  record,
  saveCareer,
  scheduledAt,
  simCurrentGame,
  unreadCount,
  type CareerState,
  type Meter,
} from '../../career/season';
import { TeamBadge } from '../components/common';

const METERS: { id: Meter; label: string; icon: string; color: string; hint: string }[] = [
  { id: 'energy', label: 'Energy', icon: '⚡', color: '#3ddc84', hint: 'Low energy makes training less effective and drains your stamina in games.' },
  { id: 'morale', label: 'Morale', icon: '😊', color: '#ffcc33', hint: 'Happy players train better. Friends, fun and wins raise it.' },
  { id: 'grades', label: 'Grades', icon: '📚', color: '#4a9cff', hint: `Below ${ELIGIBLE_GRADES} you are academically ineligible and can't play.` },
  { id: 'trust', label: 'Coach Trust', icon: '🧢', color: '#ff7a59', hint: `Below ${BENCH_TRUST} the coach benches you for the first quarter.` },
];

type Tab = 'week' | 'schedule' | 'stats' | 'ratings' | 'log';

export function CareerHub() {
  const [c, setC] = useState<CareerState | null>(loadCareer);
  const [, force] = useState(0);
  const [tab, setTab] = useState<Tab>('week');
  const [thread, setThread] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!c) {
    return (
      <div className="menu-screen">
        <div className="center col" style={{ alignItems: 'center' }}>
          <h2>No career yet</h2>
          <button className="btn primary" onClick={() => navigate({ name: 'createPlayer', step: 0 })}>
            Create a Player
          </button>
        </div>
      </div>
    );
  }

  const commit = (msg?: string) => {
    saveCareer(c);
    setC(c);
    force((n) => n + 1);
    if (msg) {
      setToast(msg);
      window.setTimeout(() => setToast((t) => (t === msg ? null : t)), 3200);
    }
  };

  const team = TEAM_BY_ID[c.player.teamId];
  const rec = record(c);
  const ovr = playerOverall(c.player);
  const unread = unreadCount(c);

  return (
    <div className="career-hub" style={{ ['--team' as string]: team?.primaryColor ?? '#bb0000' }}>
      <header className="ch-head">
        <TeamBadge teamId={c.player.teamId} size={54} />
        <div>
          <h1>
            #{c.player.jersey} {c.player.firstName} {c.player.lastName}
          </h1>
          <div className="muted">
            {team?.school} {team?.nickname} · Freshman {c.player.position} · {archetypeOf(c.player).name} · {heightLabel(c.player.heightIn)} {c.player.weight} lbs
          </div>
        </div>
        <div className="ovr-card">
          <div className="ovr-num">{ovr}</div>
          <div className="small-caps">OVR</div>
        </div>
        <div className="ovr-card">
          <div className="ovr-num sm">
            {rec.w}-{rec.l}
          </div>
          <div className="small-caps">Record</div>
        </div>
        <div className="spacer" />
        <button className="btn ghost" onClick={() => navigate({ name: 'career' })}>
          Menu
        </button>
      </header>

      <div className="meters">
        {METERS.map((m) => {
          const v = Math.round(c.meters[m.id]);
          const warn = (m.id === 'grades' && v < ELIGIBLE_GRADES + 8) || (m.id === 'trust' && v < BENCH_TRUST + 5) || (m.id === 'energy' && v < 30);
          return (
            <div key={m.id} className={`meter-card ${warn ? 'warn' : ''}`} title={m.hint}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <span>
                  {m.icon} {m.label}
                </span>
                <b>{v}</b>
              </div>
              <div className="bar">
                <i style={{ width: `${v}%`, background: m.color }} />
              </div>
            </div>
          );
        })}
      </div>
      {!isEligible(c) && <div className="alert bad">📚 Academically ineligible — get your grades above {ELIGIBLE_GRADES} (study, tutor, go to class) to play on Saturday.</div>}
      {isEligible(c) && benchedFirstQuarter(c) && <div className="alert warn">🧢 Coach trust is low — you'll sit the first quarter. Go to practice and film to earn it back.</div>}

      <div className="ch-grid">
        <main className="ch-main">
          <div className="tabs">
            {(
              [
                ['week', `Week ${c.week}`],
                ['schedule', 'Schedule'],
                ['stats', 'Season Stats'],
                ['ratings', 'Ratings'],
                ['log', 'Diary'],
              ] as [Tab, string][]
            ).map(([id, label]) => (
              <button key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                {label}
              </button>
            ))}
          </div>
          {tab === 'week' && (c.over ? <SeasonOver c={c} /> : <WeekView c={c} commit={commit} />)}
          {tab === 'schedule' && <ScheduleView c={c} />}
          {tab === 'stats' && <StatsView c={c} />}
          {tab === 'ratings' && <RatingsView c={c} />}
          {tab === 'log' && (
            <div className="diary panel">
              {[...c.log].reverse().slice(0, 80).map((l, i) => (
                <div key={i} className={`diary-row ${l.tone}`}>
                  <span className="muted tiny">
                    Wk {l.week} {ACT.days[l.day].slice(0, 3)} {ACT.slots[l.slot]}
                  </span>
                  {l.text}
                </div>
              ))}
              {!c.log.length && <div className="muted">Nothing yet — your week starts Monday morning.</div>}
            </div>
          )}
        </main>
        <aside className="phone">
          <div className="phone-top">
            <span>📱 Phone</span>
            {unread > 0 && <span className="badge-dot">{unread}</span>}
          </div>
          {thread ? (
            <Thread c={c} id={thread} back={() => setThread(null)} commit={commit} />
          ) : (
            <div className="contacts">
              {c.contacts.map((k) => {
                const msgs = c.messages.filter((m) => m.contact === k.id);
                const last = msgs[msgs.length - 1];
                const un = msgs.filter((m) => !m.read && !m.mine).length;
                const pending = msgs.some((m) => m.invite?.status === 'pending');
                return (
                  <button
                    key={k.id}
                    className="contact"
                    onClick={() => {
                      markRead(c, k.id);
                      setThread(k.id);
                      commit();
                    }}
                  >
                    <span className="avatar" style={{ background: k.color }}>
                      {k.avatar}
                    </span>
                    <span className="grow">
                      <b>{k.name}</b>
                      <small>{last ? `${last.mine ? 'You: ' : ''}${last.text}` : k.label}</small>
                    </span>
                    {pending && <span className="invite-dot" title="Invite waiting">✉️</span>}
                    {un > 0 && <span className="badge-dot">{un}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </aside>
      </div>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function WeekView({ c, commit }: { c: CareerState; commit: (m?: string) => void }) {
  const game = gameThisWeek(c);
  const pg = pendingGame(c);
  const sch = scheduledAt(c, c.day, c.slot);
  const def = sch.activity ? ACT.activities[sch.activity] : null;
  const opp = game ? TEAM_BY_ID[game.opponentId] : null;
  const partner = sch.with ? c.contacts.find((k) => k.id === sch.with) : null;

  return (
    <div className="col">
      <div className="now-card panel">
        <div className="small-caps">
          Week {c.week} · {ACT.days[c.day]} {ACT.slots[c.slot]}
          {game ? ` · This week: ${game.home ? 'vs' : game.neutral ? 'vs' : 'at'} ${opp?.school}` : ' · Bye week'}
        </div>
        {pg ? (
          <div className="col">
            <div className="game-day">
              <TeamBadge teamId={c.player.teamId} size={60} />
              <div className="vs">{pg.home ? 'VS' : '@'}</div>
              <TeamBadge teamId={pg.opponentId} size={60} />
              <div>
                <h2>GAME DAY</h2>
                <div className="muted">
                  {opp?.school} {opp?.nickname} · {pg.home ? TEAM_BY_ID[c.player.teamId]?.stadium : pg.neutral ?? opp?.stadium}
                  {pg.conference ? ' · Conference game' : ''}
                </div>
              </div>
            </div>
            {!isEligible(c) && <div className="alert bad">You are ineligible this week — the game will be simulated without you.</div>}
            <div className="row wrap">
              <button className="btn primary big" disabled={!isEligible(c)} onClick={() => navigate({ name: 'play', career: true })}>
                🏈 Play the Game (3D)
              </button>
              <button
                className="btn"
                onClick={() => {
                  const r = simCurrentGame(c);
                  commit(r.text);
                }}
              >
                ⏩ Sim Game
              </button>
            </div>
            <div className="muted tiny">
              You play your team's offensive drives in 3D as the {c.player.position}; the other team's drives are simulated. Energy {Math.round(c.meters.energy)} caps your in-game stamina.
            </div>
          </div>
        ) : sch.fixed && def ? (
          <div className="col">
            <h2>
              {def.icon} {def.name}
            </h2>
            <Effects eff={def.effects} xp={def.xp} />
            <div className="row wrap">
              <button className="btn primary" onClick={() => commit(doSlot(c, 'attend').text)}>
                Go to {def.name}
              </button>
              {def.skip && (
                <button className="btn" onClick={() => commit(doSlot(c, 'skip').text)}>
                  {def.skip.name}
                  <Effects eff={def.skip.effects} inline />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="col">
            <h2>Free time{sch.activity ? '' : ' — what do you do?'}</h2>
            {sch.activity && def && (
              <div className="plan-card">
                <span>
                  Planned: <b>{def.icon} {def.name}</b>
                  {partner ? ` with ${partner.name}` : ''}
                </span>
                <button className="btn primary small" onClick={() => commit(doSlot(c).text)}>
                  Go
                </button>
              </div>
            )}
            <div className="choice-grid">
              {ACT.freeChoices
                .filter((a) => a !== 'party' || c.slot === 2)
                .map((a) => {
                  const d = ACT.activities[a];
                  return (
                    <button key={a} className={`choice ${sch.activity === a ? 'active' : ''}`} onClick={() => commit(doSlot(c, a).text)}>
                      <span className="ci">{d.icon}</span>
                      <b>{d.name}</b>
                      <Effects eff={d.effects} xp={d.xp} inline />
                    </button>
                  );
                })}
            </div>
            {partner && <div className="muted tiny">Doing something else will bail on {partner.name}.</div>}
            <div className="muted tiny">Tip: plans made on the phone with a friend give a morale bonus and better training.</div>
          </div>
        )}
      </div>

      <div className="calendar">
        <div />
        {ACT.days.map((d, i) => (
          <div key={d} className={`cal-day ${i === c.day ? 'today' : ''}`}>
            {d.slice(0, 3)}
          </div>
        ))}
        {ACT.slots.map((sl, s) => (
          <CalRow key={sl} c={c} slot={s} />
        ))}
      </div>
    </div>
  );
}

function CalRow({ c, slot }: { c: CareerState; slot: number }) {
  return (
    <>
      <div className="cal-slot">{ACT.slots[slot]}</div>
      {ACT.days.map((_, d) => {
        const past = d < c.day || (d === c.day && slot < c.slot);
        const now = d === c.day && slot === c.slot;
        const done = past ? c.log.find((l) => l.week === c.week && l.day === d && l.slot === slot) : undefined;
        const s = scheduledAt(c, d, slot);
        const def = s.activity ? ACT.activities[s.activity] : null;
        const w = s.with ? c.contacts.find((k) => k.id === s.with) : null;
        return (
          <div key={d} className={`cal-cell ${past ? 'past' : ''} ${now ? 'now' : ''} ${s.fixed ? 'fixed' : ''} ${s.activity === 'game' ? 'game' : ''}`}>
            {done ? (
              <span className={`tiny ${done.tone}`}>{done.text.split('.')[0]}</span>
            ) : def ? (
              <>
                <span>{def.icon}</span>
                <span className="tiny">{def.name}</span>
                {w && <span className="tiny muted">w/ {w.name.split(' ')[0]}</span>}
              </>
            ) : (
              <span className="tiny muted">{fixedAt(c, d, slot) ? '' : 'free'}</span>
            )}
          </div>
        );
      })}
    </>
  );
}

function Effects({ eff, xp, inline }: { eff: Partial<Record<Meter, number>>; xp?: Partial<Record<string, number>>; inline?: boolean }) {
  const icons: Record<string, string> = { energy: '⚡', morale: '😊', grades: '📚', trust: '🧢' };
  const parts = Object.entries(eff).map(([k, v]) => (
    <span key={k} className={(v ?? 0) >= 0 ? 'good' : 'bad'}>
      {icons[k]}
      {(v ?? 0) > 0 ? '+' : ''}
      {v}
    </span>
  ));
  const x = xp
    ? Object.entries(xp).map(([k, v]) => (
        <span key={k} className="accent">
          {k} xp {v}
        </span>
      ))
    : [];
  return <span className={`effects ${inline ? 'inline' : ''}`}>{[...parts, ...x]}</span>;
}

function Thread({ c, id, back, commit }: { c: CareerState; id: string; back: () => void; commit: (m?: string) => void }) {
  const k = c.contacts.find((x) => x.id === id)!;
  const msgs = c.messages.filter((m) => m.contact === id);
  const slots = openSlots(c);
  const [act, setAct] = useState(k.role === 'gym' ? 'weights' : k.role === 'study' ? 'study' : k.role === 'chill' ? 'gaming' : k.role === 'advisor' ? 'tutor' : k.role === 'coach' ? 'film' : 'hangout');
  const [slotIdx, setSlotIdx] = useState(0);
  const sel = slots[slotIdx] ?? slots[0];
  const choices = ACT.freeChoices.filter((a) => a !== 'rest' && (a !== 'party' || sel?.slot === 2));
  return (
    <div className="thread">
      <div className="thread-head">
        <button className="icon-btn" onClick={back}>
          ←
        </button>
        <span className="avatar" style={{ background: k.color }}>
          {k.avatar}
        </span>
        <div>
          <b>{k.name}</b>
          <small className="muted">
            {' '}
            · {k.label} · friendship {Math.round(k.rel)}
          </small>
        </div>
      </div>
      <div className="bubbles">
        {msgs.map((m) => (
          <div key={m.id} className={`bubble ${m.mine ? 'mine' : ''}`}>
            {m.text}
            {m.invite && (
              <div className="invite">
                {ACT.activities[m.invite.activity].icon} {ACT.activities[m.invite.activity].name} · {ACT.days[m.invite.day]} {ACT.slots[m.invite.slot].toLowerCase()}
                {m.invite.status === 'pending' ? (
                  <div className="row" style={{ gap: 6, marginTop: 4 }}>
                    <button className="btn small primary" onClick={() => commit(answerInvite(c, m.id, true))}>
                      Accept
                    </button>
                    <button className="btn small" onClick={() => commit(answerInvite(c, m.id, false))}>
                      Decline
                    </button>
                  </div>
                ) : (
                  <div className={`tiny ${m.invite.status === 'accepted' ? 'good' : 'muted'}`}>{m.invite.status}</div>
                )}
              </div>
            )}
          </div>
        ))}
        {!msgs.length && <div className="muted tiny">No messages yet.</div>}
      </div>
      {!c.over && (
        <div className="compose">
          {slots.length ? (
            <>
              <div className="small-caps">Make plans</div>
              <select value={act} onChange={(e) => setAct(e.target.value)}>
                {choices.map((a) => (
                  <option key={a} value={a}>
                    {ACT.activities[a].icon} {ACT.activities[a].name}
                  </option>
                ))}
              </select>
              <select value={slotIdx} onChange={(e) => setSlotIdx(Number(e.target.value))}>
                {slots.map((s, i) => (
                  <option key={`${s.day}-${s.slot}`} value={i}>
                    {s.day === c.day ? 'Today' : ACT.days[s.day]} {ACT.slots[s.slot].toLowerCase()}
                  </option>
                ))}
              </select>
              <button className="btn primary small" disabled={!sel || !choices.includes(act)} onClick={() => sel && commit(proposePlan(c, id, act, sel.day, sel.slot).text)}>
                Send
              </button>
            </>
          ) : (
            <div className="muted tiny">No free time left this week.</div>
          )}
        </div>
      )}
    </div>
  );
}

function ScheduleView({ c }: { c: CareerState }) {
  return (
    <div className="panel schedule-list">
      {c.schedule.map((g) => {
        const t = TEAM_BY_ID[g.opponentId];
        const r = g.result;
        return (
          <div key={g.week} className={`sched-row ${g.week === c.week ? 'current' : ''}`}>
            <span className="muted">Wk {g.week}</span>
            <TeamBadge teamId={g.opponentId} size={28} />
            <span className="grow">
              {g.home ? 'vs' : g.neutral ? 'vs' : '@'} <b>{t?.school ?? g.opponentId}</b>
              {g.conference && <span className="muted tiny"> · conf</span>}
              {g.neutral && <span className="muted tiny"> · {g.neutral}</span>}
            </span>
            {r ? (
              <span className={r.us > r.them ? 'good' : 'bad'}>
                {r.us > r.them ? 'W' : 'L'} {r.us}-{r.them}
                {!r.played && <span className="muted tiny"> (DNP)</span>}
                {r.simmed && r.played && <span className="muted tiny"> (sim)</span>}
              </span>
            ) : (
              <span className="muted">—</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatsView({ c }: { c: CareerState }) {
  const s = c.seasonStats;
  const games = c.schedule.filter((g) => g.result?.played).length;
  const rows: [string, string | number][] =
    c.player.position === 'QB'
      ? [
          ['Comp/Att', `${s.comp}/${s.att}`],
          ['Pass Yds', s.passYds],
          ['Pass TD', s.passTD],
          ['INT', s.int],
          ['Rush Yds', s.rushYds],
          ['Rush TD', s.rushTD],
          ['Sacked', s.sacks],
        ]
      : c.player.position === 'RB'
        ? [
            ['Carries', s.rushAtt],
            ['Rush Yds', s.rushYds],
            ['YPC', s.rushAtt ? (s.rushYds / s.rushAtt).toFixed(1) : '—'],
            ['Rush TD', s.rushTD],
            ['Rec', s.rec],
            ['Rec Yds', s.recYds],
            ['Rec TD', s.recTD],
          ]
        : [
            ['Rec', s.rec],
            ['Rec Yds', s.recYds],
            ['Avg', s.rec ? (s.recYds / s.rec).toFixed(1) : '—'],
            ['Rec TD', s.recTD],
            ['Long', s.longest],
          ];
  return (
    <div className="panel">
      <div className="muted">Games played: {games}</div>
      <div className="stat-line" style={{ justifyContent: 'flex-start', marginTop: 10 }}>
        {rows.map(([k, v]) => (
          <div key={k}>
            <b>{v}</b>
            <span>{k}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RatingsView({ c }: { c: CareerState }) {
  const r = useMemo(() => ratings(c.player), [c.player, c.log.length]);
  return (
    <div className="panel">
      <div className="muted tiny">Training raises ratings permanently. Gains this season are shown in green.</div>
      {posDef(c.player).attributes.map((a) => (
        <div key={a.id} className="mini-bar" style={{ gridTemplateColumns: '170px 1fr 34px 46px' }}>
          <span>{a.label}</span>
          <i style={{ width: `${r[a.id]}%` }} />
          <b>{r[a.id]}</b>
          <span className="good tiny">{(c.gains[a.id] ?? 0) >= 0.1 ? `+${(c.gains[a.id] ?? 0).toFixed(1)}` : ''}</span>
        </div>
      ))}
    </div>
  );
}

function SeasonOver({ c }: { c: CareerState }) {
  const rec = record(c);
  return (
    <div className="panel col" style={{ alignItems: 'center', textAlign: 'center' }}>
      <h2>Season Complete</h2>
      <div className="big-score">
        {rec.w}-{rec.l}
      </div>
      <StatsView c={c} />
      <div className="muted">
        Grades {Math.round(c.meters.grades)} · Coach trust {Math.round(c.meters.trust)} · OVR {playerOverall(c.player)}
      </div>
      <div className="muted tiny">Multi-year careers (offseason, recruiting, NIL, transfer portal) come next.</div>
      <button className="btn primary" onClick={() => navigate({ name: 'createPlayer', step: 0 })}>
        Start a New Career
      </button>
    </div>
  );
}

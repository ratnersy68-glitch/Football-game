import { useState } from 'react';
import { PLAYOFF_CONFIG, SCHEDULE_RULES, TEAM_BY_ID } from '../../data';
import { autosave, bump, navigate } from '../../app/store';
import type { Dynasty } from '../../models/types';
import { completeWeek } from '../../simulation/seasonEngine';
import { startNextSeason, startOffseason } from '../../simulation/offseasonEngine';
import { postseasonSummary, roundForWeek } from '../../simulation/postseasonEngine';
import { Ovr, Stars, TeamBadge, textOn } from '../components/common';

/** Human label for the current week of the season. */
export function weekLabel(d: Dynasty): string {
  if (d.phase === 'regular') return `Week ${d.week}`;
  if (d.phase === 'ccg') return 'Championship Week';
  if (d.phase === 'postseason') {
    const r = roundForWeek(d.week);
    return r ? (d.week === 16 ? `Bowl Season · ${r.name}` : r.name) : 'Bowl Season';
  }
  if (d.phase === 'seasonComplete') return 'Season Complete';
  return 'Offseason';
}

function useRunner() {
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => void) => {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 20));
    fn();
    bump();
    await autosave();
    setBusy(false);
  };
  return { busy, run };
}

/** Shown when the user's team has no game this week (bye, not in a title game, eliminated). */
export function NoGameCard({ d }: { d: Dynasty }) {
  const { busy, run } = useRunner();
  let title = `Week ${d.week}: Bye Week`;
  let text = 'Rest up. The rest of college football plays on — news and rankings update after the week.';
  if (d.phase === 'ccg') {
    title = 'Championship Week';
    text = "You're not in a conference title game this year. Watch the league crown its champions — the playoff field is announced afterward.";
  } else if (d.phase === 'postseason') {
    const inField = d.postseason?.cfpSeeds.find((s) => s.teamId === d.userTeamId);
    title = weekLabel(d);
    text = inField
      ? inField.seed <= PLAYOFF_CONFIG.byes && d.week === PLAYOFF_CONFIG.rounds[0].week
        ? `First-round bye as the #${inField.seed} seed. Your quarterfinal opponent is decided this week.`
        : `Your season has ended (${postseasonSummary(d, d.userTeamId)}). The playoff continues.`
      : `Your season has ended (${postseasonSummary(d, d.userTeamId)}). Follow the rest of the postseason.`;
  }
  return (
    <div className="next-game">
      <div className="band" style={{ gridTemplateColumns: '1fr auto auto' }}>
        <div>
          <div className="tname">{title}</div>
          <div className="muted">{text}</div>
        </div>
        {d.phase === 'postseason' && (
          <button className="btn" onClick={() => navigate({ name: 'hub', tab: 'postseason' })}>
            View Bracket
          </button>
        )}
        <button className="btn primary" onClick={() => run(() => completeWeek(d))} disabled={busy}>
          {busy ? 'Simulating…' : `Sim ${d.phase === 'regular' ? `Week ${d.week}` : weekLabel(d).split(' · ').pop()}`}
        </button>
      </div>
    </div>
  );
}

export function SeasonCompleteCard({ d }: { d: Dynasty }) {
  const { busy, run } = useRunner();
  const ps = d.postseason;
  const champ = ps?.champion;
  const me = TEAM_BY_ID[d.userTeamId];
  const won = champ === d.userTeamId;
  const rec = d.teams[d.userTeamId].record;
  const hist = d.history.find((h) => h.season === d.season);
  return (
    <div className="col" style={{ gap: 14 }}>
      {champ && (
        <div
          className={`celebrate ${won ? 'confetti' : ''}`}
          style={{ background: `radial-gradient(ellipse at 50% 0%, ${TEAM_BY_ID[champ].primaryColor}, #0b0f18 75%)`, color: textOn(TEAM_BY_ID[champ].primaryColor), border: '1px solid var(--line)' }}
        >
          <div style={{ letterSpacing: '.4em', fontFamily: 'var(--display)', opacity: 0.85 }}>{d.season} NATIONAL CHAMPIONS</div>
          <div style={{ margin: '14px auto' }}>
            <TeamBadge teamId={champ} size={130} />
          </div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 'clamp(40px, 7vw, 84px)', lineHeight: 1, textTransform: 'uppercase', fontWeight: 700 }}>{TEAM_BY_ID[champ].school}</div>
          <div style={{ fontFamily: 'var(--display)', fontSize: 30 }}>
            {d.teams[champ].record.w}-{d.teams[champ].record.l}
          </div>
          <div style={{ opacity: 0.85 }}>
            Beat {TEAM_BY_ID[ps!.runnerUp!]?.school} {ps!.titleScore} in the national championship
          </div>
          {won && <div style={{ fontFamily: 'var(--display)', fontSize: 22, marginTop: 12, color: 'var(--accent)' }}>YOUR PROGRAM IS ON TOP OF THE SPORT.</div>}
        </div>
      )}
      <div className="panel row wrap" style={{ gap: 18 }}>
        <TeamBadge teamId={me.id} size={56} />
        <div className="grow">
          <div style={{ fontFamily: 'var(--display)', fontSize: 24, textTransform: 'uppercase' }}>
            {me.school}: {rec.w}-{rec.l} · {hist?.user.postseason}
          </div>
          <div className="muted">
            Final rank {hist?.user.finalRank ? `#${hist.user.finalRank}` : 'unranked'} · {rec.confW}-{rec.confL} conference
          </div>
        </div>
        <button className="btn" onClick={() => navigate({ name: 'hub', tab: 'postseason' })}>
          Postseason & Awards
        </button>
        <button className="btn primary" onClick={() => run(() => startOffseason(d))} disabled={busy}>
          {busy ? 'Working…' : 'Advance to Offseason →'}
        </button>
      </div>
      {ps && <AwardsPanel awards={ps.awards} />}
    </div>
  );
}

export function AwardsPanel({ awards }: { awards: NonNullable<Dynasty['postseason']>['awards'] }) {
  return (
    <div className="panel">
      <h3>Season Awards</h3>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {awards.map((a) => (
          <div key={a.id} className="row" style={{ alignItems: 'flex-start', background: 'var(--bg2)', borderRadius: 8, padding: 10 }}>
            <TeamBadge teamId={a.teamId} size={40} />
            <div className="grow">
              <div className="muted" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                {a.name} · {a.label}
              </div>
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, textTransform: 'uppercase' }}>
                {a.winnerName} {a.position ? <span className="muted">{a.position}</span> : null}
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                {TEAM_BY_ID[a.teamId]?.school} · {a.statLine}
              </div>
              {a.finalists?.length ? (
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                  Finalists: {a.finalists.map((f) => `${f.name} (${TEAM_BY_ID[f.teamId]?.abbreviation})`).join(', ')}
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OffseasonCard({ d }: { d: Dynasty }) {
  const { busy, run } = useRunner();
  const o = d.offseason;
  if (!o) return null;
  const myRank = o.classRankings.findIndex((c) => c.teamId === d.userTeamId) + 1;
  const myClass = o.classRankings.find((c) => c.teamId === d.userTeamId);
  const myPicks = o.draft.filter((p) => p.teamId === d.userTeamId);
  const prestige = o.prestige.find((p) => p.teamId === d.userTeamId);
  const recruits = o.userClass.map((id) => d.players[id]).filter(Boolean);
  const firstRound = o.draft.filter((p) => p.round === 1);
  return (
    <div className="col" style={{ gap: 14 }}>
      <div className="panel row wrap" style={{ gap: 16 }}>
        <div className="grow">
          <h2 style={{ fontSize: 30 }}>{o.completedSeason} Offseason</h2>
          <div className="muted">
            {o.userGraduates.length} departures · {myPicks.length} drafted · signed {myClass?.count ?? 0} recruits (class rank #{myRank}) · program prestige {prestige ? `${prestige.from.toFixed(0)} → ${prestige.to.toFixed(0)}` : '—'}
          </div>
        </div>
        <button className="btn primary" style={{ fontSize: 18 }} onClick={() => run(() => startNextSeason(d))} disabled={busy}>
          {busy ? 'Building schedule…' : `Begin ${o.nextSeason} Season →`}
        </button>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div className="panel">
          <h3>Signing Class · #{myRank} nationally</h3>
          <div className="muted" style={{ fontSize: 12, marginBottom: 8 }}>
            {myClass?.five ?? 0}× 5★ · {myClass?.four ?? 0}× 4★ · avg {myClass?.avgStars.toFixed(2)}★. (Auto-signed by your staff until the recruiting system arrives.)
          </div>
          <table className="data">
            <tbody>
              {recruits.slice(0, 14).map((p) => (
                <tr key={p.id}>
                  <td>
                    <Stars n={p.stars} />
                  </td>
                  <td>{p.position}</td>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="muted">
                    {p.hometown}, {p.state}
                  </td>
                  <td className="num">
                    <Ovr v={p.overall} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel">
          <h3>Player Development</h3>
          {o.risers.map((r) => (
            <div key={r.playerId} className="row" style={{ padding: '4px 0' }}>
              <b style={{ width: 34 }}>{r.position}</b>
              <span className="grow">{r.name}</span>
              <span className="mono">
                {r.from} → <b className="good">{r.to}</b>
              </span>
            </div>
          ))}
          {o.fallers.length > 0 && <div className="muted" style={{ marginTop: 10, fontSize: 12 }}>Regressed</div>}
          {o.fallers.map((r) => (
            <div key={r.playerId} className="row" style={{ padding: '4px 0' }}>
              <b style={{ width: 34 }}>{r.position}</b>
              <span className="grow">{r.name}</span>
              <span className="mono">
                {r.from} → <b className="bad">{r.to}</b>
              </span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Departures & NFL Draft</h3>
          {myPicks.map((p) => (
            <div key={p.playerId} className="row" style={{ padding: '4px 0' }}>
              <span className="pill w">R{p.round} #{p.overall}</span>
              <b>{p.position}</b>
              <span className="grow">{p.playerName}</span>
              {p.early && <span className="pill">early</span>}
            </div>
          ))}
          {!myPicks.length && <div className="muted">No draft picks from your program this year.</div>}
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Graduating/leaving: {o.userGraduates.slice(0, 8).map((g) => `${g.name} (${g.position} ${g.overall})`).join(', ')}
            {o.userGraduates.length > 8 ? ` +${o.userGraduates.length - 8} more` : ''}
          </div>
        </div>
        <div className="panel">
          <h3>Draft · Round 1</h3>
          {firstRound.slice(0, 32).map((p) => (
            <div key={p.playerId} className="row" style={{ padding: '2px 0', fontSize: 13 }}>
              <span className="muted" style={{ width: 26 }}>
                {p.pick}
              </span>
              <TeamBadge teamId={p.teamId} size={18} />
              <span className="grow">
                {p.playerName} <span className="muted">{p.position}</span>
              </span>
            </div>
          ))}
        </div>
        <div className="panel">
          <h3>Top Recruiting Classes</h3>
          {o.classRankings.slice(0, 10).map((c, i) => (
            <div key={c.teamId} className="row" style={{ padding: '3px 0', background: c.teamId === d.userTeamId ? 'rgba(255,204,51,.08)' : undefined }}>
              <b style={{ width: 22 }}>{i + 1}</b>
              <TeamBadge teamId={c.teamId} size={22} />
              <span className="grow">{TEAM_BY_ID[c.teamId].school}</span>
              <span className="muted mono">
                {c.five}×5★ {c.four}×4★
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="muted" style={{ fontSize: 12 }}>
        Season {o.nextSeason} has {SCHEDULE_RULES.gamesPerTeam} regular-season games; your depth chart keeps your order and adds freshmen at the bottom.
      </div>
    </div>
  );
}

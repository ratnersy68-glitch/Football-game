import { useEffect, useState } from 'react';
import type { Dynasty, RecordEntry } from '../dynasty/types';
import { IND_CATS, TEAM_CATS } from '../dynasty/Records';
import { getTeam, isLcps } from '../data/teams';
import { TeamLogo, Btn, Panel } from '../components/common';
import { lastSlot, listSaves, loadSlot } from '../save/storage';

export function RecordBookView({ d }: { d: Dynasty }) {
  const [mine, setMine] = useState(false);
  const filt = (l?: RecordEntry[]) => (l ?? []).filter((e) => !mine || e.team === d.userTeam).slice(0, mine ? 5 : 5);
  const row = (e: RecordEntry, i: number) => (
    <li key={i} className={e.team === d.userTeam ? 'me' : ''}>
      <b>{e.value}</b> {isLcps(e.team) && <TeamLogo team={getTeam(e.team)} size={14} />} {e.player ?? getTeam(e.team).shortName}
      <span className="dim small"> · {e.player ? `${getTeam(e.team).abbreviation} · ` : ''}{e.year}{e.detail ? ` · ${e.detail}` : ''}</span>
    </li>
  );
  const section = (title: string, book: Record<string, RecordEntry[]>, cats: { key: string; label: string }[]) => (
    <Panel title={title}>
      <div className="records-grid">
        {cats.map((c) => (
          <div key={c.key} className="record-cat">
            <div className="pixel tiny gold">{c.label.toUpperCase()}</div>
            <ol>{filt(book[c.key]).map(row)}</ol>
            {filt(book[c.key]).length === 0 && <div className="dim small">—</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
  return (
    <div className="page">
      <div className="page-tools">
        <div className="seg">
          <button className={!mine ? 'on' : ''} onClick={() => setMine(false)}>ALL LCPS</button>
          <button className={mine ? 'on' : ''} onClick={() => setMine(true)}>{getTeam(d.userTeam).shortName.toUpperCase()} ONLY</button>
        </div>
        <span className="dim small">Records since {d.startYear}. Career totals update at the end of each season.</span>
      </div>
      {section('SINGLE GAME', d.records.game, IND_CATS)}
      {section('SEASON', d.records.season, IND_CATS)}
      {section('CAREER', d.records.career, IND_CATS.filter((c) => c.key !== 'fgLong'))}
      {section('TEAM RECORDS', d.records.team, TEAM_CATS)}
      <Panel title="LCPS BOWL CHAMPIONS">
        <ol className="champ-list">
          {[...d.champions].reverse().map((c) => (
            <li key={c.year} className={c.team === d.userTeam ? 'me' : ''}><b>{c.year}</b> <TeamLogo team={getTeam(c.team)} size={18} /> {getTeam(c.team).shortName} {getTeam(c.team).mascot} <span className="dim">def. {getTeam(c.runnerUp).shortName} {c.score}</span></li>
          ))}
          {d.champions.length === 0 && <li className="dim">The first LCPS Bowl will be played in November {d.year}.</li>}
        </ol>
      </Panel>
    </div>
  );
}

export function RecordBookScreen({ onBack }: { onBack: () => void }) {
  const [d, setD] = useState<Dynasty | null | undefined>(undefined);
  useEffect(() => {
    const slot = lastSlot() ?? listSaves().find((s) => s.exists)?.slot;
    if (!slot) { setD(null); return; }
    loadSlot<Dynasty>(slot).then((x) => setD(x));
  }, []);
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">RECORD BOOK</h2>
        <span />
      </header>
      <main className="dyn-main">
        {d === undefined ? <p className="dim">Loading…</p> : d === null ? <p className="dim center">Start a dynasty to begin writing the LCPS record book.</p> : <RecordBookView d={d} />}
      </main>
    </div>
  );
}

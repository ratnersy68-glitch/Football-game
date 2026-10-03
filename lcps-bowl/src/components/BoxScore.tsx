import type { GameSession } from '../game/GameSession';
import type { PlayerData, StatLine } from '../game/types';
import type { Side } from '../game/Rules';

export interface Leader { p: PlayerData; s: StatLine; side: Side }

export function gameLeaders(s: GameSession) {
  const all: Leader[] = [];
  for (const side of ['home', 'away'] as Side[]) {
    for (const p of s.team(side).roster) {
      const st = s.g.stats[p.id];
      if (st) all.push({ p, s: st, side });
    }
  }
  const top = (side: Side, f: (s: StatLine) => number) => all.filter((l) => l.side === side && f(l.s) > 0).sort((a, b) => f(b.s) - f(a.s))[0];
  return { all, top };
}

export function BoxScore({ s, compact }: { s: GameSession; compact?: boolean }) {
  const g = s.g;
  const { top } = gameLeaders(s);
  const sides: Side[] = ['away', 'home'];
  const t = g.totals;
  const rows: [string, (x: Side) => string | number][] = [
    ['First downs', (x) => t[x].firstDowns],
    ['Total yards', (x) => Math.round(t[x].totalYds)],
    ['Passing', (x) => Math.round(t[x].passYds)],
    ['Rushing', (x) => Math.round(t[x].rushYds)],
    ['Turnovers', (x) => t[x].turnovers],
    ['3rd down', (x) => `${t[x].thirdConv}/${t[x].thirdAtt}`],
    ['Sacks', (x) => t[x].sacks],
    ['Possession', (x) => `${Math.floor(t[x].top / 60)}:${String(Math.round(t[x].top % 60)).padStart(2, '0')}`],
  ];
  const leaderLine = (side: Side) => {
    const qb = top(side, (x) => x.passYds + x.passAtt);
    const rb = top(side, (x) => x.rushYds + x.rushAtt * 0.1);
    const wr = top(side, (x) => x.recYds + x.rec * 0.1);
    const df = top(side, (x) => x.tackles + x.sacks * 2 + x.ints * 3);
    return (
      <ul className="leaders">
        {qb && qb.s.passAtt > 0 && <li><b>{qb.p.first[0]}. {qb.p.last}</b> {qb.s.passCmp}/{qb.s.passAtt}, {qb.s.passYds} yds, {qb.s.passTD} TD{qb.s.passInt ? `, ${qb.s.passInt} INT` : ''}</li>}
        {rb && rb.s.rushAtt > 0 && <li><b>{rb.p.first[0]}. {rb.p.last}</b> {rb.s.rushAtt} car, {rb.s.rushYds} yds{rb.s.rushTD ? `, ${rb.s.rushTD} TD` : ''}</li>}
        {wr && wr.s.rec > 0 && <li><b>{wr.p.first[0]}. {wr.p.last}</b> {wr.s.rec} rec, {wr.s.recYds} yds{wr.s.recTD ? `, ${wr.s.recTD} TD` : ''}</li>}
        {df && <li><b>{df.p.first[0]}. {df.p.last}</b> {df.s.tackles} tkl{df.s.sacks ? `, ${df.s.sacks} sk` : ''}{df.s.ints ? `, ${df.s.ints} INT` : ''}</li>}
      </ul>
    );
  };
  return (
    <div className={`boxscore ${compact ? 'compact' : ''}`}>
      <table className="qtable">
        <thead>
          <tr><th />{g.qScores.home.map((_, i) => <th key={i}>{i < 4 ? i + 1 : 'OT'}</th>)}<th>T</th></tr>
        </thead>
        <tbody>
          {sides.map((x) => (
            <tr key={x}>
              <td className="pixel">{s.team(x).info.abbreviation}</td>
              {g.qScores[x].map((v, i) => <td key={i}>{v}</td>)}
              <td className="pixel">{g.score[x]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="bs-grid">
        <table className="ttable">
          <thead><tr><th /><th>{s.team('away').info.abbreviation}</th><th>{s.team('home').info.abbreviation}</th></tr></thead>
          <tbody>{rows.map(([label, f]) => <tr key={label}><td>{label}</td><td>{f('away')}</td><td>{f('home')}</td></tr>)}</tbody>
        </table>
        <div className="bs-leaders">
          <div><h4>{s.team('away').info.shortName}</h4>{leaderLine('away')}</div>
          <div><h4>{s.team('home').info.shortName}</h4>{leaderLine('home')}</div>
        </div>
      </div>
    </div>
  );
}

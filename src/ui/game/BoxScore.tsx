import { TEAM_BY_ID } from '../../data';
import type { GamePlayerLine, GameResult, Player, TeamGameStats } from '../../models/types';
import { formatClock, pct } from '../../core/util';
import { TeamBadge } from '../components/common';

function nm(players: Record<string, Player>, id: string): string {
  const p = players[id];
  return p ? `${p.firstName[0]}. ${p.lastName}` : id;
}

function Section({
  title,
  lines,
  cols,
  players,
}: {
  title: string;
  lines: GamePlayerLine[];
  cols: [string, (l: GamePlayerLine) => string | number][];
  players: Record<string, Player>;
}) {
  if (!lines.length) return null;
  return (
    <table className="data box-table" style={{ marginBottom: 10 }}>
      <thead>
        <tr>
          <th>{title}</th>
          {cols.map(([h]) => (
            <th key={h} className="num">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {lines.map((l) => (
          <tr key={l.playerId}>
            <td>
              {players[l.playerId] ? `#${players[l.playerId].jersey} ` : ''}
              {nm(players, l.playerId)}
            </td>
            {cols.map(([h, f]) => (
              <td key={h} className="num">
                {f(l)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const n = (v?: number) => v ?? 0;

export function passerRating(l: GamePlayerLine): number {
  const att = n(l.passAtt);
  if (!att) return 0;
  return (8.4 * n(l.passYds) + 330 * n(l.passTD) + 100 * n(l.passComp) - 200 * n(l.passInt)) / att;
}

export function TeamBox({ teamId, lines, players }: { teamId: string; lines: GamePlayerLine[]; players: Record<string, Player> }) {
  const mine = lines.filter((l) => l.teamId === teamId);
  const by = (k: keyof GamePlayerLine) => mine.filter((l) => n(l[k] as number) !== 0).sort((a, b) => n(b[k] as number) - n(a[k] as number));
  return (
    <div>
      <div className="row" style={{ marginBottom: 8 }}>
        <TeamBadge teamId={teamId} size={26} />
        <h4>{TEAM_BY_ID[teamId]?.school}</h4>
      </div>
      <Section
        title="Passing"
        lines={by('passAtt')}
        players={players}
        cols={[
          ['C/ATT', (l) => `${n(l.passComp)}/${n(l.passAtt)}`],
          ['YDS', (l) => n(l.passYds)],
          ['TD', (l) => n(l.passTD)],
          ['INT', (l) => n(l.passInt)],
          ['RTG', (l) => passerRating(l).toFixed(1)],
        ]}
      />
      <Section
        title="Rushing"
        lines={by('rushAtt')}
        players={players}
        cols={[
          ['CAR', (l) => n(l.rushAtt)],
          ['YDS', (l) => n(l.rushYds)],
          ['AVG', (l) => (n(l.rushYds) / Math.max(1, n(l.rushAtt))).toFixed(1)],
          ['TD', (l) => n(l.rushTD)],
          ['LNG', (l) => n(l.rushLong)],
        ]}
      />
      <Section
        title="Receiving"
        lines={by('rec')}
        players={players}
        cols={[
          ['REC', (l) => n(l.rec)],
          ['YDS', (l) => n(l.recYds)],
          ['AVG', (l) => (n(l.recYds) / Math.max(1, n(l.rec))).toFixed(1)],
          ['TD', (l) => n(l.recTD)],
          ['LNG', (l) => n(l.recLong)],
        ]}
      />
      <Section
        title="Defense"
        lines={mine.filter((l) => n(l.tackles) || n(l.sacks) || n(l.defInt) || n(l.passDef) || n(l.forcedFum)).sort((a, b) => n(b.tackles) - n(a.tackles)).slice(0, 10)}
        players={players}
        cols={[
          ['TKL', (l) => n(l.tackles)],
          ['TFL', (l) => n(l.tfl)],
          ['SCK', (l) => n(l.sacks)],
          ['INT', (l) => n(l.defInt)],
          ['PD', (l) => n(l.passDef)],
          ['FF', (l) => n(l.forcedFum)],
        ]}
      />
      <Section
        title="Kicking"
        lines={mine.filter((l) => n(l.fga) || n(l.xpa))}
        players={players}
        cols={[
          ['FG', (l) => `${n(l.fgm)}/${n(l.fga)}`],
          ['LNG', (l) => n(l.fgLong)],
          ['XP', (l) => `${n(l.xpm)}/${n(l.xpa)}`],
        ]}
      />
      <Section
        title="Punting"
        lines={by('punts')}
        players={players}
        cols={[
          ['NO', (l) => n(l.punts)],
          ['AVG', (l) => (n(l.puntYds) / Math.max(1, n(l.punts))).toFixed(1)],
          ['LNG', (l) => n(l.puntLong)],
        ]}
      />
    </div>
  );
}

export function TeamStatsCompare({ home, away, homeId, awayId }: { home: TeamGameStats; away: TeamGameStats; homeId: string; awayId: string }) {
  const rows: [string, (t: TeamGameStats) => string | number][] = [
    ['First downs', (t) => t.firstDowns],
    ['Total yards', (t) => t.totalYards],
    ['Passing (net)', (t) => t.passYards],
    ['Comp/Att', (t) => `${t.passComp}/${t.passAtt}`],
    ['Rushing', (t) => `${t.rushYards} (${t.rushAtt})`],
    ['3rd down', (t) => `${t.thirdDownConv}/${t.thirdDownAtt} (${pct(t.thirdDownConv, t.thirdDownAtt, 0)}%)`],
    ['4th down', (t) => `${t.fourthDownConv}/${t.fourthDownAtt}`],
    ['Red zone TD', (t) => `${t.redZoneTD}/${t.redZoneAtt}`],
    ['Turnovers', (t) => t.turnovers],
    ['Sacks', (t) => t.sacks],
    ['Penalties', (t) => `${t.penalties}-${t.penaltyYards}`],
    ['Possession', (t) => formatClock(t.timeOfPossession)],
  ];
  return (
    <div className="team-compare">
      <div className="center">
        <b>{TEAM_BY_ID[awayId]?.abbreviation}</b>
      </div>
      <div />
      <div className="center">
        <b>{TEAM_BY_ID[homeId]?.abbreviation}</b>
      </div>
      {rows.map(([label, f]) => (
        <div key={label} style={{ display: 'contents' }}>
          <div className="center mono">{f(away)}</div>
          <div className="lbl">{label}</div>
          <div className="center mono">{f(home)}</div>
        </div>
      ))}
    </div>
  );
}

export function Linescore({ result, homeId, awayId }: { result: GameResult; homeId: string; awayId: string }) {
  const periods = Math.max(4, result.home.scoreByPeriod.length, result.away.scoreByPeriod.length);
  const cell = (arr: number[], i: number) => arr[i] ?? 0;
  return (
    <table className="data box-table" style={{ maxWidth: 420 }}>
      <thead>
        <tr>
          <th />
          {Array.from({ length: periods }, (_, i) => (
            <th key={i} className="num">
              {i < 4 ? i + 1 : 'OT'}
            </th>
          ))}
          <th className="num">T</th>
        </tr>
      </thead>
      <tbody>
        {[
          [awayId, result.away, result.awayScore],
          [homeId, result.home, result.homeScore],
        ].map(([id, t, s]) => (
          <tr key={id as string}>
            <td>
              <b>{TEAM_BY_ID[id as string]?.abbreviation}</b>
            </td>
            {Array.from({ length: periods }, (_, i) => (
              <td key={i} className="num">
                {cell((t as TeamGameStats).scoreByPeriod, i)}
              </td>
            ))}
            <td className="num">
              <b>{s as number}</b>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function FullBoxScore({ result, homeId, awayId, players }: { result: GameResult; homeId: string; awayId: string; players: Record<string, Player> }) {
  return (
    <div className="col" style={{ gap: 16 }}>
      <Linescore result={result} homeId={homeId} awayId={awayId} />
      <TeamStatsCompare home={result.home} away={result.away} homeId={homeId} awayId={awayId} />
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <TeamBox teamId={awayId} lines={result.playerLines} players={players} />
        <TeamBox teamId={homeId} lines={result.playerLines} players={players} />
      </div>
      {result.scoring.length > 0 && (
        <div>
          <h4 className="muted" style={{ marginBottom: 6 }}>
            Scoring Summary
          </h4>
          {result.scoring.map((s, i) => (
            <div key={i} className="row" style={{ fontSize: 12.5, padding: '3px 0' }}>
              <span className="muted" style={{ width: 70 }}>
                {s.quarter <= 4 ? `Q${s.quarter}` : 'OT'} {s.quarter <= 4 ? formatClock(s.clock) : ''}
              </span>
              <TeamBadge teamId={s.teamId} size={18} />
              <span className="grow">{s.text}</span>
              <span className="mono muted">
                {s.away}-{s.home}
              </span>
            </div>
          ))}
        </div>
      )}
      {result.injuries.length > 0 && (
        <div className="muted" style={{ fontSize: 12.5 }}>
          <b>Injuries:</b>{' '}
          {result.injuries.map((i) => `${nm(players, i.playerId)} (${TEAM_BY_ID[i.teamId]?.abbreviation}) — ${i.type}, ${i.weeks} wk`).join(' · ')}
        </div>
      )}
    </div>
  );
}

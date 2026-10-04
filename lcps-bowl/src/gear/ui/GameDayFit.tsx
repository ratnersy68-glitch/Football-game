import { useState } from 'react';
import type { Dynasty, GameRecord } from '../../dynasty/types';
import { getTeam, rivalryName } from '../../data/teams';
import { ovr } from '../../game/players';
import type { PlayerData } from '../../game/types';
import type { ThemeId } from '../types';
import { THEMES } from '../look';
import { setTheme } from '../economy';
import { GearEditor } from './GearEditor';
import { Btn } from '../../components/common';
import { BBBadge } from './Locker';
import { Sound } from '../../game/audio/Sound';

/** Optional pre-game screen: last-minute fit changes and theme suggestions for big games. */
export function GameDayFit({ d, g, onKickoff, onBack, onChange }: { d: Dynasty; g: GameRecord; onKickoff: () => void; onBack: () => void; onChange: () => void }) {
  const roster = d.programs[d.userTeam].roster;
  const starters: PlayerData[] = [];
  for (const [pos, n] of [['QB', 1], ['RB', 1], ['WR', 3], ['TE', 1], ['LB', 2], ['CB', 2], ['S', 1], ['DL', 1], ['OL', 1]] as [string, number][]) {
    starters.push(...roster.filter((p) => p.pos === pos && !(p.injury && p.injury.weeks > 0)).sort((a, b) => ovr(b) - ovr(a)).slice(0, n));
  }
  const [sel, setSel] = useState<PlayerData>(starters[0]);
  const [, f] = useState(0);
  const L = d.locker!;
  const opp = getTeam(g.home === d.userTeam ? g.away : g.home);
  const champ = g.round === 'LCPS Bowl';
  const suggestion: { theme: ThemeId; text: string } | null = champ
    ? { theme: L.themesUnlocked.includes('champgold') ? 'champgold' : L.themesUnlocked.includes('playoff') ? 'playoff' : 'blackout', text: '🏆 LCPS BOWL — DRESS LIKE CHAMPIONS?' }
    : g.rivalry ? { theme: 'blackout', text: `🔥 RIVALRY GAME vs ${opp.shortName.toUpperCase()} — WEAR ALL BLACK?` }
      : g.week > 10 ? { theme: L.themesUnlocked.includes('playoff') ? 'playoff' : 'blackout', text: '🏈 PLAYOFF FRIDAY — TURN ON PLAYOFF MODE?' } : null;
  const themeName = (t: ThemeId) => THEMES.find((x) => x.id === t)?.name ?? t;
  return (
    <div className="screen setup-screen gameday">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">GAME DAY FIT</h2>
        <BBBadge bb={L.bb} />
      </header>
      <div className="gd-top">
        <div className="pixel">vs {opp.shortName.toUpperCase()} {opp.mascot.toUpperCase()}{g.rivalry ? ` · ${rivalryName(g.home, g.away).toUpperCase()}` : ''}{g.round ? ` · ${g.round.toUpperCase()}` : ''}</div>
        {suggestion && L.theme !== suggestion.theme && (
          <div className="gd-suggest">
            <span className="pixel small">{suggestion.text}</span>
            <Btn small variant="gold" onClick={() => { setTheme(d, suggestion.theme); Sound.play('select'); onChange(); f((x) => x + 1); }}>EQUIP {themeName(suggestion.theme)}</Btn>
          </div>
        )}
        <div className="seg">
          {THEMES.filter((t) => L.themesUnlocked.includes(t.id)).map((t) => <button key={t.id} className={L.theme === t.id ? 'on' : ''} onClick={() => { setTheme(d, t.id); onChange(); f((x) => x + 1); }}>{t.name}</button>)}
        </div>
        <Btn variant="gold" onClick={onKickoff}>KICK OFF ▸</Btn>
      </div>
      <div className="gd-body">
        <div className="cust-list">
          <div className="pixel tiny dim">STARTERS</div>
          {starters.map((p) => <button key={p.id} className={`cust-p ${sel.id === p.id ? 'on' : ''}`} onClick={() => setSel(p)}><span className="pixel tiny">{p.pos}</span> #{p.number} {p.first[0]}. {p.last}</button>)}
        </div>
        <GearEditor key={sel.id + (L.theme ?? '')} d={d} player={sel} onChange={onChange} />
      </div>
    </div>
  );
}

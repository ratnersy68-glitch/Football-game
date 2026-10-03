import { useState } from 'react';
import { LCPS_TEAMS, getTeam, isRivalry, rivalryName } from '../data/teams';
import type { TeamInfo, Weather, TimeOfDay, Difficulty } from '../game/types';
import { DIFFICULTIES } from '../game/types';
import { TeamLogo, Btn } from '../components/common';
import { useSettings, setSettings } from '../save/settings';

export interface ExhibitionChoice {
  home: TeamInfo;
  away: TeamInfo;
  userSide: 'home' | 'away' | null;
  weather: Weather;
  timeOfDay: TimeOfDay;
  difficulty: Difficulty;
  quarterLen: number;
}

const WEATHERS: [Weather, string][] = [['clear', 'CLEAR'], ['cold', 'COLD'], ['rain', 'RAIN'], ['snow', 'SNOW'], ['wind', 'WIND']];
const TIMES: [TimeOfDay, string][] = [['night', 'FRIDAY NIGHT'], ['dusk', 'DUSK'], ['day', 'SATURDAY AFTERNOON']];
const QLENS = [120, 180, 300, 480];

export function TeamPicker({ value, onChange, exclude }: { value: TeamInfo; onChange: (t: TeamInfo) => void; exclude?: string }) {
  return (
    <div className="team-picker">
      {LCPS_TEAMS.map((t) => (
        <button key={t.id} className={`tp-item ${t.id === value.id ? 'on' : ''}`} disabled={t.id === exclude} onClick={() => onChange(t)} title={`${t.shortName} ${t.mascot}`} style={{ ['--tc' as string]: t.colors.primary }}>
          <TeamLogo team={t} size={30} />
          <span>{t.abbreviation}</span>
        </button>
      ))}
    </div>
  );
}

export function ExhibitionSetup({ onStart, onBack, defaultTeam }: { onStart: (c: ExhibitionChoice) => void; onBack: () => void; defaultTeam?: string }) {
  const settings = useSettings();
  const [home, setHome] = useState<TeamInfo>(getTeam(defaultTeam ?? 'riverside'));
  const [away, setAway] = useState<TeamInfo>(getTeam(defaultTeam === 'briar-woods' ? 'stone-bridge' : 'briar-woods'));
  const [userSide, setUserSide] = useState<'home' | 'away' | null>('home');
  const [weather, setWeather] = useState<Weather>('clear');
  const [tod, setTod] = useState<TimeOfDay>('night');
  const rival = isRivalry(home.id, away.id);
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">EXHIBITION</h2>
        <span />
      </header>
      <div className="matchup">
        <div className="mu-side">
          <div className="mu-label pixel">AWAY</div>
          <TeamLogo team={away} size={96} />
          <div className="mu-name pixel">{away.shortName.toUpperCase()}</div>
          <div className="dim">{away.mascot}</div>
          <TeamPicker value={away} onChange={setAway} exclude={home.id} />
        </div>
        <div className="mu-mid">
          <div className="pixel vs">VS</div>
          {rival && <div className="rival-tag pixel">RIVALRY GAME<br /><small>{rivalryName(home.id, away.id)}</small></div>}
          <Btn small variant="ghost" onClick={() => { setHome(away); setAway(home); }}>⇄ SWAP</Btn>
        </div>
        <div className="mu-side">
          <div className="mu-label pixel">HOME</div>
          <TeamLogo team={home} size={96} />
          <div className="mu-name pixel">{home.shortName.toUpperCase()}</div>
          <div className="dim">{home.mascot} · {home.stadium}</div>
          <TeamPicker value={home} onChange={setHome} exclude={away.id} />
        </div>
      </div>
      <div className="options-grid">
        <div className="opt">
          <span className="opt-label">YOU CONTROL</span>
          <div className="seg">
            <button className={userSide === 'away' ? 'on' : ''} onClick={() => setUserSide('away')}>{away.abbreviation} (AWAY)</button>
            <button className={userSide === 'home' ? 'on' : ''} onClick={() => setUserSide('home')}>{home.abbreviation} (HOME)</button>
            <button className={userSide === null ? 'on' : ''} onClick={() => setUserSide(null)}>WATCH CPU</button>
          </div>
        </div>
        <div className="opt">
          <span className="opt-label">WEATHER</span>
          <div className="seg">{WEATHERS.map(([w, l]) => <button key={w} className={weather === w ? 'on' : ''} onClick={() => setWeather(w)}>{l}</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">TIME OF DAY</span>
          <div className="seg">{TIMES.map(([w, l]) => <button key={w} className={tod === w ? 'on' : ''} onClick={() => setTod(w)}>{l}</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">DIFFICULTY</span>
          <div className="seg">{DIFFICULTIES.map((d) => <button key={d} className={settings.difficulty === d ? 'on' : ''} onClick={() => setSettings({ difficulty: d })}>{d}</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">QUARTER LENGTH</span>
          <div className="seg">{QLENS.map((q) => <button key={q} className={settings.quarterLen === q ? 'on' : ''} onClick={() => setSettings({ quarterLen: q })}>{q / 60} MIN</button>)}</div>
        </div>
        <div className="opt">
          <span className="opt-label">DEFENSE</span>
          <div className="seg">
            <button className={!settings.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: false })}>PLAY DEFENSE</button>
            <button className={settings.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: true })}>AUTO-SIM DEFENSE</button>
          </div>
        </div>
      </div>
      <div className="setup-go">
        <Btn variant="gold" onClick={() => onStart({ home, away, userSide, weather, timeOfDay: tod, difficulty: settings.difficulty, quarterLen: settings.quarterLen })}>KICK OFF ▸</Btn>
      </div>
    </div>
  );
}

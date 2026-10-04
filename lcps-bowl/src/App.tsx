import { useMemo, useState } from 'react';
import { MainMenu } from './screens/MainMenu';
import { ExhibitionSetup, type ExhibitionChoice } from './screens/Exhibition';
import { GameScreen, type IntroInfo } from './screens/GameScreen';
import { SettingsScreen } from './screens/Settings';
import { TeamDatabase } from './screens/TeamDatabase';
import { DynastyApp } from './dynasty/DynastyApp';
import { RecordBookScreen } from './screens/RecordBook';
import { AnimationLab } from './screens/AnimationLab';
import type { GameConfig } from './game/GameSession';
import type { Atmosphere } from './game/render/Renderer';
import { generateRoster } from './game/players';
import { RNG } from './game/rng';
import { isRivalry, rivalryName } from './data/teams';
import { getSettings } from './save/settings';
import { listSaves, lastSlot } from './save/storage';
import type { TeamInfo } from './game/types';
import { buildStory } from './dynasty/Stories';

type Screen =
  | { id: 'menu' }
  | { id: 'exhibition' }
  | { id: 'game'; config: GameConfig; atmo: Atmosphere; intro: IntroInfo }
  | { id: 'settings' }
  | { id: 'teams' }
  | { id: 'records' }
  | { id: 'anim' }
  | { id: 'dynasty'; mode: 'new' | 'continue' | 'play' | 'locker' };

function seedOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 131 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** Exhibition rosters are generated deterministically per school so a team "feels" the same every time. */
export function exhibitionRoster(t: TeamInfo) {
  return generateRoster(t.offenseRating, t.defenseRating, t.specialTeamsRating, new RNG(seedOf(t.id)));
}

export function App() {
  const [screen, setScreen] = useState<Screen>({ id: 'menu' });
  const hasSave = useMemo(() => listSaves().some((s) => s.exists), [screen]);
  const bb = useMemo(() => { const last = lastSlot(); const m = listSaves().find((s) => s.exists && (last == null || s.slot === last)); return m ? m.bb ?? 0 : null; }, [screen]);

  const startExhibition = (c: ExhibitionChoice) => {
    const rival = isRivalry(c.home.id, c.away.id);
    const config: GameConfig = {
      home: { info: c.home, roster: exhibitionRoster(c.home) },
      away: { info: c.away, roster: exhibitionRoster(c.away) },
      userSide: c.userSide,
      difficulty: c.difficulty,
      quarterLen: c.quarterLen,
      weather: c.weather,
      timeOfDay: c.timeOfDay,
      simDefense: getSettings().simDefense,
      rivalry: rival,
    };
    const atmo: Atmosphere = { timeOfDay: c.timeOfDay, weather: c.weather, crowd: rival ? 0.95 : 0.75, rivalry: rival, playoff: false, championship: false };
    const intro: IntroInfo = {
      title: c.timeOfDay === 'night' ? 'FRIDAY NIGHT' : c.timeOfDay === 'dusk' ? 'FRIDAY NIGHT LIGHTS' : 'SATURDAY SHOWDOWN',
      kickoff: c.timeOfDay === 'night' ? '7:00 PM' : c.timeOfDay === 'dusk' ? '6:00 PM' : '1:00 PM',
      stadium: c.home.stadium,
      tags: rival ? ['RIVALRY GAME', rivalryName(c.home.id, c.away.id).toUpperCase()] : ['EXHIBITION'],
      pa: `Welcome to ${c.home.stadium}! Tonight, the ${c.away.shortName} ${c.away.mascot} visit your ${c.home.shortName} ${c.home.mascot}!`,
    };
    setScreen({ id: 'game', config, atmo, intro });
  };

  switch (screen.id) {
    case 'menu':
      return (
        <MainMenu
          hasSave={hasSave}
          bb={bb}
          onNav={(to) => {
            if (to === 'exhibition') setScreen({ id: 'exhibition' });
            else if (to === 'settings') setScreen({ id: 'settings' });
            else if (to === 'teams') setScreen({ id: 'teams' });
            else if (to === 'records') setScreen({ id: 'records' });
            else if (to === 'anim') setScreen({ id: 'anim' });
            else if (to === 'new') setScreen({ id: 'dynasty', mode: 'new' });
            else if (to === 'continue') setScreen({ id: 'dynasty', mode: 'continue' });
            else if (to === 'locker') setScreen({ id: 'dynasty', mode: 'locker' });
            else if (to === 'play') setScreen(hasSave ? { id: 'dynasty', mode: 'play' } : { id: 'exhibition' });
          }}
        />
      );
    case 'exhibition':
      return <ExhibitionSetup onStart={startExhibition} onBack={() => setScreen({ id: 'menu' })} />;
    case 'game':
      return (
        <GameScreen
          config={screen.config}
          atmosphere={screen.atmo}
          intro={screen.intro}
          story={(s) => buildStory(s)}
          onExit={() => setScreen({ id: 'exhibition' })}
        />
      );
    case 'settings':
      return <SettingsScreen onBack={() => setScreen({ id: 'menu' })} />;
    case 'teams':
      return <TeamDatabase onBack={() => setScreen({ id: 'menu' })} />;
    case 'anim':
      return <AnimationLab onBack={() => setScreen({ id: 'menu' })} />;
    case 'records':
      return <RecordBookScreen onBack={() => setScreen({ id: 'menu' })} />;
    case 'dynasty':
      return <DynastyApp mode={screen.mode} onExit={() => setScreen({ id: 'menu' })} />;
  }
}

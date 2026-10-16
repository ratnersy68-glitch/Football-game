import { useCallback, useState } from 'react';
import { loadProfile, saveProfile, stageOf, totalMedals, type Profile } from '../state/save';
import { RESORTS, type ResortDef } from '../data/resorts';
import type { GameMode } from '../game/Game';
import type { WeatherKind } from '../render/sceneSetup';
import type { Recording } from '../game/replay';
import { MainMenu } from './screens/MainMenu';
import { ResortSelect } from './screens/ResortSelect';
import { Racing } from './screens/Racing';
import { Career } from './screens/Career';
import { Parks } from './screens/Parks';
import { CharacterScreen } from './screens/CharacterScreen';
import { Shop } from './screens/Shop';
import { Leaderboards } from './screens/Leaderboards';
import { SettingsScreen } from './screens/Settings';
import { Replays } from './screens/Replays';
import { GameView } from './GameView';

export type Screen = 'menu' | 'freeride' | 'mountains' | 'racing' | 'career' | 'parks' | 'character' | 'shop' | 'leaderboards' | 'settings' | 'replays' | 'game';

export interface Launch {
  resortIndex: number;
  mode: GameMode;
  weather?: WeatherKind;
  hour?: number;
  startTrail?: number;
  replay?: Recording;
  back: Screen;
  nonce?: number;
}

export interface AppApi {
  profile: Profile;
  update: (fn: (p: Profile) => void) => void;
  go: (s: Screen) => void;
  launch: (l: Launch) => void;
}

export function resortUnlocked(p: Profile, def: ResortDef): boolean {
  const dev = typeof location !== 'undefined' && new URLSearchParams(location.search).has('unlock');
  return dev || def.index === 0 || (stageOf(p) >= def.unlock.stage && totalMedals(p) >= def.unlock.medals);
}

export function App() {
  const [profile, setProfile] = useState<Profile>(() => loadProfile());
  const [screen, setScreen] = useState<Screen>('menu');
  const [launchCfg, setLaunch] = useState<Launch | null>(null);
  const update = useCallback((fn: (p: Profile) => void) => {
    setProfile((prev) => {
      const next: Profile = JSON.parse(JSON.stringify(prev));
      fn(next);
      saveProfile(next);
      return next;
    });
  }, []);
  const api: AppApi = {
    profile, update, go: setScreen,
    launch: (l) => { setLaunch(l); setScreen('game'); update((p) => { p.lastResort = RESORTS[l.resortIndex].id; }); },
  };
  switch (screen) {
    case 'menu': return <MainMenu api={api} />;
    case 'freeride': return <ResortSelect api={api} mode="freeride" />;
    case 'mountains': return <ResortSelect api={api} mode="mountains" />;
    case 'racing': return <Racing api={api} />;
    case 'career': return <Career api={api} />;
    case 'parks': return <Parks api={api} />;
    case 'character': return <CharacterScreen api={api} />;
    case 'shop': return <Shop api={api} />;
    case 'leaderboards': return <Leaderboards api={api} />;
    case 'settings': return <SettingsScreen api={api} />;
    case 'replays': return <Replays api={api} />;
    case 'game': return launchCfg ? <GameView key={JSON.stringify({ ...launchCfg, replay: !!launchCfg.replay })} api={api} launch={launchCfg} /> : null;
  }
}

import { useStore } from './store';
import { FullscreenButton } from './FullscreenButton';
import { MainMenu } from '../ui/screens/MainMenu';
import { TeamSelect } from '../ui/screens/TeamSelect';
import { ProgramOverview } from '../ui/screens/ProgramOverview';
import { LoadDynasty } from '../ui/screens/LoadDynasty';
import { SettingsScreen } from '../ui/screens/Settings';
import { QuickSim } from '../ui/screens/QuickSim';
import { Hub } from '../ui/dynasty/Hub';
import { DynastyGame, QuickGame } from '../ui/game/GameScreen';
import { CareerMenu } from '../ui/career/CareerMenu';
import { CreatePlayer } from '../ui/career/CreatePlayer';
import { PlayScreen } from '../ui/career/PlayScreen';
import { CareerHub } from '../ui/career/CareerHub';

export function App() {
  const { screen, toast } = useStore();
  let view: React.ReactNode;
  switch (screen.name) {
    case 'menu':
      view = <MainMenu />;
      break;
    case 'teamSelect':
      view = <TeamSelect seed={screen.seed} conference={screen.conference} />;
      break;
    case 'overview':
      view = <ProgramOverview teamId={screen.teamId} seed={screen.seed} />;
      break;
    case 'load':
      view = <LoadDynasty />;
      break;
    case 'settings':
      view = <SettingsScreen />;
      break;
    case 'quickSim':
      view = <QuickSim />;
      break;
    case 'quickGame':
      view = <QuickGame key={`${screen.homeId}-${screen.awayId}-${screen.seed}`} homeId={screen.homeId} awayId={screen.awayId} seed={screen.seed} />;
      break;
    case 'hub':
      view = <Hub tab={screen.tab ?? 'home'} />;
      break;
    case 'game':
      view = <DynastyGame key={screen.gameId} gameId={screen.gameId} />;
      break;
    case 'career':
      view = <CareerMenu />;
      break;
    case 'createPlayer':
      view = <CreatePlayer initialStep={screen.step ?? 0} />;
      break;
    case 'play':
      view = <PlayScreen key={screen.career ? 'career' : 'drive'} career={!!screen.career} />;
      break;
    case 'careerHub':
      view = <CareerHub />;
      break;
  }
  return (
    <>
      {view}
      {toast && <div className="toast">{toast}</div>}
      <FullscreenButton />
    </>
  );
}

import { FIGHTER_BY_ID } from '../data';
import type { App } from '../ui/App';
import { BracketScreen, TournamentSetup } from '../ui/screens/TournamentScreens';
import { ControlsScreen } from '../ui/screens/ControlsScreen';
import { FightScreen } from '../ui/screens/FightScreen';
import { MainMenu } from '../ui/screens/MainMenu';
import { ResultScreen } from '../ui/screens/ResultScreen';
import { SelectScreen } from '../ui/screens/SelectScreen';
import { SettingsScreen } from '../ui/screens/SettingsScreen';
import { TaleOfTape } from '../ui/screens/TaleOfTape';
import { Walkout } from '../ui/screens/Walkout';
import type { FightSession } from './FightSession';
import { isFinal, playerMatch, recordResult, saveTournament, type TournamentState } from './Tournament';
import type { FightSetup } from './types';

/** Screen-to-screen flow for every game mode. */
export class GameFlow {
  constructor(private app: App) {}

  menu = () => {
    this.app.show(new MainMenu(this.app, {
      quick: () => this.select('quick'),
      main: () => this.select('main'),
      tournament: this.tournament,
      controls: () => this.app.show(new ControlsScreen(this.app, this.menu)),
      settings: () => this.app.show(new SettingsScreen(this.app, this.menu)),
    }));
  };

  select(mode: 'quick' | 'main', initial?: Partial<FightSetup>) {
    this.app.show(new SelectScreen(this.app, {
      mode, initial, onBack: this.menu,
      onFight: (setup) => this.intro(setup),
    }));
  }

  /** Tale of the tape (+ walkouts for main events), then the fight. */
  intro(setup: FightSetup) {
    this.app.show(new TaleOfTape(this.app, setup, () => {
      if (setup.context === 'main') this.app.show(new Walkout(this.app, setup, () => this.fight(setup)));
      else this.fight(setup);
    }));
  }

  fight(setup: FightSetup, onEnd?: (s: FightSession) => void, onQuit?: () => void) {
    const again = () => this.fight({ ...setup, seed: undefined });
    this.app.show(new FightScreen(this.app, setup, onEnd ?? ((s) => this.app.show(new ResultScreen(this.app, s, {
      primary: { label: 'Rematch', fn: again },
      secondary: { label: 'Change Fighters', fn: () => this.select(setup.context === 'main' ? 'main' : 'quick', setup) },
      menu: this.menu,
    }))), onQuit ?? this.menu));
  }

  // ------------------------------------------------------------ tournament
  tournament = () => {
    this.app.show(new TournamentSetup(this.app, this.menu, (s) => this.bracket(s)));
  };

  bracket(state: TournamentState, afterPlayerBout = false) {
    const screen = new BracketScreen(this.app, state, { fight: (s) => this.tournamentBout(s), menu: this.menu });
    this.app.show(screen);
    if (afterPlayerBout) screen.completeRound();
  }

  private tournamentBout(state: TournamentState) {
    const m = playerMatch(state);
    if (!m || !m.a || !m.b) return;
    const oppId = m.a === state.playerId ? m.b : m.a;
    const setup: FightSetup = {
      fighters: [FIGHTER_BY_ID[state.playerId], FIGHTER_BY_ID[oppId]], difficulty: state.difficulty, arenaId: state.arenaId,
      rounds: isFinal(state) ? 5 : 3, clockSpeed: state.clockSpeed, context: 'tournament',
      title: `Tournament ${isFinal(state) ? 'Final' : `Round ${state.round + 1}`}`,
    };
    const onEnd = (s: FightSession) => {
      recordResult(state, m, s.engine.result!, [state.playerId, oppId]);
      saveTournament(state);
      this.app.show(new ResultScreen(this.app, s, {
        primary: { label: 'Back to Bracket', fn: () => this.bracket(state, true) },
        menu: () => { this.bracket(state, true); this.menu(); },
      }));
    };
    this.app.show(new TaleOfTape(this.app, setup, () => this.fight(setup, onEnd, () => this.bracket(state))));
  }
}

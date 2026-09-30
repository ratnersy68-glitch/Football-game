import './styles.css';
import { GameFlow } from './modes/GameFlow';
import { App } from './ui/App';

const app = new App(document.getElementById('app')!);
new GameFlow(app).menu();

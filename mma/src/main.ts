import './styles.css';
import { GameFlow } from './modes/GameFlow';
import { UIManager } from './ui/UIManager';

const app = new UIManager(document.getElementById('app')!);
new GameFlow(app).menu();

import { useSettings, setSettings } from '../save/settings';
import { DIFFICULTIES } from '../game/types';
import { Btn, Panel } from '../components/common';
import { ControlsHelp } from './GameScreen';
import { Sound } from '../game/audio/Sound';

export function SettingsScreen({ onBack }: { onBack: () => void }) {
  const s = useSettings();
  const vol = (k: 'master' | 'sfx' | 'crowd' | 'music', label: string) => (
    <label className="slider">
      <span>{label}</span>
      <input type="range" min={0} max={1} step={0.05} value={s[k]} onChange={(e) => setSettings({ [k]: Number(e.target.value) })} onMouseUp={() => Sound.play('catch')} />
      <span className="val">{Math.round(s[k] * 100)}</span>
    </label>
  );
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">SETTINGS</h2>
        <span />
      </header>
      <div className="settings-grid">
        <Panel title="GAMEPLAY">
          <div className="opt">
            <span className="opt-label">DIFFICULTY</span>
            <div className="seg">{DIFFICULTIES.map((d) => <button key={d} className={s.difficulty === d ? 'on' : ''} onClick={() => setSettings({ difficulty: d })}>{d}</button>)}</div>
            <p className="dim small">Higher levels make the CPU smarter — faster reads, better pursuit angles, tendency recognition, smarter blitzes and clock management. Your players are never slowed down.</p>
          </div>
          <div className="opt">
            <span className="opt-label">QUARTER LENGTH</span>
            <div className="seg">{[120, 180, 300, 480].map((q) => <button key={q} className={s.quarterLen === q ? 'on' : ''} onClick={() => setSettings({ quarterLen: q })}>{q / 60} MIN</button>)}</div>
          </div>
          <div className="opt">
            <span className="opt-label">DEFENSIVE SNAPS</span>
            <div className="seg">
              <button className={!s.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: false })}>PLAY THEM</button>
              <button className={s.simDefense ? 'on' : ''} onClick={() => setSettings({ simDefense: true })}>AUTO-SIM (FAST)</button>
            </div>
          </div>
          <div className="opt">
            <span className="opt-label">PLAYOFF FORMAT</span>
            <div className="seg">
              <button className={s.playoffFormat === 'standard' ? 'on' : ''} onClick={() => setSettings({ playoffFormat: 'standard' })}>8 TEAMS</button>
              <button className={s.playoffFormat === 'expanded' ? 'on' : ''} onClick={() => setSettings({ playoffFormat: 'expanded' })}>12 TEAMS</button>
            </div>
            <p className="dim small">Applies to new seasons. Two regions (4C and 5D/6) crown regional champions who meet in the LCPS Bowl.</p>
          </div>
        </Panel>
        <Panel title="AUDIO">
          {vol('master', 'MASTER')}
          {vol('sfx', 'EFFECTS')}
          {vol('crowd', 'CROWD')}
          {vol('music', 'BAND / DRUMS')}
          <p className="dim small">Drop your own .mp3 files in public/assets/audio/ (whistle, hike, tackle, catch, kick, touchdown, horn…) to replace the built-in retro sounds.</p>
        </Panel>
        <Panel title="CONTROLS">
          <ControlsHelp />
        </Panel>
      </div>
    </div>
  );
}

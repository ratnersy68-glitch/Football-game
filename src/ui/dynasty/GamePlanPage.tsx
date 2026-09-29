import { DEF_SCHEMES, OFF_SCHEMES } from '../../data';
import { bump, useStore } from '../../app/store';
import type { CoachingSettings } from '../../models/types';
import { Seg } from '../screens/Settings';

export function CoachingControls({ value, onChange }: { value: CoachingSettings; onChange: (s: CoachingSettings) => void }) {
  const set = <K extends keyof CoachingSettings>(k: K, v: CoachingSettings[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="coach-panel">
      <label>Play aggressiveness</label>
      <Seg
        value={value.aggressiveness}
        options={[
          ['conservative', 'Safe'],
          ['normal', 'Balanced'],
          ['aggressive', 'Attack'],
        ]}
        onChange={(v) => set('aggressiveness', v)}
      />
      <label>Run / pass balance</label>
      <Seg
        value={value.runPassBalance}
        options={[
          [-2, 'Run+'],
          [-1, 'Run'],
          [0, 'Even'],
          [1, 'Pass'],
          [2, 'Pass+'],
        ]}
        onChange={(v) => set('runPassBalance', v)}
      />
      <label>Tempo</label>
      <Seg
        value={value.tempo}
        options={[
          ['slow', 'Slow'],
          ['normal', 'Normal'],
          ['fast', 'Fast'],
          ['hurry', 'Hurry'],
        ]}
        onChange={(v) => set('tempo', v)}
      />
      <label>4th-down aggressiveness</label>
      <Seg
        value={value.fourthDown}
        options={[
          ['conservative', 'Punt it'],
          ['normal', 'Normal'],
          ['aggressive', 'Go for it'],
        ]}
        onChange={(v) => set('fourthDown', v)}
      />
      <label>Blitz frequency</label>
      <Seg
        value={value.blitz}
        options={[
          ['low', 'Low'],
          ['normal', 'Normal'],
          ['high', 'High'],
        ]}
        onChange={(v) => set('blitz', v)}
      />
      <label>Coverage preference</label>
      <Seg
        value={value.coverage}
        options={[
          ['man', 'Man'],
          ['balanced', 'Mixed'],
          ['zone', 'Zone'],
        ]}
        onChange={(v) => set('coverage', v)}
      />
    </div>
  );
}

export function GamePlanPage() {
  const { dynasty: d } = useStore();
  if (!d) return null;
  const team = d.teams[d.userTeamId];
  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))' }}>
      <div className="panel">
        <h3>Game Plan</h3>
        <div className="muted" style={{ fontSize: 13 }}>
          These sliders drive your staff's play calling in every game (and can be changed live from the sideline during a game).
        </div>
        <CoachingControls
          value={d.coachingSettings}
          onChange={(s) => {
            d.coachingSettings = s;
            bump();
          }}
        />
      </div>
      <div className="panel">
        <h3>Schemes</h3>
        <div className="coach-panel">
          <label>Offense</label>
          <select
            className="field-input"
            value={team.offScheme}
            onChange={(e) => {
              team.offScheme = e.target.value as typeof team.offScheme;
              d.coaches[d.userCoachId].offScheme = team.offScheme;
              bump();
            }}
          >
            {Object.entries(OFF_SCHEMES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name} — {Math.round((1 - v.runRate) * 100)}% pass, {v.tempo} tempo
              </option>
            ))}
          </select>
          <label>Defense</label>
          <select
            className="field-input"
            value={team.defScheme}
            onChange={(e) => {
              team.defScheme = e.target.value as typeof team.defScheme;
              d.coaches[d.userCoachId].defScheme = team.defScheme;
              bump();
            }}
          >
            {Object.entries(DEF_SCHEMES).map(([k, v]) => (
              <option key={k} value={k}>
                {v.name} — {v.personnel.DL} DL / {v.personnel.LB} LB / {v.personnel.CB + v.personnel.S} DB
              </option>
            ))}
          </select>
          <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>
            Scheme sets the formations and concepts your offense calls, the base personnel your defense plays, and each player's scheme fit (visible on the depth chart). Poor fits play slightly below their ratings.
          </div>
        </div>
      </div>
    </div>
  );
}

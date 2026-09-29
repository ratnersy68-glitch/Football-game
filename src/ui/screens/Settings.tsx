import { navigate, updateSettings, useStore } from '../../app/store';

export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: [T, string][]; onChange: (v: T) => void }) {
  return (
    <div className="seg">
      {options.map(([v, label]) => (
        <button key={String(v)} className={v === value ? 'on' : ''} onClick={() => onChange(v)}>
          {label}
        </button>
      ))}
    </div>
  );
}

export function SettingsScreen() {
  const { settings, dynasty } = useStore();
  return (
    <div className="page" style={{ maxWidth: 720 }}>
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate(dynasty ? { name: 'hub', tab: 'home' } : { name: 'menu' })}>
          ← Back
        </button>
        <h1>Settings</h1>
      </div>
      <div className="panel col coach-panel" style={{ gap: 4 }}>
        <label>Default game speed</label>
        <Seg value={settings.speed} options={[[0.5, '0.5x'], [1, '1x'], [2, '2x'], [4, '4x']]} onChange={(v) => updateSettings({ speed: v })} />
        <label>Camera</label>
        <Seg
          value={settings.camera}
          options={[
            ['broadcast', 'Broadcast'],
            ['overhead', 'All-22'],
          ]}
          onChange={(v) => updateSettings({ camera: v })}
        />
        <label>Fourth-down decisions (your team)</label>
        <Seg
          value={settings.fourthDownPrompts ? 'ask' : 'auto'}
          options={[
            ['ask', 'Ask me'],
            ['auto', 'Let my staff decide'],
          ]}
          onChange={(v) => updateSettings({ fourthDownPrompts: v === 'ask' })}
        />
        <label>Autosave after every week</label>
        <Seg
          value={settings.autosave ? 'on' : 'off'}
          options={[
            ['on', 'On'],
            ['off', 'Off'],
          ]}
          onChange={(v) => updateSettings({ autosave: v === 'on' })}
        />
      </div>
    </div>
  );
}

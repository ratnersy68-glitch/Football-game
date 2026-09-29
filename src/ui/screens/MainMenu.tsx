import { useEffect, useState } from 'react';
import { navigate, saves, setState, toast } from '../../app/store';
import type { SaveMeta } from '../../save/saveManager';

export function MainMenu() {
  const [latest, setLatest] = useState<SaveMeta | null>(null);
  useEffect(() => {
    saves
      .list()
      .then((l) => setLatest(l[0] ?? null))
      .catch(() => setLatest(null));
  }, []);

  const continueLatest = async () => {
    if (!latest) return navigate({ name: 'load' });
    try {
      const d = await saves.load(latest.slotId);
      setState({ dynasty: d, slotId: latest.auto ? null : latest.slotId, slotName: latest.auto ? null : latest.name });
      navigate({ name: 'hub', tab: 'home' });
    } catch (e) {
      toast(`Could not load save: ${(e as Error).message}`);
    }
  };

  return (
    <div className="menu-screen">
      <div>
        <div className="logo">
          SATURDAY <span>26</span>
        </div>
        <div className="tagline">College Football Head Coach</div>
        <div className="menu-list">
          <button className="menu-item" onClick={() => navigate({ name: 'teamSelect' })}>
            New Dynasty<small>Take over a Big Ten, SEC or Big 12 program</small>
          </button>
          <button className="menu-item" onClick={continueLatest} disabled={!latest}>
            Continue Dynasty
            <small>{latest ? `${latest.name} · ${latest.season} Week ${latest.week} · ${latest.record}` : 'No saved dynasties yet'}</small>
          </button>
          <button className="menu-item" onClick={() => navigate({ name: 'load' })}>
            Load Dynasty<small>All save slots · import a save file</small>
          </button>
          <button className="menu-item" onClick={() => navigate({ name: 'quickSim' })}>
            Quick Sim<small>Pick any matchup and watch it</small>
          </button>
          <button className="menu-item" onClick={() => navigate({ name: 'settings' })}>
            Settings<small>Game speed, camera, coaching prompts, autosave</small>
          </button>
        </div>
      </div>
    </div>
  );
}

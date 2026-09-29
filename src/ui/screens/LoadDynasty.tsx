import { useEffect, useRef, useState } from 'react';
import { TEAM_BY_ID } from '../../data';
import { navigate, saves, setState, toast } from '../../app/store';
import { newSlotId, parseDynasty, type SaveMeta } from '../../save/saveManager';
import { TeamBadge } from '../components/common';

export function LoadDynasty() {
  const [list, setList] = useState<SaveMeta[] | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const refresh = () => saves.list().then(setList).catch(() => setList([]));
  useEffect(() => {
    refresh();
  }, []);

  const load = async (m: SaveMeta) => {
    try {
      const d = await saves.load(m.slotId);
      setState({ dynasty: d, slotId: m.auto ? null : m.slotId, slotName: m.auto ? null : m.name });
      navigate({ name: 'hub', tab: 'home' });
    } catch (e) {
      toast(`Load failed: ${(e as Error).message}`);
    }
  };

  const remove = async (m: SaveMeta) => {
    if (!confirm(`Delete "${m.name}"? This cannot be undone.`)) return;
    await saves.remove(m.slotId);
    refresh();
  };

  const importFile = async (f: File) => {
    try {
      const d = parseDynasty(await f.text());
      const slot = newSlotId();
      const name = `${TEAM_BY_ID[d.userTeamId]?.school ?? 'Imported'} (Imported)`;
      await saves.save(d, slot, name);
      setState({ dynasty: d, slotId: slot, slotName: name });
      navigate({ name: 'hub', tab: 'home' });
    } catch (e) {
      toast(`Import failed: ${(e as Error).message}`);
    }
  };

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate({ name: 'menu' })}>
          ← Menu
        </button>
        <h1>Load Dynasty</h1>
        <div className="spacer" />
        <button className="btn" onClick={() => fileRef.current?.click()}>
          Import save file
        </button>
        <input ref={fileRef} type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files?.[0] && importFile(e.target.files[0])} />
      </div>
      <div className="panel">
        {list === null && <div className="muted">Loading…</div>}
        {list?.length === 0 && <div className="muted">No saves yet. Start a New Dynasty from the main menu.</div>}
        {list?.map((m) => (
          <div key={m.slotId} className="row" style={{ padding: '12px 0', borderBottom: '1px solid var(--line)' }}>
            <TeamBadge teamId={m.teamId} size={40} />
            <div className="grow">
              <div style={{ fontFamily: 'var(--display)', fontSize: 18, textTransform: 'uppercase' }}>{m.name}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                {m.season} · Week {m.week} · {m.record} · saved {new Date(m.savedAt).toLocaleString()}
              </div>
            </div>
            {m.auto && <span className="pill">AUTO</span>}
            <button className="btn primary small" onClick={() => load(m)}>
              Load
            </button>
            <button className="btn small" onClick={() => remove(m)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

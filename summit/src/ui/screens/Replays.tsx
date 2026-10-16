import { useEffect, useState } from 'react';
import type { AppApi } from '../App';
import { Back, Coins } from '../components/common';
import { deleteRun, getRun, listRuns } from '../../state/save';
import { decode, type Recording } from '../../game/replay';
import { RESORTS } from '../../data/resorts';

type Stored = Parameters<typeof decode>[0];

export function Replays({ api }: { api: AppApi }) {
  const [items, setItems] = useState<{ key: string; rec: Stored }[] | null>(null);
  const load = async () => {
    const keys = await listRuns('replay:');
    const out: { key: string; rec: Stored }[] = [];
    for (const k of keys) { const r = await getRun<Stored>(k); if (r) out.push({ key: k, rec: r }); }
    out.sort((a, b) => (b.rec.meta?.date ?? 0) - (a.rec.meta?.date ?? 0));
    setItems(out);
  };
  useEffect(() => { void load(); }, []);
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>SAVED REPLAYS</h1><span className="spacer" /><Coins n={api.profile.coins} /></div>
      <div className="content">
        {!items ? <div className="muted">Loading…</div> : !items.length ? (
          <div className="panel card muted">No saved replays yet. In game press <span className="keycap">V</span> (or Pause → Instant replay) and choose “Save replay”.</div>
        ) : (
          <div className="grid cols-3">
            {items.map(({ key, rec }) => {
              const resort = RESORTS.find((r) => r.id === rec.meta?.resortId) ?? RESORTS[0];
              const dur = rec.count / rec.hz;
              return (
                <div key={key} className="panel card col">
                  <h3>{rec.meta?.title ?? 'Replay'}</h3>
                  <div className="small muted">{resort.name} · {new Date(rec.meta?.date ?? 0).toLocaleString()} · {dur.toFixed(0)} s</div>
                  <div className="small">{rec.events.slice(0, 4).map((e) => e.text).join(' · ')}</div>
                  <div className="row">
                    <button className="btn small primary" onClick={() => { const r: Recording = decode(rec); api.launch({ resortIndex: resort.index, mode: { kind: 'freeride' }, replay: r, back: 'replays', weather: 'clear', hour: 11 }); }}>Watch</button>
                    <button className="btn small warn" onClick={async () => { await deleteRun(key); void load(); }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

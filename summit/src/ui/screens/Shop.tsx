import { useMemo, useState } from 'react';
import type { AppApi } from '../App';
import { Back, Coins, StatBar } from '../components/common';
import { CharacterPreview } from '../components/CharacterPreview';
import { ITEMS, SLOT_LABEL, lookFor, type Item, type Slot } from '../../data/equipment';
import { buy, equip } from '../../state/progress';
import { stageOf } from '../../state/save';
import { STAGES } from '../../data/career';
import type { GearStats } from '../../physics/skier';

export function Shop({ api }: { api: AppApi }) {
  const p = api.profile;
  const [slot, setSlot] = useState<Slot>('skis');
  const [msg, setMsg] = useState<string | null>(null);
  const [hover, setHover] = useState<Item | null>(null);
  const st = stageOf(p);
  const look = useMemo(() => lookFor(p.appearance, hover ? { ...p.equipped, [hover.slot]: hover.id } : p.equipped), [p.appearance, p.equipped, hover]);
  const slots = Object.keys(SLOT_LABEL) as Slot[];
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>PRO SHOP</h1><span className="spacer" />{msg && <span className="chip">{msg}</span>}<Coins n={p.coins} /></div>
      <div className="content">
        <div className="tabs">{slots.map((s) => <button key={s} className={`btn ${slot === s ? 'selected' : ''}`} onClick={() => setSlot(s)}>{SLOT_LABEL[s]}</button>)}</div>
        <div className="grid" style={{ gridTemplateColumns: '1fr minmax(260px, 340px)', alignItems: 'start' }}>
          <div className="grid cols-3">
            {ITEMS.filter((i) => i.slot === slot).map((it) => {
              const owned = p.owned.includes(it.id);
              const equipped = p.equipped[it.slot] === it.id;
              const locked = (it.unlockStage ?? 0) > st;
              return (
                <div key={it.id} className={`panel card col ${locked ? 'locked' : ''}`} onMouseEnter={() => setHover(it)} onMouseLeave={() => setHover(null)}>
                  <div className="row"><span style={{ width: 22, height: 22, borderRadius: 6, background: it.color, border: `3px solid ${it.accent ?? it.color}` }} /><h3 style={{ margin: 0, flex: 1 }}>{it.name}</h3></div>
                  <div className="small muted">{it.brand} · {it.type}</div>
                  <div className="small">{it.desc}</div>
                  {(Object.keys(it.stats) as (keyof GearStats)[]).map((k) => <StatBar key={k} label={k} value={0.5 + (it.stats[k] ?? 0)} delta={it.stats[k]} />)}
                  <div className="row">
                    {owned ? (
                      <button className={`btn small ${equipped ? 'selected' : ''}`} disabled={equipped} onClick={() => api.update((pp) => equip(pp, it.id))}>{equipped ? 'Equipped' : 'Equip'}</button>
                    ) : (
                      <button className="btn small primary" disabled={locked || p.coins < it.price} data-testid={`buy-${it.id}`}
                        onClick={() => { let err: string | null = null; api.update((pp) => { err = buy(pp, it.id); if (!err) equip(pp, it.id); }); setMsg(err ?? `Bought ${it.name}!`); }}>
                        {locked ? `🔒 ${STAGES[it.unlockStage!].name}` : `Buy ◆ ${it.price.toLocaleString()}`}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="col">
            <CharacterPreview look={look} board={slot === 'snowboard' ? 'snowboard' : slot === 'skis' ? 'ski' : p.board} />
            <div className="small muted">Hover an item to preview it. Earn Peak Coins from races, tricks, challenges and exploring — no real money involved.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

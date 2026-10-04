import { useEffect, useState } from 'react';
import type { Dynasty } from '../../dynasty/types';
import type { GameRewards, Rarity } from '../types';
import { CATALOG, RARITY_COLOR, itemById } from '../catalog';
import { itemStatus, fmtBB } from '../economy';
import { ItemThumb } from './Preview';
import { getTeam } from '../../data/teams';
import { Btn } from '../../components/common';
import { Sound } from '../../game/audio/Sound';
import { BBBadge } from './Locker';

/** Post-game Bowl Bucks breakdown. */
export function RewardsPanel({ d, r, onLocker }: { d: Dynasty; r: GameRewards; onLocker?: () => void }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (shown >= r.lines.length) return;
    const t = setTimeout(() => { setShown((x) => x + 1); Sound.play('chains'); }, 260);
    return () => clearTimeout(t);
  }, [shown, r.lines.length]);
  const L = d.locker!;
  const target = CATALOG.filter((i) => itemStatus(d, i) === 'available' && i.price > L.bb && i.rarity !== 'common').sort((a, b) => a.price - b.price)[0];
  const affordable = CATALOG.filter((i) => itemStatus(d, i) === 'available' && i.price > 0 && i.price <= L.bb).sort((a, b) => b.price - a.price)[0];
  return (
    <div className="rewards panel">
      <div className="rw-head"><span className="pixel">GAME REWARDS</span><BBBadge bb={L.bb} /></div>
      <div className="rw-lines">
        {r.lines.slice(0, shown).map((l, i) => (
          <div key={i} className="rw-line"><span>{l.label}</span>{l.bb > 0 && <b className="gold">+{l.bb.toLocaleString('en-US')}</b>}</div>
        ))}
        {r.achievements.map((a) => (
          <div key={a.id} className="rw-line rw-ach"><span>🏆 ACHIEVEMENT: {a.name}{a.unlock ? ` — unlocked ${itemById(a.unlock)?.name}` : ''}</span><b className="gold">+{a.bb}</b></div>
        ))}
      </div>
      <div className="rw-total"><span className="pixel">TOTAL</span><b className="pixel gold">+{r.total.toLocaleString('en-US')} BB</b></div>
      {r.unlockedCollection && <div className="rw-note">🔓 {r.unlockedCollection.toUpperCase()} COLLECTION now available in the shop.</div>}
      {target && <div className="rw-nudge">Only <b>{fmtBB(target.price - L.bb)}</b> away from <b style={{ color: RARITY_COLOR[target.rarity] }}>{target.name}</b></div>}
      {affordable && <div className="rw-nudge dim">You can afford <b>{affordable.name}</b> right now.</div>}
      {onLocker && <Btn small variant="ghost" onClick={onLocker}>OPEN LCPS LOCKER ▸</Btn>}
    </div>
  );
}

const SEQ: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

/** Gear drop reveal: the locker opens and rarity climbs until the real one is revealed. */
export function DropReveal({ d, drop, onDone }: { d: Dynasty; drop: { item: string; rarity: Rarity }; onDone: () => void }) {
  const finalIdx = SEQ.indexOf(drop.rarity);
  const [step, setStep] = useState(-1);
  const item = itemById(drop.item)!;
  useEffect(() => {
    if (step > finalIdx) return;
    const t = setTimeout(() => { setStep((s) => s + 1); Sound.play(step + 1 > finalIdx ? 'touchdown' : 'drum'); }, step < 0 ? 900 : 700);
    return () => clearTimeout(t);
  }, [step, finalIdx]);
  const revealed = step > finalIdx;
  const cur = SEQ[Math.max(0, Math.min(step, finalIdx))];
  return (
    <div className="modal-back drop-back">
      <div className={`drop-card ${revealed ? 'revealed' : ''}`} style={{ ['--rc' as string]: RARITY_COLOR[revealed ? drop.rarity : cur] }}>
        <div className="pixel drop-title">GEAR DROP</div>
        {step < 0 && <div className="pixel drop-stage blink">LOCKER OPENS…</div>}
        {step >= 0 && !revealed && <div className="pixel drop-stage">{SEQ.slice(0, step + 1).map((r) => r.toUpperCase()).join('… ')}…</div>}
        {revealed && (
          <>
            <div className="pixel drop-rarity">{drop.rarity === 'legendary' ? '🔥 LEGENDARY DROP 🔥' : `${drop.rarity.toUpperCase()} DROP`}</div>
            <ItemThumb item={item} team={getTeam(d.userTeam)} size={220} animate />
            <div className="pixel drop-name">{item.name.toUpperCase()}</div>
            <div className="dim small">{item.desc}</div>
            <Btn variant="gold" onClick={onDone}>ADD TO LOCKER ▸</Btn>
          </>
        )}
      </div>
    </div>
  );
}

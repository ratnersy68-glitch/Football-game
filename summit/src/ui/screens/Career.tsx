import { useMemo, useState } from 'react';
import type { AppApi } from '../App';
import { resortUnlocked } from '../App';
import { RESORTS } from '../../data/resorts';
import { ACHIEVEMENTS, SPONSORS, STAGES, careerEvents, type CareerEvent } from '../../data/career';
import { stageOf, totalMedals } from '../../state/save';
import { Back, Coins, MedalDot } from '../components/common';
import { formatTime } from '../../core/math';
import { ITEM_BY_ID } from '../../data/equipment';
import type { GameMode } from '../../game/Game';

export function eventMode(e: CareerEvent): GameMode {
  if (e.kind === 'race') return { kind: 'race', course: e.race!.course, level: e.race!.level, title: e.title, eventId: e.id };
  if (e.kind === 'freestyle') return { kind: 'park', park: e.freestyle!.park, mode: e.freestyle!.mode, time: e.freestyle!.time, targets: e.freestyle!.targets, title: e.title, eventId: e.id };
  const c = e.challenge!;
  return { kind: 'challenge', type: c.type, targets: c.targets, title: e.title, eventId: e.id, difficulty: c.difficulty, nth: c.nth };
}

export function Career({ api }: { api: AppApi }) {
  const p = api.profile;
  const st = stageOf(p);
  const events = useMemo(() => careerEvents(), []);
  const [tab, setTab] = useState<'events' | 'sponsors' | 'achievements'>('events');
  const next = STAGES[Math.min(STAGES.length - 1, st + 1)];
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>CAREER</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content">
        <div className="panel card col" style={{ marginBottom: 14 }}>
          <div className="row wrap">
            {STAGES.map((s, i) => <span key={s.name} className="tag" style={{ background: i === st ? 'var(--accent)' : i < st ? 'rgba(92,200,255,0.25)' : undefined, color: i === st ? '#04121f' : undefined }}>{i + 1}. {s.name}</span>)}
          </div>
          <div className="progress"><div style={{ width: `${st >= 7 ? 100 : Math.min(100, (p.xp / next.xp) * 100)}%` }} /></div>
          <div className="small muted">{p.xp.toLocaleString()} XP · {totalMedals(p)} medals{st < 7 ? ` — ${next.name} needs ${next.xp.toLocaleString()} XP and ${next.medals} medals` : ' — Mountain Legend!'}</div>
        </div>
        <div className="tabs">
          {(['events', 'sponsors', 'achievements'] as const).map((t) => <button key={t} className={`btn ${tab === t ? 'selected' : ''}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
          <button className="btn" onClick={() => api.go('racing')}>Tournaments →</button>
        </div>
        {tab === 'events' && RESORTS.map((r) => {
          const open = resortUnlocked(p, r);
          const list = events.filter((e) => e.resortId === r.id);
          const got = list.filter((e) => p.events[e.id]?.medal).length;
          return (
            <div key={r.id} style={{ marginBottom: 18 }} className={open ? '' : 'locked'}>
              <div className="row" style={{ margin: '6px 0' }}><h3 style={{ margin: 0 }}>{r.name}</h3><span className="muted small">{got}/{list.length} medals</span>{!open && <span className="tag">🔒 {STAGES[r.unlock.stage].name} · {r.unlock.medals} medals</span>}</div>
              <div className="grid cols-4">
                {list.map((e) => {
                  const res = p.events[e.id];
                  return (
                    <div key={e.id} className="panel card col">
                      <div className="row"><MedalDot m={res?.medal} /><strong className="small" style={{ flex: 1 }}>{e.title}</strong></div>
                      <div className="small muted">{e.desc}</div>
                      {e.freestyle && <div className="small">Targets {e.freestyle.targets.map((t) => t.toLocaleString()).join(' / ')}</div>}
                      {e.challenge && e.challenge.type !== 'trailTime' && <div className="small">Targets {e.challenge.targets.join(' / ')}{e.challenge.type === 'topSpeed' ? ' km/h' : e.challenge.type === 'air' ? ' s' : ''}</div>}
                      {res && <div className="small muted">Best: {e.kind === 'race' || e.challenge?.type === 'trailTime' ? (res.value ? formatTime(res.value) : '—') : res.value.toLocaleString()}</div>}
                      <div className="small muted">Reward up to {e.reward.coins[2].toLocaleString()} ◆</div>
                      <button className="btn small primary" disabled={!open} data-testid={`event-${e.id}`}
                        onClick={() => api.launch({ resortIndex: r.index, mode: eventMode(e), back: 'career', weather: e.kind === 'challenge' ? undefined : 'clear', hour: 11 })}>
                        {res ? 'Retry' : 'Start'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {tab === 'sponsors' && (
          <div className="grid cols-3">
            {SPONSORS.map((s) => {
              const signed = p.sponsors.includes(s.id);
              return (
                <div key={s.id} className={`panel card col ${signed ? '' : 'locked'}`}>
                  <h3>{s.name}</h3>
                  <div className="muted small">“{s.pitch}”</div>
                  <div className="small">Requirement: {s.req}</div>
                  <div className="small">Bonus: {[s.bonus.all && `+${s.bonus.all * 100}% all coins`, s.bonus.race && `+${s.bonus.race * 100}% race coins`, s.bonus.trick && `+${s.bonus.trick * 100}% trick coins`].filter(Boolean).join(', ')}</div>
                  {s.gift && <div className="small">Gift: {ITEM_BY_ID.get(s.gift)?.name}</div>}
                  <div className="small">{signed ? '✅ Signed' : 'Not yet — sponsors approach you automatically'}</div>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'achievements' && (
          <div className="grid cols-4">
            {ACHIEVEMENTS.map((a) => {
              const got = p.achievements.includes(a.id);
              return <div key={a.id} className={`panel ach ${got ? '' : 'locked'}`}><div className="ico">{a.icon}</div><strong>{a.name}</strong><div className="small muted">{a.desc}</div>{got && <div className="small">✅</div>}</div>;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

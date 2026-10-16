import { useState } from 'react';
import type { AppApi } from '../App';
import { resortUnlocked } from '../App';
import { RESORTS } from '../../data/resorts';
import { DISCIPLINE_INFO } from '../../data/names';
import { AI_LEVELS } from '../../ai/racerAI';
import { TOURNAMENTS, STAGES } from '../../data/career';
import { stageOf } from '../../state/save';
import { Back, Coins } from '../components/common';
import { formatTime } from '../../core/math';

export function Racing({ api }: { api: AppApi }) {
  const p = api.profile;
  const [tab, setTab] = useState<'quick' | 'tour'>('quick');
  const [level, setLevel] = useState(p.settings.aiLevel);
  const st = stageOf(p);
  const courses = RESORTS.flatMap((r) => r.races.map((d, i) => ({ r, d, i })));
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>RACING</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content">
        <div className="tabs">
          <button className={`btn ${tab === 'quick' ? 'selected' : ''}`} onClick={() => setTab('quick')}>Quick Race</button>
          <button className={`btn ${tab === 'tour' ? 'selected' : ''}`} onClick={() => setTab('tour')}>Tournaments</button>
        </div>
        {tab === 'quick' ? (
          <>
            <div className="panel card row wrap" style={{ marginBottom: 14 }}>
              <span>AI difficulty:</span>
              {AI_LEVELS.map((l, i) => <button key={l.name} className={`btn small ${level === i ? 'selected' : ''}`} onClick={() => { setLevel(i); api.update((pp) => { pp.settings.aiLevel = i; }); }}>{l.name}</button>)}
            </div>
            <div className="grid cols-3">
              {courses.map(({ r, d, i }) => {
                const open = resortUnlocked(p, r);
                const rec = p.records[`${r.id}:${i}:${p.board}`];
                return (
                  <div key={`${r.id}${i}`} className={`panel card col ${open ? '' : 'locked'}`}>
                    <h3>{DISCIPLINE_INFO[d].label}</h3>
                    <div className="muted small">{r.name}</div>
                    <div className="small">{DISCIPLINE_INFO[d].desc}</div>
                    <div className="small muted">{d === 'ski-cross' || d === 'freestyle' ? '4 racers head-to-head' : `${d === 'super-g' || d === 'downhill' ? 7 : 6} AI racers start ahead of you`}{rec ? ` · PB ${formatTime(rec.time)}` : ''}</div>
                    <button className="btn primary" disabled={!open} data-testid={`race-${r.id}-${i}`}
                      onClick={() => api.launch({ resortIndex: r.index, mode: { kind: 'race', course: i, level, title: `${r.name} ${DISCIPLINE_INFO[d].label}` }, back: 'racing', weather: 'clear', hour: 11 })}>
                      {open ? 'Race' : '🔒 Locked'}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="grid cols-2">
            {TOURNAMENTS.map((t) => {
              const prog = p.tournaments[t.id];
              const open = st >= t.minStage;
              const nextIdx = prog && !prog.done ? prog.race : 0;
              const next = t.races[nextIdx];
              const nr = RESORTS.find((r) => r.id === next.resortId)!;
              const unlockedResort = resortUnlocked(p, nr) || st >= t.minStage;
              const table = prog ? Object.entries(prog.points).sort((a, b) => b[1] - a[1]) : [];
              return (
                <div key={t.id} className={`panel card col ${open ? '' : 'locked'}`}>
                  <div className="row"><h3 style={{ flex: 1, margin: 0 }}>{t.name}</h3><span className="tag">{AI_LEVELS[t.level].name}</span></div>
                  <div className="small muted">{t.desc}</div>
                  <div className="small">{t.races.map((r, k) => {
                    const rr = RESORTS.find((x) => x.id === r.resortId)!;
                    return <span key={k} className="tag" style={{ opacity: prog && k < prog.race && !prog.done ? 0.5 : 1 }}>{k + 1}. {rr.name} {DISCIPLINE_INFO[rr.races[r.course]].short}</span>;
                  })}</div>
                  <div className="small">Prize: {t.prize.toLocaleString()} Peak Coins + medal</div>
                  {prog?.done && <div className="small">Finished {prog.place}{prog.place === 1 ? 'st 🏆' : prog.place === 2 ? 'nd' : prog.place === 3 ? 'rd' : 'th'}</div>}
                  {table.length > 0 && (
                    <div className="small">{table.slice(0, 5).map(([n, pts], k) => <div key={n} style={{ color: n === '__you' ? 'var(--accent)' : undefined }}>{k + 1}. {n === '__you' ? p.name : n} — {pts} pts</div>)}</div>
                  )}
                  <div className="row">
                    <button className="btn primary" disabled={!open || !unlockedResort}
                      onClick={() => {
                        if (prog?.done) api.update((pp) => { delete pp.tournaments[t.id]; });
                        const idx = prog?.done ? 0 : nextIdx;
                        const race = t.races[idx];
                        const r = RESORTS.find((x) => x.id === race.resortId)!;
                        api.launch({ resortIndex: r.index, mode: { kind: 'race', course: race.course, level: t.level, title: `${t.name} — Race ${idx + 1}/${t.races.length}`, tournament: { id: t.id, index: idx } }, back: 'racing', weather: 'clear', hour: 11 });
                      }}>
                      {!open ? `🔒 ${STAGES[t.minStage].name}` : prog?.done ? 'Restart tournament' : prog ? `Race ${nextIdx + 1}` : 'Enter'}
                    </button>
                    {prog && !prog.done && <button className="btn small" onClick={() => api.update((pp) => { delete pp.tournaments[t.id]; })}>Withdraw</button>}
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

import type { AppApi } from '../App';
import { resortUnlocked } from '../App';
import { RESORTS } from '../../data/resorts';
import { FREESTYLE_INFO, type FreestyleMode } from '../../data/career';
import { Back, Coins } from '../components/common';

const STYLE_LABEL: Record<string, string> = {
  beginner: 'Learning Park', standard: 'Terrain Park', slopestyle: 'Slopestyle Course', bigair: 'Big Air', rails: 'Rail Plaza', superpipe: 'Superpipe', halfpipe: 'Halfpipe',
};
const STYLE_DESC: Record<string, string> = {
  beginner: 'Small kickers, boxes and rollers to learn on.',
  standard: 'Jump line from small to large plus a jib line and quarterpipe.',
  slopestyle: 'Rails across three lanes, a wall ride, then four big jumps incl. step-down and gap.',
  bigair: 'A massive big-air kicker with a long inrun, warm-up jumps and a natural cliff drop.',
  rails: 'A plaza of straight, kinked, rainbow and flat-down rails, boxes, tubes and a wall ride.',
  superpipe: 'A 5.5 m-wall superpipe. Pump the transitions and boost out of the lip.',
  halfpipe: 'A 3.8 m-wall halfpipe for learning pipe airs.',
};

export function Parks({ api }: { api: AppApi }) {
  const p = api.profile;
  const modesFor = (style: string): FreestyleMode[] =>
    style === 'superpipe' || style === 'halfpipe' ? ['pipe', 'best'] : style === 'rails' ? ['grind', 'combo'] : style === 'bigair' ? ['best'] : ['score', 'combo', 'best'];
  return (
    <div className="screen bg-mountains">
      <div className="topbar"><Back onClick={() => api.go('menu')} /><h1>TERRAIN PARKS</h1><span className="spacer" /><Coins n={p.coins} /></div>
      <div className="content">
        <div className="panel card small muted" style={{ marginBottom: 14 }}>
          Freestyle controls — <span className="keycap">Space</span> hold &amp; release to pop · in the air <span className="keycap">Q</span>/<span className="keycap">E</span> spin, <span className="keycap">↑</span>/<span className="keycap">↓</span> front/backflip, <span className="keycap">←</span>/<span className="keycap">→</span> cork tilt, <span className="keycap">1</span>–<span className="keycap">4</span> grabs (+<span className="keycap">Shift</span> for Nose, Method, Stalefish, Truck Driver). Land tricks within 2.6 s of each other to build a combo multiplier. Rails: ride or jump onto them and balance with <span className="keycap">A</span>/<span className="keycap">D</span>.
        </div>
        <div className="grid cols-3">
          {RESORTS.flatMap((r) => r.parks.map((style, i) => {
            const open = resortUnlocked(p, r);
            return (
              <div key={`${r.id}${i}`} className={`panel card col ${open ? '' : 'locked'}`}>
                <h3>{STYLE_LABEL[style]}</h3>
                <div className="small muted">{r.name}</div>
                <div className="small">{STYLE_DESC[style]}</div>
                <div className="row wrap">
                  <button className="btn small primary" disabled={!open} data-testid={`park-${r.id}-${i}`}
                    onClick={() => api.launch({ resortIndex: r.index, mode: { kind: 'park', park: i, mode: 'score', time: 600, targets: [4000, 12000, 30000], title: `${STYLE_LABEL[style]} session` }, back: 'parks', weather: 'clear', hour: 13 })}>
                    Free session
                  </button>
                  {modesFor(style).map((m) => (
                    <button key={m} className="btn small" disabled={!open}
                      onClick={() => {
                        const base = m === 'best' ? 3000 : m === 'grind' ? 4500 : m === 'pipe' ? 8000 : m === 'combo' ? 6000 : 7000;
                        api.launch({ resortIndex: r.index, mode: { kind: 'park', park: i, mode: m, time: 120, targets: [Math.round(base * 0.45), Math.round(base * 0.75), base], title: `${FREESTYLE_INFO[m].label} challenge` }, back: 'parks', weather: 'clear', hour: 13 });
                      }}>{FREESTYLE_INFO[m].label}</button>
                  ))}
                </div>
              </div>
            );
          }))}
        </div>
      </div>
    </div>
  );
}

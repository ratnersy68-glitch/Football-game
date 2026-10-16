import type { AppApi } from '../App';
import { RESORTS } from '../../data/resorts';
import { STAGES } from '../../data/career';
import { stageOf, totalMedals } from '../../state/save';
import { MedalDot } from '../components/common';

export function MainMenu({ api }: { api: AppApi }) {
  const p = api.profile;
  const st = stageOf(p);
  const next = STAGES[Math.min(STAGES.length - 1, st + 1)];
  const lastIdx = Math.max(0, RESORTS.findIndex((r) => r.id === p.lastResort));
  const items: [string, () => void, string][] = [
    ['Play', () => api.launch({ resortIndex: lastIdx, mode: { kind: 'freeride' }, back: 'menu', weather: p.settings.weather === 'random' ? undefined : p.settings.weather, hour: p.settings.hour }), `Continue at ${RESORTS[lastIdx].name}`],
    ['Free Ride', () => api.go('freeride'), 'Explore any open resort'],
    ['Racing', () => api.go('racing'), 'Quick races & tournaments'],
    ['Career', () => api.go('career'), STAGES[st].name],
    ['Terrain Parks', () => api.go('parks'), 'Freestyle challenges'],
    ['Character', () => api.go('character'), 'Look & gear'],
    ['Shop', () => api.go('shop'), 'Spend Peak Coins'],
    ['Mountains', () => api.go('mountains'), '8 resorts · 203 trails'],
    ['Leaderboards', () => api.go('leaderboards'), 'Records & stats'],
    ['Replays', () => api.go('replays'), 'Saved runs'],
    ['Settings', () => api.go('settings'), 'Graphics · controls · audio'],
  ];
  return (
    <div className="screen bg-mountains">
      <div className="menu-wrap">
        <div>
          <h1 className="logo">SUMMIT<small>ULTIMATE SKI RESORT SIMULATOR</small></h1>
          <div className="menu-list">
            {items.map(([label, fn, sub], i) => (
              <button key={label} className={`btn ${i === 0 ? 'primary' : ''}`} onClick={fn} data-testid={`menu-${label.toLowerCase().replace(/ /g, '-')}`}>
                {label}<span className="k">{sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="panel profile-card col">
          <div className="row"><strong style={{ fontSize: 20 }}>{p.name}</strong><span className="spacer" style={{ flex: 1 }} /><span className="chip coins">{p.coins.toLocaleString()}</span></div>
          <div className="muted">{STAGES[st].name}{st < STAGES.length - 1 ? ` → ${next.name}` : ''}</div>
          <div className="progress"><div style={{ width: `${st >= STAGES.length - 1 ? 100 : Math.min(100, (p.xp / next.xp) * 100)}%` }} /></div>
          <div className="small muted">{p.xp.toLocaleString()} XP · {totalMedals(p)} medals {st < STAGES.length - 1 ? `(next stage: ${next.xp.toLocaleString()} XP, ${next.medals} medals)` : ''}</div>
          <div className="row small"><MedalDot m="gold" /> {p.medals.gold} <MedalDot m="silver" /> {p.medals.silver} <MedalDot m="bronze" /> {p.medals.bronze}</div>
          <div className="small muted">Riding {p.board === 'ski' ? 'skis' : 'a snowboard'} · {p.sponsors.length} sponsor{p.sponsors.length === 1 ? '' : 's'} · {p.achievements.length} achievements</div>
          <div className="small muted" style={{ marginTop: 8 }}>
            Controls: <span className="keycap">W</span> tuck <span className="keycap">S</span> brake <span className="keycap">A</span>/<span className="keycap">D</span> turn <span className="keycap">Shift</span> carve <span className="keycap">Space</span> jump · in the air <span className="keycap">Q</span>/<span className="keycap">E</span> spin, arrows flip &amp; cork, <span className="keycap">1–4</span> grabs · <span className="keycap">F</span> lifts <span className="keycap">M</span> map <span className="keycap">C</span> camera <span className="keycap">R</span> reset <span className="keycap">V</span> replay
          </div>
        </div>
      </div>
    </div>
  );
}

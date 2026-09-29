import { useMemo, useState } from 'react';
import { CONFERENCES, UNIVERSE_TEAMS } from '../../data';
import { navigate } from '../../app/store';
import { newSeed, previewWorld } from '../preview';
import { Stars, TeamBadge, prestigeStars } from '../components/common';
import type { TeamInfo } from '../../models/types';

export function programRating(t: TeamInfo, roster: number): number {
  return Math.round(t.prestige * 0.3 + roster * 0.4 + t.facilities * 0.1 + t.nilStrength * 0.1 + t.recruitingPower * 0.1);
}

type Sort = 'program' | 'roster' | 'prestige' | 'name';

export function TeamSelect({ seed: seedProp, conference }: { seed?: number; conference?: string }) {
  const [seed] = useState(() => seedProp ?? newSeed());
  const conferences = CONFERENCES.filter((c) => c.playable);
  const [conf, setConf] = useState(conference ?? conferences[0].id);
  const [sort, setSort] = useState<Sort>('program');
  const preview = useMemo(() => previewWorld(seed), [seed]);

  const teams = UNIVERSE_TEAMS.filter((t) => t.conference === conf)
    .map((t) => ({ t, roster: preview.ratings[t.id].overall }))
    .sort((a, b) => {
      if (sort === 'name') return a.t.school.localeCompare(b.t.school);
      if (sort === 'roster') return b.roster - a.roster;
      if (sort === 'prestige') return b.t.prestige - a.t.prestige;
      return programRating(b.t, b.roster) - programRating(a.t, a.roster);
    });

  return (
    <div className="page">
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate({ name: 'menu' })}>
          ← Menu
        </button>
        <h1>Select Your Program</h1>
        <div className="spacer" />
        <span className="muted">Sort</span>
        <select className="field-input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="program">Program rating</option>
          <option value="roster">Roster rating</option>
          <option value="prestige">Prestige</option>
          <option value="name">Name</option>
        </select>
      </div>
      <div className="tabs">
        {conferences.map((c) => (
          <button key={c.id} className={`tab ${conf === c.id ? 'active' : ''}`} onClick={() => setConf(c.id)}>
            {c.name}
          </button>
        ))}
      </div>
      <div className="grid cards">
        {teams.map(({ t, roster }) => (
          <div key={t.id} className="school-card" onClick={() => navigate({ name: 'overview', teamId: t.id, seed })}>
            <div className="stripe" style={{ background: `linear-gradient(90deg, ${t.primaryColor}, ${t.secondaryColor})` }} />
            <div className="row">
              <TeamBadge teamId={t.id} size={52} />
              <div className="grow">
                <div className="name">{t.school}</div>
                <div className="nick">
                  {t.nickname} · {CONFERENCES.find((c) => c.id === t.conference)?.name}
                </div>
                <Stars n={prestigeStars(t.prestige)} />
              </div>
              <div className="center">
                <div className="muted" style={{ fontSize: 10 }}>
                  PROGRAM
                </div>
                <div style={{ fontFamily: 'var(--display)', fontSize: 30 }}>{programRating(t, roster)}</div>
              </div>
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>
              {t.stadium} · {t.capacity.toLocaleString()}
            </div>
            <div className="stat-grid">
              <div className="stat">
                <div className="k">Roster</div>
                <div className="v">{roster}</div>
              </div>
              <div className="stat">
                <div className="k">Recruit</div>
                <div className="v">{t.recruitingPower}</div>
              </div>
              <div className="stat">
                <div className="k">NIL</div>
                <div className="v">{t.nilStrength}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

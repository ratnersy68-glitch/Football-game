import { useState } from 'react';
import { LCPS_TEAMS, programExpectation, getTeam, rivalryName } from '../data/teams';
import { TeamLogo, Btn, RatingBar, Stars } from '../components/common';
import { teamImageStatus } from '../game/render/assets';
import { logoAsset } from '../assets/registry';
import manifest from '../data/logo-manifest.json';
import { drawPlayer, skinFor } from '../game/render/sprites';
import { kitFor } from '../game/render/Renderer';
import type { TeamInfo } from '../game/types';
import { useEffect, useRef } from 'react';

function UniformPreview({ team }: { team: TeamInfo }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const ctx = ref.current!.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, 80, 26);
    drawPlayer(ctx, 18, 22, { ...kitFor(team, true), skin: skinFor('a') }, 1, 'stand', 0, 1);
    drawPlayer(ctx, 58, 22, { ...kitFor(team, false), skin: skinFor('b') }, -1, 'stand', 0, 1);
  }, [team]);
  return <canvas ref={ref} width={80} height={26} className="uniform-preview" />;
}

export function TeamDatabase({ onBack }: { onBack: () => void }) {
  const [sel, setSel] = useState<TeamInfo>(LCPS_TEAMS[0]);
  return (
    <div className="screen setup-screen">
      <header className="screen-head">
        <Btn variant="ghost" small onClick={onBack}>◂ BACK</Btn>
        <h2 className="pixel">TEAM DATABASE</h2>
        <span className="dim">{LCPS_TEAMS.length} LCPS PROGRAMS</span>
      </header>
      <div className="db-layout">
        <div className="db-list">
          {LCPS_TEAMS.map((t) => (
            <button key={t.id} className={`db-item ${t.id === sel.id ? 'on' : ''}`} onClick={() => setSel(t)} style={{ ['--tc' as string]: t.colors.primary }}>
              <TeamLogo team={t} size={32} />
              <span><b>{t.shortName}</b><small>{t.mascot}</small></span>
            </button>
          ))}
        </div>
        <div className="db-detail panel">
          <div className="db-hero" style={{ background: `linear-gradient(120deg, ${sel.colors.primary}, ${sel.colors.secondary})` }}>
            <TeamLogo team={sel} size={110} />
            <div>
              <div className="pixel db-name">{sel.shortName.toUpperCase()} {sel.mascot.toUpperCase()}</div>
              <div>{sel.school} · {sel.city}, VA</div>
              <div className="small">Founded {sel.founded} · {sel.district} District</div>
            </div>
          </div>
          <div className="db-cols">
            <div>
              <h4>PROGRAM</h4>
              <RatingBar label="OFFENSE" value={sel.offenseRating} />
              <RatingBar label="DEFENSE" value={sel.defenseRating} />
              <RatingBar label="SPECIAL TEAMS" value={sel.specialTeamsRating} />
              <div className="kv"><span>PRESTIGE</span><Stars n={sel.prestige} /></div>
              <div className="kv"><span>EXPECTATION</span><b>{programExpectation(sel)}</b></div>
              <p className="small">{sel.history}</p>
            </div>
            <div>
              <h4>IDENTITY</h4>
              <div className="kv"><span>COLORS</span><span className="swatches"><i style={{ background: sel.colors.primary }} /><i style={{ background: sel.colors.secondary }} />{sel.colorNames}</span></div>
              <div className="kv"><span>STADIUM</span><span>{sel.stadium}</span></div>
              <div className="kv"><span>UNIFORMS</span><UniformPreview team={sel} /></div>
              <div className="kv"><span>RIVALS</span><span>{sel.rivals.map((r) => `${getTeam(r).shortName} (${rivalryName(sel.id, r)})`).join(', ') || '—'}</span></div>
              <div className="kv"><span>LOGO FILE</span><span className="small">{teamImageStatus(sel.id) === false ? `❌ MISSING public/${sel.logo}` : `public/${sel.logo}`}</span></div>
              {logoAsset(sel.id) && <div className="kv"><span>LOGO SOURCE</span><span className="small">Official school site · <a href={manifest.find((m) => m.id === sel.id)?.schoolPage} target="_blank" rel="noreferrer">{manifest.find((m) => m.id === sel.id)?.schoolPage}</a></span></div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

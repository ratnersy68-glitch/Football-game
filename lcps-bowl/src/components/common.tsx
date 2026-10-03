import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import type { TeamInfo } from '../game/types';
import { onTeamImage, teamImageStatus, initials } from '../game/render/assets';
import { contrastText } from '../game/render/Renderer';
import { FORMATIONS, ROUTES, type OffPlay } from '../game/Plays';
import { Sound } from '../game/audio/Sound';

/** Real logo if present in public/assets/teams/<id>/logo.png, otherwise a clean initials badge. */
export function TeamLogo({ team, size = 48, style }: { team: TeamInfo; size?: number; style?: CSSProperties }) {
  const [ok, setOk] = useState<boolean | null>(() => teamImageStatus(team.id));
  useEffect(() => {
    setOk(teamImageStatus(team.id));
    return onTeamImage(team.id, 'logo', () => setOk(teamImageStatus(team.id)));
  }, [team.id]);
  if (ok) {
    return <img src={team.logo} alt={`${team.shortName} logo`} width={size} height={size} style={{ objectFit: 'contain', imageRendering: 'auto', ...style }} />;
  }
  const label = initials(team.shortName, team.abbreviation);
  return (
    <div
      className="logo-badge"
      title={`${team.shortName} — add public/assets/teams/${team.id}/logo.png to show the real logo`}
      style={{
        width: size, height: size, background: team.colors.primary, color: contrastText(team.colors.primary),
        borderColor: team.colors.secondary, fontSize: Math.max(8, size / (label.length > 2 ? 3.6 : 2.8)), ...style,
      }}
    >
      {label}
    </div>
  );
}

export function Btn({ children, onClick, variant = 'primary', disabled, small, style, title }: {
  children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost' | 'gold' | 'danger'; disabled?: boolean; small?: boolean; style?: CSSProperties; title?: string;
}) {
  return (
    <button
      className={`btn btn-${variant}${small ? ' btn-small' : ''}`}
      disabled={disabled}
      title={title}
      style={style}
      onClick={() => { Sound.play('menu'); onClick?.(); }}
    >
      {children}
    </button>
  );
}

export function Stars({ n, max = 5 }: { n: number; max?: number }) {
  return <span className="stars">{'★'.repeat(Math.max(0, Math.round(n)))}<span className="dim">{'★'.repeat(Math.max(0, max - Math.round(n)))}</span></span>;
}

export function RatingBar({ label, value }: { label: string; value: number }) {
  const color = value >= 80 ? '#38d86b' : value >= 70 ? '#9be15d' : value >= 60 ? '#f2c94c' : '#eb8a57';
  return (
    <div className="rating-bar">
      <span className="rb-label">{label}</span>
      <span className="rb-track"><span className="rb-fill" style={{ width: `${value}%`, background: color }} /></span>
      <span className="rb-val">{Math.round(value)}</span>
    </div>
  );
}

/** Tiny SVG play diagram from the playbook data. */
export function PlayDiagram({ play, w = 120, h = 64 }: { play: OffPlay; w?: number; h?: number }) {
  const form = FORMATIONS[play.formation];
  const sx = (dx: number) => w * 0.32 + dx * (w / 52);
  const sy = (dy: number) => h / 2 + dy * (h / 46);
  const items: ReactNode[] = [];
  items.push(<line key="los" x1={sx(0)} y1={2} x2={sx(0)} y2={h - 2} stroke="rgba(255,255,255,0.25)" strokeDasharray="2 2" />);
  [-2.6, -1.3, 0, 1.3, 2.6].forEach((dy, i) => items.push(<rect key={`ol${i}`} x={sx(-0.8) - 2} y={sy(dy) - 2} width={4} height={4} fill="#cfd6e4" />));
  items.push(<circle key="qb" cx={sx(-form.qbDepth)} cy={sy(0)} r={2.4} fill="#ffd84a" />);
  for (const s of form.skill) {
    const x0 = sx(s.dx);
    const y0 = sy(s.dy);
    items.push(<circle key={s.slot} cx={x0} cy={y0} r={2.3} fill="#ffffff" />);
    const rname = play.routes[s.slot];
    if (play.kind === 'run' || play.kind === 'option' || play.kind === 'sneak') continue;
    if (!rname || rname === 'block') continue;
    const r = ROUTES[rname];
    if (!r) continue;
    const side = s.dy < -0.5 ? -1 : s.dy > 0.5 ? 1 : 1;
    let d = `M ${x0} ${y0}`;
    for (const [dx, di] of r.pts) d += ` L ${sx(s.dx + Math.min(dx, 28))} ${sy(s.dy - side * di)}`;
    items.push(<path key={`r${s.slot}`} d={d} fill="none" stroke="#7fd4ff" strokeWidth={1.4} />);
  }
  if (play.kind === 'run' || play.kind === 'option' || play.kind === 'sneak') {
    const runner = play.carrier === 'QB' ? { dx: -form.qbDepth, dy: 0 } : form.skill.find((s) => s.slot === (play.carrier ?? 'H')) ?? { dx: -6, dy: 0 };
    const aim = play.aim ?? 0;
    items.push(<path key="run" d={`M ${sx(runner.dx)} ${sy(runner.dy)} ${play.counter ? `L ${sx(runner.dx + 1)} ${sy(-aim * 0.5)}` : ''} L ${sx(3)} ${sy(aim)} L ${sx(9)} ${sy(aim * 1.2)}`} fill="none" stroke="#ffd84a" strokeWidth={1.6} />);
  }
  if (play.kind === 'punt' || play.kind === 'fg') {
    items.push(<path key="k" d={`M ${sx(-form.qbDepth)} ${sy(0)} Q ${sx(10)} ${sy(-14)} ${sx(25)} ${sy(0)}`} fill="none" stroke="#ffd84a" strokeWidth={1.4} strokeDasharray="3 2" />);
  }
  return <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="play-diagram">{items}</svg>;
}

export function Panel({ title, children, right, className }: { title?: ReactNode; children: ReactNode; right?: ReactNode; className?: string }) {
  return (
    <section className={`panel ${className ?? ''}`}>
      {(title || right) && <header className="panel-head"><h3>{title}</h3>{right}</header>}
      <div className="panel-body">{children}</div>
    </section>
  );
}

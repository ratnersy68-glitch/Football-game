import { useState, type CSSProperties, type ReactNode } from 'react';
import { TEAM_BY_ID, logoUrl } from '../../data';
import { logoFailed, logosEnabled, markLogoFailed } from '../../visualization/logoCache';
import type { Player } from '../../models/types';

function lum(hex: string): number {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
}

export function textOn(hex: string): string {
  return lum(hex) > 0.6 ? '#111' : '#fff';
}

/** Team logo: the official logo (loaded at runtime) with a team-color roundel fallback. */
export function TeamBadge({ teamId, size = 44 }: { teamId: string; size?: number }) {
  const t = TEAM_BY_ID[teamId];
  const url = logoUrl(teamId);
  const [broken, setBroken] = useState(false);
  if (!t) return null;
  if (url && logosEnabled() && !broken && !logoFailed(url)) {
    return (
      <img
        src={url}
        alt={t.school}
        title={`${t.school} ${t.nickname}`}
        width={size}
        height={size}
        referrerPolicy="no-referrer"
        style={{ width: size, height: size, objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,.45))' }}
        onError={() => {
          markLogoFailed(url);
          setBroken(true);
        }}
      />
    );
  }
  const fs = Math.max(9, size * (t.abbreviation.length > 3 ? 0.28 : 0.34));
  return (
    <span
      className="badge"
      title={`${t.school} ${t.nickname}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 35% 30%, ${t.primaryColor}, ${t.primaryColor} 55%, rgba(0,0,0,.35))`,
        color: textOn(t.primaryColor),
        border: `${Math.max(2, size * 0.06)}px solid ${t.secondaryColor}`,
        fontSize: fs,
      }}
    >
      {t.abbreviation}
    </span>
  );
}

export function Ovr({ v }: { v: number }) {
  const cls = v >= 88 ? 'elite' : v >= 78 ? 'good' : v >= 68 ? 'avg' : 'low';
  return <span className={`ovr ${cls}`}>{v}</span>;
}

export function Stars({ n }: { n: number }) {
  return <span className="stars">{'★'.repeat(n)}<span style={{ opacity: 0.25 }}>{'★'.repeat(Math.max(0, 5 - n))}</span></span>;
}

export function prestigeStars(prestige: number): number {
  return prestige >= 90 ? 5 : prestige >= 75 ? 4 : prestige >= 58 ? 3 : prestige >= 42 ? 2 : 1;
}

export function Meter({ v, max = 100 }: { v: number; max?: number }) {
  return (
    <div className="meter">
      <div style={{ width: `${Math.max(0, Math.min(100, (100 * v) / max))}%` }} />
    </div>
  );
}

export function Stat({ k, v, style }: { k: string; v: ReactNode; style?: CSSProperties }) {
  return (
    <div className="stat" style={style}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
    </div>
  );
}

export function playerName(p: Player | undefined, short = false): string {
  if (!p) return '—';
  return short ? `${p.firstName[0]}. ${p.lastName}` : `${p.firstName} ${p.lastName}`;
}

export function teamStyle(teamId: string): CSSProperties {
  const t = TEAM_BY_ID[teamId];
  return { ['--team' as string]: t?.primaryColor ?? '#bb0000', ['--team2' as string]: t?.secondaryColor ?? '#666' } as CSSProperties;
}

export function rankLabel(rank: number | undefined): string {
  return rank ? `#${rank} ` : '';
}

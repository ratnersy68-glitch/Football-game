import { useEffect, useRef } from 'react';
import type { Difficulty } from '../../world/types';
import { DIFFICULTY_INFO } from '../../world/types';
import { drawDifficulty } from '../../render/props';
import type { ResortDef } from '../../data/resorts';
import { MEDAL_COLOR, type Medal } from '../../data/career';
import { Noise2D } from '../../core/noise';

export function DiffIcon({ d, size = 16 }: { d: Difficulty | 'park' | 'race' | 'pipe' | string; size?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const x = c.getContext('2d')!;
    x.clearRect(0, 0, c.width, c.height);
    if (d in DIFFICULTY_INFO) {
      if (DIFFICULTY_INFO[d as Difficulty].color === '#111111') {
        x.fillStyle = '#ffffff';
        x.globalAlpha = 0.9;
      }
      drawDifficulty(x, d as Difficulty, c.width / 2, c.height / 2, c.height * 0.42);
    } else {
      x.fillStyle = d === 'race' ? '#d8282a' : '#ff7a1a';
      x.beginPath(); x.arc(c.width / 2, c.height / 2, c.height * 0.35, 0, Math.PI * 2); x.fill();
    }
  }, [d, size]);
  const w = d === 'double' ? size * 1.6 : d === 'triple' ? size * 2.2 : size;
  return <canvas ref={ref} width={w * 2} height={size * 2} style={{ width: w, height: size, verticalAlign: 'middle', background: DIFFICULTY_INFO[d as Difficulty]?.color === '#111111' ? '#111' : 'transparent', borderRadius: 3 }} />;
}

export function StatBar({ label, value, delta = 0 }: { label: string; value: number; delta?: number }) {
  return (
    <div className="stat-bar">
      <span className="muted">{label}</span>
      <div className="track"><div className={`fill ${delta > 0 ? 'up' : ''}`} style={{ width: `${Math.round(value * 100)}%` }} /></div>
      <span style={{ color: delta > 0 ? 'var(--good)' : delta < 0 ? 'var(--bad)' : undefined }}>{delta ? `${delta > 0 ? '+' : ''}${Math.round(delta * 100)}` : Math.round(value * 100)}</span>
    </div>
  );
}

export function MedalDot({ m }: { m: Medal | null | undefined }) {
  if (!m) return <span className="medal" style={{ background: 'rgba(255,255,255,0.12)' }} />;
  return <span className="medal" style={{ background: MEDAL_COLOR[m], boxShadow: `0 0 8px ${MEDAL_COLOR[m]}` }} title={m} />;
}

/** Original representative artwork for a resort: layered ridgelines from its peak data. */
export function ResortArt({ def, height = 140 }: { def: ResortDef; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const w = (c.width = 560), h = (c.height = height * 2);
    const x = c.getContext('2d')!;
    const sky = x.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, def.theme.sky);
    sky.addColorStop(1, '#eaf3fb');
    x.fillStyle = sky; x.fillRect(0, 0, w, h);
    const n = new Noise2D(def.seed);
    const layers = 4;
    for (let L = 0; L < layers; L++) {
      const f = L / (layers - 1);
      const base = h * (0.62 + f * 0.12);
      x.beginPath(); x.moveTo(0, h);
      for (let px = 0; px <= w; px += 4) {
        const u = (px / w) * 2 - 1;
        let peak = 0;
        for (const p of def.peaks) peak = Math.max(peak, p.h * Math.exp(-(((u - p.x) / (p.w * (1 + f))) ** 2)));
        const rug = n.ridged(px / 90 + L * 10, L, 3) * 0.25 * def.rugged;
        const y = base - (peak * (0.5 - f * 0.22) + rug * (0.5 - f * 0.3)) * h * (def.vertical / 1900 + 0.3);
        x.lineTo(px, y);
      }
      x.lineTo(w, h); x.closePath();
      const tone = 235 - (layers - 1 - L) * 14;
      x.fillStyle = L === layers - 1 ? '#f7fbff' : `rgb(${tone - 30},${tone - 18},${tone})`;
      x.fill();
    }
    // forest band
    x.fillStyle = def.theme.foliage;
    for (let i = 0; i < 90; i++) {
      const px = (i * 61) % w, py = h * 0.82 + ((i * 37) % 30);
      x.beginPath(); x.moveTo(px, py - 18); x.lineTo(px + 6, py); x.lineTo(px - 6, py); x.fill();
    }
  }, [def, height]);
  return <canvas ref={ref} style={{ width: '100%', height }} />;
}

export function Coins({ n }: { n: number }) {
  return <span className="chip coins">{Math.floor(n).toLocaleString()}</span>;
}

export function Back({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return <button className="btn small" onClick={onClick}>← {label}</button>;
}

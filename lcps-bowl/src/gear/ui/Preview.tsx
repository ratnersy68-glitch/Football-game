import { useEffect, useRef, useState } from 'react';
import type { PlayerData, Position, TeamInfo } from '../../game/types';
import type { Pose } from '../../game/render/sprites';
import { drawGearedPlayer } from '../sprite';
import { resolveLook } from '../look';
import type { EquipmentCategory, EquipmentItem, PlayerGear, ThemeId } from '../types';

/** Big animated pixel preview of a player wearing a fit. Uses the exact gameplay sprite. */
export function PlayerPreview({ p, team, gear, theme = 'none', scale = 9, pose = 'stand', animate = true, home = true, facing = 1, width, height, bg = true }: {
  p: PlayerData; team: TeamInfo; gear?: PlayerGear; theme?: ThemeId; scale?: number; pose?: Pose; animate?: boolean; home?: boolean; facing?: 1 | -1; width?: number; height?: number; bg?: boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const W = width ?? scale * 20;
  const H = height ?? scale * 33;
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const look = resolveLook(p, team, home, theme, gear);
    let raf = 0;
    const t0 = performance.now();
    const frame = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      if (bg) {
        const g = ctx.createRadialGradient(W / 2, H * 0.9, 4, W / 2, H * 0.9, W * 0.7);
        g.addColorStop(0, 'rgba(255,216,74,0.25)');
        g.addColorStop(1, 'rgba(255,216,74,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(W / 2, H - scale * 2, scale * 5, scale * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const bob = animate && pose === 'stand' ? (Math.floor(t * 2) % 2) * Math.max(1, scale / 3) * 0 : 0;
      drawGearedPlayer(ctx, Math.round(W / 2), Math.round(H - scale * 2 + bob), look, facing, pose, animate ? t * 8 : 0, scale, { presnap: pose === 'stand' });
      if (animate) raf = requestAnimationFrame(frame);
    };
    frame();
    return () => cancelAnimationFrame(raf);
  }, [p, team, gear, theme, scale, pose, animate, home, facing, W, H, bg, JSON.stringify(gear)]);
  return <canvas ref={ref} width={W} height={H} className="gear-preview" style={{ width: W, height: H }} />;
}

const FOCUS: Record<EquipmentCategory, 'head' | 'body' | 'legs' | 'full'> = {
  helmet: 'head', pads: 'body', finish: 'head', facemask: 'head', visor: 'head', mouthguard: 'head',
  gloves: 'body', sleeve: 'body', wristband: 'body', armband: 'body', handwarmer: 'body', towel: 'body', undershirt: 'body', accessory: 'full',
  cleats: 'legs', socks: 'legs', spats: 'legs', legsleeve: 'legs',
};

/** Mannequin fit wearing just one item (plus basics), used for shop thumbnails. */
export function mannequinGear(item: EquipmentItem): PlayerGear {
  const g: PlayerGear = { helmet: 'helm-standard', finish: 'finish-gloss', facemask: 'mask-skill', socks: 'socks-white', cleats: 'cleats-classic-black', leftArm: [], rightArm: [], stripe: true, logo: true };
  const id = item.id;
  switch (item.category) {
    case 'helmet': g.helmet = id; break;
    case 'pads': g.pads = id; break;
    case 'finish': g.finish = id; break;
    case 'facemask': g.facemask = id; break;
    case 'visor': g.visor = id; break;
    case 'mouthguard': g.mouthguard = id; g.facemask = 'mask-kicker'; break;
    case 'gloves': g.gloves = id; break;
    case 'sleeve': g.rightArm = [id]; g.leftArm = [id]; break;
    case 'wristband': g.rightArm = [id]; g.leftArm = [id]; break;
    case 'armband': g.rightArm = [id]; g.leftArm = [id]; break;
    case 'handwarmer': g.handwarmer = id; break;
    case 'towel': g.towel = id; g.towelPos = 'front'; break;
    case 'cleats': g.cleats = id; break;
    case 'socks': g.socks = id; break;
    case 'spats': g.spats = id; break;
    case 'undershirt': g.undershirt = id; break;
    case 'legsleeve': g.legsleeve = id; break;
    case 'accessory': if (item.style === 'brace') { g.rightArm = [id]; g.leftArm = [id]; } else g.accessory = id; break;
  }
  return g;
}

const MANNEQUIN_POS: Partial<Record<EquipmentCategory, Position>> = { helmet: 'LB', finish: 'LB' };

/**
 * Exact supplied product artwork (helmets/pads). Shown unchanged: white panel, object-fit: contain,
 * aspect ratio and every equipment edge preserved. A load failure shows an obvious MISSING ASSET label and logs an error.
 */
export function ProductImage({ item, width, height }: { item: EquipmentItem; width: number; height?: number }) {
  const [bad, setBad] = useState(false);
  const h = height ?? Math.round((width * 2) / 3);
  if (bad) return <div className="product-panel missing-asset" style={{ width, height: h }}>MISSING ASSET<br /><code>{item.image}</code></div>;
  return (
    <div className="product-panel" style={{ width, height: h }}>
      <img src={item.image} alt={item.name} draggable={false} onError={() => { console.error(`[assets] missing product image ${item.image} for ${item.id}`); setBad(true); }} />
    </div>
  );
}

/** Item thumbnail: supplied product art when the item has it, otherwise the mannequin wearing the item. */
export function ItemThumb({ item, team, size = 150, animate = false }: { item: EquipmentItem; team: TeamInfo; size?: number; animate?: boolean }) {
  if (item.image) return <ProductImage item={item} width={Math.round(size * 1.35)} height={Math.round(size * 0.9)} />;
  return <MannequinThumb item={item} team={team} size={size} animate={animate} />;
}

function MannequinThumb({ item, team, size = 150, animate = false }: { item: EquipmentItem; team: TeamInfo; size?: number; animate?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const focus = FOCUS[item.category];
  useEffect(() => {
    const cv = ref.current!;
    const ctx = cv.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    const fake = { id: `mannequin-${item.category}`, pos: MANNEQUIN_POS[item.category] ?? 'WR', weight: 200, number: 7 } as PlayerData;
    const look = resolveLook(fake, team, true, 'none', mannequinGear(item));
    const region = focus === 'head' ? { top: -30, bottom: -19, h: 11 } : focus === 'body' ? { top: -22, bottom: -6, h: 16 } : focus === 'legs' ? { top: -12, bottom: 1, h: 13 } : { top: -31, bottom: 1, h: 32 };
    const sc = Math.max(2, Math.floor((size * 0.82) / region.h));
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      ctx.clearRect(0, 0, size, size);
      const footY = size / 2 - ((region.top + region.bottom) / 2) * sc;
      const pose: Pose = item.category === 'cleats' && animate ? 'run' : 'stand';
      drawGearedPlayer(ctx, Math.round(size / 2 - sc * 0.5), Math.round(footY), look, 1, pose, t * 8, sc, { presnap: item.category === 'mouthguard' });
      if (animate) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [item, team, size, animate, focus]);
  return <canvas ref={ref} width={size} height={size} className="item-thumb" style={{ width: size, height: size }} />;
}

// Coach avatars: minimal illustrated portraits and a glowing AI emblem (local SVG, no assets).
let n = 0;

const PORTRAITS = {
  atlas: { skin: '#C99A7A', shade: '#A97E62', hair: '#2A2420', hairPath: 'M62 64c0-20 16-32 38-32s38 12 38 32c-6-8-18-12-38-12s-32 4-38 12z', beard: 'M70 92c4 22 16 32 30 32s26-10 30-32c-6 10-16 14-30 14s-24-4-30-14z' },
  nova: { skin: '#E8C4A8', shade: '#CFA88C', hair: '#5A3B26', hairPath: 'M58 98c-6-44 10-70 42-70s48 26 42 70c-4-16-6-30-14-40-12 6-34 8-56 4-6 10-10 22-14 36z', back: 'M54 96c-4 30 2 52 10 62h72c8-10 14-32 10-62-6 22-26 34-46 34s-40-12-46-34z' },
  onyx: { skin: '#6B4A36', shade: '#553A2A', hair: '#141210', hairPath: 'M64 70c0-22 14-36 36-36s36 14 36 36c-8-12-20-16-36-16s-28 4-36 16z', band: true },
  sol: { skin: '#A0704E', shade: '#86593C', hair: '#1E1814', curls: true },
};

export function avatarSVG(id = 'emblem', { size = 44, glow = true } = {}) {
  const k = `av${++n}`;
  if (!PORTRAITS[id]) {
    return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="AI coach emblem"><defs>
      <radialGradient id="${k}g" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="#FFFFFF"/><stop offset=".5" stop-color="#B9E8FF"/><stop offset="1" stop-color="#20252B"/></radialGradient>
      <linearGradient id="${k}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#78CFFF"/></linearGradient>
      <filter id="${k}f" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="5"/></filter></defs>
      <circle cx="100" cy="100" r="96" fill="#090B0E"/>
      ${glow ? `<circle cx="100" cy="100" r="58" fill="#78CFFF" opacity=".45" filter="url(#${k}f)"/>` : ''}
      <polygon points="100,26 164,63 164,137 100,174 36,137 36,63" fill="none" stroke="#78CFFF" stroke-width="3" opacity=".7"/>
      <polygon points="100,50 142,74 142,126 100,150 58,126 58,74" fill="url(#${k}g)" opacity=".9"/>
      <polyline points="72,116 100,86 128,116" fill="none" stroke="#090B0E" stroke-width="12"/>
      <polyline points="80,134 100,113 120,134" fill="none" stroke="#090B0E" stroke-width="8" opacity=".55"/>
      <circle cx="100" cy="100" r="96" fill="none" stroke="url(#${k}c)" stroke-width="3"/></svg>`;
  }
  const p = PORTRAITS[id];
  let curls = '';
  if (p.curls) for (let i = 0; i < 14; i++) { const a = Math.PI + (i / 13) * Math.PI; curls += `<circle cx="${100 + 40 * Math.cos(a)}" cy="${78 + 34 * Math.sin(a)}" r="14" fill="${p.hair}"/>`; }
  return `<svg class="avatar" width="${size}" height="${size}" viewBox="0 0 200 200" role="img" aria-label="Coach portrait"><defs>
    <clipPath id="${k}clip"><circle cx="100" cy="100" r="96"/></clipPath>
    <linearGradient id="${k}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F8F9FA"/><stop offset="1" stop-color="#DDE3E8"/></linearGradient>
    <linearGradient id="${k}rim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B9E8FF"/><stop offset="1" stop-color="#78CFFF"/></linearGradient></defs>
    <g clip-path="url(#${k}clip)">
      <rect width="200" height="200" fill="url(#${k}bg)"/>
      <path d="M-10 70 C 40 50, 80 100, 210 60" stroke="#C9D1D8" stroke-width="1.4" fill="none" opacity=".8"/>
      <path d="M-10 150 C 60 130, 120 170, 210 140" stroke="#C9D1D8" stroke-width="1" fill="none" opacity=".7"/>
      ${p.back ? `<path d="${p.back}" fill="${p.hair}"/>` : ''}
      <path d="M30 210c4-40 34-58 70-58s66 18 70 58z" fill="#090B0E"/>
      <path d="M70 160c8 10 18 14 30 14s22-4 30-14" stroke="url(#${k}rim)" stroke-width="3" fill="none"/>
      <rect x="86" y="118" width="28" height="34" rx="10" fill="${p.shade}"/>
      <ellipse cx="100" cy="88" rx="36" ry="42" fill="${p.skin}"/>
      <path d="M136 88c0 24-16 42-36 42 22-6 30-22 30-42 0-14-6-26-14-34 12 6 20 18 20 34z" fill="${p.shade}" opacity=".55"/>
      ${curls}
      ${p.hairPath ? `<path d="${p.hairPath}" fill="${p.hair}"/>` : ''}
      ${p.band ? `<rect x="64" y="58" width="72" height="8" rx="4" fill="#78CFFF"/>` : ''}
      ${p.beard ? `<path d="${p.beard}" fill="${p.hair}" opacity=".9"/>` : ''}
      <circle cx="86" cy="90" r="3.2" fill="#20252B"/><circle cx="114" cy="90" r="3.2" fill="#20252B"/>
      <path d="M90 110c6 4 14 4 20 0" stroke="#20252B" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    </g>
    <circle cx="100" cy="100" r="96" fill="none" stroke="url(#${k}rim)" stroke-width="${glow ? 4 : 2}"/></svg>`;
}

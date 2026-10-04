/** Techpack demonstration palette: orange jersey, white helmet/pants/cleats, tan skin, pale blue visor. */
import type { Look } from '../types';

export function demoLook(helmet = 'standard', pads = 'standard', extra: Partial<Look> = {}): Look {
  return {
    skin: '#d9a066', jersey: '#e8620e', jerseyShade: '#b84a08', numbers: '#ffffff', pants: '#f4f4f4', pantsShade: '#c9ccd2',
    torso: 8, pads,
    helmet: { model: helmet, shell: '#f4f4f4', shade: '#c9ccd2', hi: '#ffffff', stripe: '#e8620e', logo: undefined, finish: 'gloss' },
    mask: { style: 'skill', color: '#9aa0a8' },
    visor: ['#b9dcff', '#e6f3ff'],
    arms: { L: {}, R: {} },
    socks: ['#e8620e'],
    cleats: { colors: ['#f4f4f4', '#d0d0d0'], style: 'classic' },
    ...extra,
  };
}

/**
 * Low-resolution GAMEPLAY layers for the eight exact supplied products. The shop shows the supplied images unchanged;
 * these are separate in-game pixel layers built from each model's recognizable shape. Shells use school colors.
 *
 * Helmet tokens: S shell, D shade, H highlight, K seam/vent, F face, E eyes (visor tint when a visor is worn),
 * M facemask, C chinstrap, L school mark (downsampled official logo), B forehead badge, J jaw bumper.
 */
export type HelmetView = 'side' | 'front' | 'back';
export interface HelmetArt { side: string[]; front: string[]; back: string[] }

export const HELMET_ART: Record<string, HelmetArt> = {
  // Team-issued: plain round shell, standard two-bar mask
  standard: {
    side: [
      '..SSSS....',
      '.SHSSSS...',
      'SSSSSSSS..',
      'SLLSSSEEM.',
      'SLLSSSFFM.',
      'DSSSSSFFMM',
      '.DSSSCFFM.',
      '..DD.CMM..',
    ],
    front: ['..SSSS..', '.SHSSSS.', 'SSSSSSSS', 'SSEFFESS', 'SMMMMMMS', 'SSFFFFSS', '.SMMMMS.', '..C..C..'],
    back: ['..SSSS..', '.SSHSSS.', 'SSSSSSSS', 'SSSSSSSS', 'SSSSSSSS', 'DSSSSSSD', '.DSSSSD.', '..DDDD..'],
  },
  // SPEEDFLEX: flex panel cut into the crown, swept rear flare, long jaw bumper, wraparound mask
  speedflex: {
    side: [
      '...SSSS...',
      '..SHSSKS..',
      '.SSSSSSKS.',
      'SLLSSSSEEM',
      'SLLSSSFFMM',
      'DSSSSJJFFM',
      'DDSSSJJJMM',
      '.DD..CCMM.',
    ],
    front: ['..SKKS..', '.SHSKSS.', 'SSSSSSSS', 'SSEFFESS', 'SMMMMMMS', 'SJFFFFJS', 'JJMMMMJJ', '.C....C.'],
    back: ['..SKKS..', '.SSKSSS.', 'SSSSSSSS', 'SSKSSKSS', 'SSSSSSSS', 'DSSSSSSD', 'DDSSSSDD', '.DD..DD.'],
  },
  // F7: angular flat-topped shell with faceted side seams; angular mask whose top bar projects forward
  f7: {
    side: [
      '.SSSSSS...',
      'SHHSSSSSM.',
      'SSSKSSSSMM',
      'SLLSKSSEEM',
      'SLLSSKFFMM',
      'DSSSSSFFM.',
      '.DSSSCFMM.',
      '..DD.CMM..',
    ],
    front: ['.SSSSSS.', 'SHSSSSSS', 'SKSSSSKS', 'SSEFFESS', 'MMMMMMMM', 'SSFMMFSS', '.SMMMMS.', '..C..C..'],
    back: ['.SSSSSS.', 'SSSSSSSS', 'SKSSSSKS', 'SSKSSKSS', 'SSSSSSSS', 'DSSSSSSD', '.DSSSSD.', '..DDDD..'],
  },
  // VICIS ZERO2: large smooth dome, forehead badge, open dark face, vertical-bar mask
  zero2: {
    side: [
      '..SSSSS...',
      '.SSHHSSS..',
      'SSSSSSSBB.',
      'SLLSSSSEMM',
      'SLLSSSFFMM',
      'DSSSSSFMFM',
      '.DSSSCFMFM',
      '..DDDCMMM.',
    ],
    front: ['..SSSS..', '.SHSSSS.', 'SSSBBSSS', 'SSEFFESS', 'SMMMMMMS', 'SSFMMFSS', '.SMMMMS.', '..C..C..'],
    back: ['..SSSS..', '.SSHHSS.', 'SSSSSSSS', 'SSSSSSSS', 'SSSSSSSS', 'DSSSSSSD', '.DSSSSD.', '..DDDD..'],
  },
  // VICIS ZERO2 TRENCH: ZERO2 dome + badge with a full lineman cage down to the chin and a bulkier jaw
  zero2trench: {
    side: [
      '..SSSSS...',
      '.SSHHSSS..',
      'SSSSSSSBB.',
      'SLLSSSSEMM',
      'SLLSSSMMMM',
      'DSSSSSFMFM',
      'DSSSSSMMMM',
      '.DDDCCMMM.',
    ],
    front: ['..SSSS..', '.SHSSSS.', 'SSSBBSSS', 'SSEFFESS', 'SMMMMMMS', 'SMFMMFMS', 'SMMMMMMS', '.CMMMMC.'],
    back: ['..SSSS..', '.SSHHSS.', 'SSSSSSSS', 'SSSSSSSS', 'SSSSSSSS', 'DSSSSSSD', 'DDSSSSDD', 'DDDDDDDD'],
  },
};

/** Column of the neck attachment in the side bitmap (bottom row). */
export const HELMET_NECK_COL = 4;

/**
 * Shoulder pads change the shoulder silhouette UNDER the jersey (never drawn exposed).
 * cap: extra half-width at the shoulder line; rise: shoulders squared up above the collar line;
 * capRows: how far down the cap bulge reaches; round: rounded cap top; plate: lower plate adds waist width.
 */
export interface PadProfile { cap: number; rise: number; capRows: number; round: boolean; plate: number; seam: boolean }
export const PAD_PROFILE: Record<string, PadProfile> = {
  standard: { cap: 0, rise: 0, capRows: 2, round: true, plate: 0, seam: false },
  xflex: { cap: 1, rise: 0, capRows: 3, round: true, plate: 0, seam: true }, // segmented rounded caps
  elite: { cap: 1, rise: 1, capRows: 3, round: false, plate: 1, seam: false }, // squared high shoulders + lower plate
  battle: { cap: 2, rise: 0, capRows: 3, round: true, plate: 0, seam: false }, // big round caps
  twoinone: { cap: 1, rise: 0, capRows: 4, round: false, plate: 0, seam: true }, // flat, long, boxy
};

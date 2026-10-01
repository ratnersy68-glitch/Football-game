import type { PitchCode } from '../core/types';

/**
 * Pitch shapes. Movement is in inches relative to a spinless ball (so "ivb" is the
 * induced vertical break that fights gravity). Horizontal break is positive toward the
 * pitcher's ARM side. `late` > 2 concentrates the break near the plate.
 */
export interface PitchShape {
  code: PitchCode;
  name: string;
  short: string;
  speed: number; // fraction of the pitcher's fastball velocity
  hb: number; // inches, + = arm side
  ivb: number; // inches, + = rises relative to gravity
  late: number; // movement exponent (2 = constant accel, 3 = late)
  spin: number; // rpm (for display)
  color: string; // trail color
  fastball: boolean;
}

export const PITCHES: Record<PitchCode, PitchShape> = {
  FF: { code: 'FF', name: '4-Seam Fastball', short: '4SFB', speed: 1.0, hb: 7, ivb: 16, late: 2, spin: 2350, color: '#ff5a4f', fastball: true },
  FT: { code: 'FT', name: '2-Seam Fastball', short: '2SFB', speed: 0.98, hb: 15, ivb: 9, late: 2.2, spin: 2200, color: '#ff8a3d', fastball: true },
  SI: { code: 'SI', name: 'Sinker', short: 'SNK', speed: 0.975, hb: 15, ivb: 5, late: 2.3, spin: 2150, color: '#ffae3d', fastball: true },
  FC: { code: 'FC', name: 'Cutter', short: 'CUT', speed: 0.94, hb: -4, ivb: 9, late: 3, spin: 2400, color: '#ffd23d', fastball: true },
  SL: { code: 'SL', name: 'Slider', short: 'SL', speed: 0.88, hb: -7, ivb: 1, late: 2.7, spin: 2450, color: '#3dd6ff', fastball: false },
  ST: { code: 'ST', name: 'Sweeper', short: 'SWP', speed: 0.86, hb: -16, ivb: 1, late: 2.4, spin: 2600, color: '#3d8bff', fastball: false },
  CU: { code: 'CU', name: 'Curveball', short: 'CB', speed: 0.81, hb: -8, ivb: -13, late: 2.2, spin: 2600, color: '#a66bff', fastball: false },
  KC: { code: 'KC', name: 'Knuckle Curve', short: 'KC', speed: 0.84, hb: -6, ivb: -11, late: 2.4, spin: 2500, color: '#d06bff', fastball: false },
  CH: { code: 'CH', name: 'Changeup', short: 'CH', speed: 0.885, hb: 14, ivb: 5, late: 2.4, spin: 1750, color: '#4fff8a', fastball: false },
  FS: { code: 'FS', name: 'Splitter', short: 'SPL', speed: 0.9, hb: 8, ivb: 0, late: 3.4, spin: 1300, color: '#3dffd0', fastball: false },
};

export const PITCH_KEYS = ['A', 'S', 'D', 'F', 'G', 'H'];

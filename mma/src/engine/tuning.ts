/** Central tuning constants. Headless simulations (npm run sim) are used to calibrate these. */
export const TUNING = {
  octagonApothem: 4.4,
  fighterRadius: 0.3,
  minSeparation: 0.62,
  startDistance: 3.2,

  baseMoveSpeed: 2.25,
  turnRate: 7.5,

  // Striking
  baseHitChance: 0.5,
  comboWindow: 0.45,
  comboSpeedup: 0.8,
  bufferTime: 0.28,
  missStaminaMult: 1.45,

  // Damage / daze
  dazeFloorFromHead: 0.12,
  dazeDecayBase: 3.2,
  dazeDecayRecovery: 0.05,
  koThresholdBase: 52,
  koThresholdChin: 0.75,
  koHeadPenalty: 0.13,
  koKnockdownPenalty: 9,
  rockedAt: 0.42,
  knockdownAt: 0.88,
  spikeKnockdown: 0.38,
  spikeKO: 0.5,

  refBase: 24,
  refChin: 0.12,

  // Stamina
  regenBase: 6.6,
  tankDrain: 0.06,

  // Grappling
  groundStallSeconds: 26,
  clinchStallSeconds: 18,
};

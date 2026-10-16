/** Weather + time of day state, the snow conditions they produce, and dynamic cycling. */
import { timeOfDay, type WeatherKind, WEATHER_LABEL } from '../render/sceneSetup';
import type { SnowConditions } from '../world/terrain';
import { Rng } from '../core/rng';

export interface WeatherState {
  kind: WeatherKind;
  hour: number;
  wind: { x: number; z: number };
  snowfall: number;
  conditions: SnowConditions;
}

export const WEATHER_KINDS: WeatherKind[] = ['clear', 'light-snow', 'heavy-snow', 'overcast', 'fog', 'wind'];

export function conditionsFor(kind: WeatherKind, hour: number, seed: number): SnowConditions {
  const r = new Rng(seed);
  switch (kind) {
    case 'heavy-snow': return { powder: 1, ice: 0.05, slushLine: 0, label: 'Fresh powder' };
    case 'light-snow': return { powder: 0.75, ice: 0.12, slushLine: 0, label: 'Powder on groomers' };
    case 'wind': return { powder: 0.3, ice: 0.45, slushLine: 0, label: 'Wind-packed, icy patches' };
    case 'fog':
    case 'overcast': return { powder: 0.45, ice: 0.25, slushLine: 0, label: 'Packed powder' };
    case 'clear':
    default: {
      // sunny afternoons soften the lower mountain into slush, cold mornings are firm
      const warm = hour >= 13 && hour <= 17;
      const cold = hour < 9 || hour > 19;
      if (warm && r.chance(0.6)) return { powder: 0.2, ice: 0.15, slushLine: 0.3, label: 'Spring slush low down' };
      if (cold) return { powder: 0.2, ice: 0.55, slushLine: 0, label: 'Hardpack & ice' };
      return { powder: 0.3, ice: 0.3, slushLine: 0, label: 'Groomed corduroy' };
    }
  }
}

export function makeWeather(kind: WeatherKind, hour: number, seed: number): WeatherState {
  const r = new Rng(seed + 17);
  const windy = kind === 'wind' ? 9 : kind === 'heavy-snow' ? 4 : kind === 'light-snow' ? 1.5 : 0.6;
  const a = r.range(0, Math.PI * 2);
  return {
    kind, hour,
    wind: { x: Math.cos(a) * windy, z: Math.sin(a) * windy },
    snowfall: kind === 'heavy-snow' ? 1 : kind === 'light-snow' ? 0.35 : kind === 'wind' ? 0.15 : 0,
    conditions: conditionsFor(kind, hour, seed),
  };
}

export function weatherLabel(w: WeatherState): string {
  const h = Math.floor(w.hour), m = Math.floor((w.hour - h) * 60);
  const t = w.hour < 7 ? 'Dawn' : w.hour < 9 ? 'Sunrise' : w.hour < 17 ? 'Day' : w.hour < 19.5 ? 'Sunset' : 'Night';
  return `${WEATHER_LABEL[w.kind]} · ${t} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export { timeOfDay };

/** Dynamic weather: drifts the clock and occasionally changes the sky. */
export class WeatherCycle {
  private t = 0;
  private rng: Rng;
  constructor(seed: number, public enabled: boolean) { this.rng = new Rng(seed); }
  /** Returns a new state when something changed meaningfully. */
  update(dt: number, w: WeatherState): WeatherState | null {
    if (!this.enabled) return null;
    this.t += dt;
    let changed = false;
    // one in-game hour every 2.5 real minutes
    w.hour = (w.hour + dt / 150) % 24;
    if (this.t > 5) { this.t = 0; changed = true; }
    if (this.rng.chance(dt / 240)) {
      const kind = this.rng.pick(WEATHER_KINDS);
      return makeWeather(kind, w.hour, Math.floor(this.rng.next() * 1e6));
    }
    return changed ? { ...w } : null;
  }
}

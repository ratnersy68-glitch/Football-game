import { Rng } from '../../core/rng';
import type { TeamInfo, Weather } from '../../models/types';

const COLD_STATES = new Set(['MI', 'OH', 'WI', 'MN', 'IA', 'NE', 'PA', 'NY', 'WV', 'KS', 'IN', 'IL', 'MA', 'WA', 'OR', 'UT', 'CO', 'ND', 'SD', 'MT', 'WY', 'ID', 'NJ', 'MD', 'KY']);
const WET_STATES = new Set(['WA', 'OR', 'FL', 'LA', 'MS', 'AL']);

export function isDome(stadium: string): boolean {
  return /dome|allegiant/i.test(stadium);
}

/** Weather for a home site and season week (week 1 ≈ end of August, week 14 ≈ end of November). */
export function generateWeather(rng: Rng, home: TeamInfo, week: number, neutralSite?: string): Weather {
  if (isDome(neutralSite ?? home.stadium)) return { condition: 'dome', temperature: 70, wind: 0 };
  const cold = COLD_STATES.has(home.state);
  const baseTemp = cold ? 84 - week * 4.2 : 90 - week * 2.6;
  const temperature = Math.round(baseTemp + rng.normal(0, 7));
  const wind = Math.max(0, Math.round(rng.normal(7, 5)));
  const r = rng.next();
  let condition: Weather['condition'] = 'clear';
  const rainChance = WET_STATES.has(home.state) ? 0.16 : 0.1;
  if (temperature <= 34 && cold && r < 0.35) condition = 'snow';
  else if (r < rainChance) condition = 'rain';
  else if (wind >= 16) condition = 'wind';
  else if (r < rainChance + 0.25) condition = 'cloudy';
  return { condition, temperature, wind: condition === 'wind' ? Math.max(wind, 16) : wind };
}

export function weatherLabel(w: Weather): string {
  if (w.condition === 'dome') return 'Indoors';
  const c = { clear: 'Clear', cloudy: 'Cloudy', rain: 'Rain', snow: 'Snow', wind: 'Windy', dome: 'Indoors' }[w.condition];
  return `${c}, ${w.temperature}°F, wind ${w.wind} mph`;
}

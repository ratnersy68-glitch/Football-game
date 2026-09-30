import type { ArenaDef } from './types';

/** Generic arenas *inspired by* famous fight venues — no real branding. */
export const ARENAS: ArenaDef[] = [
  { id: 'vegas', name: 'Las Vegas Arena', city: 'Las Vegas, Nevada', inspiredBy: 'Strip-side pay-per-view arena', capacity: 19000, canvasColor: '#dcdcd8', canvasLogoColor: 'rgba(170,20,30,0.30)', lightColor: '#fff4e0', crowdDensity: 1, crowdHue: 0, accent: '#d20a11', bannerText: 'FIGHT NIGHT · LAS VEGAS' },
  { id: 'garden', name: 'The Garden', city: 'New York City', inspiredBy: 'Madison Square Garden-style arena', capacity: 20000, canvasColor: '#d8d8dc', canvasLogoColor: 'rgba(30,40,120,0.28)', lightColor: '#eef2ff', crowdDensity: 1, crowdHue: 220, accent: '#2a55d8', bannerText: 'NEW YORK · THE GARDEN' },
  { id: 'miami', name: 'Miami Bayfront Arena', city: 'Miami, Florida', inspiredBy: 'South Florida waterfront arena', capacity: 19600, canvasColor: '#e0dcd6', canvasLogoColor: 'rgba(0,150,150,0.28)', lightColor: '#fff0f5', crowdDensity: 0.95, crowdHue: 180, accent: '#12b5b0', bannerText: 'MIAMI · FIGHT NIGHT' },
  { id: 'london', name: 'London Arena', city: 'London, England', inspiredBy: 'Riverside arena in East London', capacity: 20000, canvasColor: '#d6d6d6', canvasLogoColor: 'rgba(120,20,40,0.28)', lightColor: '#f0f0ff', crowdDensity: 1, crowdHue: 350, accent: '#b3122e', bannerText: 'LONDON · FIGHT NIGHT' },
  { id: 'abudhabi', name: 'Abu Dhabi Island Arena', city: 'Abu Dhabi, UAE', inspiredBy: 'Fight Island-style outdoor-lit venue', capacity: 12000, canvasColor: '#e2dccc', canvasLogoColor: 'rgba(180,140,40,0.32)', lightColor: '#fff6d8', crowdDensity: 0.85, crowdHue: 45, accent: '#d4a017', bannerText: 'ABU DHABI · FIGHT ISLAND' },
  { id: 'apex', name: 'Fight Night Apex', city: 'Las Vegas, Nevada', inspiredBy: 'Small studio venue (Apex-style)', capacity: 1000, canvasColor: '#cfcfcf', canvasLogoColor: 'rgba(40,40,40,0.25)', lightColor: '#ffffff', crowdDensity: 0.18, crowdHue: 0, accent: '#d20a11', bannerText: 'FIGHT NIGHT · THE APEX' },
];

export const ARENA_BY_ID: Record<string, ArenaDef> = Object.fromEntries(ARENAS.map((a) => [a.id, a]));

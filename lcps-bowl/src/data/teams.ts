import type { TeamInfo } from '../game/types';

/**
 * LCPS varsity football programs (17 schools, 2025-26 alignment).
 *
 * Sources: LCPS school pages, Wikipedia infoboxes, MaxPreps, LoCoSports, Loudoun Times-Mirror
 * (researched Oct 2026). Colors are the schools' published color names mapped to approximate hex values.
 * Stadium names: only Riverside's is officially named (FACT Field); others play on-campus and are listed as
 * "<School> Stadium" (generic, on-campus) rather than inventing a name.
 *
 * Logos: the supplied official school-site logos live at public/assets/teams/<id>/logo.png (see src/assets/registry.ts)
 * automatically. Until then a clean initials badge in school colors is shown.
 *
 * Ratings are game-design starting points (0-99 talent scale) informed by recent program success; they are
 * not factual claims.
 */

type Raw = Omit<TeamInfo, 'logo' | 'helmet' | 'helmetStyle' | 'uniforms'> & {
  helmetStyle?: TeamInfo['helmetStyle'];
  awayJersey?: string;
};

const RAW: Raw[] = [
  {
    id: 'briar-woods', school: 'Briar Woods High School', shortName: 'Briar Woods', mascot: 'Falcons', abbreviation: 'BW',
    city: 'Ashburn', colors: { primary: '#0B1F45', secondary: '#F47A20' }, colorNames: 'Navy & Orange',
    stadium: 'Briar Woods Stadium', district: 'Potomac', founded: 2005,
    offenseRating: 76, defenseRating: 78, specialTeamsRating: 72, prestige: 5,
    rivals: ['stone-bridge', 'broad-run'],
    history: 'State champions 2010, 2011, 2012 (2012: 15-0). Reached the 2025 Class 5 state final.',
  },
  {
    id: 'broad-run', school: 'Broad Run High School', shortName: 'Broad Run', mascot: 'Spartans', abbreviation: 'BR',
    city: 'Ashburn', colors: { primary: '#7A1F2B', secondary: '#FFB81C' }, colorNames: 'Maroon & Gold',
    stadium: 'Broad Run Stadium', district: 'Catoctin', founded: 1969,
    offenseRating: 70, defenseRating: 70, specialTeamsRating: 66, prestige: 4,
    rivals: ['stone-bridge', 'briar-woods'],
    history: 'State champions 2008 and 2009. "Cornfield High" — one of Loudoun\'s original suburban powers.',
  },
  {
    id: 'dominion', school: 'Dominion High School', shortName: 'Dominion', mascot: 'Titans', abbreviation: 'DOM',
    city: 'Sterling', colors: { primary: '#111111', secondary: '#A7A9AC' }, colorNames: 'Black & Silver',
    stadium: 'Dominion Stadium', district: 'Dulles', founded: 2003,
    offenseRating: 58, defenseRating: 57, specialTeamsRating: 58, prestige: 2,
    rivals: ['potomac-falls', 'park-view'],
    history: 'Sterling program building toward its first state title.',
    awayJersey: '#EDEDED',
  },
  {
    id: 'freedom', school: 'Freedom High School', shortName: 'Freedom', mascot: 'Eagles', abbreviation: 'FHS',
    city: 'South Riding', colors: { primary: '#111111', secondary: '#C5B358' }, colorNames: 'Black & Vegas Gold',
    stadium: 'Freedom Stadium', district: 'Potomac', founded: 2005,
    offenseRating: 62, defenseRating: 61, specialTeamsRating: 60, prestige: 2,
    rivals: ['john-champe', 'lightridge'],
    history: 'South Riding\'s program in the always-tough Potomac District.',
  },
  {
    id: 'heritage', school: 'Heritage High School', shortName: 'Heritage', mascot: 'Pride', abbreviation: 'HER',
    city: 'Leesburg', colors: { primary: '#C8102E', secondary: '#111111' }, colorNames: 'Red & Black',
    stadium: 'Heritage Stadium', district: 'Dulles', founded: 2002,
    offenseRating: 68, defenseRating: 67, specialTeamsRating: 64, prestige: 3,
    rivals: ['loudoun-county', 'tuscarora'],
    history: 'Leesburg contender; Dulles District runner-up in 2025.',
  },
  {
    id: 'independence', school: 'Independence High School', shortName: 'Independence', mascot: 'Tigers', abbreviation: 'IND',
    city: 'Ashburn', colors: { primary: '#C8102E', secondary: '#0B1F45' }, colorNames: 'Red, Navy & White',
    stadium: 'Independence Stadium', district: 'Cedar Run', founded: 2019,
    offenseRating: 60, defenseRating: 59, specialTeamsRating: 58, prestige: 2,
    rivals: ['rock-ridge', 'briar-woods'],
    history: 'Opened 2019. Class 6 — plays in the Cedar Run District.',
  },
  {
    id: 'john-champe', school: 'John Champe High School', shortName: 'John Champe', mascot: 'Knights', abbreviation: 'JC',
    city: 'Aldie', colors: { primary: '#0B1F45', secondary: '#A7A9AC' }, colorNames: 'Navy & Silver',
    stadium: 'John Champe Stadium', district: 'Potomac', founded: 2012,
    offenseRating: 67, defenseRating: 66, specialTeamsRating: 64, prestige: 3,
    rivals: ['lightridge', 'freedom'],
    history: 'Aldie program; a top-4 seed in Region 5D in 2025.',
  },
  {
    id: 'lightridge', school: 'Lightridge High School', shortName: 'Lightridge', mascot: 'Lightning', abbreviation: 'LHS',
    city: 'Aldie', colors: { primary: '#5E9FCF', secondary: '#FFD100' }, colorNames: 'Powder Blue, Yellow & White',
    stadium: 'Lightridge Stadium', district: 'Potomac', founded: 2020,
    offenseRating: 57, defenseRating: 56, specialTeamsRating: 57, prestige: 2,
    rivals: ['john-champe', 'freedom'],
    history: 'Newest program in the county (opened 2020). The Bolts are still writing their story.',
  },
  {
    id: 'loudoun-county', school: 'Loudoun County High School', shortName: 'Loudoun County', mascot: 'Captains', abbreviation: 'LC',
    city: 'Leesburg', colors: { primary: '#0B1F45', secondary: '#FFB81C' }, colorNames: 'Navy & Gold',
    stadium: 'Loudoun County Stadium', district: 'Catoctin', founded: 1954,
    offenseRating: 74, defenseRating: 73, specialTeamsRating: 68, prestige: 4,
    rivals: ['loudoun-valley', 'heritage'],
    history: 'The county\'s oldest operating high school (1954). 2025 Region 4C champions and Class 4 state finalists.',
  },
  {
    id: 'loudoun-valley', school: 'Loudoun Valley High School', shortName: 'Loudoun Valley', mascot: 'Vikings', abbreviation: 'LV',
    city: 'Purcellville', colors: { primary: '#00563F', secondary: '#FFB81C' }, colorNames: 'Green & Gold',
    stadium: 'Loudoun Valley Stadium', district: 'Dulles', founded: 1962,
    offenseRating: 75, defenseRating: 74, specialTeamsRating: 68, prestige: 4,
    rivals: ['woodgrove', 'loudoun-county'],
    history: 'Western Loudoun power with a Group AA state title. 2025 Dulles District champions.',
  },
  {
    id: 'park-view', school: 'Park View High School', shortName: 'Park View', mascot: 'Patriots', abbreviation: 'PV',
    city: 'Sterling', colors: { primary: '#C8102E', secondary: '#0033A0' }, colorNames: 'Red, White & Blue',
    stadium: 'Park View Stadium', district: 'Catoctin', founded: 1976,
    offenseRating: 54, defenseRating: 54, specialTeamsRating: 55, prestige: 2,
    rivals: ['potomac-falls', 'dominion'],
    history: 'Sterling\'s original program; 1988 Group AA state champions.',
  },
  {
    id: 'potomac-falls', school: 'Potomac Falls High School', shortName: 'Potomac Falls', mascot: 'Panthers', abbreviation: 'PF',
    city: 'Sterling', colors: { primary: '#4B2E83', secondary: '#111111' }, colorNames: 'Purple & Black',
    stadium: 'Potomac Falls Stadium', district: 'Potomac', founded: 1997,
    offenseRating: 66, defenseRating: 66, specialTeamsRating: 63, prestige: 3,
    rivals: ['park-view', 'dominion'],
    history: 'A Region 5D top-4 seed in 2025.',
  },
  {
    id: 'riverside', school: 'Riverside High School', shortName: 'Riverside', mascot: 'Rams', abbreviation: 'RIV',
    city: 'Leesburg', colors: { primary: '#0047AB', secondary: '#C8102E' }, colorNames: 'Royal Blue, Red & Silver',
    stadium: 'FACT Field (Fitz Alexander Campbell Thomas Memorial Stadium)', district: 'Potomac', founded: 2015,
    offenseRating: 55, defenseRating: 55, specialTeamsRating: 57, prestige: 1,
    rivals: ['rock-ridge', 'heritage'],
    history: 'Lansdowne program (opened 2015) in rebuild mode after a 2-8 2025 season.',
  },
  {
    id: 'rock-ridge', school: 'Rock Ridge High School', shortName: 'Rock Ridge', mascot: 'Phoenix', abbreviation: 'RR',
    city: 'Ashburn', colors: { primary: '#9D2235', secondary: '#708090', accent: '#FF5F1F' }, colorNames: 'Cardinal, Silver & Fire',
    stadium: 'Rock Ridge Stadium', district: 'Dulles', founded: 2014,
    offenseRating: 58, defenseRating: 58, specialTeamsRating: 58, prestige: 2,
    rivals: ['riverside', 'independence'],
    history: 'Ashburn\'s Phoenix, opened 2014.',
  },
  {
    id: 'stone-bridge', school: 'Stone Bridge High School', shortName: 'Stone Bridge', mascot: 'Bulldogs', abbreviation: 'SB',
    city: 'Ashburn', colors: { primary: '#0B1F45', secondary: '#7BAFD4' }, colorNames: 'Carolina Blue, Navy & White',
    stadium: 'Stone Bridge Stadium', district: 'Potomac', founded: 2000,
    offenseRating: 82, defenseRating: 81, specialTeamsRating: 74, prestige: 5,
    rivals: ['broad-run', 'briar-woods'],
    history: 'Loudoun\'s powerhouse: state champions 2007, 2021 (spring) and 2021 (fall); 10+ state final trips. 2025 Potomac champions.',
    helmetStyle: { shell: '#7BAFD4', stripe: '#0B1F45', facemask: '#0B1F45' },
  },
  {
    id: 'tuscarora', school: 'Tuscarora High School', shortName: 'Tuscarora', mascot: 'Huskies', abbreviation: 'TUS',
    city: 'Leesburg', colors: { primary: '#0047AB', secondary: '#111111' }, colorNames: 'Royal Blue, Black & White',
    stadium: 'Tuscarora Stadium', district: 'Dulles', founded: 2010,
    offenseRating: 63, defenseRating: 62, specialTeamsRating: 61, prestige: 3,
    rivals: ['heritage', 'loudoun-county'],
    history: 'Leesburg Huskies; a Region 4C playoff team in 2025.',
  },
  {
    id: 'woodgrove', school: 'Woodgrove High School', shortName: 'Woodgrove', mascot: 'Wolverines', abbreviation: 'WG',
    city: 'Purcellville', colors: { primary: '#0B1F45', secondary: '#00843D' }, colorNames: 'Navy, Green & White',
    stadium: 'Woodgrove Stadium', district: 'Catoctin', founded: 2010,
    offenseRating: 70, defenseRating: 69, specialTeamsRating: 65, prestige: 3,
    rivals: ['loudoun-valley'],
    history: 'Western Loudoun clash with Loudoun Valley every fall; Catoctin runner-up in 2025.',
  },
];

function lighten(hex: string): boolean {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return 0.299 * r + 0.587 * g + 0.114 * b > 150;
}

function build(r: Raw): TeamInfo {
  const p = r.colors.primary;
  const s = r.colors.secondary;
  const primaryIsLight = lighten(p);
  return {
    ...r,
    logo: `assets/teams/${r.id}/logo.png`,
    helmet: `assets/teams/${r.id}/helmet.png`,
    helmetStyle: r.helmetStyle ?? { shell: p, stripe: s, facemask: primaryIsLight ? '#222222' : '#D8D8D8' },
    uniforms: {
      home: { jersey: p, numbers: primaryIsLight ? '#111111' : '#FFFFFF', pants: lighten(s) ? s : '#E8E8E8' },
      away: { jersey: r.awayJersey ?? '#F4F4F4', numbers: p === '#F4F4F4' ? s : p, pants: lighten(s) ? s : p },
    },
  };
}

export const LCPS_TEAMS: TeamInfo[] = RAW.map(build);

/** Out-of-county opponents used to fill schedules (17 is an odd number). Generic ratings, initials logos. */
const GUEST_RAW: Raw[] = [
  ['battlefield', 'Battlefield', 'Bobcats', 'BAT', 'Haymarket', '#0B1F45', '#C5B358'],
  ['patriot', 'Patriot', 'Pioneers', 'PAT', 'Nokesville', '#0B1F45', '#C8102E'],
  ['gainesville', 'Gainesville', 'Cardinals', 'GVL', 'Gainesville', '#C8102E', '#111111'],
  ['osbourn-park', 'Osbourn Park', 'Yellow Jackets', 'OP', 'Manassas', '#111111', '#FFD100'],
  ['fauquier', 'Fauquier', 'Falcons', 'FAU', 'Warrenton', '#C8102E', '#0B1F45'],
  ['kettle-run', 'Kettle Run', 'Cougars', 'KR', 'Nokesville', '#0B1F45', '#A7A9AC'],
  ['westfield', 'Westfield', 'Bulldogs', 'WST', 'Chantilly', '#00563F', '#C5B358'],
  ['centreville', 'Centreville', 'Wildcats', 'CEN', 'Clifton', '#0B1F45', '#C5B358'],
  ['madison', 'Madison', 'Warhawks', 'MAD', 'Vienna', '#0047AB', '#A7A9AC'],
  ['chantilly', 'Chantilly', 'Chargers', 'CHA', 'Chantilly', '#0B1F45', '#FFB81C'],
].map(([id, short, mascot, abbr, city, p, s]) => ({
  id, school: `${short} High School`, shortName: short, mascot, abbreviation: abbr, city,
  colors: { primary: p, secondary: s }, colorNames: '', stadium: `${short} Stadium`, district: 'Non-LCPS', founded: 0,
  offenseRating: 62, defenseRating: 62, specialTeamsRating: 60, prestige: 2, rivals: [],
  history: 'Out-of-county opponent.',
}));

export const GUEST_TEAMS: TeamInfo[] = GUEST_RAW.map(build);

export const ALL_TEAMS: TeamInfo[] = [...LCPS_TEAMS, ...GUEST_TEAMS];
const BY_ID = new Map(ALL_TEAMS.map((t) => [t.id, t]));
export const getTeam = (id: string): TeamInfo => {
  const t = BY_ID.get(id);
  if (!t) throw new Error(`Unknown team ${id}`);
  return t;
};
export const isLcps = (id: string) => LCPS_TEAMS.some((t) => t.id === id);

/** Real-world alignment (2025-26): Class 4 Region 4C = Catoctin + Dulles; Class 5 Region 5D = Potomac; Independence = Class 6. */
export const REGIONS: Record<string, { name: string; districts: string[] }> = {
  north: { name: 'Region 4C', districts: ['Catoctin', 'Dulles'] },
  south: { name: 'Region 5D / 6', districts: ['Potomac', 'Cedar Run'] },
};
export const regionOf = (t: TeamInfo): 'north' | 'south' => (REGIONS.north.districts.includes(t.district) ? 'north' : 'south');

export function programExpectation(t: { offenseRating: number; defenseRating: number; prestige: number }): string {
  const r = (t.offenseRating + t.defenseRating) / 2 + t.prestige * 2;
  if (r >= 88) return 'Powerhouse';
  if (r >= 80) return 'Championship Contender';
  if (r >= 72) return 'Playoff Contender';
  if (r >= 63) return 'Competitive';
  return 'Rebuild';
}

/** Rivalry pairs (high/medium confidence ones are real; others are same-town matchups). */
export function isRivalry(a: string, b: string): boolean {
  const ta = BY_ID.get(a);
  const tb = BY_ID.get(b);
  return !!(ta?.rivals.includes(b) || tb?.rivals.includes(a));
}

export const RIVALRY_NAMES: Record<string, string> = {
  'broad-run|stone-bridge': "Battle of the 'Burn",
  'loudoun-valley|woodgrove': 'Western Loudoun Clash',
  'loudoun-county|loudoun-valley': 'The Original Loudoun Rivalry',
  'briar-woods|stone-bridge': 'Ashburn Showdown',
  'heritage|loudoun-county': 'Leesburg Bragging Rights',
};
export function rivalryName(a: string, b: string): string {
  const k = [a, b].sort().join('|');
  return RIVALRY_NAMES[k] ?? 'Rivalry Game';
}

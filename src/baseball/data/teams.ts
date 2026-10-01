import type { TeamColors } from '../core/types';
import type { RosterData } from './rosters/format';
import * as ALE from './rosters/alEast';
import * as ALC from './rosters/alCentral';
import * as ALW from './rosters/alWest';
import * as NLE from './rosters/nlEast';
import * as NLC from './rosters/nlCentral';
import * as NLW from './rosters/nlWest';

export interface TeamMeta {
  id: string;
  city: string;
  name: string;
  league: 'AL' | 'NL';
  division: 'East' | 'Central' | 'West';
  colors: TeamColors;
  stadiumId: string;
  roster: RosterData;
}

const c = (primary: string, secondary: string, accent = '#ffffff', text = '#ffffff'): TeamColors => ({ primary, secondary, accent, text });

/** All 30 MLB clubs. Colors are approximate team colors used for uniforms, UI and stadium accents. */
export const TEAM_META: TeamMeta[] = [
  { id: 'BAL', city: 'Baltimore', name: 'Orioles', league: 'AL', division: 'East', colors: c('#DF4601', '#000000'), stadiumId: 'camden', roster: ALE.BAL },
  { id: 'BOS', city: 'Boston', name: 'Red Sox', league: 'AL', division: 'East', colors: c('#BD3039', '#0C2340'), stadiumId: 'fenway', roster: ALE.BOS },
  { id: 'NYY', city: 'New York', name: 'Yankees', league: 'AL', division: 'East', colors: c('#0C2340', '#C4CED3'), stadiumId: 'yankee', roster: ALE.NYY },
  { id: 'TB', city: 'Tampa Bay', name: 'Rays', league: 'AL', division: 'East', colors: c('#092C5C', '#8FBCE6', '#F5D130'), stadiumId: 'tropicana', roster: ALE.TB },
  { id: 'TOR', city: 'Toronto', name: 'Blue Jays', league: 'AL', division: 'East', colors: c('#134A8E', '#1D2D5C', '#E8291C'), stadiumId: 'rogers', roster: ALE.TOR },
  { id: 'CWS', city: 'Chicago', name: 'White Sox', league: 'AL', division: 'Central', colors: c('#27251F', '#C4CED4'), stadiumId: 'ratefield', roster: ALC.CWS },
  { id: 'CLE', city: 'Cleveland', name: 'Guardians', league: 'AL', division: 'Central', colors: c('#00385D', '#E50022'), stadiumId: 'progressive', roster: ALC.CLE },
  { id: 'DET', city: 'Detroit', name: 'Tigers', league: 'AL', division: 'Central', colors: c('#0C2340', '#FA4616'), stadiumId: 'comerica', roster: ALC.DET },
  { id: 'KC', city: 'Kansas City', name: 'Royals', league: 'AL', division: 'Central', colors: c('#004687', '#BD9B60'), stadiumId: 'kauffman', roster: ALC.KC },
  { id: 'MIN', city: 'Minnesota', name: 'Twins', league: 'AL', division: 'Central', colors: c('#002B5C', '#D31145', '#B9975B'), stadiumId: 'target', roster: ALC.MIN },
  { id: 'HOU', city: 'Houston', name: 'Astros', league: 'AL', division: 'West', colors: c('#002D62', '#EB6E1F'), stadiumId: 'daikin', roster: ALW.HOU },
  { id: 'LAA', city: 'Los Angeles', name: 'Angels', league: 'AL', division: 'West', colors: c('#BA0021', '#003263', '#C4CED4'), stadiumId: 'angel', roster: ALW.LAA },
  { id: 'ATH', city: 'Sacramento', name: 'Athletics', league: 'AL', division: 'West', colors: c('#003831', '#EFB21E'), stadiumId: 'sutter', roster: ALW.ATH },
  { id: 'SEA', city: 'Seattle', name: 'Mariners', league: 'AL', division: 'West', colors: c('#0C2C56', '#005C5C', '#C4CED4'), stadiumId: 'tmobile', roster: ALW.SEA },
  { id: 'TEX', city: 'Texas', name: 'Rangers', league: 'AL', division: 'West', colors: c('#003278', '#C0111F'), stadiumId: 'globelife', roster: ALW.TEX },
  { id: 'ATL', city: 'Atlanta', name: 'Braves', league: 'NL', division: 'East', colors: c('#13274F', '#CE1141'), stadiumId: 'truist', roster: NLE.ATL },
  { id: 'MIA', city: 'Miami', name: 'Marlins', league: 'NL', division: 'East', colors: c('#00A3E0', '#EF3340', '#000000'), stadiumId: 'loandepot', roster: NLE.MIA },
  { id: 'NYM', city: 'New York', name: 'Mets', league: 'NL', division: 'East', colors: c('#002D72', '#FF5910'), stadiumId: 'citi', roster: NLE.NYM },
  { id: 'PHI', city: 'Philadelphia', name: 'Phillies', league: 'NL', division: 'East', colors: c('#E81828', '#002D72'), stadiumId: 'cbp', roster: NLE.PHI },
  { id: 'WSH', city: 'Washington', name: 'Nationals', league: 'NL', division: 'East', colors: c('#AB0003', '#14225A'), stadiumId: 'natspark', roster: NLE.WSH },
  { id: 'CHC', city: 'Chicago', name: 'Cubs', league: 'NL', division: 'Central', colors: c('#0E3386', '#CC3433'), stadiumId: 'wrigley', roster: NLC.CHC },
  { id: 'CIN', city: 'Cincinnati', name: 'Reds', league: 'NL', division: 'Central', colors: c('#C6011F', '#000000'), stadiumId: 'gabp', roster: NLC.CIN },
  { id: 'MIL', city: 'Milwaukee', name: 'Brewers', league: 'NL', division: 'Central', colors: c('#12284B', '#FFC52F'), stadiumId: 'amfam', roster: NLC.MIL },
  { id: 'PIT', city: 'Pittsburgh', name: 'Pirates', league: 'NL', division: 'Central', colors: c('#27251F', '#FDB827'), stadiumId: 'pnc', roster: NLC.PIT },
  { id: 'STL', city: 'St. Louis', name: 'Cardinals', league: 'NL', division: 'Central', colors: c('#C41E3A', '#0C2340', '#FEDB00'), stadiumId: 'busch', roster: NLC.STL },
  { id: 'ARI', city: 'Arizona', name: 'Diamondbacks', league: 'NL', division: 'West', colors: c('#A71930', '#E3D4AD', '#30CED8'), stadiumId: 'chase', roster: NLW.ARI },
  { id: 'COL', city: 'Colorado', name: 'Rockies', league: 'NL', division: 'West', colors: c('#33006F', '#C4CED4'), stadiumId: 'coors', roster: NLW.COL },
  { id: 'LAD', city: 'Los Angeles', name: 'Dodgers', league: 'NL', division: 'West', colors: c('#005A9C', '#EF3E42'), stadiumId: 'dodger', roster: NLW.LAD },
  { id: 'SD', city: 'San Diego', name: 'Padres', league: 'NL', division: 'West', colors: c('#2F241D', '#FFC425'), stadiumId: 'petco', roster: NLW.SD },
  { id: 'SF', city: 'San Francisco', name: 'Giants', league: 'NL', division: 'West', colors: c('#FD5A1E', '#27251F', '#EFD19F'), stadiumId: 'oracle', roster: NLW.SF },
];

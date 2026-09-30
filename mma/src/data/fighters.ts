/**
 * FIGHTER DATABASE — hand-curated snapshot for a personal, non-commercial game.
 * Records/ages are approximate and may be out of date; edit freely.
 *
 * Attribute order in the compact arrays (all 1-99):
 *  [striking, power, speed, accuracy, defense, cardio, chin,
 *   wrestling, takedowns, takedownDefense, submissions, submissionDefense,
 *   clinch, groundControl, recovery]
 */
import { ARCHETYPES } from './archetypes';
import type { ArchetypeId, Attributes, FighterData, FighterRecord, Stance, Tendencies, WeightClassId } from './types';
import { WEIGHT_CLASS_BY_ID } from './weightClasses';

type A15 = [number, number, number, number, number, number, number, number, number, number, number, number, number, number, number];

function parseRecord(r: string): FighterRecord {
  const m = r.match(/(\d+)-(\d+)(?:-(\d+))?(?:\s*\((\d+)\s*NC\))?/);
  if (!m) throw new Error('bad record ' + r);
  return { w: +m[1], l: +m[2], d: m[3] ? +m[3] : 0, nc: m[4] ? +m[4] : 0 };
}

function attrs(a: A15): Attributes {
  const [striking, power, speed, accuracy, defense, cardio, chin, wrestling, takedowns, takedownDefense, submissions, submissionDefense, clinch, groundControl, recovery] = a;
  return { striking, power, speed, accuracy, defense, cardio, chin, wrestling, takedowns, takedownDefense, submissions, submissionDefense, clinch, groundControl, recovery };
}

const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');

interface Opt {
  sig?: string[];
  t?: Partial<Tendencies>;
  weight?: number;
  legend?: boolean;
}

const ROSTER: FighterData[] = [];

function F(
  wc: WeightClassId, name: string, nickname: string, country: string, birthYear: number,
  heightIn: number, reachIn: number, stance: Stance, record: string, archetype: ArchetypeId, a: A15, o: Opt = {},
) {
  const wcDef = WEIGHT_CLASS_BY_ID[wc];
  const base = ARCHETYPES[archetype].tendencies;
  ROSTER.push({
    id: slug(name), name, nickname, country, birthYear, heightIn, reachIn,
    weightLbs: o.weight ?? wcDef.limitLbs, stance, weightClass: wc, gender: wcDef.gender,
    record: parseRecord(record), archetype, attributes: attrs(a),
    signatureTechniques: o.sig ?? [],
    tendencies: { ...base, ...(stance === 'Switch' ? { switchStance: Math.max(base.switchStance, 0.5) } : {}), ...(o.t ?? {}) },
    legend: o.legend,
  });
}

// ============================ HEAVYWEIGHT ============================
F('HW', 'Tom Aspinall', '', 'England', 1993, 77, 78, 'Orthodox', '15-3', 'balanced', [89, 90, 93, 88, 82, 84, 85, 84, 78, 88, 86, 86, 78, 86, 86], { weight: 255, sig: ['jab', 'cross', 'kimura'], t: { pressure: 0.8, volume: 0.6, takedowns: 0.3 } });
F('HW', 'Jon Jones', 'Bones', 'USA', 1987, 76, 84.5, 'Orthodox', '28-1 (1 NC)', 'balanced', [88, 82, 80, 86, 88, 88, 90, 92, 85, 95, 82, 90, 95, 92, 88], { weight: 248, sig: ['frontKick', 'clinchElbow', 'gElbow', 'kimura'], t: { feints: 0.75, clinch: 0.55, kicks: 0.5, legKicks: 0.65, takedowns: 0.4, counter: 0.6, spinning: 0.2, switchStance: 0.4 } });
F('HW', 'Ciryl Gane', 'Bon Gamin', 'France', 1990, 76, 81, 'Orthodox', '13-2', 'kickboxer', [87, 78, 90, 84, 86, 86, 80, 55, 40, 76, 55, 70, 60, 55, 84], { weight: 247, sig: ['frontKick', 'leadLegKick', 'jab'], t: { movement: 0.85, switchStance: 0.5, feints: 0.6 } });
F('HW', 'Alexander Volkov', 'Drago', 'Russia', 1988, 79, 80, 'Orthodox', '38-11', 'kickboxer', [85, 82, 74, 85, 78, 80, 78, 55, 40, 78, 50, 68, 62, 60, 80], { weight: 255, sig: ['frontKick', 'cross', 'leadHeadKick'] });
F('HW', 'Sergei Pavlovich', '', 'Russia', 1992, 75, 84, 'Orthodox', '19-3', 'powerPuncher', [78, 96, 80, 74, 62, 70, 82, 50, 35, 72, 40, 60, 55, 55, 75], { weight: 260, sig: ['overhand', 'rearHook'], t: { pressure: 0.9, volume: 0.45 } });
F('HW', 'Curtis Blaydes', 'Razor', 'USA', 1991, 76, 80, 'Orthodox', '18-5 (1 NC)', 'groundAndPound', [70, 84, 72, 72, 70, 78, 72, 90, 92, 82, 55, 72, 72, 86, 76], { weight: 262, sig: ['gElbow', 'cross'] });
F('HW', 'Jailton Almeida', 'Malhadinho', 'Brazil', 1991, 75, 79, 'Orthodox', '22-3', 'chainWrestler', [60, 70, 74, 66, 66, 80, 76, 88, 90, 80, 90, 80, 78, 90, 76], { weight: 235, sig: ['rnc', 'armTriangle'], t: { submissionHunt: 0.8 } });
F('HW', 'Derrick Lewis', 'The Black Beast', 'USA', 1985, 75, 79, 'Orthodox', '28-12 (1 NC)', 'powerPuncher', [70, 99, 70, 70, 55, 58, 78, 55, 40, 68, 35, 55, 50, 50, 70], { weight: 265, sig: ['rearUppercut', 'overhand'], t: { volume: 0.2, counter: 0.7 } });
F('HW', 'Stipe Miocic', '', 'USA', 1982, 76, 80, 'Orthodox', '20-5', 'balanced', [84, 86, 76, 82, 78, 84, 84, 84, 78, 82, 60, 74, 80, 84, 82], { weight: 240, legend: true, sig: ['cross', 'gPunch'] });
F('HW', 'Daniel Cormier', 'DC', 'USA', 1979, 71, 72.5, 'Orthodox', '22-3 (1 NC)', 'wrestler', [80, 80, 76, 80, 76, 86, 88, 97, 92, 94, 65, 80, 90, 92, 84], { weight: 240, legend: true, sig: ['clinchPunch', 'rearUppercut'] });

// ======================== LIGHT HEAVYWEIGHT =========================
F('LHW', 'Alex Pereira', 'Poatan', 'Brazil', 1987, 76, 79, 'Orthodox', '13-3', 'kickboxer', [92, 98, 80, 88, 75, 74, 82, 45, 25, 72, 40, 60, 65, 50, 78], { sig: ['leadHook', 'calfKick', 'rearHeadKick'], t: { counter: 0.7, legKicks: 0.75, pressure: 0.65, volume: 0.45, movement: 0.4 } });
F('LHW', 'Magomed Ankalaev', '', 'Russia', 1992, 75, 75, 'Southpaw', '21-2-1', 'balanced', [85, 82, 76, 84, 86, 82, 86, 82, 74, 88, 60, 80, 82, 80, 80], { sig: ['rearLegKick', 'cross', 'rearBodyKick'], t: { counter: 0.6, takedowns: 0.3, volume: 0.45 } });
F('LHW', 'Jiri Prochazka', 'BJP', 'Czechia', 1992, 76, 80, 'Orthodox', '31-5-1', 'kickboxer', [86, 88, 84, 76, 58, 84, 80, 62, 50, 70, 76, 70, 60, 64, 82], { sig: ['spinningBackfist', 'rearHook', 'flyingKnee'], t: { pressure: 0.8, volume: 0.85, spinning: 0.3, switchStance: 0.4 } });
F('LHW', 'Jamahal Hill', 'Sweet Dreams', 'USA', 1991, 76, 79, 'Southpaw', '12-3 (1 NC)', 'counterStriker', [84, 86, 82, 82, 70, 74, 74, 55, 40, 70, 40, 58, 58, 55, 72], { sig: ['cross', 'leadHook'] });
F('LHW', 'Carlos Ulberg', 'Black Jag', 'New Zealand', 1990, 76, 77, 'Orthodox', '13-1', 'kickboxer', [86, 86, 88, 84, 76, 74, 76, 50, 35, 72, 40, 60, 58, 50, 76], { sig: ['cross', 'leadHook'] });
F('LHW', 'Khalil Rountree Jr.', 'The War Horse', 'USA', 1990, 73, 76.5, 'Southpaw', '13-6 (1 NC)', 'muayThai', [82, 88, 76, 80, 68, 72, 78, 45, 25, 66, 35, 55, 62, 48, 74], { sig: ['rearLegKick', 'rearBodyKick', 'cross'] });
F('LHW', 'Jan Blachowicz', 'Legendary Polish Power', 'Poland', 1983, 74, 78, 'Orthodox', '29-10-1', 'powerPuncher', [80, 86, 68, 80, 76, 72, 84, 70, 55, 76, 72, 74, 74, 72, 74], { sig: ['leadHook', 'rearLegKick', 'armTriangle'] });
F('LHW', 'Aleksandar Rakic', 'Rocket', 'Austria', 1992, 76, 78, 'Orthodox', '14-4', 'kickboxer', [82, 82, 78, 80, 74, 74, 78, 65, 50, 78, 40, 66, 64, 62, 74], { sig: ['rearHeadKick', 'rearLegKick'] });

// ============================ MIDDLEWEIGHT ==========================
F('MW', 'Khamzat Chimaev', 'Borz', 'UAE', 1994, 74, 75, 'Orthodox', '15-0', 'chainWrestler', [80, 90, 82, 80, 72, 80, 82, 97, 97, 90, 84, 82, 90, 97, 78], { sig: ['rnc', 'armTriangle', 'gPunch'], t: { pressure: 0.95 } });
F('MW', 'Dricus du Plessis', 'Stillknocks', 'South Africa', 1994, 73, 76, 'Southpaw', '23-3', 'balanced', [80, 84, 72, 74, 66, 95, 86, 82, 76, 74, 78, 76, 82, 82, 90], { sig: ['cross', 'rnc'], t: { pressure: 0.95, volume: 0.8, takedowns: 0.45, clinch: 0.5, counter: 0.25 } });
F('MW', 'Israel Adesanya', 'The Last Stylebender', 'New Zealand', 1989, 76, 80, 'Switch', '24-5', 'counterStriker', [95, 80, 90, 92, 90, 80, 72, 40, 25, 80, 40, 62, 58, 45, 76], { sig: ['leadLegKick', 'leadHook', 'frontKick'], t: { feints: 0.95, switchStance: 0.6, legKicks: 0.7, kicks: 0.45 } });
F('MW', 'Sean Strickland', 'Tarzan', 'USA', 1991, 73, 76, 'Orthodox', '29-7', 'pressureBoxer', [84, 62, 76, 86, 86, 92, 88, 70, 40, 88, 55, 78, 68, 66, 82], { sig: ['jab', 'frontKick'], t: { pressure: 0.85, volume: 0.9, kicks: 0.1, takedowns: 0.05 } });
F('MW', 'Robert Whittaker', 'The Reaper', 'Australia', 1990, 72, 73.5, 'Orthodox', '26-9', 'balanced', [88, 82, 90, 82, 82, 86, 80, 72, 50, 86, 60, 74, 66, 66, 82], { sig: ['overhand', 'leadHook', 'rearHeadKick'], t: { movement: 0.7, counter: 0.5, takedowns: 0.12 } });
F('MW', 'Nassourdine Imavov', '', 'France', 1995, 75, 75, 'Orthodox', '16-4 (1 NC)', 'counterStriker', [84, 78, 80, 86, 82, 82, 80, 72, 58, 82, 60, 72, 70, 70, 80], { sig: ['jab', 'cross'] });
F('MW', 'Reinier de Ridder', 'The Dutch Knight', 'Netherlands', 1990, 76, 78.5, 'Southpaw', '20-2', 'bjj', [62, 62, 66, 64, 66, 80, 80, 78, 70, 76, 90, 84, 86, 86, 78], { sig: ['armTriangle', 'clinchKneeBody', 'armbar'], t: { clinch: 0.75 } });
F('MW', 'Caio Borralho', 'The Natural', 'Brazil', 1993, 74, 75, 'Southpaw', '17-2 (1 NC)', 'balanced', [80, 74, 80, 82, 82, 82, 82, 82, 72, 84, 76, 78, 74, 78, 80], { sig: ['leadLegKick', 'cross'] });
F('MW', 'Paulo Costa', 'Borrachinha', 'Brazil', 1991, 73, 72, 'Orthodox', '14-4', 'powerPuncher', [80, 90, 74, 76, 64, 68, 86, 55, 40, 70, 45, 60, 60, 55, 72], { sig: ['rearBodyKick', 'rearHook'], t: { pressure: 0.8, bodyWork: 0.35 } });
F('MW', 'Brendan Allen', 'All In', 'USA', 1995, 74, 75, 'Orthodox', '25-6', 'submissionHunter', [74, 68, 74, 72, 68, 82, 78, 70, 62, 70, 88, 76, 72, 78, 78], { sig: ['rnc', 'armbar'] });
F('MW', 'Anthony Hernandez', 'Fluffy', 'USA', 1993, 72, 75, 'Orthodox', '14-2', 'chainWrestler', [74, 70, 74, 72, 66, 95, 80, 86, 84, 72, 74, 72, 80, 84, 86], { sig: ['rnc'], t: { pressure: 0.95, volume: 0.9 } });
F('MW', 'Anderson Silva', 'The Spider', 'Brazil', 1975, 74, 77.5, 'Southpaw', '34-11 (1 NC)', 'counterStriker', [96, 84, 90, 94, 90, 74, 80, 50, 40, 74, 60, 62, 80, 55, 78], { legend: true, sig: ['frontKick', 'clinchKneeHead', 'cross'], t: { counter: 0.95, feints: 0.85, clinch: 0.35 } });

// ============================ WELTERWEIGHT ==========================
F('WW', 'Jack Della Maddalena', 'JDM', 'Australia', 1996, 71, 73, 'Orthodox', '18-2', 'pressureBoxer', [90, 84, 86, 90, 80, 86, 82, 55, 35, 84, 50, 70, 66, 58, 82], { sig: ['jab', 'leadHook', 'bodyCross'], t: { bodyWork: 0.45, switchStance: 0.3, pressure: 0.75 } });
F('WW', 'Belal Muhammad', 'Remember the Name', 'USA', 1988, 70, 72, 'Orthodox', '24-4 (1 NC)', 'chainWrestler', [78, 66, 74, 78, 80, 96, 86, 86, 84, 80, 62, 80, 84, 82, 86], { sig: ['jab'], t: { pressure: 0.85, volume: 0.8, takedowns: 0.7 } });
F('WW', 'Leon Edwards', 'Rocky', 'England', 1991, 72, 74, 'Southpaw', '22-5 (1 NC)', 'balanced', [86, 80, 80, 86, 86, 84, 82, 74, 60, 86, 60, 78, 70, 70, 82], { sig: ['rearHeadKick', 'cross', 'rearBodyKick'], t: { counter: 0.6, takedowns: 0.18 } });
F('WW', 'Kamaru Usman', 'The Nigerian Nightmare', 'Nigeria', 1987, 72, 76, 'Orthodox', '20-4', 'wrestler', [82, 84, 72, 82, 80, 90, 86, 94, 90, 92, 55, 76, 94, 86, 84], { sig: ['cross', 'clinchKneeBody'], t: { clinch: 0.75, pressure: 0.8 } });
F('WW', 'Shavkat Rakhmonov', 'Nomad', 'Kazakhstan', 1994, 73, 77, 'Orthodox', '19-0', 'balanced', [86, 86, 82, 84, 80, 82, 84, 82, 74, 82, 88, 84, 76, 82, 82], { sig: ['rearHeadKick', 'guillotine', 'rnc'], t: { submissionHunt: 0.7, pressure: 0.7 } });
F('WW', 'Ian Machado Garry', 'The Future', 'Ireland', 1997, 75, 74, 'Orthodox', '16-1', 'counterStriker', [86, 76, 86, 86, 82, 82, 80, 62, 44, 78, 55, 70, 62, 58, 80], { sig: ['jab', 'rearLegKick', 'cross'], t: { movement: 0.85 } });
F('WW', 'Sean Brady', '', 'USA', 1992, 70, 72, 'Orthodox', '18-2', 'bjj', [74, 66, 72, 74, 76, 84, 82, 84, 78, 80, 86, 82, 82, 86, 80], { sig: ['armTriangle', 'rnc'], t: { takedowns: 0.6 } });
F('WW', 'Colby Covington', 'Chaos', 'USA', 1988, 71, 72, 'Orthodox', '17-5', 'chainWrestler', [76, 64, 78, 74, 72, 98, 76, 90, 86, 82, 56, 76, 80, 80, 86], { t: { volume: 0.95 } });
F('WW', 'Gilbert Burns', 'Durinho', 'Brazil', 1986, 70, 71, 'Orthodox', '22-9', 'bjj', [78, 84, 76, 76, 66, 74, 74, 80, 72, 72, 90, 82, 70, 82, 74], { sig: ['overhand', 'armbar'] });
F('WW', 'Joaquin Buckley', 'New Mansa', 'USA', 1994, 70, 76, 'Southpaw', '21-7', 'powerPuncher', [80, 94, 82, 76, 66, 78, 78, 68, 55, 66, 40, 58, 58, 60, 76], { sig: ['cross', 'rearHeadKick', 'spinningBackKick'], t: { spinning: 0.2 } });
F('WW', 'Carlos Prates', 'The Nightmare', 'Brazil', 1993, 73, 78, 'Switch', '22-7', 'muayThai', [86, 90, 80, 86, 70, 74, 76, 50, 30, 68, 55, 60, 72, 50, 76], { sig: ['stepKnee', 'cross', 'clinchKneeHead'] });
F('WW', 'Michael Morales', '', 'Ecuador', 1999, 72, 79, 'Orthodox', '18-0', 'kickboxer', [86, 88, 82, 84, 80, 80, 80, 62, 45, 78, 55, 66, 64, 60, 78], { sig: ['cross', 'leadHook', 'rearHeadKick'] });
F('WW', 'Georges St-Pierre', 'Rush', 'Canada', 1981, 70, 76, 'Orthodox', '26-2', 'wrestler', [88, 78, 86, 88, 86, 92, 82, 96, 95, 92, 70, 86, 88, 90, 86], { legend: true, sig: ['jab', 'supermanPunch', 'gElbow'], t: { takedowns: 0.7, movement: 0.65, feints: 0.7 } });

// ============================ LIGHTWEIGHT ===========================
F('LW', 'Islam Makhachev', '', 'Russia', 1991, 70, 70.5, 'Southpaw', '27-1', 'sambo', [86, 80, 82, 88, 86, 90, 84, 94, 92, 92, 94, 90, 92, 95, 86], { sig: ['armTriangle', 'kimura', 'leadHeadKick'], t: { counter: 0.5, takedowns: 0.7 } });
F('LW', 'Ilia Topuria', 'El Matador', 'Spain', 1997, 67, 69, 'Orthodox', '17-0', 'pressureBoxer', [92, 95, 86, 92, 82, 84, 90, 82, 72, 84, 82, 82, 76, 80, 84], { sig: ['leadHook', 'rearBodyHook', 'cross'], t: { pressure: 0.9, counter: 0.55, takedowns: 0.15, bodyWork: 0.45 } });
F('LW', 'Charles Oliveira', 'Do Bronx', 'Brazil', 1989, 70, 74, 'Orthodox', '36-11 (1 NC)', 'submissionHunter', [84, 82, 78, 78, 62, 84, 70, 72, 66, 62, 99, 86, 82, 86, 80], { sig: ['rnc', 'guillotine', 'stepKnee'], t: { pressure: 0.75 } });
F('LW', 'Justin Gaethje', 'The Highlight', 'USA', 1988, 71, 70, 'Orthodox', '26-5', 'pressureBoxer', [86, 92, 80, 82, 62, 84, 82, 70, 20, 90, 35, 70, 64, 55, 80], { sig: ['rearLegKick', 'rearHook', 'rearUppercut'], t: { legKicks: 0.9, kicks: 0.3, pressure: 0.92, takedowns: 0, counter: 0.3 } });
F('LW', 'Dustin Poirier', 'The Diamond', 'USA', 1989, 69, 72, 'Southpaw', '30-10 (1 NC)', 'pressureBoxer', [90, 86, 82, 86, 72, 84, 82, 68, 50, 74, 78, 76, 72, 70, 82], { sig: ['leadHook', 'cross', 'guillotine'], t: { pressure: 0.75, counter: 0.4 } });
F('LW', 'Max Holloway', 'Blessed', 'USA', 1991, 71, 69, 'Orthodox', '27-8', 'pressureBoxer', [93, 78, 86, 90, 84, 99, 97, 62, 40, 84, 60, 74, 62, 60, 92], { sig: ['jab', 'bodyJab', 'leadHook'], t: { volume: 0.99, pressure: 0.8, bodyWork: 0.45, takedowns: 0.02, kicks: 0.2 } });
F('LW', 'Arman Tsarukyan', 'Ahalkalakets', 'Armenia', 1996, 67, 72, 'Orthodox', '22-3', 'wrestler', [84, 82, 86, 82, 78, 86, 82, 90, 88, 86, 70, 82, 82, 88, 84], { sig: ['rearHeadKick', 'gPunch'], t: { kicks: 0.3 } });
F('LW', 'Mateusz Gamrot', 'Gamer', 'Poland', 1990, 70, 70, 'Orthodox', '25-4 (1 NC)', 'chainWrestler', [76, 70, 82, 74, 72, 94, 82, 90, 90, 80, 70, 76, 78, 84, 86]);
F('LW', 'Paddy Pimblett', 'The Baddy', 'England', 1995, 70, 73, 'Orthodox', '23-3', 'submissionHunter', [76, 74, 74, 72, 58, 86, 84, 70, 66, 60, 88, 78, 68, 84, 82], { sig: ['rnc', 'cross'] });
F('LW', 'Dan Hooker', 'The Hangman', 'New Zealand', 1990, 72, 75, 'Orthodox', '24-12', 'kickboxer', [82, 80, 78, 80, 70, 86, 76, 62, 45, 70, 68, 70, 72, 62, 80], { sig: ['stepKnee', 'cross', 'rearLegKick'] });
F('LW', 'Michael Chandler', 'Iron', 'USA', 1986, 68, 71, 'Orthodox', '23-10', 'powerPuncher', [80, 90, 84, 76, 62, 76, 76, 84, 78, 76, 58, 70, 66, 74, 76], { sig: ['overhand', 'rearHook'], t: { pressure: 0.9, takedowns: 0.3 } });
F('LW', 'Beneil Dariush', '', 'USA', 1989, 70, 72, 'Southpaw', '22-6-1', 'bjj', [78, 78, 74, 78, 74, 80, 72, 78, 72, 76, 86, 82, 76, 82, 76], { sig: ['kimura', 'rnc', 'leadHook'] });
F('LW', 'Renato Moicano', 'Money', 'Brazil', 1989, 71, 72, 'Orthodox', '20-7-1', 'bjj', [80, 68, 76, 80, 70, 84, 72, 72, 65, 70, 84, 76, 70, 78, 78], { sig: ['rnc', 'jab'] });
F('LW', 'Rafael Fiziev', 'Ataman', 'Azerbaijan', 1993, 68, 71, 'Orthodox', '12-4', 'muayThai', [90, 84, 90, 86, 80, 78, 74, 50, 30, 74, 40, 60, 70, 50, 76], { sig: ['spinningBackKick', 'rearLegKick', 'leadHook'], t: { spinning: 0.3 } });
F('LW', 'Conor McGregor', 'The Notorious', 'Ireland', 1988, 69, 74, 'Southpaw', '22-6', 'counterStriker', [90, 92, 84, 92, 74, 64, 78, 55, 40, 70, 45, 58, 58, 50, 70], { sig: ['cross', 'spinningBackKick', 'frontKick'], t: { counter: 0.8, feints: 0.6, spinning: 0.2, pressure: 0.6 } });
F('LW', 'Khabib Nurmagomedov', 'The Eagle', 'Russia', 1988, 70, 70, 'Orthodox', '29-0', 'chainWrestler', [76, 74, 76, 78, 78, 97, 86, 99, 97, 95, 86, 88, 95, 99, 88], { legend: true, sig: ['gPunch', 'rnc'], t: { pressure: 0.95, groundPound: 0.8 } });

// =========================== FEATHERWEIGHT ==========================
F('FW', 'Alexander Volkanovski', 'The Great', 'Australia', 1988, 66, 71.5, 'Orthodox', '27-4', 'balanced', [92, 80, 86, 92, 88, 94, 82, 84, 74, 90, 62, 80, 82, 78, 86], { sig: ['rearLegKick', 'jab', 'leadHook'], t: { pressure: 0.7, volume: 0.8, feints: 0.75, legKicks: 0.65 } });
F('FW', 'Diego Lopes', '', 'Brazil', 1994, 71, 72, 'Orthodox', '26-7', 'submissionHunter', [82, 86, 82, 76, 64, 80, 84, 62, 50, 66, 86, 76, 70, 76, 78], { sig: ['spinningBackKick', 'armbar', 'rearHook'], t: { spinning: 0.35 } });
F('FW', 'Movsar Evloev', '', 'Russia', 1994, 67, 72, 'Orthodox', '19-0', 'chainWrestler', [80, 68, 78, 80, 82, 90, 82, 90, 88, 88, 66, 82, 86, 88, 84]);
F('FW', 'Yair Rodriguez', 'El Pantera', 'Mexico', 1992, 71, 71, 'Orthodox', '16-5 (1 NC)', 'kickboxer', [86, 80, 88, 80, 72, 80, 74, 55, 40, 66, 62, 66, 58, 56, 76], { sig: ['spinningBackKick', 'rearHeadKick', 'flyingKnee'], t: { spinning: 0.5, kicks: 0.6 } });
F('FW', 'Brian Ortega', 'T-City', 'USA', 1991, 68, 69, 'Orthodox', '16-4 (1 NC)', 'bjj', [76, 74, 72, 74, 66, 82, 86, 62, 55, 66, 94, 86, 72, 80, 78], { sig: ['guillotine', 'triangle'] });
F('FW', 'Arnold Allen', 'Almighty', 'England', 1994, 68, 70, 'Southpaw', '19-3', 'balanced', [82, 78, 80, 82, 78, 80, 80, 74, 66, 78, 66, 74, 70, 70, 78]);
F('FW', 'Lerone Murphy', 'The Miracle', 'England', 1991, 69, 73, 'Orthodox', '17-0-1', 'balanced', [84, 78, 84, 84, 86, 84, 82, 72, 62, 80, 60, 74, 70, 72, 80], { t: { counter: 0.6 } });
F('FW', 'Jean Silva', 'Lord', 'Brazil', 1997, 68, 70, 'Orthodox', '16-3', 'pressureBoxer', [84, 88, 80, 80, 58, 80, 82, 55, 40, 64, 62, 62, 70, 58, 78], { sig: ['rearHook', 'clinchElbow'], t: { pressure: 0.95 } });
F('FW', 'Aljamain Sterling', 'Funk Master', 'USA', 1989, 67, 71, 'Orthodox', '25-5', 'chainWrestler', [78, 64, 80, 76, 76, 86, 80, 86, 82, 78, 86, 82, 82, 86, 82], { sig: ['rnc'], t: { submissionHunt: 0.6 } });
F('FW', 'Jose Aldo', 'Junior', 'Brazil', 1986, 67, 70, 'Orthodox', '32-8', 'counterStriker', [90, 82, 86, 88, 90, 84, 86, 70, 50, 94, 55, 78, 70, 66, 82], { legend: true, sig: ['rearLegKick', 'leadBodyHook'], t: { legKicks: 0.85, bodyWork: 0.4 } });
F('FW', 'Josh Emmett', '', 'USA', 1985, 66, 70, 'Orthodox', '19-5', 'powerPuncher', [76, 92, 78, 74, 66, 74, 82, 70, 60, 72, 40, 62, 62, 62, 72], { sig: ['overhand'] });
F('FW', 'Bryce Mitchell', 'Thug Nasty', 'USA', 1994, 70, 70, 'Southpaw', '17-3', 'bjj', [60, 58, 72, 62, 60, 82, 78, 80, 76, 70, 88, 76, 74, 86, 78], { sig: ['armTriangle'] });

// =========================== BANTAMWEIGHT ===========================
F('BW', 'Merab Dvalishvili', 'The Machine', 'Georgia', 1991, 66, 68, 'Orthodox', '20-4', 'chainWrestler', [80, 62, 82, 76, 80, 99, 86, 92, 96, 84, 58, 80, 84, 84, 95], { sig: ['jab'], t: { volume: 0.95, pressure: 0.95, takedowns: 0.95, submissionHunt: 0.1 } });
F('BW', "Sean O'Malley", 'Suga', 'USA', 1994, 71, 72, 'Switch', '18-3', 'counterStriker', [94, 82, 90, 94, 82, 78, 76, 55, 30, 70, 50, 66, 55, 55, 78], { sig: ['cross', 'spinningBackKick', 'frontKick'], t: { switchStance: 0.7, feints: 0.7 } });
F('BW', 'Petr Yan', 'No Mercy', 'Russia', 1993, 67, 67, 'Switch', '19-5', 'pressureBoxer', [92, 84, 84, 90, 86, 88, 86, 78, 68, 84, 55, 76, 78, 76, 86], { sig: ['rearBodyHook', 'leadHook', 'cross'], t: { switchStance: 0.6, takedowns: 0.2 } });
F('BW', 'Umar Nurmagomedov', '', 'Russia', 1996, 68, 69, 'Orthodox', '18-1', 'sambo', [86, 74, 84, 86, 84, 84, 80, 90, 86, 86, 80, 84, 82, 88, 82], { sig: ['leadBodyKick'], t: { kicks: 0.4 } });
F('BW', 'Cory Sandhagen', 'The Sandman', 'USA', 1992, 71, 70, 'Switch', '18-5', 'kickboxer', [88, 76, 88, 84, 76, 86, 78, 62, 56, 72, 60, 70, 60, 62, 82], { sig: ['spinningBackKick', 'flyingKnee', 'stepKnee'], t: { spinning: 0.45, switchStance: 0.7 } });
F('BW', 'Deiveson Figueiredo', 'Deus da Guerra', 'Brazil', 1987, 65, 68, 'Orthodox', '24-4-1', 'powerPuncher', [80, 88, 80, 78, 66, 76, 80, 70, 60, 70, 84, 72, 74, 76, 72], { sig: ['guillotine', 'overhand'], t: { submissionHunt: 0.6 } });
F('BW', 'Song Yadong', 'The Kung Fu Kid', 'China', 1997, 68, 67, 'Orthodox', '22-8-1', 'powerPuncher', [84, 86, 84, 82, 72, 78, 82, 60, 45, 74, 50, 66, 62, 58, 78], { sig: ['rearHook', 'cross'] });
F('BW', 'Henry Cejudo', 'Triple C', 'USA', 1987, 64, 64, 'Orthodox', '16-5', 'wrestler', [80, 72, 84, 78, 78, 82, 76, 95, 86, 86, 55, 74, 82, 80, 78], { sig: ['leadLegKick'] });
F('BW', 'Marlon Vera', 'Chito', 'Ecuador', 1992, 68, 70.5, 'Switch', '23-10-1', 'counterStriker', [82, 80, 76, 76, 68, 84, 86, 55, 40, 70, 76, 72, 64, 62, 82], { sig: ['frontKick', 'rearHeadKick'] });
F('BW', 'Mario Bautista', '', 'USA', 1993, 69, 69, 'Orthodox', '15-2', 'balanced', [80, 74, 80, 80, 76, 86, 78, 74, 64, 76, 78, 76, 70, 72, 80]);
F('BW', 'Aiemann Zahabi', '', 'Canada', 1987, 68, 69, 'Orthodox', '13-2', 'counterStriker', [86, 76, 80, 88, 84, 80, 80, 62, 45, 76, 55, 68, 62, 58, 78], { sig: ['jab', 'cross'], t: { kicks: 0.1 } });
F('BW', 'Dominick Cruz', 'The Dominator', 'USA', 1985, 68, 68, 'Orthodox', '24-4', 'counterStriker', [86, 64, 92, 82, 92, 86, 78, 82, 78, 86, 55, 76, 70, 72, 82], { legend: true, t: { movement: 0.95, feints: 0.8, takedowns: 0.3, switchStance: 0.5 } });

// ============================= FLYWEIGHT ============================
F('FLW', 'Alexandre Pantoja', 'The Cannibal', 'Brazil', 1990, 65, 67, 'Orthodox', '29-5', 'submissionHunter', [80, 74, 82, 78, 72, 88, 84, 80, 74, 76, 92, 82, 78, 86, 84], { sig: ['rnc', 'overhand'] });
F('FLW', 'Joshua Van', 'The Fearless', 'Myanmar', 2001, 65, 65, 'Orthodox', '16-2', 'pressureBoxer', [88, 78, 86, 86, 76, 88, 82, 62, 50, 78, 55, 70, 62, 58, 84], { sig: ['jab', 'cross'], t: { volume: 0.9 } });
F('FLW', 'Brandon Royval', 'Raw Dawg', 'USA', 1992, 69, 68, 'Southpaw', '17-8', 'submissionHunter', [80, 74, 80, 74, 58, 86, 74, 62, 55, 62, 84, 70, 64, 70, 80], { sig: ['flyingKnee', 'guillotine'] });
F('FLW', 'Brandon Moreno', 'The Assassin Baby', 'Mexico', 1993, 67, 70, 'Orthodox', '23-8-2', 'balanced', [84, 74, 82, 82, 80, 86, 86, 70, 60, 78, 82, 80, 70, 76, 84]);
F('FLW', 'Kai Kara-France', "Don't Blink", 'New Zealand', 1993, 64, 67, 'Orthodox', '25-12 (1 NC)', 'powerPuncher', [84, 86, 86, 82, 74, 80, 76, 62, 40, 78, 45, 64, 58, 56, 78]);
F('FLW', 'Manel Kape', 'StarBoy', 'Portugal', 1993, 65, 68, 'Orthodox', '21-7', 'counterStriker', [86, 84, 88, 84, 78, 78, 80, 58, 45, 74, 60, 66, 58, 58, 78]);
F('FLW', 'Tatsuro Taira', '', 'Japan', 2000, 67, 70, 'Orthodox', '17-1', 'bjj', [76, 64, 78, 76, 74, 84, 78, 82, 80, 74, 88, 80, 78, 86, 80], { sig: ['rnc', 'armTriangle'], t: { takedowns: 0.65 } });
F('FLW', 'Amir Albazi', 'The Prince', 'Iraq', 1994, 66, 68, 'Orthodox', '17-2', 'submissionHunter', [80, 74, 78, 80, 74, 80, 78, 72, 64, 74, 86, 78, 70, 78, 78]);

// ======================= WOMEN'S BANTAMWEIGHT =======================
F('WBW', 'Kayla Harrison', '', 'USA', 1990, 68, 66, 'Orthodox', '19-1', 'groundAndPound', [70, 78, 72, 70, 70, 82, 84, 95, 90, 90, 82, 84, 96, 92, 80], { sig: ['armTriangle', 'gElbow'], t: { clinch: 0.8 } });
F('WBW', 'Amanda Nunes', 'The Lioness', 'Brazil', 1988, 68, 69, 'Orthodox', '23-5', 'balanced', [90, 94, 84, 86, 78, 78, 86, 84, 78, 84, 84, 82, 82, 86, 80], { legend: true, sig: ['rearHook', 'rearHeadKick', 'rnc'], t: { pressure: 0.8 } });
F('WBW', 'Julianna Pena', 'The Venezuelan Vixen', 'USA', 1989, 66, 69, 'Orthodox', '12-6', 'bjj', [70, 68, 70, 66, 60, 82, 82, 74, 70, 64, 82, 74, 76, 78, 78], { sig: ['rnc'] });
F('WBW', 'Raquel Pennington', 'Rocky', 'USA', 1988, 67, 67, 'Orthodox', '16-10', 'pressureBoxer', [80, 64, 74, 80, 78, 86, 86, 70, 62, 78, 55, 74, 76, 72, 80]);
F('WBW', 'Ketlen Vieira', 'Fenomeno', 'Brazil', 1991, 68, 68, 'Orthodox', '14-4', 'bjj', [72, 74, 72, 72, 70, 80, 82, 72, 66, 74, 84, 78, 74, 78, 76]);
F('WBW', 'Norma Dumont', '', 'Brazil', 1990, 67, 67, 'Orthodox', '12-2', 'counterStriker', [80, 72, 78, 82, 80, 80, 80, 62, 50, 76, 55, 70, 64, 62, 78]);
F('WBW', 'Holly Holm', "The Preacher's Daughter", 'USA', 1981, 68, 69, 'Southpaw', '15-7', 'kickboxer', [88, 76, 82, 84, 82, 82, 78, 72, 55, 86, 50, 74, 76, 66, 78], { legend: true, sig: ['rearHeadKick', 'cross'] });
F('WBW', 'Irene Aldana', '', 'Mexico', 1988, 69, 68, 'Orthodox', '15-8', 'powerPuncher', [84, 80, 74, 82, 70, 76, 80, 55, 40, 72, 50, 64, 60, 56, 74], { sig: ['leadHook'] });

// ======================== WOMEN'S FLYWEIGHT =========================
F('WFLW', 'Valentina Shevchenko', 'Bullet', 'Kyrgyzstan', 1988, 65, 66, 'Southpaw', '25-4-1', 'balanced', [92, 80, 86, 92, 90, 88, 84, 84, 80, 90, 78, 86, 86, 86, 84], { sig: ['spinningBackfist', 'rearHeadKick'], t: { counter: 0.75 } });
F('WFLW', 'Manon Fiorot', 'The Beast', 'France', 1990, 67, 65, 'Orthodox', '12-1', 'kickboxer', [86, 78, 84, 86, 84, 86, 82, 70, 58, 82, 55, 72, 70, 66, 82]);
F('WFLW', 'Alexa Grasso', '', 'Mexico', 1993, 65, 66, 'Orthodox', '16-5-1', 'counterStriker', [88, 78, 82, 88, 76, 84, 80, 62, 50, 74, 84, 74, 64, 70, 80], { sig: ['cross', 'rnc'] });
F('WFLW', 'Erin Blanchfield', 'Cold Blooded', 'USA', 1999, 64, 66, 'Orthodox', '13-2', 'chainWrestler', [72, 62, 76, 72, 72, 86, 80, 84, 82, 76, 88, 80, 82, 84, 82], { t: { submissionHunt: 0.7 } });
F('WFLW', 'Natalia Silva', '', 'Brazil', 1997, 64, 64, 'Orthodox', '19-5-1', 'kickboxer', [86, 72, 88, 86, 86, 84, 80, 70, 56, 80, 70, 74, 62, 66, 82]);
F('WFLW', 'Rose Namajunas', 'Thug', 'USA', 1992, 65, 65, 'Orthodox', '13-7', 'counterStriker', [86, 76, 86, 84, 80, 82, 76, 74, 62, 74, 74, 74, 68, 70, 80], { sig: ['rearHeadKick', 'armbar'] });
F('WFLW', 'Maycee Barber', 'The Future', 'USA', 1998, 65, 65, 'Orthodox', '14-2', 'pressureBoxer', [78, 76, 78, 74, 64, 86, 80, 74, 68, 68, 62, 68, 76, 74, 80]);
F('WFLW', 'Tracy Cortez', '', 'USA', 1994, 65, 65, 'Orthodox', '12-1', 'wrestler', [74, 62, 76, 74, 76, 84, 78, 82, 76, 78, 66, 74, 74, 76, 80]);

// ======================= WOMEN'S STRAWWEIGHT ========================
F('WSW', 'Zhang Weili', 'Magnum', 'China', 1990, 64, 63, 'Switch', '26-3', 'balanced', [88, 84, 86, 84, 80, 88, 82, 82, 78, 82, 76, 78, 86, 80, 84], { sig: ['spinningBackfist', 'clinchKneeBody'], t: { pressure: 0.8, takedowns: 0.45 } });
F('WSW', 'Tatiana Suarez', '', 'USA', 1990, 65, 66, 'Orthodox', '11-1', 'chainWrestler', [70, 64, 74, 70, 70, 84, 78, 94, 92, 86, 76, 80, 84, 88, 80]);
F('WSW', 'Mackenzie Dern', '', 'USA', 1993, 64, 63, 'Orthodox', '15-5', 'bjj', [66, 70, 68, 62, 56, 76, 78, 62, 55, 60, 96, 86, 64, 84, 74], { sig: ['armbar', 'triangle', 'rnc'] });
F('WSW', 'Virna Jandiroba', 'Carcara', 'Brazil', 1988, 63, 64, 'Orthodox', '21-3', 'bjj', [70, 62, 72, 72, 70, 84, 80, 80, 74, 76, 90, 86, 76, 86, 80]);
F('WSW', 'Yan Xiaonan', 'Fury', 'China', 1989, 65, 63, 'Orthodox', '19-5 (1 NC)', 'pressureBoxer', [86, 78, 80, 84, 76, 82, 82, 55, 40, 82, 45, 66, 62, 55, 80]);
F('WSW', 'Jessica Andrade', 'Bate Estaca', 'Brazil', 1991, 61, 62, 'Orthodox', '26-13', 'powerPuncher', [82, 88, 76, 78, 64, 80, 82, 76, 70, 70, 72, 70, 74, 72, 78], { t: { pressure: 0.95, bodyWork: 0.4 } });
F('WSW', 'Amanda Lemos', '', 'Brazil', 1987, 64, 65, 'Southpaw', '15-4-1', 'powerPuncher', [80, 86, 76, 78, 70, 76, 80, 60, 50, 70, 80, 70, 64, 66, 74], { sig: ['guillotine', 'cross'] });
F('WSW', 'Loopy Godinez', '', 'Mexico', 1993, 62, 62, 'Orthodox', '13-4', 'wrestler', [74, 66, 76, 74, 70, 86, 78, 80, 76, 72, 68, 72, 74, 76, 82]);

export const FIGHTERS: FighterData[] = ROSTER;
export const FIGHTER_BY_ID: Record<string, FighterData> = Object.fromEntries(ROSTER.map((f) => [f.id, f]));

export const COUNTRY_CODES: Record<string, string> = {
  USA: 'USA', England: 'ENG', France: 'FRA', Russia: 'RUS', Brazil: 'BRA', Czechia: 'CZE', 'New Zealand': 'NZL',
  Poland: 'POL', Austria: 'AUT', UAE: 'UAE', 'South Africa': 'RSA', Australia: 'AUS', Netherlands: 'NED',
  Nigeria: 'NGA', Kazakhstan: 'KAZ', Ireland: 'IRL', Ecuador: 'ECU', Canada: 'CAN', Spain: 'ESP', Armenia: 'ARM',
  Azerbaijan: 'AZE', Mexico: 'MEX', Georgia: 'GEO', China: 'CHN', Myanmar: 'MYA', Portugal: 'POR', Japan: 'JPN',
  Iraq: 'IRQ', Kyrgyzstan: 'KGZ',
};

export const countryCode = (c: string) => COUNTRY_CODES[c] ?? c.slice(0, 3).toUpperCase();
export const recordString = (r: FighterRecord) => `${r.w}-${r.l}-${r.d}${r.nc ? ` (${r.nc} NC)` : ''}`;
export const heightString = (inches: number) => `${Math.floor(inches / 12)}' ${Math.round(inches % 12)}"`;
export const fighterAge = (f: FighterData, now = new Date()) => now.getFullYear() - f.birthYear;

/** Composite ratings used by the selection screen bars (STR GRP STA PWR SPD DEF). */
export function composites(f: FighterData) {
  const a = f.attributes;
  return {
    STR: Math.round((a.striking * 2 + a.accuracy + a.power * 0.5) / 3.5),
    GRP: Math.round((a.wrestling + a.takedowns + a.takedownDefense + a.submissions + a.submissionDefense + a.groundControl + a.clinch) / 7),
    STA: Math.round((a.cardio * 2 + a.recovery) / 3),
    PWR: a.power,
    SPD: a.speed,
    DEF: Math.round((a.defense * 2 + a.chin + a.takedownDefense) / 4),
  };
}

export const lastName = (name: string) => {
  const parts = name.replace(/ Jr\.$/, '').split(' ');
  if (parts.length > 2 && ['de', 'du', 'da', 'dos', 'St-Pierre'].includes(parts[parts.length - 2])) return parts.slice(-2).join(' ');
  if (parts[parts.length - 2] === 'du' || parts[parts.length - 2] === 'de' || parts[parts.length - 2] === 'Della') return parts.slice(-2).join(' ');
  if (parts[0] === 'Zhang' || parts[0] === 'Yan' || parts[0] === 'Song') return parts[0];
  if (parts.length === 3 && parts[1] === 'Della') return parts.slice(1).join(' ');
  return parts[parts.length - 1];
};

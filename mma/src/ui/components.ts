import { ARCHETYPES, composites, fighterAge, heightString, recordString, STRIKES, SUBMISSIONS, WEIGHT_CLASS_BY_ID, countryCode, type FighterData } from '../data';
import { h } from './dom';

export function techniqueName(id: string) {
  return STRIKES[id]?.name ?? SUBMISSIONS[id]?.name ?? id;
}

/** Selection-screen fighter card: bio, tale-of-tape basics, archetype and STR/GRP/STA/PWR/SPD/DEF bars. */
export function fighterCard(f: FighterData | null, corner: 'red' | 'blue', label: string, active: boolean, onClick: () => void) {
  const el = h('div', { class: `fcard ${corner === 'blue' ? 'right' : ''} ${active ? 'active' : ''}`, onclick: onClick });
  el.append(h('div', { class: 'corner' }, h('b', null, corner === 'red' ? '■ RED CORNER' : '■ BLUE CORNER'), ' · ', label));
  if (!f) {
    el.append(h('div', { class: 'placeholder' }, active ? 'Pick a fighter from the roster' : 'Click here, then pick a fighter'));
    return el;
  }
  const c = composites(f);
  el.append(
    h('div', { class: 'nick' }, f.nickname ? `“${f.nickname}”` : ' '),
    h('div', { class: 'name' }, f.name),
    h('div', { class: 'rec' }, recordString(f.record), f.legend ? h('span', { class: 'legend-badge' }, 'LEGEND') : null),
    h('div', { class: 'meta' },
      h('div', null, 'Division ', h('b', null, WEIGHT_CLASS_BY_ID[f.weightClass].short)),
      h('div', null, 'From ', h('b', null, countryCode(f.country))),
      h('div', null, 'Height ', h('b', null, heightString(f.heightIn))),
      h('div', null, 'Reach ', h('b', null, `${f.reachIn}"`)),
      h('div', null, 'Stance ', h('b', null, f.stance)),
      h('div', null, 'Age ', h('b', null, String(fighterAge(f)))),
    ),
    h('div', { class: 'arch', title: ARCHETYPES[f.archetype].description }, ARCHETYPES[f.archetype].name),
    h('div', { class: 'sig', style: 'margin-top:8px' }, ARCHETYPES[f.archetype].description),
    h('div', { class: 'bars' }, ...(Object.entries(c) as [string, number][]).map(([k, v]) =>
      h('div', { class: 'bar' }, h('span', null, k), h('div', { class: 'track' }, h('div', { class: 'fill', style: `width:${v}%` })), h('b', null, String(v))))),
  );
  if (f.signatureTechniques.length) el.append(h('div', { class: 'sig' }, 'Signature: ', f.signatureTechniques.map(techniqueName).join(' · ')));
  return el;
}

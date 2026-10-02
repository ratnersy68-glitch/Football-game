/**
 * Create-a-Player: identity & position → archetype → body & look → 100-point build → jersey number →
 * gear → review & kickoff. The 3D preview updates live on every step.
 */
import { useMemo, useState } from 'react';
import { navigate } from '../../app/store';
import {
  EYE_COLORS,
  FACIAL_HAIR,
  GEAR,
  HAIR_COLORS,
  HAIR_STYLES,
  BUILD_CAP,
  BUILD_POINTS,
  POSITIONS,
  SKIN_TONES,
  posDef,
  withPosition,
  archetypeOf,
  baseRatings,
  bodyTypeOf,
  defaultGear,
  heightLabel,
  loadPlayer,
  newPlayer,
  overall,
  pointsSpent,
  ratings,
  recruitRanks,
  savePlayer,
  starRating,
  uniformFor,
  type CreatedPlayer,
  type GearKey,
  type PositionId,
} from '../../career/player';
import { loadCareer, newCareer, saveCareer } from '../../career/season';
import { CONFERENCES, TEAM_BY_ID, UNIVERSE_TEAMS } from '../../data';
import { TeamBadge } from '../components/common';
import { takenNumbers } from '../../play/engine/roster';
import { DIFFICULTY_BLURBS, DIFFICULTY_NAMES, loadPlaySettings, savePlaySettings } from '../../play/settings';
import { PlayerPreview, type PreviewFocus } from './PlayerPreview';
import type { PlayerLook } from '../../play/render/playerModel';

const STEPS = ['Identity', 'School', 'Archetype', 'Body & Look', 'Build', 'Number', 'Gear', 'Kickoff'];

const STATES = ['AL', 'AZ', 'CA', 'FL', 'GA', 'IL', 'IN', 'KY', 'LA', 'MD', 'MI', 'MS', 'NC', 'NJ', 'NY', 'OH', 'OK', 'PA', 'SC', 'TN', 'TX', 'VA', 'WA'];

const GEAR_FOCUS: Partial<Record<GearKey, PreviewFocus>> = {
  facemask: 'helmet',
  facemaskColor: 'helmet',
  visor: 'helmet',
  mouthguard: 'helmet',
  eyeBlack: 'helmet',
  leftSleeve: 'hands',
  rightSleeve: 'hands',
  wristbands: 'hands',
  gloves: 'hands',
  handWarmer: 'full',
  socks: 'cleats',
  cleats: 'cleats',
};

export function lookFor(p: CreatedPlayer, kind: 'home' | 'away' | 'alternate' = 'home'): PlayerLook {
  return {
    uniform: uniformFor(p.teamId, kind),
    gear: p.gear,
    skin: p.appearance.skinTone,
    hair: p.appearance.hair,
    hairColor: p.appearance.hairColor,
    facialHair: p.appearance.facialHair,
    number: p.jersey,
    name: p.lastName || 'Player',
    heightIn: p.heightIn,
    weight: p.weight,
  };
}

function Stars({ n }: { n: number }) {
  return (
    <span className="stars" aria-label={`${n} stars`}>
      {'★'.repeat(n)}
      <span className="muted">{'★'.repeat(5 - n)}</span>
    </span>
  );
}

export function CreatePlayer({ initialStep = 0 }: { initialStep?: number }) {
  const [p, setP] = useState<CreatedPlayer>(() => loadPlayer() ?? newPlayer());
  const [step, setStep] = useState(initialStep);
  const [focus, setFocus] = useState<PreviewFocus>('full');
  const [uniformKind, setUniformKind] = useState<'home' | 'away' | 'alternate'>('home');
  const [settings, setSettings] = useState(loadPlaySettings);
  const [numberMsg, setNumberMsg] = useState<string | null>(null);
  const taken = useMemo(() => takenNumbers(p.teamId), [p.teamId]);

  const upd = (patch: Partial<CreatedPlayer>) => setP((q) => ({ ...q, ...patch }));
  const r = ratings(p);
  const base = baseRatings(p);
  const ovr = overall(r, p.position);
  const stars = starRating(ovr);
  const ranks = recruitRanks(ovr);
  const spent = pointsSpent(p);
  const left = BUILD_POINTS - spent;
  const body = bodyTypeOf(p);

  const nameOk = p.firstName.trim().length > 0 && p.lastName.trim().length > 0;
  const canNext = step !== 0 || nameOk;

  const existing = useMemo(() => loadCareer(), []);
  // Editing the same player (same school & position) keeps the career; anything else starts a new one.
  const hasCareer = !!existing && !existing.over && existing.player.teamId === p.teamId && existing.player.position === p.position;
  const finish = () => {
    // Never take the field in a returning player's number.
    const jersey = taken.has(p.jersey) ? alternatives(p.jersey)[0] : p.jersey;
    const done = { ...p, jersey };
    savePlayer(done);
    savePlaySettings(settings);
    if (hasCareer && existing) {
      existing.player = { ...done, progress: existing.player.progress };
      saveCareer(existing);
    } else saveCareer(newCareer(done));
    navigate({ name: 'careerHub' });
  };

  const alternatives = (n: number): number[] => {
    const out: number[] = [];
    for (let d = 1; out.length < 3 && d < 100; d++) for (const c of [n + d, n - d]) if (c >= 0 && c <= 99 && !taken.has(c) && out.length < 3) out.push(c);
    return out;
  };

  const requestNumber = (n: number) => {
    upd({ preferredJersey: n });
    if (taken.has(n)) {
      setNumberMsg(`#${n} belongs to a returning player. Coach offers: ${alternatives(n).map((a) => `#${a}`).join(', ')}.`);
    } else {
      setNumberMsg(`#${n} is yours.`);
      upd({ jersey: n, preferredJersey: n });
    }
  };

  const autoBuild = () => {
    const arch = archetypeOf(p);
    const order = posDef(p).attributes
      .map((a) => ({ id: a.id, s: (posDef(p).weights[a.id] ?? 1) * (arch.base[a.id] ?? 60) }))
      .sort((a, b) => b.s - a.s);
    const build: Record<string, number> = {};
    let pts = BUILD_POINTS;
    for (const o of order) {
      const give = Math.min(BUILD_CAP, pts, 99 - base[o.id]);
      if (give > 0) build[o.id] = give;
      pts -= Math.max(0, give);
      if (pts <= 0) break;
    }
    upd({ build });
  };

  const randomGear = () => {
    const g = { ...p.gear };
    for (const k of Object.keys(GEAR) as GearKey[]) {
      const opts = GEAR[k].options;
      g[k] = opts[Math.floor(Math.random() * opts.length)][0];
    }
    upd({ gear: g });
  };

  return (
    <div className="page create">
      <div className="page-head">
        <button className="btn ghost" onClick={() => navigate({ name: 'career' })}>
          ← Back
        </button>
        <h1>Create Your Player</h1>
        <div className="spacer" />
        <div className="ovr-card">
          <div className="ovr-num">{ovr}</div>
          <div>
            <div className="small-caps">
              {p.position} · {archetypeOf(p).name}
            </div>
            <Stars n={stars} />
            <div className="muted tiny">
              #{ranks.position} {p.position} · #{ranks.national} national
            </div>
          </div>
        </div>
      </div>

      <div className="steps">
        {STEPS.map((s, i) => (
          <button key={s} className={`step ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`} onClick={() => (i <= step || nameOk ? setStep(i) : undefined)} disabled={i > step && !nameOk}>
            <span>{i + 1}</span>
            {s}
          </button>
        ))}
      </div>

      <div className="create-grid">
        <div className="create-main panel">
          {step === 0 && (
            <div className="col">
              <h3>Who are you?</h3>
              <div className="row wrap">
                <label className="field">
                  First name
                  <input value={p.firstName} maxLength={16} onChange={(e) => upd({ firstName: e.target.value })} placeholder="First" autoFocus />
                </label>
                <label className="field">
                  Last name
                  <input value={p.lastName} maxLength={18} onChange={(e) => upd({ lastName: e.target.value })} placeholder="Last" />
                </label>
                <label className="field">
                  Nickname
                  <input value={p.nickname} maxLength={16} onChange={(e) => upd({ nickname: e.target.value })} placeholder="optional" />
                </label>
              </div>
              <div className="row wrap">
                <label className="field">
                  Hometown
                  <input value={p.hometown} maxLength={24} onChange={(e) => upd({ hometown: e.target.value })} />
                </label>
                <label className="field">
                  State
                  <select value={p.state} onChange={(e) => upd({ state: e.target.value })}>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
              <h3 style={{ marginTop: 12 }}>Position</h3>
              <div className="pos-grid">
                {POSITIONS.list.map((pos) =>
                  pos.available ? (
                    <button key={pos.id} className={`pos-card ${p.position === pos.id ? 'active' : ''}`} onClick={() => setP((q) => withPosition(q, pos.id as PositionId))}>
                      <b>{pos.id}</b>
                      <span>{pos.name}</span>
                    </button>
                  ) : (
                    <div key={pos.id} className="pos-card locked" title="Arrives in a later milestone">
                      <b>{pos.id}</b>
                      <span>{pos.name}</span>
                      <em>Coming later</em>
                    </div>
                  ),
                )}
              </div>
              <div className="muted tiny">Changing position resets archetype, size, build and number to that position's defaults.</div>
              {!nameOk && <div className="warn">Enter a first and last name to continue.</div>}
            </div>
          )}

          {step === 1 && (
            <div className="col">
              <h3>Choose Your School</h3>
              <div className="muted tiny">Your full schedule, teammates, uniforms and stadium all come from the school you pick.</div>
              {CONFERENCES.filter((cf) => cf.playable).map((cf) => (
                <div key={cf.id} className="col" style={{ gap: 6 }}>
                  <div className="small-caps">{cf.name}</div>
                  <div className="school-grid">
                    {UNIVERSE_TEAMS.filter((t) => t.conference === cf.id).map((t) => (
                      <button
                        key={t.id}
                        className={`school-pick ${p.teamId === t.id ? 'active' : ''}`}
                        style={{ borderColor: p.teamId === t.id ? t.primaryColor : undefined }}
                        onClick={() => upd({ teamId: t.id })}
                        title={`${t.school} ${t.nickname}`}
                      >
                        <TeamBadge teamId={t.id} size={34} />
                        <span>{t.school}</span>
                        <em>{'★'.repeat(Math.max(1, Math.round(t.prestige / 20)))}</em>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="col">
              <h3>{POSITIONS.list.find((x) => x.id === p.position)?.name} Archetype</h3>
              <div className="arch-grid">
                {posDef(p).archetypes.map((a) => {
                  const sel = p.archetype === a.id;
                  const top = Object.entries(a.base)
                    .sort((x, y) => y[1] - x[1])
                    .slice(0, 4);
                  return (
                    <button key={a.id} className={`arch-card ${sel ? 'active' : ''}`} onClick={() => upd({ archetype: a.id })}>
                      <div className="arch-name">{a.name}</div>
                      <div className="muted tiny">{a.blurb}</div>
                      {top.map(([k, v]) => (
                        <div key={k} className="mini-bar">
                          <span>{posDef(p).attributes.find((x) => x.id === k)?.label}</span>
                          <i style={{ width: `${v}%` }} />
                          <b>{v}</b>
                        </div>
                      ))}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="col">
              <h3>Body</h3>
              <div className="row wrap">
                {posDef(p).bodyTypes.map((b) => (
                  <button
                    key={b.id}
                    className={`chip ${p.bodyType === b.id ? 'active' : ''}`}
                    onClick={() => upd({ bodyType: b.id, weight: Math.round((b.weight[0] + b.weight[1]) / 2) })}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
              <label className="slider">
                Height <b>{heightLabel(p.heightIn)}</b>
                <input type="range" min={posDef(p).height[0]} max={posDef(p).height[1]} value={p.heightIn} onChange={(e) => upd({ heightIn: Number(e.target.value) })} />
              </label>
              <label className="slider">
                Weight <b>{p.weight} lbs</b>
                <input type="range" min={body.weight[0]} max={body.weight[1]} value={p.weight} onChange={(e) => upd({ weight: Number(e.target.value) })} />
              </label>
              <div className="muted tiny">Taller: better vision over the line. Shorter: quicker feet. Heavier: stronger and harder to sack, a bit slower.</div>
              <h3 style={{ marginTop: 10 }}>Look</h3>
              <Swatches label="Skin tone" values={SKIN_TONES} value={p.appearance.skinTone} onPick={(v) => upd({ appearance: { ...p.appearance, skinTone: v } })} />
              <Chips label="Hair" values={HAIR_STYLES} value={p.appearance.hair} onPick={(v) => upd({ appearance: { ...p.appearance, hair: v } })} />
              <Swatches label="Hair color" values={HAIR_COLORS} value={p.appearance.hairColor} onPick={(v) => upd({ appearance: { ...p.appearance, hairColor: v } })} />
              <Chips label="Facial hair" values={FACIAL_HAIR} value={p.appearance.facialHair} onPick={(v) => upd({ appearance: { ...p.appearance, facialHair: v } })} />
              <Swatches label="Eye color" values={EYE_COLORS} value={p.appearance.eyeColor} onPick={(v) => upd({ appearance: { ...p.appearance, eyeColor: v } })} />
              <div className="muted tiny">Hair shows under the helmet only with dreads, long hair or a mullet.</div>
            </div>
          )}

          {step === 4 && (
            <div className="col">
              <div className="row">
                <h3>Build — {left} / {BUILD_POINTS} points left</h3>
                <div className="spacer" />
                <button className="btn small" onClick={autoBuild}>
                  Auto-Build
                </button>
                <button className="btn small" onClick={() => upd({ build: {} })}>
                  Reset
                </button>
              </div>
              <div className="muted tiny">Up to {BUILD_CAP} points per attribute. Ratings drive the simulation directly — accuracy, arm strength, speed and poise all matter on the field.</div>
              {['Passing', 'Athletic', 'Mental'].map((grp) => (
                <div key={grp} className="build-group">
                  <div className="small-caps">{grp}</div>
                  {posDef(p).attributes
                    .filter((a) => a.group === grp)
                    .map((a) => {
                      const b = p.build[a.id] ?? 0;
                      const total = r[a.id];
                      return (
                        <div key={a.id} className="build-row">
                          <span className="label">{a.label}</span>
                          <button className="icon-btn" disabled={b <= 0} onClick={() => upd({ build: { ...p.build, [a.id]: b - 1 } })} aria-label={`Lower ${a.label}`}>
                            −
                          </button>
                          <div className="bar">
                            <i style={{ width: `${base[a.id]}%` }} />
                            <i className="plus" style={{ width: `${total - base[a.id]}%` }} />
                          </div>
                          <button
                            className="icon-btn"
                            disabled={b >= BUILD_CAP || left <= 0 || total >= 99}
                            onClick={() => upd({ build: { ...p.build, [a.id]: b + 1 } })}
                            aria-label={`Raise ${a.label}`}
                          >
                            +
                          </button>
                          <b className="mono">{total}</b>
                          <span className="muted tiny mono">{b ? `+${b}` : ''}</span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          )}

          {step === 5 && (
            <div className="col">
              <h3>Jersey Number — currently #{p.jersey}</h3>
              <div className="num-grid">
                {Array.from({ length: 100 }, (_, n) => (
                  <button key={n} className={`num ${p.jersey === n ? 'active' : ''} ${taken.has(n) ? 'taken' : ''}`} onClick={() => requestNumber(n)} title={taken.has(n) ? 'Worn by a returning player' : 'Available'}>
                    {n}
                  </button>
                ))}
              </div>
              {numberMsg && <div className="coach-msg">🏈 {numberMsg}</div>}
              {taken.has(p.preferredJersey) && (
                <div className="row wrap">
                  {alternatives(p.preferredJersey).map((a) => (
                    <button
                      key={a}
                      className="btn small primary"
                      onClick={() => {
                        upd({ jersey: a });
                        setNumberMsg(`You'll wear #${a}.`);
                      }}
                    >
                      Take #{a}
                    </button>
                  ))}
                </div>
              )}
              <div className="muted tiny">Gray numbers are worn by returning players; the coach will offer the closest open numbers.</div>
            </div>
          )}

          {step === 6 && (
            <div className="col">
              <div className="row">
                <h3>Gear</h3>
                <div className="spacer" />
                <button className="btn small" onClick={randomGear}>
                  🎲 Randomize
                </button>
                <button className="btn small" onClick={() => upd({ gear: defaultGear() })}>
                  Reset
                </button>
              </div>
              <div className="row wrap">
                <span className="muted tiny">Preview uniform:</span>
                {(['home', 'away', 'alternate'] as const).map((k) => (
                  <button key={k} className={`chip ${uniformKind === k ? 'active' : ''}`} onClick={() => setUniformKind(k)}>
                    {k}
                  </button>
                ))}
              </div>
              <div className="gear-list">
                {(Object.keys(GEAR) as GearKey[]).map((k) => (
                  <div key={k} className="gear-row" onMouseEnter={() => setFocus(GEAR_FOCUS[k] ?? 'full')}>
                    <span className="label">{GEAR[k].label}</span>
                    <div className="row wrap" style={{ gap: 6 }}>
                      {GEAR[k].options.map(([id, name]) => (
                        <button
                          key={id}
                          className={`chip ${p.gear[k] === id ? 'active' : ''}`}
                          onClick={() => {
                            upd({ gear: { ...p.gear, [k]: id } });
                            setFocus(GEAR_FOCUS[k] ?? 'full');
                          }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 7 && (
            <div className="col">
              <h3>Kickoff</h3>
              <div className="review">
                <div className="review-name">
                  #{p.jersey} {p.firstName} {p.lastName} {p.nickname && <span className="muted">“{p.nickname}”</span>}
                </div>
                <div className="muted">
                  {heightLabel(p.heightIn)} · {p.weight} lbs · {archetypeOf(p).name} {p.position} · {p.hometown}, {p.state}
                </div>
                <div className="muted">
                  {TEAM_BY_ID[p.teamId]?.school} {TEAM_BY_ID[p.teamId]?.nickname}
                </div>
                <div className="row" style={{ marginTop: 8 }}>
                  <span className="ovr-num sm">{ovr}</span>
                  <Stars n={stars} />
                </div>
              </div>
              <h3>Difficulty</h3>
              <div className="row wrap">
                {DIFFICULTY_NAMES.map((n, i) => (
                  <button key={n} className={`chip ${settings.difficulty === i ? 'active' : ''}`} onClick={() => setSettings({ ...settings, difficulty: i })}>
                    {n}
                  </button>
                ))}
              </div>
              <div className="muted tiny">{DIFFICULTY_BLURBS[settings.difficulty]}</div>
              <h3>Quarter length</h3>
              <div className="row wrap">
                {[3, 5, 8, 15].map((m) => (
                  <button key={m} className={`chip ${settings.quarterMinutes === m ? 'active' : ''}`} onClick={() => setSettings({ ...settings, quarterMinutes: m })}>
                    {m} min
                  </button>
                ))}
              </div>
              <label className="row" style={{ gap: 8 }}>
                <input type="checkbox" checked={settings.readAssist} onChange={(e) => setSettings({ ...settings, readAssist: e.target.checked })} />
                Read assist (receiver icons turn green when open)
              </label>
              <div className="muted tiny">
                Your freshman season at {TEAM_BY_ID[p.teamId]?.school}: 12 games, class, practice and a phone full of people who want your time.
              </div>
            </div>
          )}

          <div className="row create-nav">
            <button className="btn" disabled={step === 0} onClick={() => setStep(step - 1)}>
              ← Previous
            </button>
            <div className="spacer" />
            {step < STEPS.length - 1 ? (
              <button className="btn primary" disabled={!canNext} onClick={() => setStep(step + 1)}>
                Next: {STEPS[step + 1]} →
              </button>
            ) : (
              <button className="btn primary big" onClick={finish} disabled={!nameOk}>
                {hasCareer ? 'Save & Back to Career ▶' : 'Start My Career ▶'}
              </button>
            )}
          </div>
        </div>
        <div className="create-side">
          <PlayerPreview look={lookFor(p, uniformKind)} focus={focus} height={460} />
          <div className="panel tiny-stats">
            {Object.entries(posDef(p).weights)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([k]) => (
              <div key={k} className="mini-bar">
                <span>{posDef(p).attributes.find((a) => a.id === k)?.label}</span>
                <i style={{ width: `${r[k]}%` }} />
                <b>{r[k]}</b>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Swatches({ label, values, value, onPick }: { label: string; values: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="row wrap">
      <span className="label-sm">{label}</span>
      {values.map((v) => (
        <button key={v} className={`swatch ${v === value ? 'active' : ''}`} style={{ background: v }} onClick={() => onPick(v)} aria-label={`${label} ${v}`} />
      ))}
    </div>
  );
}

function Chips<T extends string>({ label, values, value, onPick }: { label: string; values: readonly T[]; value: T; onPick: (v: T) => void }) {
  return (
    <div className="row wrap">
      <span className="label-sm">{label}</span>
      {values.map((v) => (
        <button key={v} className={`chip ${v === value ? 'active' : ''}`} onClick={() => onPick(v)}>
          {v}
        </button>
      ))}
    </div>
  );
}

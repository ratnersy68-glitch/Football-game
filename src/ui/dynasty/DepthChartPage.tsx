import { useState } from 'react';
import { POSITIONS, POSITION_ORDER, archetypeName } from '../../data';
import { bump, useStore } from '../../app/store';
import type { Player, Position } from '../../models/types';
import { autoDepthChart, moveInDepthChart, STARTER_COUNTS } from '../../simulation/depthChart';
import { classLabel, schemeFit } from '../../simulation/playerRatings';
import { Ovr } from '../components/common';
import { PlayerModal } from './RosterPage';

const SLOT_NAMES: Partial<Record<Position, string[]>> = {
  OL: ['LT', 'LG', 'C', 'RG', 'RT'],
  WR: ['WR1', 'WR2', 'WR3'],
  DL: ['DE', 'DT', 'DT', 'DE'],
  LB: ['LB1', 'LB2', 'LB3'],
  CB: ['CB1', 'CB2'],
  S: ['FS', 'SS'],
};

export function DepthChartPage() {
  const { dynasty: d } = useStore();
  const [pos, setPos] = useState<Position>('QB');
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [sel, setSel] = useState<Player | null>(null);
  if (!d) return null;
  const team = d.teams[d.userTeamId];
  const list = team.depthChart[pos].map((id) => d.players[id]).filter(Boolean);
  const starters = STARTER_COUNTS[pos];

  const move = (from: number, to: number) => {
    team.depthChart = moveInDepthChart(team.depthChart, pos, from, to);
    bump();
  };
  const autoSet = (all: boolean) => {
    const roster = team.rosterIds.map((id) => d.players[id]);
    const auto = autoDepthChart(roster);
    if (all) team.depthChart = auto;
    else team.depthChart = { ...team.depthChart, [pos]: auto[pos] };
    bump();
  };

  return (
    <div className="depth-grid">
      <div className="pos-list">
        {POSITION_ORDER.map((p) => {
          const top = d.players[team.depthChart[p][0]];
          return (
            <button key={p} className={pos === p ? 'active' : ''} onClick={() => setPos(p)}>
              <span style={{ fontFamily: 'var(--display)' }}>{p}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {top ? `${top.lastName} ${top.overall}` : '—'}
              </span>
            </button>
          );
        })}
        <button onClick={() => autoSet(true)} style={{ marginTop: 10, justifyContent: 'center' }}>
          Auto-set all positions
        </button>
      </div>
      <div>
        <div className="row" style={{ marginBottom: 10 }}>
          <h2>{POSITIONS[pos].name}</h2>
          <span className="muted">Drag rows or use the arrows. Injured players are skipped automatically on game day.</span>
          <span className="spacer" />
          <button className="btn small" onClick={() => autoSet(false)}>
            Auto-set {pos}
          </button>
        </div>
        {list.map((p, i) => {
          const fit = schemeFit(p, team.offScheme, team.defScheme);
          const slot = i < starters ? (SLOT_NAMES[pos]?.[i] ?? `${pos}1`) : `${pos}${i + 1}`;
          return (
            <div
              key={p.id}
              className={`depth-row ${i < starters ? 'starter' : ''} ${over === i ? 'dragover' : ''}`}
              draggable
              onDragStart={() => setDrag(i)}
              onDragOver={(e) => {
                e.preventDefault();
                setOver(i);
              }}
              onDragLeave={() => setOver(null)}
              onDrop={() => {
                if (drag !== null && drag !== i) move(drag, i);
                setDrag(null);
                setOver(null);
              }}
            >
              <span className="slot">{i < starters ? slot : `${pos}${i + 1}`}</span>
              <Ovr v={p.overall} />
              <span style={{ cursor: 'pointer' }} onClick={() => setSel(p)}>
                <b>#{p.jersey}</b> {p.firstName} {p.lastName} {p.injury && <span className="pill inj">INJ {p.injury.weeksRemaining}w</span>}
              </span>
              <span className="muted">{classLabel(p)}</span>
              <span className="muted" style={{ fontSize: 12 }}>
                {archetypeName(p.position, p.archetype)}
              </span>
              <span className="muted" style={{ fontSize: 12 }} title="Scheme fit">
                {fit >= 0.95 ? 'Ideal' : fit >= 0.8 ? 'Good' : fit >= 0.65 ? 'Fair' : 'Poor'}
              </span>
              <span className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                <button className="icon-btn" disabled={i === 0} onClick={() => move(i, i - 1)}>
                  ▲
                </button>
                <button className="icon-btn" disabled={i === list.length - 1} onClick={() => move(i, i + 1)}>
                  ▼
                </button>
              </span>
            </div>
          );
        })}
      </div>
      {sel && <PlayerModal player={sel} onClose={() => setSel(null)} />}
    </div>
  );
}

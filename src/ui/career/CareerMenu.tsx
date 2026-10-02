/** Player Career menu: continue the career, quick practice drive, edit the player, or start over. */
import { useState } from 'react';
import { navigate } from '../../app/store';
import { TEAM_BY_ID } from '../../data';
import { archetypeOf, heightLabel, loadPlayer, playerOverall, savePlayer, newPlayer, starRating } from '../../career/player';
import { clearCareer, loadCareer, record } from '../../career/season';
import { PlayerPreview } from './PlayerPreview';
import { lookFor } from './CreatePlayer';

export function CareerMenu() {
  const [career] = useState(loadCareer);
  const [player] = useState(() => career?.player ?? loadPlayer());
  const [confirmNew, setConfirmNew] = useState(false);
  const has = !!player && !!player.firstName;
  const ovr = has ? playerOverall(player!) : 0;

  const startNew = () => {
    if (has && !confirmNew) {
      setConfirmNew(true);
      return;
    }
    clearCareer();
    savePlayer(newPlayer());
    navigate({ name: 'createPlayer', step: 0 });
  };

  return (
    <div className="menu-screen">
      <div className="career-menu">
        <div>
          <div className="logo small">
            PLAYER <span>CAREER</span>
          </div>
          <div className="tagline">Pick your school · live the week · play Saturdays in 3D</div>
          <div className="menu-list">
            {career && has && (
              <button className="menu-item hero" onClick={() => navigate({ name: 'careerHub' })}>
                {career.over ? 'Season Summary' : 'Continue Career'}
                <small>
                  {TEAM_BY_ID[career.player.teamId]?.school} · Week {Math.min(career.week, 14)} · {record(career).w}-{record(career).l}
                </small>
              </button>
            )}
            {has && (
              <>
                <button className="menu-item" onClick={() => navigate({ name: 'play' })}>
                  Practice Drive<small>One drive vs Michigan — no effect on your career</small>
                </button>
                <button className="menu-item" onClick={() => navigate({ name: 'createPlayer', step: 6 })}>
                  Edit Gear<small>Facemask, visor, sleeves, gloves, cleats…</small>
                </button>
              </>
            )}
            <button className="menu-item" onClick={startNew}>
              {confirmNew ? 'Tap again to replace your player & career' : 'New Career'}
              <small>Choose a school and position (QB, RB, WR, TE)</small>
            </button>
            <button className="menu-item" onClick={() => navigate({ name: 'menu' })}>
              Main Menu<small>Back to the coaching dynasty and other modes</small>
            </button>
          </div>
        </div>
        {has && (
          <div className="career-card">
            <PlayerPreview look={lookFor(player!)} height={380} />
            <div className="row" style={{ justifyContent: 'center' }}>
              <span className="ovr-num sm">{ovr}</span>
              <div>
                <b>
                  {player!.firstName} {player!.lastName}
                </b>
                <div className="muted tiny">
                  {TEAM_BY_ID[player!.teamId]?.abbreviation} {player!.position} · {archetypeOf(player!).name} · {heightLabel(player!.heightIn)} {player!.weight} lbs ·{' '}
                  {'★'.repeat(starRating(ovr))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

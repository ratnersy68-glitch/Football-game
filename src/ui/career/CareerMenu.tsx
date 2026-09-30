/** Player Career hub: continue with the saved player, edit him, or create a new one. */
import { useState } from 'react';
import { navigate } from '../../app/store';
import { archetypeOf, heightLabel, loadPlayer, overall, ratings, savePlayer, newPlayer, starRating } from '../../career/player';
import { PlayerPreview } from './PlayerPreview';
import { lookFor } from './CreatePlayer';

export function CareerMenu() {
  const [player, setPlayer] = useState(loadPlayer);
  const [confirmNew, setConfirmNew] = useState(false);
  const ovr = player ? overall(ratings(player)) : 0;

  const startNew = () => {
    if (player && !confirmNew) {
      setConfirmNew(true);
      return;
    }
    savePlayer(newPlayer());
    setPlayer(null);
    navigate({ name: 'createPlayer', step: 0 });
  };

  return (
    <div className="menu-screen">
      <div className="career-menu">
        <div>
          <div className="logo small">
            PLAYER <span>CAREER</span>
          </div>
          <div className="tagline">Milestone 1 · One drive at Ohio Stadium</div>
          <div className="menu-list">
            {player && player.firstName ? (
              <>
                <button className="menu-item hero" onClick={() => navigate({ name: 'play' })}>
                  Play a Drive
                  <small>
                    #{player.jersey} {player.firstName} {player.lastName} vs Michigan
                  </small>
                </button>
                <button className="menu-item" onClick={() => navigate({ name: 'createPlayer', step: 5 })}>
                  Edit Gear<small>Facemask, visor, sleeves, gloves, cleats…</small>
                </button>
                <button className="menu-item" onClick={() => navigate({ name: 'createPlayer', step: 0 })}>
                  Edit Player<small>Name, archetype, body, build, number</small>
                </button>
              </>
            ) : null}
            <button className="menu-item" onClick={startNew}>
              {confirmNew ? 'Tap again to replace your player' : 'Create New Player'}
              <small>{player && player.firstName ? 'Replaces the current player' : 'Build your quarterback'}</small>
            </button>
            <button className="menu-item" onClick={() => navigate({ name: 'menu' })}>
              Main Menu<small>Back to the coaching dynasty and other modes</small>
            </button>
          </div>
        </div>
        {player && player.firstName && (
          <div className="career-card">
            <PlayerPreview look={lookFor(player)} height={380} />
            <div className="row" style={{ justifyContent: 'center' }}>
              <span className="ovr-num sm">{ovr}</span>
              <div>
                <b>
                  {player.firstName} {player.lastName}
                </b>
                <div className="muted tiny">
                  {archetypeOf(player).name} QB · {heightLabel(player.heightIn)} {player.weight} lbs · {'★'.repeat(starRating(ovr))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { CONFERENCE_BY_ID, TEAM_BY_ID } from '../../data';
import { navigate, saves, setState, toast, useStore, type HubTab } from '../../app/store';
import { newSlotId } from '../../save/saveManager';
import { currentRank } from '../../simulation/rankingEngine';
import { TeamBadge, teamStyle, textOn } from '../components/common';
import { HomePage } from './HomePage';
import { RosterPage } from './RosterPage';
import { DepthChartPage } from './DepthChartPage';
import { SchedulePage } from './SchedulePage';
import { GamePlanPage } from './GamePlanPage';
import { Top25Page } from './Top25Page';
import { ConferencePage } from './ConferencePage';
import { NewsPage } from './NewsPage';
import { CoachPage } from './CoachPage';
import { PostseasonPage } from './PostseasonPage';
import { HistoryPage } from './HistoryPage';
import { weekLabel } from './SeasonCards';

const TABS: [HubTab, string][] = [
  ['home', 'Home'],
  ['roster', 'Team'],
  ['depth', 'Depth Chart'],
  ['schedule', 'Schedule'],
  ['gameplan', 'Game Plan'],
  ['top25', 'Top 25'],
  ['conference', 'Conference'],
  ['postseason', 'CFP & Bowls'],
  ['news', 'News'],
  ['history', 'History'],
  ['coach', 'Coach Profile'],
];

export function Hub({ tab }: { tab: HubTab }) {
  const { dynasty: d, slotName, slotId } = useStore();
  const [saving, setSaving] = useState(false);
  if (!d) {
    return (
      <div className="page">
        <button className="btn" onClick={() => navigate({ name: 'menu' })}>
          No dynasty loaded — back to menu
        </button>
      </div>
    );
  }
  const t = TEAM_BY_ID[d.userTeamId];
  const rec = d.teams[d.userTeamId].record;
  const rank = currentRank(d, d.userTeamId);
  const coach = d.coaches[d.userCoachId];

  const save = async (asNew: boolean) => {
    let slot = slotId;
    let name = slotName;
    if (asNew || !slot) {
      const suggested = `${t.school} ${d.season} Wk ${d.week}`;
      const input = prompt('Save name', name ?? suggested);
      if (!input) return;
      name = input;
      slot = newSlotId();
    }
    setSaving(true);
    try {
      await saves.save(d, slot!, name!);
      setState({ slotId: slot, slotName: name });
      toast(`Saved: ${name}`);
    } catch (e) {
      toast(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const exportFile = () => {
    const blob = new Blob([JSON.stringify(d)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `saturday26_${t.id}_${d.season}_wk${d.week}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  let page: React.ReactNode;
  switch (tab) {
    case 'home':
      page = <HomePage />;
      break;
    case 'roster':
      page = <RosterPage />;
      break;
    case 'depth':
      page = <DepthChartPage />;
      break;
    case 'schedule':
      page = <SchedulePage />;
      break;
    case 'gameplan':
      page = <GamePlanPage />;
      break;
    case 'top25':
      page = <Top25Page />;
      break;
    case 'conference':
      page = <ConferencePage />;
      break;
    case 'news':
      page = <NewsPage />;
      break;
    case 'coach':
      page = <CoachPage />;
      break;
    case 'postseason':
      page = <PostseasonPage />;
      break;
    case 'history':
      page = <HistoryPage />;
      break;
  }

  return (
    <div style={teamStyle(d.userTeamId)}>
      <div className="hub-top" style={{ background: `linear-gradient(110deg, ${t.primaryColor} 0%, ${t.primaryColor}dd 40%, #0b0f18 95%)`, color: textOn(t.primaryColor) }}>
        <div className="row wrap" style={{ gap: 18 }}>
          <TeamBadge teamId={t.id} size={68} />
          <div>
            <div className="school">
              {rank ? <span style={{ opacity: 0.8 }}>#{rank} </span> : null}
              {t.school} {t.nickname}
            </div>
            <div className="meta">
              {d.season} Season · {weekLabel(d)} · Coach {coach.firstName} {coach.lastName} · {CONFERENCE_BY_ID[t.conference].name}
            </div>
          </div>
          <div className="spacer" />
          <div className="hub-kpis">
            <div className="kpi">
              <div className="k">Record</div>
              <div className="v">
                {rec.w}-{rec.l}
              </div>
            </div>
            <div className="kpi">
              <div className="k">Conf</div>
              <div className="v">
                {rec.confW}-{rec.confL}
              </div>
            </div>
            <div className="kpi">
              <div className="k">AP Rank</div>
              <div className="v">{rank ? `#${rank}` : 'NR'}</div>
            </div>
          </div>
          <div className="col" style={{ gap: 6 }}>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn small" onClick={() => save(false)} disabled={saving}>
                Save
              </button>
              <button className="btn small" onClick={() => save(true)} disabled={saving}>
                Save As
              </button>
              <button className="btn small" onClick={exportFile}>
                Export
              </button>
            </div>
            <div className="row" style={{ gap: 6 }}>
              <button className="btn small" onClick={() => navigate({ name: 'settings' })}>
                Settings
              </button>
              <button
                className="btn small"
                onClick={() => {
                  if (confirm('Return to main menu? Unsaved progress since the last autosave will be lost.')) {
                    setState({ dynasty: null, slotId: null, slotName: null });
                    navigate({ name: 'menu' });
                  }
                }}
              >
                Main Menu
              </button>
            </div>
          </div>
        </div>
      </div>
      <nav className="hub-nav">
        {TABS.map(([id, label]) => (
          <button key={id} className={tab === id ? 'active' : ''} onClick={() => navigate({ name: 'hub', tab: id })}>
            {label}
          </button>
        ))}
      </nav>
      <div className="hub-body">{page}</div>
    </div>
  );
}

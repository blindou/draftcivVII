import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import civData from '../data/civs.json';
import leaderData from '../data/leaders.json';
import souvenirData from '../data/souvenirs.json';

interface DraftSummary {
  draft: {
    id: string;
    team1_name: string;
    team2_name: string;
    team_mode: string;
    timer_seconds: number;
    enable_souvenir_ban: boolean;
    auto_ban_civilizations: string[];
    auto_ban_leaders: string[];
    auto_ban_souvenirs: string[];
  };
  actions: {
    id: string;
    action_type: 'ban' | 'pick';
    team_number: number;
    choice_id: string;
    category: 'civ' | 'leader' | 'souvenir';
    created_at: string;
  }[];
}

interface GroupedActions {
  team1: {
    picks: { civ: string[]; leader: string[]; };
    bans: { civ: string[]; leader: string[]; souvenir: string[]; };
  };
  team2: {
    picks: { civ: string[]; leader: string[]; };
    bans: { civ: string[]; leader: string[]; souvenir: string[]; };
  };
}

const SummaryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<DraftSummary | null>(null);
  const [groupedActions, setGroupedActions] = useState<GroupedActions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [draftResult, actionsResult] = await Promise.all([
          supabase.from('drafts').select('*').eq('id', id).single(),
          supabase.from('draft_actions').select('*').eq('draft_id', id).order('created_at', { ascending: true }),
        ]);

        if (draftResult.error) throw draftResult.error;
        if (actionsResult.error) throw actionsResult.error;

        setSummary({
          draft: draftResult.data,
          actions: actionsResult.data,
        });

        // Group actions by team and type
        const grouped: GroupedActions = {
          team1: {
            picks: { civ: [], leader: [] },
            bans: { civ: [], leader: [], souvenir: [] },
          },
          team2: {
            picks: { civ: [], leader: [] },
            bans: { civ: [], leader: [], souvenir: [] },
          },
        };

        actionsResult.data.forEach(action => {
          const team = action.team_number === 1 ? 'team1' : 'team2';
          const actionGroup = action.action_type === 'pick' ? 'picks' : 'bans';
          const entityName = getEntityName(action.choice_id);
          
          if (action.category === 'civ') {
            grouped[team][actionGroup].civ.push(entityName);
          } else if (action.category === 'leader') {
            grouped[team][actionGroup].leader.push(entityName);
          } else if (action.category === 'souvenir') {
            grouped[team].bans.souvenir.push(entityName);
          }
        });

        setGroupedActions(grouped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load draft summary');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [id]);

  const getEntityName = (entityId: string) => {
    const civ = civData.civilizations.find(c => c.id === entityId);
    if (civ) return civ.name;

    const leader = leaderData.leaders.find(l => l.id === entityId);
    if (leader) return leader.name;

    const souvenir = souvenirData.souvenirs.find(s => s.id === entityId);
    if (souvenir) return souvenir.name;

    return entityId;
  };

  const exportAsTxt = () => {
    if (!summary || !groupedActions) return;

    const content = [
      `Draft Summary - ${new Date().toLocaleDateString()}`,
      `\nTeams: ${summary.draft.team1_name} vs ${summary.draft.team2_name}`,
      `Mode: ${summary.draft.team_mode}`,
      `Timer: ${summary.draft.timer_seconds} seconds`,
      '\nAuto-Bans:',
      `Civilizations: ${summary.draft.auto_ban_civilizations.map(getEntityName).join(', ') || 'None'}`,
      `Leaders: ${summary.draft.auto_ban_leaders.map(getEntityName).join(', ') || 'None'}`,
      `Souvenirs: ${summary.draft.auto_ban_souvenirs.map(getEntityName).join(', ') || 'None'}`,
      '\nTeam 1 Picks:',
      `Civilizations: ${groupedActions.team1.picks.civ.join(', ')}`,
      `Leaders: ${groupedActions.team1.picks.leader.join(', ')}`,
      '\nTeam 1 Bans:',
      `Civilizations: ${groupedActions.team1.bans.civ.join(', ')}`,
      `Leaders: ${groupedActions.team1.bans.leader.join(', ')}`,
      `Souvenirs: ${groupedActions.team1.bans.souvenir.join(', ')}`,
      '\nTeam 2 Picks:',
      `Civilizations: ${groupedActions.team2.picks.civ.join(', ')}`,
      `Leaders: ${groupedActions.team2.picks.leader.join(', ')}`,
      '\nTeam 2 Bans:',
      `Civilizations: ${groupedActions.team2.bans.civ.join(', ')}`,
      `Leaders: ${groupedActions.team2.bans.leader.join(', ')}`,
      `Souvenirs: ${groupedActions.team2.bans.souvenir.join(', ')}`,
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `draft-summary-${id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !summary || !groupedActions) {
    return (
      <div className="text-center text-red-500">
        {error || 'Summary not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Draft Summary</h1>
        <Button variant="outline" onClick={exportAsTxt}>
          <FileText className="w-4 h-4 mr-2" />
          Export as Text
        </Button>
      </div>

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Draft Configuration</h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <span className="text-gray-400 block">Team Mode</span>
              <p className="font-medium">{summary.draft.team_mode}</p>
            </div>
            <div>
              <span className="text-gray-400 block">Timer per Action</span>
              <p className="font-medium">{summary.draft.timer_seconds} seconds</p>
            </div>
            <div>
              <span className="text-gray-400 block">Mementos Ban Phase</span>
              <p className="font-medium">{summary.draft.enable_souvenir_ban ? 'Enabled' : 'Disabled'}</p>
            </div>
            {summary.draft.auto_ban_civilizations.length > 0 && (
              <div className="col-span-full">
                <span className="text-gray-400 block">Auto-banned Civilizations</span>
                <p className="font-medium">{summary.draft.auto_ban_civilizations.map(getEntityName).join(' / ')}</p>
              </div>
            )}
            {summary.draft.auto_ban_leaders.length > 0 && (
              <div className="col-span-full">
                <span className="text-gray-400 block">Auto-banned Leaders</span>
                <p className="font-medium">{summary.draft.auto_ban_leaders.map(getEntityName).join(' / ')}</p>
              </div>
            )}
            {summary.draft.auto_ban_souvenirs.length > 0 && (
              <div className="col-span-full">
                <span className="text-gray-400 block">Auto-banned Mementos</span>
                <p className="font-medium">{summary.draft.auto_ban_souvenirs.map(getEntityName).join(' / ')}</p>
              </div>
            )}
          </div>
        </Card.Content>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Team 1 Summary */}
        <Card className="border-team-blue-500">
          <Card.Header>
            <h2 className="text-xl font-semibold text-team-blue-400">{summary.draft.team1_name}</h2>
          </Card.Header>
          <Card.Content className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Picks</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Civilizations</span>
                  <p className="font-medium">{groupedActions.team1.picks.civ.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Leaders</span>
                  <p className="font-medium">{groupedActions.team1.picks.leader.join(', ')}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Bans</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Civilizations</span>
                  <p className="font-medium">{groupedActions.team1.bans.civ.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Leaders</span>
                  <p className="font-medium">{groupedActions.team1.bans.leader.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Mementos</span>
                  <p className="font-medium">{groupedActions.team1.bans.souvenir.join(', ')}</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>

        {/* Team 2 Summary */}
        <Card className="border-team-red-500">
          <Card.Header>
            <h2 className="text-xl font-semibold text-team-red-400">{summary.draft.team2_name}</h2>
          </Card.Header>
          <Card.Content className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Picks</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Civilizations</span>
                  <p className="font-medium">{groupedActions.team2.picks.civ.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Leaders</span>
                  <p className="font-medium">{groupedActions.team2.picks.leader.join(', ')}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Bans</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-400 block">Civilizations</span>
                  <p className="font-medium">{groupedActions.team2.bans.civ.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Leaders</span>
                  <p className="font-medium">{groupedActions.team2.bans.leader.join(', ')}</p>
                </div>
                <div>
                  <span className="text-gray-400 block">Mementos</span>
                  <p className="font-medium">{groupedActions.team2.bans.souvenir.join(', ')}</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default SummaryPage;
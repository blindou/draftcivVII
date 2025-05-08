import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Copy, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getDraftPhaseFlow } from '../constants/phaseFlow';
import type { Database } from '../types/supabase';
import civData from "../data/civs.json";
import leaderData from "../data/leaders.json";
import souvenirData from "../data/souvenirs.json";

type Draft = Database['public']['Tables']['drafts']['Row'];
type DraftAction = Database['public']['Tables']['draft_actions']['Row'];

const getExpectedActionCount = (phase: string, teamMode: string) => {
  const playersPerTeam = parseInt(teamMode.charAt(0), 10);
  
  switch (phase) {
    case 'ban-civ':
      return 4; // 2 bans per team
    case 'ban-leader':
      return 4; // 2 bans per team
    case 'ban-souvenir-1':
    case 'ban-souvenir-2':
      return 4; // 2 bans per team
    case 'pick-civ':
    case 'pick-leader':
      return playersPerTeam * 2; // Each player picks one
    default:
      return 0;
  }
};

const getCurrentPhaseIndex = (actions: DraftAction[], draft: Draft) => {
  const phases = getDraftPhaseFlow(draft);
  let totalExpectedActions = 0;
  
  for (let i = 0; i < phases.length; i++) {
    totalExpectedActions += getExpectedActionCount(phases[i], draft.team_mode);
    if (actions.length < totalExpectedActions) {
      return i;
    }
  }
  
  return phases.length; // All phases complete
};

const DraftPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [actions, setActions] = useState<DraftAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team2Name, setTeam2Name] = useState<string>('');
  const [isJoining, setIsJoining] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  const getEntityName = (entityId: string) => {
    const civ = civData.civilizations.find(c => c.id === entityId);
    if (civ) return civ.name;

    const leader = leaderData.leaders.find(l => l.id === entityId);
    if (leader) return leader.name;

    const souvenir = souvenirData.souvenirs.find(s => s.id === entityId);
    if (souvenir) return souvenir.name;

    return entityId;
  };

  // Determine if the user is team 1 (creator) or team 2 (joiner)
  const isTeam1 = searchParams.get('team') !== '2';
  const isTeam2 = searchParams.get('team') === '2';
  const teamParam = isTeam2 ? '?team=2' : '';

  useEffect(() => {
    if (!id) return;

    const fetchDraftAndActions = async () => {
      try {
        const [draftResult, actionsResult] = await Promise.all([
          supabase.from('drafts').select('*').eq('id', id).single(),
          supabase.from('draft_actions').select('*').eq('draft_id', id).order('created_at', { ascending: true })
        ]);

        if (draftResult.error) throw draftResult.error;
        if (actionsResult.error) throw actionsResult.error;
        
        setDraft(draftResult.data);
        setActions(actionsResult.data);
        
        // If both teams are ready, calculate the current phase
        if (draftResult.data.team1_ready && draftResult.data.team2_ready) {
          const phases = getDraftPhaseFlow(draftResult.data);
          const currentPhaseIndex = getCurrentPhaseIndex(actionsResult.data, draftResult.data);
          
          if (currentPhaseIndex < phases.length) {
            navigate(`/draft/${id}/phase/${phases[currentPhaseIndex]}${teamParam}`);
          } else {
            navigate(`/summary/${id}${teamParam}`);
          }
        }
      } catch (err) {
        console.error('Error fetching draft data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load draft');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchDraftAndActions();

    // Set up real-time subscriptions
    const channel = supabase.channel(`realtime:${id}`)
      // Subscribe to draft changes
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drafts',
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log('Received draft update:', payload);
          const newDraft = payload.new as Draft;
          setDraft(newDraft);
          
          // If both teams are ready after an update, start the first phase
          if (newDraft.team1_ready && newDraft.team2_ready) {
            const phases = getDraftPhaseFlow(newDraft);
            navigate(`/draft/${id}/phase/${phases[0]}${teamParam}`);
          }
        }
      )
      // Subscribe to draft actions
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_actions',
          filter: `draft_id=eq.${id}`,
        },
        (payload) => {
          console.log('Received action update:', payload);
          if (payload.eventType === 'INSERT') {
            setActions(current => {
              const updated = [...current, payload.new as DraftAction];
              
              // Check if we need to move to the next phase
              if (draft) {
                const phases = getDraftPhaseFlow(draft);
                const currentPhaseIndex = getCurrentPhaseIndex(updated, draft);
                
                if (currentPhaseIndex < phases.length) {
                  navigate(`/draft/${id}/phase/${phases[currentPhaseIndex]}${teamParam}`);
                } else {
                  navigate(`/summary/${id}${teamParam}`);
                }
              }
              
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            setActions(current => current.filter(action => action.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setActions(current =>
              current.map(action =>
                action.id === payload.new.id ? (payload.new as DraftAction) : action
              )
            );
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        setSubscriptionStatus(status === 'SUBSCRIBED' ? 'connected' : 'connecting');
      });

    return () => {
      console.log('Cleaning up subscriptions');
      setSubscriptionStatus('disconnected');
      channel.unsubscribe();
    };
  }, [id, navigate, teamParam]);

  const copyInviteLink = async () => {
    const url = `${window.location.origin}/draft/${id}?team=2`;
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleTeam2Join = async () => {
    if (!team2Name.trim() || !isTeam2) return;
    setIsJoining(true);
    setError(null);
    
    try {
      const { data, error: updateError } = await supabase
        .from('drafts')
        .update({ team2_name: team2Name })
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setDraft(data);
        setTeam2Name('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join team');
    } finally {
      setIsJoining(false);
    }
  };

  const handleReadyStateChange = async (team: 1 | 2, ready: boolean) => {
    if (!draft) return;

    // Only allow team 1 to change their ready state and team 2 to change theirs
    if ((team === 1 && !isTeam1) || (team === 2 && !isTeam2)) {
      return;
    }

    try {
      const update = team === 1 
        ? { team1_ready: ready }
        : { team2_ready: ready };

      const { data, error: updateError } = await supabase
        .from('drafts')
        .update(update)
        .eq('id', draft.id)
        .select()
        .single();

      if (updateError) throw updateError;
      
      if (data) {
        setDraft(data);
      }
    } catch (err) {
      console.error('Error updating ready state:', err);
      setError(err instanceof Error ? err.message : 'Failed to update ready state');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !draft) {
    return (
      <div className="text-center text-red-500">
        {error || 'Draft not found'}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Draft Waiting Room</h1>
        {isTeam1 && (
          <Button 
            variant="outline" 
            onClick={copyInviteLink}
            className="relative"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copySuccess ? 'Copied!' : 'Copy Invite Link'}
          </Button>
        )}
      </div>

      {subscriptionStatus !== 'connected' && (
        <div className="bg-yellow-900/20 border border-yellow-800 text-yellow-500 px-4 py-2 rounded-md">
          Connecting to real-time updates...
        </div>
      )}

      <Card>
        <Card.Header>
          <h2 className="text-xl font-semibold">Draft Settings</h2>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Team Mode</span>
              <p className="font-medium">{draft.team_mode}</p>
            </div>
            <div>
              <span className="text-gray-400">Timer per Action</span>
              <p className="font-medium">{draft.timer_seconds} seconds</p>
            </div>
            <div>
              <span className="text-gray-400">Souvenir Ban Phase</span>
              <p className="font-medium">{draft.enable_souvenir_ban ? 'Enabled' : 'Disabled'}</p>
            </div>
          </div>

          {draft.auto_ban_civilizations.length > 0 && (
            <div>
              <span className="text-gray-400">Auto-banned Civilizations</span>
              <p className="font-medium">{draft.auto_ban_civilizations.map(getEntityName).join(' / ')}</p>
            </div>
          )}

          {draft.auto_ban_leaders.length > 0 && (
            <div>
              <span className="text-gray-400">Auto-banned Leaders</span>
              <p className="font-medium">{draft.auto_ban_leaders.map(getEntityName).join(' / ')}</p>
            </div>
          )}

          {draft.auto_ban_souvenirs.length > 0 && (
            <div>
              <span className="text-gray-400">Auto-banned Souvenirs</span>
              <p className="font-medium">{draft.auto_ban_souvenirs.map(getEntityName).join(' / ')}</p>
            </div>
          )}
        </Card.Content>
      </Card>

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="border-team-blue-500">
          <Card.Header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-team-blue-400">Team 1</h3>
            <Users className="w-5 h-5 text-team-blue-400" />
          </Card.Header>
          <Card.Content>
            <p className="text-xl font-bold mb-4">{draft.team1_name}</p>
            {isTeam1 && (
              <Button
                variant={draft.team1_ready ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => handleReadyStateChange(1, !draft.team1_ready)}
              >
                {draft.team1_ready ? 'Ready!' : 'Mark as Ready'}
              </Button>
            )}
            {!isTeam1 && draft.team1_ready && (
              <div className="text-center text-green-500">Ready!</div>
            )}
          </Card.Content>
        </Card>

        <Card className="border-team-red-500">
          <Card.Header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-team-red-400">Team 2</h3>
            <Users className="w-5 h-5 text-team-red-400" />
          </Card.Header>
          <Card.Content>
            {draft.team2_name ? (
              <>
                <p className="text-xl font-bold mb-4">{draft.team2_name}</p>
                {isTeam2 && (
                  <Button
                    variant={draft.team2_ready ? 'primary' : 'outline'}
                    className="w-full"
                    onClick={() => handleReadyStateChange(2, !draft.team2_ready)}
                  >
                    {draft.team2_ready ? 'Ready!' : 'Mark as Ready'}
                  </Button>
                )}
                {!isTeam2 && draft.team2_ready && (
                  <div className="text-center text-green-500">Ready!</div>
                )}
              </>
            ) : (
              isTeam2 && (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={team2Name}
                    onChange={(e) => setTeam2Name(e.target.value)}
                    placeholder="Enter team name"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Button 
                    className="w-full" 
                    onClick={handleTeam2Join}
                    isLoading={isJoining}
                    disabled={!team2Name.trim()}
                  >
                    Join as Team 2
                  </Button>
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              )
            )}
            {!isTeam2 && !draft.team2_name && (
              <div className="text-center text-gray-400">
                Waiting for Team 2 to join...
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
};

export default DraftPage;
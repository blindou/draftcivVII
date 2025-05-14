import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import type { PhaseConfig } from '../types/phases';
import Card from './ui/Card';
import Button from './ui/Button';
import civData from '../data/civs.json';
import leaderData from '../data/leaders.json';
import souvenirData from '../data/souvenirs.json';
import { ChevronDown, ChevronRight, Timer, Shield, Swords, Crown, Scroll } from 'lucide-react';


interface DraftPhaseProps {
  draftId: string;
  teamNumber: number;
  timerSeconds: number;
  onPhaseComplete: () => void;
  draft: Database['public']['Tables']['drafts']['Row'];
  phaseConfig: PhaseConfig;
}

interface PhaseConfigItem {
  type: 'ban' | 'pick';
  category: 'civ' | 'leader' | 'souvenir';
  data: any[];
  pickOrder: number[];
  title: string;
  description: string;
}

type DraftAction = Database['public']['Tables']['draft_actions']['Row'];

const getPickOrder = (phaseType: string, teamMode: string): number[] => {
  const pickOrders: Record<string, Record<string, number[]>> = {
    'pick-civ': {
      '2v2': [1, 2, 2, 1],
      '3v3': [1, 2, 2, 1, 1, 2],
      '4v4': [1, 2, 2, 1, 1, 2, 2, 1],
    },
    'pick-leader': {
      '2v2': [1, 2, 2, 1],
      '3v3': [2, 1, 1, 2, 2, 1],
      '4v4': [1, 2, 2, 1, 1, 2, 2, 1],
    },
  };

  return pickOrders[phaseType]?.[teamMode] || [];
};

const phaseConfigs: Record<string, PhaseConfigItem> = {

  'ban-civ': {
    type: 'ban',
    category: 'civ',
    data: civData.civilizations,
    pickOrder: [1, 2],
    title: 'Ban Civilizations',
    description: 'Each team bans one civilizations they don\'t want their opponents to use',
  },
  'ban-leader': {
    type: 'ban',
    category: 'leader',
    data: leaderData.leaders,
    pickOrder: [2, 1],
    title: 'Ban Leaders',
    description: 'Each team bans one leaders',
  },
  'ban-souvenir-1': {
    type: 'ban',
    category: 'souvenir',
    data: souvenirData.souvenirs,
    pickOrder: [1, 2],
    title: 'First Memento Ban Phase',
    description: 'Ban powerful souvenirs in the first round. Each team bans one mementos',
  },
  'pick-civ': {
    type: 'pick',
    category: 'civ',
    data: civData.civilizations,
    pickOrder: [1, 2, 2, 1],
    title: 'Pick Civilizations',
    description: 'Choose your civilizations for the match. Banned civilizations are excluded',
  },
  'pick-leader': {
    type: 'pick',
    category: 'leader',
    data: leaderData.leaders,
    pickOrder: [1, 2, 2, 1],
    title: 'Pick Leaders',
    description: 'Choose your leaders',
  },
  'ban-souvenir-2': {
    type: 'ban',
    category: 'souvenir',
    data: souvenirData.souvenirs,
    pickOrder: [1, 2],
    title: 'Final Mementos Ban Phase',
    description: 'Ban remaining souvenirs in the final round. Each team bans one mementos',
  },
};

const getItemDetails = (itemId: string) => {
  const civ = civData.civilizations.find(i => i.id === itemId);
  if (civ) {
    return {
      name: civ.name,
      image: civ.image,
      description: undefined
    };
  }

  const leader = leaderData.leaders.find(i => i.id === itemId);
  if (leader) {
    return {
      name: leader.name,
      image: leader.image,
      description: undefined
    };
  }

  const souvenir = souvenirData.souvenirs.find(i => i.id === itemId);
  if (souvenir) {
    return {
      name: souvenir.name,
      image: souvenir.image,
      description: souvenir.description
    };
  }

  return null;
};

const DraftPhase: React.FC<DraftPhaseProps> = ({
  draftId,
  teamNumber,
  timerSeconds,
  onPhaseComplete,
  draft,
  phaseConfig
}) => {
  const { phaseType } = useParams<{ phaseType: string }>();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [currentPickIndex, setCurrentPickIndex] = useState(0);
  const [timer, setTimer] = useState(timerSeconds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phaseActions, setPhaseActions] = useState<DraftAction[]>([]);
  const [subscriptionStatus, setSubscriptionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const autoSelectInProgress = useRef(false);
  const [allTeamActions, setAllTeamActions] = useState<{
    team1: DraftAction[];
    team2: DraftAction[];
  }>({ team1: [], team2: [] });
  const [expandedSections, setExpandedSections] = useState<{
    [key: string]: boolean;
  }>({
    'ban-civ': true,
    'ban-leader': true,
    'ban-souvenir-1': true,
    'pick-civ': true,
    'pick-leader': true,
    'ban-souvenir-2': true,
  });

  const config = phaseType ? phaseConfigs[phaseType] : null;
  if (
      config &&
      draft &&
      (phaseType === 'pick-civ' || phaseType === 'pick-leader')
  ) {
    config.pickOrder = getPickOrder(phaseType, draft.team_mode);
  }
  const isCurrentTeamTurn = config?.pickOrder[currentPickIndex] === teamNumber;

  useEffect(() => {
    if (!draftId || !phaseType || !config) return;

    const fetchPhaseActions = async () => {
      const { data, error } = await supabase
        .from('draft_actions')
        .select('*')
        .eq('draft_id', draftId)
        .eq('category', config.category)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching phase actions:', error);
        return;
      }

      const filtered = (data || []).filter(a => {
        if ((phaseType === 'ban-souvenir-1' || phaseType === 'ban-souvenir-2') && !draft.enable_souvenir_ban) {
          return false;
        }

        const isCorrectCategory = a.category === config.category;
        const isCorrectType = a.action_type === config.type;
        const isSouvenirPhase = phaseType.startsWith('ban-souvenir');

        if (!isSouvenirPhase) {
          return isCorrectCategory && isCorrectType;
        }

        const souvenirActions = data.filter(
            act => act.category === 'souvenir' && act.action_type === config.type
        );
        const actionIndex = souvenirActions.findIndex(act => act.id === a.id);
        const isFirstPhase = phaseType === 'ban-souvenir-1';

        if (isFirstPhase) {
          return isCorrectCategory && isCorrectType && actionIndex < 4;
        } else {
          return isCorrectCategory && isCorrectType && actionIndex >= 4;
        }
      });
      console.log('🧩 [Phase Debug] - Phase:', phaseType);
      console.log('→ Config category:', config.category);
      console.log('→ Config action type:', config.type);
      console.log('→ Pick order:', config.pickOrder);
      console.log('→ Fetched actions from Supabase:', data);
      console.log('→ Filtered actions for this phase:', filtered);
      console.log('→ Expected currentPickIndex:', filtered.length);
      setPhaseActions(filtered);
      setCurrentPickIndex(filtered.length);
    };

    fetchPhaseActions();

    const channel = supabase.channel(`draft_phase_${draftId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_actions',
          filter: `draft_id=eq.${draftId}`,
        },
        (payload) => {
          console.log('Received action update:', payload);
          if (payload.eventType === 'INSERT') {
            const newAction = payload.new as DraftAction;
            
            if (newAction.category !== config.category) return;
            
            setPhaseActions(current => {
              const updated = [...current, newAction];
              setCurrentPickIndex(updated.length);
              
              if (updated.length === config.pickOrder.length) {
                onPhaseComplete();
              }
              
              return updated;
            });
            
            setTimer(timerSeconds);
            setSelectedItem(null);
            autoSelectInProgress.current = false;
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
  }, [draftId, phaseType, config, timerSeconds, onPhaseComplete, draft.enable_souvenir_ban]);

  useEffect(() => {
    const fetchAllActions = async () => {
      const { data, error } = await supabase
        .from('draft_actions')
        .select('*')
        .eq('draft_id', draftId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching all actions:', error);
        return;
      }

      setAllTeamActions({
        team1: data.filter(action => action.team_number === 1),
        team2: data.filter(action => action.team_number === 2),
      });
    };

    fetchAllActions();

    const channel = supabase.channel(`all_actions_${draftId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'draft_actions',
          filter: `draft_id=eq.${draftId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newAction = payload.new as DraftAction;
            setAllTeamActions(current => ({
              team1: newAction.team_number === 1 
                ? [...current.team1, newAction]
                : current.team1,
              team2: newAction.team_number === 2
                ? [...current.team2, newAction]
                : current.team2,
            }));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [draftId]);

  useEffect(() => {
    if (!isCurrentTeamTurn || timer <= 0 || autoSelectInProgress.current) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        const newTimer = Math.max(0, prev - 1);
        
        if (newTimer === 0 && isCurrentTeamTurn && !isSubmitting && config && !autoSelectInProgress.current) {
          const allActions = [...allTeamActions.team1, ...allTeamActions.team2];

          const unavailableIds = allActions
              .filter(a => ['ban', 'pick'].includes(a.action_type))
              .map(a => a.choice_id)
              .concat(
                  config.category === 'civ' ? draft.auto_ban_civilizations :
                      config.category === 'leader' ? draft.auto_ban_leaders :
                          config.category === 'souvenir' ? draft.auto_ban_souvenirs :
                              []
              );

          const availableItems = config.data.filter(item => !unavailableIds.includes(item.id));

          if (availableItems.length > 0) {
            autoSelectInProgress.current = true;
            const randomIndex = Math.floor(Math.random() * availableItems.length);
            const randomItem = availableItems[randomIndex];
            handleSubmit(randomItem.id);
          }
        }
        
        return newTimer;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isCurrentTeamTurn, timer, isSubmitting, config, draft, phaseActions]);

  const handleSelect = (itemId: string) => {
    if (!isCurrentTeamTurn || isSubmitting || autoSelectInProgress.current) return;
    setSelectedItem(itemId);
  };

  const handleSubmit = async (itemId?: string) => {
    const selectedItemId = itemId || selectedItem;
    if (!selectedItemId || !config || !isCurrentTeamTurn || isSubmitting) return;

    setIsSubmitting(true);
    try {
      console.log('✅ [Submit] - Team playing:', teamNumber);
      console.log('→ Item picked:', selectedItem?.id);
      console.log('→ Current pick index before submit:', currentPickIndex);
      console.log('→ Expected team at this index:', config.pickOrder[currentPickIndex]);
      const { error } = await supabase.from('draft_actions').insert({
        draft_id: draftId,
        action_type: config.type,
        team_number: teamNumber,
        choice_id: selectedItemId,
        category: config.category
      });

      if (error) throw error;
    } catch (err) {
      console.error('Error submitting choice:', err);
      autoSelectInProgress.current = false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const renderTeamPanel = (teamNumber: 1 | 2) => {
    const actions = teamNumber === 1 ? allTeamActions.team1 : allTeamActions.team2;
    const teamName = teamNumber === 1 ? draft.team1_name : draft.team2_name;
    const teamColor = teamNumber === 1 ? 'team-blue' : 'team-red';

    const groupedActions = {
      picks: {
        civ: actions.filter(a => a.category === 'civ' && a.action_type === 'pick'),
        leader: actions.filter(a => a.category === 'leader' && a.action_type === 'pick'),
      },
      bans: {
        civ: actions.filter(a => a.category === 'civ' && a.action_type === 'ban'),
        leader: actions.filter(a => a.category === 'leader' && a.action_type === 'ban'),
        souvenir: actions.filter(a => a.category === 'souvenir'),
      },
    };

    const renderActionCard = (action: DraftAction) => {
      const item = getItemDetails(action.choice_id);
      if (!item) return null;

      return (
        <div 
          key={action.id} 
          className={`
            bg-${teamColor}-900/10 border border-${teamColor}-900/20 
            rounded-lg overflow-hidden mb-2 transition-all hover:bg-${teamColor}-900/20
          `}
        >
          <div className="flex items-center p-2">
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-12 h-12 object-cover rounded"
            />
            <div className="ml-3">
              <p className="font-medium text-sm">{item.name}</p>
              {item.description && (
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    };

    const renderSection = (
      title: string,
      icon: React.ReactNode,
      actions: DraftAction[],
      sectionKey: string
    ) => (
      <div className="border-b border-gray-700/50 pb-4 last:border-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`
            flex items-center justify-between w-full text-left p-2 rounded
            hover:bg-gray-800 transition-colors
          `}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            <span className="text-sm text-gray-400">({actions.length})</span>
          </div>
          {expandedSections[sectionKey] ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>
        {expandedSections[sectionKey] && (
          <div className="mt-2 space-y-2">
            {actions.length > 0 ? (
              actions.map(renderActionCard)
            ) : (
              <p className="text-sm text-gray-400 text-center py-2">
                No {title.toLowerCase()} yet
              </p>
            )}
          </div>
        )}
      </div>
    );

    return (
      <Card 
        className={`
          border-${teamColor}-500/50 sticky top-4
          backdrop-blur-sm bg-gray-900/90
        `}
      >
        <Card.Header className="border-b border-gray-700/50">
          <div className={`flex items-center gap-2 text-${teamColor}-400`}>
            <Crown className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{teamName}</h3>
          </div>
          {teamNumber === config?.pickOrder[currentPickIndex] && (
            <div className={`
              mt-2 px-3 py-1.5 rounded-full text-sm
              bg-${teamColor}-500/10 text-${teamColor}-400
              border border-${teamColor}-500/20
              flex items-center justify-center
            `}>
              Current Turn
            </div>
          )}
        </Card.Header>

        <Card.Content className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
          {/* Picks Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Swords className="w-4 h-4 text-green-400" />
              <h4 className="font-medium text-green-400">Picks</h4>
            </div>
            {renderSection(
              'Civilizations',
              <Shield className="w-4 h-4" />,
              groupedActions.picks.civ,
              `${teamNumber}-picks-civ`
            )}
            {renderSection(
              'Leaders',
              <Crown className="w-4 h-4" />,
              groupedActions.picks.leader,
              `${teamNumber}-picks-leader`
            )}
          </div>

          {/* Bans Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 px-2">
              <Shield className="w-4 h-4 text-red-400" />
              <h4 className="font-medium text-red-400">Bans</h4>
            </div>
            {renderSection(
              'Civilizations',
              <Shield className="w-4 h-4" />,
              groupedActions.bans.civ,
              `${teamNumber}-bans-civ`
            )}
            {renderSection(
              'Leaders',
              <Crown className="w-4 h-4" />,
              groupedActions.bans.leader,
              `${teamNumber}-bans-leader`
            )}
            {draft.enable_souvenir_ban && renderSection(
              'Mementos',
              <Scroll className="w-4 h-4" />,
              groupedActions.bans.souvenir,
              `${teamNumber}-bans-souvenir`
            )}
          </div>
        </Card.Content>
      </Card>
    );
  };

  if (!config) {
    return <div>Invalid phase type</div>;
  }

  if ((phaseType === 'ban-souvenir-1' || phaseType === 'ban-souvenir-2') && !draft.enable_souvenir_ban) {
    onPhaseComplete();
    return null;
  }

  const allActions = [...allTeamActions.team1, ...allTeamActions.team2];

  const unavailableIds = allActions
      .filter(a => ['ban', 'pick'].includes(a.action_type))
      .map(a => a.choice_id)
      .concat(
          config.category === 'civ' ? draft.auto_ban_civilizations :
              config.category === 'leader' ? draft.auto_ban_leaders :
                  config.category === 'souvenir' ? draft.auto_ban_souvenirs :
                      []
      );

  const availableItems = config.data.filter(item => !unavailableIds.includes(item.id));

  const team1Actions = phaseActions.filter(action => action.team_number === 1);
  const team2Actions = phaseActions.filter(action => action.team_number === 2);

  return (
    <div className="flex gap-8">
      <div className="w-72 shrink-0">
        {renderTeamPanel(1)}
      </div>

      <div className="flex-1 min-w-0">
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{config.title}</h2>
              <div className={`flex items-center gap-2 text-lg font-mono ${timer <= 10 ? 'text-red-500' : 'text-gray-300'}`}>
                <Timer className="w-5 h-5" />
                {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">{phaseActions.length} / {config.pickOrder.length} actions</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ width: `${(phaseActions.length / config.pickOrder.length) * 100}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">{config.description}</p>
            </div>

            <div className={`mt-4 p-3 rounded-lg ${
              config.pickOrder[currentPickIndex] === 1 ? 'bg-team-blue-900/20 text-team-blue-400' : 'bg-team-red-900/20 text-team-red-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {config.pickOrder[currentPickIndex] === 1 ? draft.team1_name : draft.team2_name}'s Turn
                </span>
                {isCurrentTeamTurn && <span className="text-sm">Your Turn!</span>}
              </div>
            </div>
          </Card.Header>

          <Card.Content>
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Draft Configuration</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Team Mode:</span>
                  <span className="ml-2">{draft.team_mode}</span>
                </div>
                <div>
                  <span className="text-gray-400">Timer:</span>
                  <span className="ml-2">{draft.timer_seconds}s</span>
                </div>
                {draft.auto_ban_civilizations.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Auto-banned Civilizations:</span>
                    <span className="ml-2">{draft.auto_ban_civilizations.map(id => getItemDetails(id)?.name).join(' / ')}</span>
                  </div>
                )}
                {draft.auto_ban_leaders.length > 0 && (
                  <div className="col-span-2">
                    <span className="text-gray-400">Auto-banned Leaders:</span>
                    <span className="ml-2">{draft.auto_ban_leaders.map(id => getItemDetails(id)?.name).join(' / ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`
                    cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                    ${selectedItem === item.id ? 'border-blue-500 shadow-lg scale-105' : 'border-gray-700'}
                    ${!isCurrentTeamTurn ? 'opacity-50 cursor-not-allowed' : ''}
                    hover:border-gray-600
                  `}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-32 object-cover"
                  />
                  <div className="p-3 bg-gray-800">
                    <h3 className="font-medium text-gray-100">{item.name}</h3>
                    {item.description && (
                      <p className="text-sm text-gray-400 mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>

          <Card.Footer>
            <Button
              onClick={() => handleSubmit()}
              disabled={!selectedItem || !isCurrentTeamTurn || isSubmitting}
              isLoading={isSubmitting}
              className="w-full"
            >
              Confirm {config.type === 'ban' ? 'Ban' : 'Pick'}
            </Button>
          </Card.Footer>
        </Card>
      </div>

      <div className="w-72 shrink-0">
        {renderTeamPanel(2)}
      </div>
    </div>
  );
};

export default DraftPhase;
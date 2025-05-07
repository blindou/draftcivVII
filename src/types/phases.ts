export type PhaseType = 
  | 'ban-civ'
  | 'ban-leader'
  | 'ban-souvenir-1'
  | 'pick-civ'
  | 'pick-leader'
  | 'ban-souvenir-2';

export interface PhaseConfig {
  type: PhaseType;
  title: string;
  description: string;
  nextPhase: PhaseType | null;
  actionsPerTeam: number;
}

export const PHASE_CONFIGS: Record<PhaseType, PhaseConfig> = {
  'ban-civ': {
    type: 'ban-civ',
    title: 'Civilization Ban Phase',
    description: 'Each team bans civilizations they don\'t want the opponent to use',
    nextPhase: 'ban-leader',
    actionsPerTeam: 2
  },
  'ban-leader': {
    type: 'ban-leader',
    title: 'Leader Ban Phase',
    description: 'Each team bans leaders they don\'t want the opponent to use',
    nextPhase: 'ban-souvenir-1',
    actionsPerTeam: 1
  },
  'ban-souvenir-1': {
    type: 'ban-souvenir-1',
    title: 'First Souvenir Ban Phase',
    description: 'Teams ban souvenirs in the first round',
    nextPhase: 'pick-civ',
    actionsPerTeam: 1
  },
  'pick-civ': {
    type: 'pick-civ',
    title: 'Civilization Pick Phase',
    description: 'Teams pick their civilizations',
    nextPhase: 'pick-leader',
    actionsPerTeam: 2
  },
  'pick-leader': {
    type: 'pick-leader',
    title: 'Leader Pick Phase',
    description: 'Teams pick their leaders',
    nextPhase: 'ban-souvenir-2',
    actionsPerTeam: 1
  },
  'ban-souvenir-2': {
    type: 'ban-souvenir-2',
    title: 'Final Souvenir Ban Phase',
    description: 'Teams ban remaining souvenirs',
    nextPhase: null,
    actionsPerTeam: 1
  }
};
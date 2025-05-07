import type { Database } from '../types/supabase';

type Draft = Database['public']['Tables']['drafts']['Row'];
type PhaseType = 'ban-civ' | 'ban-leader' | 'ban-souvenir-1' | 'pick-civ' | 'pick-leader' | 'ban-souvenir-2';

export function getDraftPhaseFlow(draft: Draft): PhaseType[] {
  const phases: PhaseType[] = [];

  // Initial civilization bans (2 per team)
  phases.push('ban-civ', 'ban-civ', 'ban-civ', 'ban-civ');

  // Leader bans (2 per team)
  phases.push('ban-leader', 'ban-leader', 'ban-leader', 'ban-leader');

  // First souvenir ban phase if enabled (2 per team)
  if (draft.enable_souvenir_ban) {
    phases.push('ban-souvenir-1', 'ban-souvenir-1', 'ban-souvenir-1', 'ban-souvenir-1');
  }

  // Civilization picks (based on team mode)
  const civPicksPerTeam = {
    '2v2': 2,
    '3v3': 3,
    '4v4': 4
  }[draft.team_mode] || 2;

  // Add civilization picks (each team picks civPicksPerTeam times)
  for (let i = 0; i < civPicksPerTeam * 2; i++) {
    phases.push('pick-civ');
  }

  // Leader picks (same number as civilization picks)
  for (let i = 0; i < civPicksPerTeam * 2; i++) {
    phases.push('pick-leader');
  }

  // Final souvenir ban phase if enabled (2 per team)
  if (draft.enable_souvenir_ban) {
    phases.push('ban-souvenir-2', 'ban-souvenir-2', 'ban-souvenir-2', 'ban-souvenir-2');
  }

  return phases;
}

export function getNextPhase(currentPhase: PhaseType, draft: Draft): PhaseType | null {
  const phases = getDraftPhaseFlow(draft);
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex === -1 || currentIndex === phases.length - 1) {
    return null;
  }

  return phases[currentIndex + 1];
}

export function getPreviousPhase(currentPhase: PhaseType, draft: Draft): PhaseType | null {
  const phases = getDraftPhaseFlow(draft);
  const currentIndex = phases.indexOf(currentPhase);
  
  if (currentIndex <= 0) {
    return null;
  }

  return phases[currentIndex - 1];
}
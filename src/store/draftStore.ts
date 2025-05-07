import { create } from 'zustand';

type TeamSide = 'blue' | 'red';
type ActionType = 'pick' | 'ban';
type SessionStatus = 'waiting' | 'in_progress' | 'completed';

interface DraftAction {
  id: string;
  teamId: string;
  actionType: ActionType;
  entityId: string;
  order: number;
  createdAt: string;
}

interface Team {
  id: string;
  name: string;
  side: TeamSide;
}

interface DraftSession {
  id: string;
  name: string;
  status: SessionStatus;
  teams: Team[];
  actions: DraftAction[];
}

interface DraftState {
  currentSession: DraftSession | null;
  isLoading: boolean;
  error: string | null;
  setCurrentSession: (session: DraftSession | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useDraftStore = create<DraftState>((set) => ({
  currentSession: null,
  isLoading: false,
  error: null,
  setCurrentSession: (session) => set({ currentSession: session }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
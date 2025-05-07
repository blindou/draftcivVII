import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import DraftPhase from '../components/DraftPhase';
import type { Database } from '../types/supabase';
import { PHASE_CONFIGS, type PhaseType } from '../types/phases';

type Draft = Database['public']['Tables']['drafts']['Row'];

const DraftPhasePage: React.FC = () => {
  const { id, phaseType } = useParams<{ id: string; phaseType: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Determine team number from URL parameter
  const teamNumber = searchParams.get('team') === '2' ? 2 : 1;
  const teamParam = teamNumber === 2 ? '?team=2' : '';

  // Validate phase type
  if (!phaseType || !Object.keys(PHASE_CONFIGS).includes(phaseType)) {
    return <div className="text-red-500">Invalid phase type</div>;
  }

  const currentPhase = PHASE_CONFIGS[phaseType as PhaseType];

  useEffect(() => {
    const fetchDraft = async () => {
      try {
        if (!id) throw new Error('Draft ID is required');

        const { data, error: fetchError } = await supabase
          .from('drafts')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        setDraft(data);

        // Subscribe to real-time changes
        const subscription = supabase
          .channel(`draft_${id}`)
          .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'drafts',
            filter: `id=eq.${id}`,
          }, (payload) => {
            setDraft(payload.new as Draft);
          })
          .subscribe();

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load draft');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraft();
  }, [id]);

  const handlePhaseComplete = () => {
    const nextPhase = currentPhase.nextPhase;
    if (nextPhase) {
      navigate(`/draft/${id}/phase/${nextPhase}${teamParam}`);
    } else {
      navigate(`/summary/${id}${teamParam}`);
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
    <DraftPhase
      draftId={id!}
      teamNumber={teamNumber}
      timerSeconds={draft.timer_seconds}
      onPhaseComplete={handlePhaseComplete}
      draft={draft}
      phaseConfig={currentPhase}
    />
  );
};

export default DraftPhasePage;
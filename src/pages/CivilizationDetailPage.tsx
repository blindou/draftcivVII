import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import EntityDetailCard from '../components/stats/EntityDetailCard';
import PickBanChart from '../components/stats/PickBanChart';
import civData from '../data/civs.json';

interface CivilizationStats {
  totalAppearances: number;
  pickCount: number;
  banCount: number;
  picksByTeamMode: Record<string, number>;
  timelineData: {
    name: string;
    picks: number;
    bans: number;
  }[];
}

const CivilizationDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [stats, setStats] = useState<CivilizationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const civilization = civData.civilizations.find(c => c.id === id);

  useEffect(() => {
    const fetchStats = async () => {
      if (!id) return;

      try {
        const { data: actions, error: actionsError } = await supabase
          .from('draft_actions')
          .select('*, drafts!inner(*)')
          .eq('category', 'civ')
          .eq('choice_id', id);

        if (actionsError) throw actionsError;

        const picks = actions.filter(a => a.action_type === 'pick');
        const bans = actions.filter(a => a.action_type === 'ban');

        const picksByTeamMode = picks.reduce((acc: Record<string, number>, action) => {
          const mode = action.drafts.team_mode;
          acc[mode] = (acc[mode] || 0) + 1;
          return acc;
        }, {});

        // Group by month for timeline
        const timelineData = Array.from(new Set(actions.map(a => {
          const date = new Date(a.created_at);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }))).map(month => ({
          name: month,
          picks: picks.filter(a => a.created_at.startsWith(month)).length,
          bans: bans.filter(a => a.created_at.startsWith(month)).length,
        })).sort((a, b) => a.name.localeCompare(b.name));

        setStats({
          totalAppearances: actions.length,
          pickCount: picks.length,
          banCount: bans.length,
          picksByTeamMode,
          timelineData,
        });
      } catch (err) {
        console.error('Error fetching civilization stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !civilization || !stats) {
    return (
      <div className="text-center text-red-500">
        {error || 'Civilization not found'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <EntityDetailCard
        name={civilization.name}
        image={civilization.image}
        stats={[
          { label: 'Total Appearances', value: stats.totalAppearances },
          { label: 'Times Picked', value: stats.pickCount },
          { label: 'Times Banned', value: stats.banCount },
          { label: 'Pick Rate', value: `${((stats.pickCount / stats.totalAppearances) * 100).toFixed(1)}%` },
        ]}
      />

      <PickBanChart
        data={stats.timelineData}
        title="Pick/Ban Timeline"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-gray-800/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Picks by Team Mode</h3>
          <div className="space-y-4">
            {Object.entries(stats.picksByTeamMode).map(([mode, count]) => (
              <div key={mode} className="flex justify-between items-center">
                <span className="text-gray-400">{mode}</span>
                <span className="text-amber-500 font-medium">{count} picks</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivilizationDetailPage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import StatTable from '../components/stats/StatTable';
import type { ColumnDef } from '@tanstack/react-table';
import civData from '../data/civs.json';

interface CivilizationStats {
  id: string;
  name: string;
  image: string;
  pickCount: number;
  banCount: number;
  ratio: number;
}

const CivilizationsPage = () => {
  const [stats, setStats] = useState<CivilizationStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: actions, error: actionsError } = await supabase
          .from('draft_actions')
          .select('*')
          .eq('category', 'civ');

        if (actionsError) throw actionsError;

        const civilizationStats = civData.civilizations.map(civ => {
          const picks = actions?.filter(a => a.choice_id === civ.id && a.action_type === 'pick').length || 0;
          const bans = actions?.filter(a => a.choice_id === civ.id && a.action_type === 'ban').length || 0;
          const ratio = picks === 0 && bans === 0 ? 0 : picks / (picks + bans);

          return {
            id: civ.id,
            name: civ.name,
            image: civ.image,
            pickCount: picks,
            banCount: bans,
            ratio: Number(ratio.toFixed(2)),
          };
        });

        setStats(civilizationStats);
      } catch (err) {
        console.error('Error fetching civilization stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to load statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const columns: ColumnDef<CivilizationStats>[] = [
    {
      accessorKey: 'name',
      header: 'Civilization',
      cell: ({ row }) => (
        <Link
          to={`/stats/civilizations/${row.original.id}`}
          className="flex items-center gap-3 hover:text-amber-400 transition-colors"
        >
          <img
            src={row.original.image}
            alt={row.original.name}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span>{row.original.name}</span>
        </Link>
      ),
    },
    {
      accessorKey: 'pickCount',
      header: 'Times Picked',
    },
    {
      accessorKey: 'banCount',
      header: 'Times Banned',
    },
    {
      accessorKey: 'ratio',
      header: 'Pick/Ban Ratio',
      cell: ({ row }) => `${(row.original.ratio * 100).toFixed(1)}%`,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-amber-500 to-yellow-500 bg-clip-text text-transparent">
          Civilizations Statistics
        </span>
      </h1>
      <StatTable
        data={stats}
        columns={columns}
        title="Civilization Pick/Ban Statistics"
      />
    </div>
  );
};

export default CivilizationsPage;